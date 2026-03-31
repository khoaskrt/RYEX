# 002-Login-challenge-trusted-device - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Giảm friction đăng nhập cho user đã xác minh email thông qua cơ chế `login challenge` và `trusted device bypass`.
- User pain:
  - User phải lặp lại nhiều bước xác minh khi đăng nhập trên thiết bị đã dùng trước đó.
  - User cần luồng fallback an toàn khi không thể bypass.
- KPI:
  - `Login challenge success rate`.
  - `Trusted bypass rate` trên user đủ điều kiện.
  - `Challenge resend failure rate` theo `AUTH_RESEND_*`.
  - `Time-to-market` sau khi user bắt đầu login challenge.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `POST /api/v1/auth/login-challenge`.
    - Trusted token parse/validate + trusted device lookup.
    - Session create + cookie set khi bypass thành công.
    - Fallback gửi challenge email khi không bypass.
  - `P1`:
    - Chuẩn hóa success shape theo `docs/contracts/api-v1.md` (non-breaking rollout).
    - Chuẩn hóa trace metrics cho nhánh bypass vs challengeRequired.
  - `P2`:
    - Tối ưu UX copy/trạng thái ở FE login screen theo nhánh bypass/challenge.
- Out-of-scope:
  - MFA/TOTP.
  - Password reset.
  - Device management UI cho user cuối.

## 3. Runtime Gap (if any)
- Expected behavior:
  - Nếu trusted device hợp lệ và email đã verified: đăng nhập ngay, tạo session, redirect market.
  - Nếu không đủ điều kiện bypass: gửi challenge email và trả trạng thái rõ ràng để FE hướng dẫn user.
- Current behavior:
  - API đã có đầy đủ 2 nhánh `trustedBypass=true/false`.
  - Có cooldown/hourly cap cho resend/challenge.
  - Success payload chưa theo wrapper `{ data, meta }`.
- Proposed resolution:
  - Giữ runtime hiện tại làm baseline.
  - Ưu tiên test contract-first cho 2 nhánh chính (bypass và challengeRequired).
  - Tiếp theo chuẩn hóa payload success/error theo plan API contract v1.

## 4. User stories
- US-01:
  - Là user đã từng tin cậy thiết bị, tôi muốn đăng nhập nhanh mà không phải xác minh lại qua email.
- US-02:
  - Là user chưa có trusted device hợp lệ, tôi muốn nhận challenge email để tiếp tục đăng nhập an toàn.
- US-03:
  - Là user gặp giới hạn gửi email, tôi muốn hệ thống báo rõ cooldown/cap để biết khi nào thử lại.
- US-04:
  - Là user chưa verify email, tôi muốn nhận thông báo đúng nguyên nhân để hoàn tất verify trước.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Missing email):
  - Given request không có email hợp lệ
  - When gọi `POST /api/v1/auth/login-challenge`
  - Then trả `400` với `error.code = AUTH_INVALID_INPUT`.

- AC-02 (Trusted bypass success):
  - Given trusted token hợp lệ, device tồn tại và email đã verified
  - When gọi login challenge
  - Then trả `200` với `challengeRequired=false`, `trustedBypass=true`, `sessionRef`, `requestId` và set cookie session.

- AC-03 (Trusted token không hợp lệ hoặc không match):
  - Given token thiếu/hết hạn/sai chữ ký/không khớp device
  - When gọi login challenge
  - Then không bypass, chuyển sang nhánh gửi challenge email.

- AC-04 (Unverified email in trusted path):
  - Given trusted device hợp lệ nhưng account chưa verified
  - When gọi login challenge
  - Then trả `403` với `error.code = AUTH_EMAIL_NOT_VERIFIED`.

- AC-05 (Cooldown):
  - Given email vừa nhận challenge trong < 60s
  - When gọi login challenge
  - Then trả `429` với `error.code = AUTH_RESEND_COOLDOWN` và `error.details.cooldownRemaining`.

- AC-06 (Hourly cap):
  - Given email đã chạm ngưỡng gửi trong 1 giờ
  - When gọi login challenge
  - Then trả `429` với `error.code = AUTH_RESEND_HOURLY_CAP_REACHED`.

- AC-07 (Challenge email sent):
  - Given không đủ điều kiện bypass và không vi phạm limit
  - When gọi login challenge
  - Then trả `200` với `challengeRequired=true`, `trustedBypass=false`, `cooldownSeconds=60`, `requestId`.

- AC-08 (Provider temporary failure):
  - Given provider gửi email gặp lỗi
  - When gọi login challenge
  - Then trả `503` với `error.code = AUTH_PROVIDER_TEMPORARY_FAILURE`.

## 6. Impact map
- FE impact:
  - Login flow cần xử lý rõ 2 nhánh:
    - Bypass thành công -> vào market.
    - Challenge required -> hướng dẫn user kiểm tra email.
  - Error mapping hiển thị đúng cho cooldown/hourly cap/unverified.
- BE impact:
  - Route `src/app/api/v1/auth/login-challenge/route.js`.
  - Table impact:
    - `trusted_devices` (lookup),
    - `user_sessions` (create bypass),
    - `auth_login_events`,
    - `auth_verification_events`,
    - `audit_events`.
  - Cookie impact: `ryex_session_ref` (nhánh bypass).
- QA impact:
  - Bắt buộc test đầy đủ trusted token cases:
    - valid, expired, tampered, mismatched device/email.
  - Test rate-limit/cooldown/hourly cap.
  - Verify status + response shape + `error.code`.

## 7. Risks + decisions
- Risks:
  - R-01: Trusted token handling sai có thể gây bypass không mong muốn hoặc false negative.
  - R-02: In-memory rate limit có thể không nhất quán khi scale multi-instance.
  - R-03: Thiếu thống nhất payload chuẩn gây khó cho FE/QA automation.
- Decisions cần PO chốt:
  - D-01: Mức ưu tiên chuẩn hóa payload success/error cho endpoint này trong sprint contract.
  - D-02: Khi nào nâng rate-limit store từ in-memory sang shared backend.

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `002-login-challenge-trusted-device`.
- Reason:
  - Cần chuẩn hóa handoff nghiệp vụ/contract cho luồng login không password-first.
- Impact:
  - Tạo baseline cho FE/BE/QA triển khai và regression thống nhất ở auth login challenge.
