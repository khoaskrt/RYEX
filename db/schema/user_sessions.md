# user_sessions

## Purpose
Theo dõi phiên đăng nhập (session ref, thời gian, thiết bị) trong `public.user_sessions` cho logout và audit.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK. |
| `user_id` | UUID | NO | - | FK tới `public.users(users_id)` (`ON DELETE CASCADE`). |
| `session_ref` | VARCHAR(128) | NO | - | Tham chiếu phiên (unique). |
| `auth_provider` | VARCHAR(30) | NO | `supabase` | Nhà cung cấp auth. |
| `started_at` | TIMESTAMPTZ | NO | `now()` | Bắt đầu phiên. |
| `last_seen_at` | TIMESTAMPTZ | NO | `now()` | Hoạt động gần nhất. |
| `ended_at` | TIMESTAMPTZ | YES | - | Kết thúc phiên (NULL = đang active). |
| `termination_reason` | VARCHAR(30) | YES | - | Lý do đóng (vd: `logout`). |
| `ip` | INET | YES | - | IP. |
| `user_agent` | TEXT | YES | - | User-Agent. |
| `device_id` | VARCHAR(128) | YES | - | Thiết bị. |
| `risk_level` | VARCHAR(20) | NO | `low` | Mức rủi ro (ops). |

## Constraints
- Unique: `session_ref`
- Index: `idx_user_sessions_user_started`, `idx_user_sessions_last_seen`, partial `idx_user_sessions_active_by_user` (`ended_at IS NULL`)

## RLS
- Có thể chưa bật trên Supabase; BE ghi qua service role.

## Source
- `db/migrations/010_create_auth_identities_compat.sql`
