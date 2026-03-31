# BA handoff — Auth Option A (P0 alignment)

Date: 2026-03-28  
Scope: Trusted device bypass phải tạo **session DB + cookie**; market gate; login UI email-link; remember-device qua `session/sync`.

## Acceptance criteria (đã chốt cho dev)

1. **BE-AUTH-03 / trusted bypass**  
   - `POST /api/v1/auth/login-challenge` khi `trustedBypass`: tạo `user_sessions`, ghi login/audit success, trả `Set-Cookie: ryex_session_ref` (httpOnly, cùng quy ước với `session/sync`).

2. **Session sync**  
   - `POST /api/v1/auth/session/sync` set cookie session; optional `rememberDevice` + `deviceId` → ghi `trusted_devices` + cookie trusted khi bật.

3. **Market**  
   - `/app/market` (server): có session mở + `auth_identities.email_verified`; redirect `?reason=session_required` / `verify_required`; lỗi DB → coi như không có session (fail closed).

4. **FE login**  
   - Chỉ email + copy Option A (không dùng mật khẩu trên bước gửi link).  
   - Checkbox ghi nhớ → `localStorage ryex_remember_device`; callback đọc và gửi `session/sync`.  
   - `fetch` auth API dùng `credentials: 'same-origin'`.

5. **Logout**  
   - Đọc `session_ref` từ cookie hoặc body; đóng session; revoke `trusted_devices`; xóa cookie session + trusted.

## Open (PO/BA sau MVP)

- Signup vẫn dùng `generateEmailVerificationLink` trong code hiện tại — cần xác nhận với BE có đang gửi email thật hay cần `sendOobCode` / template Firebase.

## QA / DevOps

- QA: E2E trusted bypass → market; resend cooldown; verify → sync → market.  
- DevOps: `AUTH_COOKIE_SECURE` prod; `AUTH_TRUSTED_DEVICE_SECRET` riêng (không phụ thuộc private key); migration `003`+`004` trên mọi DB.
