-- Migration 002: Fix OAuth connection constraints
-- 1. Add unique constraint so upsert ON CONFLICT actually works
-- 2. Add 'threads' to the platform check constraints (was missing from initial schema)

-- ─── smm_oauth_connections ──────────────────────────────────────────────────────

-- Drop the old non-unique index (replaced by the unique constraint below)
drop index if exists smm_oauth_connections_workspace_platform;

-- Each (workspace, platform, external_user_id) must be unique so ON CONFLICT upserts work.
-- For Facebook pages: external_user_id = page.id (one row per page, not one row per FB user)
-- For Instagram / LinkedIn / X: external_user_id = the account's own platform ID
alter table smm_oauth_connections
  add constraint smm_oauth_connections_workspace_platform_user_unique
  unique (workspace_id, platform, external_user_id);

-- Re-add a plain index for fast lookups by workspace+platform
create index smm_oauth_connections_workspace_platform
  on smm_oauth_connections(workspace_id, platform);

-- Add 'threads' to the allowed platform values
alter table smm_oauth_connections
  drop constraint smm_oauth_connections_platform_check;

alter table smm_oauth_connections
  add constraint smm_oauth_connections_platform_check
  check (platform in ('facebook','instagram','linkedin','tiktok','x','youtube','pinterest','threads'));

-- ─── smm_social_destinations ───────────────────────────────────────────────────

-- Add 'threads' to the allowed platform values here too
alter table smm_social_destinations
  drop constraint smm_social_destinations_platform_check;

alter table smm_social_destinations
  add constraint smm_social_destinations_platform_check
  check (platform in ('facebook','instagram','linkedin','tiktok','x','youtube','pinterest','threads'));
