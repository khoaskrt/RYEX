# 001-auth-signup-verify-sync - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Đảm bảo user mới có thể hoàn tất chuỗi `signup -> verify email -> session sync -> vào /app/market` ổn định.
- User pain:
  - User dễ drop ở bước xác minh email hoặc không vào được market sau khi verify.
- KPI:
  - `Signup -> market redirect success rate`.
  - `Verify callback success rate`.
  - `Session sync success rate`.
  - Tỷ lệ lỗi theo `AUTH_*` code cho chuỗi onboarding.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `POST /api/v1/auth/signup`.
    - `GET /api/v1/auth/verify-email/callback`.
    - `POST /api/v1/auth/session/sync`.
    - FE callback bridge `/app/auth/verify-email/callback`.
  - `P1`:
    - Chuẩn hóa success/error shape theo `docs/contracts/api-v1.md` (không breaking).
    - Đồng bộ error mapping FE theo `error.code`.
  - `P2`:
    - Tối ưu UX copy/loading/retry states cho callback page.
- Out-of-scope:
  - MFA.
  - Forgot password/reset password.
  - KYC onboarding.

## 3. Runtime Gap (if any)
- Expected behavior:
  - User signup thành công, verify email thành công, session sync thành công, tự động redirect `/app/market`.
  - Lỗi được phản hồi nhất quán bằng `error.code`.
- Current behavior:
  - Auth APIs core đã trả `error.code` tương đối chuẩn.
  - Success payload chưa theo wrapper `{ data, meta }`.
  - FE auth hiện có 2 pattern song song; callback bridge đang dùng API flow chuẩn.
- Proposed resolution:
  - Giữ flow runtime hiện tại làm baseline `v1.0`.
  - Chốt checklist QA contract-first cho 3 endpoint P0.
  - Ở phase tiếp theo: chuẩn hóa success shape không breaking và thống nhất auth journey FE.

## 4. User stories
- US-01:
  - Là người dùng mới, tôi muốn đăng ký bằng email/password hợp lệ để nhận email xác minh.
- US-02:
  - Là người dùng đã nhận email xác minh, tôi muốn mở link verify để hệ thống kích hoạt tài khoản.
- US-03:
  - Là người dùng đã verify, tôi muốn hệ thống tự đồng bộ session và vào market mà không thao tác thêm.
- US-04:
  - Là người dùng gặp lỗi (link sai/hết hạn/token lỗi), tôi muốn thấy thông báo rõ và có hướng retry.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Signup success):
  - Given email/password hợp lệ và chưa tồn tại
  - When gọi `POST /api/v1/auth/signup`
  - Then trả `201` với `userId`, `email`, `verificationEmailSent=true`, `requestId`.

- AC-02 (Signup invalid input):
  - Given thiếu `email` hoặc `password`
  - When gọi `POST /api/v1/auth/signup`
  - Then trả `400` với `error.code = AUTH_INVALID_INPUT`.

- AC-03 (Password policy):
  - Given password không đạt policy
  - When gọi `POST /api/v1/auth/signup`
  - Then trả `422` với `error.code = AUTH_PASSWORD_POLICY_FAILED`.

- AC-04 (Verify success):
  - Given `token_hash` + `type` hợp lệ
  - When gọi `GET /api/v1/auth/verify-email/callback?token_hash=...&type=...`
  - Then trả `200` với `verified=true`, `autoLoginReady=true`, `next=/app/market`.

- AC-05 (Verify invalid/expired link):
  - Given `token_hash` hoặc `type` invalid/expired
  - When gọi verify callback
  - Then trả lần lượt `400 AUTH_VERIFICATION_LINK_INVALID` hoặc `410 AUTH_VERIFICATION_LINK_EXPIRED`.

- AC-06 (Session sync success):
  - Given Supabase Auth `accessToken` hợp lệ và email đã verified
  - When gọi `POST /api/v1/auth/session/sync`
  - Then trả `200` với `sessionRef`, `emailVerified=true`, và set cookie `ryex_session_ref`.

- AC-07 (Session sync invalid token):
  - Given `accessToken` thiếu hoặc không hợp lệ
  - When gọi session sync
  - Then trả `400 AUTH_INVALID_INPUT` (thiếu token) hoặc `401 AUTH_INVALID_TOKEN` (token sai).

- AC-08 (Session sync unverified email):
  - Given `accessToken` hợp lệ nhưng email chưa verified
  - When gọi session sync
  - Then trả `403` với `error.code = AUTH_EMAIL_NOT_VERIFIED`.

- AC-09 (FE callback redirect):
  - Given verify + session sync đều thành công
  - When user vào `/app/auth/verify-email/callback`
  - Then FE redirect đến `/app/market`.

## 6. Impact map
- FE impact:
  - `src/app/(webapp)/app/auth/verify-email/callback/page.js`.
  - Error mapping theo `error.code`.
  - Redirect state handling (`verifying`, `syncing`, `success`, `error`).
- BE impact:
  - `signup`, `verify-email/callback`, `session/sync` routes.
  - Repository writes: `users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events`.
  - Cookie/session logic: `ryex_session_ref` (và trusted device nếu bật rememberDevice).
- QA impact:
  - Auth pack bắt buộc cho 3 endpoint và FE callback bridge.
  - Verify cả status code + response shape + `error.code`.
  - Regression cho nhánh invalid/expired/unverified/rate-limited.

## 7. Risks + decisions
- Risks:
  - R-01: FE auth dual pattern có thể gây lệch trải nghiệm onboarding.
  - R-02: Nếu provider Supabase Auth lỗi tạm thời, signup/verify/sync bị gián đoạn.
  - R-03: Nếu contract success/error thay đổi thiếu kế hoạch, dễ vỡ FE mapping.
- Decisions cần PO chốt:
  - D-01: Ưu tiên chốt auth journey FE thống nhất ở sprint nào.
  - D-02: Lịch chuẩn hóa success shape theo `docs/contracts/api-v1.md` (giữ backward compatibility).

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief nền cho feature `001-auth-signup-verify-sync`.
- Reason:
  - Cần chuẩn hóa handoff và traceability cho luồng P0 onboarding.
- Impact:
  - Là baseline tài liệu cho FE/BE/QA test và theo dõi thay đổi ở các sprint tiếp theo.
