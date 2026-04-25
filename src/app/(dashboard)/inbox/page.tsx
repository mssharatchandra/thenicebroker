import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { Badge, MetricCard, Panel } from "@/components/ui";
import {
  formatDateTime,
  formatDuration,
  formatInr,
  getDashboardData,
} from "@/lib/dashboard/data";

export default async function InboxPage({
  searchParams,
}: {
  searchParams?: Promise<{ call?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const data = await getDashboardData();
  const selected = data.calls.find((call) => call.id === params.call) ?? data.calls[0];
  const bookedVisits = data.visits.length;
  const completedCalls = data.calls.filter((call) => call.status === "completed").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Concierge inbox" title="Voice calls that turned into rental decisions">
        <Badge tone={data.source === "database" ? "green" : "amber"}>{data.sourceNote}</Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Calls tracked" value={data.calls.length.toString()} helper={`${completedCalls} completed`} />
        <MetricCard label="Visits booked" value={bookedVisits.toString()} helper="Across phone + dashboard" />
        <MetricCard label="Inventory scope" value={data.inventoryCount.toString()} helper="Bangalore mock listings" />
        <MetricCard
          label="Projected savings"
          value={`₹${formatInr(data.economics.monthlySavingsInr)}`}
          helper="Per month at demo volume"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Panel title="Live Queue">
          <div className="space-y-3">
            {data.calls.map((call) => (
              <Link
                key={call.id}
                href={{ pathname: "/inbox", query: { call: call.id } }}
                className="block rounded border border-stone-200 p-3 hover:border-emerald-300 hover:bg-emerald-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-950">{call.callerName}</p>
                    <p className="mt-1 text-sm text-stone-500">{call.phone}</p>
                  </div>
                  <Badge tone={statusTone(call.status)}>{call.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={intentTone(call.intent)}>{call.intent}</Badge>
                  <Badge>{call.qualScore}/100 fit</Badge>
                  <Badge>{formatDuration(call.durationSec)}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        {selected ? (
          <div className="space-y-6">
            <Panel
              title="Extracted Profile"
              action={<Badge tone={intentTone(selected.intent)}>{selected.intent}</Badge>}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Fact label="Caller" value={`${selected.callerName} · ${selected.phone}`} />
                <Fact label="Started" value={formatDateTime(selected.startedAt)} />
                <Fact label="Budget" value={selected.requirements.budget} />
                <Fact label="Areas" value={selected.requirements.areas.join(", ") || "Not captured"} />
                <Fact label="BHK" value={selected.requirements.bhk.join(", ") || "Not captured"} />
                <Fact label="Move-in" value={selected.requirements.moveInBy} />
                <Fact label="Occupants" value={selected.requirements.occupants} />
                <Fact label="Parking" value={selected.requirements.parking} />
                <Fact label="Language" value={selected.requirements.language} />
              </div>
            </Panel>

            <Panel title="Agent Reasoning">
              <div className="space-y-4">
                <p className="text-sm leading-6 text-stone-700">{data.comparison.summary}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {data.recommendedListings.map((listing) => (
                    <div key={listing.id} className="rounded border border-stone-200 p-3">
                      <p className="text-sm font-semibold text-stone-950">{listing.title}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {listing.area} · ₹{formatInr(listing.rentInr)}/mo
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">{listing.caveats[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Transcript">
              <div className="space-y-3">
                {selected.transcript.map((turn, index) => (
                  <div key={`${turn.speaker}-${index}`} className="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)]">
                    <Badge tone={turn.speaker === "User" ? "blue" : turn.speaker === "Tool" ? "amber" : "green"}>
                      {turn.speaker}
                    </Badge>
                    <p className="text-sm leading-6 text-stone-700">{turn.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-emerald-600 pl-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-950">{value}</p>
    </div>
  );
}

function statusTone(status: string): "green" | "amber" | "red" {
  if (status === "completed") return "green";
  if (status === "missed") return "red";
  return "amber";
}

function intentTone(intent: string): "green" | "amber" | "blue" {
  if (intent === "urgent") return "green";
  if (intent === "just-browsing") return "blue";
  return "amber";
}
