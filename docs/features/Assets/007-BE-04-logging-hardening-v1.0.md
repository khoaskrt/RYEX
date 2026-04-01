# [Assets] - BE-04 Logging Hardening (v1.0)

## 1) Scope
- Endpoint: `GET /api/v1/user/assets`
- Goal: Harden logging/observability without exposing sensitive auth data.

## 2) Changes Applied
- Removed token-length logging from backend path.
- Removed user-id success logging from auth verification flow.
- Added per-request `requestId` generation (`x-request-id` passthrough fallback to `crypto.randomUUID()`).
- Standardized logs with trace prefix: `[user/assets][requestId] ...`.
- Added `error.requestId` in error payload for traceability.
- Added non-prod fault injection hook for QA:
  - Env flag: `ASSET_QA_FAULT_INJECTION_ENABLED=true`
  - Trigger: header `x-qa-fault-injection: ASSET_FETCH_FAILED` or query `?qaFault=ASSET_FETCH_FAILED`
  - Guard: auto-disabled in `production`

## 3) Sanitized Logging Rules
- Do log:
  - request-level lifecycle markers
  - error class/context without raw token
  - requestId for correlation
- Do not log:
  - full bearer token
  - token length
  - PII-rich user payloads

## 4) Contract Impact
- Non-breaking for existing FE behavior.
- Error payload now includes optional `error.requestId` to aid incident tracing.
- QA can now deterministically validate `500 ASSET_FETCH_FAILED` without DB/schema tampering.

## 5) Source Files
- `src/app/api/v1/user/assets/route.js`
