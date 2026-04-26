export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

export function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.toLowerCase();
  if (["null", "undefined", "n/a", "na"].includes(normalized)) return undefined;
  if (/^%\([^)]+\)s$/.test(trimmed)) return undefined;
  if (/^\{\{[^}]+\}\}$/.test(trimmed)) return undefined;
  return trimmed;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(normalized)) return true;
    if (["false", "no", "n", "0"].includes(normalized)) return false;
  }
  return undefined;
}

export function parseStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const values = value
      .map((v) => asString(v))
      .filter((v): v is string => Boolean(v));
    return values.length ? values : undefined;
  }
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const values = value
    .split(",")
    .map((v) => asString(v))
    .filter((v): v is string => Boolean(v));
  return values.length ? values : undefined;
}

export function parseNumberArray(value: unknown): number[] | undefined {
  if (Array.isArray(value)) {
    const values = value.map(Number).filter((v) => Number.isFinite(v));
    return values.length ? values : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const values = value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
  return values.length ? values : undefined;
}
