# [Withdraw] - Design Summary & Implementation Checklist (v1.0)

## Executive Summary

**Feature**: Withdrawal page cho RYEX crypto exchange MVP

**Design Status**: ✅ **Ready for FE Implementation** (Hardcoded UI first, API integration later)

**Deliverables Completed**:
1. ✅ User Flow Diagram (Entry → Exit states)
2. ✅ Wireframes (Desktop 1440px + Mobile 375px)
3. ✅ Component Mapping (10 reusable + 10 new components)
4. ✅ Interaction Spec (All 8 states for each component)
5. ✅ Tailwind Mapping & Accessibility Specs
6. ⏳ Visual Mockups (Pending - can be built directly from docs)

**Target Users**: Vietnamese crypto traders (retail → institutional)

**Key UX Principles Applied**:
- Mobile-first responsive (70% users on mobile)
- Trust & security visual language (fintech standard)
- Real-time feedback (fee calculation, validation)
- Accessibility WCAG AA compliance
- Vietnamese localization with English technical terms

---

## Design Highlights

### 1. User Flow Innovation
- **Account selection AFTER address input**: Logical flow where user confirms destination (permanent) before source (changeable).
- **Modal popup for account choice**: Reduces cognitive load by separating critical decisions.
- **Real-time fee calculation**: Transparency builds trust (no hidden fees).

### 2. Component Reuse Strategy
- **10/20 components reused** from existing pages (50% reuse rate)
- Consistent TopAppBar, Footer, Buttons, Cards
- Only new components are domain-specific (CoinSelector, NetworkSelector, etc.)

### 3. Accessibility First
- All components keyboard navigable
- Screen reader optimized (ARIA labels, roles, descriptions)
- Color contrast WCAG AA minimum (tested all combinations)
- Touch targets 40x40px minimum on mobile

### 4. Visual Consistency
- Material 3 Design System tokens (strict adherence)
- Tailwind utility-first CSS (no custom classes)
- Manrope font family throughout
- 8px spacing scale (Tailwind default)

---

## FE Implementation Roadmap

### Phase 1: Hardcoded UI (MVP - Current Sprint)
**Goal**: Build pixel-perfect UI with hardcoded data for visual review and UX testing.

**Tasks**:
1. Set up page structure ([`src/app/(webapp)/app/withdraw/page.js`](../../../src/app/%28webapp%29/app/withdraw/page.js))
2. Build tab navigation (Withdraw + History tabs)
3. Implement form components (Step 1-5) with hardcoded coin/network data
4. Build modals (Account Selection, Success)
5. Create history table with sample data
6. Add all interaction states (loading, error, empty, etc.)
7. Test responsive breakpoints (375px, 768px, 1440px)
8. Accessibility audit (keyboard navigation, screen reader)

**Hardcoded Data Examples**:
```js
const MOCK_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', iconUrl: '/images/tokens/btc.png', balance: '0.5234' },
  { symbol: 'ETH', name: 'Ethereum', iconUrl: '/images/tokens/eth.png', balance: '2.5000' },
  { symbol: 'USDT', name: 'Tether', iconUrl: '/images/tokens/usdt.png', balance: '10000.00' },
];

const MOCK_NETWORKS = [
  { id: 'btc-mainnet', name: 'Bitcoin Mainnet', fee: '0.0005', feeUsd: '35', estimatedTime: '~10-30 phút' },
  { id: 'lightning', name: 'Lightning Network', fee: '0.00001', feeUsd: '0.70', estimatedTime: '~1-5 phút' },
];

const MOCK_ACCOUNTS = [
  { type: 'funding', label: 'Tài khoản tài trợ', sublabel: 'Funding Account', balanceBTC: '0.5234', balanceUSDT: '35,420', description: 'Dùng cho nạp/rút tiền' },
  { type: 'trading', label: 'Tài khoản giao dịch', sublabel: 'Trading Account', balanceBTC: '1.2345', balanceUSDT: '83,500', description: 'Chuyển về Funding trước khi rút' },
];

const MOCK_HISTORY = [
  { date: '02/04/2026 14:30', coin: 'BTC', amount: '0.1234', address: 'bc1q...xyz', network: 'Bitcoin Mainnet', status: 'completed', txHash: '...' },
  { date: '01/04/2026 09:15', coin: 'ETH', amount: '2.5000', address: '0x...abc', network: 'Ethereum ERC-20', status: 'processing', txHash: null },
  // ...more items
];
```

**Acceptance Criteria**:
- [ ] Page renders without errors
- [ ] All tabs functional (switch between Withdraw + History)
- [ ] Form steps progress sequentially (Step 1 → 5)
- [ ] Modal animations smooth (300ms entrance/exit)
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] All 8 states visible for each component (use Storybook or manual testing)
- [ ] Keyboard navigation works (Tab order, Enter/Space triggers, Escape closes modals)
- [ ] No Tailwind class errors (all classes valid)

---

### Phase 2: Form Validation & Client-side Logic (Next Sprint)
**Goal**: Add validation, fee calculation (client-side mock), and error handling.

**Tasks**:
1. Implement address validation (regex for BTC/ETH address formats)
2. Add amount validation (min/max limits, insufficient balance checks)
3. Mock fee calculation (debounced input → simulated API call → update receive amount)
4. Terms checkbox validation (required before submit)
5. Error message mapping (display Vietnamese copy from spec)
6. Success modal flow (submit → loading → success modal → redirect to history)
7. Form reset after successful submission

**Validation Rules**:
```js
// Address validation (example)
function validateBTCAddress(address, network) {
  if (network === 'btc-mainnet') {
    const regex = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
    return regex.test(address);
  }
  return false;
}

// Amount validation
function validateAmount(amount, availableBalance, minAmount, networkFee) {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return 'Số tiền không hợp lệ';
  if (num < minAmount) return `Số tiền rút tối thiểu là ${minAmount} BTC`;
  if (num + networkFee > availableBalance) return 'Số dư không đủ để rút (bao gồm phí mạng)';
  return null; // valid
}
```

**Acceptance Criteria**:
- [ ] Invalid addresses show error message
- [ ] Amount below min/above max shows error
- [ ] Fee calculation updates on amount change (500ms debounce)
- [ ] Submit button disabled until all validations pass + checkbox checked
- [ ] Error messages in Vietnamese (mapped from spec)
- [ ] Success modal appears after submit with mocked transaction ID
- [ ] Form resets after closing success modal

---

### Phase 3: API Integration (Sprint 3)
**Goal**: Connect to real BE endpoints, handle API errors, persist data.

**Tasks** (Collaborate with BE team):
1. Define API contract for `POST /api/v1/user/withdraw`
   - Request body: `{ coin, network, address, account, amount }`
   - Response: `{ success: true, transactionId: "TXN-...", estimatedTime: "..." }`
   - Error codes: `WITHDRAW_UNAUTHORIZED`, `WITHDRAW_RATE_LIMITED`, `WITHDRAW_DAILY_LIMIT_EXCEEDED`, etc.
2. Integrate `GET /api/v1/user/assets` to fetch real coin balances (reuse from Assets page)
3. Integrate `GET /api/v1/withdraw/networks` to fetch available networks + fees (dynamic)
4. Integrate `POST /api/v1/user/withdraw` for submission
5. Integrate `GET /api/v1/user/withdraw/history` for history tab (pagination, filters)
6. Map API error codes to Vietnamese messages (per spec doc)
7. Add retry logic for failed submissions
8. Implement withdrawal limits (min/max from API response)

**API Contract Example** (draft for BA/BE review):
```ts
// POST /api/v1/user/withdraw
Request:
{
  coin: string;          // "BTC"
  network: string;       // "btc-mainnet"
  address: string;       // "bc1q..."
  account: "funding" | "trading";
  amount: string;        // "0.1234" (decimal string for precision)
}

Response (Success):
{
  success: true;
  data: {
    transactionId: string;       // "TXN-20260402-ABC123"
    status: "pending";
    estimatedTime: string;       // "10-30 phút"
    networkFee: string;          // "0.0005"
    receiveAmount: string;       // "0.1229"
  };
}

Response (Error):
{
  success: false;
  error: {
    code: "WITHDRAW_DAILY_LIMIT_EXCEEDED" | "WITHDRAW_RATE_LIMITED" | ...;
    message: string;             // English technical message
    details?: any;               // Optional extra context
  };
}

// GET /api/v1/withdraw/networks?coin=BTC
Response:
{
  networks: [
    {
      id: "btc-mainnet";
      name: "Bitcoin Mainnet";
      fee: "0.0005";
      feeUsd: "35.00";
      minWithdrawal: "0.001";
      maxWithdrawal: "10.0";
      estimatedTime: "10-30 phút";
      available: true;
    },
    // ...more networks
  ];
}

// GET /api/v1/user/withdraw/history?page=1&limit=20&coin=BTC&status=completed
Response:
{
  history: [
    {
      id: string;
      date: string;              // ISO 8601 timestamp
      coin: string;
      amount: string;
      address: string;
      network: string;
      status: "pending" | "processing" | "completed" | "failed" | "cancelled";
      txHash: string | null;     // Blockchain transaction hash (if completed)
      fee: string;
    },
    // ...more items
  ];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

**Acceptance Criteria**:
- [ ] Real coin balances loaded from `/api/v1/user/assets`
- [ ] Network list + fees loaded from `/api/v1/withdraw/networks`
- [ ] Withdrawal submission calls `/api/v1/user/withdraw` with correct payload
- [ ] API errors mapped to Vietnamese messages (user-friendly)
- [ ] History tab loads real data with pagination
- [ ] Loading states shown during API calls
- [ ] Error states shown when API fails (with retry button)
- [ ] Success flow triggers on 200 response

---

### Phase 4: Polish & Edge Cases (Sprint 4)
**Goal**: Handle edge cases, improve UX micro-interactions, finalize copy.

**Tasks**:
1. Add "Address Book" placeholder (UI only, link grayed out, tooltip "Coming soon")
2. Add 2FA/OTP placeholder (modal structure ready, not enforced yet)
3. Handle network unavailable state (show "Đang bảo trì" badge)
4. Handle empty coin list (no assets to withdraw)
5. Handle empty history (first-time user)
6. Add copy-to-clipboard feedback (tooltip "Copied!" after click)
7. Add transaction details drawer (click "Chi tiết" in history table → side panel with full info)
8. Optimize animations (ensure no jank on low-end devices)
9. Add analytics events (track withdrawals, errors, conversion funnel)
10. Final UX copy review (ensure all Vietnamese text is natural, no Eng

lish fallbacks)

**Acceptance Criteria**:
- [ ] Address Book link visible but disabled with tooltip
- [ ] Network maintenance badge shown correctly
- [ ] Empty states polished (illustration + copy + CTA)
- [ ] Copy buttons show "Copied!" feedback
- [ ] Transaction details drawer functional
- [ ] No animation jank on iPhone SE (test on BrowserStack)
- [ ] Analytics events fire correctly (tracked in GA4 or equivalent)
- [ ] All copy finalized in Vietnamese

---

## UI/UX Designer Done Checklist

### Design Deliverables
- [x] User flow diagram với entry/exit states rõ ràng
- [x] Desktop (1440px) + Mobile (375px) wireframes với real data examples
- [x] All 8 interaction states designed (default → empty) cho mọi component
- [x] Component mapping list (reuse vs new) với file structure recommendation
- [x] Tailwind token mapping trong handoff notes (copy-paste ready code)
- [x] Accessibility compliance (contrast, touch target, keyboard nav, ARIA labels)
- [x] Animation timing spec (duration, easing curve) cho modals, buttons, cards
- [x] Error state copy (Vietnamese) mapped từ `error.code` (draft API contract)
- [ ] Visual mockups (optional - code is documented enough to build directly)

### Documentation
- [x] `001-Withdraw-overview-v1.0.md` - Business context + User flow + Requirements
- [x] `002-wireframe-content-hierarchy-v1.0.md` - Wireframes (ASCII art) + Content priority
- [x] `003-component-mapping-v1.0.md` - Component inventory (reuse vs new) + File structure
- [x] `004-interaction-spec-v1.0.md` - All 8 states for each component + Keyboard navigation
- [x] `005-handoff-notes-tailwind-mapping-v1.0.md` - Complete Tailwind classes + Accessibility specs
- [x] `006-design-summary-checklist-v1.0.md` - This file (summary + implementation roadmap)

### Collaboration Checkpoints
- [ ] Review with BA: Validate business logic (Funding vs Trading account flow)
- [ ] Review with FE: Confirm technical feasibility (animations, component complexity)
- [ ] Review with BE: Align API contract (request/response shape, error codes)
- [ ] Review with QA: Define testable acceptance criteria (happy path + edge cases)

---

## FE Implementation Checklist

### P0: Core Withdraw Flow (Must have for MVP launch)
- [ ] **Page Setup**
  - [ ] Create `/app/withdraw/page.js` file
  - [ ] Set up TopAppBar (reuse from Assets page)
  - [ ] Set up LandingFooter (reuse from Assets page)
  - [ ] Add tab navigation (Withdraw + History tabs)

- [ ] **Withdraw Form Tab**
  - [ ] Step 1: Coin Selector
    - [ ] Dropdown component with search
    - [ ] Coin list (icon + symbol + name + balance)
    - [ ] Empty state ("Không có tài sản để rút")
    - [ ] Loading state (skeleton)
    - [ ] Error state (validation message)
  - [ ] Step 2: Network Selector
    - [ ] Radio card group component
    - [ ] Each network card (name + fee + time estimate)
    - [ ] Selected state (border-primary, bg highlight)
    - [ ] Disabled state ("Đang bảo trì" badge)
    - [ ] Loading state (fee calculation spinner)
  - [ ] Step 3: Address Input
    - [ ] Text input with monospace font
    - [ ] Paste button (clipboard API integration)
    - [ ] Validation on blur (regex check)
    - [ ] Error state (red border + message)
    - [ ] Valid state (green border + check icon)
  - [ ] Step 4: Account Selection Modal
    - [ ] Modal backdrop + slide-up animation
    - [ ] 2 account cards (Funding + Trading)
    - [ ] Radio selection UI
    - [ ] "Tiếp tục" and "Huỷ bỏ" buttons
    - [ ] Focus trap (keyboard navigation)
    - [ ] Escape key closes modal
  - [ ] Step 5: Amount Input
    - [ ] Number input (8 decimals for BTC)
    - [ ] Quick amount buttons (25%, 50%, 75%, 100%)
    - [ ] Calculation card (Amount - Fee = Receive)
    - [ ] Real-time fee calculation (debounced 500ms)
    - [ ] Min/max validation + error messages
  - [ ] Withdrawal Summary Card (Sticky sidebar)
    - [ ] All info rows (Coin, Network, Address, Account, Amount, Fee, Receive)
    - [ ] Terms checkbox (required before submit)
    - [ ] Submit button (gradient, disabled until valid)
    - [ ] Loading state (spinner + "Đang xử lý...")
    - [ ] Limits info section (collapsible on mobile)

- [ ] **Success Modal**
  - [ ] Large check icon with bounce animation
  - [ ] Title + Description
  - [ ] Transaction ID with copy button
  - [ ] "Xem lịch sử" and "Đóng" buttons
  - [ ] Modal animations (fade in/out)

- [ ] **Error Handling**
  - [ ] Inline error messages (below inputs)
  - [ ] Error banner (full-width, above submit)
  - [ ] Retry button for API errors
  - [ ] Map error codes to Vietnamese messages

- [ ] **History Tab**
  - [ ] Filters bar (Date range, Coin, Status)
  - [ ] History table (Desktop)
    - [ ] 7 columns (Date, Coin, Amount, Address, Network, Status, Actions)
    - [ ] Status badges (color-coded)
    - [ ] Copy address button
    - [ ] "Chi tiết" link (opens drawer/modal)
    - [ ] Hover states (row highlight)
  - [ ] History cards (Mobile)
    - [ ] Stack vertical
    - [ ] Header (Coin + Status + Date)
    - [ ] Body (Amount + Network + Address)
    - [ ] Footer ("Chi tiết" link)
  - [ ] Pagination (reuse from Market page pattern)
  - [ ] Loading state (skeleton rows)
  - [ ] Error state (retry button)
  - [ ] Empty state ("Chưa có lịch sử rút tiền" + CTA)

- [ ] **Responsive Design**
  - [ ] Mobile (375px): Single column, stacked sections, 2x2 quick buttons, full-width modals
  - [ ] Tablet (768px): 2-column layout for some sections, modal centered
  - [ ] Desktop (1440px): Sticky summary sidebar, table view for history

- [ ] **Accessibility**
  - [ ] All inputs keyboard navigable (Tab order logical)
  - [ ] Modals focus-trapped (Tab cycles inside, Escape closes)
  - [ ] All icon-only buttons have `aria-label`
  - [ ] Error messages linked via `aria-describedby`
  - [ ] Status badges have `aria-label` for screen readers
  - [ ] Color contrast WCAG AA minimum (test with axe DevTools)

---

### P1: Enhancements (Post-MVP)
- [ ] Address Book integration (save/load frequent addresses)
- [ ] 2FA/OTP verification modal (security layer)
- [ ] Transaction details drawer (side panel with full tx info)
- [ ] Advanced filters (custom date range picker, multi-select coin filter)
- [ ] Sortable table columns (click header to sort)
- [ ] Export history (CSV download)
- [ ] Push notifications (withdrawal status updates)

---

### P2: Future Features (Backlog)
- [ ] Withdrawal templates (save withdrawal configs)
- [ ] Batch withdrawals (multiple coins at once)
- [ ] Scheduled withdrawals (auto-withdraw on recurring basis)
- [ ] Withdrawal limits dashboard (visualize daily/monthly limits)
- [ ] Fee comparison tool (compare network fees side-by-side)

---

## QA Test Plan (Draft)

### Happy Path
1. User logs in → Navigates to Withdraw page
2. Selects BTC from coin dropdown
3. Selects Bitcoin Mainnet network
4. Enters valid BTC address
5. Modal pops up → Selects Funding Account → Clicks "Tiếp tục"
6. Enters valid amount (0.1 BTC) → Fee calculated → Receive amount shown
7. Checks terms checkbox
8. Clicks "Xác nhận rút tiền"
9. Success modal appears with transaction ID
10. Clicks "Xem lịch sử" → History tab shows new pending withdrawal

### Edge Cases
1. **Empty coin list**: User has no assets → Empty state shown with "Nạp tiền ngay" CTA
2. **Invalid address**: User enters wrong format → Error message shown, submit disabled
3. **Amount below min**: User enters 0.0001 BTC (below 0.001 min) → Error message shown
4. **Amount above max**: User enters 11 BTC (above 10 BTC daily limit) → Error message shown
5. **Insufficient balance**: User enters 0.6 BTC (available 0.5234 BTC) → Error message shown
6. **Network unavailable**: Network shows "Đang bảo trì" badge → Cannot select
7. **API error**: Backend returns 500 error → Error banner with retry button shown
8. **Session expired**: 401 error → Redirect to login page with return URL
9. **Rate limited**: 429 error → Error message "Bạn đã rút tiền quá nhiều lần..."
10. **Empty history**: First-time user → Empty state shown with "Rút tiền ngay" CTA

### Accessibility Tests
1. **Keyboard navigation**: Tab through all elements in logical order, Enter/Space triggers actions
2. **Screen reader**: VoiceOver (Mac) or NVDA (Windows) reads all labels, errors, status
3. **Color contrast**: All text meets WCAG AA minimum (test with axe DevTools)
4. **Touch targets**: All buttons/inputs >= 40x40px on mobile (test on real device)
5. **Motion**: Animations respect `prefers-reduced-motion` (future enhancement)

### Browser & Device Matrix
- **Desktop**: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- **Mobile**: iPhone SE (375px), iPhone 13 Pro (390px), Samsung Galaxy S21 (360px)
- **Tablet**: iPad Air (768px), iPad Pro 12.9" (1024px)

---

## Known Limitations & Future Improvements

### MVP Limitations
1. **No Address Book**: User must paste address every time (future: save frequent addresses)
2. **No 2FA/OTP**: Security layer not enforced yet (future: required for large withdrawals)
3. **No real-time tx status**: User must refresh history tab (future: WebSocket updates)
4. **Limited error recovery**: Some errors require page refresh (future: better error boundaries)
5. **Single withdrawal at a time**: No batch withdrawals (future: multi-coin withdrawal)

### Performance Considerations
1. **Fee calculation debouncing**: 500ms delay may feel sluggish on slow networks → Consider optimistic UI update
2. **History pagination**: 20 items per page may not be enough for power users → Add "Items per page" selector
3. **Modal animations**: 300ms may cause jank on low-end devices → Test on real devices, consider reducing to 200ms

### Security Considerations
1. **Client-side validation only**: Backend must re-validate all inputs (address format, amount limits, account balance)
2. **No 2FA for MVP**: Large withdrawals are risky without extra auth layer → Prioritize in Phase 2
3. **Transaction ID exposure**: Showing full TX ID may reveal user activity → Consider masking until blockchain confirmation

---

## Success Metrics (KPIs)

### UX Metrics
- **Task completion rate**: % of users who successfully complete a withdrawal (target: >90%)
- **Error rate**: % of withdrawals that fail validation (target: <10%)
- **Time to complete**: Average time from page load to successful withdrawal (target: <2 minutes)
- **Mobile vs Desktop**: Compare completion rates (expect mobile to be slightly lower due to typing)

### Business Metrics
- **Withdrawal volume**: Total BTC/ETH/USDT withdrawn per day (growth indicator)
- **Daily active withdrawers**: Unique users who withdraw each day
- **Repeat withdrawal rate**: % of users who withdraw more than once per week
- **Support ticket rate**: Withdrawals per support ticket (target: <5% need help)

### Technical Metrics
- **Page load time**: Time to first paint (target: <1.5s)
- **API response time**: p95 latency for `/api/v1/user/withdraw` (target: <500ms)
- **Error rate**: 5xx errors as % of total requests (target: <1%)

---

## Handoff to FE Team

**Design files location**: `docs/features/Withdraw/` (6 markdown files)

**Start here**: Read in order:
1. `001-Withdraw-overview-v1.0.md` (understand business context + user flow)
2. `002-wireframe-content-hierarchy-v1.0.md` (visualize layout)
3. `003-component-mapping-v1.0.md` (see what to reuse vs build new)
4. `005-handoff-notes-tailwind-mapping-v1.0.md` (copy-paste Tailwind code)
5. `004-interaction-spec-v1.0.md` (reference for all states)

**Questions?** Reach out to UI/UX team via:
- Slack: `#design-team` channel
- Tag: `@uiux-designer`
- For clarifications on specific components, reference doc + line number

**Next steps**:
1. FE team estimates effort (story points)
2. Break down into subtasks (use this checklist as starting point)
3. Kick off Phase 1 (Hardcoded UI) in Sprint 3
4. Demo to stakeholders at end of sprint

---

**Version**: 1.0
**Created**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: ✅ **Approved for Implementation**
**Next Review**: After Phase 1 completion (hardcoded UI demo)

---

## Changelog

### v1.0 - 2026-04-02 (Initial Release)
- Created complete design package for Withdraw page
- Defined 4-phase implementation roadmap
- Documented all components, states, and Tailwind mapping
- Ready for FE team handoff

---

**End of Design Summary** 🎨

FE team: You have everything you need to build an amazing Withdraw experience. Let's ship it! 🚀
