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

---

## Changelog

### v1.1 - 2026-03-31
- **Added Rule**: OAuth integration must use Supabase client-side auth
  - OAuth flows require callback page at `/app/auth/callback`
  - OAuth buttons must use `supabase.auth.signInWithOAuth()` method
  - Callback handler must process session via `supabase.auth.getSession()`
- **Security note**: OAuth redirect URLs must match Supabase dashboard whitelist
