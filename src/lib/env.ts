import { z } from "zod";

/**
 * Centralised env-var validation.
 *
 * - DATABASE_URL is optional in local dev so `pnpm dev` boots without a
 *   Neon project. Any code path that touches the DB will fail loudly when
 *   it's missing — that's the right shape for a tool that boots on
 *   `pnpm dev` even before the DB is wired.
 * - BOLNA_WEBHOOK_SECRET defaults to a dev placeholder; rotate in prod.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  BOLNA_WEBHOOK_SECRET: z.string().min(8).default("dev-secret-change-me-in-prod"),
  BOLNA_AGENT_ID: z.string().optional(),
  BOLNA_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  BOLNA_WEBHOOK_SECRET: process.env.BOLNA_WEBHOOK_SECRET,
  BOLNA_AGENT_ID: process.env.BOLNA_AGENT_ID,
  BOLNA_API_KEY: process.env.BOLNA_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export const isProd = env.NODE_ENV === "production";
