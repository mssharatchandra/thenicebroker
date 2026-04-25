import { PageHeader } from "@/components/app-shell";
import { Badge, Panel } from "@/components/ui";
import { formatInr, getDashboardData } from "@/lib/dashboard/data";

const axisOrder = ["monthlyCost", "deposit", "carpetArea", "parking", "floorLift", "techParkKm"];

export default async function ListingsPage() {
  const data = await getDashboardData();
  const axes = data.comparison.axes.filter((axis) => axisOrder.includes(axis.key));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Listing comparison" title="The answer is a tradeoff, not a top-10 list">
        <Badge tone="green">{data.recommendedListings.length} shortlisted homes</Badge>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Comparison Matrix">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white py-3 pr-4 text-left font-semibold text-stone-700">Axis</th>
                  {data.recommendedListings.map((listing) => (
                    <th key={listing.id} className="min-w-56 px-4 py-3 text-left font-semibold text-stone-950">
                      {listing.bhk}BHK · {listing.area}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {axes.map((axis) => (
                  <tr key={axis.key}>
                    <td className="sticky left-0 border-t border-stone-200 bg-white py-3 pr-4 font-medium text-stone-700">
                      {axis.label}
                    </td>
                    {axis.values.map((value) => (
                      <td key={`${axis.key}-${value.listingId}`} className="border-t border-stone-200 px-4 py-3">
                        <Badge tone={value.verdict === "best" ? "green" : value.verdict === "worst" ? "amber" : "neutral"}>
                          {value.display}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Voice Summary">
          <p className="text-sm leading-6 text-stone-700">{data.comparison.summary}</p>
          <div className="mt-5 space-y-4">
            {data.recommendedListings.map((listing) => (
              <article key={listing.id} className="border-t border-stone-200 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-stone-950">{listing.title}</h2>
                    <p className="mt-1 text-sm text-stone-500">{listing.locality}</p>
                  </div>
                  <Badge>₹{formatInr(listing.rentInr)}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
                  <span>{listing.carpetAreaSqft} sqft</span>
                  <span>{listing.furnishing}</span>
                  <span>{listing.parking} parking</span>
                  <span>{listing.hasLift ? "Lift" : "No lift"}</span>
                </div>
                <p className="mt-3 text-xs font-medium text-emerald-800">{listing.highlights[0]}</p>
                <p className="mt-1 text-xs text-stone-500">{listing.caveats[0]}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}
