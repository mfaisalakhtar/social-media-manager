/**
 * Worker entry point — run with: npm run worker
 * In production, host this on a persistent server (not Vercel).
 * Recommended: Railway, Fly.io, or a VPS with PM2.
 */

import { startScheduler } from "./scheduler";

// TODO: Replace with real Supabase server client
const db = {};

process.on("SIGTERM", () => {
  console.log("[worker] SIGTERM received — shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[worker] SIGINT received — shutting down");
  process.exit(0);
});

console.log("[worker] Social Media Manager publishing worker starting…");
console.log("[worker] USE_MOCK_ADAPTERS =", process.env.USE_MOCK_ADAPTERS ?? "not set");

startScheduler(db).catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
