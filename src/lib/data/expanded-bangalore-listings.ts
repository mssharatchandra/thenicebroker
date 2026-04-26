import { BANGALORE_LISTINGS } from "./bangalore-listings";
import type { Area, Listing } from "../providers/types";

type ListingDraft = Omit<
  Listing,
  | "depositMonths"
  | "agreementMonths"
  | "noticeMonths"
  | "availableVisitSlotsIso"
  | "description"
  | "highlights"
  | "caveats"
> & {
  depositMonths?: number;
  agreementMonths?: number;
  noticeMonths?: number;
  description?: string;
  highlights?: string[];
  caveats?: string[];
};

const AREA_CENTERS: Record<Area, { lat: number; lng: number; techPark: string; metroKm: number | null }> = {
  "HSR Layout": { lat: 12.9121, lng: 77.6446, techPark: "HSR ORR", metroKm: null },
  Whitefield: { lat: 12.9698, lng: 77.7499, techPark: "ITPL", metroKm: 1.4 },
  Indiranagar: { lat: 12.9784, lng: 77.6408, techPark: "Bagmane Tech Park", metroKm: 0.8 },
  Koramangala: { lat: 12.9352, lng: 77.6245, techPark: "Koramangala startup corridor", metroKm: null },
  "BTM Layout": { lat: 12.9166, lng: 77.6101, techPark: "Bannerghatta Road offices", metroKm: null },
  "JP Nagar": { lat: 12.9063, lng: 77.5857, techPark: "Bannerghatta Road offices", metroKm: 1.2 },
  Marathahalli: { lat: 12.9569, lng: 77.7011, techPark: "RMZ Ecospace", metroKm: null },
  "Electronic City": { lat: 12.8452, lng: 77.6602, techPark: "Infosys EC", metroKm: null },
  "KR Puram": { lat: 13.0076, lng: 77.6950, techPark: "ITPL", metroKm: 1.1 },
  "Old Madras Road": { lat: 12.9982, lng: 77.6781, techPark: "Bagmane Tech Park", metroKm: 0.9 },
  Bellandur: { lat: 12.9298, lng: 77.6760, techPark: "RMZ Ecospace", metroKm: null },
  "Sarjapur Road": { lat: 12.9149, lng: 77.6842, techPark: "Wipro Sarjapur", metroKm: null },
};

const EXTRA_SPECS: Array<{
  area: Area;
  locality: string;
  rentBase: number;
  techParkKm: number;
  metroKm?: number | null;
}> = [
  { area: "HSR Layout", locality: "HSR Sector 1", rentBase: 41000, techParkKm: 1.2 },
  { area: "HSR Layout", locality: "HSR Sector 4", rentBase: 47000, techParkKm: 1.8 },
  { area: "Whitefield", locality: "Brookefield", rentBase: 33000, techParkKm: 1.8, metroKm: 1.6 },
  { area: "Whitefield", locality: "Kadugodi", rentBase: 30000, techParkKm: 2.8, metroKm: 0.7 },
  { area: "Marathahalli", locality: "Munnekollal", rentBase: 31000, techParkKm: 2.0 },
  { area: "Marathahalli", locality: "AECS Layout", rentBase: 36000, techParkKm: 2.4 },
  { area: "KR Puram", locality: "KR Puram Lake Road", rentBase: 27000, techParkKm: 4.0, metroKm: 1.1 },
  { area: "Old Madras Road", locality: "Bennigana Halli", rentBase: 34000, techParkKm: 2.2, metroKm: 0.8 },
  { area: "Bellandur", locality: "Bellandur Gate", rentBase: 42000, techParkKm: 0.9 },
  { area: "Bellandur", locality: "Green Glen Layout", rentBase: 45000, techParkKm: 1.3 },
  { area: "Sarjapur Road", locality: "Doddakannelli", rentBase: 38000, techParkKm: 1.1 },
  { area: "Sarjapur Road", locality: "Kaikondrahalli", rentBase: 40000, techParkKm: 1.8 },
  { area: "Koramangala", locality: "Koramangala 6th Block", rentBase: 52000, techParkKm: 1.4 },
  { area: "BTM Layout", locality: "BTM 2nd Stage", rentBase: 32000, techParkKm: 3.2 },
  { area: "JP Nagar", locality: "JP Nagar 6th Phase", rentBase: 33000, techParkKm: 4.5, metroKm: 1.0 },
  { area: "Indiranagar", locality: "HAL 2nd Stage", rentBase: 55000, techParkKm: 1.1, metroKm: 0.7 },
  { area: "Electronic City", locality: "Neeladri Road", rentBase: 25000, techParkKm: 1.0 },
];

export const EXPANDED_BANGALORE_LISTINGS: Listing[] = [
  ...BANGALORE_LISTINGS.map((listing, index) => ({
    ...listing,
    availableVisitSlotsIso: demoSlots(index),
  })),
  ...EXTRA_SPECS.flatMap((spec, specIndex) =>
    [1, 2, 3].map((variant) => makeListing(spec, specIndex, variant)),
  ),
];

function makeListing(
  spec: (typeof EXTRA_SPECS)[number],
  specIndex: number,
  variant: number,
): Listing {
  const idNumber = 26 + specIndex * 3 + (variant - 1);
  const bhk = variant === 1 ? 1 : variant === 2 ? 2 : 3;
  const furnished = variant === 1 ? "fully" : variant === 2 ? "semi" : "semi";
  const gated = variant !== 1 || specIndex % 2 === 0;
  const center = AREA_CENTERS[spec.area];
  const rentInr = spec.rentBase + (variant - 2) * 6500 + (specIndex % 3) * 1500;
  const maintenanceIncluded = variant === 1 || specIndex % 4 === 0;
  const maintenanceInr = maintenanceIncluded ? null : 2200 + variant * 900;
  const carpetAreaSqft = variant === 1 ? 620 + specIndex * 5 : variant === 2 ? 980 + specIndex * 8 : 1450 + specIndex * 12;
  const parking = variant === 1 ? "bike" : variant === 2 ? "car" : "both";
  const ageYears = 3 + ((specIndex + variant) % 13);
  const floor = 1 + ((specIndex + variant * 2) % 11);
  const hasLift = floor <= 2 ? specIndex % 3 !== 0 : true;
  const petFriendly = variant !== 1 || specIndex % 3 === 0;
  const bachelorAllowed = variant !== 3 || specIndex % 2 === 1;
  const availableDay = 1 + ((specIndex * 3 + variant * 2) % 35);

  return withDefaults({
    id: `nbk-${String(idNumber).padStart(3, "0")}`,
    title: `${bhk}BHK ${gated ? "gated apartment" : "independent floor"} in ${spec.locality}`,
    area: spec.area,
    locality: spec.locality,
    bhk,
    carpetAreaSqft,
    rentInr,
    maintenanceIncluded,
    maintenanceInr,
    furnishing: furnished,
    parking,
    floor,
    totalFloors: gated ? 14 : 4,
    hasLift,
    ageYears,
    amenities: gated
      ? ["gym", "powerBackup", "security", "clubhouse", ...(variant === 3 ? ["pool" as const, "playArea" as const] : [])]
      : ["powerBackup", "security"],
    petFriendly,
    vegOnly: specIndex % 7 === 0,
    bachelorAllowed,
    familyPreferred: variant !== 1,
    availableFromIso: `2026-${availableDay <= 31 ? "05" : "06"}-${String(availableDay <= 31 ? availableDay : availableDay - 31).padStart(2, "0")}`,
    nearestMetroKm: spec.metroKm ?? center.metroKm,
    nearestTechParkKm: spec.techParkKm + (variant - 2) * 0.4,
    nearestTechParkName: center.techPark,
    coords: {
      lat: Number((center.lat + (specIndex % 5) * 0.002 + variant * 0.0008).toFixed(4)),
      lng: Number((center.lng + (specIndex % 4) * 0.002 - variant * 0.0007).toFixed(4)),
    },
    contactType: specIndex % 4 === 0 ? "broker" : "owner",
    description: `${bhk}BHK in ${spec.locality} with ${parking === "bike" ? "bike parking" : "car parking"} and ${gated ? "gated-community" : "independent-floor"} tradeoffs.`,
    highlights: [
      parking === "bike" ? "Lower monthly outlay" : "Car parking available",
      gated ? "Security and power backup" : "Quieter independent floor",
      `${spec.techParkKm.toFixed(1)} km class commute anchor to ${center.techPark}`,
    ],
    caveats: [
      variant === 1 ? "Compact carpet area" : maintenanceIncluded ? "Limited premium amenities" : `Maintenance ₹${maintenanceInr?.toLocaleString("en-IN")} extra`,
      hasLift ? "Check peak-hour lift wait times" : "No lift",
    ],
  }, idNumber);
}

function withDefaults(draft: ListingDraft, idNumber: number): Listing {
  return {
    depositMonths: draft.contactType === "broker" ? 6 : 4,
    agreementMonths: 11,
    noticeMonths: 2,
    availableVisitSlotsIso: demoSlots(idNumber),
    ...draft,
    description: draft.description ?? `${draft.bhk}BHK in ${draft.locality}.`,
    highlights: draft.highlights ?? ["Good fit for the selected area"],
    caveats: draft.caveats ?? ["Verify owner rules before payment"],
  };
}

function demoSlots(seed: number): string[] {
  const days = [27, 28, 29, 30, 1, 2, 3, 4];
  const slots = ["09:30", "11:00", "16:30", "18:30", "19:30"];
  return Array.from({ length: 5 }, (_, i) => {
    const day = days[(seed + i) % days.length]!;
    const month = day <= 4 ? "05" : "04";
    const slot = slots[(seed * 2 + i) % slots.length]!;
    return `2026-${month}-${String(day).padStart(2, "0")}T${slot}:00+05:30`;
  });
}
