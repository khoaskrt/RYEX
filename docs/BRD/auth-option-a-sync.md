# Auth Option A Sync Addendum (MVP)

## 1) Problem framing
- **Business goal:** Chốt auth flow Option A để user hoàn tất signup -> verify -> login vào app/market an toàn, đồng thời có cơ chế trusted device để giảm ma sát lặp lại.
- **User pain:** User dễ drop nếu không nhận mail hoặc không hiểu vì sao bị yêu cầu xác minh lại khi login.
- **Success metric:**
  - `signup_submit -> email_verified` >= 55%
  - `login_start -> login_success` >= 85% (với trusted device), >= 70% (không trusted device)
  - `resend_click -> resend_success` >= 95%
  - Auth technical error rate < 2% sessions

## 2) Assumptions
- PO chốt **Option A cho MVP**: login yêu cầu email-link challenge mỗi lần, ngoại trừ trusted device còn hiệu lực.
- Verify email là bắt buộc trước khi vào `/app/market`; account chưa verify không được vào app/market.
- Trusted device TTL = 30 ngày, gắn theo user + device fingerprint/session binding phía backend.
- Nếu mail provider chậm/lỗi, user tự bấm resend; chưa triển khai edge cases nâng cao ngoài cooldown + cap.
- Resend verification email được đưa vào scope triển khai ngay (P0).
- UX signup giữ constraint từ skill: không landing nav, logo về `/`, bug dải đen phải vào defect backlog.

## 3) User stories
- **US-01 (P0):** Là user mới, tôi muốn signup bằng email/password để tạo account.
- **US-02 (P0):** Là user mới, tôi muốn verify email bắt buộc trước khi vào app/market để account được kích hoạt đúng chuẩn.
- **US-03 (P0):** Là user đăng nhập, tôi muốn nhận email-link challenge mỗi lần login để đảm bảo an toàn.
- **US-04 (P0):** Là user thường dùng, tôi muốn trusted device 30 ngày để giảm bước xác minh lặp lại.
- **US-05 (P0):** Là user chưa nhận được email, tôi muốn bấm resend verification email để tiếp tục flow.
- **US-06 (P0):** Là user, tôi muốn signup page đúng layout (không nav landing, logo về `/`) để không bị nhiễu onboarding.

## 4) Acceptance criteria (Given/When/Then)

### AC-01 Signup tạo account
- **Given** user ở `/app/auth/signup`, nhập email hợp lệ và password đạt policy
- **When** user bấm `Create account`
- **Then** hệ thống tạo account trạng thái `pending_email_verification` và hiển thị trạng thái đã gửi email verify.

### AC-02 Chặn vào app khi chưa verify
- **Given** account chưa verify email
- **When** user cố truy cập `/app/market`
- **Then** hệ thống chặn truy cập và điều hướng về auth flow kèm thông báo cần verify email.

### AC-03 Verify email thành công
- **Given** user mở verification link hợp lệ
- **When** callback verify thành công
- **Then** account chuyển `active`, user được vào app/market theo redirect contract.

### AC-04 Login challenge mỗi lần (không trusted)
- **Given** user đã có account verified nhưng không có trusted device còn hiệu lực
- **When** user bấm login
- **Then** hệ thống gửi email-link challenge và chỉ login thành công sau khi user click link hợp lệ.

### AC-05 Bypass challenge với trusted device 30 ngày
- **Given** user đã từng hoàn tất challenge trên cùng device và chọn trusted device
- **When** user login lại trong vòng 30 ngày
- **Then** hệ thống cho phép login không yêu cầu email-link challenge mới.

### AC-06 Trusted device hết hạn
- **Given** trusted device đã quá 30 ngày hoặc bị revoke
- **When** user login
- **Then** hệ thống yêu cầu email-link challenge như flow chuẩn.

### AC-07 Resend verification email thành công
- **Given** user ở trạng thái chờ verify hoặc chờ login challenge email
- **When** user bấm `Resend email`
- **Then** hệ thống gửi lại email, hiển thị thông báo thành công, và áp dụng cooldown 60 giây.

### AC-08 Cooldown resend
- **Given** user vừa bấm resend thành công
- **When** user tiếp tục bấm resend trong 60 giây
- **Then** nút resend bị disable hoặc trả lỗi cooldown rõ ràng.

### AC-09 Cap resend theo giờ
- **Given** cùng một email đã resend đủ 5 lần trong 1 giờ
- **When** user bấm resend lần tiếp theo
- **Then** hệ thống từ chối, trả mã lỗi rate-limit và hướng dẫn thử lại sau.

### AC-10 Provider chậm/lỗi
- **Given** mail provider timeout/chậm/lỗi tạm thời
- **When** user submit signup/login challenge hoặc resend
- **Then** hiển thị lỗi có thể retry/resend; không hiển thị trạng thái như đã hoàn tất verify/login.

### AC-11 UX signup constraints
- **Given** user mở `/app/auth/signup`
- **When** trang render
- **Then** không có landing nav; logo RYEX click về `/`.

### AC-12 Defect layout/theme signup
- **Given** xuất hiện dải đen header/footer trên signup
- **When** QA hoặc FE phát hiện
- **Then** ghi nhận defect riêng, gắn severity và bắt buộc fix trước release nếu ảnh hưởng onboarding trust.

## 5) Prioritized backlog (P0/P1/P2 + dependency + effort)

| ID | Backlog item | Priority | Effort | Dependency |
|---|---|---|---|---|
| BA-AUTH-01 | Chốt contract Option A: verify bắt buộc trước app/market | P0 | S | PO decision finalized |
| BE-AUTH-01 | Signup tạo account + trạng thái pending verification | P0 | M | BE auth baseline |
| BE-AUTH-02 | Gate `/app/market` theo `email_verified`/user status | P0 | M | BE-AUTH-01 |
| BE-AUTH-03 | Login email-link challenge mỗi lần (default path) | P0 | M/L | BE-AUTH-01, provider integration |
| BE-AUTH-04 | Trusted device 30 ngày (issue/check/revoke token) | P0 | M/L | BE-AUTH-03 |
| BE-AUTH-05 | Resend endpoint + cooldown 60s + cap 5/giờ/email | P0 | M | BE-AUTH-03, rate-limit service |
| FE-AUTH-01 | Signup UI state: sent/check inbox/spam + error states | P0 | M | BE-AUTH-01 |
| FE-AUTH-02 | Login flow với challenge mỗi lần + trusted device UX | P0 | M | BE-AUTH-03, BE-AUTH-04 |
| FE-AUTH-03 | Resend button/state/cooldown countdown | P0 | M | BE-AUTH-05 |
| FE-AUTH-04 | Enforce signup UX constraints + defect hook dải đen | P0 | S | Existing layout wrapper |
| QA-AUTH-01 | E2E test matrix signup/verify/login/trusted/resend | P0 | M | BE/FE P0 ready on staging |
| QA-AUTH-02 | Rate-limit + cooldown + expiry tests | P0 | M | BE-AUTH-04, BE-AUTH-05 |
| ANA-AUTH-01 | Instrument analytics events auth funnel Option A | P1 | S/M | FE/BE instrumentation |
| AUTH-OPS-01 | Alerting cho provider failure và resend rate-limit spike | P1 | S | Observability baseline |
| AUTH-UX-01 | Edge cases nâng cao resend/fallback automation | P2 | M | Post-MVP |

## 6) Risks and mitigations
- **Product risk:** Login mỗi lần tăng ma sát, giảm conversion.  
  **Mitigation:** trusted device 30 ngày, copy rõ ràng về lý do bảo mật, đo funnel theo nhóm trusted/non-trusted.
- **Compliance risk:** wording có thể bị hiểu nhầm email verify = KYC done.  
  **Mitigation:** tách rõ copy; cần xác thực với legal/compliance theo thị trường mục tiêu.
- **Fraud/abuse risk:** resend bị abuse để spam mailbox.  
  **Mitigation:** cooldown 60s, cap 5/giờ/email, rate-limit theo IP/device, monitor anomaly.
- **Technical delivery risk:** mismatch FE/BE contract cho trusted device và callback status.  
  **Mitigation:** chốt error taxonomy + contract test + staging E2E bắt buộc trước release.

## 7) Analytics events

| Event name | Trigger point | Required properties |
|---|---|---|
| `auth_signup_submitted` | User submit signup | `route`, `email_domain`, `password_policy_pass` |
| `auth_signup_created` | Account tạo thành công | `user_id_hash`, `verification_required=true` |
| `auth_verification_email_sent` | Gửi mail verify/challenge thành công | `flow_type` (`signup_verify`/`login_challenge`), `provider` |
| `auth_verification_link_clicked` | Callback nhận click link | `flow_type`, `link_status` |
| `auth_login_challenge_required` | Login cần email-link challenge | `trusted_device_present=false` |
| `auth_login_trusted_device_bypass` | Login bypass challenge | `trusted_device_age_days`, `trusted_device_present=true` |
| `auth_resend_clicked` | User bấm resend | `flow_type`, `cooldown_remaining_sec` |
| `auth_resend_blocked` | Resend bị chặn | `reason` (`cooldown`/`hourly_cap`), `attempt_count_last_hour` |
| `auth_login_success` | User vào `/app/market` | `method` (`email_link`/`trusted_device`), `email_verified=true` |
| `auth_login_failed` | Login fail | `error_code`, `flow_step` |

## 8) Open questions
- Trusted device revoke có cần UI self-service ngay trong MVP hay chỉ revoke khi logout all sessions?
- Device fingerprint strategy dùng cookie ký + UA/IP hash ở mức nào để cân bằng bảo mật và false positive?
- Khi provider down kéo dài, có cần fallback provider tự động hay giữ manual resend cho MVP (PO hiện chốt manual)?
- Resend cap 5/giờ/email có cần thêm cap theo IP để chống abuse nhóm email?
- Copy tiếng Việt cuối cùng cho trạng thái `cooldown` và `hourly_cap` do ai duyệt (PO hay Compliance)?

## 9) Task-ready breakdown (assign ngay)

### BE tasks (ready for implementation)
1. Thêm/chuẩn hóa endpoint signup + verification status gate + login challenge theo Option A.
2. Implement trusted device 30 ngày: issue token, validate token, expiry, revoke path.
3. Implement resend endpoint với rule: cooldown 60s, cap 5 lần/giờ/email, error code rõ.
4. Chuẩn hóa error codes cho FE map state: invalid/expired link, cooldown, hourly cap, provider temporary failure.
5. Bổ sung audit log + analytics hooks server-side (không log secret/token/password).

### FE tasks (ready for implementation)
1. Signup flow: hiển thị trạng thái sent/check inbox/spam + xử lý error state đầy đủ.
2. Login flow: mặc định yêu cầu challenge mỗi lần, trừ khi backend trả trusted-device bypass.
3. Resend UI: nút resend + countdown 60s + thông báo khi chạm cap 5/giờ/email.
4. Enforce UX constraints signup: không landing nav, logo về `/`; mở defect nếu có dải đen.
5. Bắn analytics events theo spec và không gửi dữ liệu nhạy cảm.

### QA tasks (ready for execution)
1. Test matrix P0: signup -> verify -> login challenge -> trusted bypass -> market access gate.
2. Test resend rules: cooldown 60s, cap 5/giờ/email, provider timeout/error.
3. Test security/privacy: không lộ secret/token/password trong UI/network/log.
4. Test UX constraints signup và regression bug dải đen theo nhiều viewport.
5. Xuất defect report severity-based (P0/P1/P2) với repro rõ + evidence.

---

### Definition of done (gói Option A sync)
- FE/BE/QA thống nhất contract cho 4 nhánh: signup verify, login challenge, trusted bypass, resend.
- Toàn bộ AC-01..AC-12 pass trên staging.
- Không còn defect P0 ở auth flow trước release.
- Event tracking chính bắn đủ để đo conversion Option A.
