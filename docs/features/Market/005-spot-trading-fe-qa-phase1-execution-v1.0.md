# Spot Trading MVP FE + QA Phase 1 Execution (v1.0)

## 1) Scope Executed
- Role scope: FE + QA execution theo contract `004-spot-trading-mvp-backend-contract-v1.0.md`.
- MVP lock validated:
  - Pair: `BTCUSDT` only.
  - Order type: `market|limit`.
  - `limit` time-in-force: `GTC`.
  - Fee policy: `0` (non-fee MVP).

## 2) QA Matrix Summary
- Date: 2026-04-06
- Environment: local dev (`http://localhost:3002`)

| Test Case | Result | Evidence |
|---|---|---|
| Gate A - `npm run build` | PASS | Build success, routes compile including trading + market endpoints |
| Gate A - `npm run db:verify` | PASS | Required tables pass; optional `trusted_devices` missing |
| Auth login test account (Supabase) | PASS | Sign-in thành công, lấy được bearer token |
| Seed test balance (DB `user_assets`) | PASS | Upsert `USDT/BTC` vào `trading` account để chạy happy path |
| `GET /api/v1/market/orderbook?symbol=BTCUSDT&depth=20` | PASS | `200`, payload includes `bids/asks/fetchedAt/stale` |
| `GET /api/v1/market/trades?symbol=BTCUSDT&limit=20` | PASS | `200`, payload includes `trades[]/fetchedAt/stale` |
| `GET /api/v1/market/orderbook?symbol=BTCUSDT&depth=0` | PASS | `400`, `error.code=INVALID_DEPTH` |
| `GET /api/v1/market/trades?symbol=BTCUSDT&limit=0` | PASS | `400`, `error.code=INVALID_LIMIT` |
| `GET /api/v1/trading/orders` (no auth) | PASS | `401`, `error.code=TRADING_UNAUTHORIZED` |
| `POST /api/v1/trading/orders` (no auth) | PASS | `401`, `error.code=TRADING_UNAUTHORIZED` |
| `GET /api/v1/trading/trades` (no auth) | PASS | `401`, `error.code=TRADING_UNAUTHORIZED` |
| `GET /api/v1/trading/orders` (with auth) | PASS | `200`, empty list + pagination |
| `GET /api/v1/trading/trades` (with auth) | PASS | `200`, empty list + pagination |
| `POST /api/v1/trading/orders` invalid symbol | PASS | `400`, `TRADING_INVALID_SYMBOL` |
| `POST /api/v1/trading/orders` invalid TIF (`IOC`) | PASS | `400`, `TRADING_INVALID_TIME_IN_FORCE` |
| `POST /api/v1/trading/orders` insufficient balance | PASS | `400`, `TRADING_INSUFFICIENT_BALANCE` |
| `POST /api/v1/trading/orders` market buy success | PASS | `200`, status `filled`, fee `0` |
| `POST /api/v1/trading/orders` market sell success | PASS | `200`, status `filled`, fee `0` |
| `POST /api/v1/trading/orders` limit open success | PASS | `200`, status `open` (`GTC`) |
| `DELETE /api/v1/trading/orders/:id` cancel open | PASS | `200`, `cancelled=true`, status `cancelled` |
| `DELETE /api/v1/trading/orders/:id` cancel non-open | PASS | `400`, `TRADING_ORDER_NOT_CANCELLABLE` |
| `GET /app/spot-trading` shell render | PASS | `200`, page renders runtime shell |
| User B không thể `DELETE` order open của user A | PASS | `404`, `TRADING_ORDER_NOT_FOUND` |
| User B không thấy open orders của user A | PASS | `GET orders` user B trả rỗng, user A vẫn thấy order của chính mình |
| TC-API-008 precision + atomicity (DB evidence) | PASS | Market buy: `order filled + 1 trade`; balance khớp tuyệt đối 18 decimals; limit open reserve USDT và cancel hoàn USDT về đúng baseline post-buy |

## 2.1) Critical Environment Finding
- Trước khi apply migration trading, các endpoint auth trading trả `500`:
  - `relation "public.spot_orders" does not exist`
  - `relation "public.spot_trades" does not exist`
- Action đã thực hiện để unblock môi trường test:
  - apply migration `db/migrations/011_create_spot_trading_orders.sql`
- Sau khi apply migration, trading read endpoints với auth đã trả `200`.

## 3) FE Execution Check
- FE runtime integration status:
  - Spot Trading page route render OK (`/app/spot-trading`).
  - Market data endpoints phục vụ runtime payload đúng shape để FE polling sử dụng.
  - Build pass xác nhận module FE mới compile ổn định trong app router.
- FE residual risk:
  - Chưa có browser-auth scenario để xác nhận end-to-end submit/cancel order bằng UI.

## 4) Defects Found
- Không phát hiện defect logic `P0` trong phạm vi behavior đã pass.
- Ghi nhận environment defect (đã xử lý trong local run):
  - Missing migration `011` gây `500 TRADING_INTERNAL_ERROR` cho trading APIs có auth.
- Ghi nhận technical warning khi gọi `DELETE /api/v1/trading/orders/:id` trên Next.js 15:
  - Route handler đang đọc `params.id` theo dạng sync.
  - Cần align theo yêu cầu async params của Next.js để tránh warning runtime.

## 5) Blockers and Unblock Conditions
- Blocker:
  - Không còn blocker QA cho bộ test cases BA (`TC-API-001` -> `TC-API-008`) trong phạm vi đã xác nhận.
- Unblock:
  - N/A.

## 6) Release Recommendation (Phase 1)
- Recommendation: `CONDITIONAL GO`
- Điều kiện để chuyển Phase 2/3:
  - BE xử lý warning Next.js async params tại route `DELETE /api/v1/trading/orders/[id]`.

## 7) TC-API-008 Evidence Snapshot
- Test account: `khoadnd@alphatrue.com` (seed balance deterministic trước test).
- Baseline DB (`trading`): `BTC=1.000000000000000000`, `USDT=10000.000000000000000000`.
- Market buy amount: `0.000123450000000000`, execution price: `69889.06`.
- Expected after buy:
  - `BTC=1.000123450000000000`
  - `USDT=9991.372195543000000000`
- Actual after buy (DB): khớp 100% expected ở 18 decimals.
- Limit open/cancel check:
  - `open` reserve: USDT giảm đúng `0.000200000000000000`.
  - `cancelled`: USDT/BTC quay lại đúng post-buy, không có trạng thái nửa chừng.
