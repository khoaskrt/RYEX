# [Withdraw] - Interaction Spec: All States (v1.0)

## Component States Documentation

Theo RYEX UI/UX Rule, mọi interactive component phải design đủ **8 states**:
1. Default (resting)
2. Hover
3. Active/Pressed
4. Focus (keyboard navigation)
5. Disabled
6. Loading
7. Error
8. Empty

---

## 1. CoinSelector (Dropdown)

### State 1: Default (Resting)
- **Visual**:
  - Border: `border border-outline-variant`
  - Background: `bg-surface-container-low`
  - Text: Placeholder "Chọn coin để rút" in `text-on-surface-variant`
  - Icon: `expand_more` in `text-on-surface-variant`
- **Behavior**: Clickable, ready for interaction
- **Tailwind**:
  ```jsx
  className="flex items-center justify-between px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-pointer"
  ```

### State 2: Hover
- **Visual**:
  - Border: `border-primary`
  - Background: `bg-surface-container-low` (unchanged)
  - Cursor: `cursor-pointer`
- **Behavior**: Visual feedback when mouse over
- **Tailwind**: `hover:border-primary`

### State 3: Active/Open (Dropdown expanded)
- **Visual**:
  - Border: `border-2 border-primary`
  - Ring: `ring-2 ring-primary-container`
  - Icon: `expand_more` rotates 180deg
  - Dropdown list appears below with shadow
- **Behavior**: User can search and select coin
- **Tailwind**: `border-2 border-primary ring-2 ring-primary-container`
- **Animation**: Icon `transition-transform duration-200 rotate-180`

### State 4: Focus (Keyboard navigation)
- **Visual**:
  - Ring: `ring-2 ring-primary-container`
  - Border: `border-primary`
- **Behavior**: Tab-accessible, Enter/Space to open
- **Tailwind**: `focus:ring-2 focus:ring-primary-container focus:border-primary`

### State 5: Disabled
- **Visual**:
  - Opacity: `opacity-40`
  - Cursor: `cursor-not-allowed`
  - Background: `bg-surface-container-low` (grayed out)
- **Behavior**: Not clickable, no events
- **Tailwind**: `disabled:opacity-40 disabled:cursor-not-allowed`
- **When**: No assets available to withdraw

### State 6: Loading (Fetching coin list)
- **Visual**:
  - Skeleton placeholder: `bg-surface-container animate-pulse`
  - Height: Same as default input (`h-12`)
  - Rounded: `rounded-xl`
- **Behavior**: Non-interactive while loading
- **Tailwind**: `bg-surface-container animate-pulse h-12 rounded-xl`

### State 7: Error (Validation failed)
- **Visual**:
  - Border: `border-2 border-error`
  - Error text below: `text-xs text-error`
  - Error message: "Vui lòng chọn coin để tiếp tục"
- **Behavior**: User must fix before proceeding
- **Tailwind**: `border-2 border-error`

### State 8: Empty (No coins available)
- **Visual**:
  - Dropdown opens but shows empty state
  - Icon: `account_balance_wallet` large in `text-on-surface-variant/30`
  - Text: "Không có tài sản để rút"
  - Subtext: "Vui lòng nạp tiền vào tài khoản trước"
- **Behavior**: No selection possible
- **Tailwind**: Empty state inside dropdown list

---

## 2. NetworkSelector (Radio Card Group)

### State 1: Default (Unselected card)
- **Visual**:
  - Border: `border-2 border-outline-variant`
  - Background: `bg-surface-container-lowest`
  - Text: `text-on-surface` (name), `text-on-surface-variant` (fee/time)
  - Radio icon: `radio_button_unchecked` in `text-outline`
- **Behavior**: Clickable to select
- **Tailwind**:
  ```jsx
  className="block p-4 rounded-xl border-2 border-outline-variant bg-surface-container-lowest cursor-pointer transition-all"
  ```

### State 2: Hover (Unselected)
- **Visual**:
  - Border: `border-primary`
  - Shadow: `shadow-md`
  - Transform: `translate-y-[-2px]`
- **Behavior**: Visual feedback on hover
- **Tailwind**: `hover:border-primary hover:shadow-md hover:translate-y-[-2px]`
- **Animation**: `transition-all duration-200`

### State 3: Active/Selected
- **Visual**:
  - Border: `border-2 border-primary`
  - Background: `bg-primary-container/5`
  - Radio icon: `radio_button_checked` in `text-primary`
  - Network name: `text-primary` (highlight)
- **Behavior**: Currently selected network
- **Tailwind**: `border-2 border-primary bg-primary-container/5`

### State 4: Focus (Keyboard navigation)
- **Visual**:
  - Ring: `ring-2 ring-primary-container`
  - Outline: Browser default removed (`focus:outline-none`)
- **Behavior**: Tab to navigate, Space/Enter to select
- **Tailwind**: `focus:ring-2 focus:ring-primary-container focus:outline-none`

### State 5: Disabled (Network unavailable)
- **Visual**:
  - Opacity: `opacity-40`
  - Cursor: `cursor-not-allowed`
  - Badge: "Đang bảo trì" in `bg-error/10 text-error text-xs px-2 py-0.5 rounded`
- **Behavior**: Not selectable
- **Tailwind**: `opacity-40 cursor-not-allowed`
- **When**: Network maintenance or unavailable

### State 6: Loading (Fetching network fees)
- **Visual**:
  - Fee value shows spinner: `<span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>`
  - Rest of card visible but disabled
- **Behavior**: Wait for fee calculation before selection
- **Tailwind**: Spinner icon with `animate-spin`

### State 7: Error (Fee calculation failed)
- **Visual**:
  - Fee text: "Không thể tải phí" in `text-error text-xs`
  - Error icon: `error` in `text-error`
- **Behavior**: User can still select but warned
- **Tailwind**: `text-error text-xs`

### State 8: Empty (No networks available)
- **Visual**:
  - Container empty state
  - Icon: `cloud_off` in `text-on-surface-variant/30`
  - Text: "Không có network khả dụng"
- **Behavior**: Cannot proceed with withdrawal
- **Tailwind**: Empty state placeholder

---

## 3. AddressInput (Text Input with Paste Button)

### State 1: Default (Empty)
- **Visual**:
  - Border: None (Tailwind forms plugin removes it)
  - Background: `bg-surface-container-low`
  - Placeholder: "Nhập địa chỉ ví hoặc dán từ clipboard" in `text-on-surface-variant`
  - Font: `font-mono` (for address readability)
  - Paste button: `text-on-surface-variant` icon `content_paste`
- **Behavior**: Ready for text input or paste
- **Tailwind**:
  ```jsx
  className="font-mono bg-surface-container-low border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary-container w-full placeholder:text-on-surface-variant"
  ```

### State 2: Hover
- **Visual**:
  - Background: `bg-surface-container` (slightly darker)
  - Paste button: `text-primary` (highlight)
- **Behavior**: Ready to click paste button
- **Tailwind**: `hover:bg-surface-container`

### State 3: Active/Typing
- **Visual**:
  - Focus ring: `ring-2 ring-primary-container`
  - Border-bottom underline: `border-b-2 border-primary` (Material 3 pattern)
  - Cursor blinking in input
- **Behavior**: User typing address
- **Tailwind**: `focus:ring-2 focus:ring-primary-container focus:border-b-2 focus:border-primary`

### State 4: Focus (Keyboard navigation)
- **Visual**: Same as Active/Typing
- **Behavior**: Tab to focus, type or paste
- **Tailwind**: Same as State 3

### State 5: Disabled
- **Visual**:
  - Opacity: `opacity-60`
  - Background: `bg-surface-container-highest` (grayed)
  - Cursor: `cursor-not-allowed`
  - Paste button disabled
- **Behavior**: Not editable
- **Tailwind**: `disabled:opacity-60 disabled:bg-surface-container-highest disabled:cursor-not-allowed`
- **When**: Before coin/network selected

### State 6: Loading (Validating address)
- **Visual**:
  - Spinner icon right side: `<span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>`
  - Input disabled during validation
- **Behavior**: Wait for validation result
- **Tailwind**: Spinner with `animate-spin`

### State 7: Error (Invalid address)
- **Visual**:
  - Border: `border-2 border-error` (override focus ring)
  - Error icon: `error` in `text-error` (right side, replaces paste button)
  - Error message below: `text-xs text-error` "Địa chỉ ví không hợp lệ cho network đã chọn"
- **Behavior**: User must correct address
- **Tailwind**: `border-2 border-error`
- **Error text**:
  ```jsx
  {error && <p className="text-xs text-error mt-1 flex items-center gap-1">
    <span className="material-symbols-outlined text-sm">error</span>
    {error}
  </p>}
  ```

### State 8: Valid (Address validated successfully)
- **Visual**:
  - Border: `border-2 border-primary-container` (green tint)
  - Check icon: `check_circle` in `text-primary-container` (right side)
  - No error message
- **Behavior**: Address accepted, can proceed
- **Tailwind**: `border-2 border-primary-container`
- **Check icon**:
  ```jsx
  {valid && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-primary-container material-symbols-outlined">check_circle</span>}
  ```

---

## 4. AccountSelectionModal

### State 1: Closed (Default)
- **Visual**: Modal not rendered (`isOpen = false`)
- **Behavior**: Hidden from DOM
- **Tailwind**: Conditional render `{isOpen && <Modal />}`

### State 2: Opening (Entrance animation)
- **Visual**:
  - Backdrop fades in: `opacity-0 → opacity-100` (300ms)
  - Modal slides up: `translate-y-4 opacity-0 → translate-y-0 opacity-100` (300ms)
- **Behavior**: Animating into view
- **Tailwind**:
  ```jsx
  // Backdrop
  className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
  // Modal
  className="fixed inset-0 flex items-center justify-center transition-all duration-300 transform"
  // Initial: translate-y-4 opacity-0
  // Final: translate-y-0 opacity-100
  ```
- **Animation lib**: Could use Framer Motion or CSS transitions

### State 3: Open (Active)
- **Visual**:
  - Backdrop: `bg-black/50 backdrop-blur-sm`
  - Modal: `bg-surface-container-lowest rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.1)] max-w-[600px]`
  - Focus trapped inside modal (Tab cycles through elements)
- **Behavior**: User can select account and confirm
- **Tailwind**: Full modal structure visible

### State 4: Account Card Hover (inside modal)
- **Visual**:
  - Card border: `border-primary`
  - Card shadow: `shadow-md`
- **Behavior**: Visual feedback on hoverable cards
- **Tailwind**: `hover:border-primary hover:shadow-md`

### State 5: Account Card Selected
- **Visual**:
  - Card border: `border-2 border-primary`
  - Card background: `bg-primary-container/5`
  - Radio icon: `radio_button_checked` in `text-primary`
- **Behavior**: Currently selected account
- **Tailwind**: `border-2 border-primary bg-primary-container/5`

### State 6: "Tiếp tục" Button Disabled
- **Visual**:
  - Opacity: `opacity-60`
  - Cursor: `cursor-not-allowed`
- **Behavior**: Disabled until account selected
- **Tailwind**: `disabled:opacity-60 disabled:cursor-not-allowed`

### State 7: Closing (Exit animation)
- **Visual**:
  - Backdrop fades out: `opacity-100 → opacity-0` (200ms)
  - Modal slides down: `translate-y-0 → translate-y-4 opacity-0` (200ms)
- **Behavior**: Animating out of view
- **Tailwind**: Reverse of opening animation (faster duration)

### State 8: Error (Insufficient balance in selected account)
- **Visual**:
  - Warning banner inside modal (top):
    ```jsx
    <div className="bg-error-container/20 border border-error/30 rounded-lg p-3 mb-4">
      <p className="text-xs text-error flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">warning</span>
        Tài khoản này không đủ số dư để rút. Vui lòng chọn tài khoản khác hoặc nạp thêm tiền.
      </p>
    </div>
    ```
  - "Tiếp tục" button remains enabled but shows warning
- **Behavior**: User can proceed with warning or cancel
- **Tailwind**: Error banner component

---

## 5. AmountInput (Number Input with Quick Buttons)

### State 1: Default (Empty)
- **Visual**:
  - Border: None
  - Background: `bg-surface-container-low`
  - Placeholder: "0.00000000" in `text-on-surface-variant`
  - Font: `text-lg font-bold` (large for readability)
  - Unit label: "BTC" in `text-on-surface-variant` (absolute positioned right)
  - Available balance above: `text-xs text-on-surface-variant`
- **Behavior**: Ready for number input
- **Tailwind**:
  ```jsx
  className="bg-surface-container-low border-none rounded-xl pl-4 pr-16 py-4 text-lg font-bold focus:ring-2 focus:ring-primary-container w-full"
  ```

### State 2: Hover (on input or quick buttons)
- **Visual**:
  - Input: `bg-surface-container` (slightly darker)
  - Quick buttons: `bg-primary-container/20` (highlight)
- **Behavior**: Ready to click or type
- **Tailwind**: `hover:bg-surface-container` (input), `hover:bg-primary-container/20` (buttons)

### State 3: Active/Typing
- **Visual**:
  - Focus ring: `ring-2 ring-primary-container`
  - Border-bottom: `border-b-2 border-primary`
  - Cursor blinking
- **Behavior**: User typing amount
- **Tailwind**: `focus:ring-2 focus:ring-primary-container focus:border-b-2 focus:border-primary`

### State 4: Focus (Keyboard navigation)
- **Visual**: Same as State 3
- **Behavior**: Tab to focus, Arrow keys to increment/decrement (browser default)
- **Tailwind**: Same as State 3

### State 5: Disabled
- **Visual**:
  - Opacity: `opacity-60`
  - Background: `bg-surface-container-highest`
  - Cursor: `cursor-not-allowed`
  - Quick buttons also disabled
- **Behavior**: Not editable
- **Tailwind**: `disabled:opacity-60 disabled:cursor-not-allowed`
- **When**: Before coin/network/address completed

### State 6: Loading (Calculating fee)
- **Visual**:
  - Calculation card below shows spinner:
    ```jsx
    <div className="flex justify-between items-center">
      <span className="text-sm text-on-surface-variant">Đang tính phí...</span>
      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
    </div>
    ```
  - Input remains active but fee values show loading
- **Behavior**: User can continue typing while fee calculates (debounced)
- **Tailwind**: Spinner in calculation card

### State 7: Error (Below min or above max)
- **Visual**:
  - Border: `border-2 border-error`
  - Error message below input:
    - Below min: "Số tiền rút tối thiểu là 0.001 BTC"
    - Above max: "Số tiền rút vượt quá số dư khả dụng (0.5234 BTC)"
    - Insufficient for fee: "Số dư không đủ để rút (bao gồm phí mạng 0.0005 BTC)"
  - Error text: `text-xs text-error mt-1`
  - Calculation card shows red values
- **Behavior**: Submit button disabled until fixed
- **Tailwind**: `border-2 border-error`
- **Error messages** (below input):
  ```jsx
  {error && <p className="text-xs text-error mt-1 flex items-center gap-1">
    <span className="material-symbols-outlined text-sm">error</span>
    {error}
  </p>}
  ```

### State 8: Valid (Amount within limits)
- **Visual**:
  - Border: Normal (no error or success border for amount input - keep clean)
  - Calculation card shows green "Số tiền nhận":
    ```jsx
    <div className="flex justify-between">
      <span className="text-sm font-bold text-on-surface-variant">Số tiền nhận</span>
      <span className="text-lg font-extrabold text-primary-container">0.1229 BTC</span>
    </div>
    ```
- **Behavior**: Amount accepted, can proceed
- **Tailwind**: Green text for receive amount `text-primary-container`

---

## 6. Withdrawal Summary Card

### State 1: Default (Empty - no data filled yet)
- **Visual**:
  - All values show "---" placeholders in `text-on-surface-variant`
  - Checkbox: Unchecked, `text-outline-variant`
  - Submit button: Disabled `opacity-60 cursor-not-allowed`
  - Limits info section visible
- **Behavior**: Waiting for user to fill form
- **Tailwind**:
  ```jsx
  // Value placeholder
  <span className="font-semibold text-on-surface-variant">---</span>
  // Submit button disabled
  <button disabled className="... opacity-60 cursor-not-allowed">
    Xác nhận rút tiền
  </button>
  ```

### State 2: Partially Filled (Some data available)
- **Visual**:
  - Filled values: `text-on-surface font-semibold`
  - Empty values: Still "---" in `text-on-surface-variant`
  - Checkbox: Still unchecked
  - Submit button: Still disabled
- **Behavior**: Card updates as user progresses through form
- **Tailwind**: Conditional rendering based on data availability

### State 3: Fully Filled (All data ready)
- **Visual**:
  - All values filled: `text-on-surface font-semibold`
  - "Số tiền nhận" highlighted: `text-lg font-extrabold text-primary-container`
  - Checkbox: Unchecked but enabled
  - Submit button: Still disabled (waiting for checkbox)
- **Behavior**: Ready for terms agreement
- **Tailwind**: Green receive amount stands out

### State 4: Checkbox Hover
- **Visual**:
  - Checkbox border: `border-primary`
- **Behavior**: Visual feedback on hoverable checkbox
- **Tailwind**: `hover:border-primary`

### State 5: Checkbox Checked (Terms agreed)
- **Visual**:
  - Checkbox: Checked state `bg-primary border-primary`
  - Submit button: Enabled, gradient colors vivid
- **Behavior**: Form ready to submit
- **Tailwind**: Checkbox uses Tailwind Forms plugin default checked state

### State 6: Submit Button Hover (when enabled)
- **Visual**:
  - Opacity: `opacity-90`
- **Behavior**: Ready to click submit
- **Tailwind**: `hover:opacity-90`

### State 7: Loading (Submitting withdrawal)
- **Visual**:
  - Submit button:
    - Text: "Đang xử lý..." (instead of "Xác nhận rút tiền")
    - Spinner icon: `<span className="material-symbols-outlined animate-spin inline-block mr-2">progress_activity</span>`
    - Disabled: `cursor-not-allowed`
  - Form inputs: All disabled (prevent changes during submit)
- **Behavior**: Waiting for API response
- **Tailwind**:
  ```jsx
  <button disabled className="... cursor-not-allowed">
    {loading && <span className="material-symbols-outlined animate-spin inline-block mr-2 text-sm">progress_activity</span>}
    {loading ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
  </button>
  ```

### State 8: Error (Submission failed)
- **Visual**:
  - Error banner above submit button:
    ```jsx
    <div className="bg-error-container/20 border border-error/30 rounded-lg p-3 mb-4">
      <p className="text-xs text-error flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">error</span>
        {errorMessage}
      </p>
      <button className="text-xs text-error font-bold underline mt-2">Thử lại</button>
    </div>
    ```
  - Submit button: Re-enabled for retry
  - Form inputs: Re-enabled for editing
- **Behavior**: User can fix and retry
- **Tailwind**: Error banner component

---

## 7. Success Modal

### State 1: Closed
- **Visual**: Not rendered
- **Behavior**: Hidden until success
- **Tailwind**: Conditional render

### State 2: Opening (Success animation)
- **Visual**:
  - Backdrop fade in (300ms)
  - Modal slide up (300ms)
  - Check icon: Scale animation `scale-0 → scale-100` with bounce
- **Behavior**: Celebrating success
- **Tailwind**: Similar to Account Modal + check icon animation

### State 3: Open (Active)
- **Visual**:
  - Large check icon: `text-6xl text-primary-container` with `check_circle`
  - Title: `text-2xl font-bold text-on-surface`
  - Description: `text-sm text-on-surface-variant`
  - Transaction ID: `font-mono text-xs bg-surface-container-low px-3 py-2 rounded` with copy button
  - 2 CTAs:
    - Primary: "Xem lịch sử" (gradient button)
    - Secondary: "Đóng" (outline button)
- **Behavior**: User can navigate to history or close
- **Tailwind**: Success modal full structure

### State 4: Copy Transaction ID Hover
- **Visual**:
  - Copy button: `text-primary`
  - Tooltip: "Copy" appears on hover
- **Behavior**: Click to copy, tooltip shows "Copied!"
- **Tailwind**: `hover:text-primary`

### State 5: "Xem lịch sử" Button Hover
- **Visual**: `opacity-90`
- **Behavior**: Navigate to History tab
- **Tailwind**: `hover:opacity-90`

### State 6: Closing
- **Visual**: Reverse of opening animation
- **Behavior**: Modal dismisses
- **Tailwind**: Fade out + slide down

### State 7/8: N/A
- Success modal doesn't have disabled/error/loading/empty states (it's a result state itself)

---

## 8. History Table (Desktop)

### State 1: Default (Loaded with data)
- **Visual**:
  - Table rows: Alternating `hover:bg-surface-container-low` on hover
  - Status badges: Color-coded
  - "Chi tiết" links: `text-primary font-bold text-sm hover:underline`
  - Copy address button: `text-on-surface-variant hover:text-primary`
- **Behavior**: Display transaction history
- **Tailwind**:
  ```jsx
  <tr className="hover:bg-surface-container-low transition-colors">
    ...
  </tr>
  ```

### State 2: Row Hover
- **Visual**:
  - Background: `bg-surface-container-low`
  - "Chi tiết" link: `underline`
- **Behavior**: Highlight row under cursor
- **Tailwind**: `hover:bg-surface-container-low hover:underline`

### State 3: Sort Active (Column header clicked)
- **Visual**:
  - Column header: `text-primary` with arrow icon `arrow_upward` or `arrow_downward`
  - Sorted column values: Normal display
- **Behavior**: Table sorted by selected column
- **Tailwind**: Conditional icon rendering

### State 4: Filter Active
- **Visual**:
  - Filter badge above table: "Bộ lọc đang áp dụng (3)" in `bg-primary-container/10 text-primary px-3 py-1 rounded-full text-xs font-bold`
  - Filtered results displayed
- **Behavior**: Table shows filtered subset
- **Tailwind**: Filter badge component

### State 5: Pagination (Not first/last page)
- **Visual**:
  - Prev/Next buttons: Enabled `text-primary hover:bg-primary-container/10`
  - Current page: `bg-primary text-white` (highlighted)
  - Other pages: `text-on-surface-variant hover:text-primary`
- **Behavior**: Navigate between pages
- **Tailwind**: Same pattern as Market page pagination

### State 6: Loading (Fetching history)
- **Visual**:
  - Skeleton rows: `bg-surface-container animate-pulse h-16 rounded`
  - 5 skeleton rows shown
  - No real data visible
- **Behavior**: Wait for data load
- **Tailwind**:
  ```jsx
  {loading && Array(5).fill(0).map((_, i) => (
    <tr key={i}>
      <td colSpan={7}>
        <div className="bg-surface-container animate-pulse h-16 rounded"></div>
      </td>
    </tr>
  ))}
  ```

### State 7: Error (Failed to load history)
- **Visual**:
  - Error row spanning full table:
    ```jsx
    <tr>
      <td colSpan={7} className="py-12 text-center">
        <span className="material-symbols-outlined text-6xl text-error/30 block mb-2">error</span>
        <p className="text-error mb-4">Không thể tải lịch sử rút tiền. Vui lòng thử lại sau.</p>
        <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">
          Thử lại
        </button>
      </td>
    </tr>
    ```
- **Behavior**: Retry button to reload
- **Tailwind**: Error state component

### State 8: Empty (No withdrawal history)
- **Visual**:
  - Empty row spanning full table:
    ```jsx
    <tr>
      <td colSpan={7} className="py-12 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 block mb-2">history</span>
        <p className="text-lg font-semibold text-on-surface mb-1">Chưa có lịch sử rút tiền</p>
        <p className="text-sm text-on-surface-variant mb-4">Các giao dịch rút tiền của bạn sẽ hiển thị tại đây</p>
        <button className="bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:opacity-90">
          Rút tiền ngay
        </button>
      </td>
    </tr>
    ```
- **Behavior**: CTA to switch to Withdraw tab
- **Tailwind**: Empty state reuse from Assets page pattern

---

## Animation Timing Summary

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| Dropdown expand | Slide down + opacity | 200ms | ease-out |
| Modal entrance | Fade in backdrop + slide up | 300ms | ease-out |
| Modal exit | Fade out backdrop + slide down | 200ms | ease-in |
| Button press | Scale down | 200ms | ease-in-out |
| Card hover | Translate Y + shadow | 200ms | ease-out |
| Success check icon | Scale bounce | 400ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) |
| Skeleton pulse | Opacity loop | 1500ms | ease-in-out infinite |
| Spinner rotate | 360deg rotation | 1000ms | linear infinite |

---

## Keyboard Navigation Flow

1. **Tab order**:
   - Coin selector → Network cards (each is tabbable) → Address input → Paste button → Account badge "Đổi" link → Amount input → Quick buttons (25/50/75/100) → Checkbox → Submit button

2. **Enter/Space triggers**:
   - Coin selector: Open dropdown
   - Network card: Select network
   - Paste button: Paste from clipboard
   - Quick buttons: Set percentage amount
   - Checkbox: Toggle agreement
   - Submit button: Submit form

3. **Escape key**:
   - Close dropdown (Coin selector)
   - Close modal (Account selection, Success modal)

4. **Arrow keys**:
   - Navigate dropdown list (Coin selector)
   - Increment/decrement amount (Amount input - browser default)

---

**Version**: 1.0
**Created**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: Ready for Development Handoff
**Related**:
- `003-component-mapping-v1.0.md` (Component list)
- `.codex/Skill/skill_uiux.md` (Design system)
- `.codex/Rule/rule_uiux.md` (State completeness rule)
