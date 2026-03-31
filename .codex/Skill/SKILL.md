---
name: ryex-qa-guardrails
description: Run simple, high-signal QA for RYEX auth and market flows with reproducible evidence. Use when changing `src/app/api/v1/*`, `src/server/auth/*`, `src/features/auth/*`, `src/features/market/*`, Supabase/Firebase integration, or before FE/BE handoff and release checks.
---

# RYEX QA Guardrails

## Overview

Execute a minimal QA flow that catches most regressions early for this repo.
Prioritize auth session integrity, error-code contract stability, and market realtime reliability.

## QA Mode

1. Start from risk-first scope:
- Auth route/session/callback changes: run full auth critical path.
- Market/realtime changes: run market critical path.
- Mixed changes: run both packs.

2. Keep run order fixed:
- `Gate A`: setup/build sanity.
- `Gate B`: feature critical path.
- `Gate C`: security and contract checks.
- `Gate D`: evidence report.

3. Fail fast:
- Stop and report immediately on blocker or data/environment mismatch.
- Do not hide blocked cases inside "pass" summary.

## Gate A - Setup Sanity

Run in this order:
1. `npm run build`
2. If DB/Supabase touched: `npm run db:verify` then `npm run db:test`
3. If signup/session touched: `npm run db:debug`

Mark each item as `PASS | FAIL | BLOCKED`.

## Gate B - Auth Critical Path

Run this pack whenever auth/login/signup/callback/session code changes.

1. Signup contract:
- `POST /api/v1/auth/signup`
- Validate: missing input `AUTH_INVALID_INPUT`, weak password `AUTH_PASSWORD_POLICY_FAILED`, happy path `201`.

2. Verify callback contract:
- `GET /api/v1/auth/verify-email/callback`
- Validate: missing `oobCode` -> `AUTH_INVALID_INPUT`; invalid code -> `AUTH_VERIFICATION_LINK_INVALID`; expired -> `AUTH_VERIFICATION_LINK_EXPIRED`.

3. Session sync contract:
- `POST /api/v1/auth/session/sync`
- Validate: missing token -> `AUTH_INVALID_INPUT`; invalid token -> `AUTH_INVALID_TOKEN`; unverified email -> `AUTH_EMAIL_NOT_VERIFIED`; valid flow -> `200`.
- Confirm response sets `ryex_session_ref` cookie and `HttpOnly`, `SameSite=Lax`, `Secure` by env.

4. Logout contract:
- `POST /api/v1/auth/logout`
- Validate: `204` and auth cookies cleared.

5. FE callback bridge:
- Validate `/app/auth/verify-email/callback` still does verify -> token sync -> redirect `/app/market`.
- Validate error messages map from `error.code` and do not collapse to generic success/fallback.

## Gate B2 - Market Critical Path

Run this pack whenever market API, ticker normalization, pagination, or icon mapping changes.

1. API stability:
- `GET /api/v1/market/tickers` returns `200`, `data[]`, `fetchedAt`, `stale`.
- Upstream failure path returns stale cache when available; otherwise fails with service error.

2. Client realtime behavior:
- Validate refresh interval from `NEXT_PUBLIC_MARKET_REFRESH_MS` or fallback.
- Validate UI can render when `marketMeta.error` or `stale=true`.

3. Pagination/search behavior:
- Validate page reset on search term change.
- Validate bounds when data size shrinks.

4. Token icon integrity:
- Keep `h-6 w-6 rounded-full` and transparent wrapper.
- Confirm unknown symbols still render fallback mark.

## Gate C - Security and Contract Guardrails

1. Never expose secrets in client code:
- `SUPABASE_SERVICE_ROLE_KEY`, private Firebase keys, raw tokens.

2. Keep FE/BE error contract consistent:
- Prefer `error.code` mapping over HTTP text parsing.

3. Keep QA scope strict:
- Do not include unrelated UI refactor as QA output.

## Gate D - QA Evidence Report

Always return:
1. Scope tested (files/routes changed).
2. Test matrix summary: `PASS / FAIL / BLOCKED`.
3. Defects by severity with reproducible steps.
4. Residual risks and explicit unblock conditions.
5. Recommended release status: `GO`, `CONDITIONAL GO`, or `NO-GO`.

Use and update [qa-living-matrix.md](references/qa-living-matrix.md) after each significant auth/market change.
