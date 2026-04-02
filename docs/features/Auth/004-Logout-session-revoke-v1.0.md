# 004-Logout-session-revoke - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Đảm bảo user logout an toàn: kết thúc session hiện tại, revoke trusted devices liên quan và xóa auth cookies.
- User pain:
  - User cần chắc chắn sau khi logout thì phiên đăng nhập không còn hiệu lực.
  - User kỳ vọng logout rõ ràng, không bị “logout giả” còn giữ session.
- KPI:
  - `Logout success rate` (`204`).
  - `Session close success rate` theo `session_ref`.
  - `Trusted device revoke coverage` sau logout.
  - Tỷ lệ lỗi logout (`5xx`) theo request volume.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `POST /api/v1/auth/logout`.
    - Đọc `sessionRef` từ body hoặc cookie `ryex_session_ref`.
    - Close active session.
    - Revoke trusted devices cho user của session đó.
    - Clear auth cookies (`ryex_session_ref`, trusted cookie).
  - `P1`:
    - Chuẩn hóa telemetry/audit theo requestId.
    - Chuẩn hóa contract lỗi theo chuẩn API v1 (non-breaking).
  - `P2`:
    - Mở rộng “logout all devices”.
- Out-of-scope:
  - Global logout đa thiết bị theo lựa chọn người dùng.
  - Session management UI cho end-user.

## 3. Runtime Gap (if any)
- Expected behavior:
  - Logout luôn clear cookie phía client.
  - Nếu có session hợp lệ thì kết thúc session + revoke trusted devices + ghi audit.
- Current behavior:
  - Endpoint trả `204` no-content khi xử lý xong.
  - Có logic close session, revoke trusted devices, audit event (`AUTH_LOGOUT`) nếu session tồn tại.
  - Nếu không có sessionRef thì vẫn trả `204` và clear cookies.
- Proposed resolution:
  - Giữ flow hiện tại làm baseline.
  - Bổ sung QA case xác nhận side-effect DB (ended_at/revoked_at) khi có session.
  - Ở phase contract chuẩn hóa: thống nhất envelope lỗi với `error.code`.

## 4. User stories
- US-01:
  - Là user đang đăng nhập, tôi muốn logout để kết thúc phiên hiện tại.
- US-02:
  - Là user có trusted device, tôi muốn logout để thiết bị đó không tiếp tục bypass trái ý muốn.
- US-03:
  - Là user thao tác logout nhiều lần, tôi muốn hệ thống xử lý idempotent và không lỗi UX.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Logout with session cookie):
  - Given user có cookie `ryex_session_ref` hợp lệ
  - When gọi `POST /api/v1/auth/logout`
  - Then trả `204`, close session trong DB, revoke trusted devices của user, và clear auth cookies.

- AC-02 (Logout with sessionRef in body):
  - Given request body có `sessionRef` hợp lệ
  - When gọi logout
  - Then trả `204` và xử lý close/revoke tương tự.

- AC-03 (No session present):
  - Given không có `sessionRef` trong body và cookie
  - When gọi logout
  - Then vẫn trả `204` và clear auth cookies (idempotent behavior).

- AC-04 (Already closed session):
  - Given `sessionRef` không còn active (`ended_at` đã set)
  - When gọi logout
  - Then trả `204`, không phát sinh lỗi hệ thống.

- AC-05 (DB operation failure):
  - Given có lỗi DB khi close/revoke
  - When gọi logout
  - Then trả error theo `jsonError` (status tương ứng, có `error.code`/`requestId`).

- AC-06 (Audit event):
  - Given close session thành công
  - When logout hoàn tất
  - Then ghi `audit_events` action `AUTH_LOGOUT` với `resourceType=session`.

## 6. Impact map
- FE impact:
  - Trigger logout từ market nav hoặc các auth-aware screens.
  - Sau logout, FE điều hướng về login và không giữ state authenticated.
- BE impact:
  - Route `src/app/api/v1/auth/logout/route.js`.
  - Repository functions:
    - `closeSession`
    - `revokeTrustedDevicesForUser`
    - `insertAuditEvent`
  - Cookie layer:
    - clear `ryex_session_ref`
    - clear trusted device cookie.
- QA impact:
  - Verify `204` no-content behavior.
  - Verify DB side-effect: session ended + trusted devices revoked.
  - Verify cookie clear trong response.
  - Verify idempotent logout khi thiếu sessionRef.

## 7. Risks + decisions
- Risks:
  - R-01: Không revoke trusted devices đầy đủ có thể gây bypass ngoài mong muốn sau logout.
  - R-02: FE chỉ signOut local mà không gọi API logout sẽ thiếu audit/session close.
  - R-03: Contract lỗi chưa đồng nhất toàn API có thể khó thống nhất xử lý lỗi FE.
- Decisions cần PO chốt:
  - D-01: Có cần ưu tiên “logout all sessions/devices” trong roadmap gần không.
  - D-02: Yêu cầu UX sau logout (redirect cứng login hay giữ landing theo context).

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `004-logout-session-revoke`.
  - Bổ sung yêu cầu FE: navbar landing page phải đọc auth-state tương tự webapp; khi đã đăng nhập thì hiển thị controls authenticated (đăng xuất/tài sản/avatar), không quay về cặp nút đăng nhập/đăng ký mặc định.
- Reason:
  - Cần chuẩn hóa luồng logout an toàn và testable cho auth foundation.
  - Đồng bộ trải nghiệm điều hướng trước/sau đăng nhập giữa marketing (`/`) và webapp (`/app/*`).
- Impact:
  - Hoàn tất bộ brief Auth core (`001`-`004`) cho handoff FE/BE/QA.
  - Giảm nhầm lẫn trạng thái phiên khi user điều hướng qua lại giữa landing và webapp.
