# Frontend UI Rules (RYEX)

## 1) One source of truth for page backgrounds
- All non-landing pages must use theme tokens from `tailwind.config.js` for page backgrounds.
- Do not hardcode page background colors inside components.
- If you must change the default app background, update `colors.background`, `colors.surface`, and `colors.surface-bright` in `tailwind.config.js`.

## 2) Landing page is the only exception
- Landing page background is scoped via `.landing-page-bg` in `src/app/globals.css`.
- Do not override global tokens just to fit the landing page.

## 3) Avoid local overrides
- Do not add ad-hoc CSS overrides like `.app-shell .bg-surface { ... }`.
- If a background needs to change globally, update the token instead.

## 4) Build cache reminder
- After editing `tailwind.config.js`, restart the dev server.
- If colors do not update, delete `.next` and restart:
  - `rm -rf .next`
  - `npm run dev`

