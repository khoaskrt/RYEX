---
name: ryex-ba-skill
description: Business Analyst rules for RYEX. Keep requirements testable, traceable, and aligned with current product behavior.
---

# RYEX BA Rule (Simple + Optimized) — v1

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
