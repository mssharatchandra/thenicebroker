import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured, leads, shortlists } from "@/lib/db";
import { provider } from "@/lib/providers";
import { compareListings } from "@/lib/compare/engine";
import { log } from "@/lib/logger";

const body = z.object({
  call_id: z.string().optional(),
  lead_id: z.string(),
  listing_ids: z.array(z.string().min(1)).min(1).max(5),
  channel: z.enum(["sms", "whatsapp", "email"]).default("sms"),
});

/**
 * Tool: send_summary
 *
 * Called at the end of a call to send the user a written record of what they
 * looked at. For the assignment we *log and persist* the intent — wiring
 * Twilio / MSG91 / Resend is a 30-min addition behind a single function.
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

  const listings = await provider.getMany(parsed.data.listing_ids);
  if (listings.length === 0) {
    return NextResponse.json(
      { ok: false, error: "no_listings_found" },
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
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, parsed.data.lead_id),
  });
  if (!lead) {
    return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });
  }

  // Persist the shortlist: rank = order in the request.
  const comparison = listings.length >= 2 ? compareListings(listings) : null;
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i]!;
    await db.insert(shortlists).values({
      leadId: lead.id,
      listingId: listing.id,
      rank: i + 1,
      score: 0,
      rationale: comparison ? comparison.summary : listing.highlights.join("; "),
    });
  }

  // Compose and "send" the message. For the assignment this is logged.
  const message = composeSummaryMessage(listings, comparison?.summary);
  log.info("agent.send_summary", {
    call_id: parsed.data.call_id,
    lead_id: lead.id,
    channel: parsed.data.channel,
    contact: lead.phone ?? lead.email,
    message_preview: message.slice(0, 120),
  });

  return NextResponse.json({
    ok: true,
    sent: true,
    channel: parsed.data.channel,
    listings_count: listings.length,
    preview: message,
  });
}

function composeSummaryMessage(listings: Awaited<ReturnType<typeof provider.getMany>>, summary?: string): string {
  const lines = [
    "Hi from TheNiceBroker — here's the comparison from our call:",
    "",
    ...listings.map(
      (l, i) =>
        `${i + 1}. ${l.bhk}BHK in ${l.area} (${l.locality}) — ₹${l.rentInr.toLocaleString("en-IN")}/mo, ${l.furnishing}`,
    ),
  ];
  if (summary) lines.push("", summary);
  lines.push("", "Reply to this number if you want to book a visit. — TheNiceBroker");
  return lines.join("\n");
}
