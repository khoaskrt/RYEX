# QA Auth Test Report - Signup/Login Flow (Local Retest)

Date: 2026-03-27  
Owner: QA Engineer (RYEX)  
Scope source: `docs/BRD/logic-dang-ky-login.md`, `docs/handoff/fe-qa-auth-assignment.md`

## 1) Test Scope

- In scope for this retest:
  - DB fix verification for signup blocker (`users.status` length and `users.firebase_uid` uniqueness).
  - API contract retest for:
    - `POST /api/v1/auth/signup`
    - `GET /api/v1/auth/verify-email/callback`
    - `POST /api/v1/auth/session/sync`
    - `POST /api/v1/auth/logout`
  - Build-level validation (`npm run build`).
  - Verify callback FE implementation presence for pre-sync Firebase email-link sign-in attempt.
- Out of scope for this retest:
  - Full real email-link E2E in browser with controlled valid/expired OOB lifecycle.
  - Browser-interactive UX validation (popup/redirect/error rendering states).
  - Analytics events assertion.

## 2) Environment & Data Setup

- Environment:
  - Local API runtime via `npm run dev` on `http://localhost:3003` (3000-3002 already occupied).
  - Build command used: `npm run build` (**PASS**).
  - Lint script: **BLOCKED** (`npm run lint` is not defined in `package.json`).
- Data/services:
  - Local Postgres container: `ryex-postgres`.
  - Firebase Admin/Web credentials present in local env.
- DB fix verification evidence:
  - `users.status` is `VARCHAR(32)` (matches migration 002 intent).
  - `users_firebase_uid_key` unique constraint exists.
  - `users_status_check` includes `pending_email_verification`, `active`, `locked`, `disabled`.

## 3) Test Cases Executed

| TC ID | Priority | Preconditions | Steps | Expected | Actual status | Severity if fail |
|---|---|---|---|---|---|---|
| TC-AUTH-P0-01 Signup API required fields | P0 | Local server up | `POST /api/v1/auth/signup` with `{}` | `400 AUTH_INVALID_INPUT` | **PASS** (400 + expected code) | N/A |
| TC-AUTH-P0-02 Password policy enforcement (API) | P0 | Local server up | `POST /api/v1/auth/signup` with weak password | `422 AUTH_PASSWORD_POLICY_FAILED` | **PASS** (422 + expected code) | N/A |
| TC-AUTH-P0-03 Signup happy path (API success) | P0 | Valid email + strong password | `POST /api/v1/auth/signup` valid payload | `201`, `verificationEmailSent=true` | **PASS** (`201` returned with expected payload fields) | N/A |
| TC-AUTH-P0-04 Existing email message contract | P0 | Existing email already in Firebase | Repeat signup with existing email | `409 AUTH_EMAIL_ALREADY_EXISTS` + VN message | **BLOCKED** (no controlled pre-existing Firebase test identity prepared in this run) | N/A |
| TC-AUTH-P0-05 Verify callback missing param | P0 | Local server up | `GET /api/v1/auth/verify-email/callback` without `oobCode` | `400 AUTH_INVALID_INPUT` | **PASS** | N/A |
| TC-AUTH-P0-06 Verify callback invalid link | P0 | Invalid `oobCode` | `GET /api/v1/auth/verify-email/callback?oobCode=INVALID_TEST_CODE` | `400 AUTH_VERIFICATION_LINK_INVALID` | **PASS** | N/A |
| TC-AUTH-P0-07 Verify callback success contract | P0 | Valid Firebase `oobCode` | Call callback with valid code | `200`, `verified=true`, `autoLoginReady=true` | **BLOCKED** (valid OOB artifact not provided) | N/A |
| TC-AUTH-P0-08 Session sync required token | P0 | Local server up | `POST /api/v1/auth/session/sync` with `{}` | `400 AUTH_INVALID_INPUT` | **PASS** | N/A |
| TC-AUTH-P0-09 Session sync success after verify | P0 | Verified Firebase user + valid ID token | `POST /api/v1/auth/session/sync` with valid `idToken` | `200`, `sessionRef`, `emailVerified=true` | **BLOCKED** (no verified test user token supplied in this run) | N/A |
| TC-AUTH-P0-10 Logout required sessionRef | P0 | Local server up | `POST /api/v1/auth/logout` with `{}` | `400 AUTH_INVALID_INPUT` | **PASS** | N/A |
| TC-AUTH-P0-11 FE verify callback pre-sync email-link sign-in attempt | P0 | Source code + build | Inspect callback page implementation and build app | Uses Firebase client `isSignInWithEmailLink` + `signInWithEmailLink` before session sync | **PASS (build-level/code-level)** | N/A |
| TC-AUTH-P0-12 Signup success popup + callback redirect UX | P0 | Browser interactive run | Complete FE signup and callback from email link | Popup + successful redirect `/app/market` | **BLOCKED** (not executed in interactive browser in this run) | N/A |

## 4) Results Summary (Pass/Fail/Blocked)

- Total cases: 12
- Pass: 8
- Fail: 0
- Blocked: 4
- P0 status: **PARTIAL PASS** (no observed runtime failure in executed API/build checks, but critical E2E runtime paths remain blocked by missing artifacts/browser execution)

## 5) Defects Found (Severity-ordered)

- No new reproducible runtime defect found in executed checks.
- Previously reported critical defect `DEF-AUTH-001` (signup 500 / DB mismatch) is **not reproducible** after latest fixes in this local retest.

## 6) Regression Status

- Regression checks now stable for:
  - Signup validation/error contracts.
  - Signup happy path response contract (`201` + `verificationEmailSent=true`).
  - Verify callback invalid/missing parameter error mapping.
  - Session sync/logout missing-field validation contracts.
- Build-level regression:
  - `npm run build` passes with current auth routes/pages included.

## 7) Risks / Test Gaps

- Gap G1 (P0): Verify callback success path not executed with a real valid OOB code.
- Gap G2 (P0): Session sync success path not executed with a real verified Firebase ID token.
- Gap G3 (P0): Browser-level UX/flow checks (signup popup, callback screen states, redirect) not executed.
- Gap G4 (engineering gate): No lint script in `package.json`, so lint pre-check is unavailable.

## 8) Release Recommendation (Local Testing Handoff)

- Overall status: **AMBER**
- Go/No-Go for local testing handoff: **CONDITIONAL GO**
- Rationale:
  - Fixed items are validated by evidence: DB schema alignment confirmed, signup happy-path now returns `201`, and callback API negative contracts pass.
  - However, full P0 auth E2E completion is still unproven due to blocked runtime artifacts/flows.
- Remaining blocked items and exact unblock conditions:
  1. **P0-Callback success blocked**
     - Condition to unblock: provide at least 1 valid fresh Firebase email verification link (`oobCode`) for QA account and run callback test before expiry.
  2. **P0-Session sync success blocked**
     - Condition to unblock: provide verified QA Firebase user and valid ID token generation method (or scripted fixture) to call `POST /api/v1/auth/session/sync`.
  3. **P0-FE E2E UX blocked**
     - Condition to unblock: run interactive browser test covering signup submit -> popup -> email-link callback page states -> redirect `/app/market`.
  4. **Lint gate blocked**
     - Condition to unblock: add `lint` script in `package.json` and baseline lint config, then run and report clean output.
