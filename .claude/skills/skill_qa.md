---
name: ryex-qa-skill
description: QA execution skill for RYEX. Run fast, risk-first checks for auth, market realtime, and core profile APIs with clear PASS/FAIL/BLOCKED evidence.
---

# RYEX QA Skill (Simple + Optimized) — v1

## 1) Project Context (Must Keep in Mind)
- Stack: Next.js App Router + Route Handlers (`src/app/api/v1/*`) + domain services (`src/server/*`) + feature modules (`src/features/*`).
- Business-critical flows:
1. Auth signup -> verify callback -> session sync -> market redirect.
2. Market realtime fetch with stale-cache fallback.
3. User profile read/update via authenticated API.

## 2) Non-Negotiable QA Rules
1. Risk-first, not file-count-first:
- If auth/session/callback touched, always run Auth Pack.
- If market/ticker/client pagination touched, always run Market Pack.
- If both touched, run both packs.

2. Contract-first verification:
- Verify status code + response shape + `error.code`.
- Do not accept "works on UI" if API contract is broken.

3. Fail fast and classify clearly:
- Every case must end with `PASS`, `FAIL`, or `BLOCKED`.
- `BLOCKED` only for env/data/tooling blockers, never for logic defects.

4. No scope creep during QA:
- Report only behavior in changed scope + directly affected integrations.
- Avoid mixing unrelated UI polish/refactor into QA conclusion.

5. Evidence must be reproducible:
- Include route/page tested, input, actual output, and expected output.

## 3) Optimized QA Flow
### Gate A - Build + Environment Sanity
1. Run `npm run build`.
2. If auth/db touched: run `npm run db:verify`.
3. Mark each as `PASS | FAIL | BLOCKED`.

### Gate B - Auth Pack (P0)
1. `POST /api/v1/auth/signup`
- Missing input -> `400 AUTH_INVALID_INPUT`.
- Weak password -> `422 AUTH_PASSWORD_POLICY_FAILED`.

2. `GET /api/v1/auth/verify-email/callback`
- Missing `oobCode` -> `400 AUTH_INVALID_INPUT`.
- Invalid code -> `400 AUTH_VERIFICATION_LINK_INVALID`.
- Expired code -> `410 AUTH_VERIFICATION_LINK_EXPIRED`.

3. `POST /api/v1/auth/session/sync`
- Missing `idToken` -> `400 AUTH_INVALID_INPUT`.
- Invalid token -> `401 AUTH_INVALID_TOKEN`.
- Unverified email -> `403 AUTH_EMAIL_NOT_VERIFIED`.
- Valid flow -> `200` + session cookie `ryex_session_ref`.

4. `POST /api/v1/auth/logout`
- Expect `204` + auth cookies cleared.

5. FE verify bridge
- Route `/app/auth/verify-email/callback` still performs:
1. verify email API
2. token sync API
3. redirect `/app/market`
- Error mapping must use `error.code`, not generic fallback only.

### Gate C - Market Pack (P0)
1. `GET /api/v1/market/tickers` happy path:
- `200`, has `data[]`, `fetchedAt`, `stale`.

2. Upstream degraded path:
- If cache exists: still returns payload with `stale: true`.
- If cache missing: returns service error (expected 503 path).

3. Client realtime:
- Refresh interval respects `NEXT_PUBLIC_MARKET_REFRESH_MS` fallback.
- UI remains stable when `marketMeta.error` is set.

4. Search + pagination:
- Search term change resets page to 1.
- Current page clamps when filtered result shrinks.

5. Token icon fallback:
- Unknown symbol still renders fallback mark and does not crash row.

### Gate D - User Profile Pack (P1, run when user API touched)
1. `GET /api/v1/user/profile`
- Missing bearer token -> `401`.
- Valid token + existing user -> `200` with normalized `user` object.

2. `PATCH /api/v1/user/profile`
- Missing bearer token -> `401`.
- Valid token + valid payload -> `200` with updated `displayName`.

## 4) Standard QA Output
- Scope tested.
- Matrix summary (`PASS/FAIL/BLOCKED`).
- Defects list (severity + repro steps).
- Residual risks + unblock conditions.
- Release recommendation: `GO | CONDITIONAL GO | NO-GO`.

## 5) Living Expansion Protocol
When a bug/incident happens:
1. Add 1 minimal repro case to `.codex/Rule/qa-living-matrix.md`.
2. Add 1 nearby negative case for the same area.
3. Record date and changed files touched by fix.
