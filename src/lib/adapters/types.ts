import type { Platform } from "@/types";

export interface AuthorizationInput {
  workspaceId: string;
  redirectUri: string;
  state: string; // CSRF token, stored in session
  codeChallenge?: string; // PKCE
}

export interface OAuthCallbackInput {
  code: string;
  state: string;
  redirectUri: string;
  codeVerifier?: string; // PKCE
}

export interface TokenResult {
  accessToken: string; // plaintext — caller must encrypt before storing
  refreshToken?: string;
  expiresAt?: Date;
  grantedScopes: string[];
  externalUserId: string;
}

export interface AdapterDestination {
  externalId: string;
  displayName: string;
  username?: string;
  profileImageUrl?: string;
  destinationType: "page" | "profile" | "organization" | "channel";
  platform: Platform;
  metadata?: Record<string, unknown>;
}

export interface PlatformPostInput {
  publicationId: string;
  idempotencyKey: string;
  platform: Platform;
  destinationExternalId: string;
  /** Decrypted access token — never log this */
  accessToken: string;
  caption: string;
  linkUrl?: string;
  mediaUrls?: string[]; // signed URLs, short-lived
  altText?: string;
  settings?: Record<string, unknown>;
}

export interface PlatformValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: PlatformValidationError[];
}

export interface PublishResult {
  externalPostId: string;
  externalPostUrl?: string;
  /** Sanitized platform response — no tokens, no PII beyond what is needed */
  sanitizedResponse: Record<string, unknown>;
}

export interface StatusInput {
  externalPostId: string;
  accessToken: string;
  platform: Platform;
  destinationExternalId: string;
}

export interface PlatformPostStatus {
  externalPostId: string;
  isLive: boolean;
  isDeleted: boolean;
  rawStatus?: string;
}

export interface MetricsInput {
  externalPostId: string;
  accessToken: string;
  platform: Platform;
  destinationExternalId: string;
}

export interface PlatformMetrics {
  impressions?: number;
  reach?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  videoViews?: number;
  raw: Record<string, unknown>;
}

export interface DeleteInput {
  externalPostId: string;
  accessToken: string;
  platform: Platform;
  destinationExternalId: string;
}

export interface DeleteResult {
  deleted: boolean;
}

// ─── Adapter interface ─────────────────────────────────────────────────────────

export interface SocialPlatformAdapter {
  /** Returns the OAuth authorization URL to redirect the user to */
  getAuthorizationUrl(input: AuthorizationInput): Promise<string>;

  /** Exchanges the auth code for tokens. Caller must encrypt tokens before storing. */
  exchangeAuthorizationCode(input: OAuthCallbackInput): Promise<TokenResult>;

  /** Refreshes the access token using the stored (decrypted) refresh token */
  refreshAccessToken(connectionId: string): Promise<TokenResult>;

  /** Lists all pages/accounts/organizations the authorized user can manage */
  listDestinations(connectionId: string): Promise<AdapterDestination[]>;

  /** Validates a post against current platform rules before publishing */
  validatePost(input: PlatformPostInput): Promise<ValidationResult>;

  /** Publishes the post. Must be idempotent via idempotencyKey. */
  publishPost(input: PlatformPostInput): Promise<PublishResult>;

  /** Checks whether a previously published post is still live */
  getPostStatus(input: StatusInput): Promise<PlatformPostStatus>;

  /** Fetches engagement metrics for a published post */
  getPostMetrics(input: MetricsInput): Promise<PlatformMetrics>;

  /** Optional: delete a published post on the platform */
  deletePost?(input: DeleteInput): Promise<DeleteResult>;
}
