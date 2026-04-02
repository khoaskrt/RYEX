---
name: ryex-qa-skill
description: QA rules for RYEX. Keep checks risk-first, contract-driven, and evidence-based before FE/BE handoff or release.
---

# RYEX QA Rule (Simple + Optimized) — v1

## 1) Scope Rule
- Test theo rủi ro thay đổi:
1. Auth/session/callback -> Auth Pack bắt buộc.
2. Market/tickers/realtime/pagination -> Market Pack bắt buộc.
3. User profile API -> User Pack bắt buộc.

## 2) Contract Rule
- Luôn check đủ 3 lớp: HTTP status + response shape + `error.code`.
- Không chấp nhận pass nếu FE chạy được nhưng contract API lệch.

## 3) Classification Rule
- Mỗi case phải có đúng 1 trạng thái: `PASS`, `FAIL`, hoặc `BLOCKED`.
- `BLOCKED` chỉ dùng cho env/tool/data blocker, không dùng để che lỗi logic.

## 4) Security Rule
- QA phải kiểm tra không lộ secrets/tokens nhạy cảm trên client và logs chính.
- Cookie auth phải đúng baseline: `HttpOnly`, `SameSite=Lax`, `Secure` theo env.

## 5) Delivery Rule
- Trước khi kết luận QA: chạy `npm run build`.
- Nếu đụng auth/db: chạy thêm `npm run db:verify`.
- Báo cáo bắt buộc gồm: scope, matrix, defects, residual risks, recommendation.

## 6) Living Rule
- Mọi bug đã fix phải được thêm vào `.codex/Rule/qa-living-matrix.md`:
1. 1 case tái hiện bug.
2. 1 case negative lân cận.
3. ngày + file fix chính.

## 7) Collaboration + Documentation Governance (Mandatory)
1. Quyền phản biện/làm rõ:
- Khi yêu cầu chưa rõ, QA có quyền phản biện hoặc hỏi thêm để tham vấn với bạn.
- Chỉ hỏi ở mức rõ scope test, expected behavior, acceptance; tránh sa vào câu hỏi quá sâu kỹ thuật khi chưa cần thiết.

2. Kỷ luật cây thư mục tài liệu:
- Khi ghi chép hệ thống, QA bắt buộc tuân theo cây thư mục docs đã được dựng sẵn (phiên bản tối ưu hiện tại).
- Chỉ được thêm file tài liệu vào đúng folder chức năng tương ứng.
- Nếu phát sinh tài liệu nằm ngoài phạm vi folder hiện có: chỉ được đề xuất tạo folder mới và phải có chấp thuận của bạn trước khi tạo.

3. Nghĩa vụ cập nhật tài liệu sau mỗi task/feature/epic:
- Sau khi hoàn thành task/feature/epic, QA bắt buộc cập nhật tài liệu.
- Bắt buộc đọc/đối chiếu toàn bộ docs liên quan trước khi ghi.
- Luôn ưu tiên bổ sung vào tài liệu sẵn có và update version theo nguyên tắc đã thống nhất.
- Chỉ tạo file `.md` mới khi thực sự không có tài liệu liên quan.
- Update vào /Users/mac/Desktop/RYEX/.codex/Rule/qa-living-matrix.md to grow QA coverage over time.

## 8) Navigation Bar Consistency Check (Mandatory)
- Với mọi thay đổi FE/auth ảnh hưởng navigation, QA bắt buộc verify cùng một behavior nav trên toàn bộ landing + webapp pages.
- Tối thiểu phải check: menu `Giao dịch` hiển thị nhất quán, auth actions đúng trạng thái đăng nhập, profile/avatar/AssetsDropdown không lệch giữa các trang.
- Nếu bất kỳ page nào lệch, kết luận phải là `FAIL` (không được `PASS` cục bộ).
## Feature Sync Rule (Mandatory)
- Khi có bổ sung thông tin/nội dung cho một file hoặc tính năng mới, bắt buộc cập nhật đồng bộ cả hai nơi:
  - `/Users/mac/Desktop/RYEX/docs/features`
  - `/Users/mac/Desktop/RYEX/src/features`
- Khi nhận prompt hỏi về một tính năng cụ thể, bắt buộc review cả hai thư mục trên cho feature liên quan trước khi phân tích/kết luận để đảm bảo đủ bối cảnh và dữ liệu ra quyết định.
