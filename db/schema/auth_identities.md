# auth_identities

## Purpose
Lưu bản đồ định danh đăng nhập (provider/password) gắn với user nội bộ trong `public.auth_identities`. Dùng cho đồng bộ email verify và tra cứu session/auth.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK. |
| `user_id` | UUID | NO | - | FK tới `public.users.users_id` (định danh nội bộ profile). |
| `supa_id` | UUID | NO | - | Trùng `auth.users.id` / `public.users.supa_id`. |
| `provider` | VARCHAR(30) | NO | `password` | Nhà cung cấp (MVP: `password`). |
| `email` | CITEXT | NO | - | Email đăng ký/đăng nhập. |
| `email_verified` | BOOLEAN | NO | `false` | Trạng thái xác minh email. |
| `email_verified_at` | TIMESTAMPTZ | YES | - | Thời điểm verify. |
| `last_sync_at` | TIMESTAMPTZ | NO | `now()` | Lần đồng bộ gần nhất. |
| `sync_version` | INT | NO | `1` | Phiên bản sync (ops/debug). |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm tạo bản ghi. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm cập nhật gần nhất. |

## Constraints
- Primary key: `auth_identities_pkey(id)`
- Foreign key: `user_id -> public.users(users_id)` (`ON DELETE CASCADE`)
- Check: `auth_identities_provider_check` (`provider IN ('password')`)
- Unique: `auth_identities_user_provider_unique(user_id, provider)`
- Unique: `auth_identities_supa_provider_unique(supa_id, provider)`
- Index: `idx_auth_identities_verified_updated(email_verified, updated_at DESC)`

## RLS
- Theo môi trường: nếu chỉ dùng **Postgres service role** từ API thì policy JWT có thể chưa bật; dashboard có thể hiển thị **UNRESTRICTED** cho tới khi bật RLS + policy Supabase (`auth.uid()` / `service_role`).

## Policies
- Xem migration RLS dự kiến cho Supabase (không dùng claim `firebase_uid` từ bản `005_enable_rls_policies.sql` cũ).

## Source
- `db/migrations/010_create_auth_identities_compat.sql`
