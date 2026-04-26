/**
 * Domain types for rental inventory.
 *
 * The InventoryProvider interface is the seam between "where the data lives"
 * and "everything else." The mock provider ships realistic Bangalore
 * listings; production providers (NoBroker partnership, Housing.com API,
 * a community-pinned dataset like bengaluru.rent) plug in here without
 * touching the comparison engine, the agent, or the UI.
 */

export type Area =
  | "HSR Layout"
  | "Whitefield"
  | "Indiranagar"
  | "Koramangala"
  | "BTM Layout"
  | "JP Nagar"
  | "Marathahalli"
  | "Electronic City"
  | "KR Puram"
  | "Old Madras Road"
  | "Bellandur"
  | "Sarjapur Road";

export type Furnishing = "unfurnished" | "semi" | "fully";
export type Parking = "none" | "bike" | "car" | "both";
export type ContactType = "owner" | "broker";
export type Occupants = "family" | "bachelor" | "couple" | "flatmates";

export type Amenity =
  | "gym"
  | "pool"
  | "powerBackup"
  | "security"
  | "clubhouse"
  | "playArea"
  | "joggingTrack"
  | "indoorGames";

export interface Coords {
  lat: number;
  lng: number;
}

/**
 * A single rental unit. The shape is intentionally flat and JSON-friendly so
 * the same record round-trips through the agent, the API, and the dashboard.
 */
export interface Listing {
  id: string;
  title: string;
  area: Area;
  locality: string;
  bhk: 1 | 2 | 3 | 4 | 5;
  carpetAreaSqft: number;
  rentInr: number;
  depositMonths: number;
  maintenanceIncluded: boolean;
  maintenanceInr: number | null;
  furnishing: Furnishing;
  parking: Parking;
  floor: number;
  totalFloors: number;
  hasLift: boolean;
  ageYears: number;
  amenities: Amenity[];
  petFriendly: boolean;
  vegOnly: boolean;
  bachelorAllowed: boolean;
  familyPreferred: boolean;
  availableFromIso: string;
  agreementMonths: number;
  noticeMonths: number;
  nearestMetroKm: number | null;
  nearestTechParkKm: number | null;
  nearestTechParkName: string | null;
  coords: Coords;
  contactType: ContactType;
  /**
   * Deterministic demo visit slots. A real provider would expose owner/field
   * team calendar availability through the same shape.
   */
  availableVisitSlotsIso?: string[];
  description: string;
  /** 2-3 things genuinely worth highlighting. */
  highlights: string[];
  /** 1-2 honest negatives. The agent reads these out — this is the trust angle baked into the data. */
  caveats: string[];
}

export interface SearchFilters {
  areas?: Area[];
  bhk?: number[];
  budgetMin?: number;
  budgetMax?: number;
  furnishing?: Furnishing[];
  parkingNeeded?: "bike" | "car" | "either" | "none";
  petFriendly?: boolean;
  vegOnly?: boolean;
  occupants?: Occupants;
  /** ISO date the user wants to move in by; listings with later availability get filtered out. */
  moveInBy?: string;
  minCarpetSqft?: number;
  amenities?: Amenity[];
  proximityTo?: { lat: number; lng: number; maxKm?: number; label?: string };
  /** Default: 5. The agent should rarely need more than 3-5 in a single voice turn. */
  limit?: number;
}

export interface ScoredListing {
  listing: Listing;
  /** 0-100. Soft score across price fit, area match, furnishing, age, amenities, proximity. */
  score: number;
  /** Human-readable reasons that contributed to the score, ordered by weight. */
  reasons: string[];
  /** Soft non-matches the agent should mention out loud (honest tradeoffs). */
  flags: string[];
}

export interface InventoryProvider {
  listAll(): Promise<Listing[]>;
  search(filters: SearchFilters): Promise<ScoredListing[]>;
  getById(id: string): Promise<Listing | null>;
  getMany(ids: string[]): Promise<Listing[]>;
  /** Total count, used for empty-state copy in the UI. */
  count(): Promise<number>;
}
