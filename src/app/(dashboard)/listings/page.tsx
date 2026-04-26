import { PageHeader } from "@/components/app-shell";
import { Badge, MetricCard, Panel } from "@/components/ui";
import { provider } from "@/lib/providers";
import type { Area, Listing } from "@/lib/providers/types";
import { formatDateTime, formatInr } from "@/lib/dashboard/data";

const areaOptions: Area[] = [
  "HSR Layout",
  "Whitefield",
  "Marathahalli",
  "KR Puram",
  "Old Madras Road",
  "Bellandur",
  "Sarjapur Road",
  "Koramangala",
  "Indiranagar",
  "BTM Layout",
  "JP Nagar",
  "Electronic City",
];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ area?: string; bhk?: string; q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const allListings = await provider.listAll();
  const filtered = filterListings(allListings, params);
  const areasCovered = new Set(allListings.map((listing) => listing.area)).size;
  const slotsCount = allListings.reduce((sum, listing) => sum + (listing.availableVisitSlotsIso?.length ?? 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Inventory explorer" title="Manual mock listings the agent can actually search">
        <Badge tone="green">{allListings.length} listings</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Listings" value={allListings.length.toString()} helper="Provider-backed, not UI hardcoded" />
        <MetricCard label="Areas covered" value={areasCovered.toString()} helper="Core + nearby Bangalore corridors" />
        <MetricCard label="Visit slots" value={slotsCount.toString()} helper="Demo calendar capacity exposed to the agent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel title="Filters">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Area</p>
              <div className="flex flex-wrap gap-2">
                <FilterLink label="All" href="/listings" active={!params.area} />
                {areaOptions.map((area) => (
                  <FilterLink
                    key={area}
                    label={area}
                    href={`/listings?area=${encodeURIComponent(area)}`}
                    active={params.area === area}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">BHK</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((bhk) => (
                  <FilterLink
                    key={bhk}
                    label={`${bhk}BHK`}
                    href={`/listings?bhk=${bhk}${params.area ? `&area=${encodeURIComponent(params.area)}` : ""}`}
                    active={params.bhk === String(bhk)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={`Showing ${filtered.length} homes - newest first`}>
          <div className="grid gap-3 xl:grid-cols-2">
            {filtered.map((listing) => (
              <article key={listing.id} className="rounded border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{listing.id}</p>
                    <h2 className="mt-1 text-base font-semibold text-stone-950">{listing.title}</h2>
                    <p className="mt-1 text-sm text-stone-500">{listing.area} · {listing.locality}</p>
                  </div>
                  <Badge tone={listing.contactType === "owner" ? "green" : "amber"}>{listing.contactType}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-stone-700 sm:grid-cols-4">
                  <Fact label="Rent" value={`₹${formatInr(listing.rentInr + (listing.maintenanceInr ?? 0))}`} />
                  <Fact label="BHK" value={`${listing.bhk}`} />
                  <Fact label="Parking" value={listing.parking} />
                  <Fact label="Move-in" value={listing.availableFromIso} />
                </div>
                <p className="mt-3 text-sm text-stone-700">{listing.highlights[0]}</p>
                <p className="mt-1 text-sm text-stone-500">{listing.caveats[0]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(listing.availableVisitSlotsIso ?? []).slice(0, 3).map((slot) => (
                    <Badge key={slot}>{formatDateTime(slot)}</Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}

function filterListings(
  listings: Listing[],
  params: { area?: string; bhk?: string; q?: string },
): Listing[] {
  const query = params.q?.toLowerCase().trim();
  return listings
    .filter((listing) => !params.area || listing.area === params.area)
    .filter((listing) => !params.bhk || String(listing.bhk) === params.bhk)
    .filter((listing) => {
      if (!query) return true;
      return `${listing.title} ${listing.area} ${listing.locality}`.toLowerCase().includes(query);
    })
    .slice(0, 80);
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`rounded border px-2 py-1 text-xs font-medium ${
        active
          ? "border-emerald-700 bg-emerald-700 text-white"
          : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300"
      }`}
    >
      {label}
    </a>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-0.5 font-semibold text-stone-950">{value}</p>
    </div>
  );
}
