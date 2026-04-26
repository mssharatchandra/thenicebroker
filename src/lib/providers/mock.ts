import { EXPANDED_BANGALORE_LISTINGS } from "../data/expanded-bangalore-listings";
import type {
  Amenity,
  InventoryProvider,
  Listing,
  ScoredListing,
  SearchFilters,
} from "./types";

/**
 * In-memory provider over a static list of Bangalore mock listings.
 *
 * Hard filters (drop the listing): area, BHK, budget ceiling, parking,
 * pet/veg/bachelor compatibility, move-in date.
 *
 * Soft scoring (0-100, weighted): price-fit, furnishing match, carpet area,
 * building age, amenities overlap, floor/lift sanity, proximity, parking
 * match, maintenance-included bonus.
 *
 * The reasons + flags lists are what the agent reads aloud during
 * comparison — keep them short and honest.
 */
export class MockInventoryProvider implements InventoryProvider {
  private readonly listings: readonly Listing[];

  constructor(listings: readonly Listing[] = EXPANDED_BANGALORE_LISTINGS) {
    this.listings = listings;
  }

  async listAll(): Promise<Listing[]> {
    return [...this.listings].sort((a, b) => listingFreshness(b) - listingFreshness(a));
  }

  async count(): Promise<number> {
    return this.listings.length;
  }

  async getById(id: string): Promise<Listing | null> {
    return this.listings.find((l) => l.id === id) ?? null;
  }

  async getMany(ids: string[]): Promise<Listing[]> {
    const set = new Set(ids);
    return this.listings.filter((l) => set.has(l.id));
  }

  async search(filters: SearchFilters): Promise<ScoredListing[]> {
    const limit = Math.max(1, Math.min(filters.limit ?? 5, 25));
    const scored: ScoredListing[] = [];

    for (const listing of this.listings) {
      if (!passesHardFilters(listing, filters)) continue;
      const result = scoreListing(listing, filters);
      scored.push(result);
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}

function listingFreshness(listing: Listing): number {
  const numericId = Number.parseInt(listing.id.replace(/\D/g, ""), 10);
  return Number.isFinite(numericId) ? numericId : 0;
}

function passesHardFilters(listing: Listing, f: SearchFilters): boolean {
  if (f.areas && f.areas.length > 0 && !f.areas.includes(listing.area)) return false;
  if (f.bhk && f.bhk.length > 0 && !f.bhk.includes(listing.bhk)) return false;

  const totalMonthly = listing.rentInr + (listing.maintenanceInr ?? 0);
  if (f.budgetMax !== undefined && totalMonthly > f.budgetMax * 1.05) return false;
  if (f.budgetMin !== undefined && totalMonthly < f.budgetMin * 0.85) return false;

  if (f.petFriendly === true && !listing.petFriendly) return false;
  if (f.vegOnly === false && listing.vegOnly) return false;

  if (f.parkingNeeded === "car" && listing.parking !== "car" && listing.parking !== "both") return false;
  if (f.parkingNeeded === "bike" && listing.parking === "none") return false;

  if (f.occupants === "bachelor" || f.occupants === "flatmates") {
    if (!listing.bachelorAllowed) return false;
  }
  if (f.occupants === "family" && !listing.familyPreferred) {
    // not a hard fail but heavily down-weighted later
  }

  // moveInBy is intentionally NOT a hard filter — the agent often passes the
  // first of the month (e.g. "2026-05-01") which would drop most listings
  // that become available mid-month. We score it softly below instead.

  if (f.minCarpetSqft && listing.carpetAreaSqft < f.minCarpetSqft) return false;

  return true;
}

function scoreListing(listing: Listing, f: SearchFilters): ScoredListing {
  const reasons: string[] = [];
  const flags: string[] = [];
  let score = 0;

  // Price fit (25): centered within budget = full points
  if (f.budgetMin !== undefined && f.budgetMax !== undefined) {
    const total = listing.rentInr + (listing.maintenanceInr ?? 0);
    const mid = (f.budgetMin + f.budgetMax) / 2;
    const half = Math.max(1, (f.budgetMax - f.budgetMin) / 2);
    const dist = Math.abs(total - mid) / half;
    const pricePts = Math.max(0, 25 - dist * 12);
    score += pricePts;
    if (total <= f.budgetMax) reasons.push(`fits your ₹${f.budgetMin}-${f.budgetMax} budget`);
    if (total > f.budgetMax) flags.push(`a bit above your stated budget`);
  } else {
    score += 12;
  }

  // Furnishing (12)
  if (f.furnishing && f.furnishing.length > 0) {
    if (f.furnishing.includes(listing.furnishing)) {
      score += 12;
      reasons.push(`${listing.furnishing} as you wanted`);
    } else if (
      (f.furnishing.includes("fully") && listing.furnishing === "semi") ||
      (f.furnishing.includes("semi") && listing.furnishing === "fully")
    ) {
      score += 7;
      flags.push(`${listing.furnishing}, not exactly ${f.furnishing.join("/")}`);
    } else {
      score += 2;
      flags.push(`furnishing is ${listing.furnishing}`);
    }
  } else {
    score += 6;
  }

  // Carpet area (8)
  if (f.minCarpetSqft) {
    const ratio = listing.carpetAreaSqft / f.minCarpetSqft;
    score += Math.min(8, ratio * 6);
    if (ratio >= 1.15) reasons.push(`spacious — ${listing.carpetAreaSqft} sqft`);
  } else {
    score += 4;
  }

  // Building age (10)
  if (listing.ageYears <= 5) {
    score += 10;
    reasons.push(`newer building (${listing.ageYears} yrs)`);
  } else if (listing.ageYears <= 12) {
    score += 7;
  } else {
    score += 3;
    flags.push(`older building (${listing.ageYears} yrs)`);
  }

  // Amenities overlap (12)
  if (f.amenities && f.amenities.length > 0) {
    const overlap = f.amenities.filter((a) => listing.amenities.includes(a));
    const ratio = overlap.length / f.amenities.length;
    score += ratio * 12;
    const missing = f.amenities.filter((a) => !listing.amenities.includes(a));
    if (overlap.length > 0) reasons.push(`has ${overlap.join(", ")}`);
    if (missing.length > 0) flags.push(`missing ${missing.join(", ")}`);
  } else {
    score += listing.amenities.length >= 3 ? 8 : 4;
  }

  // Floor / lift sanity (8)
  if (listing.floor >= 3 && !listing.hasLift) {
    score += 1;
    flags.push(`${listing.floor}rd floor with no lift`);
  } else if (listing.hasLift) {
    score += 8;
  } else {
    score += 5;
  }

  // Proximity (15)
  if (f.proximityTo) {
    const km = haversineKm(f.proximityTo, listing.coords);
    const maxKm = f.proximityTo.maxKm ?? 5;
    const proximity = Math.max(0, 1 - km / maxKm);
    score += proximity * 15;
    if (km <= 1.5) reasons.push(`only ${km.toFixed(1)} km from ${f.proximityTo.label ?? "your reference point"}`);
    if (km > maxKm) flags.push(`${km.toFixed(1)} km from ${f.proximityTo.label ?? "your reference point"}`);
  } else {
    score += 7;
  }

  // Parking match (5)
  if (f.parkingNeeded === "car" && (listing.parking === "car" || listing.parking === "both")) {
    score += 5;
  } else if (f.parkingNeeded === "bike" && listing.parking !== "none") {
    score += 5;
  } else if (f.parkingNeeded === "either" && listing.parking !== "none") {
    score += 5;
  } else if (!f.parkingNeeded) {
    score += 3;
  }

  // Maintenance included bonus (5)
  if (listing.maintenanceIncluded) {
    score += 5;
    reasons.push(`maintenance included`);
  }

  // Soft penalty for bachelor-disallowed when occupants is bachelor
  if (f.occupants === "bachelor" && !listing.bachelorAllowed) {
    score -= 20;
    flags.push(`owner prefers families`);
  }

  // Soft handling for move-in date — small penalty if available after the
  // requested date, larger penalty the further out. Never drop the listing.
  if (f.moveInBy && listing.availableFromIso > f.moveInBy) {
    const days = Math.max(
      0,
      Math.round(
        (new Date(listing.availableFromIso).getTime() - new Date(f.moveInBy).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    if (days > 0) {
      score -= Math.min(15, Math.ceil(days / 2));
      flags.push(`available from ${listing.availableFromIso} (after your ${f.moveInBy} target)`);
    }
  }

  return {
    listing,
    score: Math.round(Math.max(0, Math.min(100, score))),
    reasons,
    flags,
  };
}

/** Distance between two lat/lng points in kilometers. */
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Convenience for tests / API routes that don't want to instantiate. */
export const mockProvider = new MockInventoryProvider();

/** Re-export for downstream consumers that don't want to import types. */
export type { Amenity };
