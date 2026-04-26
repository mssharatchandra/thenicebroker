import { describe, expect, it } from "vitest";
import { BANGALORE_LISTINGS } from "../data/bangalore-listings";
import { compareListings, formatInr } from "./engine";
import { MockInventoryProvider } from "../providers/mock";

const byId = (id: string) => {
  const l = BANGALORE_LISTINGS.find((x) => x.id === id);
  if (!l) throw new Error(`fixture missing ${id}`);
  return l;
};

describe("compareListings", () => {
  it("flags the cheapest listing as best on monthly cost", () => {
    const result = compareListings([byId("nbk-002"), byId("nbk-003"), byId("nbk-004")]);
    const cost = result.axes.find((a) => a.key === "monthlyCost");
    expect(cost).toBeDefined();
    const cheapest = cost!.values.find((v) => v.verdict === "best");
    expect(cheapest?.listingId).toBe("nbk-002");
  });

  it("flags the most spacious listing as best on carpet area", () => {
    const result = compareListings([byId("nbk-008"), byId("nbk-002")]);
    const area = result.axes.find((a) => a.key === "carpetArea");
    const biggest = area!.values.find((v) => v.verdict === "best");
    expect(biggest?.listingId).toBe("nbk-008");
  });

  it("produces a non-empty verbal summary", () => {
    const result = compareListings([byId("nbk-002"), byId("nbk-006"), byId("nbk-013")]);
    expect(result.summary.length).toBeGreaterThan(20);
  });

  it("rejects fewer than 2 listings", () => {
    expect(() => compareListings([byId("nbk-001")])).toThrow();
  });

  it("rejects more than 5 listings", () => {
    expect(() =>
      compareListings(BANGALORE_LISTINGS.slice(0, 6)),
    ).toThrow();
  });
});

describe("MockInventoryProvider.search", () => {
  const provider = new MockInventoryProvider();

  it("filters by budget ceiling", async () => {
    const out = await provider.search({ budgetMin: 10000, budgetMax: 25000 });
    for (const r of out) {
      const total = r.listing.rentInr + (r.listing.maintenanceInr ?? 0);
      expect(total).toBeLessThanOrEqual(25000 * 1.05);
    }
  });

  it("filters by area", async () => {
    const out = await provider.search({ areas: ["Whitefield"] });
    expect(out.length).toBeGreaterThan(0);
    for (const r of out) expect(r.listing.area).toBe("Whitefield");
  });

  it("filters by BHK", async () => {
    const out = await provider.search({ bhk: [2] });
    for (const r of out) expect(r.listing.bhk).toBe(2);
  });

  it("excludes non-pet-friendly listings when petFriendly=true", async () => {
    const out = await provider.search({ petFriendly: true });
    for (const r of out) expect(r.listing.petFriendly).toBe(true);
  });

  it("ranks listings available by the requested move-in date ahead of later ones", async () => {
    const out = await provider.search({ moveInBy: "2026-05-05", limit: 10 });
    expect(out.length).toBeGreaterThan(0);
    const onTime = out.filter((r) => r.listing.availableFromIso <= "2026-05-05");
    const late = out.filter((r) => r.listing.availableFromIso > "2026-05-05");
    if (onTime.length > 0 && late.length > 0) {
      const minOnTime = Math.min(...onTime.map((r) => r.score));
      const maxLate = Math.max(...late.map((r) => r.score));
      expect(minOnTime).toBeGreaterThanOrEqual(maxLate - 5);
    }
  });

  it("applies the requested limit", async () => {
    const out = await provider.search({ limit: 3 });
    expect(out.length).toBe(3);
  });

  it("returns reasons and flags so the agent can read tradeoffs aloud", async () => {
    const out = await provider.search({
      areas: ["HSR Layout"],
      bhk: [2],
      budgetMin: 30000,
      budgetMax: 45000,
      amenities: ["pool", "gym"],
    });
    expect(out.length).toBeGreaterThan(0);
    const top = out[0]!;
    expect(top.reasons.length + top.flags.length).toBeGreaterThan(0);
  });

  it("sorts by score descending", async () => {
    const out = await provider.search({ budgetMin: 20000, budgetMax: 60000 });
    for (let i = 1; i < out.length; i++) {
      expect(out[i - 1]!.score).toBeGreaterThanOrEqual(out[i]!.score);
    }
  });
});

describe("formatInr", () => {
  it("formats with Indian thousands separators", () => {
    expect(formatInr(1234567)).toBe("12,34,567");
    expect(formatInr(45000)).toBe("45,000");
    expect(formatInr(0)).toBe("0");
  });
});
