---
name: ryex-ba-skill
description: Business Analyst execution skill for RYEX. Use to write concise BRD-lite outputs, prioritized backlog, and handoff-ready acceptance criteria.
version: 1.1
---

# RYEX BA Skill (Simple + Optimized) — v1.1

## 0) Rule vs Skill Scope (BA)
- Rule: các ràng buộc bắt buộc (không được vi phạm).
- Skill: bối cảnh dự án + cách làm việc + template output để chạy sprint.

## 1) Project Context (Must Keep in Mind)
- Product: RYEX crypto exchange MVP (web-first).
- Stack delivery: Next.js App Router + API routes `src/app/api/v1/*` + domain services `src/server/*` + feature modules `src/features/*`.
- Core flows đang có trong codebase:
1. Auth API theo Firebase Admin + Postgres audit/session (`signup`, `verify-email/callback`, `session/sync`, `login-challenge`, `resend`, `logout`).
2. FE auth hiện có 2 pattern cần BA quản trị rõ scope:
- `AuthModulePage` dùng Supabase auth signup/resend.
- `StitchLoginPage` dùng Supabase password sign-in.
3. Market module lấy dữ liệu Binance/CoinGecko qua backend proxy (`/api/v1/market/tickers`) và hiển thị realtime.
4. User profile có API riêng `/api/v1/user/profile`.

## 2) BA Mission (Execution Standard)
Khi nhận 1 yêu cầu mới, BA luôn bàn giao theo 6 block ngắn:
1. `Problem framing`: business goal + user pain + KPI.
2. `Scope`: in-scope/out-of-scope + `P0/P1/P2`.
3. `User stories`: 3-5 stories trọng tâm.
4. `Acceptance criteria`: Given/When/Then, testable.
5. `Impact map`: FE impact, BE impact, QA impact.
6. `Risk + decision`: risks chính + mục PO cần chốt.

## 3) Optimized BA Flow
### Step A - Clarify nhanh trước khi viết
- Trả lời 3 câu hỏi:
1. Vì sao business cần làm việc này ngay bây giờ?
2. KPI nào chứng minh thành công?
3. Feature chạm module nào (auth/market/profile/khác)?

### Step B - Align với runtime hiện tại
- So requirement với behavior đang chạy trong code.
- Nếu thấy lệch (expected vs current), bắt buộc ghi rõ mục `Gap`:
1. Kỳ vọng nghiệp vụ.
2. Hiện trạng code/runtime.
3. Đề xuất xử lý (fix code hay đổi requirement).

### Step C - Viết BRD-lite đủ dùng cho sprint
- Không viết dài dòng; ưu tiên rõ và test được:
1. Stories có priority.
2. AC có điều kiện + kết quả mong đợi.
3. Error cases cho luồng API/auth bắt buộc phải có.

### Step D - Handoff cho FE/BE/QA
- FE: route/screen/state/copy impacted.
- BE: API contract, status, `error.code`, data shape.
- QA: test pack bắt buộc + regression scope.

### Step E - Quản lý thay đổi
- Nếu có thay đổi sau chốt: thêm `Delta`.
- Nếu thay đổi lớn nhiều lần: bump version tài liệu (`v1 -> v1.1 -> v1.2...`).

## 4) BA Output Template (Copy/Paste)
```md
# [Feature] - BA Brief (vX.Y)

## 1. Problem framing
- Business goal:
- User pain:
- KPI:

## 2. Scope
- In-scope (P0/P1/P2):
- Out-of-scope:

## 3. Runtime Gap (if any)
- Expected behavior:
- Current behavior:
- Proposed resolution:

## 4. User stories
- US-01:
- US-02:

## 5. Acceptance criteria (Given/When/Then)
- AC-01:
- AC-02:

## 6. Impact map
- FE impact:
- BE impact:
- QA impact:

## 7. Risks + decisions
- Risks:
- Decisions cần PO chốt:

## 8. Delta (optional)
- Changed:
- Reason:
- Impact:
```

## 5) BA Done Checklist
- Có business goal + KPI đo được.
- Có stories + AC testable.
- Có `P0/P1/P2` rõ.
- Có impact map FE/BE/QA.
- Có risk register + open decisions.
- Có `Gap` nếu requirement lệch runtime.

## 6) Continuous Expansion Protocol
Để mở rộng liên tục mà không rối:
1. Giữ cấu trúc core của skill, chỉ bổ sung checklist/template theo incident thực tế.
2. Mỗi domain thêm 1 mini-pack khi đủ dữ liệu (`Auth`, `Market`, `Profile`, `Compliance`, `Analytics`).
3. Mỗi lần update ghi version + changelog ngắn.
4. Archive tài liệu cũ, luôn giữ 1 bản active source-of-truth cho từng domain.

---

## Changelog

### v1.1 - 2026-03-31
- **Added Domain**: OAuth authentication flow
  - New pattern: Third-party OAuth integration (Google, etc.)
  - Template applied: Google OAuth implementation documented in `/docs/ba/google-oauth-implementation-v1.0.md`
- **New checklist item**: OAuth implementations require environment config verification (Supabase dashboard, redirect URLs)
- **Impact map update**: OAuth flows are FE-only initially; BE session sync deferred
- **Reference example**: Google OAuth login follows client-side redirect pattern with callback handler
