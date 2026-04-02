# Trading Account Component Map v1.0

## Reuse Existing
- `AppTopNav`
  - Mục đích: điều hướng global + auth state.
- `FundingNavigationSidebar`
  - Mục đích: điều hướng desktop trong cụm Assets/Funding/Trading.
- `FundingNavigationTabBar`
  - Mục đích: điều hướng mobile sticky.
- `LandingFooter`
  - Mục đích: footer đồng bộ webapp baseline.

## New (Feature-level)
- `TradingAccountModulePage`
  - File: `src/features/trading-account/TradingAccountModulePage.js`
  - Vai trò: layout tổng + state local filter/search.
- `trading-account/constants.js`
  - Vai trò: dữ liệu hardcode cho overview, cards, positions, open orders, timeline.

## Tailwind Token Mapping
- Primary CTA:
  - `bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl`
- Secondary controls:
  - `bg-surface-container-low border border-outline-variant/40 rounded-xl`
- Main cards:
  - `bg-surface-container-lowest border border-outline-variant/20 rounded-2xl`
- Data table shell:
  - `bg-surface-container-low/50` (header), `divide-outline-variant/10` (rows)
- Status:
  - Positive: `text-primary`
  - Negative: `text-error`
  - Neutral: `text-on-surface-variant`

## Route & Navigation Mapping
- New route key: `ROUTES.tradingAccount = '/app/trading-account'`.
- Redirect source:
  - Assets table action `Giao dịch`
  - Assets trading card actions `Chi tiết`, `Giao dịch ngay`
  - Sidebar/Tabbar item `Giao dịch`
