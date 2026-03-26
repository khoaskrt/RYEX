## Tuần 1 MVP RYEX: UI Core + Auth OTP Email + Nền tảng kỹ thuật đồng bộ

### Tóm tắt
- Mục tiêu tuần 1: chốt được luồng người dùng đầy đủ từ landing → signup/login (OTP email chạy thật) → vào market/profile; toàn bộ nút chính điều hướng rõ ràng, có DB lưu được dữ liệu nền tảng.
- Bám hiện trạng repo: đã có khung Next.js App Router (`landing`, `market`, `auth`), nhưng hiện chủ yếu là UI tĩnh, chưa có backend auth/OTP, chưa có `profile`, chưa có DB/schema.
- Kết quả cuối tuần: demo được trên 1 môi trường deploy (staging), có tài liệu system design + checklist kiểm thử.

### Thay đổi triển khai chính
- **Kiến trúc hệ thống (đồng bộ FE/BE)**
  - Chọn mô hình `Next.js 14` fullstack: UI + API routes trong cùng codebase để đi nhanh MVP.
  - Tách lớp rõ: `features/*` cho domain UI/logic, `lib/server/*` cho service backend (auth, otp, mail, db), `shared/config/routes.js` làm nguồn route duy nhất.
  - Thiết kế session bằng `HttpOnly secure cookie` + token phiên trong DB.
- **API/Interface cần có (public nội bộ MVP)**
  - `POST /api/auth/signup/request-otp` (email, password) → tạo OTP + gửi mail.
  - `POST /api/auth/signup/verify-otp` (email, otp, password) → tạo user + tạo session.
  - `POST /api/auth/login` (email, password) → nếu bật OTP login thì gửi OTP, chưa bật thì tạo session trực tiếp (mặc định tuần 1: login bằng password, OTP bắt buộc cho signup).
  - `POST /api/auth/logout` → xoá session.
  - `GET /api/me` → trả thông tin profile cơ bản.
- **Thiết kế DB cơ bản (PostgreSQL + Prisma)**
  - `users`: id, email(unique), password_hash, email_verified_at, status, created_at, updated_at.
  - `otp_codes`: id, email, purpose(`signup_verify`), code_hash, expires_at, attempt_count, consumed_at.
  - `sessions`: id, user_id, session_token_hash, ip, user_agent, expires_at, created_at.
  - `audit_logs` (mvp nhẹ): id, user_id nullable, action, metadata jsonb, created_at.
- **Email OTP thực thi thật**
  - Provider mặc định: `Resend` (nhanh cho MVP), có interface `MailProvider` để thay sang SES/SendGrid sau.
  - OTP: 6 số, TTL 10 phút, max 5 lần nhập sai, resend cooldown 60 giây.
  - Không lưu OTP plain text; lưu hash OTP.
- **UI/Navigation**
  - Hoàn thiện screen `Profile` mới (`/app/profile`) với info cơ bản người dùng + trạng thái verify email.
  - Chuẩn hóa mọi CTA chính ở landing/auth/market/profile dùng `Link`/router theo `ROUTES`, bỏ `href="#"`.
  - Khi chưa đăng nhập: vào `/app/market` và `/app/profile` sẽ redirect `/app/auth/login`.
  - Khi đã đăng nhập: vào `/app/auth/login|signup` redirect `/app/profile`.
- **System design docs**
  - 1 tài liệu ngắn: context diagram, luồng auth OTP, sequence signup, schema DB, quyết định bảo mật MVP, lộ trình tuần 2.

### Lộ trình theo ngày (7 ngày)
1. **Day 1 (Kiến trúc + nền tảng)**: chốt ADR kỹ thuật, cài Prisma + PostgreSQL, tạo schema + migrate đầu tiên, chuẩn hóa route map.
2. **Day 2 (Auth backend core)**: service hash password, session service, API signup/login/logout/me khung chuẩn + validation.
3. **Day 3 (OTP email)**: tích hợp Resend, luồng request OTP + verify OTP + rate limit cơ bản + audit log.
4. **Day 4 (Auth UI wiring)**: nối form signup/login với API thật, xử lý state/loading/error/success, redirect theo auth state.
5. **Day 5 (Profile + guard + nav)**: build profile page, route guard middleware, fix toàn bộ button/link chính.
6. **Day 6 (Market/landing polish + data seed)**: cập nhật market/profile lấy dữ liệu từ API/DB cơ bản, seed sample users.
7. **Day 7 (Hardening + release)**: test E2E luồng chính, sửa lỗi, viết system design doc, deploy staging + checklist bàn giao.

### Test plan và tiêu chí nghiệm thu
- **Auth OTP**
  - Signup email hợp lệ nhận OTP, verify đúng tạo account.
  - OTP sai quá ngưỡng bị khóa tạm; OTP hết hạn bị từ chối.
  - OTP đã dùng không dùng lại được.
- **Login/Session**
  - Login đúng tạo session cookie; reload vẫn giữ đăng nhập.
  - Logout xóa session và không truy cập được route cần auth.
- **Navigation/UI**
  - Tất cả nút CTA chính điều hướng đúng route đích.
  - Guard hoạt động đúng cho user chưa đăng nhập/đã đăng nhập.
- **DB**
  - Có record chuẩn trong `users`, `sessions`, `otp_codes`, `audit_logs` theo từng hành vi.
- **Definition of Done tuần 1**
  - 4 màn hình chạy được: landing, market, signup/login, profile.
  - Signup/Login hoạt động thật với OTP email cho luồng đăng ký.
  - Có tài liệu system design + sơ đồ + quyết định kỹ thuật.
  - Có staging URL demo nội bộ.

### Giả định và mặc định đã chốt
- Mặc định dùng `Next.js + API Routes + PostgreSQL + Prisma + Resend`.
- Tuần 1 chưa làm KYC, trading engine, order book real-time, nạp/rút tiền thật.
- Market data tuần 1 dùng dữ liệu seed/mock có cấu trúc thật; tích hợp feed thật đẩy sang tuần 2.
- OTP bắt buộc cho signup; login dùng email+password (có thể nâng OTP login ở tuần 2).
