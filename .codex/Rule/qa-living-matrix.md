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
| 2026-04-01 | DEP-01 | Dependency / Supabase | High | Run `npm run dev`, open `/app/profile` with `@supabase/auth-js@2.101.1` pulled transitively. | App compiles and `/app/profile` returns `200`. | Build fails with `Module not found: Can't resolve './lib/fetch'` from `GoTrueAdminApi.js`, page returns `500`. | Local patch (uncommitted) | `package.json`, `package-lock.json` |
| 2026-04-01 | DEP-02 | Dependency / Supabase | Medium | After downgrading to `@supabase/supabase-js@2.100.0`, run `npm run dev` and open `/app/profile`. | `@supabase/auth-js/dist/*/lib/fetch.js` exists, route compiles without module resolution error. | PASS: route compiles and `/app/profile` returns `200`; no `./lib/fetch` error in logs. | Local patch (uncommitted) | `package.json`, `package-lock.json` |
| 2026-04-01 | AUTH-INC-01 | Auth Signup / Supabase Trigger | High | Submit signup from `/app/auth/signup` (or call `POST /auth/v1/signup` directly). | Signup creates auth user and returns success/expected validation errors. | Supabase returns `500 unexpected_failure: Database error saving new user`; app API returns `503 AUTH_PROVIDER_TEMPORARY_FAILURE`. | QA investigation 2026-04-01 | `.codex/Rule/qa-living-matrix.md` |
| 2026-04-01 | AUTH-INC-02 | Auth Signup / DB Drift | High | Inspect `auth.users` trigger function `public.handle_new_user()`. | Trigger inserts into current `public.users` schema (`supa_id` / `users_id` mapping) without runtime DB errors. | Function still inserts into legacy column `user_id`, causing signup transaction failure on `auth.users` insert. | QA investigation 2026-04-01 | `.codex/Rule/qa-living-matrix.md` |
| 2026-04-03 | WALLET-FE-01 | Withdraw FE Submit | High | Open `/app/withdraw`, fill valid form, click confirm once. | 1 click => 1 submit request to `POST /api/v1/wallet/withdraw`. | Button had both `type=\"submit\"` and `onClick`, risk duplicate submit path on single click. | FE integration fix 2026-04-03 | `src/features/withdraw/components/WithdrawSummaryCard.js`, `src/features/withdraw/WithdrawModulePage.js` |
| 2026-04-03 | WALLET-FE-02 | Withdraw FE Idempotency Guard | Medium | Trigger submit repeatedly via keyboard Enter + mouse click sequence on same form state. | Form submit pipeline remains single-source (`onSubmit`) to avoid duplicate event entry. | Before fix, mixed submit paths could bypass intended single entrypoint logic. | FE integration fix 2026-04-03 | `src/features/withdraw/components/WithdrawSummaryCard.js`, `src/features/withdraw/WithdrawModulePage.js` |

### QA Run - 2026-04-02
- Scope: Assets flow (`GET /api/v1/user/assets`) regression + release gate prep.
- Build Gate: PASS
- Auth Pack: PASS (assets unauthorized path covered via missing/invalid bearer)
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None in scoped cases.
- Risks: `ASSET-CT-06` remains BLOCKED (needs controlled fault-injection/sandbox).
- Recommendation: CONDITIONAL GO

### QA Run - 2026-04-02 (ASSET-CT-06 Closure)
- Scope: Close `ASSET-CT-06` using non-prod fault injection hook.
- Build Gate: PASS
- Auth Pack: PASS (assets unauthorized + forced error path)
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None in scoped cases.
- Risks: Keep non-prod guard for fault injection (`ASSET_QA_FAULT_INJECTION_ENABLED`).
- Recommendation: GO

### QA Run - 2026-04-03 (Wallet Contract Re-run)
- Scope: Wallet APIs contract matrix `WALLET-CT-01..16` sau BE processor + contract-shape fix.
- Build Gate: PASS
- Auth Pack: PASS (wallet unauthorized + auth token flows)
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None tren matrix/shape assertions (`16/16 PASS`, numeric-string PASS).
- Risks: E2E transfer on-chain that con BLOCKED do chua thuc hien tx testnet.
- Recommendation: CONDITIONAL GO

### QA Run - 2026-04-03 (Wallet Local Env Audit)
- Scope: Re-run matrix theo yeu cau ra soat do smooth/stable so voi plan wallet.
- Build Gate: PASS
- Auth Pack: N/A for this run
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: Wallet contract matrix FAIL (`4 PASS / 12 FAIL`) do `500 WALLET_ENV_INVALID` tren wallet POST routes.
- Risks: Env wallet keys thieu/sai format gay false-negative tren contract matrix va block release local.
- Recommendation: NO-GO (local env) cho den khi env dat entry criteria va re-run PASS.

### QA Run - 2026-04-03 (Wallet Stage 2 Contract Re-run)
- Scope: Stage 2 re-run matrix sau khi Stage 1 env unblock.
- Build Gate: PASS
- Auth Pack: N/A for this run
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None in scoped matrix.
- Risks: E2E on-chain real transfer van chua thuc hien (Stage 3 pending).
- Recommendation: CONDITIONAL GO.

### QA Run - 2026-04-03 (Wallet Stage 3 E2E Attempt)
- Scope: Chay Stage 3 E2E testnet full flow theo runbook `007`.
- Build Gate: PASS
- Auth Pack: N/A for this run
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None (khong phat hien logic defect trong phan da chay).
- Risks: BLOCKED tai Step 2 do thieu sender testnet funded + RPC evidence de tao tx hash that.
- Recommendation: CONDITIONAL GO (giu nguyen), can unblock infra/data de re-run Stage 3.

### QA Run - 2026-04-03 (Wallet Stage 3 E2E Re-run)
- Scope: Re-run Stage 3 sau khi provision sender env + RPC access.
- Build Gate: PASS
- Auth Pack: N/A for this run
- Market Pack: N/A for this run
- User Pack: N/A for this run
- Defects: None tren processor/internal flow (Step 1->7 PASS).
- Risks: Sender chua funded (`BNB=0`, USDT testnet chua cap), Step 2 dung tuple synthetic mode thay vi transfer on-chain that.
- Recommendation: CONDITIONAL GO (gate on-chain evidence van mo).

| 2026-04-03 | WALLET-ENV-01 | Wallet API Env | High | Run `node --env-file=.env scripts/run-wallet-matrix.mjs` tren local env hien tai. | Wallet APIs tra contract code theo matrix (`401/400/200/409`). | Nhieu case tra `500 WALLET_ENV_INVALID` vi `WALLET_ENCRYPTION_KEY` missing/invalid. | QA audit 2026-04-03 | `src/server/wallet/config.js`, `src/app/api/v1/wallet/deposit-address/route.js`, `src/app/api/v1/wallet/withdraw/route.js` |
| 2026-04-03 | WALLET-ENV-02 | Wallet Internal Processing Env | Medium | Kiem tra entry criteria E2E runbook wallet (`WALLET_INTERNAL_API_KEY`). | Co the goi internal processor route de verify monitor/processor flow. | Key internal missing trong local env, E2E testnet khong du entry criteria. | QA audit 2026-04-03 | `src/server/wallet/config.js`, `docs/features/Wallet/007-e2e-testnet-execution-checklist-v1.0.md` |
