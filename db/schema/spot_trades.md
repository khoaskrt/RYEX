# spot_trades

## Purpose
Luu cac lan khop lenh (fills) cho spot trading MVP.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Dinh danh trade noi bo, PK. |
| `order_id` | UUID | NO | - | Tham chieu order da tao trade. |
| `user_id` | UUID | NO | - | User so huu trade (`users.supa_id`). |
| `symbol` | TEXT | NO | - | Pair giao dich (MVP: `BTCUSDT`). |
| `side` | TEXT | NO | - | `buy`/`sell`. |
| `price` | NUMERIC(36,18) | NO | - | Gia khop lenh. |
| `amount` | NUMERIC(36,18) | NO | - | Khoi luong khop lenh. |
| `fee` | NUMERIC(36,18) | NO | `0` | Phi giao dich (MVP = 0). |
| `fee_asset` | TEXT | NO | `USDT` | Don vi phi. |
| `executed_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem trade duoc ghi nhan. |

## Constraints
- Primary key: `spot_trades_pkey(id)`
- Foreign key: `order_id -> spot_orders.id` (`ON DELETE CASCADE`)
- Foreign key: `user_id -> users.supa_id` (`ON DELETE CASCADE`)
- Check: symbol = `BTCUSDT`
- Check: side in (`buy`,`sell`)
- Check: `price > 0`
- Check: `amount > 0`
- Check: `fee >= 0`

## Indexes
- `idx_spot_trades_user_executed(user_id, executed_at DESC)`
- `idx_spot_trades_symbol_executed(symbol, executed_at DESC)`

## RLS
- Enabled.

## Policies
- `spot_trades_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = user_id)`

## Source
- `db/migrations/011_create_spot_trading_orders.sql`
