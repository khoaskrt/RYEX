# RYEX Data Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.1`
- Owner: `BA` (co-own: `BE`, `DB/Infra`, `QA`)
- Last updated: `2026-04-02`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
  - `docs/contracts/api-v1.md`
  - `docs/features/Assets/003-Assets-api-contract-freeze-v1.0.md`
- Source-of-truth note: Đây là tài liệu active duy nhất cho data layer (`schema + migration + RLS`) theo current-truth baseline đang áp dụng.

## 2) Problem Framing
- Business goal:
  - Duy trì baseline dữ liệu nhất quán với runtime hiện tại để giảm schema drift.
  - Hỗ trợ handoff FE/BE/QA rõ ràng cho flow Profile và Assets.
- User/ops pain đang giải quyết:
  - Mismatch giữa migration history trong docs và migration thật trong repo.
  - Khó kết luận root-cause khi API lỗi nếu source-of-truth không đồng bộ.
- KPI theo dõi:
  - `Migration apply success rate`.
  - `Schema drift incident count`.
  - `Data incident MTTR`.

## 3) Data Architecture Overview (Current Runtime)
- Primary data store: PostgreSQL (Supabase-hosted).
- Data access paths:
  - Supabase service role (`src/shared/lib/supabase/server.js`) cho server-side read/write.
  - Supabase client (`src/shared/lib/supabase/client.js`) cho client-side auth/session.
- Security model:
  - RLS bật cho bảng tracked trong baseline.
  - Backend service role bypass RLS theo thiết kế cho API server-side.

## 4) Schema Map (Current Truth Baseline)
| Table | Purpose | Keys/Constraints chính | Consumed by |
|---|---|---|---|
| `users` | Hồ sơ user nội bộ map theo Supabase user id | PK `supa_id`; FK `supa_id -> auth.users(id)`; unique `users_id` | Signup trigger sync, profile flow, user lookup |
| `user_assets` | Số dư tài sản theo user/symbol/account_type | PK `(user_id,symbol,account_type)`; FK `user_id -> users.supa_id`; check `account_type` | `GET /api/v1/user/assets` |

## 5) Migration Map (Current Truth)
| Order | File | Type | Summary | Affected objects |
|---|---|---|---|---|
| `001` | `db/migrations/001_users_current_truth_baseline.sql` | Baseline | Tạo/chuẩn hóa bảng `users` + PK/FK/index + RLS policies | `users` |
| `002` | `db/migrations/002_fix_auth_handle_new_user_trigger.sql` | Patch | Sửa trigger `public.handle_new_user()` để insert/upsert đúng theo `supa_id` + `users_id` | `users`, trigger function |
| `003` | `db/migrations/003_create_user_assets_current_truth.sql` | Additive | Tạo bảng `user_assets`, constraints, index, comments, RLS policies | `user_assets` |

## 6) RLS Map (Current Baseline)
### 6.1 RLS enabled tables
- `users`
- `user_assets`

### 6.2 Policy matrix
| Table | Own-data policy (authenticated context) | Service role behavior |
|---|---|---|
| `users` | `profiles_select_own`, `profiles_insert_own`, `profiles_update_own` (`auth.uid() = supa_id`) | Service role bypass theo server-side design |
| `user_assets` | `user_assets_select_own`, `user_assets_insert_own`, `user_assets_update_own`, `user_assets_delete_own` (`auth.uid() = user_id`) | Service role bypass theo server-side design |

## 7) API/Service -> Table Lineage (Current)
| Runtime flow | Read/Write path | Tables chính |
|---|---|---|
| Auth new-user trigger sync | Supabase Auth trigger -> SQL function | `users` |
| Profile GET/PATCH | Supabase service role | `users` |
| Assets GET (`/api/v1/user/assets`) | Supabase service role + market enrich | `user_assets` |

## 8) FE/BE/QA Impact Map
### FE impact
- FE Profile và Assets phụ thuộc trực tiếp data shape từ `users` và `user_assets`.
- Empty/error state cần bám contract hiện hành để tránh false error UX.

### BE impact
- BE phải giữ migration-first discipline, tránh query tới bảng không nằm trong baseline.
- Khi đổi schema `users`/`user_assets`, bắt buộc cập nhật migration + schema snapshot + SoT.

### QA impact
- Regression data pack tối thiểu:
  - `db:verify` pass cho `user_assets`.
  - Assets API happy/unauthorized/empty/state shape.
  - Profile API unauthorized/happy path.

## 9) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Current runtime | Direction |
|---|---|---|---|
| G-DATA-01 | Migration history trong docs khớp repo | Đã đồng bộ về `001->003`, nhưng cần duy trì kỷ luật update sau mỗi change | Enforce checklist update docs sau DB task |
| G-DATA-02 | Error-path QA coverage đầy đủ cho Assets | Nhánh `500 ASSET_FETCH_FAILED` đang QA `BLOCKED` vì thiếu fault-injection sandbox | Bổ sung QA sandbox hoặc test hook non-prod |

## 10) Risks + Open Decisions
| Risk | Type | Mô tả | Mitigation ngắn hạn |
|---|---|---|---|
| R-DATA-01 | Operational | Apply sai thứ tự migration gây lệch schema | Bắt buộc checklist apply order `001->002->003` |
| R-DATA-02 | Security | Hiểu sai RLS khi backend dùng service role | Ghi rõ service-role bypass trong review checklist |
| R-DATA-03 | QA | Thiếu test nhánh lỗi DB có kiểm soát | Chốt owner BE cho fault-injection path |

Decisions cần PO/Tech Lead/BE chốt:
- Chọn hướng xử lý `ASSET-CT-06` (`QA sandbox DB` hoặc `test hook non-prod`).
- Mốc thời gian chuẩn hóa response envelope Assets sang `{ data, meta }`.

## 11) Traceability Backbone (Data)
Mọi data change phải map theo chuỗi:

`Business goal -> User story -> AC -> Schema/Migration impact -> API impact -> QA data cases`

Ví dụ:
- Goal: đưa Assets API vào vận hành ổn định.
- Story: user đăng nhập xem được tổng tài sản và danh sách coin.
- AC: `200` happy/empty và `401` unauthorized đúng contract.
- Data impact: thêm `user_assets` migration + schema snapshot.
- QA: chạy matrix `ASSET-CT-01..06`.

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
- `v1.1` (2026-04-02):
  - Synced migration map to current-truth files `001->003`.
  - Updated schema/RLS/lineage to include `user_assets` baseline.
  - Removed legacy migration references causing mismatch with runtime docs.
- `v1.0` (2026-03-31):
  - Created initial Data domain source-of-truth.
