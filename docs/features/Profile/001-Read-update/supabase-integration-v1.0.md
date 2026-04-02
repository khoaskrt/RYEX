# Supabase Integration Notes (v1.0)

## 1) Data detected from current app flows

### User identity/profile data
- `id` (internal UUID)
- `user_id` (Supabase Auth user id, from `auth.users.id`)
- `email`
- `display_name`
- `avatar_url`
- `status` (`active|locked|disabled`)
- `created_at`
- `updated_at`
- `last_login_at`
- `deleted_at` (optional soft-delete marker)

### User-owned market item data
- `id`
- `user_id` (owner)
- `symbol` (e.g. `BTCUSDT`)
- `label` (optional)
- `sort_order`
- `created_at`
- `updated_at`

### Existing auth/session/audit traces already persisted in project
- `auth_identities`
- `auth_verification_events`
- `auth_login_events`
- `user_sessions`
- `trusted_devices`
- `audit_events`

## 2) SQL source for copy-paste
- `db/migrations/006_profile_and_watchlist_supabase_auth.sql`

This migration creates:
- `public.profiles`
- `public.user_watchlist_items`
- RLS enabled on both tables with `auth.uid() = user_id` policies for `SELECT/INSERT/UPDATE/DELETE`.

## 3) Supabase CRUD code source
- `src/shared/lib/supabase/profileCrud.js`

Provided functions:
- Load:
  - `loadCurrentUserProfile`
  - `loadWatchlistItems`
- Create:
  - `createCurrentUserProfile`
  - `createWatchlistItem`
- Update:
  - `updateCurrentUserProfile`
  - `updateWatchlistItem`
- Delete:
  - `deleteCurrentUserProfile`
  - `deleteWatchlistItem`

## 4) Existing component wired to real Supabase CRUD
- `src/app/(webapp)/app/users/page.js`

The page now:
- loads profile from Supabase with current authenticated user
- creates profile row if missing
- updates profile display name
- deletes profile row

## 5) API route updated for Supabase Auth + RLS
- `src/app/api/v1/user/profile/route.js`

Now supports:
- `GET /api/v1/user/profile` (load)
- `POST /api/v1/user/profile` (create/upsert)
- `PATCH /api/v1/user/profile` (update)
- `DELETE /api/v1/user/profile` (delete)
