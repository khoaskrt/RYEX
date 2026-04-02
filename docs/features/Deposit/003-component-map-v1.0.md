# [Deposit] - Component Map (v1.0)

## 1. Reuse vs New

### Reuse Components
- `LandingFooter`
  - Source: `@/shared/components/LandingFooter`
  - Role: Footer thống nhất toàn webapp.
- `AssetsDropdown`
  - Source: `@/shared/components/AssetsDropdown`
  - Role: Quick action + truy cập tài sản ở top bar.
- Auth/session pattern
  - Source pattern: `assets`, `market`, `profile` modules.
  - Role: Kiểm tra session + logout thống nhất.

### New Components (Deposit Feature)
- `DepositTopNav`
  - File: `src/features/deposit/components/DepositTopNav.js`
  - Responsibility: Header cho route Deposit, không tự ý thêm menu mới ngoài baseline.
- `DepositHeroBanner`
  - File: `src/features/deposit/components/DepositHeroBanner.js`
  - Responsibility: Intro + context card cho Deposit page.
- `DepositEntryPanel`
  - File: `src/features/deposit/components/DepositEntryPanel.js`
  - Responsibility: Token select, wallet address block, CTA actions.
- `DepositSidebarPanel`
  - File: `src/features/deposit/components/DepositSidebarPanel.js`
  - Responsibility: Summary, state preview, empty history block.
- `constants`
  - File: `src/features/deposit/constants.js`
  - Responsibility: Mock token list + interaction preview states.

## 2. Redirect Helper (Funding)
- `src/shared/lib/navigation/fundingNavigation.js`
  - `goToDeposit(router)` -> push `/app/deposit`
  - `goToWithdraw(router)` -> push `/app/withdraw`
- Applied at:
  - `src/app/(webapp)/app/assets/page.js`
  - `src/shared/components/AssetsDropdown.js`

## 3. Data/Prop Contracts
- `DepositTopNav`
  - Props:
    - `isAuthenticated: boolean`
    - `isLoggingOut: boolean`
    - `onLogout: () => Promise<void> | void`
    - `profileVisual: { avatarUrl: string, initial: string }`
- `DepositEntryPanel`
  - Props:
    - `tokens: Array<{symbol,name,network,eta,fee}>`
    - `selectedToken`
    - `onSelectToken: (token) => void`
- `DepositSidebarPanel`
  - Props:
    - `selectedToken`
    - `states: Array<{key,icon,title,description,badgeClass}>`

## 4. Tailwind Token Mapping
- Primary CTA:
  - `bg-gradient-to-br from-primary to-primary-container`
  - `text-on-primary`
  - `active:scale-95`
- Surface hierarchy:
  - `bg-surface-container-lowest` (cards)
  - `bg-surface-container-low` (sub-block)
  - `border-outline-variant/30`
- State color:
  - `text-error`, `bg-error-container`
  - `text-primary`, `bg-primary-container/20`

## 5. QA Checklist Hooks
- Verify click CTA `Nạp tiền` từ Assets/Dropdown đi đúng `/app/deposit`.
- Verify click CTA `Rút tiền` từ Assets/Dropdown đi đúng `/app/withdraw`.
- Verify `/app/deposit` render đủ 4 block component sau refactor.
- Verify keyboard focus ring hiển thị ở các button chính.
