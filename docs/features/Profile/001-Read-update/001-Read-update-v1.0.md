# 001-Read-update - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Cho phép user đã xác thực đọc và cập nhật thông tin profile cơ bản một cách an toàn, ổn định.
- User pain:
  - User cần xem thông tin tài khoản hiện tại (email, trạng thái, tên hiển thị).
  - User cần cập nhật tên hiển thị và thấy kết quả ngay mà không lỗi bất ngờ.
- KPI:
  - `Profile GET success rate`.
  - `Profile PATCH success rate`.
  - `Unauthorized rejection correctness` (401).
  - `Profile update latency`.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `GET /api/v1/user/profile`.
    - `PATCH /api/v1/user/profile`.
    - Bearer token verification qua Firebase Admin.
    - Read/update dữ liệu từ bảng `users` (và read `auth_identities` cho emailVerified ở GET).
  - `P1`:
    - Chuẩn hóa error envelope + `error.code` theo `docs/contracts/api-v1.md`.
    - Bổ sung input validation chặt cho `displayName`.
  - `P2`:
    - Mở rộng thêm trường profile (avatar/preferences/...).
- Out-of-scope:
  - KYC workflow.
  - Profile media upload.
  - Settings nâng cao (security preferences, notification center).

## 3. Runtime Gap (if any)
- Expected behavior:
  - User có token hợp lệ có thể đọc profile và cập nhật `displayName`.
  - API trả lỗi rõ ràng, machine-readable cho FE/QA.
- Current behavior:
  - GET/PATCH đã hoạt động với bearer token verification.
  - Error response đang dạng string (`Unauthorized`, `Internal server error`), chưa theo `error.code`.
  - PATCH chưa validate payload chi tiết (`displayName` format/length).
- Proposed resolution:
  - Giữ baseline runtime hiện tại.
  - Ưu tiên chuẩn hóa contract lỗi và validation 4xx cho PATCH ở sprint contract/profile hardening.

## 4. User stories
- US-01:
  - Là user đã đăng nhập, tôi muốn xem profile hiện tại để xác nhận thông tin tài khoản.
- US-02:
  - Là user, tôi muốn cập nhật tên hiển thị để cá nhân hóa tài khoản.
- US-03:
  - Là user không hợp lệ/phiên hết hạn, tôi muốn hệ thống từ chối truy cập profile đúng cách.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (GET success):
  - Given bearer token hợp lệ và user tồn tại
  - When gọi `GET /api/v1/user/profile`
  - Then trả `200` với `user: { id, email, displayName, status, emailVerified, createdAt }`.

- AC-02 (GET unauthorized):
  - Given thiếu hoặc sai `Authorization: Bearer`
  - When gọi GET profile
  - Then trả `401`.

- AC-03 (GET user not found):
  - Given token hợp lệ nhưng không tìm thấy record user
  - When gọi GET profile
  - Then trả `404`.

- AC-04 (PATCH success):
  - Given token hợp lệ và payload `{ displayName }` hợp lệ
  - When gọi `PATCH /api/v1/user/profile`
  - Then trả `200` với `user: { id, email, displayName }` đã cập nhật.

- AC-05 (PATCH unauthorized):
  - Given thiếu hoặc sai bearer token
  - When gọi PATCH profile
  - Then trả `401`.

- AC-06 (PATCH internal failure):
  - Given DB/provider lỗi trong quá trình update
  - When gọi PATCH profile
  - Then trả `500`.

- AC-07 (Data consistency):
  - Given PATCH thành công
  - When gọi lại GET profile
  - Then `displayName` mới được phản ánh nhất quán.

## 6. Impact map
- FE impact:
  - Profile UI (hiện tại/chuẩn bị bổ sung) phải gọi GET/PATCH với bearer token đúng chuẩn.
  - Hiển thị lỗi đúng theo contract (sau khi chuẩn hóa error code).
- BE impact:
  - Route `src/app/api/v1/user/profile/route.js`.
  - Firebase token verify (`getFirebaseAuth().verifyIdToken`).
  - Supabase service-role query/update bảng `users`, join `auth_identities` (GET).
- QA impact:
  - Test matrix bắt buộc:
    - GET/PATCH happy path.
    - Unauthorized path.
    - GET not found.
    - Internal error path.
  - Verify response shape và dữ liệu trước/sau update.

## 7. Risks + decisions
- Risks:
  - R-01: Chưa có validation PATCH rõ có thể dẫn tới dữ liệu displayName không chuẩn.
  - R-02: Error contract dạng text gây khó cho FE mapping và QA automation.
  - R-03: Chưa có profile module FE rõ ràng dễ gây lệch giữa API capability và UX flow.
- Decisions cần PO chốt:
  - D-01: Ưu tiên chuẩn hóa error code/profile validation trong sprint nào.
  - D-02: Scope UI profile phase đầu (read-only trước hay read+update ngay).

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `001-read-update` thuộc nhánh Profile.
- Reason:
  - Cần chuẩn hóa nghiệp vụ đọc/cập nhật profile và tiêu chí testable cho handoff.
- Impact:
  - Hoàn thiện core brief cho domain Profile, sẵn sàng cho FE/BE/QA execution.
