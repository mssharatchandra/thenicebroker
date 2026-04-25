import type { ReactNode } from "react";
import { clsx } from "clsx";

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
      {helper ? <p className="mt-1 text-sm text-stone-500">{helper}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "blue" | "red";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-1 text-xs font-medium",
        tone === "neutral" && "bg-stone-100 text-stone-700",
        tone === "green" && "bg-emerald-100 text-emerald-800",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "blue" && "bg-sky-100 text-sky-800",
        tone === "red" && "bg-rose-100 text-rose-800",
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
