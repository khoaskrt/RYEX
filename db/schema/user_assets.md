# user_assets

## Purpose
Lưu số dư tài sản người dùng theo từng loại tài khoản trong `public.user_assets`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `user_id` | UUID | NO | - | Định danh user từ Supabase Auth, map tới `public.users.supa_id`. |
| `symbol` | TEXT | NO | - | Mã tài sản (ví dụ: `BTC`, `ETH`). |
| `account_type` | TEXT | NO | - | Loại tài khoản: `funding` hoặc `trading`. |
| `balance` | NUMERIC(36,18) | NO | `0` | Số dư tài sản theo user/symbol/account_type. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm tạo bản ghi. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm cập nhật gần nhất. |

## Constraints
- Primary key: `user_assets_pkey(user_id, symbol, account_type)`
- Foreign key: `user_assets_user_id_fkey(user_id -> users.supa_id)` (`ON DELETE CASCADE`)
- Check constraint: `user_assets_account_type_check(account_type in ('funding', 'trading'))`
- Index: `idx_user_assets_symbol(symbol)`

## RLS
- Enabled.

## Policies
- `user_assets_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = user_id)`
- `user_assets_insert_own`
  - `FOR INSERT`
  - `WITH CHECK (auth.uid() = user_id)`
- `user_assets_update_own`
  - `FOR UPDATE`
  - `USING (auth.uid() = user_id)`
  - `WITH CHECK (auth.uid() = user_id)`
- `user_assets_delete_own`
  - `FOR DELETE`
  - `USING (auth.uid() = user_id)`

## Source
- `db/migrations/003.1_create_user_assets_current_truth.sql`
