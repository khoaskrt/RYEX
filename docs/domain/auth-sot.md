# RYEX Auth Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.0`
- Owner: `BA` (co-own: `BE Auth`, `QA`)
- Last updated: `2026-03-31`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
- Source-of-truth note: Đây là tài liệu active duy nhất cho Auth domain. Khi thay đổi lớn phải bump version và archive bản cũ.

## 2) Problem Framing
- Business goal:
  - Cung cấp onboarding + login flow đủ tin cậy cho MVP webapp (`/app/market`).
  - Đảm bảo có audit/session trace để vận hành và điều tra sự cố.
- User pain đang giải quyết:
  - Đăng ký xong cần verify + vào market mượt, không bị kẹt giữa nhiều bước.
  - Login cần có fallback challenge và cơ chế trusted device để giảm friction.
- KPI theo dõi:
  - `Signup -> market redirect success rate`.
  - `Verify callback success rate`.
  - `Auth API error rate` theo `error.code`.
  - `Time-to-debug auth incident` (nhờ audit/log/event đầy đủ).

## 3) Scope & Priority
### In-scope
- `P0`:
  - Signup, verify callback, session sync, logout.
  - Login challenge + resend email.
  - Session cookie + trusted device cookie.
  - Auth event/audit persistence trong DB.
- `P1`:
  - Chuẩn hóa error mapping FE theo `error.code`.
  - Đồng bộ hành vi 2 auth pattern FE.
- `P2`:
  - Tối ưu UX đa phương thức login.
  - Mở rộng policy/risk scoring ngoài mức cơ bản.

### Out-of-scope (Auth domain hiện tại)
- MFA production-grade đầy đủ.
- IAM/backoffice permission model.
- Cross-device session management portal cho end user.

## 4) Runtime Architecture (Auth)
- FE routes:
  - `/app/auth/signup` -> `AuthModulePage`.
  - `/app/auth/login` -> `StitchLoginPage`.
  - `/app/auth/verify-email/callback` -> verify + session sync bridge.
- API routes (`src/app/api/v1/auth/*`):
  - `POST /signup`
  - `GET /verify-email/callback`
  - `POST /session/sync`
  - `POST /login-challenge`
  - `POST /resend`
  - `POST /logout`
- Service layer (`src/server/auth/*`):
  - Supabase Auth integration, error envelope, rate limit, password policy.
  - Cookie management (`ryex_session_ref`, `ryex_trusted_device`).
  - Repository CRUD cho users/identities/events/sessions/trusted devices.
- Data layer:
  - `users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `trusted_devices`, `audit_events`.

## 5) API Contract Matrix (Current Runtime)
| Endpoint | Purpose | Input chính | Success contract | Error contract (chính) |
|---|---|---|---|---|
| `POST /api/v1/auth/signup` | Tạo auth user + bootstrap DB record | `email`, `password`, `displayName?` | `201` với `userId`, `email`, `verificationEmailSent`, `next`, `requestId` | `400 AUTH_INVALID_INPUT`, `422 AUTH_PASSWORD_POLICY_FAILED`, `409 AUTH_EMAIL_ALREADY_EXISTS`, `429 AUTH_RATE_LIMITED`, `503 AUTH_PROVIDER_TEMPORARY_FAILURE` |
| `GET /api/v1/auth/verify-email/callback` | Xác minh email qua Supabase OTP callback | Query `token_hash`, `type` | `200` với `verified`, `autoLoginReady`, `next`, `requestId` | `400 AUTH_INVALID_INPUT/AUTH_VERIFICATION_LINK_INVALID`, `410 AUTH_VERIFICATION_LINK_EXPIRED`, `503 AUTH_PROVIDER_TEMPORARY_FAILURE` |
| `POST /api/v1/auth/session/sync` | Verify `accessToken`, tạo session + optional trusted device | `accessToken`, `deviceId?`, `rememberDevice?` | `200` với `sessionRef`, `userStatus`, `emailVerified`, `trustedDeviceEnabled`, `deviceId`, `requestId` + set cookie | `400 AUTH_INVALID_INPUT`, `401 AUTH_INVALID_TOKEN`, `403 AUTH_EMAIL_NOT_VERIFIED`, `429 AUTH_RATE_LIMITED` |
| `POST /api/v1/auth/login-challenge` | Login challenge flow (email link) + trusted bypass | `email` | `200` với `challengeRequired` (true/false), `trustedBypass`, `requestId`, optional `sessionRef` + cookie khi bypass | `400 AUTH_INVALID_INPUT`, `403 AUTH_EMAIL_NOT_VERIFIED`, `429 AUTH_RESEND_COOLDOWN/AUTH_RESEND_HOURLY_CAP_REACHED/AUTH_RATE_LIMITED`, `503 AUTH_PROVIDER_TEMPORARY_FAILURE` |
| `POST /api/v1/auth/resend` | Gửi lại verification/challenge email | `email`, `flowType` (`signup_verify`/`login_challenge`) | `200` với `success`, `cooldownSeconds`, `requestId` | `400 AUTH_INVALID_INPUT`, `429 AUTH_RESEND_COOLDOWN/AUTH_RESEND_HOURLY_CAP_REACHED/AUTH_RATE_LIMITED`, `503 AUTH_PROVIDER_TEMPORARY_FAILURE` |
| `POST /api/v1/auth/logout` | Kết thúc session + clear cookies | `sessionRef?` (optional) | `204` + clear auth cookies | Error envelope qua `jsonError` khi DB failure |

Ghi chú contract:
- Auth endpoints chuẩn hiện tại trả lỗi theo envelope:
  - `error.code`
  - `error.message`
  - `error.details` (optional)
  - `error.requestId`

## 6) Core Flows (Business View)
### 6.1 Signup -> Verify -> Session Sync -> Market
1. User signup.
2. Hệ thống tạo user tại Supabase Auth + DB projection.
3. User mở verify link với `token_hash` + `type`.
4. Verify callback xác thực email và cập nhật trạng thái DB.
5. FE callback lấy `accessToken` từ Supabase Auth client.
6. FE gọi `session/sync` để tạo `ryex_session_ref`.
7. Redirect `/app/market`.

### 6.2 Login Challenge + Trusted Device
1. User gửi email login challenge.
2. Nếu trust token hợp lệ và chưa hết hạn -> bypass challenge, tạo session trực tiếp.
3. Nếu không bypass -> gửi email sign-in link.
4. User vào verify callback và chạy sync tương tự flow signup.

### 6.3 Resend + Cooldown
1. User yêu cầu resend.
2. Hệ thống kiểm cooldown 60s và hourly cap (5 lần/giờ).
3. Đạt điều kiện thì gửi email + ghi event/audit.

## 7) Data Model & Persistence
| Table | Vai trò |
|---|---|
| `users` | User projection nội bộ (status/kyc metadata/các mốc thời gian) |
| `auth_identities` | Mapping user với identity provider (`password`, Supabase Auth uid, email_verified) |
| `auth_verification_events` | Lịch sử gửi/xác minh email |
| `auth_login_events` | Lịch sử login success/failed, method, failure reason |
| `user_sessions` | Session trace theo `session_ref`, device, ip, termination |
| `trusted_devices` | Thiết bị trusted cho login bypass |
| `audit_events` | Audit trail hành động hệ thống/người dùng |

Migration liên quan:
- `001_auth_identity_baseline.sql`
- `002_auth_users_status_length_fix.sql`
- `003_auth_trusted_devices.sql`
- `004_auth_verification_event_types.sql`
- `005_enable_rls_policies.sql`

## 8) FE/BE/QA Impact Map
### FE impact
- Auth UI đang có 2 pattern runtime:
  - `AuthModulePage`: signup/resend theo Supabase client auth.
  - `StitchLoginPage`: sign-in password theo Supabase client auth.
- Verify callback page dùng backend auth APIs (`verify-email/callback` + `session/sync`) và map lỗi theo `error.code`.

### BE impact
- Auth API chính dùng Supabase Auth + Postgres transaction repository.
- Rate limit đang dùng memory store in-process (không shared giữa instance).
- Cookie/session bảo mật phụ thuộc env:
  - `AUTH_COOKIE_SECURE`
  - `AUTH_REFRESH_TOKEN_TTL_SECONDS`
  - `AUTH_TRUSTED_DEVICE_SECRET`

### QA impact
- Bắt buộc test contract-first:
  - status code
  - response shape
  - `error.code`
- Regression bắt buộc:
  - Signup validations.
  - Verify callback invalid/expired code.
  - Session sync invalid token/unverified email.
  - Login challenge cooldown/hourly cap/trusted bypass.
  - Logout clear cookies.

## 9) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Current runtime | Direction |
|---|---|---|---|
| G-AUTH-01 | Auth FE journey thống nhất theo contract backend | FE đang chạy 2 pattern Supabase-based song song với backend auth APIs | Chốt 1 auth journey chuẩn (ADR-005) |
| G-AUTH-02 | Error handling đồng nhất toàn bộ auth touchpoints | Một phần flow map `error.code`, phần khác dựa heuristic theo Supabase error | Chuẩn hóa error handling theo contract API v1 |
| G-AUTH-03 | Rate limit nhất quán đa instance | Rate limit hiện là in-memory map tại process | Nâng cấp rate limit store dùng shared backend khi scale |

## 10) Risks + Open Decisions
| Risk | Type | Mô tả | Mitigation ngắn hạn |
|---|---|---|---|
| R-AUTH-01 | Technical | Dual auth pattern gây drift nghiệp vụ và UX | Freeze scope, ưu tiên ADR-005 |
| R-AUTH-02 | Operational | In-memory rate limit không tối ưu khi scale ngang | Giới hạn rollout, monitor auth spikes |
| R-AUTH-03 | Compliance/Security | Secret fallback `dev-trusted-secret` nếu env thiếu | Ép env validation fail-fast ở môi trường production |

Decisions cần PO/Tech Lead chốt:
- Chọn auth FE journey chuẩn cho giai đoạn MVP+1.
- Kế hoạch backward compatibility khi chuẩn hóa error envelope toàn domain.

## 11) Traceability Backbone (Auth)
Mọi auth change phải map theo chuỗi:

`Business goal -> User story -> Acceptance Criteria -> API/UI impact -> QA auth pack`

Ví dụ:
- Goal: giảm drop-off sau signup.
- Story: user verify email thành công và auto vào market.
- AC: callback valid trả `200` + sync tạo session cookie.
- Impact: FE callback page + `verify-email/callback` + `session/sync`.
- QA: test valid/invalid/expired + unverified token paths.

## 12) Change Control
- Không đổi auth behavior/contract đã chốt nếu chưa đánh giá impact FE/BE/QA.
- Mọi thay đổi scope phải ghi `Delta`:
  - `Changed`
  - `Reason`
  - `Impact`
- Versioning:
  - Minor update: `v1.0 -> v1.1`
  - Major scope change: `v1.x -> v2.0`

## 13) Delta
- `v1.0` (2026-03-31):
  - Created initial Auth domain source-of-truth.
  - Captured current API contracts, data model, gaps, and regression scope.
