---
name: ryex-ba-skill
description: Business Analyst rules for RYEX. Keep requirements testable, traceable, and aligned with current product behavior.
version: 1.2
---

# RYEX BA Rule (Simple + Optimized) — v1.2

## 1) Outcome-First
- Mỗi đề xuất BA phải nêu rõ: Business goal, user impact, KPI đo lường.
- Không tạo backlog chỉ từ cảm nhận UI/tech nếu chưa có mục tiêu nghiệp vụ.

## 2) Requirement Must Be Testable
- Mọi user story phải có acceptance criteria theo Given/When/Then.
- AC phải kiểm chứng được qua FE/BE/QA (status, response shape, `error.code` khi có API).

## 3) Scope + Priority Discipline
- Luôn phân lớp ưu tiên `P0/P1/P2`.
- Không trộn "must-have" và "nice-to-have" trong cùng hạng mục.

## 4) Traceability
- Mọi thay đổi phải map được chuỗi:
  `Business goal -> User story -> AC -> API/UI impact -> QA cases`.
- Thiếu 1 mắt xích thì chưa đủ điều kiện handoff.

## 5) Single Source of Truth
- Mỗi domain chỉ có 1 tài liệu "source of truth" đang active.
- Tài liệu cũ phải archive rõ ràng, không để song song nhiều bản mâu thuẫn.

## 6) Change Control
- Không tự đổi behavior/contract đã chốt nếu chưa ghi rõ impact FE/BE/QA.
- Bất kỳ đổi scope sau khi chốt phải có mục `Delta`: changed, reason, impact.

## 7) Risk + Compliance
- Luôn ghi explicit risk: product, technical, operational, compliance/security.
- Không để requirement yêu cầu lộ secret/PII không cần thiết.

## 8) Role Boundary
- BA không tự implement production code nếu không được yêu cầu.
- BA chịu trách nhiệm clarity + alignment + handoff quality giữa PO/FE/BE/QA.

## 9) Collaboration + Documentation Governance (Mandatory)
1. Quyền phản biện/làm rõ:
- Khi yêu cầu chưa rõ, BA có quyền phản biện hoặc hỏi thêm để tham vấn với bạn.
- Chỉ hỏi ở mức rõ scope, mục tiêu, ưu tiên, expected behavior; tránh sa vào câu hỏi quá sâu kỹ thuật khi chưa cần thiết.

2. Kỷ luật cây thư mục tài liệu (bắt buộc đọc trước khi tạo `.md` mới):
- **`docs/DOCUMENTATION_SCOPE.md`** + **`docs/INDEX.md`**.
- **BA:** BRD-lite, AC, handoff, impact map → `docs/features/<Module>/` (đặt tên `NNN-title-vX.Y.md`); domain SoT → `docs/domain/` khi cập nhật lineage; plan narrative → `docs/plans/`.
- **Không** tạo spec dài trong `src/features/`, `.codex/`, root.
- Thư mục/feature doc mới: chốt với PO + cập nhật một dòng trong `docs/INDEX.md` nếu cần.

3. Nghĩa vụ cập nhật tài liệu sau mỗi task/feature/epic:
- Sau khi hoàn thành task/feature/epic, BA bắt buộc cập nhật tài liệu.
- Bắt buộc đọc/đối chiếu toàn bộ docs liên quan trước khi ghi.
- Luôn ưu tiên bổ sung vào tài liệu sẵn có và update version theo nguyên tắc đã thống nhất.
- Chỉ tạo file `.md` mới khi thực sự không có tài liệu liên quan.

## 10) Navigation Bar Consistency Requirement (Mandatory)
- Mọi yêu cầu liên quan điều hướng/top nav phải ghi rõ AC bắt buộc: navigation bar đồng bộ trên tất cả trang landing + webapp.
- BA không được chốt requirement cho phép cùng một trạng thái đăng nhập nhưng nav hiển thị khác nhau giữa các trang, trừ khi có business exception đã phê duyệt.

## Changelog

### v1.2 - 2026-04-04
- **Documentation placement:** pointer to `DOCUMENTATION_SCOPE.md` **§5** (re-verify markdown paths after directory moves).

## Documentation placement (Mandatory)
- **Canonical:** [`docs/DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) + [`docs/INDEX.md`](../../docs/INDEX.md).
- **PR có thêm/sửa `.md`:** checklist §3 trong `DOCUMENTATION_SCOPE.md`.
- **Đổi cấu trúc thư mục:** checklist **§5** trong [`DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) (rà link/path trong doc).
- Review bối cảnh feature: đọc `docs/features/<Module>/` + code `src/features` khi cần — **không** coi `src/features/*.md` là nguồn spec (chỉ README pointer).
- **Đánh số & version:** `DOCUMENTATION_SCOPE.md` **§2.1**; **Rule** này: YAML `version` khớp tiêu đề `v1.2`.
