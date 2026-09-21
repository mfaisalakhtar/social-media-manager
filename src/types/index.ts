// ─── Enums ────────────────────────────────────────────────────────────────────

export type Platform = "facebook" | "instagram" | "linkedin" | "tiktok" | "x" | "threads" | "youtube" | "pinterest";

export type Role = "owner" | "admin" | "editor" | "approver" | "viewer";

export type PostStatus =
  | "draft"
  | "pending_approval"
  | "changes_requested"
  | "approved"
  | "scheduled"
  | "publishing"
  | "partially_published"
  | "published"
  | "failed"
  | "canceled";

export type PublicationStatus =
  | "draft"
  | "validated"
  | "queued"
  | "processing"
  | "published"
  | "retry_scheduled"
  | "failed"
  | "canceled";

export type WorkspaceStatus = "active" | "archived";

export type ConnectionStatus = "active" | "expired" | "revoked" | "disconnected";

export type MediaStatus = "processing" | "ready" | "error";

export type NotificationType =
  | "approval_requested"
  | "post_approved"
  | "post_rejected"
  | "publication_succeeded"
  | "publication_failed"
  | "connection_expired";

// ─── Core entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  timezone: string; // e.g. "Asia/Karachi"
  approval_required: boolean;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface OAuthConnection {
  id: string;
  workspace_id: string;
  platform: Platform;
  authorized_by_user_id: string;
  external_user_id: string;
  // encrypted_access_token and encrypted_refresh_token never leave the server
  token_expires_at: string | null;
  granted_scopes: string[];
  status: ConnectionStatus;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialDestination {
  id: string;
  workspace_id: string;
  oauth_connection_id: string;
  platform: Platform;
  external_destination_id: string;
  destination_type: "page" | "profile" | "organization" | "channel";
  display_name: string;
  username: string | null;
  profile_image_url: string | null;
  metadata_json: Record<string, unknown>;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  workspace_id: string;
  uploaded_by_user_id: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  content_hash: string;
  alt_text: string | null;
  status: MediaStatus;
  created_at: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  author_user_id: string;
  common_caption: string;
  link_url: string | null;
  status: PostStatus;
  scheduled_at_utc: string | null;
  timezone_at_scheduling: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostMedia {
  post_id: string;
  media_asset_id: string;
  sort_order: number;
}

export interface PostVariation {
  id: string;
  post_id: string;
  social_destination_id: string;
  platform: Platform;
  caption: string | null; // null = use common_caption
  link_url: string | null;
  settings_json: Record<string, unknown>;
  validation_status: "pending" | "valid" | "invalid";
  validation_errors_json: ValidationError[];
  created_at: string;
  updated_at: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface VariationMedia {
  post_variation_id: string;
  media_asset_id: string;
  sort_order: number;
  platform_transform_json: Record<string, unknown>;
}

export interface Publication {
  id: string;
  post_variation_id: string;
  status: PublicationStatus;
  scheduled_at_utc: string | null;
  attempt_count: number;
  next_retry_at: string | null;
  idempotency_key: string;
  external_post_id: string | null;
  external_post_url: string | null;
  published_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  sanitized_response_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PublicationAttempt {
  id: string;
  publication_id: string;
  attempt_number: number;
  started_at: string;
  finished_at: string | null;
  result: "success" | "failure" | "pending";
  http_status: number | null;
  platform_error_code: string | null;
  safe_error_message: string | null;
  request_reference: string | null;
}

export interface ApprovalComment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface MetricSnapshot {
  id: string;
  publication_id: string;
  captured_at: string;
  raw_metrics_json: Record<string, unknown>;
  impressions: number | null;
  reach: number | null;
  reactions: number | null;
  comments: number | null;
  shares: number | null;
  clicks: number | null;
  video_views: number | null;
}

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  workspace_id: string | null;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  safe_metadata_json: Record<string, unknown>;
  ip_address_hash: string | null;
  created_at: string;
}
