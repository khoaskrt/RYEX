# withdraw_limits

## Purpose
Luu cau hinh han muc rut theo user trong `public.withdraw_limits`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `user_id` | UUID | NO | - | User duoc ap dung han muc (dong thoi la PK). |
| `daily_limit_usdt` | NUMERIC(18,2) | NO | `10000.00` | Tong han muc rut toi da moi ngay. |
| `per_tx_min_usdt` | NUMERIC(18,2) | NO | `10.00` | Muc rut toi thieu moi giao dich. |
| `per_tx_max_usdt` | NUMERIC(18,2) | NO | `5000.00` | Muc rut toi da moi giao dich. |
| `hourly_tx_limit` | INTEGER | NO | `5` | So lan rut toi da moi gio. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem tao record han muc. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem cap nhat han muc gan nhat. |

## Constraints
- Primary key: `withdraw_limits_pkey(user_id)`
- Foreign key: `withdraw_limits_user_id_fkey(user_id -> users.supa_id)` (`ON DELETE CASCADE`)

## RLS
- Khong bat RLS trong migration hien tai.

## Policies
- Khong co policy duoc khai bao trong migration hien tai.

## Source
- `db/migrations/009_create_withdraw_limits.sql`
