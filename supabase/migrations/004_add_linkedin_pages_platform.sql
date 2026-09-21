-- Migration 004: Add 'linkedin-pages' to platform check constraints
-- 'linkedin-pages' was used in the app code but missing from DB constraints,
-- causing any attempt to save a LinkedIn Pages connection to fail with a
-- check constraint violation.

-- ─── smm_oauth_connections ──────────────────────────────────────────────────────
alter table smm_oauth_connections
  drop constraint smm_oauth_connections_platform_check;

alter table smm_oauth_connections
  add constraint smm_oauth_connections_platform_check
  check (platform in ('facebook','instagram','linkedin','linkedin-pages','tiktok','x','youtube','pinterest','threads'));

-- ─── smm_social_destinations ───────────────────────────────────────────────────
alter table smm_social_destinations
  drop constraint smm_social_destinations_platform_check;

alter table smm_social_destinations
  add constraint smm_social_destinations_platform_check
  check (platform in ('facebook','instagram','linkedin','linkedin-pages','tiktok','x','youtube','pinterest','threads'));
