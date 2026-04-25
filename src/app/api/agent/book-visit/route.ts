import { NextResponse } from "next/server";
import { z } from "zod";
import { provider } from "@/lib/providers";
import { getDb, isDbConfigured, visits, calls, leads } from "@/lib/db";
import { eq } from "drizzle-orm";
import { log } from "@/lib/logger";

const body = z.object({
  call_id: z.string().optional(),
  lead_id: z.string().optional(),
  listing_id: z.string().min(1),
  slot_iso: z.string().datetime(),
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

  const parsed = body.safeParse(raw);
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
  let leadId = parsed.data.lead_id;

  // Fall back: most-recent lead for this call.
  if (!leadId && parsed.data.call_id) {
    const call = await db.query.calls.findFirst({
      where: eq(calls.bolnaCallId, parsed.data.call_id),
    });
    if (call) {
      const matchingLead = await db.query.leads.findFirst({
        where: eq(leads.callId, call.id),
      });
      leadId = matchingLead?.id;
    }
  }

  if (!leadId) {
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
      leadId,
      listingId: listing.id,
      scheduledFor: new Date(parsed.data.slot_iso),
      channel: parsed.data.channel,
      notes: parsed.data.notes ?? null,
      status: "scheduled",
    })
    .returning();

  log.info("agent.book_visit", {
    call_id: parsed.data.call_id,
    lead_id: leadId,
    listing_id: listing.id,
    slot_iso: parsed.data.slot_iso,
    visit_id: inserted?.id,
  });

  return NextResponse.json({
    ok: true,
    visit_id: inserted?.id,
    confirmed_slot_iso: parsed.data.slot_iso,
    listing: {
      id: listing.id,
      title: listing.title,
      area: listing.area,
      bhk: listing.bhk,
    },
  });
}
