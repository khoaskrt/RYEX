# [Withdraw] - Wireframe & Content Hierarchy (v1.0)

## Content Priority Framework

### Hero Section (Above the fold - Must see immediately)
1. **Page Title**: "Rút tiền" - Headline Large (`text-3xl font-bold`)
2. **Tab Navigation**: "Rút tiền" (active) | "Lịch sử rút tiền"
3. **Primary Form Elements**:
   - Coin selector (Step 1)
   - Network selector (Step 2)
   - Address input (Step 3)

### Secondary Content (Visible without scroll on desktop)
4. **Amount Input Section** (Step 5)
5. **Real-time Calculation Card** (contextual feedback)
6. **Summary & Confirm Section** (Step 6)

### Tertiary Content (Below fold or contextual)
7. **Help text & Tooltips** (expandable/hover)
8. **Error messages** (conditional - only when error occurs)
9. **Success/Loading overlays** (modal - conditional)

---

## Desktop Wireframe (1440px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ TopAppBar (Fixed)                                                   │
│ [RYEX Logo]  [Thị trường] [Giao dịch ▼]    [Đăng xuất] [$] [Avatar]│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Main Content (max-w-[1440px] mx-auto px-8 pt-24)                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Page Header                                                  │  │
│  │ ┌─────────────┐                          [? Help Center]    │  │
│  │ │ Rút tiền    │ │ Lịch sử rút tiền │                         │  │
│  │ └─────────────┘ (tab active indicator: border-b-2 primary)  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────┬────────────────────────────────┐ │
│  │ Left Column (Form - 60%)      │ Right Column (Summary - 40%)   │ │
│  │                               │                                │ │
│  │ ┌───────────────────────────┐ │ ┌────────────────────────────┐ │ │
│  │ │ Step 1: Chọn Coin         │ │ │ Thông tin rút tiền         │ │ │
│  │ │ ┌───────────────────────┐ │ │ │ (Sticky - scroll with user)│ │ │
│  │ │ │ [Icon] BTC - Bitcoin  ▼│ │ │ │                            │ │ │
│  │ │ │ Available: 0.5234 BTC  │ │ │ │ Coin: ---                  │ │ │
│  │ │ └───────────────────────┘ │ │ │ Network: ---               │ │ │
│  │ └───────────────────────────┘ │ │ Địa chỉ: ---               │ │ │
│  │                               │ │ Account: ---               │ │ │
│  │ ┌───────────────────────────┐ │ │ Số lượng: ---              │ │ │
│  │ │ Step 2: Chọn Network      │ │ │                            │ │ │
│  │ │ ○ Bitcoin Mainnet         │ │ │ ────────────────           │ │ │
│  │ │   Fee: 0.0005 BTC         │ │ │ Phí mạng: ---              │ │ │
│  │ │   Time: ~10-30 phút       │ │ │ Số tiền nhận: ---          │ │ │
│  │ │ ○ Lightning Network       │ │ │                            │ │ │
│  │ │   Fee: 0.00001 BTC        │ │ │ [Checkbox]                 │ │ │
│  │ │   Time: ~1-5 phút         │ │ │ Tôi đã kiểm tra...         │ │ │
│  │ └───────────────────────────┘ │ │                            │ │ │
│  │                               │ │ [Xác nhận rút tiền]        │ │ │
│  │ ┌───────────────────────────┐ │ │ (Gradient Button)          │ │ │
│  │ │ Step 3: Địa chỉ ví        │ │ │                            │ │ │
│  │ │ ┌───────────────────────┐ │ │ │ ⓘ Withdrawal Limits:       │ │ │
│  │ │ │ bc1q...               │ │ │ │ Min: 0.001 BTC             │ │ │
│  │ │ │               [Paste] │ │ │ │ Max: 10 BTC/day            │ │ │
│  │ │ └───────────────────────┘ │ │ │ Fee: Network dependent     │ │ │
│  │ │ [Chọn từ sổ địa chỉ]      │ │ └────────────────────────────┘ │ │
│  │ └───────────────────────────┘ │                                │ │
│  │                               │                                │ │
│  │ ┌───────────────────────────┐ │                                │ │
│  │ │ Step 4: Tài khoản (Badge) │ │                                │ │
│  │ │ [Icon] Funding Account    │ │                                │ │
│  │ │ Available: 0.5234 BTC     │ │                                │ │
│  │ │ [Đổi tài khoản] (link)    │ │                                │ │
│  │ └───────────────────────────┘ │                                │ │
│  │                               │                                │ │
│  │ ┌───────────────────────────┐ │                                │ │
│  │ │ Step 5: Số lượng rút      │ │                                │ │
│  │ │ ┌───────────────────────┐ │ │                                │ │
│  │ │ │ 0.1234              BTC│ │                                │ │
│  │ │ └───────────────────────┘ │ │                                │ │
│  │ │ [25%][50%][75%][Tất cả]   │ │                                │ │
│  │ │                           │ │                                │ │
│  │ │ ┌─────────────────────────┐│                                │ │
│  │ │ │ Số tiền rút: 0.1234 BTC ││                                │ │
│  │ │ │ Phí mạng: 0.0005 BTC    ││                                │ │
│  │ │ │ ─────────────────────   ││                                │ │
│  │ │ │ Nhận: 0.1229 BTC (Green)││                                │ │
│  │ │ └─────────────────────────┘│                                │ │
│  │ └───────────────────────────┘ │                                │ │
│  │                               │                                │ │
│  └───────────────────────────────┴────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Footer (LandingFooter component - reuse from Assets page)          │
└─────────────────────────────────────────────────────────────────────┘
```

### Desktop Layout Notes
- **Two-column layout**: Form 60% left, Summary 40% right (sticky)
- **Form progressive disclosure**: Steps reveal sequentially (Step 2 disabled until Step 1 done)
- **Sticky summary**: Right column sticks to viewport during scroll, always visible
- **Spacing**: `gap-8` between columns, `gap-6` between form sections
- **Card backgrounds**: `bg-surface-container-lowest` + `rounded-2xl` + `shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)]`

---

## Mobile Wireframe (375px)

```
┌───────────────────────────────┐
│ TopAppBar (Fixed, simplified) │
│ [☰] RYEX         [$] [Avatar] │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Main Content (px-4 pt-20)     │
│                               │
│ ┌───────────────────────────┐ │
│ │ Rút tiền | Lịch sử        │ │
│ │ ─────── (Active indicator)│ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Step 1: Chọn Coin         │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ [Icon] BTC - Bitcoin  ▼│ │
│ │ │ Available: 0.5234 BTC  │ │
│ │ └───────────────────────┘ │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Step 2: Chọn Network      │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ ○ Bitcoin Mainnet     │ │ │
│ │ │   Fee: 0.0005 BTC     │ │ │
│ │ │   Time: ~10-30 phút   │ │ │
│ │ └───────────────────────┘ │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ ○ Lightning Network   │ │ │
│ │ │   Fee: 0.00001 BTC    │ │ │
│ │ └───────────────────────┘ │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Step 3: Địa chỉ ví        │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ bc1q...       [Paste] │ │ │
│ │ └───────────────────────┘ │ │
│ │ [Chọn từ sổ địa chỉ]      │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Tài khoản: Funding        │ │
│ │ Available: 0.5234 BTC     │ │
│ │ [Đổi] (link)              │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Số lượng rút              │ │
│ │ ┌───────────────────────┐ │ │
│ │ │ 0.1234              BTC│ │
│ │ └───────────────────────┘ │ │
│ │ ┌─────────┬─────────┐     │ │
│ │ │  25%    │  50%    │     │ │
│ │ ├─────────┼─────────┤     │ │
│ │ │  75%    │ Tất cả  │     │ │
│ │ └─────────┴─────────┘     │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Thông tin rút tiền        │ │
│ │ Số tiền rút: 0.1234 BTC   │ │
│ │ Phí mạng: 0.0005 BTC      │ │
│ │ ─────────────────────     │ │
│ │ Nhận: 0.1229 BTC (Green)  │ │
│ │                           │ │
│ │ [Checkbox] Tôi đã kiểm tra│ │
│ │ điều khoản...             │ │
│ │                           │ │
│ │ [Xác nhận rút tiền]       │ │
│ │ (Full-width gradient btn) │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ ⓘ Limits & Fees           │ │
│ │ (Expandable accordion)    │ │
│ └───────────────────────────┘ │
│                               │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Footer (Simplified on mobile) │
└───────────────────────────────┘
```

### Mobile Layout Notes
- **Single column**: Stack all sections vertically
- **Full-width elements**: Inputs, buttons span full container width
- **Quick amount buttons**: 2x2 grid instead of 4 inline (better touch targets)
- **Summary card**: Integrated inline (not sticky), positioned before submit button
- **Tab navigation**: Full-width tabs, equal distribution
- **Accordion help section**: "Limits & Fees" collapsible to save space
- **Spacing**: `gap-4` between sections (tighter than desktop)
- **Padding**: `px-4` (16px) instead of `px-8` (32px)

---

## Account Selection Modal Wireframe (Desktop)

```
Background Overlay: bg-black/50 backdrop-blur-sm

┌─────────────────────────────────────────┐
│ Modal (Centered, max-w-[600px])         │
│ ┌───────────────────────────────────────┤
│ │ Chọn tài khoản rút tiền          [×]  │
│ ├───────────────────────────────────────┤
│ │                                       │
│ │ Tài sản sẽ được rút từ tài khoản nào? │
│ │                                       │
│ │ ┌───────────────────────────────────┐ │
│ │ │ ○ Tài khoản tài trợ     [wallet]  │ │
│ │ │   Funding Account                 │ │
│ │ │   Available: 0.5234 BTC           │ │
│ │ │   ≈ $35,420                       │ │
│ │ │   Dùng cho nạp/rút tiền           │ │
│ │ └───────────────────────────────────┘ │
│ │ (Hover: border-primary, shadow-md)   │
│ │                                       │
│ │ ┌───────────────────────────────────┐ │
│ │ │ ○ Tài khoản giao dịch [swap_horiz]│ │
│ │ │   Trading Account                 │ │
│ │ │   Available: 1.2345 BTC           │ │
│ │ │   ≈ $83,500                       │ │
│ │ │   Chuyển về Funding trước khi rút │ │
│ │ └───────────────────────────────────┘ │
│ │ (Active: border-2 border-primary,    │
│ │  bg-primary-container/5)             │
│ │                                       │
│ │ [Huỷ bỏ]         [Tiếp tục]          │
│ │ (Outline btn)    (Gradient btn)      │
│ └───────────────────────────────────────┘
└─────────────────────────────────────────┘
```

### Modal Notes (Desktop)
- **Centered overlay**: Vertical + horizontal center
- **Max-width**: 600px
- **Radio cards**: Large touch targets (full card clickable)
- **Visual hierarchy**: Icon + Label (bold) + Sublabel + Balance (large) + Subtext
- **Animation**: Fade in backdrop (300ms) + slide up modal (300ms, ease-out)
- **Focus trap**: Tab cycles within modal, Escape key dismisses
- **Backdrop click**: Dismiss modal (same as "Huỷ bỏ")

## Account Selection Modal (Mobile)

```
Background Overlay: bg-black/50

┌───────────────────────────────┐
│ Modal (Slide up from bottom,  │
│ full-screen on mobile)        │
│ ┌─────────────────────────────┤
│ │ [─] (Drag handle)           │
│ │ Chọn tài khoản         [×]  │
│ ├─────────────────────────────┤
│ │                             │
│ │ Tài sản sẽ được rút từ      │
│ │ tài khoản nào?              │
│ │                             │
│ │ ┌─────────────────────────┐ │
│ │ │ ○ Tài khoản tài trợ     │ │
│ │ │   [wallet icon]         │ │
│ │ │   Funding Account       │ │
│ │ │   0.5234 BTC            │ │
│ │ │   ≈ $35,420             │ │
│ │ └─────────────────────────┘ │
│ │                             │
│ │ ┌─────────────────────────┐ │
│ │ │ ○ Tài khoản giao dịch   │ │
│ │ │   [swap_horiz icon]     │ │
│ │ │   Trading Account       │ │
│ │ │   1.2345 BTC            │ │
│ │ │   ≈ $83,500             │ │
│ │ └─────────────────────────┘ │
│ │                             │
│ │ [Tiếp tục]                  │
│ │ (Full-width gradient btn)   │
│ │                             │
│ │ [Huỷ bỏ]                    │
│ │ (Full-width text link)      │
│ └─────────────────────────────┘
└───────────────────────────────┘
```

### Modal Notes (Mobile)
- **Slide up from bottom**: Bottom sheet pattern (Material 3)
- **Drag handle**: Visual affordance for dismissal (swipe down to close)
- **Full-width buttons**: Stacked vertical (Tiếp tục primary, Huỷ bỏ secondary link)
- **Animation**: Slide up 300ms (cubic-bezier ease-out)
- **Safe area**: Padding-bottom respects device safe area (iPhone notch)

---

## History Tab Wireframe (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Tab: Lịch sử rút tiền (Active)                                      │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Filters Bar                                                      ││
│ │ [7 ngày qua ▼] [Coin: Tất cả ▼] [Status: Tất cả ▼]  [Apply][Reset]││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ History Table                                                    ││
│ │ ┌────────┬──────┬─────────┬────────────┬──────────┬────────┬────┐││
│ │ │ Ngày giờ│ Coin │ Số lượng│ Địa chỉ    │ Network  │ Status │ ... │││
│ │ ├────────┼──────┼─────────┼────────────┼──────────┼────────┼────┤││
│ │ │02/04   │ BTC  │0.1234   │bc1q...xyz  │Bitcoin   │[✓Done] │Chi │││
│ │ │14:30   │ icon │BTC      │(Copy btn)  │Mainnet   │Green   │tiết│││
│ │ ├────────┼──────┼─────────┼────────────┼──────────┼────────┼────┤││
│ │ │01/04   │ ETH  │2.5000   │0x...abc    │Ethereum  │[⟳Proc] │Chi │││
│ │ │09:15   │ icon │ETH      │(Copy btn)  │ERC-20    │Blue    │tiết│││
│ │ ├────────┼──────┼─────────┼────────────┼──────────┼────────┼────┤││
│ │ │31/03   │ USDT │500.00   │0x...def    │BSC       │[○Pend] │Chi │││
│ │ │22:45   │ icon │USDT     │(Copy btn)  │BEP-20    │Yellow  │tiết│││
│ │ └────────┴──────┴─────────┴────────────┴──────────┴────────┴────┘││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Pagination                                                       ││
│ │          [<] 1 2 3 ... 10 [>]                                    ││
│ └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### History Table Notes (Desktop)
- **Table layout**: Full table with all columns visible
- **Sortable columns**: Click header to sort (date, amount, status)
- **Copy button**: Click to copy full address to clipboard (tooltip feedback)
- **Status badges**: Color-coded, icon + text
- **Action column**: "Chi tiết" link (opens drawer with full transaction details)
- **Hover row**: Background `surface-container-low` (highlight on hover)
- **Pagination**: Chevron prev/next + numbered pages + ellipsis (same as Market page)

---

## History Tab Wireframe (Mobile)

```
┌───────────────────────────────┐
│ Tab: Lịch sử rút tiền         │
│                               │
│ ┌───────────────────────────┐ │
│ │ Filters (Accordion)       │ │
│ │ [Bộ lọc (3) ▼]            │ │
│ │ (Expand to show filters)  │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 1                    │ │
│ │ ┌─────────────────────────┤ │
│ │ │ [BTC] Bitcoin  [✓Done]  │ │
│ │ │ 02/04/2026 14:30        │ │
│ │ ├─────────────────────────┤ │
│ │ │ 0.1234 BTC              │ │
│ │ │ (Large, bold)           │ │
│ │ ├─────────────────────────┤ │
│ │ │ Network: Bitcoin Mainnet│ │
│ │ │ Địa chỉ: bc1q...xyz     │ │
│ │ │ [Chi tiết →]            │ │
│ │ └─────────────────────────┘ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Card 2                    │ │
│ │ ┌─────────────────────────┤ │
│ │ │ [ETH] Ethereum [⟳Proc]  │ │
│ │ │ 01/04/2026 09:15        │ │
│ │ ├─────────────────────────┤ │
│ │ │ 2.5000 ETH              │ │
│ │ ├─────────────────────────┤ │
│ │ │ Network: Ethereum ERC-20│ │
│ │ │ Địa chỉ: 0x...abc       │ │
│ │ │ [Chi tiết →]            │ │
│ │ └─────────────────────────┘ │
│ └───────────────────────────┘ │
│                               │
│ [Tải thêm]                    │
│ (Load more button)            │
└───────────────────────────────┘
```

### History Cards Notes (Mobile)
- **Card layout**: Stack vertical, one card per transaction
- **Card structure**: Header (coin + status + date) + Body (amount) + Footer (network + address + action)
- **Filters accordion**: Collapsed by default to save space
- **Load more**: Infinite scroll or "Tải thêm" button (20 items per load)
- **Card spacing**: `gap-4` between cards
- **Touch-friendly**: Full card is tappable to open details

---

## Information Architecture Summary

### Primary Navigation
1. **Tab 1: Rút tiền** (Default view)
   - Hero: Page title + Help link
   - Form: 5 steps (sequential reveal)
   - Summary: Sticky sidebar (desktop) / Inline (mobile)
   - Submit: Primary CTA + Terms checkbox

2. **Tab 2: Lịch sử rút tiền**
   - Filters: Date range + Coin + Status
   - Data view: Table (desktop) / Cards (mobile)
   - Pagination: Load more or numbered pages

### Content Hierarchy (F-Pattern Reading)
- **Top-left**: Page title "Rút tiền" (primary attention)
- **Horizontal scan**: Tab navigation (secondary navigation)
- **Left column**: Form steps (sequential interaction)
- **Right column**: Summary + Limits info (contextual reference)
- **Bottom**: Submit button (final action)

### Mobile-First Considerations
- **Thumb zone**: Primary CTA at bottom, within thumb reach
- **One-handed operation**: Inputs + buttons accessible with one thumb
- **Scroll efficiency**: Most critical info above fold (coin + network + address)
- **Progressive disclosure**: Advanced options (Address Book) collapsed by default

---

**Version**: 1.0
**Created**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: Draft - Pending Review
**Related**: `001-Withdraw-overview-v1.0.md`
