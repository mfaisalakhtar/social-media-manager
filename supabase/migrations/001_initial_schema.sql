-- Social Media Manager — Initial Schema
-- All tables are prefixed smm_ to avoid conflicts
-- Run: supabase db push (or psql -f this file)

-- ─── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Users ─────────────────────────────────────────────────────────────────────
create table smm_users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Organizations ─────────────────────────────────────────────────────────────
create table smm_organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_user_id uuid not null references smm_users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table smm_organization_members (
  organization_id uuid not null references smm_organizations(id) on delete cascade,
  user_id         uuid not null references smm_users(id) on delete cascade,
  role            text not null check (role in ('owner','admin','editor','approver','viewer')),
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- ─── Workspaces ────────────────────────────────────────────────────────────────
create table smm_workspaces (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references smm_organizations(id) on delete cascade,
  name              text not null,
  slug              text not null,
  logo_url          text,
  website_url       text,
  timezone          text not null default 'Asia/Karachi',
  approval_required boolean not null default true,
  status            text not null default 'active' check (status in ('active','archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (organization_id, slug)
);

create table smm_workspace_members (
  workspace_id uuid not null references smm_workspaces(id) on delete cascade,
  user_id      uuid not null references smm_users(id) on delete cascade,
  role         text not null check (role in ('owner','admin','editor','approver','viewer')),
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ─── OAuth Connections ─────────────────────────────────────────────────────────
create table smm_oauth_connections (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references smm_workspaces(id) on delete cascade,
  platform              text not null check (platform in ('facebook','instagram','linkedin','tiktok','x','youtube','pinterest')),
  authorized_by_user_id uuid not null references smm_users(id),
  external_user_id      text not null,
  -- Tokens encrypted at application level before INSERT — never store plaintext
  encrypted_access_token  text not null,
  encrypted_refresh_token text,
  token_expires_at      timestamptz,
  granted_scopes        text[] not null default '{}',
  status                text not null default 'active' check (status in ('active','expired','revoked','disconnected')),
  last_verified_at      timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index smm_oauth_connections_workspace_platform on smm_oauth_connections(workspace_id, platform);

-- ─── Social Destinations ───────────────────────────────────────────────────────
create table smm_social_destinations (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references smm_workspaces(id) on delete cascade,
  oauth_connection_id   uuid not null references smm_oauth_connections(id),
  platform              text not null check (platform in ('facebook','instagram','linkedin','tiktok','x','youtube','pinterest')),
  external_destination_id text not null,
  destination_type      text not null check (destination_type in ('page','profile','organization','channel')),
  display_name          text not null,
  username              text,
  profile_image_url     text,
  metadata_json         jsonb not null default '{}',
  status                text not null default 'active' check (status in ('active','expired','revoked','disconnected')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- A given external destination can only be connected once per organization
  unique (platform, external_destination_id, workspace_id)
);

-- ─── Media Assets ──────────────────────────────────────────────────────────────
create table smm_media_assets (
  id                   uuid primary key default gen_random_uuid(),
  workspace_id         uuid not null references smm_workspaces(id) on delete cascade,
  uploaded_by_user_id  uuid not null references smm_users(id),
  storage_key          text not null,
  original_filename    text not null,
  mime_type            text not null,
  size_bytes           bigint not null,
  width                integer,
  height               integer,
  duration_seconds     numeric,
  content_hash         text not null,
  alt_text             text,
  status               text not null default 'processing' check (status in ('processing','ready','error')),
  created_at           timestamptz not null default now(),
  -- Prevent duplicate uploads within the same workspace
  unique (workspace_id, content_hash)
);

create index smm_media_assets_workspace on smm_media_assets(workspace_id, created_at desc);

-- ─── Posts ─────────────────────────────────────────────────────────────────────
create table smm_posts (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null references smm_workspaces(id) on delete cascade,
  author_user_id        uuid not null references smm_users(id),
  common_caption        text not null default '',
  link_url              text,
  status                text not null default 'draft' check (status in (
    'draft','pending_approval','changes_requested','approved',
    'scheduled','publishing','partially_published','published','failed','canceled'
  )),
  scheduled_at_utc      timestamptz,
  timezone_at_scheduling text,
  submitted_at          timestamptz,
  approved_at           timestamptz,
  approved_by_user_id   uuid references smm_users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index smm_posts_workspace_status on smm_posts(workspace_id, status, scheduled_at_utc);

create table smm_post_media (
  post_id        uuid not null references smm_posts(id) on delete cascade,
  media_asset_id uuid not null references smm_media_assets(id),
  sort_order     integer not null default 0,
  primary key (post_id, media_asset_id)
);

-- ─── Post Variations (per platform) ────────────────────────────────────────────
create table smm_post_variations (
  id                      uuid primary key default gen_random_uuid(),
  post_id                 uuid not null references smm_posts(id) on delete cascade,
  social_destination_id   uuid not null references smm_social_destinations(id),
  platform                text not null,
  caption                 text, -- null means use post.common_caption
  link_url                text,
  settings_json           jsonb not null default '{}',
  validation_status       text not null default 'pending' check (validation_status in ('pending','valid','invalid')),
  validation_errors_json  jsonb not null default '[]',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (post_id, social_destination_id)
);

create table smm_variation_media (
  post_variation_id      uuid not null references smm_post_variations(id) on delete cascade,
  media_asset_id         uuid not null references smm_media_assets(id),
  sort_order             integer not null default 0,
  platform_transform_json jsonb not null default '{}',
  primary key (post_variation_id, media_asset_id)
);

-- ─── Publications ──────────────────────────────────────────────────────────────
create table smm_publications (
  id                      uuid primary key default gen_random_uuid(),
  post_variation_id       uuid not null references smm_post_variations(id) on delete cascade,
  status                  text not null default 'draft' check (status in (
    'draft','validated','queued','processing','published','retry_scheduled','failed','canceled'
  )),
  scheduled_at_utc        timestamptz,
  attempt_count           integer not null default 0,
  next_retry_at           timestamptz,
  idempotency_key         text not null unique,
  external_post_id        text,
  external_post_url       text,
  published_at            timestamptz,
  last_error_code         text,
  last_error_message      text,
  sanitized_response_json jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Worker queries this index to find due jobs
create index smm_publications_due on smm_publications(status, scheduled_at_utc)
  where status in ('queued', 'retry_scheduled');

create table smm_publication_attempts (
  id                   uuid primary key default gen_random_uuid(),
  publication_id       uuid not null references smm_publications(id) on delete cascade,
  attempt_number       integer not null,
  started_at           timestamptz not null default now(),
  finished_at          timestamptz,
  result               text check (result in ('success','failure','pending')),
  http_status          integer,
  platform_error_code  text,
  safe_error_message   text,
  request_reference    text
);

-- ─── Approval Comments ─────────────────────────────────────────────────────────
create table smm_approval_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references smm_posts(id) on delete cascade,
  user_id    uuid not null references smm_users(id),
  comment    text not null,
  created_at timestamptz not null default now()
);

-- ─── Metric Snapshots ──────────────────────────────────────────────────────────
create table smm_metric_snapshots (
  id              uuid primary key default gen_random_uuid(),
  publication_id  uuid not null references smm_publications(id) on delete cascade,
  captured_at     timestamptz not null default now(),
  raw_metrics_json jsonb not null default '{}',
  impressions     bigint,
  reach           bigint,
  reactions       bigint,
  comments        bigint,
  shares          bigint,
  clicks          bigint,
  video_views     bigint
);

-- ─── Notifications ─────────────────────────────────────────────────────────────
create table smm_notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references smm_users(id) on delete cascade,
  workspace_id uuid references smm_workspaces(id) on delete cascade,
  type         text not null check (type in (
    'approval_requested','post_approved','post_rejected',
    'publication_succeeded','publication_failed','connection_expired'
  )),
  title        text not null,
  message      text not null,
  entity_type  text,
  entity_id    uuid,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index smm_notifications_user_unread on smm_notifications(user_id, created_at desc)
  where read_at is null;

-- ─── Audit Log ─────────────────────────────────────────────────────────────────
create table smm_audit_logs (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid references smm_organizations(id),
  workspace_id      uuid references smm_workspaces(id),
  actor_user_id     uuid references smm_users(id),
  action            text not null, -- e.g. "post:published", "connection:connected"
  entity_type       text not null,
  entity_id         uuid,
  -- NEVER store tokens, secrets, or sensitive data in this column
  safe_metadata_json jsonb not null default '{}',
  ip_address_hash   text, -- hashed, not stored in plain
  created_at        timestamptz not null default now()
);

create index smm_audit_logs_workspace on smm_audit_logs(workspace_id, created_at desc);
create index smm_audit_logs_org on smm_audit_logs(organization_id, created_at desc);

-- ─── Updated_at trigger helper ─────────────────────────────────────────────────
create or replace function smm_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables that have updated_at
create trigger smm_users_updated_at before update on smm_users for each row execute function smm_set_updated_at();
create trigger smm_organizations_updated_at before update on smm_organizations for each row execute function smm_set_updated_at();
create trigger smm_workspaces_updated_at before update on smm_workspaces for each row execute function smm_set_updated_at();
create trigger smm_oauth_connections_updated_at before update on smm_oauth_connections for each row execute function smm_set_updated_at();
create trigger smm_social_destinations_updated_at before update on smm_social_destinations for each row execute function smm_set_updated_at();
create trigger smm_posts_updated_at before update on smm_posts for each row execute function smm_set_updated_at();
create trigger smm_post_variations_updated_at before update on smm_post_variations for each row execute function smm_set_updated_at();
create trigger smm_publications_updated_at before update on smm_publications for each row execute function smm_set_updated_at();
