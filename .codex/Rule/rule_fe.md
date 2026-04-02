---
name: ryex-fe-skill
description: Frontend execution rules for RYEX. Use when editing UI in this repo to preserve design consistency, strict scope boundaries, and market-baseline header/footer and token icon standards.
version: 1.1
---

# RYEX FE Rule (Simple + Optimized) — v1.1

## 1) Project Context (Must Keep in Mind)
- Stack: Next.js App Router (`src/app`) + domain modules (`src/features/*`).
- Main routes:
  - `/` marketing
  - `/app/auth/*` auth
  - `/app/market` realtime market
- The market module is the visual baseline for the webapp shell.

## 2) Non-Negotiable Rules
1. No scope creep:
- Edit only the files/components explicitly requested.
- Do not refactor unrelated UI/components unless requested.

2. Preserve RYEX design system:
- Keep existing typography, spacing scale, color tokens, border/radius language, and interaction style.
- Do not introduce a new visual language unless explicitly requested.

3. Header/footer consistency:
- App page headers/footers must remain consistent with the market page baseline.
- If conflicts appear, align to market conventions.

4. Token/coin icon rule (fixed):
- Icon size must be `24x24` (`h-6 w-6`).
- Icon must be circular (`border-radius: 50%`, `rounded-full`).
- No square or rounded-square background behind the icon.
- Wrapper must stay transparent (`background: transparent`).

5. FE data/security rule:
- Never expose API keys/secrets in client code.
- Access third-party data through internal backend routes.

6. Role boundary (must):
- FE không sửa code BE (API/service/repository/schema).
- FE chỉ xử lý UI/component/presentation/client-state.

7. Global background changes (must):
- Khi đổi nền toàn app, chỉnh ở token màu (`tailwind.config.js`) + `body`/layout global, không override rải rác từng component.
- Sau khi đổi `tailwind.config.js`, phải restart dev server và xoá `.next` nếu màu không cập nhật.

## 3) Optimized Working Flow
Before editing:
1. Locate exact entrypoint chain from route -> feature.
2. Lock the minimal file list to change.

While editing:
1. Prefer small, surgical patches.
2. If touching token list/icons, enforce all icon rules in section 2.4.

After editing:
1. Smoke-check UI on desktop and mobile.
2. Run `npm run build` for meaningful FE changes.
3. Verify diff contains no out-of-scope files.

## 4) Standard Completion Report
- Files changed.
- Confirmation that no unrelated components were modified.
- Confirmation that header/footer consistency is preserved.
- Confirmation that token icons follow `24x24`, circular, transparent-wrapper rules.

## 5) Collaboration + Documentation Governance (Mandatory)
1. Quyền phản biện/làm rõ:
- Khi yêu cầu chưa rõ, FE có quyền phản biện hoặc hỏi thêm để tham vấn với bạn.
- Chỉ hỏi ở mức rõ scope, mục tiêu UX, expected behavior, acceptance; tránh sa vào câu hỏi quá sâu kỹ thuật khi chưa cần thiết.

2. Kỷ luật cây thư mục tài liệu:
- Khi ghi chép hệ thống, FE bắt buộc tuân theo cây thư mục docs đã được dựng sẵn (phiên bản tối ưu hiện tại).
- Chỉ được thêm file tài liệu vào đúng folder chức năng tương ứng.
- Nếu phát sinh tài liệu nằm ngoài phạm vi folder hiện có: chỉ được đề xuất tạo folder mới và phải có chấp thuận của bạn trước khi tạo.

3. Nghĩa vụ cập nhật tài liệu sau mỗi task/feature/epic:
- Sau khi hoàn thành task/feature/epic, FE bắt buộc cập nhật tài liệu.
- Bắt buộc đọc/đối chiếu toàn bộ docs liên quan trước khi ghi.
- Luôn ưu tiên bổ sung vào tài liệu sẵn có và update version theo nguyên tắc đã thống nhất.
- Chỉ tạo file `.md` mới khi thực sự không có tài liệu liên quan.

---

## Changelog

### v1.1 - 2026-03-31
- **Added Rule**: OAuth integration must use Supabase client-side auth
  - OAuth flows require callback page at `/app/auth/callback`
  - OAuth buttons must use `supabase.auth.signInWithOAuth()` method
  - Callback handler must process session via `supabase.auth.getSession()`
- **Security note**: OAuth redirect URLs must match Supabase dashboard whitelist

### v1.2 - 2026-04-01
- Added mandatory collaboration clarification rule for unclear requests (non-deep-technical consultation).
- Added strict docs tree governance (only existing folders; new folder requires explicit user approval).
- Added mandatory post-task documentation update rule (review existing docs first; prefer updating existing docs/version before creating new file).

## Feature Sync Rule (Mandatory)
- Khi có bổ sung thông tin/nội dung cho một file hoặc tính năng mới, bắt buộc cập nhật đồng bộ cả hai nơi:
  - `/Users/mac/Desktop/RYEX/docs/features`
  - `/Users/mac/Desktop/RYEX/src/features`
- Khi nhận prompt hỏi về một tính năng cụ thể, bắt buộc review cả hai thư mục trên cho feature liên quan trước khi phân tích/kết luận để đảm bảo đủ bối cảnh và dữ liệu ra quyết định.
