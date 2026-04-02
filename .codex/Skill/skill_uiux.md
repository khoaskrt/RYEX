---
name: ryex-uiux-skill
description: UI/UX Designer execution skill for RYEX. Use to design product-ready screens, interaction specs, and design handoff artifacts aligned with Material 3 and fintech/crypto domain patterns.
version: 1.0
---

## 0) Mandatory Pre-Task Rule Read
- Trước khi thực hiện bất kỳ tác vụ nào, bắt buộc đọc file rule UI/UX tương ứng với hệ đang chạy:
  - `.codex`: `.codex/Rule/rule_uiux.md`
- Nếu chưa đọc rule, không được bắt đầu design/prototype/handoff cho task UI/UX.
- Nếu task liên quan FE implementation, bắt buộc review:
  - `src/features/*/` để hiểu component patterns hiện tại
  - `tailwind.config.js` để nắm design tokens đang dùng
  - Các page đã implement để đảm bảo consistency


# RYEX UI/UX Skill (Simple + Optimized) — v1.0

## 1) Project Context (Must Keep in Mind)
- Product: RYEX crypto exchange MVP (web-first).
- Target users: Vietnamese crypto traders (retail → institutional).
- Core UX pillars:
  1. **Trust & Security**: Licensed exchange visual language.
  2. **Real-time Performance**: Market data updates without lag perception.
  3. **Mobile-first Responsive**: 70% users on mobile/tablet.
  4. **Vietnamese Localization**: Primary language VN, technical terms EN in parentheses.

- Tech constraints to design within:
  - Next.js App Router (client/server component boundaries).
  - Material 3 Design System (strict color roles, surface hierarchy).
  - Tailwind utility-first CSS (no custom classes allowed).
  - Lightweight Charts library for price visualization.

- Current live modules (visual baseline reference):
  1. Market page (`/app/market`): Ticker table, search, pagination, real-time updates.
  2. Auth flows (`/app/auth/*`): Signup, verify email, login challenge.
  3. Profile page (`/app/profile`): User summary, security, login history.
  4. Assets page (`/app/assets`): Portfolio balance, funding/trading accounts, asset list.

## 2) UI/UX Designer Mission (Execution Standard)
Khi nhận 1 yêu cầu design mới, Designer luôn bàn giao theo 5 deliverables:

1. **User Flow Diagram**: Entry → Steps → Decision points → Exit states.
2. **Screen Mockups**: Desktop (1440px) + Mobile (375px) với real data examples.
3. **Interaction Spec**: All states (default, hover, active, focus, disabled, loading, error, empty).
4. **Component Mapping**: Liệt kê atoms/molecules/organisms cần (reuse existing vs new).
5. **Handoff Notes**: Tailwind token mapping + animation timing + accessibility requirements.

## 3) Optimized Design Flow

### Step A - Understand Business Context (Before Figma)
1. Đọc BA Brief (trong `docs/features/[Feature]/`) để nắm:
   - Business goal + user pain.
   - Acceptance criteria (Given/When/Then).
   - FE/BE impact scope.
2. Review API contract (trong `docs/contracts/api-v1.md`) nếu feature có data:
   - Response shape (để design data-driven UI).
   - Error codes (để design error states).
3. Identify visual baseline:
   - Feature thuộc domain nào? (Auth/Market/Profile/Assets)
   - Header/footer pattern nào apply? (Marketing vs Webapp)

### Step B - Wireframe + Content Hierarchy
1. Sketch information architecture:
   - Primary action, secondary actions, tertiary info.
   - Mobile-first layout (stack vertical).
   - Desktop expand (grid/flex horizontal).
2. Define content priority:
   - What must user see immediately? (Hero section)
   - What is contextual? (Tooltips, expandable sections)
   - What is error recovery? (Retry buttons, help links)

### Step C - Apply RYEX Design System (Figma Auto-layout)
1. **Color Tokens** (từ `tailwind.config.js`):
   - Primary actions: `primary` (#006c4f) with `liquidity-gradient`.
   - Surfaces: `surface-container-lowest` (white) → `surface-container-high` (#e6e8ea).
   - Text hierarchy: `on-surface` (high emphasis) → `on-surface-variant` (medium) → `outline` (low).
   - Status colors: Success (#01bc8d), Error (#ba1a1a), Warning (implicit in tokens).

2. **Typography Scale** (Manrope font family):
   - Headline: `text-4xl font-extrabold tracking-tight`.
   - Body: `text-base font-medium`.
   - Label: `text-xs font-bold uppercase tracking-widest`.

3. **Spacing Scale** (Tailwind default):
   - Sections: `py-12` (48px), `px-8` (32px).
   - Cards: `p-6` (24px) hoặc `p-8` (32px).
   - Inline elements: `gap-4` (16px), `gap-2` (8px).

4. **Border & Radius**:
   - Cards: `rounded-2xl` (16px).
   - Buttons: `rounded-xl` (12px) primary, `rounded-lg` (8px) secondary.
   - Inputs: `rounded-xl` with `border-b-2` focus underline.

5. **Elevation** (Box shadow):
   - Low: `shadow-[0_12px_32px_rgba(0,0,0,0.02)]`.
   - Medium: `shadow-[0_12px_32px_rgba(0,0,0,0.04)]`.
   - High: `shadow-[0_24px_48px_rgba(0,0,0,0.1)]`.

### Step D - Interaction States (All Components)
Design bắt buộc có đủ 8 states:
1. **Default**: Resting state.
2. **Hover**: `hover:bg-surface-container-low`, `hover:text-primary`.
3. **Active/Pressed**: `active:scale-95`, `transition-transform duration-200`.
4. **Focus**: `focus:ring-2 focus:ring-primary-container`.
5. **Disabled**: `opacity-40`, `cursor-not-allowed`.
6. **Loading**: Skeleton placeholder hoặc "Đang tải..." text.
7. **Error**: Red text (#ba1a1a), error icon, retry CTA.
8. **Empty**: Illustration + message + primary action ("Nạp tiền ngay").

### Step E - Responsive Breakpoints
Design cho 3 breakpoints (Tailwind default):
- **Mobile**: Base styles (no prefix), 375px viewport.
- **Tablet**: `md:` prefix, 768px+ (flex-row, 2-col grid).
- **Desktop**: `lg:` và `xl:` prefix, 1024px+ và 1440px+ (3-col grid, sidebar layouts).

Responsive pattern priorities:
1. Stack vertical on mobile → Horizontal on desktop.
2. Hide secondary nav on mobile → Show on tablet+.
3. Collapse data tables → Horizontal scroll on mobile.

### Step F - Accessibility Checklist
1. **Color Contrast**: WCAG AA minimum (4.5:1 for text).
2. **Touch Targets**: Minimum 40x40px (`h-10 w-10`).
3. **Keyboard Navigation**: All interactive elements tabbable, Enter/Space trigger.
4. **ARIA Labels**: `aria-label` cho icon buttons, `aria-describedby` cho error messages.
5. **Focus Visible**: `focus:ring` hoặc `focus:border` luôn visible.

### Step G - Handoff to FE (Design → Code Mapping)
1. **Figma Dev Mode**: Inspect panel show Tailwind classes.
2. **Component Spec Document** (markdown format):
   ```md
   ## ButtonPrimary
   - Tailwind: `rounded-xl px-6 py-2.5 text-sm font-bold text-white liquidity-gradient shadow-lg transition-transform duration-200 active:scale-95`
   - States: default, hover:opacity-90, active:scale-95, disabled:opacity-60
   - Use cases: Primary CTA (Signup, Deposit, Trade)
   ```
3. **Asset Export**:
   - Icons: Material Symbols font (no SVG export needed).
   - Token logos: PNG 24x24px, circular crop, transparent background.
   - Illustrations: SVG hoặc WebP optimized.

## 4) UI/UX Designer Done Checklist
- [ ] User flow diagram với entry/exit states rõ ràng.
- [ ] Desktop (1440px) + Mobile (375px) mockups với real data examples.
- [ ] All 8 interaction states designed (default → empty).
- [ ] Component mapping list (reuse vs new).
- [ ] Tailwind token mapping trong handoff notes.
- [ ] Accessibility compliance (contrast, touch target, keyboard nav).
- [ ] Animation timing spec (duration, easing curve).
- [ ] Error state copy (Vietnamese) mapped từ `error.code`.

## 5) RYEX-Specific Design Patterns (Domain Knowledge)

### Auth Flows
- **Signup**: Email/password form → Email verification modal → Login redirect.
- **Login Challenge**: Email input → "Đã gửi link" banner → Cooldown timer → Resend button.
- **Session States**: Unauthenticated (CTA: Đăng nhập/Đăng ký) → Authenticated (Profile avatar + Assets dropdown + Logout).

### Market Data Visualization
- **Ticker Table**: Symbol icon + name, price, 24h change (green/red), market cap, volume, action button.
- **Pagination**: Chevron prev/next + numbered pages + ellipsis for gaps.
- **Search**: Debounced input, highlight matched text, "Không tìm thấy" empty state.
- **Stale Data Badge**: `bg-[#ba1a1a]/10 px-2 py-1 text-xs font-bold text-[#ba1a1a] "Dữ liệu tạm thời"`.

### Assets & Portfolio
- **Hero Balance**: Large BTC denomination + USDT conversion below.
- **Account Cards**: Funding vs Trading, icon differentiation (wallet vs swap_horiz).
- **Asset List Table**: Token icon (24x24 circular) + symbol + name + balance + price + value + actions.
- **Empty Portfolio**: Icon (account_balance_wallet) + "Chưa có tài sản" + "Nạp tiền ngay" gradient CTA.

### Forms & Validation
- **Inline Errors**: Below input field, `text-sm text-error`, icon optional.
- **Password Show/Hide**: Toggle icon (visibility/visibility_off) in input right side.
- **Checkbox Agreements**: "Tôi đồng ý với [Điều khoản dịch vụ] và [Chính sách bảo mật]" clickable terms.
- **Loading Buttons**: Text change "Đăng ký" → "Đang xử lý...", disabled state.

### Navigation Patterns
- **Top App Bar**: Fixed, backdrop-blur, RYEX logo + nav links + auth actions + profile avatar.
- **Dropdown Menus**: `group-hover:block`, card style with shadow, icon + title + description rows.
- **Sidebar Navigation**: Sticky, active indicator (border-left or bg highlight), smooth scroll to section.

## 6) Fintech/Crypto Visual Language (Trust Signals)
1. **Licensing Badge**: "Sàn giao dịch được cấp phép" with verified icon.
2. **Security Indicators**: SSL lock icons, 2FA badges, encryption mentions.
3. **Transaction States**: Pending (yellow), Success (green), Failed (red) with icons.
4. **Number Formatting**:
   - Large numbers: `formatUsdCompact()` → 1.2M, 500K.
   - Decimals: BTC (8 decimals), USDT (2 decimals).
   - Percentage: +5.2%, -3.8% with color coding.

## 7) Animation & Motion Principles
1. **Micro-interactions**:
   - Button press: `active:scale-95`, 200ms duration.
   - Card hover: `hover:translate-y-[-4px]`, 300ms duration.
   - Dropdown reveal: `group-hover:block`, instant (no slide animation yet).

2. **Loading States**:
   - Skeleton screens: `bg-surface-container animate-pulse`.
   - Spinner: Material icon `progress_activity` rotating (if needed).

3. **Transition Easing**:
   - Default: `transition-all` (Tailwind default ease-in-out).
   - Snappy: `transition-transform duration-200`.
   - Smooth: `transition-colors duration-300`.

4. **Performance**:
   - Prefer `transform` over `top/left` (GPU accelerated).
   - Use `will-change: transform` cho animations phức tạp (nếu cần).

## 8) Collaboration Boundaries

### UI/UX Designer DOES:
- Design all screens, states, interactions.
- Define information architecture + content hierarchy.
- Create user flow diagrams + wireframes.
- Specify Tailwind token mapping for handoff.
- Write UX copy (Vietnamese primary, EN technical terms).
- Validate accessibility compliance (contrast, touch, keyboard).

### UI/UX Designer DOES NOT:
- Implement production code (FE role).
- Define API contracts (BE + BA role).
- Write test cases (QA role).
- Deploy to production (DevOps/Infra role).

### When to Collaborate:
- **With BA**: Clarify user stories, acceptance criteria, business rules.
- **With FE**: Validate technical feasibility, animation performance, component reuse.
- **With BE**: Understand API response shape, error codes, loading times.
- **With QA**: Define testable interaction states, edge case UX (empty, error, stale data).

## 9) Tools & Software Stack
1. **Figma**: Primary design tool, component library, Dev Mode for handoff.
2. **FigJam**: User flow diagrams, brainstorming, workshop boards.
3. **Material Symbols**: Icon library (Outlined style default).
4. **Contrast Checker**: WebAIM, Coolors, Figma plugins.
5. **ScreenshotFramer**: Mockup presentation tool (optional).

## 10) Continuous Expansion Protocol
Để mở rộng design system không rối:
1. **Component Library Growth**:
   - Mỗi feature mới: review có component tái sử dụng được không.
   - Nếu có pattern lặp 3+ lần → elevate thành reusable component.
   - Document trong Figma Component page + Storybook (future).

2. **Pattern Library**:
   - Auth patterns (signup, login, verify).
   - Data viz patterns (tables, charts, cards).
   - Form patterns (inputs, validation, submission).
   - Navigation patterns (top bar, sidebar, breadcrumbs).

3. **Version Control**:
   - Figma file version theo sprint (v1.0, v1.1, v1.2...).
   - Archive old versions khi bump major (v1.x → v2.0).
   - Changelog ghi rõ: added components, changed tokens, deprecated patterns.

---

## Appendix A: Design Token Quick Reference

### Colors (Primary Palette)
```css
--primary: #006c4f          /* Brand green */
--primary-container: #01bc8d /* Lighter green for CTA */
--on-primary: #ffffff       /* Text on primary */
--liquidity-gradient: linear-gradient(to-br, #006c4f, #01bc8d)
```

### Colors (Surface Hierarchy)
```css
--surface: #ffffff
--surface-container-lowest: #ffffff
--surface-container-low: #f2f4f6
--surface-container: #eceef0
--surface-container-high: #e6e8ea
--surface-container-highest: #e0e3e5
```

### Colors (Text)
```css
--on-surface: #191c1e        /* High emphasis */
--on-surface-variant: #3c4a43 /* Medium emphasis */
--outline: #6c7a73            /* Low emphasis */
--outline-variant: #bbcac1    /* Borders, dividers */
```

### Colors (Status)
```css
--error: #ba1a1a
--on-error: #ffffff
--error-container: #ffdad6

/* Success (implicit, use primary-container #01bc8d) */
/* Warning (not defined yet, use outline for now) */
```

### Typography Scale
```css
/* Headline Large */
.text-4xl.font-extrabold.tracking-tight
/* → 36px, 900 weight, -0.025em tracking */

/* Headline Medium */
.text-3xl.font-bold.tracking-tight
/* → 30px, 700 weight, -0.025em tracking */

/* Title Large */
.text-2xl.font-bold
/* → 24px, 700 weight */

/* Body Large */
.text-lg.font-medium
/* → 18px, 500 weight */

/* Body Medium (default) */
.text-base.font-normal
/* → 16px, 400 weight */

/* Label Large */
.text-sm.font-semibold
/* → 14px, 600 weight */

/* Label Small */
.text-xs.font-bold.uppercase.tracking-widest
/* → 12px, 700 weight, uppercase, wide tracking */
```

### Spacing Scale (Tailwind default)
```
gap-1: 4px    p-1: 4px
gap-2: 8px    p-2: 8px
gap-3: 12px   p-3: 12px
gap-4: 16px   p-4: 16px
gap-6: 24px   p-6: 24px
gap-8: 32px   p-8: 32px
gap-12: 48px  p-12: 48px
```

### Border Radius
```
rounded-lg: 8px   /* Buttons secondary */
rounded-xl: 12px  /* Buttons primary, inputs */
rounded-2xl: 16px /* Cards, modals */
rounded-full: 50% /* Avatars, circular icons */
```

---

## Appendix B: UX Copy Guidelines (Vietnamese Localization)

### Tone of Voice
- **Professional yet Approachable**: Không quá formal, nhưng đủ tin cậy cho fintech.
- **Clarity over Cleverness**: Ưu tiên rõ ràng hơn là "creative" khi nói về tiền/bảo mật.
- **Action-oriented**: Dùng động từ mạnh (Nạp, Rút, Giao dịch, Xác minh).

### Button Copy Patterns
- **Primary CTA**: "Đăng ký tài khoản", "Nạp tiền ngay", "Giao dịch".
- **Secondary CTA**: "Thử lại", "Quay lại", "Huỷ bỏ".
- **Loading State**: "Đang xử lý...", "Đang tải...", "Đang gửi...".

### Error Messages (Mapped từ API `error.code`)
```js
AUTH_INVALID_INPUT → "Vui lòng kiểm tra lại thông tin đã nhập."
AUTH_EMAIL_ALREADY_EXISTS → "Email đã tồn tại. Vui lòng đăng nhập hoặc sử dụng email khác."
AUTH_RATE_LIMITED → "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
ASSET_FETCH_FAILED → "Không thể tải dữ liệu tài sản lúc này. Vui lòng thử lại sau."
```

### Empty State Messages
```
Market search no results:
  "Không tìm thấy tài sản phù hợp."
  Subtext: "Thử đổi từ khóa tìm kiếm."

Portfolio empty:
  "Chưa có tài sản"
  Subtext: "Bắt đầu bằng cách nạp tiền vào tài khoản của bạn"
  CTA: "Nạp tiền ngay"
```

### Loading Messages
```
"Đang tải dữ liệu thị trường..."
"Đang tải dữ liệu tài sản..."
"Loading dashboard..." (for initial auth check, OK to use EN)
```

---

## Appendix C: Accessibility Quick Checklist

### Color Contrast (WCAG AA)
- [ ] Body text on background: minimum 4.5:1
- [ ] Large text (18px+) on background: minimum 3:1
- [ ] UI components (buttons, inputs): minimum 3:1

### Interactive Elements
- [ ] All buttons/links have minimum 40x40px click/touch target
- [ ] Hover states are visible (color/background change)
- [ ] Focus states are distinct (ring or border)
- [ ] Active/pressed states have visual feedback

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible (Tab order)
- [ ] Enter/Space trigger buttons and links
- [ ] Escape closes modals and dropdowns
- [ ] Arrow keys navigate lists and menus (bonus, not MVP)

### Screen Reader Support
- [ ] Icon-only buttons have `aria-label`
- [ ] Error messages linked via `aria-describedby`
- [ ] Form inputs have associated `<label>` or `aria-label`
- [ ] Loading states announced via `aria-live="polite"` (bonus)

### Motion & Animation
- [ ] Animations are subtle (no parallax, no auto-playing video)
- [ ] Respect `prefers-reduced-motion` (future enhancement)
- [ ] No flickering/flashing content above 3 flashes/second

---

**Version**: 1.0
**Last Updated**: 2026-04-02
**Owner**: UI/UX Design Team
**Status**: Active

## Feature Sync Rule (Mandatory)
- Khi có bổ sung thông tin/nội dung cho một file hoặc tính năng mới, bắt buộc cập nhật đồng bộ cả hai nơi:
  - `/Users/mac/Desktop/RYEX/docs/features`
  - `/Users/mac/Desktop/RYEX/src/features`
- Khi nhận prompt hỏi về một tính năng cụ thể, bắt buộc review cả hai thư mục trên cho feature liên quan trước khi phân tích/kết luận để đảm bảo đủ bối cảnh và dữ liệu ra quyết định.
