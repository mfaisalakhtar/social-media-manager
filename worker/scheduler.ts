/**
 * Scheduler — finds due publications and dispatches them to the publisher.
 * Runs on a configurable interval (default: every 30 seconds).
 */

import { publishOne } from "./publisher";

// Placeholder DB client type
type DbClient = Record<string, unknown>;

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const MAX_CONCURRENT_JOBS = 5; // Max publications processed per poll cycle

export async function startScheduler(db: DbClient): Promise<void> {
  console.log("[scheduler] Starting publishing scheduler…");

  const tick = async () => {
    try {
      await processdue(db);
    } catch (err) {
      console.error("[scheduler] Tick error:", err);
    }
    setTimeout(tick, POLL_INTERVAL_MS);
  };

  await tick();
}

async function processdue(db: DbClient): Promise<void> {
  // TODO: Query smm_publications WHERE:
  //   status IN ('queued', 'retry_scheduled')
  //   AND (scheduled_at_utc IS NULL OR scheduled_at_utc <= NOW())
  //   AND (next_retry_at IS NULL OR next_retry_at <= NOW())
  //   ORDER BY scheduled_at_utc ASC NULLS LAST
  //   LIMIT MAX_CONCURRENT_JOBS
  //   FOR UPDATE SKIP LOCKED  ← prevents multiple workers claiming same job

  const duePublicationIds: string[] = [
    // e.g. "pub_abc123", "pub_def456"
  ];

  if (duePublicationIds.length === 0) return;

  console.log(`[scheduler] Processing ${duePublicationIds.length} due publication(s)`);

  await Promise.allSettled(
    duePublicationIds.map((id) => publishOne(db, id)),
  );
}
