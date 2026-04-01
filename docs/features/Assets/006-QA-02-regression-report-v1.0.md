# [Assets] - QA-02 Regression Report (v1.1)

## 1) Scope Tested
- Flow: `auth -> /api/v1/user/assets`
- Endpoint under test: `GET /api/v1/user/assets`
- Contract baseline: `docs/features/Assets/003-Assets-api-contract-freeze-v1.0.md`

## 2) Gate A (Environment Sanity)
- `npm run build`: `PASS`
- `npm run db:verify`: `PASS`

## 3) Matrix Summary
| Case ID | Description | Result |
|---|---|---|
| `ASSET-CT-01` | Happy path with valid token + user has assets | `PASS` |
| `ASSET-CT-02` | Missing token -> unauthorized | `PASS` |
| `ASSET-CT-03` | Invalid token -> unauthorized | `PASS` |
| `ASSET-CT-04` | Valid token + empty portfolio | `PASS` |
| `ASSET-CT-05` | Shape stability vs freeze contract | `PASS` |
| `ASSET-CT-06` | Fault injection non-prod -> `500 ASSET_FETCH_FAILED` | `PASS` |

## 4) Repro Evidence
### ASSET-CT-01 (PASS)
- Request: `GET /api/v1/user/assets` with valid bearer token (QA User A)
- Actual status: `200`
- Actual payload (summary): có đủ `totalBalanceBTC`, `totalBalanceUSDT`, `fundingAccount`, `tradingAccount`, `assets[]`, `fetchedAt`
- File evidence: `/tmp/qa-asset-ct-01.txt`

### ASSET-CT-02 (PASS)
- Request: `GET /api/v1/user/assets` without `Authorization`
- Actual status: `401`
- Actual payload: `{"error":{"code":"ASSET_UNAUTHORIZED","message":"Unauthorized"}}`
- File evidence: `/tmp/qa-asset-ct-02.txt`

### ASSET-CT-03 (PASS)
- Request: `GET /api/v1/user/assets` with invalid bearer token
- Actual status: `401`
- Actual payload: `{"error":{"code":"ASSET_UNAUTHORIZED","message":"Unauthorized"}}`
- File evidence: `/tmp/qa-asset-ct-03.txt`

### ASSET-CT-04 (PASS)
- Request: `GET /api/v1/user/assets` with valid bearer token (QA User B, empty assets)
- Actual status: `200`
- Actual payload (summary): `assets: []`, tổng số dư bằng `0`
- File evidence: `/tmp/qa-asset-ct-04.txt`

### ASSET-CT-05 (PASS)
- Check: script verify required fields top-level + asset item keys
- Actual result: `pass = true`, `missingTop = []`, `missingAsset = []`
- File evidence: `/tmp/qa-asset-ct-05-shape.json`

### ASSET-CT-06 (PASS)
- Setup:
  - Start server with `ASSET_QA_FAULT_INJECTION_ENABLED=true`
  - Send request with header `x-qa-fault-injection: ASSET_FETCH_FAILED`
- Request: `GET /api/v1/user/assets`
- Actual status: `500`
- Actual payload: `{"error":{"code":"ASSET_FETCH_FAILED","message":"Forced asset fetch failure for QA","requestId":"..."}}`
- Control check: same request without fault header returns `200`
- File evidence:
  - `/tmp/qa-asset-ct-06.txt`
  - `/tmp/qa-asset-ct-06-control.txt`

## 5) Defects Found
- Không ghi nhận `FAIL` trong scope QA-02.

## 6) Residual Risks
- Cần giữ guard non-prod cho fault injection để tránh sử dụng sai môi trường.

## 7) Recommendation
- Release recommendation: `GO`
- Lý do: toàn bộ cases `ASSET-CT-01..06` đã có evidence `PASS`.

## 8) Delta
- `v1.1` (2026-04-02): Closed `ASSET-CT-06` via Option B fault injection and removed blocker state.
