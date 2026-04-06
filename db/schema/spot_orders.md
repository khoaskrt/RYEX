# spot_orders

## Purpose
Luu order spot trading cua user cho MVP `BTCUSDT` (`market` + `limit`, `GTC`).

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | Dinh danh order noi bo, PK. |
| `user_id` | UUID | NO | - | User so huu order (`users.supa_id`). |
| `symbol` | TEXT | NO | - | Pair giao dich (MVP: `BTCUSDT`). |
| `side` | TEXT | NO | - | `buy`/`sell`. |
| `type` | TEXT | NO | - | `market`/`limit`. |
| `status` | TEXT | NO | - | `open`/`partial`/`filled`/`cancelled`. |
| `price` | NUMERIC(36,18) | YES | - | Gia limit (NULL voi market). |
| `amount` | NUMERIC(36,18) | NO | - | Khoi luong dat lenh. |
| `filled_amount` | NUMERIC(36,18) | NO | `0` | Khoi luong da khop. |
| `time_in_force` | TEXT | NO | `GTC` | MVP chi `GTC`. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem tao order. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem cap nhat gan nhat. |
| `filled_at` | TIMESTAMPTZ | YES | - | Thoi diem khop hoan tat. |

## Constraints
- Primary key: `spot_orders_pkey(id)`
- Foreign key: `user_id -> users.supa_id` (`ON DELETE CASCADE`)
- Check: symbol = `BTCUSDT`
- Check: side in (`buy`,`sell`)
- Check: type in (`market`,`limit`)
- Check: status in (`open`,`partial`,`filled`,`cancelled`)
- Check: `time_in_force = 'GTC'`
- Check: amount > 0
- Check: `price > 0` neu co gia
- Check: `filled_amount >= 0 and <= amount`
- Check: `market => price IS NULL`, `limit => price IS NOT NULL`

## Indexes
- `idx_spot_orders_user_status(user_id, status, created_at DESC)`
- `idx_spot_orders_user_symbol(user_id, symbol, created_at DESC)`

## RLS
- Enabled.

## Policies
- `spot_orders_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = user_id)`

## Source
- `db/migrations/011_create_spot_trading_orders.sql`
