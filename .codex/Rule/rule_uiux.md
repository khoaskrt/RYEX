---
name: ryex-uiux-rule
description: UI/UX Designer rules for RYEX. Keep design system consistent, user flows testable, and handoff artifacts production-ready for FE implementation.
version: 1.0
---

# RYEX UI/UX Rule (Simple + Optimized) — v1.0

## 1) Design System Consistency (CRITICAL)
**BEFORE designing any new screen or component:**
1. **Review visual baseline** - Check existing pages (Market, Assets, Profile, Auth) for established patterns.
2. **Verify design tokens** - Cross-reference `tailwind.config.js` for official color/spacing/typography values.
3. **Audit component library** - Reuse existing patterns before creating new components.
4. **Test token mapping** - Every design element must map to a valid Tailwind utility class.

**Why:** Inconsistent design = FE cannot implement without custom CSS (which is forbidden). Random colors/spacing break Material 3 system integrity.

**Red flags:**
- Using colors not in `tailwind.config.js`.
- Creating new border-radius values outside `rounded-lg/xl/2xl/full`.
- Custom font sizes not in Tailwind typography scale.
- Spacing values that don't exist in Tailwind default (e.g., 15px, 17px).

## 2) State Completeness Rule
- Mọi interactive component phải design đủ 8 states:
  1. Default (resting)
  2. Hover
  3. Active/Pressed
  4. Focus (keyboard navigation)
  5. Disabled
  6. Loading
  7. Error
  8. Empty (for data-driven components)

- Nếu thiếu bất kỳ state nào, FE sẽ phải tự quyết định → risk inconsistency.

## 3) Mobile-First Discipline
- Design mobile (375px) FIRST, desktop (1440px) second.
- 70% RYEX users trên mobile → nếu mobile design broken, feature fail.
- Tablet breakpoint (768px) là bonus, không phải mandatory cho MVP.

## 4) Real Data Examples
- Không design với "Lorem ipsum" hoặc "User Name" generic.
- Luôn dùng real examples từ API contract:
  - BTC price: $67,243.50 (không phải $00.00)
  - Email: user@example.com (không phải email@email.com)
  - Balance: 0.00234567 BTC (8 decimals, không phải 0.00)

**Why:** Real data expose layout breaks (text overflow, number alignment, long Vietnamese words).

## 5) Handoff Artifact Requirement
- Không chấp nhận handoff nếu thiếu:
  1. User flow diagram (entry → exit states).
  2. Desktop + Mobile mockups.
  3. Interaction spec (all 8 states).
  4. Component mapping (reuse vs new).
  5. Tailwind class annotation (Dev Mode hoặc comment).

- FE không phải "đoán" ý designer → waste time + risk misinterpretation.

## 6) Accessibility Baseline (Non-Negotiable)
- Color contrast WCAG AA minimum (4.5:1 for text).
- Touch target minimum 40x40px (`h-10 w-10`).
- Keyboard focus states visible (ring or border).
- Icon-only buttons có `aria-label` spec.

**Red flags:**
- Light gray text on white background (insufficient contrast).
- Small icon buttons < 40px.
- No visible focus state for keyboard users.

## 7) Visual Baseline Alignment
- Header/footer của webapp pages phải consistent với Market page baseline.
- Market page là source of truth cho:
  - Top App Bar structure (logo + nav + actions + profile).
  - Footer layout (4-column grid, links, copyright).
  - Token icon treatment (24x24, circular, transparent wrapper).

**If conflicts appear:** Align to Market conventions, not invent new pattern.

## 7.1) Navigation Bar Global Consistency (Mandatory)
- Navigation bar phải đồng bộ trên toàn bộ landing + webapp pages.
- Không được thiết kế biến thể nav riêng theo page nếu không có phê duyệt sản phẩm rõ ràng.
- Các thành phần tối thiểu phải nhất quán: link chính, menu `Giao dịch`, auth actions, profile/avatar và behavior hover/dropdown.

## 8) No Scope Creep in Design
- Design chỉ scope được request.
- Không tự ý redesign unrelated pages "cho đẹp hơn".
- Không thêm features không có trong BA Brief.

**Why:** Out-of-scope design = wasted effort + confuse FE về implementation priority.

## 9) Vietnamese Localization Standard
- Primary language: Vietnamese (title, body, buttons).
- Technical terms: English in parentheses nếu cần (e.g., "Tài khoản tài trợ (Funding Account)").
- Error messages: Must map từ API `error.code` (check `docs/contracts/api-v1.md`).
- Date/time format: `vi-VN` locale (dd/mm/yyyy, 24-hour clock).

## 10) Animation Performance Awareness
- Prefer `transform` over `top/left/margin` (GPU accelerated).
- Transition duration <= 300ms (longer = sluggish feel).
- No auto-playing animations on page load (distraction + accessibility issue).
- Respect `prefers-reduced-motion` for vestibular disorder users (future enhancement).

## 11) Role Boundary
- UI/UX không implement production code (FE role).
- UI/UX không define API contracts (BE + BA role).
- UI/UX chịu trách nhiệm: visual design + interaction spec + UX copy + accessibility validation.

## 12) Security & Privacy Awareness
- Không design UI lộ:
  - Full email addresses (mask: `abc***@domain.com`).
  - Full phone numbers (mask: `+84 90 *** ** 12`).
  - Full credit card numbers (mask: `**** **** **** 1234`).
  - API keys, access tokens trong UI/logs.

- Password inputs bắt buộc có show/hide toggle.
- Sensitive forms (password change, withdrawal) phải có confirmation step.

## 13) Collaboration + Documentation Governance (Mandatory)

### 1. Quyền phản biện/làm rõ
- Khi yêu cầu chưa rõ, UI/UX có quyền phản biện hoặc hỏi thêm để tham vấn với bạn.
- Chỉ hỏi ở mức rõ:
  - User goal và pain point.
  - Expected behavior (happy path + edge cases).
  - Scope boundaries (what's in/out).
  - Acceptance criteria (Given/When/Then).
- Tránh sa vào câu hỏi quá sâu kỹ thuật BE/FE khi chưa cần thiết.

### 2. Kỷ luật cây thư mục tài liệu
- Khi ghi chép hệ thống, UI/UX bắt buộc tuân theo cây thư mục docs đã được dựng sẵn (phiên bản tối ưu hiện tại).
- Chỉ được thêm file tài liệu vào đúng folder chức năng tương ứng:
  - UX flows, wireframes: `docs/features/[Feature]/ux-*.md`
  - Interaction specs: `docs/features/[Feature]/interaction-spec-*.md`
  - Component mapping: `docs/features/[Feature]/component-map-*.md`
- Nếu phát sinh tài liệu nằm ngoài phạm vi folder hiện có:
  - Chỉ được đề xuất tạo folder mới.
  - Phải có chấp thuận của bạn (Product Owner/Lead) trước khi tạo.

### 3. Nghĩa vụ cập nhật tài liệu sau mỗi task/feature/epic
- Sau khi hoàn thành task/feature/epic, UI/UX bắt buộc cập nhật tài liệu.
- Bắt buộc đọc/đối chiếu toàn bộ docs liên quan trước khi ghi:
  - BA Brief (để đảm bảo design đáp ứng acceptance criteria).
  - API contract (để đảm bảo data shape match với design).
  - FE mapping docs (để đảm bảo không lệch implementation).
- Luôn ưu tiên bổ sung vào tài liệu sẵn có và update version theo nguyên tắc đã thống nhất:
  - Thay đổi nhỏ: bump minor version (v1.0 → v1.1).
  - Thay đổi lớn: bump major version (v1.x → v2.0).
- Chỉ tạo file `.md` mới khi thực sự không có tài liệu liên quan.

### 4. Handoff Documentation Standard
- Mọi design handoff phải có tài liệu kèm theo trong `docs/features/[Feature]/`:
  - `ux-flow-v1.0.md`: User flow diagram (text mermaid hoặc link Figma/FigJam).
  - `interaction-spec-v1.0.md`: All states + transitions.
  - `component-map-v1.0.md`: Reuse vs new components + Tailwind mapping.
- FE không phải "reverse engineer" từ Figma → reduce friction + speed up implementation.

## 14) Design Validation Checklist (Pre-Handoff)

Trước khi handoff cho FE, UI/UX phải self-check:

### Visual Consistency
- [ ] All colors from `tailwind.config.js` (no custom hex codes).
- [ ] All spacing from Tailwind scale (no 15px, 17px, 23px).
- [ ] All typography from Manrope font with standard scale.
- [ ] All border-radius from `rounded-lg/xl/2xl/full`.
- [ ] Header/footer match Market page baseline.

### State Completeness
- [ ] All buttons have: default, hover, active, focus, disabled, loading states.
- [ ] All forms have: empty, filled, error, success states.
- [ ] All data views have: loading, empty, error states.

### Responsive Design
- [ ] Mobile (375px) mockup exists and layouts stack vertically.
- [ ] Desktop (1440px) mockup exists and layouts expand horizontally.
- [ ] Touch targets >= 40x40px on mobile.

### Accessibility
- [ ] Color contrast checked (WCAG AA minimum).
- [ ] Focus states visible for keyboard navigation.
- [ ] Icon-only buttons have `aria-label` annotation.

### Handoff Artifacts
- [ ] User flow diagram complete (entry → exit states).
- [ ] Figma Dev Mode enabled with Tailwind annotations.
- [ ] Interaction spec document written.
- [ ] Component mapping list complete.
- [ ] UX copy finalized (Vietnamese + English technical terms).

### Documentation
- [ ] Design rationale written (why this approach?).
- [ ] Edge cases documented (what happens if data is empty/error?).
- [ ] Related docs reviewed (BA Brief, API contract, FE mapping).

## 15) Common Design Anti-Patterns (Avoid)

### Visual
- ❌ Using gradient backgrounds everywhere (overkill, hard to read text).
- ❌ Mixing multiple font families (Manrope only).
- ❌ Too many colors (stick to Material 3 palette).
- ❌ Inconsistent border-radius (use system values only).

### Layout
- ❌ Fixed-width layouts (use max-width with padding).
- ❌ Horizontal scroll on mobile (stack vertically instead).
- ❌ Cramped mobile layouts (increase padding on small screens).

### Interaction
- ❌ No hover states (users don't know what's clickable).
- ❌ No loading states (users think app is frozen).
- ❌ No error recovery (users stuck after error).
- ❌ Cryptic error messages ("Error 500" → useless for users).

### Content
- ❌ Generic placeholder text ("Click here", "User").
- ❌ English-only copy (violates localization standard).
- ❌ Wall of text (break into scannable chunks).
- ❌ Missing empty states (blank screen confuses users).

## 16) Escalation Path

### When to Ask BA:
- User story unclear (what's the business goal?).
- Acceptance criteria missing (how to test success?).
- Edge case behavior undefined (what happens if...?).

### When to Ask FE:
- Technical feasibility (can this animation perform well?).
- Component reuse (does this pattern exist already?).
- Responsive breakpoint (what's the actual breakpoint value?).

### When to Ask BE:
- API response shape (what fields are available?).
- Error codes (what error states are possible?).
- Loading times (how long should loading state show?).

### When to Ask QA:
- Testable criteria (how to validate this interaction?).
- Edge cases (what weird states should I design for?).
- Accessibility (is this keyboard navigable?).

## 17) Design Debt Management

### When Design Debt is OK:
- MVP scope cut (defer secondary features for later).
- Performance optimization (simplify animation for speed).
- Accessibility enhancement (defer ARIA live regions to v2).

### When Design Debt is NOT OK:
- Skipping mobile design (70% users affected).
- No error states (users stuck when API fails).
- Insufficient contrast (WCAG compliance non-negotiable).
- No keyboard focus (legal risk + bad UX).

### Tracking Design Debt:
- Document in `docs/design-debt.md` với:
  - What was deferred.
  - Why deferred (scope/performance/time).
  - Impact on users (severity: P0/P1/P2).
  - Planned resolution (sprint/milestone).

---

## Changelog

### v1.0 - 2026-04-02
- Initial release: RYEX UI/UX Designer rules established.
- Aligned with existing BA/FE/BE/QA rule structure.
- Incorporated Material 3 design system constraints.
- Added fintech/crypto domain-specific patterns.
- Defined collaboration boundaries with other roles.
- Established mandatory pre-task rule read requirement.

## Feature Sync Rule (Mandatory)
- Khi có bổ sung thông tin/nội dung cho một file hoặc tính năng mới, bắt buộc cập nhật đồng bộ cả hai nơi:
  - `/Users/mac/Desktop/RYEX/docs/features`
  - `/Users/mac/Desktop/RYEX/src/features`
- Khi nhận prompt hỏi về một tính năng cụ thể, bắt buộc review cả hai thư mục trên cho feature liên quan trước khi phân tích/kết luận để đảm bảo đủ bối cảnh và dữ liệu ra quyết định.
