# RYEX Profile Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.1`
- Owner: `BA` (co-own: `BE`, `QA`)
- Last updated: `2026-04-01`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
- Source-of-truth note: Đây là tài liệu active duy nhất cho Profile domain.

## 2) Problem Framing
- Business goal:
  - Cho phép hệ thống đọc/cập nhật thông tin profile cơ bản của user đã xác thực.
  - Giữ profile data đồng bộ với identity Supabase Auth và dữ liệu nội bộ.
- User pain đang giải quyết:
  - Cần xem thông tin tài khoản và cập nhật hiển thị tên trong app.
  - Cần đảm bảo chỉ user hợp lệ mới truy cập profile API.
- KPI theo dõi:
  - `Profile API success rate` cho GET/PATCH.
  - `Unauthorized request rejection rate` (401 xử lý đúng).
  - `Profile update latency`.

## 3) Scope & Priority
### In-scope
- `P0`:
  - `GET /api/v1/user/profile`.
  - `PATCH /api/v1/user/profile` (update `displayName`).
  - Supabase Auth bearer token verification cho profile access.
- `P1`:
  - Chuẩn hóa error envelope theo chuẩn API v1.
  - Bổ sung input validation rõ ràng cho PATCH payload.
- `P2`:
  - Mở rộng trường profile (avatar, timezone, preference, v.v.).

### Out-of-scope (Profile domain hiện tại)
- KYC workflow đầy đủ.
- Settings đa chiều (security preferences, notification center).
- Profile history/versioning.

## 4) Runtime Architecture (Profile)
- API route:
  - `src/app/api/v1/user/profile/route.js` xử lý cả `GET` và `PATCH`.
- Auth guard:
  - Bắt buộc `Authorization: Bearer <supabase_access_token>`.
  - Verify token qua `supabaseAdmin.auth.getUser(accessToken)`.
- Data access:
  - Dùng `supabaseAdmin` (service role) query/update bảng `users`.
  - `emailVerified` lấy từ Supabase Auth payload (`auth.getUser`) để tránh phụ thuộc schema join.
- FE touchpoint hiện tại:
  - Chưa thấy module/profile page chuyên biệt trong `src/features/*` đang gọi endpoint này trực tiếp.

## 5) API Contract Matrix (Current Runtime)
| Endpoint | Purpose | Input | Success contract | Error contract hiện tại |
|---|---|---|---|---|
| `GET /api/v1/user/profile` | Lấy profile user hiện tại | Header `Authorization: Bearer <token>` | `200` với `user: { id, email, displayName, status, emailVerified, createdAt }` | `401 { error: "Unauthorized" }`, `404 { error: "User not found" }`, `500 { error: "Internal server error" }` |
| `PATCH /api/v1/user/profile` | Cập nhật profile cơ bản | Header bearer token, body `{ displayName }` | `200` với `user: { id, email, displayName }` | `401 { error: "Unauthorized" }`, `500 { error: "Internal server error" }` |

Ghi chú contract:
- Profile API hiện dùng `error` string, chưa dùng envelope có `error.code`.
- PATCH chưa có validation payload chi tiết (độ dài/ký tự/displayName nullability).

## 6) Core Flows (Business View)
### 6.1 Read Profile (GET)
1. Client gửi request kèm bearer token.
2. API validate header `Bearer`.
3. API verify Supabase access token và lấy `supaUid`.
4. Query bảng `users` theo `supa_id` với cột an toàn (`users_id`, `supa_id`, `email`, `display_name`, timestamps).
5. Trả normalized object cho UI.
6. Nếu không tìm thấy user -> `404`.

### 6.2 Update Profile (PATCH)
1. Client gửi bearer token + payload update.
2. API verify token và lấy `supaUid`.
3. API update `users.display_name`, `updated_at`.
4. Trả profile rút gọn sau cập nhật.
5. Nếu lỗi hệ thống -> `500`.

## 7) Data Model & Persistence
| Table | Vai trò trong Profile domain |
|---|---|
| `users` | Nguồn dữ liệu chính cho profile (`users_id`, `supa_id`, `email`, `display_name`, timestamps) |
| Supabase Auth user payload | Cung cấp trạng thái `emailVerified` khi đọc profile |

Schema liên quan:
- `db/migrations/001.1_users_current_truth_baseline.sql` (định nghĩa `public.users` current truth)
- `db/migrations/005_enable_rls_policies.sql` (RLS policies)

RLS note:
- Runtime profile route đang dùng `SUPABASE_SERVICE_ROLE_KEY` qua `supabaseAdmin`, nên truy cập backend không phụ thuộc policy `authenticated` của client.

## 8) FE/BE/QA Impact Map
### FE impact
- Hiện chưa có Profile module chuyên biệt được map rõ trong `src/features`.
- Khi bổ sung UI profile, phải bám đúng contract hiện tại của GET/PATCH.

### BE impact
- Route profile đang implement trực tiếp trong 1 file route handler.
- Phụ thuộc 2 hệ xác thực:
  - Supabase access token verification (identity).
  - Supabase service role (data access).

### QA impact
- Test pack bắt buộc:
  - Missing/invalid bearer token -> `401`.
  - Existing user -> `200` shape đúng.
  - Non-existing user -> `404` (GET).
  - PATCH happy path -> `200` với displayName mới.
  - DB/provider failure -> `500`.

## 9) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Current runtime | Direction |
|---|---|---|---|
| G-PROFILE-01 | Error contract theo chuẩn thống nhất API v1 (`error.code`) | Profile route trả `error` dạng text đơn giản | Chuẩn hóa theo `docs/contracts/api-v1.md` |
| G-PROFILE-02 | PATCH validation rõ và testable | Chưa validate chặt payload `displayName` | Thêm schema validation + lỗi 4xx cụ thể |
| G-PROFILE-03 | Traceability FE rõ ràng | Chưa có profile UI module/domain owner rõ trong FE | Bổ sung owner + màn hình profile trong planning tiếp theo |

## 10) Risks + Open Decisions
| Risk | Type | Mô tả | Mitigation ngắn hạn |
|---|---|---|---|
| R-PROFILE-01 | Technical | Thiếu validation PATCH có thể gây dữ liệu profile không chuẩn | Thêm guard validation ở route |
| R-PROFILE-02 | QA | Error contract dạng text làm khó automation theo code | Chốt chuẩn `error.code` cho profile |
| R-PROFILE-03 | Ownership | Chưa có FE profile flow rõ ràng nên khó theo dõi end-to-end | Gán owner và đưa vào roadmap module profile |

Decisions cần PO/Tech Lead chốt:
- Sprint áp dụng chuẩn error envelope cho profile.
- Scope profile UI đầu tiên (read-only trước hay read+update đầy đủ).

## 11) Traceability Backbone (Profile)
Mọi profile change phải map theo chuỗi:

`Business goal -> User story -> Acceptance Criteria -> API/UI impact -> QA profile pack`

Ví dụ:
- Goal: user cập nhật tên hiển thị thành công.
- Story: user đổi display name trong profile settings.
- AC: PATCH hợp lệ trả `200` với `displayName` mới, request lỗi trả 4xx xác định.
- Impact: FE profile form + `PATCH /api/v1/user/profile`.
- QA: test valid/invalid payload + unauthorized path.

## 12) Change Control
- Không đổi contract profile đã chốt nếu chưa đánh giá impact FE/BE/QA.
- Mọi thay đổi sau chốt phải thêm `Delta`:
  - `Changed`
  - `Reason`
  - `Impact`
- Versioning:
  - Minor: `v1.0 -> v1.1`
  - Major: `v1.x -> v2.0`

## 13) Delta
- `v1.0` (2026-03-31):
  - Created initial Profile domain source-of-truth.
  - Captured current GET/PATCH profile runtime, contracts, and gaps.
- `v1.1` (2026-04-01):
  - Updated profile read path to be schema-safe with current `users` headers.
  - Removed dependency on `auth_identities` join in Profile GET; `emailVerified` now sourced from Supabase Auth payload.
