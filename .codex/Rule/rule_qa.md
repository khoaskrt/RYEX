---
name: ryex-qa-skill
description: QA rules for RYEX. Keep checks risk-first, contract-driven, and evidence-based before FE/BE handoff or release.
version: 1.2
---

# RYEX QA Rule (Simple + Optimized) — v1.2

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

2. Kỷ luật cây thư mục tài liệu (bắt buộc đọc trước khi tạo `.md` mới):
- **`docs/DOCUMENTATION_SCOPE.md`** + **`docs/INDEX.md`**.
- **QA:** kết quả contract, matrix, E2E, release gate → `docs/features/<Module>/`; incident / postmortem → `docs/runbooks/incidents/`; **living matrix** (case tái hiện bug) → `.codex/Rule/qa-living-matrix.md` (đúng vai trò rule).
- **Không** đặt báo cáo QA dài trong `.codex/` ngoài rule matrix; không nhân đôi spec dưới `src/features/`.

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

## Changelog

### v1.2 - 2026-04-04
- **Documentation placement:** pointer to `DOCUMENTATION_SCOPE.md` **§5** (re-verify markdown paths after directory moves).

## Documentation placement (Mandatory)
- **Canonical:** [`docs/DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) + [`docs/INDEX.md`](../../docs/INDEX.md).
- **PR có thêm/sửa `.md`:** checklist §3 trong `DOCUMENTATION_SCOPE.md`.
- **Đổi cấu trúc thư mục:** checklist **§5** trong [`DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) (rà link/path trong doc).
- Evidence và spec đọc từ `docs/features/`; `src/features` chỉ code + README pointer.
- **Đánh số & version:** `DOCUMENTATION_SCOPE.md` **§2.1**; **Rule** này: YAML `version` khớp tiêu đề `v1.2`.
