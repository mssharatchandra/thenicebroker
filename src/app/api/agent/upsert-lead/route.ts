import { NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { calls, getDb, isDbConfigured, leads } from "@/lib/db";
import { log } from "@/lib/logger";
import { asBoolean, asNumber, asRecord, asString, parseNumberArray, parseStringArray } from "@/lib/api/payload";

const body = z.object({
  call_id: z.string().optional(),
  lead: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    preferred_areas: z.array(z.string()).optional(),
    bhk: z.array(z.number().int().min(1).max(5)).optional(),
    budget_min_inr: z.number().int().nonnegative().optional(),
    budget_max_inr: z.number().int().nonnegative().optional(),
    move_in_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    occupants: z.enum(["family", "bachelor", "couple", "flatmates"]).optional(),
    veg_only: z.boolean().optional(),
    pet_friendly: z.boolean().optional(),
    parking_needed: z.enum(["bike", "car", "either", "none"]).optional(),
    furnishing_preference: z.array(z.string()).optional(),
    work_from_home: z.boolean().optional(),
    preferred_language: z.enum(["en", "hi", "kn"]).optional(),
    qual_score: z.number().int().min(0).max(100).optional(),
    intent: z.enum(["just-browsing", "actively-looking", "urgent"]).optional(),
    notes: z.string().max(2000).optional(),
  }),
});

/**
 * Tool: upsert_lead
 *
 * Called by the agent whenever it learns a new fact about the caller. The
 * agent doesn't need to send the whole profile each time — only the fields
 * it newly extracted. We merge against any existing lead for this call.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "invalid_json", detail: String(err) }, { status: 400 });
  }

  const parsed = body.safeParse(coerceLeadPayload(raw));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "database_not_configured" },
      { status: 503 },
    );
  }

  const db = getDb();
  const lead = parsed.data.lead;

  // Resolve internal call.id from the Bolna-provided call_id, if available.
  let internalCallId: string | null = null;
  if (parsed.data.call_id) {
    const call = await db.query.calls.findFirst({
      where: eq(calls.bolnaCallId, parsed.data.call_id),
    });
    internalCallId = call?.id ?? null;
  }

  const existing = await findExistingLead({
    db,
    internalCallId,
    phone: lead.phone,
    email: lead.email,
  });

  const patch = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    preferredAreas: lead.preferred_areas,
    bhk: lead.bhk,
    budgetMinInr: lead.budget_min_inr,
    budgetMaxInr: lead.budget_max_inr,
    moveInBy: lead.move_in_by,
    occupants: lead.occupants,
    vegOnly: lead.veg_only,
    petFriendly: lead.pet_friendly,
    parkingNeeded: lead.parking_needed,
    furnishingPreference: lead.furnishing_preference,
    workFromHome: lead.work_from_home,
    preferredLanguage: lead.preferred_language,
    qualScore: lead.qual_score,
    intent: lead.intent,
    notes: lead.notes,
    updatedAt: new Date(),
  };

  // Drop undefined keys so we don't clobber existing values with nulls.
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );

  if (existing) {
    await db.update(leads).set(cleanPatch).where(eq(leads.id, existing.id));
    log.info("agent.upsert_lead: merged", { call_id: parsed.data.call_id, lead_id: existing.id });
    return NextResponse.json({ ok: true, lead_id: existing.id, action: "merged" });
  }

  const [inserted] = await db
    .insert(leads)
    .values({
      callId: internalCallId,
      ...cleanPatch,
    } as typeof leads.$inferInsert)
    .returning();

  log.info("agent.upsert_lead: created", { call_id: parsed.data.call_id, lead_id: inserted?.id });
  return NextResponse.json({ ok: true, lead_id: inserted?.id, action: "created" });
}

async function findExistingLead({
  db,
  internalCallId,
  phone,
  email,
}: {
  db: ReturnType<typeof getDb>;
  internalCallId: string | null;
  phone?: string;
  email?: string;
}) {
  if (internalCallId) {
    const byCall = await db.query.leads.findFirst({ where: eq(leads.callId, internalCallId) });
    if (byCall) return byCall;
  }

  if (phone) {
    const byPhone = await db.query.leads.findFirst({ where: eq(leads.phone, phone) });
    if (byPhone) return byPhone;
  }

  if (email) {
    const byEmail = await db.query.leads.findFirst({ where: eq(leads.email, email) });
    if (byEmail) return byEmail;
  }

  // Bolna chat tests often emit profile updates before a call webhook exists.
  // Merge those updates into the latest anonymous row instead of creating a
  // new "Unknown caller" on every tool call.
  const recent = await db.query.leads.findMany({
    orderBy: [desc(leads.updatedAt)],
    limit: 8,
  });
  const cutoff = Date.now() - 60 * 60 * 1000;
  return (
    recent.find((lead) => {
      const recentEnough = lead.updatedAt.getTime() >= cutoff;
      const anonymous = !lead.phone && !lead.email;
      return recentEnough && anonymous;
    }) ?? null
  );
}

function coerceLeadPayload(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r || "lead" in r) return raw;
  return {
    call_id: asString(r.call_id),
    lead: {
      name: asString(r.name),
      phone: asString(r.phone),
      email: asString(r.email),
      preferred_areas: parseStringArray(r.preferred_areas ?? r.areas),
      bhk: parseNumberArray(r.bhk),
      budget_min_inr: asNumber(r.budget_min_inr),
      budget_max_inr: asNumber(r.budget_max_inr),
      move_in_by: asString(r.move_in_by),
      occupants: asString(r.occupants),
      veg_only: asBoolean(r.veg_only),
      pet_friendly: asBoolean(r.pet_friendly),
      parking_needed: asString(r.parking_needed),
      furnishing_preference: parseStringArray(r.furnishing_preference ?? r.furnishing),
      work_from_home: asBoolean(r.work_from_home),
      preferred_language: asString(r.preferred_language),
      qual_score: asNumber(r.qual_score),
      intent: asString(r.intent),
      notes: asString(r.notes),
    },
  };
}
