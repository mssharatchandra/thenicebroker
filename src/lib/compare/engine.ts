import type { Listing } from "../providers/types";

export type Verdict = "best" | "worst" | "neutral";

export interface ComparisonAxis {
  /** Stable key for the UI to render. */
  key: string;
  /** Human label, eg "Total monthly cost". */
  label: string;
  /** One row per listing being compared. */
  values: { listingId: string; display: string; sortValue: number; verdict: Verdict }[];
  /** "lower-is-better" | "higher-is-better" | "qualitative" */
  direction: "lower" | "higher" | "qualitative";
  /** A short note the agent can read aloud about this axis, eg "₹4k cheaper". */
  note?: string;
}

export interface Comparison {
  listings: Listing[];
  axes: ComparisonAxis[];
  /** A 2-3 sentence verbal-friendly summary the agent reads out. */
  summary: string;
}

/**
 * Compare 2-5 listings honestly across the axes that drive a real renter's
 * decision. The agent invokes this via the `compare_listings` function tool
 * after surfacing 2-3 search results to the user.
 */
export function compareListings(listings: Listing[]): Comparison {
  if (listings.length < 2) {
    throw new Error("compareListings requires at least 2 listings");
  }
  if (listings.length > 5) {
    throw new Error("compareListings supports at most 5 listings at a time");
  }

  const axes: ComparisonAxis[] = [
    buildAxis({
      key: "monthlyCost",
      label: "Total monthly cost",
      direction: "lower",
      listings,
      sortValueOf: (l) => l.rentInr + (l.maintenanceInr ?? 0),
      displayOf: (l) =>
        `₹${formatInr(l.rentInr + (l.maintenanceInr ?? 0))}/mo${l.maintenanceIncluded ? " (incl)" : ""}`,
    }),
    buildAxis({
      key: "deposit",
      label: "Deposit",
      direction: "lower",
      listings,
      sortValueOf: (l) => l.depositMonths,
      displayOf: (l) => `${l.depositMonths} months`,
    }),
    buildAxis({
      key: "carpetArea",
      label: "Carpet area",
      direction: "higher",
      listings,
      sortValueOf: (l) => l.carpetAreaSqft,
      displayOf: (l) => `${l.carpetAreaSqft} sqft`,
    }),
    buildAxis({
      key: "furnishing",
      label: "Furnishing",
      direction: "qualitative",
      listings,
      sortValueOf: (l) => ({ unfurnished: 0, semi: 1, fully: 2 })[l.furnishing],
      displayOf: (l) => l.furnishing,
    }),
    buildAxis({
      key: "parking",
      label: "Parking",
      direction: "qualitative",
      listings,
      sortValueOf: (l) => ({ none: 0, bike: 1, car: 2, both: 3 })[l.parking],
      displayOf: (l) => l.parking,
    }),
    buildAxis({
      key: "ageYears",
      label: "Building age",
      direction: "lower",
      listings,
      sortValueOf: (l) => l.ageYears,
      displayOf: (l) => `${l.ageYears} yrs`,
    }),
    buildAxis({
      key: "amenities",
      label: "Amenities",
      direction: "higher",
      listings,
      sortValueOf: (l) => l.amenities.length,
      displayOf: (l) => `${l.amenities.length} (${l.amenities.slice(0, 3).join(", ")}${l.amenities.length > 3 ? "…" : ""})`,
    }),
    buildAxis({
      key: "floorLift",
      label: "Floor + lift",
      direction: "qualitative",
      listings,
      sortValueOf: (l) => (l.hasLift ? 100 : 0) - Math.max(0, l.floor - 2) * 5,
      displayOf: (l) => `${l.floor}/${l.totalFloors}${l.hasLift ? " (lift)" : " (no lift)"}`,
    }),
    buildAxis({
      key: "techParkKm",
      label: "Nearest tech park",
      direction: "lower",
      listings,
      sortValueOf: (l) => l.nearestTechParkKm ?? 99,
      displayOf: (l) =>
        l.nearestTechParkKm !== null && l.nearestTechParkName
          ? `${l.nearestTechParkKm} km — ${l.nearestTechParkName}`
          : "—",
    }),
    buildAxis({
      key: "metroKm",
      label: "Nearest metro",
      direction: "lower",
      listings,
      sortValueOf: (l) => l.nearestMetroKm ?? 99,
      displayOf: (l) => (l.nearestMetroKm !== null ? `${l.nearestMetroKm} km` : "no metro nearby"),
    }),
    buildAxis({
      key: "availability",
      label: "Move-in",
      direction: "lower",
      listings,
      sortValueOf: (l) => new Date(l.availableFromIso).getTime(),
      displayOf: (l) => l.availableFromIso,
    }),
  ];

  const summary = buildSummary(listings, axes);
  return { listings, axes, summary };
}

interface BuildAxisInput {
  key: string;
  label: string;
  direction: "lower" | "higher" | "qualitative";
  listings: Listing[];
  sortValueOf: (l: Listing) => number;
  displayOf: (l: Listing) => string;
}

function buildAxis(input: BuildAxisInput): ComparisonAxis {
  const values = input.listings.map((l) => ({
    listingId: l.id,
    display: input.displayOf(l),
    sortValue: input.sortValueOf(l),
    verdict: "neutral" as Verdict,
  }));
  if (input.direction === "qualitative") return { ...input, values };

  const min = Math.min(...values.map((v) => v.sortValue));
  const max = Math.max(...values.map((v) => v.sortValue));

  for (const v of values) {
    if (min === max) {
      v.verdict = "neutral";
    } else if (input.direction === "lower") {
      v.verdict = v.sortValue === min ? "best" : v.sortValue === max ? "worst" : "neutral";
    } else {
      v.verdict = v.sortValue === max ? "best" : v.sortValue === min ? "worst" : "neutral";
    }
  }

  return { ...input, values };
}

function buildSummary(listings: Listing[], axes: ComparisonAxis[]): string {
  const idToTitle = new Map(listings.map((l) => [l.id, shortTitle(l)]));

  const cost = axes.find((a) => a.key === "monthlyCost");
  const carpet = axes.find((a) => a.key === "carpetArea");
  const techPark = axes.find((a) => a.key === "techParkKm");
  const amenities = axes.find((a) => a.key === "amenities");

  const lines: string[] = [];

  if (cost) {
    const cheapest = cost.values.find((v) => v.verdict === "best");
    const priciest = cost.values.find((v) => v.verdict === "worst");
    if (cheapest && priciest && cheapest.listingId !== priciest.listingId) {
      const diff = priciest.sortValue - cheapest.sortValue;
      lines.push(
        `${idToTitle.get(cheapest.listingId)} is ₹${formatInr(diff)}/month cheaper than ${idToTitle.get(priciest.listingId)}.`
      );
    }
  }

  if (carpet) {
    const biggest = carpet.values.find((v) => v.verdict === "best");
    if (biggest) lines.push(`${idToTitle.get(biggest.listingId)} is the most spacious.`);
  }

  if (techPark) {
    const closest = techPark.values.find((v) => v.verdict === "best");
    if (closest && closest.sortValue < 99) {
      lines.push(`${idToTitle.get(closest.listingId)} is closest to the tech park.`);
    }
  }

  if (amenities) {
    const richest = amenities.values.find((v) => v.verdict === "best");
    if (richest && richest.sortValue >= 4) {
      lines.push(`${idToTitle.get(richest.listingId)} has the most amenities.`);
    }
  }

  if (lines.length === 0) {
    lines.push("These listings are very close on the basics — the choice comes down to personal feel.");
  }

  return lines.join(" ");
}

function shortTitle(l: Listing): string {
  return `${l.bhk}BHK in ${l.area}`;
}

/** Format a rupee amount with Indian thousands separators (no symbol). */
export function formatInr(n: number): string {
  return n.toLocaleString("en-IN");
}
