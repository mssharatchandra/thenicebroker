import { NextResponse } from "next/server";
import { z } from "zod";
import { provider } from "@/lib/providers";
import type { Amenity, Area, Furnishing } from "@/lib/providers/types";
import { log } from "@/lib/logger";
import { asBoolean, asNumber, asRecord, asString, parseNumberArray, parseStringArray } from "@/lib/api/payload";

const areas: [Area, ...Area[]] = [
  "HSR Layout",
  "Whitefield",
  "Indiranagar",
  "Koramangala",
  "BTM Layout",
  "JP Nagar",
  "Marathahalli",
  "Electronic City",
  "KR Puram",
  "Old Madras Road",
  "Bellandur",
  "Sarjapur Road",
];

const furnishingValues: [Furnishing, ...Furnishing[]] = ["unfurnished", "semi", "fully"];

const amenityValues: [Amenity, ...Amenity[]] = [
  "gym",
  "pool",
  "powerBackup",
  "security",
  "clubhouse",
  "playArea",
  "joggingTrack",
  "indoorGames",
];

const LOCALITY_TO_AREA: Record<string, Area> = {
  "aecs layout": "Marathahalli",
  munnekollal: "Marathahalli",
  brookefield: "Whitefield",
  kadugodi: "Whitefield",
  "hsr sector 1": "HSR Layout",
  "hsr sector 4": "HSR Layout",
  "kr puram lake road": "KR Puram",
  "bennigana halli": "Old Madras Road",
  "bellandur gate": "Bellandur",
  "green glen layout": "Bellandur",
  doddakannelli: "Sarjapur Road",
  kaikondrahalli: "Sarjapur Road",
  "koramangala 6th block": "Koramangala",
  "btm 2nd stage": "BTM Layout",
  "jp nagar 6th phase": "JP Nagar",
  "hal 2nd stage": "Indiranagar",
  "neeladri road": "Electronic City",
};

function normalizeAreas(input: unknown): Area[] | undefined {
  const raw = parseStringArray(input);
  if (!raw) return undefined;
  const validAreas = new Set<Area>(areas);
  const out: Area[] = [];
  for (const candidate of raw) {
    if (validAreas.has(candidate as Area)) {
      out.push(candidate as Area);
      continue;
    }
    const mapped = LOCALITY_TO_AREA[candidate.toLowerCase().trim()];
    if (mapped) out.push(mapped);
  }
  return out.length > 0 ? Array.from(new Set(out)) : undefined;
}

const searchBody = z.object({
  call_id: z.string().optional(),
  filters: z.object({
    areas: z.array(z.enum(areas)).optional(),
    bhk: z.array(z.number().int().min(1).max(5)).optional(),
    budget_min_inr: z.number().int().nonnegative().optional(),
    budget_max_inr: z.number().int().nonnegative().optional(),
    furnishing: z.array(z.enum(furnishingValues)).optional(),
    parking_needed: z.enum(["bike", "car", "either", "none"]).optional(),
    pet_friendly: z.boolean().optional(),
    veg_only: z.boolean().optional(),
    occupants: z.enum(["family", "bachelor", "couple", "flatmates"]).optional(),
    move_in_by: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    min_carpet_sqft: z.number().int().positive().optional(),
    amenities: z.array(z.enum(amenityValues)).optional(),
    proximity_to: z
      .object({
        lat: z.number(),
        lng: z.number(),
        max_km: z.number().positive().optional(),
        label: z.string().optional(),
      })
      .optional(),
    limit: z.number().int().min(1).max(10).optional(),
  }),
});

/**
 * Tool: search_inventory
 *
 * Called by the Bolna agent mid-call. Returns the top N scored listings as
 * a compact JSON the LLM can summarize verbally.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ ok: false, error: "invalid_json", detail: String(err) }, { status: 400 });
  }

  const parsed = searchBody.safeParse(coerceSearchPayload(body));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_filters", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const f = parsed.data.filters;
  log.info("agent.search invoked", { call_id: parsed.data.call_id, filters: f });

  const results = await provider.search({
    areas: f.areas,
    bhk: f.bhk,
    budgetMin: f.budget_min_inr,
    budgetMax: f.budget_max_inr,
    furnishing: f.furnishing,
    parkingNeeded: f.parking_needed,
    petFriendly: f.pet_friendly,
    vegOnly: f.veg_only,
    occupants: f.occupants,
    moveInBy: f.move_in_by,
    minCarpetSqft: f.min_carpet_sqft,
    amenities: f.amenities,
    proximityTo: f.proximity_to
      ? {
          lat: f.proximity_to.lat,
          lng: f.proximity_to.lng,
          maxKm: f.proximity_to.max_km,
          label: f.proximity_to.label,
        }
      : undefined,
    limit: f.limit,
  });

  // Compact, voice-friendly shape — listing details + reasons + flags.
  const compact = results.map((r) => ({
    id: r.listing.id,
    title: r.listing.title,
    area: r.listing.area,
    locality: r.listing.locality,
    bhk: r.listing.bhk,
    rent_inr: r.listing.rentInr,
    maintenance_inr: r.listing.maintenanceInr,
    deposit_months: r.listing.depositMonths,
    furnishing: r.listing.furnishing,
    parking: r.listing.parking,
    carpet_sqft: r.listing.carpetAreaSqft,
    age_years: r.listing.ageYears,
    available_from: r.listing.availableFromIso,
    available_visit_slots: r.listing.availableVisitSlotsIso?.slice(0, 3) ?? [],
    score: r.score,
    why_it_fits: r.reasons,
    honest_tradeoffs: r.flags,
    highlights: r.listing.highlights,
    caveats: r.listing.caveats,
  }));

  return NextResponse.json({
    ok: true,
    count: compact.length,
    listings: compact,
  });
}

function coerceSearchPayload(raw: unknown): unknown {
  const r = asRecord(raw);
  if (!r) return raw;
  if ("filters" in r) {
    const filters = asRecord(r.filters);
    if (filters && "areas" in filters) {
      return { ...r, filters: { ...filters, areas: normalizeAreas(filters.areas) } };
    }
    return raw;
  }
  return {
    call_id: asString(r.call_id),
    filters: {
      areas: normalizeAreas(r.areas ?? r.area ?? r.locality ?? r.localities),
      bhk: parseNumberArray(r.bhk),
      budget_min_inr: asNumber(r.budget_min_inr),
      budget_max_inr: asNumber(r.budget_max_inr),
      furnishing: parseStringArray(r.furnishing),
      parking_needed: asString(r.parking_needed),
      pet_friendly: asBoolean(r.pet_friendly),
      veg_only: asBoolean(r.veg_only),
      occupants: asString(r.occupants),
      move_in_by: asString(r.move_in_by),
      min_carpet_sqft: asNumber(r.min_carpet_sqft),
      amenities: parseStringArray(r.amenities),
      limit: asNumber(r.limit),
    },
  };
}
