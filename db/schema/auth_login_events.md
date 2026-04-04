# auth_login_events

## Purpose
Ghi nhận sự kiện đăng nhập (thành công/thất bại) trong `public.auth_login_events` phục vụ audit và điều tra bảo mật.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK. |
| `user_id` | UUID | YES | - | FK mềm tới `public.users(users_id)`. |
| `supa_id` | UUID | YES | - | Supabase user id. |
| `email` | CITEXT | YES | - | Email dùng khi login. |
| `login_method` | VARCHAR(30) | NO | `email_link` | Phương thức đăng nhập. |
| `result` | VARCHAR(20) | NO | - | `success` hoặc `failed`. |
| `failure_reason_code` | VARCHAR(50) | YES | - | Mã lỗi khi failed. |
| `request_id` | VARCHAR(64) | YES | - | Correlation request. |
| `ip` | INET | YES | - | IP client. |
| `user_agent` | TEXT | YES | - | User-Agent. |
| `device_id` | VARCHAR(128) | YES | - | Thiết bị (nếu có). |
| `occurred_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm sự kiện. |
| `metadata` | JSONB | NO | `{}` | Payload bổ sung. |

## Constraints
- Check: `auth_login_events_result_check(result IN ('success','failed'))`
- Index: `idx_auth_login_events_user_occurred`, `idx_auth_login_events_result_occurred`, `idx_auth_login_events_email_occurred`

## RLS
- Có thể chưa bật trên Supabase; BE ghi qua service role.

## Source
- `db/migrations/010_create_auth_identities_compat.sql`
