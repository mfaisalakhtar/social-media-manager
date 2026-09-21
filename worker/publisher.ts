/**
 * Publisher — executes one publication attempt.
 * Called by the scheduler for each due publication.
 *
 * Follows the 12-step publishing flow from the PRD (section 13).
 */

import { decryptToken } from "../src/lib/crypto";
import { getAdapter } from "../src/lib/adapters/registry";
import { publicationIdempotencyKey } from "../src/lib/utils";
import { PlatformError } from "../src/lib/errors";

// Placeholder DB type — replace with your actual Supabase client type
type DbClient = Record<string, unknown>;

interface PublicationRow {
  id: string;
  post_variation_id: string;
  idempotency_key: string;
  attempt_count: number;
  external_post_id: string | null;
}

interface VariationRow {
  id: string;
  post_id: string;
  platform: string;
  caption: string | null;
  link_url: string | null;
  social_destination_id: string;
}

interface PostRow {
  id: string;
  status: string;
  common_caption: string;
  link_url: string | null;
}

interface DestinationRow {
  id: string;
  platform: string;
  external_destination_id: string;
  oauth_connection_id: string;
}

interface ConnectionRow {
  id: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  token_expires_at: string | null;
  status: string;
}

export async function publishOne(db: DbClient, publicationId: string): Promise<void> {
  const attemptStartedAt = new Date();
  let attemptNumber = 0;

  try {
    // Step 1: Atomically claim the publication (set to "processing")
    // TODO: UPDATE smm_publications SET status = 'processing' WHERE id = ? AND status IN ('queued','retry_scheduled')
    // Use RETURNING to confirm the claim (optimistic lock)
    const publication = { id: publicationId, post_variation_id: "...", idempotency_key: "...", attempt_count: 0, external_post_id: null } as PublicationRow;
    attemptNumber = publication.attempt_count + 1;

    // Step 2: Load the post variation + parent post
    const variation = { id: publication.post_variation_id, post_id: "...", platform: "facebook", caption: null, link_url: null, social_destination_id: "..." } as VariationRow;
    const post = { id: variation.post_id, status: "approved", common_caption: "", link_url: null } as PostRow;

    // Step 3: Confirm the post is still approved and not canceled
    if (!["approved", "scheduled", "publishing"].includes(post.status)) {
      await markCanceled(db, publicationId, "Parent post is no longer approved.");
      return;
    }

    // Step 4: Confirm the destination is still active
    const destination = { id: variation.social_destination_id, platform: variation.platform, external_destination_id: "...", oauth_connection_id: "..." } as DestinationRow;
    // TODO: SELECT from smm_social_destinations WHERE id = variation.social_destination_id

    if ((destination as unknown as { status: string }).status !== "active") {
      await markFailed(db, publicationId, "DESTINATION_INACTIVE", "Social destination is not active. Reconnect the account.", false, attemptNumber, attemptStartedAt);
      return;
    }

    // Step 5: Check idempotency — if already published, skip
    if (publication.external_post_id) {
      console.log(`[publisher] Publication ${publicationId} already has external_post_id — marking as published`);
      await markPublished(db, publicationId, publication.external_post_id, null, {});
      return;
    }

    // Step 6: Load and decrypt credentials
    const connection = { id: destination.oauth_connection_id, encrypted_access_token: "...", encrypted_refresh_token: null, token_expires_at: null, status: "active" } as ConnectionRow;
    // TODO: SELECT from smm_oauth_connections WHERE id = destination.oauth_connection_id

    if (connection.status !== "active") {
      await markFailed(db, publicationId, "TOKEN_EXPIRED", "Access token expired. Reconnect the account.", false, attemptNumber, attemptStartedAt);
      return;
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(connection.encrypted_access_token);
    } catch {
      await markFailed(db, publicationId, "DECRYPT_ERROR", "Could not decrypt access token. Contact support.", false, attemptNumber, attemptStartedAt);
      return;
    }

    // Step 7: Optionally refresh token if expiring within 5 minutes
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
    if (expiresAt && expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      // TODO: adapter.refreshAccessToken(connection.id) — encrypt + UPDATE smm_oauth_connections
      console.log(`[publisher] Token for connection ${connection.id} is expiring soon — refresh TODO`);
    }

    const adapter = getAdapter(destination.platform);
    const caption = variation.caption ?? post.common_caption;

    // Step 8: Validate content before publishing
    const validation = await adapter.validatePost({
      publicationId,
      idempotencyKey: publicationIdempotencyKey(publicationId, attemptNumber),
      platform: destination.platform as "facebook" | "instagram" | "linkedin",
      destinationExternalId: destination.external_destination_id,
      accessToken, // decrypted — NEVER log this value
      caption,
      linkUrl: variation.link_url ?? post.link_url ?? undefined,
    });

    if (!validation.valid) {
      const errors = validation.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
      await markFailed(db, publicationId, "VALIDATION_ERROR", errors, false /* non-retryable */, attemptNumber, attemptStartedAt);
      return;
    }

    // Step 9: Publish through the platform API
    const result = await adapter.publishPost({
      publicationId,
      idempotencyKey: publicationIdempotencyKey(publicationId, attemptNumber),
      platform: destination.platform as "facebook" | "instagram" | "linkedin",
      destinationExternalId: destination.external_destination_id,
      accessToken,
      caption,
      linkUrl: variation.link_url ?? post.link_url ?? undefined,
    });

    // Step 10–11: Store result, mark published, update parent post status
    await markPublished(db, publicationId, result.externalPostId, result.externalPostUrl ?? null, result.sanitizedResponse);
    // TODO: Recalculate smm_posts.status = "published" | "partially_published" based on all sibling publications

    // Step 12: Write audit record + notification
    // TODO: INSERT smm_audit_logs, INSERT smm_notifications for author

    console.log(`[publisher] Published ${publicationId} → ${result.externalPostId}`);

  } catch (err) {
    const retryable = err instanceof PlatformError ? err.retryable : true;
    const code = err instanceof PlatformError ? err.code : "UNKNOWN_ERROR";
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(db, publicationId, code, message, retryable, attemptNumber, attemptStartedAt);
  }
}

// ─── Status helpers (all TODO with real DB queries) ───────────────────────────

async function markPublished(
  _db: DbClient,
  publicationId: string,
  externalPostId: string,
  externalPostUrl: string | null,
  sanitizedResponse: Record<string, unknown>,
): Promise<void> {
  console.log(`[publisher] markPublished: ${publicationId}`, { externalPostId, externalPostUrl });
  // TODO: UPDATE smm_publications SET status='published', external_post_id, external_post_url, published_at, sanitized_response_json
}

async function markFailed(
  _db: DbClient,
  publicationId: string,
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  attemptNumber: number,
  startedAt: Date,
): Promise<void> {
  const nextStatus = retryable ? "retry_scheduled" : "failed";
  // Exponential backoff: 1m, 5m, 20m, 1h, 4h
  const backoffMinutes = [1, 5, 20, 60, 240];
  const backoff = backoffMinutes[Math.min(attemptNumber - 1, backoffMinutes.length - 1)];
  const nextRetryAt = retryable ? new Date(Date.now() + backoff * 60 * 1000) : null;

  console.error(`[publisher] markFailed: ${publicationId}`, { errorCode, errorMessage, retryable, nextRetryAt });

  // TODO: UPDATE smm_publications SET status, last_error_code, last_error_message, next_retry_at, attempt_count
  // TODO: INSERT smm_publication_attempts with result='failure', safe_error_message
  // TODO: If !retryable, notify post author
}

async function markCanceled(_db: DbClient, publicationId: string, reason: string): Promise<void> {
  console.log(`[publisher] markCanceled: ${publicationId} — ${reason}`);
  // TODO: UPDATE smm_publications SET status = 'canceled'
}
