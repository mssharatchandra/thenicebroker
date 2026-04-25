import { NextResponse } from "next/server";
import { z } from "zod";
import { compareListings } from "@/lib/compare/engine";
import { provider } from "@/lib/providers";
import { log } from "@/lib/logger";

const body = z.object({
  call_id: z.string().optional(),
  listing_ids: z.array(z.string().min(1)).min(2).max(5),
});

/**
 * Tool: compare_listings
 *
 * Called by the Bolna agent after surfacing 2-3 search results. Returns
 * per-axis breakdowns plus a verbal-friendly summary the LLM reads aloud.
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
  if (listings.length < 2) {
    return NextResponse.json(
      {
        ok: false,
        error: "insufficient_listings_found",
        found: listings.length,
        requested: parsed.data.listing_ids.length,
      },
      { status: 404 },
    );
  }

  log.info("agent.compare invoked", {
    call_id: parsed.data.call_id,
    listing_ids: parsed.data.listing_ids,
  });

  const comparison = compareListings(listings);

  return NextResponse.json({
    ok: true,
    summary: comparison.summary,
    listings: comparison.listings.map((l) => ({
      id: l.id,
      title: l.title,
      area: l.area,
      bhk: l.bhk,
      rent_inr: l.rentInr,
    })),
    axes: comparison.axes.map((a) => ({
      key: a.key,
      label: a.label,
      direction: a.direction,
      values: a.values.map((v) => ({
        listing_id: v.listingId,
        display: v.display,
        verdict: v.verdict,
      })),
    })),
  });
}
