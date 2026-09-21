# Social Media Manager — Developer & AI Guide

## ⚠️ SUPABASE — READ THIS FIRST

This app uses a **DEDICATED** Supabase project. Never use any other project.

| Key | Value |
|-----|-------|
| Account | akhtarfaisal41@gmail.com |
| Project name | Social-app-manager |
| Project ID | `owouboeepeogewtylsbl` |
| Region | ap-south-1 (Mumbai) |
| Dashboard | https://supabase.com/dashboard/project/owouboeepeogewtylsbl |

**FORBIDDEN — do not use these projects for this app:**
- `sisuhoxslgjlwjhtxhdu` — Amir's ERP (cis-shared-erp, Seoul)
- `drucdqpprydmkiwtamul` — Faisal's ERP (Singapore)

Any migration, SQL query, table creation, or schema change must target **`owouboeepeogewtylsbl`** only.

---

## Authentication

This app does **NOT** use Supabase Auth. It uses a fully custom system:

- Users are stored in `smm_users` table (`password_hash` column, bcrypt 12 rounds)
- Sessions are 30-day JWTs signed with `SMM_JWT_SECRET` env var
- Cookie name: `smm_session` (httpOnly, Secure in production)
- JWT sign/verify: `src/lib/session.ts` using the `jose` library
- User lookup: `src/lib/auth.ts` → `getUser()` function

**Never** call `supabase.auth.getUser()` or `supabase.auth.signIn()` anywhere in this codebase.

---

## Database Migrations

Migrations live in `supabase/migrations/`. To apply to the production project, run them in the Supabase SQL Editor at:
https://supabase.com/dashboard/project/owouboeepeogewtylsbl/sql/new

Run in order:
1. `001_initial_schema.sql` — all smm_* tables
2. `002_fix_oauth_constraints.sql` — platform check constraint fix
3. `003_add_password_hash.sql` — adds `password_hash` column to smm_users

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in values.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` — must be `https://owouboeepeogewtylsbl.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key for `owouboeepeogewtylsbl`
- `SUPABASE_SERVICE_ROLE_KEY` — service role key for `owouboeepeogewtylsbl`
- `SMM_JWT_SECRET` — secret for signing session JWTs (generate: `openssl rand -base64 48`)
- `TOKEN_ENCRYPTION_KEY` — 64 hex chars for encrypting OAuth tokens (generate: `openssl rand -hex 32`)

---

## Vercel Deployment

- **Project**: social-media-manager (Codeink Studio org)
- **Live URL**: https://social.codeinkstudio.com
- **Account**: akhtarfaisal41@gmail.com

---

## Stack

- Next.js 15 App Router (TypeScript)
- Supabase (Postgres + Storage) — project `owouboeepeogewtylsbl`
- Custom JWT auth (no Supabase Auth)
- Tailwind CSS
- `jose` (JWT), `bcryptjs` (password hashing), `zod` (validation)
