# auth_verification_events

## Purpose
Ghi nhận sự kiện verify email / gửi lại email / challenge trong `public.auth_verification_events` phục vụ audit và rate-limit logic.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK. |
| `user_id` | UUID | YES | - | FK mềm tới `public.users(users_id)` (có thể NULL nếu chưa map user). |
| `supa_id` | UUID | YES | - | Supabase user id (nếu có). |
| `email` | CITEXT | YES | - | Email liên quan sự kiện. |
| `event_type` | VARCHAR(40) | NO | - | Loại sự kiện (xem Constraints). |
| `event_status` | VARCHAR(20) | NO | - | `success` / `failed` / `ignored`. |
| `failure_reason_code` | VARCHAR(50) | YES | - | Mã lỗi (nếu failed). |
| `request_id` | VARCHAR(64) | YES | - | Correlation request. |
| `ip` | INET | YES | - | IP client (nếu có). |
| `user_agent` | TEXT | YES | - | User-Agent. |
| `occurred_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm sự kiện. |
| `metadata` | JSONB | NO | `{}` | Payload bổ sung. |

## Constraints
- Check `auth_verification_events_type_check`: `event_type` gồm  
  `verification_email_sent`, `verification_link_clicked`, `verification_succeeded`, `verification_failed`, `challenge_email_sent`, `resend_email_sent`
- Check `auth_verification_events_status_check`: `event_status IN ('success','failed','ignored')`
- Index: `idx_auth_verif_events_user_occurred`, `idx_auth_verif_events_type_occurred`, `idx_auth_verif_events_status_occurred`

## RLS
- Tương tự `auth_identities`: có thể chưa bật trên Supabase tới khi có policy phù hợp `auth.uid()` / service role.

## Source
- `db/migrations/010_create_auth_identities_compat.sql`
- `db/migrations/004_auth_verification_event_types.sql` mở rộng `event_type` cho stack **legacy** (sau `001.2_auth_identity_baseline`); nếu chỉ dùng `010`, các giá trị extended đã nằm trong `CREATE TABLE`.
