# user_assets

## Purpose
Số dư tài sản crypto theo từng user và loại tài khoản.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | ID bản ghi asset balance. |
| `user_id` | UUID | NO | - | FK tới user sở hữu tài sản. |
| `symbol` | VARCHAR(20) | NO | - | Mã token (vd: BTC, ETH, USDT). |
| `balance` | NUMERIC(36,18) | NO | `0` | Số dư tài sản với độ chính xác cao. |
| `account_type` | VARCHAR(20) | NO | - | Loại tài khoản chứa tài sản (`funding`/`trading`). |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm tạo record. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm cập nhật record gần nhất. |

## Constraints
- PK: `id`
- FK: `user_id -> public.users(id)` (`ON DELETE CASCADE`)
- CHECK: `account_type IN ('funding','trading')`
- UNIQUE: `(user_id, symbol, account_type)`

## Indexes
- `idx_user_assets_user_id(user_id)`
- `idx_user_assets_symbol(symbol)`
- `idx_user_assets_account_type(account_type)`

## RLS
Enabled in migration `006_create_user_assets.sql`.

## Source
- `db/migrations/006_create_user_assets.sql`
