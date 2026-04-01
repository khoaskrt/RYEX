# RYEX Data Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.0`
- Owner: `BA` (co-own: `BE`, `DB/Infra`, `QA`)
- Last updated: `2026-03-31`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
  - `docs/domain/auth-sot.md`
  - `docs/domain/profile-sot.md`
- Source-of-truth note: Đây là tài liệu active duy nhất cho data layer (schema + migration + RLS).

## 2) Problem Framing
- Business goal:
  - Đảm bảo dữ liệu user/auth/session/audit có cấu trúc rõ, traceable, và đủ an toàn cho MVP.
  - Hỗ trợ team mở rộng role mà không mơ hồ về “bảng nào phục vụ flow nào”.
- User/ops pain đang giải quyết:
  - Khó debug khi không map rõ API <-> bảng dữ liệu.
  - Dễ lệch giữa nhiều script SQL nếu thiếu nguồn SoT data domain.
- KPI theo dõi:
  - `Schema change failure rate`.
  - `Migration apply success rate` trên môi trường chuẩn.
  - `Data incident MTTR` (dựa vào audit/session/event trace).

## 3) Data Architecture Overview (Current Runtime)
- Primary data store: PostgreSQL (Supabase-hosted).
- Data access paths hiện tại:
  - Path A (PG direct): `src/server/db/postgres.js` + repository SQL (`src/server/auth/repository.js`).
  - Path B (Supabase service role): `src/shared/lib/supabase/server.js`.
  - Path C (Supabase client): `src/shared/lib/supabase/client.js` (client-side).
- Security model:
  - Có RLS policy cho các bảng chính.
  - Tuy nhiên backend route dùng service role key sẽ bypass RLS (theo thiết kế admin/backend).

## 4) Schema Map (Auth-centric MVP)
| Table | Purpose | Keys/Constraints chính | Consumed by |
|---|---|---|---|
| `users` | User projection nội bộ | `id` PK, `supa_id` UNIQUE, `email` UNIQUE, `status`, `kyc_status` | Auth signup/session sync, profile GET/PATCH, users debug page |
| `auth_identities` | Mapping user <-> identity provider | UNIQUE `(user_id, provider)`, UNIQUE `(supa_id, provider)` | Auth verify/session sync, profile emailVerified lookup |
| `auth_verification_events` | Event log cho verify/resend/challenge | Check `event_type`, `event_status` | Auth verify/resend/challenge flows |
| `auth_login_events` | Login audit (success/failure) | `result` check (`success/failed`) | Login challenge, session flows |
| `user_sessions` | Session lifecycle trace | `session_ref` UNIQUE, `ended_at`, `termination_reason` | Session sync, logout |
| `trusted_devices` | Remember/trusted device tokens | UNIQUE `(user_id, device_id)`, `expires_at`, revoke fields | Login challenge trusted bypass, logout revoke |
| `audit_events` | Unified audit trail | `actor_type` check, action/resource metadata | Signup/verify/login/logout auditing |

Supporting extensions:
- `citext`
- `pgcrypto`

## 5) Migration Map
| Order | File | Type | Summary | Affected objects |
|---|---|---|---|---|
| `001` | `db/migrations/001_auth_identity_baseline.sql` | Baseline | Tạo schema core auth/data tables + indexes + constraints | `users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events` |
| `002` | `db/migrations/002_auth_users_status_length_fix.sql` | Patch | Mở rộng/chuẩn hóa kiểu cột `users.status` | `users.status` |
| `003` | `db/migrations/003_auth_trusted_devices.sql` | Additive | Bổ sung bảng trusted device và index | `trusted_devices` |
| `004` | `db/migrations/004_auth_verification_event_types.sql` | Contract update | Cập nhật check constraint `auth_verification_events.event_type` để thêm `challenge_email_sent`, `resend_email_sent` | `auth_verification_events` |
| `005` | `db/migrations/005_enable_rls_policies.sql` | Security | Enable RLS + tạo policies + helper function | RLS trên 7 bảng + `get_current_user_id()` |
| `006` | `db/migrations/006_create_user_assets.sql` | Additive | Tạo bảng `user_assets` + index + comments + RLS policy cho luồng tài sản người dùng | `user_assets` |

Migration source notes:
- Có file `supabase-rls-policies.sql` ở root với nội dung gần tương đương migration `005` (dùng cho SQL Editor manual apply).
- File `supabase-complete-schema.sql` được nhắc tới trong comments nhưng hiện **không thấy** trong repo.

## 6) RLS Map (Current Defined Policies)
### 6.1 RLS enabled tables
- `users`
- `auth_identities`
- `user_sessions`
- `trusted_devices`
- `auth_verification_events`
- `auth_login_events`
- `audit_events`

### 6.2 Policy matrix
| Table | Own-data policy (authenticated context) | Service role policy |
|---|---|---|
| `users` | `users_select_own`, `users_update_own` theo JWT `sub` = `supa_id` | `users_service_role_all` |
| `auth_identities` | `auth_identities_select_own` | `auth_identities_service_role_all` |
| `user_sessions` | `user_sessions_select_own` qua join `users` | `user_sessions_service_role_all` |
| `trusted_devices` | `trusted_devices_select_own` qua join `users` | `trusted_devices_service_role_all` |
| `auth_verification_events` | `auth_verification_events_select_own` | `auth_verification_events_service_role_all` |
| `auth_login_events` | `auth_login_events_select_own` | `auth_login_events_service_role_all` |
| `audit_events` | `audit_events_select_own` qua `actor_user_id` | `audit_events_service_role_all` |

Helper function:
- `get_current_user_id()` đọc JWT claim `sub` để map về `users.id`.

### 6.3 Runtime enforcement reality
- API backend dùng service role (`supabaseAdmin`) hoặc PG direct thường không đi qua user-context RLS.
- RLS vẫn có giá trị cho:
  - direct client queries dùng anon/authenticated context.
  - giới hạn blast radius nếu vô tình dùng non-service context.

## 7) API/Service -> Table Lineage
| Runtime flow | Read/Write path | Tables chính |
|---|---|---|
| Auth signup | PG transaction repository | `users`, `auth_identities`, `auth_verification_events`, `audit_events` |
| Verify callback | PG transaction repository | `users`, `auth_identities`, `auth_verification_events`, `audit_events` |
| Session sync | PG transaction repository | `users`, `auth_identities`, `user_sessions`, `auth_login_events`, `trusted_devices`, `audit_events` |
| Login challenge | PG transaction repository (+ `pgPool` query) | `auth_verification_events`, `auth_login_events`, `trusted_devices`, `user_sessions`, `audit_events`, `users` |
| Logout | PG transaction repository | `user_sessions`, `trusted_devices`, `audit_events` |
| Profile GET/PATCH | Supabase service role | `users`, `auth_identities` (GET join) |
| `/app/users` debug page | Supabase server client | `users` |

## 8) FE/BE/QA Impact Map
### FE impact
- FE auth/profile behavior phụ thuộc quality của `users.status`, `auth_identities.email_verified`, session traces.
- Nếu schema/constraint đổi, có thể ảnh hưởng trực tiếp mapping state UI.

### BE impact
- Hiện tồn tại 2 data access style:
  - SQL trực tiếp qua `pg`.
  - Supabase JS qua service role.
- Cần cẩn trọng transaction boundary khi flow đi qua nhiều bảng.

### QA impact
- Regression data pack tối thiểu:
  - Signup tạo đủ records liên quan.
  - Verify callback cập nhật `email_verified`.
  - Session sync tạo session + optional trusted device.
  - Logout đóng session và revoke trusted devices.
  - Profile GET/PATCH phản ánh đúng `users` row.
- Security pack:
  - Validate unauthorized paths.
  - Smoke-check RLS policy behavior khi dùng non-service context.

## 9) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Current runtime | Direction |
|---|---|---|---|
| G-DATA-01 | Một chiến lược data access nhất quán | Đang dùng song song PG direct và Supabase service client | Chốt guideline khi nào dùng PG vs Supabase |
| G-DATA-02 | Schema bootstrap file rõ ràng trong repo | `supabase-complete-schema.sql` được tham chiếu nhưng không tồn tại | Bổ sung hoặc sửa references để tránh nhầm |
| G-DATA-03 | Quy trình apply RLS một nguồn chuẩn | Có cả migration `005` và `supabase-rls-policies.sql` dễ duplicate apply | Chuẩn hóa “migration-first”, file root chỉ là tài liệu/backup |

## 10) Risks + Open Decisions
| Risk | Type | Mô tả | Mitigation ngắn hạn |
|---|---|---|---|
| R-DATA-01 | Operational | Apply sai thứ tự migration gây lệch schema | Bắt buộc checklist apply order 001->006 |
| R-DATA-02 | Security | Hiểu sai về RLS khi backend dùng service role | Document rõ service-role bypass trong review checklist |
| R-DATA-03 | Technical | Dual data-access path tăng độ phức tạp bảo trì | Chuẩn hóa convention theo từng use-case |

Decisions cần PO/Tech Lead/BE chốt:
- Data access policy chính thức cho từng loại flow (transaction-heavy vs simple CRUD).
- Có đưa file schema tổng hợp vào repo hay không.
- Chuẩn vận hành RLS: migration-only hay dual channel.

## 11) Traceability Backbone (Data)
Mọi data change phải map theo chuỗi:

`Business goal -> User story -> AC -> Schema/Migration impact -> API impact -> QA data cases`

Ví dụ:
- Goal: thêm trusted login.
- Story: user có thể bypass challenge trên thiết bị tin cậy.
- AC: trusted device hợp lệ tạo session thành công.
- Data impact: thêm `trusted_devices` + index + revoke lifecycle.
- QA: test create/reuse/revoke trusted device records.

## 12) Change Control
- Không đổi schema/constraint/policy đã chốt nếu chưa đánh giá impact FE/BE/QA.
- Mọi thay đổi sau chốt phải thêm `Delta`:
  - `Changed`
  - `Reason`
  - `Impact`
- Versioning:
  - Minor: `v1.0 -> v1.1`
  - Major: `v1.x -> v2.0`

## 13) Delta
- `v1.0` (2026-03-31):
  - Created initial Data domain source-of-truth.
  - Captured schema map, migration map, RLS map, and runtime data lineage.
