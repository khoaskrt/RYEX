# users

## Purpose
Lưu hồ sơ người dùng trong `public.users`.  
Sau khi người dùng đăng ký tài khoản, dữ liệu được sync vào bảng này.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `supa_id` | UUID | NO | - | Định danh user từ Supabase Auth (`auth.users.id`). |
| `users_id` | UUID | NO | - | Định danh nội bộ của bảng hồ sơ user. |

## Constraints
- Unique index: `idx_profiles_users_id_unique(users_id)`

## RLS Policies
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

## Notes
- Chưa có policy `DELETE` cho bảng `public.users`.
