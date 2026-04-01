# RYEX QA Living Matrix

## 1) Use This File

Use this as the single place to grow QA coverage over time.
Append new cases after each bugfix, feature, or production incident.

## 2) Baseline Packs

### Auth Pack (P0)

| ID | Flow | Expected |
|---|---|---|
| AUTH-01 | `POST /api/v1/auth/signup` with empty body | `400 AUTH_INVALID_INPUT` |
| AUTH-02 | `POST /api/v1/auth/signup` with weak password | `422 AUTH_PASSWORD_POLICY_FAILED` |
| AUTH-03 | `GET /api/v1/auth/verify-email/callback` without `token_hash` or `type` | `400 AUTH_INVALID_INPUT` |
| AUTH-04 | `GET /api/v1/auth/verify-email/callback?token_hash=INVALID&type=signup` | `400 AUTH_VERIFICATION_LINK_INVALID` |
| AUTH-05 | `GET /api/v1/auth/verify-email/callback` with expired code | `410 AUTH_VERIFICATION_LINK_EXPIRED` |
| AUTH-06 | `POST /api/v1/auth/session/sync` without `accessToken` | `400 AUTH_INVALID_INPUT` |
| AUTH-07 | `POST /api/v1/auth/session/sync` with invalid token | `401 AUTH_INVALID_TOKEN` |
| AUTH-08 | `POST /api/v1/auth/session/sync` with unverified email | `403 AUTH_EMAIL_NOT_VERIFIED` |
| AUTH-09 | `POST /api/v1/auth/logout` after active session | `204` and cleared auth cookies |

### Market Pack (P0)

| ID | Flow | Expected |
|---|---|---|
| MKT-01 | `GET /api/v1/market/tickers` happy path | `200` with `data[]` and `fetchedAt` |
| MKT-02 | Upstream temporary fail with warm cache | Response stays usable with `stale=true` |
| MKT-03 | Upstream fail with cold cache | API returns service error (`503` path) |
| MKT-04 | Search term change on market page | Pagination resets to page 1 |
| MKT-05 | Filter result shrinks while viewing higher page | Current page is clamped safely |
| MKT-06 | Unknown symbol row render | Fallback mark still visible; no crash |

### User Pack (P1)

| ID | Flow | Expected |
|---|---|---|
| USER-01 | `GET /api/v1/user/profile` without bearer token | `401` |
| USER-02 | `GET /api/v1/user/profile` with valid token | `200` with normalized `user` object |
| USER-03 | `PATCH /api/v1/user/profile` without bearer token | `401` |
| USER-04 | `PATCH /api/v1/user/profile` with valid token and `displayName` | `200` and updated `displayName` |

## 3) Regression Add Rule

When a defect is found:
1. Add one minimal reproduction test case.
2. Add one nearby negative case.
3. Link to fix PR/commit, date, and primary changed files.

## 4) Run Log Template

Copy this block per run:

```md
### QA Run - YYYY-MM-DD
- Scope:
- Build Gate:
- Auth Pack: PASS/FAIL/BLOCKED
- Market Pack: PASS/FAIL/BLOCKED
- User Pack: PASS/FAIL/BLOCKED
- Defects:
- Risks:
- Recommendation: GO / CONDITIONAL GO / NO-GO
```

## 5) Defect Backlog (Append Only)

| Date | Case ID | Area | Severity | Repro Summary | Expected | Actual | Fix Ref | Changed Files |
|---|---|---|---|---|---|---|---|---|
