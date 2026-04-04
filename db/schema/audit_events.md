# audit_events

## Purpose
Ghi nhận sự kiện audit tổng quát (actor, action, resource, payload) trong `public.audit_events` cho vận hành và compliance nhẹ.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK. |
| `actor_type` | VARCHAR(20) | NO | - | `user`, `system`, hoặc `admin`. |
| `actor_user_id` | UUID | YES | - | FK mềm tới `public.users(users_id)` (người thực hiện nếu có). |
| `action` | VARCHAR(80) | NO | - | Tên hành động (machine-friendly). |
| `resource_type` | VARCHAR(40) | NO | - | Loại tài nguyên. |
| `resource_id` | VARCHAR(128) | YES | - | Id tài nguyên (string). |
| `request_id` | VARCHAR(64) | YES | - | Correlation request. |
| `ip` | INET | YES | - | IP. |
| `user_agent` | TEXT | YES | - | User-Agent. |
| `payload` | JSONB | NO | `{}` | Chi tiết bổ sung. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thời điểm ghi nhận. |

## Constraints
- Check: `audit_events_actor_type_check(actor_type IN ('user','system','admin'))`
- Index: `idx_audit_events_action_created`, `idx_audit_events_actor_created`, `idx_audit_events_resource`

## RLS
- Có thể chưa bật trên Supabase; BE ghi qua service role.

## Source
- `db/migrations/010_create_auth_identities_compat.sql`
