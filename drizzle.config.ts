import { defineConfig } from "drizzle-kit";
import { existsSync, readFileSync } from "node:fs";

loadLocalEnv();

if (!process.env.DATABASE_URL) {
  // drizzle-kit needs the URL to push/generate; surface a clear error.
  throw new Error(
    "DATABASE_URL must be set to run drizzle-kit. Try: `DATABASE_URL=... pnpm db:push`",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

function loadLocalEnv() {
  const path = ".env.local";
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator);
    const rawValue = trimmed.slice(separator + 1);
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
