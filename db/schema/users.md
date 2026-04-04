# users

## Purpose
Lưu hồ sơ người dùng trong `public.users`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `supa_id` | UUID | NO | - | Định danh Supabase Auth (`auth.users.id`), đồng thời là PK. |
| `email` | TEXT | YES | - | Email hiển thị ở profile. |
| `display_name` | TEXT | YES | - | Tên hiển thị của user. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm tạo bản ghi profile. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm cập nhật gần nhất. |
| `users_id` | UUID | NO | - | Định danh nội bộ cho layer profile. |

## Constraints
- Primary key: `users_pkey(supa_id)`
- Foreign key: `users_user_id_fkey(supa_id -> auth.users.id)` (`ON DELETE CASCADE`)
- Unique index: `idx_profiles_users_id_unique(users_id)`

## RLS
- Enabled.

## Policies
- `profiles_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = supa_id)`
- `profiles_insert_own`
  - `FOR INSERT`
  - `WITH CHECK (auth.uid() = supa_id)`
- `profiles_update_own`
  - `FOR UPDATE`
  - `USING (auth.uid() = supa_id)`
  - `WITH CHECK (auth.uid() = supa_id)`

## Source
- `db/migrations/001.1_users_current_truth_baseline.sql`
- `db/migrations/002.1_fix_auth_handle_new_user_trigger.sql` (update trigger function `public.handle_new_user` for auth signup compatibility)
