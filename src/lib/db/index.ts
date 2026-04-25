import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../env";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Lazy DB accessor.
 *
 * The app boots without DATABASE_URL — the dashboard renders empty states,
 * the API routes that need it return 503 with a clear error. Once the env
 * var is set, this opens a Neon HTTP connection on first use.
 */
export function getDb() {
  if (_db) return _db;
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — Neon free tier works in 30 seconds.",
    );
  }
  const sql = neon(env.DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

/** True only if a DB connection has been opened in this process. Not auth. */
export function isDbConfigured(): boolean {
  return env.DATABASE_URL !== undefined && env.DATABASE_URL.length > 0;
}

export * from "./schema";
