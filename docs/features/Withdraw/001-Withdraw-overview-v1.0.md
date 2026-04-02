# [Withdraw] - UX Flow & Design Overview (v1.0)

## 1. Feature Overview
- **Business goal**: Cho phép user rút tài sản từ RYEX ra ví external (blockchain wallet).
- **User pain**: User cần một flow rõ ràng, an toàn để withdraw crypto, với transparency về fees và processing time.
- **Design scope**:
  - P0: Withdraw form với đầy đủ states (loading, error, success, empty)
  - P0: Tab layout: "Rút tiền" + "Lịch sử rút tiền"
  - P0: Account selection modal (Funding vs Trading)
  - P1: Address book integration (future enhancement)
  - P1: 2FA/OTP verification (future security layer)

## 2. User Flow (Entry → Exit States)

### Entry Points
1. **Assets page hero section**: Button "Rút tiền" (primary action alongside "Nạp tiền", "Chuyển tiền")
2. **Account cards**: Link "Nạp/Rút" trong Funding Account card
3. **Asset row actions**: Button "Rút" cho mỗi asset trong asset list table
4. **Top nav dropdown** (future): Withdraw option trong global navigation

### Main Flow Steps

```
[Step 1: Chọn Coin/Token]
- Dropdown/Select input với search
- Display: Icon (24x24 circular) + Symbol (bold) + Name (small) + Available balance
- Real data example: "BTC - Bitcoin - Available: 0.5234 BTC"
- User selects 1 coin → enables Step 2

[Step 2: Chọn Network]
- Radio button group hoặc Card-based selection
- Each network shows:
  - Network name (e.g., "Bitcoin Mainnet", "BEP-20 (BSC)")
  - Network fee (e.g., "0.0005 BTC ≈ $35")
  - Est. arrival time (e.g., "~10-30 phút")
- User selects network → enables Step 3

[Step 3: Nhập Địa chỉ ví]
- Text input field (monospace font for address)
- Paste button inside input (material icon: content_paste)
- Validation on blur:
  - Format check (BTC address starts with 1/3/bc1, ETH starts with 0x, etc.)
  - Error message: "Địa chỉ ví không hợp lệ cho network đã chọn"
- Optional: "Chọn từ sổ địa chỉ" button (future - Address Book)
- User enters valid address → triggers Step 4 Modal

[Step 4: Modal - Chọn Account Source]
- **Trigger**: Automatically popup after user nhập address + selected network
- **Modal content**:
  - Title: "Chọn tài khoản rút tiền"
  - Description: "Tài sản sẽ được rút từ tài khoản nào?"
  - 2 Card options (radio selection):
    1. **Funding Account**
       - Icon: wallet (Material Symbol)
       - Label: "Tài khoản tài trợ (Funding Account)"
       - Available balance: "0.5234 BTC ≈ $35,420"
       - Subtext: "Dùng cho nạp/rút tiền"
    2. **Trading Account**
       - Icon: swap_horiz (Material Symbol)
       - Label: "Tài khoản giao dịch (Trading Account)"
       - Available balance: "1.2345 BTC ≈ $83,500"
       - Subtext: "Chuyển về Funding trước khi rút" (if not empty)
  - Primary CTA: "Tiếp tục" (enabled after selection)
  - Secondary CTA: "Huỷ bỏ" (dismiss modal)
- **User action**: Select account → Click "Tiếp tục" → Modal dismiss, return to main form with selected account shown

[Step 5: Nhập Số lượng rút]
- Number input với validation
- Show above input:
  - Selected account: "Từ: Tài khoản tài trợ" (badge/chip)
  - Available balance: "Số dư khả dụng: 0.5234 BTC"
- Quick amount buttons: "25%", "50%", "75%", "Tất cả"
- Below input - Real-time calculation card:
  - "Số tiền rút: 0.1234 BTC"
  - "Phí mạng: 0.0005 BTC ≈ $35"
  - "Số tiền nhận: 0.1229 BTC ≈ $8,315" (green text, bold)
- Validation rules:
  - Min withdrawal: "Tối thiểu 0.001 BTC"
  - Max withdrawal: Available balance - network fee
  - Insufficient balance error: "Số dư không đủ để rút"
- User enters amount → enables Step 6

[Step 6: Review & Confirm]
- Summary card (rounded-2xl, surface-container-low background):
  - Row 1: Coin icon + "Rút BTC qua Bitcoin Mainnet"
  - Row 2: "Địa chỉ nhận" + masked address (bc1q...xyz) + copy button
  - Row 3: "Số tiền rút" + "0.1234 BTC"
  - Row 4: "Phí mạng" + "0.0005 BTC"
  - Divider
  - Row 5 (large, bold): "Số tiền nhận" + "0.1229 BTC" (green text)
  - Row 6: "Thời gian dự kiến" + "10-30 phút"
- Terms checkbox:
  - "Tôi đã kiểm tra kỹ địa chỉ ví và hiểu rằng giao dịch không thể hoàn tác"
  - Required before submit
- Primary CTA: "Xác nhận rút tiền" (gradient button)
  - Disabled until checkbox checked
  - Loading state: "Đang xử lý..." (disabled + spinner)
- Secondary CTA: "Quay lại chỉnh sửa" (outline button)

[Step 7: Submit & Result]
- **Loading state**:
  - Button text: "Đang xử lý yêu cầu rút tiền..."
  - Disabled form inputs
  - Spinner icon
- **Success state**:
  - Success modal (centered overlay):
    - Icon: check_circle (green, large)
    - Title: "Rút tiền thành công"
    - Description: "Yêu cầu rút 0.1234 BTC đã được gửi. Bạn có thể theo dõi trạng thái trong lịch sử giao dịch."
    - Transaction ID: "TXN-20260402-ABC123" (copy button)
    - Primary CTA: "Xem lịch sử" (navigate to History tab)
    - Secondary CTA: "Đóng" (return to Assets page)
- **Error state**:
  - Error banner (red, on-page):
    - Icon: error (red)
    - Title: Error message from API (Vietnamese)
    - Description: Actionable guidance (e.g., "Vui lòng kiểm tra lại thông tin hoặc thử lại sau")
    - CTA: "Thử lại" button (retry submission)
  - Form remains editable
  - Focus returns to problematic field (if validation error)
```

### Exit States
1. **Success**: User completes withdrawal → Success modal → Navigate to History tab or Assets page
2. **Cancel**: User clicks "Huỷ bỏ" or browser back → Confirmation dialog "Bạn có chắc muốn hủy? Thông tin đã nhập sẽ bị mất." → Return to Assets page
3. **Error**: API error → Show error message + Retry button → User can retry or navigate away
4. **Session expired**: Unauthorized error → Redirect to Login page with return URL

## 3. Tab Layout: "Rút tiền" vs "Lịch sử rút tiền"

### Tab Navigation (Material 3 Primary Tabs)
- Tab 1: "Rút tiền" (default active)
- Tab 2: "Lịch sử rút tiền"
- Active indicator: Bottom border (2px, primary color)
- Hover state: Background surface-container-low
- Mobile: Tabs scroll horizontally if needed

### Tab "Lịch sử rút tiền" Content

#### Filters Bar
- Date range picker: "7 ngày qua" (dropdown: Today, 7 days, 30 days, Custom range)
- Coin filter: "Tất cả" (dropdown multiselect: BTC, ETH, USDT, etc.)
- Status filter: "Tất cả" (dropdown: Pending, Processing, Completed, Failed, Cancelled)
- Apply/Reset buttons

#### History Table (Desktop)
Columns:
1. **Ngày giờ**: "02/04/2026 14:30" (dd/mm/yyyy HH:mm)
2. **Coin**: Icon + Symbol (e.g., BTC icon + "BTC")
3. **Số lượng**: "0.1234 BTC" (bold)
4. **Địa chỉ**: Masked "bc1q...xyz" (click to copy full, show tooltip)
5. **Network**: "Bitcoin Mainnet" (small text)
6. **Trạng thái**: Status badge
   - Pending: `bg-[#f9a825]/10 text-[#f9a825]` "Chờ xử lý"
   - Processing: `bg-[#4c56af]/10 text-[#4c56af]` "Đang xử lý"
   - Completed: `bg-[#01bc8d]/10 text-[#01bc8d]` "Hoàn thành"
   - Failed: `bg-[#ba1a1a]/10 text-[#ba1a1a]` "Thất bại"
   - Cancelled: `bg-outline/10 text-outline` "Đã hủy"
7. **Hành động**:
   - "Chi tiết" link (opens drawer/modal with full transaction details)
   - "TxHash" link (opens blockchain explorer in new tab) - only for Completed

#### History Cards (Mobile - Stack vertical)
Each card:
- Header: Coin icon + Symbol + Status badge + Date
- Body: Amount (large, bold) + Network (small)
- Footer: Masked address + "Chi tiết" link

#### Empty State (No history)
- Icon: history (Material Symbol, large, gray)
- Title: "Chưa có lịch sử rút tiền"
- Description: "Các giao dịch rút tiền của bạn sẽ hiển thị tại đây"
- CTA: "Rút tiền ngay" (switch to "Rút tiền" tab)

#### Pagination
- Same pattern as Market page: Chevron prev/next + numbered pages + ellipsis
- Items per page: 20 (configurable)

## 4. Interaction States (All Components)

### Coin Selector Dropdown
- **Default**: Placeholder "Chọn coin để rút"
- **Hover**: Background surface-container-low
- **Focus**: Ring-2 ring-primary-container
- **Active/Open**: Dropdown list expanded, search input visible
- **Disabled**: Opacity-40, cursor-not-allowed (if no assets available)
- **Loading**: Skeleton placeholder for coin list
- **Error**: Red border, error text below
- **Empty**: "Không tìm thấy tài sản" in dropdown list

### Network Selection (Radio Cards)
- **Default**: Border outline-variant, hover:border-primary
- **Hover**: Translate-y-[-2px], shadow-md
- **Active/Selected**: Border-2 border-primary, bg-primary-container/5
- **Focus**: Ring-2 ring-primary-container
- **Disabled**: Opacity-40, cursor-not-allowed (if network unavailable)

### Address Input
- **Default**: Border outline-variant
- **Hover**: Border primary
- **Focus**: Border-b-2 border-primary (underline style)
- **Active/Typing**: Focus state maintained
- **Error**: Border-2 border-error, text-error below input
- **Success/Valid**: Border-2 border-primary-container, check icon right
- **Disabled**: Opacity-60, bg-surface-container-low

### Amount Input
- **Default**: Border outline-variant
- **Hover**: Border primary
- **Focus**: Border-b-2 border-primary
- **Error**: Border-error, error message below (e.g., "Số dư không đủ")
- **Loading calculation**: Spinner icon right side (when calculating fee/receive amount)

### Primary Button "Xác nhận rút tiền"
- **Default**: `bg-gradient-to-br from-[#006c4f] to-[#01bc8d]` + `text-white` + `shadow-lg`
- **Hover**: `opacity-90`
- **Active/Pressed**: `scale-95` + `duration-200`
- **Focus**: `ring-2 ring-primary-container`
- **Disabled**: `opacity-60 cursor-not-allowed` (checkbox not checked or validation failed)
- **Loading**: Text "Đang xử lý..." + spinner icon + disabled

### Account Selection Modal
- **Entrance animation**: Fade in backdrop + slide up modal (300ms)
- **Exit animation**: Fade out backdrop + slide down modal (200ms)
- **Backdrop**: `bg-black/50` + `backdrop-blur-sm`
- **Modal**: `rounded-2xl` + `shadow-[0_24px_48px_rgba(0,0,0,0.1)]` + `max-w-md`

### Status Badges (History table)
- **Pending**: Yellow background + yellow text + clock icon
- **Processing**: Blue background + blue text + progress_activity icon (rotate animation)
- **Completed**: Green background + green text + check_circle icon
- **Failed**: Red background + red text + error icon
- **Cancelled**: Gray background + gray text + cancel icon

## 5. Responsive Breakpoints

### Mobile (375px - Base styles)
- **Form layout**: Stack vertical, full-width inputs
- **Quick amount buttons**: 2x2 grid instead of 4 inline
- **Summary card**: Simplified rows, larger text
- **Modal**: Full-screen on mobile (slide up from bottom)
- **History table**: Switch to card view (stack vertical)
- **Tabs**: Full-width, equal distribution

### Tablet (768px - md:)
- **Form layout**: Still vertical, but wider max-width (600px centered)
- **Quick amount buttons**: 4 inline
- **Modal**: Centered overlay, max-width 500px
- **History table**: Table view with horizontal scroll if needed

### Desktop (1440px - lg: / xl:)
- **Form layout**: Centered, max-width 800px
- **Side-by-side sections**: Form left (60%), Summary/Info right (40%) - sticky
- **History table**: Full table view, all columns visible
- **Modal**: Centered, max-width 600px

## 6. Design Rationale & Business Rules

### Why Account Selection Modal After Address Input?
- **UX reasoning**: Địa chỉ + network là thông tin critical và permanent (không thể đổi sau khi submit). User nên xác định destination trước khi chọn source account.
- **Business logic**: Available balance khác nhau giữa Funding vs Trading → cần show balance accurate sau khi user đã chọn coin/network (fee calculation).

### Why Real-time Fee Calculation?
- **Transparency**: User thấy rõ phí mạng và số tiền thực nhận TRƯỚC KHI confirm.
- **Trust signal**: Fintech best practice - no hidden fees.
- **Error prevention**: User biết ngay nếu số dư không đủ (amount + fee > balance).

### Why Terms Checkbox Required?
- **Legal protection**: Crypto transactions irreversible → user must acknowledge.
- **Risk mitigation**: Reduce support tickets về "wrong address" withdrawals.
- **Industry standard**: All major exchanges (Binance, Coinbase, Kraken) có checkbox tương tự.

### Why Tab Layout (Withdraw + History)?
- **Context switching**: User thường cần check lịch sử trước khi rút lần nữa (verify previous tx completed).
- **Information hierarchy**: Action (Withdraw) là primary, History là secondary → Tab pattern phù hợp hơn separate pages.
- **Reduce navigation depth**: Không cần navigate ra ngoài để xem history.

## 7. Error Scenarios & Copy

### Validation Errors (Client-side)
```js
INVALID_ADDRESS → "Địa chỉ ví không hợp lệ cho network đã chọn. Vui lòng kiểm tra lại."
AMOUNT_BELOW_MIN → "Số tiền rút tối thiểu là 0.001 BTC."
AMOUNT_ABOVE_MAX → "Số tiền rút vượt quá số dư khả dụng."
INSUFFICIENT_BALANCE → "Số dư không đủ để rút (bao gồm phí mạng)."
MISSING_TERMS_AGREEMENT → "Vui lòng xác nhận bạn đã đọc và đồng ý với điều khoản."
```

### API Errors (Server-side - mapped từ `error.code`)
```js
WITHDRAW_UNAUTHORIZED → "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
WITHDRAW_RATE_LIMITED → "Bạn đã rút tiền quá nhiều lần. Vui lòng thử lại sau 1 giờ."
WITHDRAW_DAILY_LIMIT_EXCEEDED → "Đã vượt quá hạn mức rút tiền hàng ngày. Hạn mức: 10 BTC/ngày."
WITHDRAW_NETWORK_UNAVAILABLE → "Network đang bảo trì. Vui lòng chọn network khác hoặc thử lại sau."
WITHDRAW_INVALID_ACCOUNT → "Tài khoản không hợp lệ hoặc không đủ số dư."
WITHDRAW_FAILED → "Không thể xử lý yêu cầu rút tiền lúc này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
```

### Success Messages
```
Withdrawal request submitted:
"Yêu cầu rút tiền đã được gửi thành công. Giao dịch đang được xử lý và sẽ hoàn thành trong 10-30 phút."

Withdrawal completed:
"Rút tiền hoàn thành. 0.1234 BTC đã được chuyển đến địa chỉ bc1q...xyz."
```

## 8. Accessibility Requirements

### Keyboard Navigation
- [ ] All form inputs tabbable in logical order (coin → network → address → amount → checkbox → submit)
- [ ] Modal focus trap: Tab cycles within modal, Escape closes modal
- [ ] Dropdown opens with Enter/Space, navigates with Arrow keys
- [ ] Submit button triggers with Enter/Space

### Screen Reader Support
- [ ] Form labels associated with inputs (`<label>` or `aria-label`)
- [ ] Error messages linked via `aria-describedby`
- [ ] Status badges have `aria-label` (e.g., "Trạng thái: Hoàn thành")
- [ ] Loading states announced via `aria-live="polite"`
- [ ] Modal has `role="dialog"` + `aria-labelledby` + `aria-describedby`

### Color Contrast (WCAG AA)
- [ ] All text on backgrounds: minimum 4.5:1 contrast
- [ ] Status badge text: minimum 3:1 contrast
- [ ] Error messages: #ba1a1a on white = 5.3:1 ✅

### Touch Targets (Mobile)
- [ ] All buttons/inputs: minimum 40x40px (`h-10 w-10`)
- [ ] Tab buttons: minimum 48x48px
- [ ] Quick amount buttons: 40x40px with gap-2 (spacing)

## 9. Performance Considerations

### Fee Calculation Debouncing
- Debounce amount input changes (500ms) before calling fee calculation API
- Show loading spinner during calculation
- Cache fee for same amount (prevent redundant API calls)

### Modal Animation
- Use `transform` instead of `top/left` for GPU acceleration
- Transition duration: 300ms entrance, 200ms exit (snappy feel)
- Backdrop blur: May impact performance on low-end devices → optional via `prefers-reduced-motion`

### History Table Pagination
- Fetch 20 items per page (not all history at once)
- Virtual scrolling for very long lists (future enhancement)
- Lazy load transaction details (only when "Chi tiết" clicked)

## 10. Future Enhancements (Out of MVP Scope)

### P1: Address Book
- Save frequently-used addresses with labels
- Select from saved addresses instead of paste
- Edit/Delete saved addresses

### P1: 2FA/OTP Verification
- SMS OTP or Authenticator app code
- Required for withdrawals > certain threshold (e.g., 1 BTC)
- Security best practice for fintech

### P2: Withdrawal Templates
- Save withdrawal configurations (coin + network + address + amount)
- Quick repeat withdrawals with 1 click

### P2: Batch Withdrawals
- Withdraw multiple coins in one flow
- Advanced feature for institutional users

### P2: Withdrawal Scheduling
- Schedule withdrawal for specific date/time
- Auto-withdraw on recurring basis (e.g., weekly)

---

**Version**: 1.0
**Created**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: Draft - Pending Review
**Related Docs**:
- `docs/features/Assets/001-Assets-overview-v1.0.md` (Business definitions: Funding vs Trading)
- `.codex/Skill/skill_uiux.md` (Design system guidelines)
- `.codex/Rule/rule_uiux.md` (Design rules & constraints)
