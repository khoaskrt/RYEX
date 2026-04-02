# [Withdraw] - Component Mapping & Reuse Strategy (v1.0)

## Component Inventory: Reuse vs New

### ✅ Reusable Components (From existing pages)

#### 1. TopAppBar (from Assets page)
- **Source**: `src/app/(webapp)/app/assets/page.js` lines 212-282
- **Usage**: Header navigation với auth state
- **Modifications**: None - use as-is
- **Props needed**:
  - `isAuthenticated: boolean`
  - `profileVisual: {avatarUrl: string, initial: string}`
  - `isLoggingOut: boolean`
  - `handleLogout: () => void`

#### 2. LandingFooter (from Assets page)
- **Source**: `@/shared/components/LandingFooter`
- **Usage**: Footer links và copyright
- **Modifications**: None - use as-is
- **Props needed**: None (self-contained)

#### 3. AssetsDropdown (from Assets page)
- **Source**: `@/shared/components/AssetsDropdown`
- **Usage**: Quick access to assets in top navigation
- **Modifications**: None - use as-is
- **Props needed**: None (fetches data internally)

#### 4. Material Icons (Material Symbols font)
- **Source**: Google Material Symbols (loaded globally)
- **Usage**: Icons throughout the page
- **Icons needed**:
  - `expand_more` (dropdowns)
  - `content_paste` (paste button)
  - `wallet` (Funding account)
  - `swap_horiz` (Trading account)
  - `check_circle` (success state)
  - `error` (error state)
  - `info` (info tooltips)
  - `content_copy` (copy address)
  - `history` (history tab empty state)
  - `close` (modal close button)

#### 5. Form Input Pattern (from Auth pages)
- **Source**: `src/app/(webapp)/app/auth/signup/page.js` (input styling)
- **Reuse**: Input field base styles
- **Tailwind classes**:
  ```
  className="bg-surface-container-low border-none rounded-xl pl-4 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-container w-full"
  ```
- **Modifications**: Add validation states (error border-error, success border-primary)

#### 6. Primary Button (Gradient CTA)
- **Source**: Assets page "Nạp tiền" button (line 327-329)
- **Reuse**: Exact same gradient + styles
- **Tailwind classes**:
  ```
  className="bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
  ```
- **Usage**: "Xác nhận rút tiền" submit button

#### 7. Secondary Button (Outline style)
- **Source**: Assets page "Rút tiền" / "Chuyển tiền" buttons (lines 330-335)
- **Tailwind classes**:
  ```
  className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
  ```
- **Usage**: "Quay lại chỉnh sửa", "Huỷ bỏ" buttons

#### 8. Card Container
- **Source**: Assets page account cards (Funding/Trading) lines 342-390
- **Reuse**: Card wrapper styles
- **Tailwind classes**:
  ```
  className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] hover:translate-y-[-4px] transition-transform duration-300"
  ```
- **Usage**: Form sections, summary card, calculation card

#### 9. Status Badge Pattern (for History tab)
- **Source**: Market page price change badges (positive/negative colors)
- **Reuse**: Badge structure + color coding
- **New variants needed**:
  - Pending: `bg-[#f9a825]/10 text-[#f9a825]`
  - Processing: `bg-[#4c56af]/10 text-[#4c56af]`
  - Completed: `bg-[#01bc8d]/10 text-[#01bc8d]`
  - Failed: `bg-[#ba1a1a]/10 text-[#ba1a1a]`
  - Cancelled: `bg-outline/10 text-outline`

#### 10. Table Pattern (for History tab)
- **Source**: Assets page asset list table (lines 422-484)
- **Reuse**: Table structure + hover states + empty state
- **Modifications**: Different columns (date, coin, amount, address, network, status)

---

### 🆕 New Components to Create

#### 1. WithdrawPageTabs
- **Description**: Tab navigation "Rút tiền" | "Lịch sử rút tiền"
- **Pattern**: Material 3 Primary Tabs
- **Structure**:
  ```jsx
  <div className="flex border-b border-outline-variant/20">
    <button className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'withdraw' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
      Rút tiền
    </button>
    <button className={`py-4 px-6 text-sm font-bold transition-colors ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
      Lịch sử rút tiền
    </button>
  </div>
  ```
- **States**: Default, Hover, Active (border-bottom indicator)
- **Props**: `activeTab: 'withdraw' | 'history'`, `onTabChange: (tab) => void`

#### 2. CoinSelector (Dropdown with search)
- **Description**: Searchable dropdown cho coin selection
- **Visual**: Icon (24x24 circular) + Symbol + Name + Available balance
- **Structure**:
  - Trigger button: Shows selected coin or placeholder
  - Dropdown list: Searchable input + coin list (scroll if > 10 items)
  - Each coin item: Icon + Symbol (bold) + Name (small) + Balance (right-aligned)
- **States**: Default, Hover, Focus, Open, Selected, Disabled, Loading, Empty
- **Props**:
  - `coins: Array<{symbol, name, iconUrl, balance}>`
  - `selectedCoin: string | null`
  - `onSelect: (coin) => void`
  - `disabled: boolean`

#### 3. NetworkSelector (Radio card group)
- **Description**: Network selection với radio cards
- **Visual**: Each network = Card với radio button + name + fee + time estimate
- **Structure**:
  ```jsx
  <div className="space-y-3">
    {networks.map(network => (
      <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-primary bg-primary-container/5' : 'border-outline-variant hover:border-primary hover:shadow-md'}`}>
        <input type="radio" className="sr-only" />
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold text-on-surface">{network.name}</p>
            <p className="text-xs text-on-surface-variant">Phí: {network.fee} BTC ≈ ${network.feeUsd}</p>
            <p className="text-xs text-on-surface-variant">Thời gian: {network.estimatedTime}</p>
          </div>
          <span className={`material-symbols-outlined ${selected ? 'text-primary' : 'text-outline'}`}>
            {selected ? 'radio_button_checked' : 'radio_button_unchecked'}
          </span>
        </div>
      </label>
    ))}
  </div>
  ```
- **States**: Default, Hover, Selected, Focus, Disabled
- **Props**:
  - `networks: Array<{id, name, fee, feeUsd, estimatedTime}>`
  - `selectedNetwork: string | null`
  - `onSelect: (network) => void`

#### 4. AddressInput (với paste button + validation)
- **Description**: Text input cho blockchain address
- **Visual**: Monospace font + paste button inside + validation feedback
- **Structure**:
  ```jsx
  <div className="relative">
    <input
      type="text"
      placeholder="Nhập địa chỉ ví hoặc dán từ clipboard"
      className={`font-mono bg-surface-container-low border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 w-full ${error ? 'ring-2 ring-error' : valid ? 'ring-2 ring-primary-container' : 'focus:ring-primary-container'}`}
    />
    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
      <span className="material-symbols-outlined text-lg">content_paste</span>
    </button>
    {error && <p className="text-xs text-error mt-1">{errorMessage}</p>}
    {valid && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-primary-container material-symbols-outlined">check_circle</span>}
  </div>
  ```
- **States**: Default, Hover, Focus, Error (red border + message), Valid (green check icon), Disabled
- **Props**:
  - `value: string`
  - `onChange: (value) => void`
  - `onPaste: () => void`
  - `error: string | null`
  - `valid: boolean`
  - `disabled: boolean`

#### 5. AccountSelectionModal
- **Description**: Modal popup cho Funding vs Trading account selection
- **Visual**: Centered modal (desktop) / Bottom sheet (mobile) với 2 radio cards
- **Structure**:
  - Backdrop: `bg-black/50 backdrop-blur-sm`
  - Modal: `rounded-2xl bg-surface-container-lowest shadow-[0_24px_48px_rgba(0,0,0,0.1)] max-w-[600px]`
  - Header: Title + Close button
  - Body: 2 account cards (similar to NetworkSelector pattern)
  - Footer: "Huỷ bỏ" + "Tiếp tục" buttons
- **Animation**:
  - Entrance: Fade in backdrop 300ms + Slide up modal 300ms
  - Exit: Fade out backdrop 200ms + Slide down modal 200ms
- **States**: Closed, Opening, Open, Closing
- **Props**:
  - `isOpen: boolean`
  - `accounts: Array<{type: 'funding' | 'trading', balanceBTC, balanceUSDT}>`
  - `selectedAccount: string | null`
  - `onSelect: (account) => void`
  - `onClose: () => void`
  - `onConfirm: () => void`

#### 6. AmountInput (với quick buttons + calculation)
- **Description**: Number input với 25%/50%/75%/100% quick buttons
- **Visual**: Large input + button group + real-time calculation card below
- **Structure**:
  ```jsx
  <div className="space-y-4">
    <div>
      <p className="text-xs text-on-surface-variant mb-1">Số dư khả dụng: {availableBalance} BTC</p>
      <div className="relative">
        <input
          type="number"
          placeholder="0.00000000"
          className="bg-surface-container-low border-none rounded-xl pl-4 pr-16 py-4 text-lg font-bold focus:ring-2 focus:ring-primary-container w-full"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">BTC</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2">
      <button className="bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-bold py-2 rounded-lg text-sm transition-colors">25%</button>
      <button className="bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-bold py-2 rounded-lg text-sm transition-colors">50%</button>
      <button className="bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-bold py-2 rounded-lg text-sm transition-colors">75%</button>
      <button className="bg-surface-container-low hover:bg-primary-container/20 text-on-surface font-bold py-2 rounded-lg text-sm transition-colors">Tất cả</button>
    </div>

    <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Số tiền rút</span>
        <span className="font-semibold text-on-surface">{amount} BTC</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Phí mạng</span>
        <span className="font-semibold text-on-surface">{fee} BTC ≈ ${feeUsd}</span>
      </div>
      <div className="border-t border-outline-variant/20 pt-2 flex justify-between">
        <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
        <span className="text-lg font-extrabold text-primary-container">{receiveAmount} BTC</span>
      </div>
    </div>
  </div>
  ```
- **States**: Default, Hover, Focus, Error (below min/max), Loading (calculating fee)
- **Props**:
  - `value: string`
  - `onChange: (value) => void`
  - `availableBalance: string`
  - `fee: string`
  - `feeUsd: string`
  - `receiveAmount: string`
  - `minAmount: string`
  - `maxAmount: string`
  - `error: string | null`
  - `loading: boolean`

#### 7. WithdrawalSummaryCard (Sticky sidebar on desktop)
- **Description**: Summary card hiển thị tất cả thông tin withdrawal
- **Visual**: Card với rows of information + checkbox + submit button
- **Structure**:
  ```jsx
  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] sticky top-24">
    <h3 className="text-lg font-bold text-on-surface mb-4">Thông tin rút tiền</h3>

    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Coin</span>
        <span className="font-semibold text-on-surface">{coin || '---'}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Network</span>
        <span className="font-semibold text-on-surface">{network || '---'}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Địa chỉ</span>
        <span className="font-mono text-xs text-on-surface">{address ? maskAddress(address) : '---'}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Account</span>
        <span className="font-semibold text-on-surface">{account || '---'}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">Số lượng</span>
        <span className="font-semibold text-on-surface">{amount || '---'}</span>
      </div>

      <div className="border-t border-outline-variant/20 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Phí mạng</span>
          <span className="font-semibold text-on-surface">{fee || '---'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
          <span className="text-lg font-extrabold text-primary-container">{receiveAmount || '---'}</span>
        </div>
      </div>
    </div>

    <label className="flex items-start gap-2 mb-4 cursor-pointer">
      <input type="checkbox" className="mt-1 rounded border-outline-variant text-primary focus:ring-primary-container" />
      <span className="text-xs text-on-surface-variant">Tôi đã kiểm tra kỹ địa chỉ ví và hiểu rằng giao dịch không thể hoàn tác</span>
    </label>

    <button
      disabled={!termsAgreed || !isFormValid}
      className="w-full bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
    </button>

    <div className="mt-6 p-4 bg-surface-container-low/50 rounded-lg">
      <p className="text-xs font-bold text-on-surface-variant mb-2">ⓘ Withdrawal Limits</p>
      <p className="text-xs text-on-surface-variant">Min: 0.001 BTC</p>
      <p className="text-xs text-on-surface-variant">Max: 10 BTC/day</p>
      <p className="text-xs text-on-surface-variant">Fee: Network dependent</p>
    </div>
  </div>
  ```
- **States**: Default, Loading (submit), Disabled (checkbox not checked)
- **Props**: All withdrawal info + `termsAgreed`, `isFormValid`, `loading`, `onSubmit`

#### 8. SuccessModal
- **Description**: Modal hiển thị khi withdraw success
- **Visual**: Centered modal với large check icon + transaction ID
- **Structure**:
  - Large green check_circle icon (64px)
  - Title: "Rút tiền thành công"
  - Description text
  - Transaction ID với copy button
  - 2 CTAs: "Xem lịch sử" (primary) + "Đóng" (secondary)
- **Animation**: Same as AccountSelectionModal
- **Props**:
  - `isOpen: boolean`
  - `transactionId: string`
  - `amount: string`
  - `coin: string`
  - `onViewHistory: () => void`
  - `onClose: () => void`

#### 9. HistoryTable (Desktop view)
- **Description**: Table hiển thị withdrawal history
- **Reuse**: Similar structure to Assets page table
- **New columns**: Date, Coin, Amount, Address, Network, Status, Actions
- **Features**: Sortable, hover states, copy address button, status badges
- **Props**:
  - `history: Array<{date, coin, amount, address, network, status, txHash}>`
  - `onViewDetails: (tx) => void`

#### 10. HistoryCard (Mobile view)
- **Description**: Card layout cho mobile history view
- **Structure**: Icon + Symbol + Status badge (header) + Amount (body) + Network + Address + Action (footer)
- **Props**: Same data as HistoryTable row

---

## Component Hierarchy Tree

```
WithdrawPage
├── TopAppBar (reuse from Assets)
│   ├── Logo
│   ├── Nav links
│   ├── AssetsDropdown (reuse)
│   └── Profile avatar
│
├── Main Content Container
│   ├── WithdrawPageTabs (new)
│   │   ├── Tab: "Rút tiền" (active by default)
│   │   └── Tab: "Lịch sử rút tiền"
│   │
│   ├── [Tab Content: Withdraw Form]
│   │   ├── Two-Column Layout (desktop) / Single Column (mobile)
│   │   │
│   │   ├── Left Column (Form)
│   │   │   ├── Card: CoinSelector (new)
│   │   │   ├── Card: NetworkSelector (new)
│   │   │   ├── Card: AddressInput (new)
│   │   │   ├── Card: Account Badge + "Đổi tài khoản" link
│   │   │   └── Card: AmountInput (new) with calculation
│   │   │
│   │   └── Right Column (Summary - sticky desktop)
│   │       └── WithdrawalSummaryCard (new)
│   │           ├── Info rows
│   │           ├── Checkbox (terms agreement)
│   │           ├── Primary Button: "Xác nhận rút tiền" (reuse gradient button)
│   │           └── Limits info section
│   │
│   └── [Tab Content: History]
│       ├── Filters Bar
│       │   ├── Date range dropdown
│       │   ├── Coin filter dropdown
│       │   ├── Status filter dropdown
│       │   └── Apply/Reset buttons (reuse button styles)
│       │
│       ├── HistoryTable (new - desktop)
│       │   ├── Table header
│       │   ├── Table rows with status badges
│       │   └── Empty state (reuse empty pattern from Assets)
│       │
│       ├── HistoryCard (new - mobile)
│       │   └── Stack of cards
│       │
│       └── Pagination (reuse from Market page)
│
├── Modals (Conditional render)
│   ├── AccountSelectionModal (new)
│   ├── SuccessModal (new)
│   └── Error Banner (reuse error pattern)
│
└── LandingFooter (reuse from Assets)
```

---

## Atoms/Molecules/Organisms Breakdown

### Atoms (Smallest building blocks)
1. ✅ **Material Icon** (reuse) - Individual icons
2. ✅ **Text Label** (reuse) - Typography variants
3. ✅ **Input Field** (reuse pattern) - Base input styling
4. ✅ **Checkbox** (reuse) - Form checkbox
5. ✅ **Radio Button** (hidden, custom styled) - Form radio
6. 🆕 **Status Badge** (new variants) - Color-coded badges for status
7. ✅ **Button Primary** (reuse) - Gradient CTA button
8. ✅ **Button Secondary** (reuse) - Outline/surface button
9. 🆕 **Quick Amount Button** (new) - 25%/50%/75%/100% buttons

### Molecules (Combination of atoms)
1. 🆕 **Coin Item** (new) - Icon + Symbol + Name + Balance row
2. 🆕 **Network Card** (new) - Radio + Name + Fee + Time info
3. 🆕 **Account Card** (new) - Icon + Label + Balance + Subtext
4. 🆕 **Address Input Group** (new) - Input + Paste button + Validation feedback
5. 🆕 **Calculation Row** (new) - Label + Value pair in summary
6. 🆕 **History Row** (desktop) (new) - Table row with all columns
7. 🆕 **History Card** (mobile) (new) - Card with header + body + footer
8. ✅ **Tab Button** (pattern exists) - Tab item with active indicator
9. 🆕 **Filter Dropdown** (new) - Label + Dropdown select

### Organisms (Complex components)
1. ✅ **TopAppBar** (reuse) - Full navigation header
2. 🆕 **WithdrawPageTabs** (new) - Tab navigation bar
3. 🆕 **CoinSelector** (new) - Dropdown with search + coin list
4. 🆕 **NetworkSelector** (new) - Radio card group
5. 🆕 **AmountInput** (new) - Input + Quick buttons + Calculation card
6. 🆕 **WithdrawalSummaryCard** (new) - Summary + Checkbox + Submit
7. 🆕 **AccountSelectionModal** (new) - Modal with account cards
8. 🆕 **SuccessModal** (new) - Success confirmation modal
9. 🆕 **HistoryTable** (new) - Full table with filters + pagination
10. ✅ **LandingFooter** (reuse) - Footer with links

---

## Implementation Priority (MVP)

### P0 (Must have for launch)
1. WithdrawPageTabs
2. CoinSelector
3. NetworkSelector
4. AddressInput
5. AccountSelectionModal
6. AmountInput
7. WithdrawalSummaryCard
8. SuccessModal
9. Error states (banners/messages)
10. HistoryTable (basic version)

### P1 (Post-MVP enhancements)
1. HistoryCard (mobile view) - Can use table with horizontal scroll for MVP
2. Address Book integration (add link for future)
3. 2FA/OTP verification step
4. Advanced filters (date range picker)
5. Sortable table columns

### P2 (Future features)
1. Withdrawal templates
2. Batch withdrawals
3. Scheduling withdrawals
4. Transaction details drawer (instead of modal)

---

## Component File Structure Recommendation

```
src/features/withdraw/
├── components/
│   ├── atoms/
│   │   ├── StatusBadge.js
│   │   └── QuickAmountButton.js
│   │
│   ├── molecules/
│   │   ├── CoinItem.js
│   │   ├── NetworkCard.js
│   │   ├── AccountCard.js
│   │   ├── AddressInputGroup.js
│   │   ├── CalculationRow.js
│   │   └── FilterDropdown.js
│   │
│   └── organisms/
│       ├── WithdrawPageTabs.js
│       ├── CoinSelector.js
│       ├── NetworkSelector.js
│       ├── AmountInput.js
│       ├── WithdrawalSummaryCard.js
│       ├── AccountSelectionModal.js
│       ├── SuccessModal.js
│       └── HistoryTable.js
│
├── utils/
│   ├── addressValidation.js (validate BTC/ETH/etc addresses)
│   ├── feeCalculation.js (calculate network fees)
│   └── formatters.js (formatBTC, formatUSDT, maskAddress)
│
├── hooks/
│   ├── useWithdraw.js (handle withdraw submission)
│   └── useWithdrawHistory.js (fetch history data)
│
└── index.js (main page export)
```

---

**Version**: 1.0
**Created**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: Draft - Pending Review
**Related**:
- `001-Withdraw-overview-v1.0.md` (User flow)
- `002-wireframe-content-hierarchy-v1.0.md` (Wireframes)
- `.codex/Skill/skill_uiux.md` (Design system)
