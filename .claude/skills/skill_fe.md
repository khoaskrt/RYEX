---
name: ryex-fe-skill
description: Frontend execution rules for RYEX. Use when editing UI in this repo to preserve design consistency, strict scope boundaries, and market-baseline header/footer and token icon standards.
version: 1.2
---

## 0) Mandatory Pre-Task Rule Read
- Trước khi thực hiện bất kỳ tác vụ nào, bắt buộc đọc file rule FE tương ứng với hệ đang chạy:
  - `.codex`: `.codex/Rule/rule_fe.md`
  - `.claude`: `.claude/Rules/rule_fe.md`
- Nếu chưa đọc rule, không được bắt đầu edit/code/test cho task FE.


# RYEX FE Skill (Simple + Optimized) — v1.1

## 0) Rule vs Skill Scope (FE)
- Rule: ràng buộc bắt buộc (design system, icon rule, role boundary).
- Skill: ngữ cảnh dự án + quy trình làm việc + checklist bàn giao.

## 1) Project Context (Must Keep in Mind)
- Stack: Next.js App Router (`src/app`) + domain modules (`src/features/*`).
- Main routes:
  - `/` marketing
  - `/app/auth/*` auth
  - `/app/market` realtime market
- The market module is the visual baseline for the webapp shell.

## 2) Non-Negotiable Rules (belongs to Rule file)
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

## 4) Definition of Ready (DoR) for FE Tasks
- Business goal/user flow is clear (what user should see/do after task).
- Target route(s) and acceptance criteria are explicit (desktop + mobile expectations).
- API/data contract is available (endpoint, payload, error shape) or fallback strategy is agreed.
- Scope boundaries are explicit (files/modules allowed to touch, no-BE-change confirmation).
- Design references are available (Figma/Stitch/screenshot) + note on header/footer baseline alignment.
- Environment prerequisites are ready (env vars, auth assumptions, feature flag if any).
- Backward compatibility plan exists for route/path changes (redirect/alias when needed).

## 5) Standard Completion Report
- Files changed.
- Confirmation that no unrelated components were modified.
- Confirmation that header/footer consistency is preserved.
- Confirmation that token icons follow `24x24`, circular, transparent-wrapper rules.

---

## Changelog

### v1.2 - 2026-04-01
- **Added**: FE task `Definition of Ready (DoR)` checklist
  - Goal/flow clarity
  - Route + acceptance criteria clarity
  - API contract or fallback agreement
  - Scope boundary + no-BE-change confirmation
  - Design reference + header/footer baseline note
  - Environment prerequisites
  - Backward compatibility plan for route changes

### v1.1 - 2026-03-31
- **Added**: OAuth integration context
  - Google OAuth login implemented via Supabase
  - New callback handler pattern: `/app/auth/callback/page.js`
  - OAuth buttons use `supabase.auth.signInWithOAuth()`
- **Pattern**: OAuth flows follow client-side redirect pattern with callback page
- **Reference**: See `/docs/ba/google-oauth-implementation-v1.0.md` for full BA documentation
