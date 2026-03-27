# BRD Logic Đăng Ký / Đăng Nhập (RYEX Crypto MVP)

**Tài liệu này thay thế toàn bộ nội dung `docs/BRD/logic-dang-ky-login.md`.**  
**Phạm vi:** luồng Signup bằng email/password + popup xác nhận gửi email verification link + đăng nhập qua email link (Firebase), bám theo trạng thái UI/routes hiện tại trong codebase.

---

## 0) Ranh giới Business vs Kỹ thuật

### Business scope (what/why)
- Mục tiêu MVP: user tạo tài khoản và hoàn tất lần đăng nhập đầu tiên an toàn, ít friction.
- Trọng tâm nghiệp vụ:
  - Signup với `email + password`.
  - Hiển thị popup xác nhận gửi email verification link.
  - User click link trong email để hoàn tất xác minh email và đăng nhập.
- UX constraints bắt buộc:
  - Trang signup **không hiển thị navigation bar** kiểu landing.
  - Logo RYEX trên signup click về landing (`/`).
  - Nếu có dải đen header/footer trên signup: ghi nhận là **bug layout/theme**.

### Technical boundary (how)
- Routes hiện có: `/`, `/app/auth/login`, `/app/auth/signup`, `/app/market`.
- UI auth hiện mostly static (email/password form, tab phone disabled, logo link `/`).
- Landing có validation email CTA và prefill query param sang signup.
- Firebase + PostgreSQL config đã có qua `.env.local` (chỉ dùng biến môi trường; **không đưa secret vào docs/log/UI**).

---

## 1) Problem Framing

### Business goal
- Giảm time-to-first-trade bằng luồng account creation + verified sign-in đơn giản, đáng tin cậy.
- Chuẩn hóa identity tối thiểu cho user trước khi vào khu vực giao dịch.

### User pain
- User mới thường bỏ dở khi signup dài hoặc không hiểu bước xác minh email.
- Nếu UX không rõ trạng thái “đã gửi email/chưa gửi/chết link” thì tỷ lệ hoàn tất đăng nhập giảm.

### Success metrics (MVP)
- `Signup Start -> Signup Submit` conversion >= 70%.
- `Signup Submit -> Email Link Clicked` conversion >= 55%.
- `Email Link Clicked -> First Successful Login` conversion >= 90%.
- Tỷ lệ lỗi kỹ thuật luồng signup/login < 2% sessions.
- Không có bug P0 về layout/theme (đặc biệt dải đen bất thường ở signup).

---

## 2) Requirement Clarification

### Assumptions
1. Firebase Auth là nguồn sự thật cho email verification state ở MVP.
2. Email verification link khi click sẽ đồng thời đưa user vào trạng thái authenticated (email-link sign-in flow).
3. Chỉ hỗ trợ email/password; phone tab tiếp tục disabled trong MVP.
4. Sau đăng nhập thành công, điều hướng chính thức về `/app/market`.
5. Không thay đổi legal text/phạm vi compliance nếu chưa có xác nhận PO + Compliance.

### Constraints
- Không lộ private key/secret trong code client, logs, analytics payload, tài liệu BRD.
- Signup page không mang nav landing; giữ logo RYEX link về `/`.
- Luồng phải tương thích với prefill email từ landing query param.
- Tài liệu phải testable bằng Given/When/Then.
- Password policy MVP chính thức: tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.
- Sau verify email thành công: auto-login và chuyển về `/app/market`.
- Không triển khai CAPTCHA trong scope hiện tại.

### Open questions (tóm tắt)
- Xem chi tiết tại mục **12) Danh sách câu hỏi cần PO trả lời**.

---

## 3) User Stories

- **US-01 (P0):** Là user mới, tôi muốn tạo tài khoản bằng email + password để bắt đầu sử dụng RYEX.
- **US-02 (P0):** Là user mới sau khi submit signup, tôi muốn thấy popup xác nhận gửi email verification để biết bước tiếp theo cần làm.
- **US-03 (P0):** Là user mới, tôi muốn click link trong email để được xác minh email và đăng nhập ngay, nhằm giảm friction.
- **US-04 (P0):** Là user, tôi muốn thấy thông báo lỗi rõ ràng khi email/password không hợp lệ hoặc link hết hạn, để tự xử lý nhanh.
- **US-05 (P0-Defect):** Là user, tôi cần trang signup đúng layout/theme (không có dải đen header/footer) để trải nghiệm nhất quán và tin cậy.
- **US-06 (P1):** Là user, tôi muốn có resend verification email với cooldown hợp lý khi chưa nhận được mail.
- **US-07 (P1):** Là product team, tôi muốn tracking các mốc signup/login để tối ưu conversion.

---

## 4) Acceptance Criteria (Given/When/Then)

### AC-01 (US-01) - Signup thành công và chuyển bước xác minh
- **Given** user ở `/app/auth/signup`, nhập email hợp lệ + password đạt policy MVP (>=8 ký tự, có chữ hoa, số, ký tự đặc biệt)  
- **When** user bấm `Create account`  
- **Then** hệ thống tạo account thành công và hiển thị popup xác nhận gửi email verification link.

### AC-02 (US-01) - Validation input
- **Given** user nhập email sai format hoặc password không đạt policy  
- **When** user bấm submit  
- **Then** không gọi flow tạo account thành công, hiển thị lỗi inline rõ nghĩa tại field tương ứng.

### AC-03 (US-02) - Popup nội dung và hành vi cơ bản
- **Given** account được tạo thành công  
- **When** popup xuất hiện  
- **Then** popup phải nêu rõ: “đã gửi email verification link”, “kiểm tra inbox/spam”, và CTA đóng/ok rõ ràng.

### AC-04 (US-03) - Click email link đăng nhập thành công
- **Given** user nhận được verification link hợp lệ  
- **When** user click link  
- **Then** email được đánh dấu verified, user auto-login và điều hướng về `/app/market`.

### AC-05 (US-03) - Link không hợp lệ/hết hạn
- **Given** link verification không hợp lệ hoặc hết hạn  
- **When** user mở link  
- **Then** hiển thị màn hình/trạng thái lỗi có hướng dẫn rõ (resend link hoặc quay lại login/signup).

### AC-06 (US-04) - Tài khoản đã tồn tại
- **Given** email đã có account  
- **When** user submit signup  
- **Then** hiển thị lỗi “Email đã được sử dụng, hãy sử dụng email khác”.

### AC-07 (US-04) - Hệ thống gửi mail thất bại tạm thời
- **Given** signup tạo account thành công nhưng gửi email lỗi tạm thời  
- **When** hệ thống nhận lỗi provider  
- **Then** hiển thị trạng thái thất bại có thể retry/resend, không để user hiểu nhầm là hoàn tất.

### AC-08 (US-05) - UX constraints trên signup
- **Given** user truy cập `/app/auth/signup`  
- **When** trang render  
- **Then** không có navigation bar kiểu landing; logo RYEX click về `/`.

### AC-09 (US-05) - Defect layout/theme
- **Given** xuất hiện dải đen header/footer bất thường trên signup  
- **When** QA hoặc user phát hiện  
- **Then** ghi nhận defect P0/P1 theo mức độ ảnh hưởng, có testcase hồi quy theme/layout.

### AC-10 (US-07) - Tracking tối thiểu
- **Given** user đi qua signup/login steps  
- **When** mỗi mốc chính xảy ra  
- **Then** hệ thống phát event tracking với properties tối thiểu theo mục Analytics, không chứa secret/PII không cần thiết.

---

## 5) Prioritized Backlog (P0/P1/P2)

| ID | Item | Priority | Effort | Dependency | Ghi chú |
|---|---|---|---|---|---|
| BL-01 | Kích hoạt submit signup email/password end-to-end | P0 | M | Firebase Auth config server/client split | Chặn activation |
| BL-02 | Popup xác nhận gửi verification link sau signup thành công | P0 | S | BL-01 | Copy rõ ràng, dễ hiểu |
| BL-03 | Email-link sign-in + verify email flow | P0 | M/L | BL-01, Firebase action handler | Chặn first login |
| BL-04 | Error states chuẩn hóa (invalid input, email exists, expired/invalid link, provider error) | P0 | M | BL-01/03 | Bắt buộc cho QA pass |
| BL-05 | Enforce UX signup (no landing nav, logo về `/`) | P0 | S | FE layout | Bắt buộc theo PO |
| BL-06 | Defect fix: dải đen header/footer signup (nếu phát hiện) | P0-Defect | S/M | FE theme/layout | Tạo ticket riêng + regression |
| BL-07 | Tracking events signup/login tối thiểu | P1 | S/M | FE/BE instrumentation | Cần cho đo conversion |
| BL-08 | Resend verification email + cooldown | P1 | M | BL-03 | Giảm drop-off |
| BL-09 | Prefill email từ landing -> signup consistency + edge cases | P1 | S | Landing CTA existing logic | Tăng conversion |
| BL-10 | UX polish (microcopy/empty states) | P2 | S | Sau khi P0 ổn định | Không chặn launch |

---

## 6) Risks & Mitigations

### Product risk
- **Risk:** User không hiểu bước “check email” nên drop cao.  
- **Mitigation:** Popup copy rõ + trạng thái resend + guidance inbox/spam.

### Compliance risk
- **Risk:** Luồng xác minh email chưa map đầy đủ với policy KYC/AML theo thị trường mục tiêu.  
- **Mitigation:** Xác thực với legal/compliance trước launch từng thị trường; tài liệu hóa rõ “email verification != KYC completed”.

### Fraud/abuse risk
- **Risk:** Spam signup/email abuse, credential stuffing ở login.  
- **Mitigation:** Rate-limit theo IP/device/email, bot protection (captcha nếu cần), theo dõi anomaly event.

### Technical delivery risk
- **Risk:** Mismatch giữa static UI hiện tại và backend auth flow thật, gây regression route/session.  
- **Mitigation:** Chốt contract FE/BE sớm, P0 test matrix bắt buộc, staging E2E trước release.

### Security risk (secret handling)
- **Risk:** Secret/private key lộ qua client bundle/log/docs.  
- **Mitigation:** Chỉ dùng env phía server cho secret; review logs; redact payload analytics; cấm hardcode.

### Link validity risk
- **Risk:** TTL verification link quá ngắn gây drop-off, quá dài tăng rủi ro lạm dụng.
- **Mitigation:** Dùng TTL theo mặc định của Firebase (phù hợp best practice và tránh conflict implementation hiện tại), theo dõi tỉ lệ `expired_link` để tinh chỉnh sau.

---

## 7) Analytics Spec (tối thiểu)

| Event name | Trigger point | Required properties |
|---|---|---|
| `auth_signup_viewed` | Mở trang `/app/auth/signup` | `route`, `source` (landing/direct), `prefill_email` (bool) |
| `auth_signup_submitted` | Bấm submit signup | `route`, `email_domain`, `password_policy_pass` (bool) |
| `auth_signup_succeeded` | Account tạo thành công | `route`, `user_id_hash`, `verification_email_sent` (bool) |
| `auth_signup_failed` | Signup lỗi | `route`, `error_code`, `error_type` (validation/provider/conflict) |
| `auth_verification_popup_shown` | Popup hiển thị | `route`, `email_domain` |
| `auth_verification_link_clicked` | Nhận callback từ link click | `link_status` (valid/expired/invalid), `route` |
| `auth_login_success` | Đăng nhập hoàn tất | `route`, `method` (email_link), `email_verified` (bool) |
| `auth_login_failed` | Đăng nhập thất bại | `route`, `method`, `error_code` |

**Lưu ý data policy:** không gửi password, token, private key, raw secret vào event payload.

---

## 8) Definition of Done (DoD) theo Epic

### Epic A - Signup + Verification popup
- P0 AC-01/02/03 pass trên staging.
- Không có bug P0 về layout/signup nav.
- FE copy được PO duyệt.

### Epic B - Email-link sign-in + verify
- P0 AC-04/05/06/07 pass.
- Session/redirect đúng policy đã chốt (`/app/market`, auto-login sau verify).
- Có log lỗi chuẩn hóa cho support/ops.

### Epic C - UX/Theming integrity
- P0 AC-08/09 pass.
- Không còn dải đen header/footer ở signup.
- Regression test auth pages pass.

---

## 9) Handoff-ready Checklist (FE/BE/QA)

### FE checklist
- Render signup đúng route `/app/auth/signup`.
- No landing navbar; logo RYEX link `/`.
- Submit form gọi flow signup thật, không còn static-only.
- Popup verification hiển thị đúng states.
- Handle đầy đủ error states và màn hình expired/invalid link.
- Không render/console bất kỳ thông tin secret.

### BE checklist
- Expose/hoàn thiện auth endpoints/handlers cần cho signup + email-link verification/sign-in.
- Chuẩn hóa error codes để FE map message ổn định.
- Bảo đảm secret ở server env; không leak vào client.
- Logging có redaction cho thông tin nhạy cảm.
- Rate limiting cơ bản cho signup/login endpoints.

### QA checklist
- Test đầy đủ AC-01..AC-10.
- Test cross-browser cơ bản (Chrome/Safari/Firefox mới).
- Test responsive signup layout + kiểm tra dải đen header/footer.
- Test link valid/expired/invalid.
- Verify tracking events bắn đúng tên + properties tối thiểu.
- Báo cáo defect theo severity (P0/P1/P2) + repro steps rõ.

---

## 10) P0 Test Cases (thực thi ngay)

| TC ID | Scenario | Precondition | Steps | Expected |
|---|---|---|---|---|
| TC-P0-01 | Signup happy path | Email mới, password hợp lệ | Mở signup -> nhập form -> submit | Popup verification xuất hiện |
| TC-P0-02 | Invalid email | N/A | Nhập email sai format -> submit | Lỗi inline email, không tạo account |
| TC-P0-03 | Weak password | N/A | Nhập password không đạt policy -> submit | Lỗi inline password |
| TC-P0-04 | Email exists | Email đã đăng ký | Submit signup | Thông báo email tồn tại + hướng login |
| TC-P0-05 | Verification link valid | Đã nhận mail | Click link | Verify + login success + redirect đúng |
| TC-P0-06 | Verification link expired | Link hết hạn | Click link | Thông báo link expired + hướng resend |
| TC-P0-07 | Verification link invalid | Link sai | Click link | Thông báo invalid + hướng quay lại |
| TC-P0-08 | Signup layout rules | N/A | Mở `/app/auth/signup` | Không nav landing, logo link `/`, không dải đen |
| TC-P0-09 | Provider transient error | Mock lỗi gửi mail | Submit signup | Error rõ + khả năng retry/resend |
| TC-P0-10 | Security/log hygiene | N/A | Thực hiện flow và kiểm tra logs/network | Không có secret/private key/password trong output |

---

## 11) Defect Backlog Seed (liên quan yêu cầu PO)

- **DEF-01 (P0/P1 tùy mức độ):** Dải đen header/footer xuất hiện trên signup.
  - Ảnh hưởng: trust giảm, cảm giác lỗi hệ thống.
  - Owner đề xuất: FE.
  - QA testcase liên quan: `TC-P0-08` + responsive regression.

---

## 12) Danh sách câu hỏi cần PO trả lời

1. Có cần chặn domain email tạm thời/disposable trong MVP không?
2. Tracking event `email_domain` có cần hash/anonymize thêm theo chính sách privacy nội bộ không?
3. Khu vực thị trường mục tiêu launch đầu tiên là gì để đối chiếu checklist compliance tối thiểu?
4. Có cần legal disclaimer cụ thể trên signup/login tại MVP không (terms/privacy wording, checkbox bắt buộc)?
