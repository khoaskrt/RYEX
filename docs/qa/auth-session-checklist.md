# QA Checklist: Firebase Auth + Local Session

Flow mục tiêu: `signup -> verify email -> exchange-session -> refresh -> logout`

## P0

### TC01 - Signup + verify + login end-to-end
- Precondition: email mới, hệ thống gửi email verify hoạt động.
- Steps:
  1) Signup bằng email/password hợp lệ.
  2) Mở email và bấm link verify.
  3) Login và gọi `POST /api/auth/exchange-session`.
  4) Gọi `POST /api/auth/refresh`.
  5) Gọi `POST /api/auth/logout`.
- Expected UI: vào app thành công; logout quay về login.
- Expected API:
  - exchange-session: `200`, có `accessToken`, set refresh cookie.
  - refresh: `200`, cấp access token mới, refresh cookie đổi giá trị.
  - logout: `200`, clear cookie.

### TC02 - Email chưa verify không được cấp session
- Precondition: user signup nhưng chưa verify email.
- Steps: login rồi gọi `POST /api/auth/exchange-session`.
- Expected UI: thông báo cần xác minh email, có hướng dẫn gửi lại email.
- Expected API: `200` với `requiresEmailVerification=true`, không set refresh cookie.

### TC03 - Refresh token invalid/revoked
- Precondition: sửa/tamper refresh cookie hoặc dùng token đã revoke.
- Steps: gọi `POST /api/auth/refresh`.
- Expected UI: yêu cầu đăng nhập lại.
- Expected API: `401`, không cấp token mới.

### TC04 - Logout revoke session
- Precondition: user đang có session hợp lệ.
- Steps: gọi `POST /api/auth/logout`, sau đó gọi `POST /api/auth/refresh`.
- Expected UI: logout xong về login.
- Expected API: logout `200` + clear cookie; refresh sau logout `401`.

## P1

### TC05 - Login sai thông tin
- Precondition: user đã tồn tại.
- Steps: login sai mật khẩu.
- Expected UI: lỗi thân thiện, không vào app.
- Expected API: không tạo session.

### TC06 - Rate limit exchange-session và refresh
- Precondition: script spam request nhanh trong 60 giây.
- Steps: gọi liên tục vượt ngưỡng.
- Expected UI: thông báo thử lại sau.
- Expected API: `429`, có thông tin retry.

## P2

### TC07 - Chất lượng thông báo lỗi
- Kiểm tra text tiếng Việt rõ ràng, không jargon kỹ thuật.

## Security checklist
- [ ] Refresh cookie có `HttpOnly`.
- [ ] Refresh cookie có `SameSite=Lax`.
- [ ] `Secure=true` ở staging/prod HTTPS.
- [ ] Refresh token không trả về trong JSON body.
- [ ] Không log refresh token plaintext.
- [ ] Có `429` cho hành vi brute force cơ bản.

## Go / No-Go
- **Go** khi toàn bộ P0 pass và không có lỗi bảo mật mức nghiêm trọng.
- **No-Go** nếu có bypass verify email, lỗi rotate/revoke refresh token, hoặc lộ token.
