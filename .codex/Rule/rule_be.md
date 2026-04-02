---
name: ryex-be-skill
description: Backend engineering rules for RYEX. Keep API contracts stable, secure server-side integrations, and strict route->service->repository boundaries.
---

# RYEX BE Rule (Simple + Optimized) — v1.1

## 1) Auth Pattern Consistency (CRITICAL)
**BEFORE implementing any protected API endpoint:**
1. **Verify current auth stack** - grep existing API routes for auth patterns
2. **Cross-reference working endpoint** - copy exact pattern from `/api/v1/user/profile` or similar
3. **Never assume auth library** - check imports: legacy auth stack vs Supabase Auth
4. **Test with real token** - verify server logs show successful verification

**Context:** Assets API 401 incident - implemented legacy auth guard while project used Supabase, causing 100% request failures. Rule violation = P0 blocker.

## 2) Contract Stability
- Không tự ý đổi response shape/status/error code khi chưa thống nhất FE.
- Ưu tiên mã lỗi ổn định qua `error.code`.

## 3) Layer Boundaries
- Route handler mỏng.
- Business logic ở `src/server/*`.
- SQL/repository ở `src/server/auth/repository.js` hoặc module server tương ứng.

## 4) Data Integrity
- Use-case nhiều bước DB phải bọc trong `withTransaction`.
- Không để partial write.

## 5) Security
- Không hardcode secrets.
- Không đẩy secret về client.
- Luôn validate input + rate limit trước side effects nặng.

## 6) Runtime + Observability
- API dùng DB/Supabase Auth: `runtime = 'nodejs'`.
- Luôn có `requestId` và log/audit ở auth-sensitive flows.

## 7) Delivery Standard
- Scope tối thiểu.
- `npm run build` bắt buộc sau thay đổi BE có ý nghĩa.
- Báo rõ risk còn lại nếu không test full integration.

## 8) Role Boundary
- BE không sửa code FE (UI/component/presentation).
- BE chỉ xử lý API/service/repository/schema và server integrations.

## 9) Collaboration + Documentation Governance (Mandatory)
1. Quyền phản biện/làm rõ:
- Khi yêu cầu chưa rõ, BE có quyền phản biện hoặc hỏi thêm để tham vấn với bạn.
- Chỉ hỏi ở mức rõ scope, expected behavior, data/contract impact; tránh sa vào câu hỏi quá sâu kỹ thuật khi chưa cần thiết.

2. Kỷ luật cây thư mục tài liệu:
- Khi ghi chép hệ thống, BE bắt buộc tuân theo cây thư mục docs đã được dựng sẵn (phiên bản tối ưu hiện tại).
- Chỉ được thêm file tài liệu vào đúng folder chức năng tương ứng.
- Nếu phát sinh tài liệu nằm ngoài phạm vi folder hiện có: chỉ được đề xuất tạo folder mới và phải có chấp thuận của bạn trước khi tạo.

3. Nghĩa vụ cập nhật tài liệu sau mỗi task/feature/epic:
- Sau khi hoàn thành task/feature/epic, BE bắt buộc cập nhật tài liệu.
- Bắt buộc đọc/đối chiếu toàn bộ docs liên quan trước khi ghi.
- Luôn ưu tiên bổ sung vào tài liệu sẵn có và update version theo nguyên tắc đã thống nhất.
- Chỉ tạo file `.md` mới khi thực sự không có tài liệu liên quan.

## 10) Navigation Consistency Guardrail (Cross-role, Mandatory)
- Khi requirement chạm navigation/auth/session ở UI, BE phải tôn trọng nguyên tắc: navigation bar đồng bộ toàn bộ landing + webapp, không chấp nhận biến thể hành vi trái ngược giữa các trang.
- Nếu API/auth thay đổi có thể làm nav lệch trạng thái đăng nhập, phải highlight risk và chặn merge cho đến khi FE/QA xác nhận đồng bộ.

---

## Changelog

### v1.1 - 2026-04-01
- **Added Rule #1: Auth Pattern Consistency (CRITICAL)**
  - Mandatory auth stack verification before implementing protected endpoints
  - Root cause: Assets API 401 incident (legacy auth guard used instead of Supabase)
  - Impact: 100% request failures, 2+ hour debugging, delayed feature launch
  - Prevention: Cross-reference working endpoints, never assume auth library

### v1.2 - 2026-04-01
- Added mandatory collaboration clarification rule for unclear requests (non-deep-technical consultation).
- Added strict docs tree governance (only existing folders; new folder requires explicit user approval).
- Added mandatory post-task documentation update rule (review existing docs first; prefer updating existing docs/version before creating new file).

## Feature Sync Rule (Mandatory)
- Khi có bổ sung thông tin/nội dung cho một file hoặc tính năng mới, bắt buộc cập nhật đồng bộ cả hai nơi:
  - `/Users/mac/Desktop/RYEX/docs/features`
  - `/Users/mac/Desktop/RYEX/src/features`
- Khi nhận prompt hỏi về một tính năng cụ thể, bắt buộc review cả hai thư mục trên cho feature liên quan trước khi phân tích/kết luận để đảm bảo đủ bối cảnh và dữ liệu ra quyết định.
