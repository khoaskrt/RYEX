# 003-Resend-and-rate-limit - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Kiểm soát tần suất gửi lại email xác minh/challenge để vừa bảo vệ hệ thống, vừa giữ trải nghiệm user rõ ràng.
- User pain:
  - User cần gửi lại email khi chưa nhận được email trước.
  - Nếu bị giới hạn mà không có thông báo rõ ràng, user dễ bối rối và bỏ luồng.
- KPI:
  - `Resend success rate`.
  - Tỷ lệ `429` theo `AUTH_RESEND_COOLDOWN` và `AUTH_RESEND_HOURLY_CAP_REACHED`.
  - Tỷ lệ retry thành công sau cooldown.
  - Tỷ lệ khiếu nại “không nhận email” sau khi đã resend.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `POST /api/v1/auth/resend`.
    - Validate `email`, `flowType`.
    - Cooldown 60 giây/lần gửi.
    - Hourly cap 2 lần/giờ mỗi email.
    - Gửi email theo 2 flow:
      - `signup_verify` -> verification email.
      - `login_challenge` -> sign-in link email.
  - `P1`:
    - Chuẩn hóa success payload về contract `{ data, meta }` theo roadmap non-breaking.
    - Chuẩn hóa monitoring theo requestId/error.code.
  - `P2`:
    - Tối ưu copy UX cho từng error case ở FE (cooldown/cap/provider error).
- Out-of-scope:
  - Quản lý deliverability ở tầng email provider sâu (SPF/DKIM/domain reputation).
  - Multi-channel resend (SMS/push).

## 3. Runtime Gap (if any)
- Expected behavior:
  - Resend chỉ thành công khi input hợp lệ và không vi phạm cooldown/cap.
  - Khi bị chặn resend, user nhận reason cụ thể để biết thời điểm thử lại.
- Current behavior:
  - Endpoint đã có validation flowType, cooldown 60s, hourly cap 5 lần/giờ.
  - Lỗi đã trả `error.code` chuẩn `AUTH_*`.
  - Success payload vẫn ở top-level, chưa theo wrapper chuẩn.
- Proposed resolution:
  - Giữ logic hiện tại làm baseline.
  - Khóa QA contract-first cho toàn bộ nhánh resend.
  - Ở phase tiếp theo chuẩn hóa success shape theo `docs/contracts/api-v1.md`.

## 4. User stories
- US-01:
  - Là user mới đăng ký, tôi muốn gửi lại email xác minh khi chưa nhận được email.
- US-02:
  - Là user đăng nhập qua challenge, tôi muốn gửi lại link đăng nhập khi link cũ hết hiệu lực/không nhận được.
- US-03:
  - Là user thao tác quá nhanh, tôi muốn hệ thống báo rõ còn bao lâu mới gửi lại được.
- US-04:
  - Là user đã gửi quá nhiều lần trong 1 giờ, tôi muốn nhận thông báo giới hạn rõ ràng.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Missing input):
  - Given thiếu `email` hoặc `flowType`
  - When gọi `POST /api/v1/auth/resend`
  - Then trả `400` với `error.code = AUTH_INVALID_INPUT`.

- AC-02 (Invalid flowType):
  - Given `flowType` không thuộc `signup_verify` hoặc `login_challenge`
  - When gọi resend
  - Then trả `400` với `error.code = AUTH_INVALID_INPUT`.

- AC-03 (Cooldown enforced):
  - Given email vừa gửi thành công trong vòng < 60 giây
  - When gọi resend
  - Then trả `429` với `error.code = AUTH_RESEND_COOLDOWN` và `error.details.cooldownRemaining`.

- AC-04 (Hourly cap enforced):
  - Given email đã có >= 5 lần gửi thành công trong 1 giờ gần nhất
  - When gọi resend
  - Then trả `429` với `error.code = AUTH_RESEND_HOURLY_CAP_REACHED`.

- AC-05 (Signup verify resend success):
  - Given flowType `signup_verify`, input hợp lệ, không vi phạm limit
  - When gọi resend
  - Then trả `200` với `success=true`, `cooldownSeconds=60`, `requestId`.

- AC-06 (Login challenge resend success):
  - Given flowType `login_challenge`, input hợp lệ, không vi phạm limit
  - When gọi resend
  - Then trả `200` với `success=true`, `cooldownSeconds=60`, `requestId`.

- AC-07 (Provider temporary failure):
  - Given provider gửi email lỗi tạm thời
  - When gọi resend
  - Then trả `503` với `error.code = AUTH_PROVIDER_TEMPORARY_FAILURE`.

- AC-08 (Audit/event trace):
  - Given resend gửi thành công
  - When request hoàn tất
  - Then hệ thống ghi `auth_verification_events` (`resend_email_sent`) và `audit_events` (`AUTH_RESEND_EMAIL_SENT`).

## 6. Impact map
- FE impact:
  - Auth screens cần map đúng lỗi:
    - `AUTH_RESEND_COOLDOWN`
    - `AUTH_RESEND_HOURLY_CAP_REACHED`
    - `AUTH_PROVIDER_TEMPORARY_FAILURE`
  - Hiển thị countdown/CTA retry phù hợp.
- BE impact:
  - Route `src/app/api/v1/auth/resend/route.js`.
  - Repository functions:
    - `getRecentResendStats`
    - `insertVerificationEvent`
    - `insertAuditEvent`
  - Provider call:
    - `sendVerificationEmail`
    - `sendSignInLinkEmail`
- QA impact:
  - Test matrix bắt buộc cho cả 2 flowType.
  - Test nhánh limit/cooldown/provider failure.
  - Verify status + response shape + `error.code` + event/audit side effect.

## 7. Risks + decisions
- Risks:
  - R-01: Rate limit in-memory có thể không nhất quán khi chạy multi-instance.
  - R-02: Provider outage làm tăng tỷ lệ resend thất bại.
  - R-03: FE copy không rõ có thể làm user spam retry.
- Decisions cần PO chốt:
  - D-01: Có cần hiển thị countdown realtime ở FE cho cooldownRemaining không.
  - D-02: Khi scale, thời điểm chuyển cooldown/cap sang shared rate-limit store.

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `003-resend-and-rate-limit`.
- Reason:
  - Cần chuẩn hóa nghiệp vụ resend và kiểm soát abuse theo contract testable.
- Impact:
  - Tạo baseline handoff FE/BE/QA cho luồng resend của signup và login challenge.
