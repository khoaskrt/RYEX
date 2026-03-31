# Auth DB Readiness Checklist (Pre-Dev Assignment)

Mục tiêu: xác nhận PostgreSQL đã sẵn sàng lưu dữ liệu đăng nhập và pass logic trong `docs/BRD/logic-dang-ky-login.md`.

## 1) DDL/Migration
- [ ] Chạy migration `db/migrations/001_auth_identity_baseline.sql` thành công trên môi trường dev.
- [ ] Extension `citext` đã bật.
- [ ] Tạo đủ 6 bảng: `users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events`.
- [ ] Tất cả unique/index/check constraints tạo thành công.

## 2) Contract với Auth Flow
- [ ] Có mapping `firebase_uid` <-> `users.id`.
- [ ] Có trường mirror `email_verified` trong `auth_identities`.
- [ ] Có bảng event cho verification và login để audit.
- [ ] Có bảng `user_sessions` để lưu metadata session nội bộ.

## 3) Security/Data Governance
- [ ] Không lưu password, verify token, private key trong PostgreSQL.
- [ ] Logs/audit payload đã redacted dữ liệu nhạy cảm.
- [ ] Secrets chỉ dùng từ server env.

## 4) Runtime Smoke Tests (BE thực thi)
- [ ] Signup success: ghi `users` + `auth_identities` + `auth_verification_events`.
- [ ] Email exists: trả error đúng message BA, không ghi row lỗi sai.
- [ ] Verify success: cập nhật `email_verified=true`, ghi login/verification events, tạo `user_sessions`, redirect `/app/market`.
- [ ] Verify invalid/expired: ghi failure event code đúng taxonomy.

## 5) Go/No-Go cho assign team
- [ ] Nếu mục 1-4 pass: có thể assign song song cho BE/FE/QA.
- [ ] Nếu fail mục nào: fix migration/contract trước khi assign rộng.
