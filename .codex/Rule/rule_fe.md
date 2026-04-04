---
name: ryex-fe-skill
description: Frontend execution rules for RYEX. Use when editing UI in this repo to preserve design consistency, strict scope boundaries, and market-baseline header/footer and token icon standards.
version: 1.4
---

# RYEX FE Rule (Simple + Optimized) — v1.4

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

8. Navigation bar consistency (must):
- Navigation bar phải đồng bộ 100% trên toàn bộ trang landing + webapp.
- Không được tạo biến thể nav riêng theo từng page nếu chưa được phê duyệt rõ ràng.
- Mọi thay đổi nav phải thực hiện qua shared component để tránh lệch hành vi (menu `Giao dịch`, auth actions, profile/avatar).

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

2. Kỷ luật cây thư mục tài liệu (bắt buộc đọc trước khi tạo `.md` mới):
- **`docs/DOCUMENTATION_SCOPE.md`** + **`docs/INDEX.md`**.
- **FE:** ghi chú handoff UI, mapping component (nếu cần) → `docs/features/<Module>/`; **không** tạo spec/QA dài trong `src/features/` (chỉ `README.md` pointer).
- Static asset: chỉ **`public/images/`** (URL `/images/...`); không thêm thư mục `images/` ở root repo.

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

### v1.3 - 2026-04-04
- Aligned with `docs/DOCUMENTATION_SCOPE.md`; replaced legacy Feature Sync Rule with **Documentation placement**; clarified `public/images` only.

### v1.4 - 2026-04-04
- **Documentation placement:** pointer to `DOCUMENTATION_SCOPE.md` **§5** (re-verify markdown paths after directory moves).

## Documentation placement (Mandatory)
- **Canonical:** [`docs/DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) + [`docs/INDEX.md`](../../docs/INDEX.md).
- **PR có thêm/sửa `.md`:** checklist §3 trong `DOCUMENTATION_SCOPE.md`.
- **Đổi cấu trúc thư mục:** checklist **§5** trong [`DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md) (rà link/path trong doc).
- Đọc spec/handoff từ `docs/features/`; code nằm trong `src/features/` — không trùng vai trò.
- **Đánh số & version:** `DOCUMENTATION_SCOPE.md` **§2.1**; **Rule** này: YAML `version` khớp tiêu đề `v1.4`.
