import { NextResponse } from "next/server";
import { z } from "zod";
import { provider } from "@/lib/providers";
import { getDb, isDbConfigured, visits, calls, leads } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { log } from "@/lib/logger";
import { asRecord, asString } from "@/lib/api/payload";

const body = z.object({
  call_id: z.string().optional(),
  lead_id: z.string().optional(),
  listing_id: z.string().min(1),
  slot_iso: z.string().min(1),
  channel: z.enum(["in-person", "video"]).default("in-person"),
  notes: z.string().max(500).optional(),
});

/**
 * Tool: book_visit
 *
 * Called by the Bolna agent once the user has picked a listing and a slot.
 * Verifies the listing is real, then writes a visits row.
 *
 * If no lead_id is passed, we look up the call's most-recent associated lead
 * (from upsert-lead) so the agent doesn't have to thread the lead_id back
 * through the conversation.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "invalid_json", detail: String(err) }, { status: 400 });
  }

  const parsed = body.safeParse(coerceBookingPayload(raw));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const listing = await provider.getById(parsed.data.listing_id);
  if (!listing) {
    return NextResponse.json(
      { ok: false, error: "listing_not_found", listing_id: parsed.data.listing_id },
      { status: 404 },
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "database_not_configured" },
      { status: 503 },
    );
  }

  const db = getDb();
  const leadId = await resolveLeadId(db, parsed.data.lead_id, parsed.data.call_id);
  const scheduledFor = parseSlot(parsed.data.slot_iso);

  if (!scheduledFor) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_slot",
        hint: "Pass an ISO datetime like 2026-04-27T18:30:00+05:30.",
      },
      { status: 400 },
    );
  }

  const finalLeadId = leadId ?? (await createFallbackLead(db, parsed.data.call_id));

  if (!finalLeadId) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_lead_context",
        hint: "Call /api/agent/upsert-lead first or pass lead_id explicitly.",
      },
      { status: 400 },
    );
  }

  const [inserted] = await db
    .insert(visits)
    .values({
      leadId: finalLeadId,
      listingId: listing.id,
      scheduledFor,
      channel: parsed.data.channel,
      notes: parsed.data.notes ?? null,
      status: "scheduled",
    })
    .returning();

  log.info("agent.book_visit", {
    call_id: parsed.data.call_id,
    lead_id: finalLeadId,
    listing_id: listing.id,
    slot_iso: scheduledFor.toISOString(),
    visit_id: inserted?.id,
  });

  return NextResponse.json({
    ok: true,
    visit_id: inserted?.id,
    confirmed_slot_iso: toIndiaIso(scheduledFor),
    listing: {
      id: listing.id,
      title: listing.title,
      area: listing.area,
      bhk: listing.bhk,
    },
  });
}

function coerceBookingPayload(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r) return raw;
  return {
    call_id: asString(r.call_id),
    lead_id: asString(r.lead_id),
    listing_id: asString(r.listing_id),
    slot_iso: asString(r.slot_iso ?? r.slot ?? r.visit_time ?? r.time),
    channel: asString(r.channel) ?? "in-person",
    notes: asString(r.notes),
  };
}

async function resolveLeadId(
  db: ReturnType<typeof getDb>,
  leadId?: string,
  callId?: string,
): Promise<string | null> {
  if (leadId && !leadId.includes("%(")) {
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });
    if (lead) return lead.id;
  }

  if (callId && !callId.includes("%(")) {
    const call = await db.query.calls.findFirst({
      where: eq(calls.bolnaCallId, callId),
    });
    if (call) {
      const matchingLead = await db.query.leads.findFirst({
        where: eq(leads.callId, call.id),
      });
      if (matchingLead) return matchingLead.id;
    }
  }

  const latestLead = await db.query.leads.findFirst({
    orderBy: [desc(leads.updatedAt)],
  });
  return latestLead?.id ?? null;
}

async function createFallbackLead(db: ReturnType<typeof getDb>, callId?: string): Promise<string | null> {
  const [inserted] = await db
    .insert(leads)
    .values({
      notes: callId ? `Created during booking for call ${callId}` : "Created during booking fallback.",
    })
    .returning();
  return inserted?.id ?? null;
}

function parseSlot(value: string): Date | null {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const lower = value.toLowerCase();
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const base = new Date(now);

  if (lower.includes("tomorrow")) {
    base.setDate(base.getDate() + 1);
  } else {
    const mayMatch = lower.match(/\bmay\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
    const reverseMayMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+may\b/);
    const day = mayMatch?.[1] ?? reverseMayMatch?.[1];
    if (day) {
      base.setMonth(4);
      base.setDate(Number(day));
    }
  }

  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  let hour = lower.includes("evening") ? 18 : lower.includes("morning") ? 9 : 10;
  let minute = lower.includes("evening") ? 30 : lower.includes("morning") ? 30 : 0;
  if (timeMatch) {
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2] ?? "0");
    if (timeMatch[3] === "pm" && hour < 12) hour += 12;
    if (timeMatch[3] === "am" && hour === 12) hour = 0;
  }

  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const parsed = new Date(`${year}-${month}-${day}T${hh}:${mm}:00+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIndiaIso(date: Date): string {
  const local = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  const hour = String(local.getHours()).padStart(2, "0");
  const minute = String(local.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
}
