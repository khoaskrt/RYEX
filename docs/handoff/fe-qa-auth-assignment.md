# FE + QA Assignment Package - Auth Flow (RYEX MVP)

## 1) Product brief
- **Business goal:** giúp user mới hoàn tất signup -> verify email -> auto-login vào `/app/market` nhanh, rõ trạng thái, an toàn tối thiểu.
- **User pain:** dễ drop nếu không hiểu bước verify email hoặc gặp lỗi callback/session mà không có hướng dẫn xử lý.
- **Success metric (P0):**
  - `signup_submit -> verification_popup_shown` >= 95%
  - `verification_link_clicked -> login_success` >= 90%
  - auth technical error rate < 2% sessions

## 2) Requirement clarification
- **Assumptions**
  - FE chỉ wiring UI hiện có, không redesign.
  - Backend contract là source of truth cho code/message/redirect.
  - Verify thành công sẽ đi qua `session/sync` rồi vào `/app/market`.
- **Constraints**
  - Signup page không có landing nav; logo click về `/`.
  - Message email exists phải đúng nguyên văn: `Email đã được sử dụng, hãy sử dụng email khác`.
  - Password policy: `>=8`, có `uppercase`, `number`, `special`.
  - Không triển khai CAPTCHA trong scope này.
- **Open questions**
  - Chưa có câu hỏi blocker cho FE/QA P0. Câu hỏi product/compliance còn lại theo BRD sẽ xử lý sau release P0.

## 3) User stories ưu tiên cho FE wiring
- **US-P0-1:** As a new user, I want to sign up bằng email/password để tạo tài khoản và nhận hướng dẫn verify ngay.
- **US-P0-2:** As a new user, I want hệ thống xử lý verification callback + auto-login để vào `/app/market` không bị kẹt bước trung gian.
- **US-P0-3:** As a user, I want thấy lỗi theo từng integration state (validation, exists, invalid/expired link, provider error) để biết cách xử lý.
- **US-P0-4:** As a user, I want signup UX đúng ràng buộc (no landing nav, logo về `/`) để trải nghiệm nhất quán và tin cậy.
- **US-P1-1:** As a product team, I want event tracking auth tối thiểu để đo funnel và tối ưu conversion.

## 4) Acceptance criteria (Given/When/Then - focus integration states)

### AC-01 Signup success -> popup
- **Given** user ở `/app/auth/signup`, nhập email hợp lệ và password đạt policy
- **When** bấm submit và API `POST /api/v1/auth/signup` trả `201`
- **Then** hiển thị popup xác nhận đã gửi email verify, nêu rõ check inbox/spam

### AC-02 Signup validation fail
- **Given** input email/password không hợp lệ
- **When** submit form
- **Then** chặn submit thành công và hiển thị lỗi inline đúng field

### AC-03 Existing email
- **Given** email đã tồn tại
- **When** `POST /api/v1/auth/signup` trả `409 AUTH_EMAIL_ALREADY_EXISTS`
- **Then** hiển thị đúng message: `Email đã được sử dụng, hãy sử dụng email khác`

### AC-04 Verify callback valid -> auto-login
- **Given** user mở link verify hợp lệ
- **When** FE gọi `GET /api/v1/auth/verify-email/callback` nhận `verified=true, autoLoginReady=true`
- **Then** FE gọi `POST /api/v1/auth/session/sync` thành công và redirect `/app/market`

### AC-05 Verify callback invalid/expired
- **Given** link verify không hợp lệ hoặc hết hạn
- **When** callback trả `400 AUTH_VERIFICATION_LINK_INVALID` hoặc `410 AUTH_VERIFICATION_LINK_EXPIRED`
- **Then** hiển thị trạng thái lỗi đúng ngữ cảnh + CTA quay lại login/signup

### AC-06 Session sync fail
- **Given** callback verify valid nhưng `POST /api/v1/auth/session/sync` lỗi (`401/403/429/500`)
- **When** FE nhận error code
- **Then** không redirect mù; hiển thị lỗi có hướng dẫn retry hoặc quay lại login

### AC-07 UX constraint signup
- **Given** user mở `/app/auth/signup`
- **When** trang render
- **Then** không hiển thị landing nav; logo RYEX click về `/`

### AC-08 Provider temporary failure
- **Given** signup gặp lỗi provider tạm thời (`503 AUTH_PROVIDER_TEMPORARY_FAILURE`)
- **When** submit form
- **Then** hiển thị trạng thái thất bại tạm thời có thể thử lại, không hiểu nhầm là signup hoàn tất

## 5) Prioritized backlog (FE + QA)
| ID | Item | Priority | Effort | Owner | Dependency |
|---|---|---|---|---|---|
| FE-01 | Wire submit signup -> `POST /api/v1/auth/signup` | P0 | M | FE | BE endpoint live |
| FE-02 | Wire verify callback route/state -> `GET /api/v1/auth/verify-email/callback` | P0 | M | FE | FE-01, BE callback contract |
| FE-03 | Wire auto-login sync -> `POST /api/v1/auth/session/sync` + redirect `/app/market` | P0 | M | FE | FE-02 |
| FE-04 | Error-state mapping theo `error.code` (409/400/410/429/503/500/401/403) | P0 | M | FE | FE-01..03 |
| FE-05 | Enforce UX signup constraints (no nav, logo `/`) | P0 | S | FE | None |
| QA-01 | Integration test matrix P0 theo AC-01..08 | P0 | M | QA | FE-01..05 ready on staging |
| QA-02 | Regression test auth routes + redirect/session states | P0 | M | QA | QA-01 |
| QA-03 | Verify analytics event firing + required properties | P1 | S | QA | FE analytics instrumentation |
| FE-06 | Improve error microcopy/empty states (non-blocking) | P2 | S | FE | P0 stabilized |

## 6) Risk register + mitigation
| Risk type | Risk | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Product | User không hiểu bước verify email | Drop conversion sau signup | Popup copy rõ + state lỗi có CTA rõ ràng | FE/BA |
| Compliance | Email verification bị hiểu nhầm là hoàn tất KYC | Sai kỳ vọng nghiệp vụ | Giữ copy trung tính; xác thực wording với compliance theo thị trường mục tiêu | BA/PO |
| Fraud/Abuse | Abuse signup cao vì chưa có CAPTCHA | Tăng spam/rate-limit hit | Dựa vào BE rate-limit + theo dõi spike error/abuse events | BE/QA |
| Technical delivery | Callback/sync mismatch gây redirect lỗi | User kẹt giữa flow | Test matrix callback + session sync + retry path bắt buộc trước go-live | FE/QA |
| Security | Lộ token/secret qua log/event | Rủi ro bảo mật nghiêm trọng | Không log secret; QA kiểm tra network/log hygiene trong P0 test | BE/QA |

## 7) Analytics events tối thiểu
| Event name | Trigger point | Required properties |
|---|---|---|
| `auth_signup_viewed` | Mở `/app/auth/signup` | `route`, `source`, `prefill_email` |
| `auth_signup_submitted` | Bấm submit signup | `route`, `email_domain`, `password_policy_pass` |
| `auth_signup_succeeded` | Nhận `201` từ signup API | `route`, `verification_email_sent` |
| `auth_signup_failed` | Signup fail | `route`, `error_code`, `error_type` |
| `auth_verification_callback_received` | FE nhận callback response | `link_status`, `route` |
| `auth_session_sync_succeeded` | Session sync success | `route`, `email_verified` |
| `auth_session_sync_failed` | Session sync fail | `route`, `error_code` |
| `auth_login_success` | Redirect thành công vào `/app/market` | `route`, `method` |

## 8) Checklist bàn giao hành động

### FE checklist (actionable)
- Map đúng API:
  - `POST /api/v1/auth/signup`
  - `GET /api/v1/auth/verify-email/callback`
  - `POST /api/v1/auth/session/sync`
  - `POST /api/v1/auth/logout` (nếu có entry point logout trong flow test)
- Dùng `error.code` để map state, không hardcode theo status text.
- Giữ nguyên message `AUTH_EMAIL_ALREADY_EXISTS` theo yêu cầu.
- Confirm signup page: không landing nav, logo về `/`.
- Đảm bảo không ghi log password/token/secret ở client console.
- Bắn đầy đủ analytics P0/P1 minimal events.

### QA checklist (actionable)
- Chạy full P0 integration matrix theo AC-01..08 trên staging.
- Test callback states: valid / invalid / expired link; verify redirect chỉ xảy ra khi sync success.
- Verify mapping message/code cho `AUTH_EMAIL_ALREADY_EXISTS`.
- Kiểm tra password policy cả client validation và server response.
- Kiểm tra security hygiene: không có secret/password/token trong network logs, error payload hiển thị ra UI.
- Xuất defect report theo severity (P0/P1/P2) kèm steps, evidence, expected vs actual.

## 9) Definition of done cho gói FE+QA
- FE hoàn tất FE-01..05, pass self-test theo AC-01..08.
- QA pass QA-01..02, không còn defect P0 ở auth flow.
- Analytics events tối thiểu được QA verify ở staging.
- Handoff release note có danh sách known issues (nếu còn) và owner/ETA rõ ràng.
