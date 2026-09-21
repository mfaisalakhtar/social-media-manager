-- Migration 003: Add password_hash column to smm_users
-- Required for custom JWT auth (no Supabase Auth).
-- Users sign up via /api/auth/signup which bcrypt-hashes the password into this column.
--
-- Target project: owouboeepeogewtylsbl (Social-app-manager, akhtarfaisal41@gmail.com)

ALTER TABLE smm_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;
