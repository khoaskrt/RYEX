# Backend Auth Execution Handoff (RYEX MVP)

## 1) Backend scope implemented (BE only)
- Implement auth backend flow P0: `signup -> verification callback -> auto-login sync -> redirect target /app/market`.
- Enforce server-side password policy: `>=8 chars`, at least `1 uppercase`, `1 number`, `1 special`.
- Keep Firebase as Auth SoT; PostgreSQL stores internal mirror, session metadata, and audit trail.
- Standardize error taxonomy and fixed message for existing email.
- Add baseline rate limiting (no CAPTCHA in current scope).
- Ensure secret handling via server env only (no secret in response/log/event payloads).

## 2) Explicit non-scope (hard no FE/UI touch)
- No change to frontend UI/layout/theme/components/pages.
- No change to FE route structure or visual flow (`/app/auth/*`, `/app/market`).
- No change to FE copy except mapping BE error code to existing fixed text.
- No CAPTCHA UI implementation.
- No FE state-management refactor; FE only wires existing UI to backend endpoints.

## 3) `/api/v1` endpoints to implement + request/response/error codes

### `POST /api/v1/auth/signup`
- **Request**
```json
{
  "email": "user@example.com",
  "password": "Strong@123",
  "displayName": "Optional"
}
```
- **201 Response**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "verificationEmailSent": true,
  "next": "check_email_popup"
}
```
- **Errors**
  - `400 AUTH_INVALID_INPUT`
  - `422 AUTH_PASSWORD_POLICY_FAILED`
  - `409 AUTH_EMAIL_ALREADY_EXISTS` -> message fixed: `Email đã được sử dụng, hãy sử dụng email khác`
  - `429 AUTH_RATE_LIMITED`
  - `503 AUTH_PROVIDER_TEMPORARY_FAILURE`
  - `500 AUTH_INTERNAL_ERROR`

### `GET /api/v1/auth/verify-email/callback`
- **Query**: provider callback params (opaque, validated server-side).
- **200 Response** (or redirect-hint payload for FE router)
```json
{
  "verified": true,
  "autoLoginReady": true,
  "next": "/app/market"
}
```
- **Errors**
  - `400 AUTH_VERIFICATION_LINK_INVALID`
  - `410 AUTH_VERIFICATION_LINK_EXPIRED`
  - `429 AUTH_RATE_LIMITED`
  - `500 AUTH_INTERNAL_ERROR`

### `POST /api/v1/auth/session/sync`
- **Purpose**: verify Firebase ID token, sync internal identity/session after verify (auto-login path).
- **Request**
```json
{
  "idToken": "<firebase-id-token>"
}
```
- **200 Response**
```json
{
  "sessionRef": "opaque-session-ref",
  "userStatus": "active",
  "emailVerified": true
}
```
- **Errors**
  - `401 AUTH_INVALID_TOKEN`
  - `403 AUTH_EMAIL_NOT_VERIFIED`
  - `429 AUTH_RATE_LIMITED`
  - `500 AUTH_INTERNAL_ERROR`

### `POST /api/v1/auth/logout`
- **204 Response**: internal session closed.
- **Errors**: `401 AUTH_UNAUTHORIZED`, `500 AUTH_INTERNAL_ERROR`.

### Error response shape (all endpoints)
```json
{
  "error": {
    "code": "AUTH_EMAIL_ALREADY_EXISTS",
    "message": "Email đã được sử dụng, hãy sử dụng email khác",
    "requestId": "req-..."
  }
}
```

## 4) Mapping endpoint -> DB tables affected
- `POST /auth/signup`
  - write: `users`, `auth_identities`, `auth_verification_events`, `audit_events`
- `GET /auth/verify-email/callback`
  - write/update: `auth_identities`, `users`, `auth_verification_events`, `audit_events`
- `POST /auth/session/sync`
  - update/write: `users.last_login_at`, `auth_identities.last_sync_at`, `user_sessions`, `auth_login_events`, `audit_events`
- `POST /auth/logout`
  - update/write: `user_sessions(ended_at, termination_reason)`, `audit_events`

## 5) Migration/DB tasks
- Apply baseline migration: `db/migrations/001_auth_identity_baseline.sql`.
- Verify `citext` extension enabled.
- Validate constraints/indexes:
  - unique: `users(firebase_uid,email)`, `auth_identities(user_id,provider)`, `session_ref`
  - check constraints: user status, kyc status, provider, event status/type.
- Prepare optional backfill script (if pre-existing Firebase users) for `users` + `auth_identities`.
- Add reconciliation job/task (MVP-lite) to reduce Firebase/Postgres drift for `email_verified`.

## 6) BE test plan (unit + integration)

### Unit tests
- Password policy validator: pass/fail matrix.
- Error mapper: Firebase/provider errors -> standardized auth codes/messages.
- State transition guard:
  - `pending_email_verification -> active` only when `email_verified=true`.
- Redaction utility: no password/token/secret leakage.

### Integration tests
- `POST /auth/signup` happy path -> DB side effects (`users`, `auth_identities`, verification/audit event).
- Signup with existing email -> `409 AUTH_EMAIL_ALREADY_EXISTS` fixed message.
- Signup weak password -> `422 AUTH_PASSWORD_POLICY_FAILED`.
- `GET /auth/verify-email/callback`:
  - valid link -> verified + next `/app/market`
  - invalid/expired -> `400/410` mapped correctly.
- `POST /auth/session/sync` valid token -> session created/updated, login event written.
- `POST /auth/logout` -> active session closed.
- Rate-limit tests for signup/verify/session-sync.

## 7) FE handoff contract (no UI redesign, wiring only)
- FE keeps current screens/components; only wire API calls and existing states.
- Required FE wiring:
  - signup submit -> `POST /api/v1/auth/signup`
  - verify callback handling -> `GET /api/v1/auth/verify-email/callback`
  - auto-login sync -> `POST /api/v1/auth/session/sync`
  - optional logout -> `POST /api/v1/auth/logout`
- Redirect contract after successful verify+sync: `/app/market`.
- Error mapping contract:
  - use `error.code` as source of truth for state mapping.
  - for `AUTH_EMAIL_ALREADY_EXISTS`, display exact fixed message.
- FE must not send/store server secrets; only bearer/id token flow as agreed.

## 8) QA handoff test checklist
- Signup success shows verification-success state and records DB side effects.
- Existing email returns fixed message and proper code `AUTH_EMAIL_ALREADY_EXISTS`.
- Password policy enforcement matches spec (>=8, uppercase, number, special).
- Verify callback:
  - valid link -> auto-login ready + redirect target `/app/market`
  - invalid/expired link -> correct error code (`AUTH_VERIFICATION_LINK_INVALID`, `AUTH_VERIFICATION_LINK_EXPIRED`).
- Session sync creates/updates `user_sessions`, writes `auth_login_events`.
- Logout closes active session metadata.
- Rate limiting works (no CAPTCHA expected in this scope).
- Security checks: no password/token/secrets in logs or API error details.

## 9) Risks / open issues
- Firebase/Postgres drift risk on verify state; needs periodic reconciliation.
- Abuse risk higher because no CAPTCHA (mitigated by rate limit + telemetry).
- If provider outage occurs, signup may fail with temporary errors; monitor `AUTH_PROVIDER_TEMPORARY_FAILURE`.
- Verify-link TTL behavior depends on Firebase defaults; monitor expired-link rate.
- Need alignment on operational alert thresholds before go-live (auth 5xx, rate-limit spike, expired-link spike).
