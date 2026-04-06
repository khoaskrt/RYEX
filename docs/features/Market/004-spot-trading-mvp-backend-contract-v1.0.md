# Spot Trading MVP Backend Contract (v1.0)

## 1) Scope Lock
- Pair: `BTCUSDT` only.
- Order types: `market`, `limit`.
- Time in force: `GTC` only.
- Status set: `open`, `partial`, `filled`, `cancelled`.
- Fee policy: MVP non-fee (`fee = 0`, `platformFee = 0`).

## 2) APIs
### POST `/api/v1/trading/orders`
- Auth: Bearer token (Supabase session).
- Input:
  - `symbol` = `BTCUSDT`
  - `side` = `buy|sell`
  - `type` = `market|limit`
  - `amount` (positive decimal)
  - `price` (required khi `type=limit`)
  - `timeInForce` (optional, default `GTC`)
- Output:
  - `order`, `orderId`, `status`, `symbol`, `side`, `type`, `timeInForce`, `executionPrice`, `fee`

### GET `/api/v1/trading/orders?status=&symbol=&limit=&offset=`
- Auth: required.
- Output:
  - `orders[]`, `total`, `pagination { limit, offset }`

### DELETE `/api/v1/trading/orders/:id`
- Auth: required.
- Output:
  - `cancelled`, `orderId`, `status`

### GET `/api/v1/trading/trades?symbol=&limit=&offset=`
- Auth: required.
- Output:
  - `trades[]`, `total`, `pagination { limit, offset }`

### GET `/api/v1/market/orderbook?symbol=BTCUSDT&depth=20`
- Public market endpoint.
- Output:
  - `symbol`, `depth`, `bids`, `asks`, `fetchedAt`, `stale`

### GET `/api/v1/market/trades?symbol=BTCUSDT&limit=50`
- Public market endpoint.
- Output:
  - `symbol`, `trades[]`, `fetchedAt`, `stale`

## 3) Error Code Baseline
- `TRADING_UNAUTHORIZED`
- `TRADING_INVALID_SYMBOL`
- `TRADING_INVALID_ORDER_TYPE`
- `TRADING_INVALID_ORDER_SIDE`
- `TRADING_INVALID_TIME_IN_FORCE`
- `TRADING_INVALID_AMOUNT`
- `TRADING_INVALID_PRICE`
- `TRADING_INSUFFICIENT_BALANCE`
- `TRADING_ORDER_NOT_FOUND`
- `TRADING_ORDER_NOT_CANCELLABLE`
- `TRADING_MARKET_PRICE_UNAVAILABLE`
- `TRADING_INTERNAL_ERROR`

## 4) Matching and Balance Behavior (MVP)
- Market order:
  - Match ngay theo market price hiện tại.
  - `buy`: debit `USDT/trading`, credit `BTC/trading`.
  - `sell`: debit `BTC/trading`, credit `USDT/trading`.
- Limit order:
  - Nếu chạm điều kiện ngay: khớp ngay như market.
  - Nếu chưa chạm: tạo `open` và reserve balance tại thời điểm đặt.
- Cancel open order:
  - Hoàn phần balance còn lại chưa khớp về `trading` account.
- Atomicity:
  - Tất cả bước order/trade/balance chạy trong transaction.

## 5) Persistence
- New tables:
  - `public.spot_orders`
  - `public.spot_trades`
- Migration:
  - `db/migrations/011_create_spot_trading_orders.sql`
- Snapshot docs:
  - `db/schema/spot_orders.md`
  - `db/schema/spot_trades.md`
