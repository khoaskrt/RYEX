# [Assets/Deposit/Withdraw] - Funding Navigation (v1.0)

## 1. Overview
Sidebar navigation dùng chung cho 3 pages: Assets, Deposit, Withdraw.

## 2. Components

### 2.1 FundingNavigationSidebar
- **File**: `src/shared/components/FundingNavigationSidebar.js`
- **Purpose**: Desktop sidebar navigation (≥ lg breakpoint)
- **Behavior**:
  - Fixed position bên trái, width 240px
  - Active state dựa trên pathname hiện tại
  - Highlight item active với border-left primary + background

### 2.2 FundingNavigationTabBar
- **File**: `src/shared/components/FundingNavigationTabBar.js`
- **Purpose**: Mobile horizontal tab bar (< lg breakpoint)
- **Behavior**:
  - Sticky position phía trên, scrollable ngang
  - Active state với border-bottom primary
  - Ẩn scrollbar với `scrollbar-hide`

## 3. Navigation Items
1. **Tổng quan** → `/app/assets` (icon: dashboard)
2. **Tài trợ** → `/app/funding` (icon: account_balance_wallet)
3. **Giao dịch** → `/app/market` (icon: candlestick_chart)
4. **Nạp tiền** → `/app/deposit` (icon: arrow_downward)
5. **Rút tiền** → `/app/withdraw` (icon: arrow_upward)
6. **Lịch sử** → `/app/history` (icon: history)

## 4. Integration Pattern

### In page file:
```js
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';

// In JSX:
<FundingNavigationSidebar />
<FundingNavigationTabBar />
<main className="... lg:ml-60">
  {/* Page content */}
</main>
```

### Layout adjustment:
- Main content thêm `lg:ml-60` để tránh overlap sidebar trên desktop
- Tab bar sticky top-16 (dưới header) trên mobile

## 5. Design Tokens
- Sidebar width: `240px` (w-60)
- Active state:
  - Desktop: `border-l-4 border-primary` + `bg-primary-container/20`
  - Mobile: `border-b-2 border-primary` + `bg-primary-container/20`
- Icon size: `text-xl` (20px) desktop, `text-lg` (18px) mobile
- Font: `font-semibold text-sm`

## 6. Responsive Strategy
- **Desktop (≥ lg)**: Sidebar hiển thị, tab bar ẩn
- **Mobile/Tablet (< lg)**: Sidebar ẩn, tab bar hiển thị
- Breakpoint: Tailwind `lg` (1024px)

## 7. Applied Pages
- ✅ `/app/assets` (src/app/(webapp)/app/assets/page.js)
- ✅ `/app/deposit` (src/features/deposit/DepositModulePage.js)
- ✅ `/app/withdraw` (src/app/(webapp)/app/withdraw/page.js)

## 8. QA Checklist
- [ ] Verify active state highlight đúng page hiện tại
- [ ] Verify click navigation chuyển route đúng
- [ ] Verify responsive: sidebar desktop, tab bar mobile
- [ ] Verify tab bar scrollable ngang khi overflow
- [ ] Verify main content không bị overlap với sidebar
- [ ] Verify keyboard navigation (Tab key focus ring)

## 9. Future Enhancement
- [ ] Hamburger menu toggle cho tablet landscape
- [ ] Badge notification count cho "Lịch sử"
- [ ] Collapse sidebar button cho desktop

## 10. Patch Notes (2026-04-02)
- Added withdraw quick action in Assets table action column (`Nạp`, `Rút`) with direct route navigation.
- Withdraw page now mounts shared funding navigation components (`FundingNavigationSidebar`, `FundingNavigationTabBar`) to align with Assets/Deposit behavior.
- Assets dropdown hover interaction now consistently reveals portfolio overview plus `Nạp tiền` / `Rút tiền` actions with clickable redirects.
- Added FE token icon fallback for missing market icon URLs, including explicit USDT local icon mapping.
- Refined assets-button interaction: click on `Tài sản` now redirects directly to `/app/assets`; hover remains for quick mini-card preview.
- Fixed mini-card dismiss issue while moving pointer from trigger to popup by removing hover gap and adding a short close-delay.
