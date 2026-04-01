# RYEX API v1 Contract Standard (MVP v1)

## 1) Document Control
- Version: `v1.1`
- Owner: `BA + BE + QA`
- Last updated: `2026-04-02`
- Status: `Active`
- Related docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
  - `docs/domain/auth-sot.md`
  - `docs/domain/market-sot.md`
  - `docs/domain/profile-sot.md`
  - `docs/features/Assets/003-Assets-api-contract-freeze-v1.0.md`

## 2) Contract Goals
- Chuẩn hóa 3 trục cho toàn bộ API v1:
  - HTTP `status` semantics rõ ràng.
  - `error.code` nhất quán, machine-readable.
  - `response shape` dự đoán được giữa các domain.
- Hỗ trợ QA contract-first và FE error mapping ổn định.

## 3) Global Response Shape (Target Standard)
### 3.1 Success response
```json
{
  "data": {},
  "meta": {
    "requestId": "uuid-or-trace-id",
    "fetchedAt": "ISO-8601 (optional)",
    "stale": false
  }
}
```

Rules:
- `data`: bắt buộc với status `2xx` có body.
- `meta.requestId`: bắt buộc nếu endpoint có thể trace request; khuyến nghị áp dụng toàn bộ API.
- `meta.fetchedAt`, `meta.stale`: dùng cho read endpoints có cache/fallback.
- Với `204 No Content`: không trả body.

### 3.2 Error response
```json
{
  "error": {
    "code": "DOMAIN_REASON",
    "message": "Human-readable message",
    "details": {},
    "requestId": "uuid-or-trace-id"
  }
}
```

Rules:
- `error.code`: bắt buộc.
- `error.message`: bắt buộc.
- `error.details`: optional, chứa context phụ trợ (vd cooldownRemaining).
- `error.requestId`: bắt buộc với endpoint backend có trace.

## 4) HTTP Status Standard
| Status | Khi dùng | Ghi chú |
|---|---|---|
| `200` | Read/update thành công có body | Most GET/PATCH/POST non-create |
| `201` | Create thành công | Ví dụ signup create user |
| `204` | Thành công không body | Ví dụ logout |
| `400` | Input/query/path không hợp lệ | Validation syntax/format |
| `401` | Thiếu/invalid auth credentials | Bearer token sai/thiếu |
| `403` | Authenticated nhưng không đủ điều kiện | Ví dụ email chưa verify |
| `404` | Resource không tồn tại | User/profile không tìm thấy |
| `409` | Conflict dữ liệu | Ví dụ email đã tồn tại |
| `410` | Resource/token hết hạn | Verify link expired |
| `422` | Input semantic invalid | Ví dụ password policy fail |
| `429` | Rate/cooldown limit exceeded | Có thể kèm details |
| `500` | Internal server error | Lỗi hệ thống chưa phân loại |
| `503` | Upstream/service unavailable | Binance/CoinGecko/Auth provider down |

## 5) Error Code Namespace Standard
Pattern:
- `<DOMAIN>_<REASON>` (UPPER_SNAKE_CASE)

Domain prefixes:
- `AUTH_*`
- `MARKET_*`
- `PROFILE_*`
- `ASSET_*`
- `COMMON_*` (nếu dùng chung cross-domain)

Ví dụ canonical:
- `AUTH_INVALID_INPUT`
- `AUTH_EMAIL_NOT_VERIFIED`
- `MARKET_INVALID_INTERVAL`
- `MARKET_SERVICE_UNAVAILABLE`
- `PROFILE_UNAUTHORIZED`
- `ASSET_UNAUTHORIZED`
- `COMMON_INTERNAL_ERROR`

## 6) Endpoint Contract Matrix (Current vs Target)
| Endpoint | Current status/shape | Target chuẩn hóa | Priority |
|---|---|---|---|
| `POST /api/v1/auth/signup` | `201` body top-level fields; lỗi đã theo `error.code` | Chuẩn hóa success về `{ data, meta }` | `P1` |
| `GET /api/v1/auth/verify-email/callback` | `200` body top-level; lỗi chuẩn `error.code` | Chuẩn hóa success wrapper | `P1` |
| `POST /api/v1/auth/session/sync` | `200` body top-level; lỗi chuẩn `error.code` | Chuẩn hóa success wrapper | `P1` |
| `POST /api/v1/auth/login-challenge` | `200` body top-level; lỗi chuẩn `error.code` | Chuẩn hóa success wrapper | `P1` |
| `POST /api/v1/auth/resend` | `200` body top-level; lỗi chuẩn `error.code` | Chuẩn hóa success wrapper | `P1` |
| `POST /api/v1/auth/logout` | `204` no-content; lỗi chuẩn `error.code` | Giữ nguyên, đảm bảo trace cho lỗi | `P0` |
| `GET /api/v1/market/tickers` | `200` payload có `data/fetchedAt/stale`; lỗi là string `{ error: "..." }` | Chuẩn hóa lỗi sang `error.code`, bọc `meta.requestId` | `P0` |
| `GET /api/v1/market/price/[symbol]` | `200` payload detail; lỗi string `{ error: "..." }` | Chuẩn hóa lỗi sang `error.code`, bọc `meta` | `P0` |
| `GET /api/v1/market/kline` | `200` payload; lỗi đã có `{ error: { code, message } }` | Bổ sung `error.requestId`, chuẩn hóa success wrapper | `P1` |
| `GET /api/v1/user/profile` | `200` `{ user: ... }`; lỗi string | Chuẩn hóa lỗi sang `PROFILE_*` + success `{ data, meta }` | `P0` |
| `PATCH /api/v1/user/profile` | `200` `{ user: ... }`; lỗi string | Chuẩn hóa lỗi sang `PROFILE_*`; thêm validation 4xx | `P0` |
| `GET /api/v1/user/assets` | `200` top-level payload (`totalBalance*`, `fundingAccount`, `tradingAccount`, `assets[]`, `fetchedAt`); lỗi `{ error: { code, message } }` | Freeze non-breaking theo `003-Assets-api-contract-freeze-v1.0`; phase sau thêm `requestId` và wrapper `{ data, meta }` | `P0` |

## 7) Domain-specific Error Codes (Baseline)
### Auth (existing baseline)
- `AUTH_INVALID_INPUT`
- `AUTH_PASSWORD_POLICY_FAILED`
- `AUTH_EMAIL_ALREADY_EXISTS`
- `AUTH_RATE_LIMITED`
- `AUTH_PROVIDER_TEMPORARY_FAILURE`
- `AUTH_VERIFICATION_LINK_INVALID`
- `AUTH_VERIFICATION_LINK_EXPIRED`
- `AUTH_INVALID_TOKEN`
- `AUTH_EMAIL_NOT_VERIFIED`
- `AUTH_RESEND_COOLDOWN`
- `AUTH_RESEND_HOURLY_CAP_REACHED`
- `AUTH_LOGIN_CHALLENGE_REQUIRED`
- `AUTH_INTERNAL_ERROR`

### Market (proposed baseline)
- `MARKET_INVALID_INPUT`
- `MARKET_INVALID_SYMBOL`
- `MARKET_INVALID_INTERVAL`
- `MARKET_INVALID_LIMIT`
- `MARKET_SERVICE_UNAVAILABLE`
- `MARKET_UPSTREAM_ERROR`
- `MARKET_INTERNAL_ERROR`

### Profile (proposed baseline)
- `PROFILE_UNAUTHORIZED`
- `PROFILE_USER_NOT_FOUND`
- `PROFILE_INVALID_INPUT`
- `PROFILE_INTERNAL_ERROR`

### Assets (current baseline)
- `ASSET_UNAUTHORIZED`
- `ASSET_FETCH_FAILED`
- `ASSET_USER_NOT_FOUND` (reserved branch)

## 8) Rollout Strategy (Non-breaking)
1. Phase 1:
   - Giữ nguyên success payload cũ.
   - Chuẩn hóa lỗi endpoint còn thiếu sang `error.code`.
2. Phase 2:
   - Thêm `meta.requestId` thống nhất toàn API.
   - Đồng bộ field naming cho payload read-heavy.
3. Phase 3:
   - Chuyển sang success wrapper `{ data, meta }` theo versioning policy.

Compatibility rule:
- Không breaking response shape trong cùng major API (`v1`) nếu chưa có migration notice.

## 9) QA Contract Checklist
- Mỗi endpoint phải có test cho:
  - Happy path status + shape.
  - Ít nhất 1 negative path có `error.code`.
  - Rate-limit hoặc unauthorized path (nếu áp dụng).
- QA kết luận theo `PASS/FAIL/BLOCKED`, có evidence request/response thực tế.

## 10) Change Control
- Mọi thay đổi contract phải map:
  - `Business goal -> Story -> AC -> API contract delta -> QA cases`
- Sau khi chốt, mọi chỉnh sửa phải thêm `Delta`:
  - `Changed`
  - `Reason`
  - `Impact`

## 11) Delta
- `v1.1` (2026-04-02):
  - Added Assets endpoint (`GET /api/v1/user/assets`) to contract matrix.
  - Added `ASSET_*` namespace and baseline error codes.
  - Linked contract freeze note for non-breaking rollout.
- `v1.0` (2026-03-31):
  - Created API v1 contract standard.
  - Baseline current-vs-target matrix cho toàn bộ endpoints hiện có.
