# trusted_devices

## Purpose
Lưu thiết bị tin cậy (trust token hash, hết hạn) cho luồng login challenge / trusted device trong `public.trusted_devices`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | - | PK (BE thường dùng `gen_random_uuid()` khi insert). |
| `user_id` | UUID | NO | - | **Runtime:** map tới `public.users.users_id` (xem Compatibility). |
| `email` | CITEXT | NO | - | Email gắn thiết bị. |
| `device_id` | VARCHAR(128) | NO | - | Id thiết bị client. |
| `trust_token_hash` | VARCHAR(128) | NO | - | Hash token tin cậy (không lưu plaintext). |
| `expires_at` | TIMESTAMPTZ | NO | - | Thời điểm hết hạn tin cậy. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Tạo bản ghi. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Cập nhật gần nhất. |
| `revoked_at` | TIMESTAMPTZ | YES | - | Thu hồi tin cậy (NULL = còn hiệu lực nếu chưa hết hạn). |
| `revoke_reason` | VARCHAR(64) | YES | - | Lý do revoke. |

## Constraints
- Unique: `trusted_devices_user_device_unique(user_id, device_id)`
- Index: `idx_trusted_devices_email_device`, `idx_trusted_devices_expires_at`

## Compatibility (quan trọng)
- File `db/migrations/003.2_auth_trusted_devices.sql` khai báo  
  `REFERENCES users(id) ON DELETE CASCADE` — phù hợp **bảng `users` legacy** trong `001.2_auth_identity_baseline.sql` (cột `id`).
- Stack **Supabase hiện tại** dùng `public.users` với PK `supa_id` và định danh nội bộ `users_id`. Code BE (`src/server/auth/repository.js`) dùng `user_id` trùng **`users.users_id`**.
- Nếu tạo DB chỉ từ `001.1` + `010`, cần **migration bổ sung** đổi FK thành `REFERENCES public.users(users_id)` (hoặc tạo bảng tương đương) trước khi `trusted_devices` khớp hoàn toàn với runtime.

## RLS
- `db/migrations/005_enable_rls_policies.sql` có policy mẫu cho `trusted_devices` nhưng dựa trên claim JWT kiểu Firebase + `users.firebase_uid` — **không áp dụng trực tiếp** cho Supabase `auth.uid()` mà không chỉnh sửa policy.

## Source
- `db/migrations/003.2_auth_trusted_devices.sql`
- BE usage: `src/server/auth/repository.js`
