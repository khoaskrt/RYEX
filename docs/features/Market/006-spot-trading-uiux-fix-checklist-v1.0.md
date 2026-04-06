# Spot Trading UIUX Fix Checklist (1-Round FE)

## 0) Guardrails (Locked)
- Chỉ thay đổi **interface/presentation layer**.
- **Không** thay đổi:
  - Backend logic, service, repository, schema.
  - API endpoints, request/response contract.
  - `onClick`/CTA direction hiện có của button (route/action giữ nguyên).
- Không refactor ngoài scope spot-trading UI.

## 1) Priority P0 (Must Fix First)

### P0.1 - Align Webapp Shell / Navigation Consistency
- Mục tiêu: Spot Trading dùng cùng shell/nav baseline với Market page.
- FE checklist:
  - [ ] Dùng `AppTopNav` ở Spot Trading page giống pattern của Market.
  - [ ] Thêm top spacing chuẩn (`pt-16`) để tránh bị nav fixed đè nội dung.
  - [ ] Giữ nguyên toàn bộ CTA direction hiện tại trong module spot-trading.
- AC:
  - [ ] Header nav hiển thị đồng nhất giữa `/app/market` và `/app/spot-trading`.
  - [ ] Không phát sinh thay đổi route/action khi click CTA hiện có.

### P0.2 - Mobile-First Layout (No Horizontal Break)
- Mục tiêu: không vỡ layout trên mobile/tablet, không bị khóa vào fixed columns.
- FE checklist:
  - [ ] Thay các width cứng (`w-80`, `w-96`) bằng responsive classes (`w-full`, `md:w-*`, `lg:w-*`).
  - [ ] Tách layout theo breakpoint:
    - mobile: stack dọc (orderbook -> chart -> form -> open orders)
    - desktop: quay lại 3-cột như hiện tại.
  - [ ] Tránh `h-screen` cứng; ưu tiên `min-h-screen` + vùng scroll hợp lý.
- AC:
  - [ ] 375px không overflow ngang.
  - [ ] 768px hiển thị rõ toàn bộ block chính.
  - [ ] 1440px giữ trải nghiệm trading desk.

## 2) Priority P1 (Should Fix In Same Round)

### P1.1 - Tokenize Colors (Reduce Hardcoded Hex)
- Mục tiêu: đồng nhất Material token của RYEX.
- FE checklist:
  - [ ] Thay màu hardcode lặp lại bằng token semantic (`primary`, `error`, `on-surface-variant`, `outline-variant`...).
  - [ ] Giữ nguyên ý nghĩa màu tăng/giảm giá nhưng map theo token hệ thống.
- AC:
  - [ ] Không còn hardcode hex lặp lại ở các component spot-trading chính (header/orderbook/recent-trades/forms/open-orders).
  - [ ] UI vẫn giữ visual meaning mua/bán rõ ràng.

### P1.2 - Copy Consistency (VN-first)
- Mục tiêu: thống nhất ngôn ngữ với toàn bộ RYEX.
- FE checklist:
  - [ ] Đổi header table history từ EN sang VN (`Time`, `Pair`, `Side`, `Price`, `Amount`, `Fee` -> bản VN tương đương).
  - [ ] Giữ nguyên value/data mapping, chỉ đổi label hiển thị.
- AC:
  - [ ] Spot Trading không còn label EN lẫn trong bảng chính.

### P1.3 - Accessibility for Icon Buttons
- Mục tiêu: icon-only button có mô tả truy cập cơ bản.
- FE checklist:
  - [ ] Thêm `aria-label` cho icon button (favorite, chart tools, view mode).
  - [ ] Không đổi hành vi click hiện có.
- AC:
  - [ ] Keyboard/screen reader nhận biết được mục đích các icon button.

## 3) Priority P2 (Nice-to-Have If Time Allows)

### P2.1 - Visual Rhythm Polish
- FE checklist:
  - [ ] Chuẩn hóa spacing giữa các panel theo scale hệ thống.
  - [ ] Cân lại typography cấp bậc nhỏ (caption/table header) để đồng đều với Market.
- AC:
  - [ ] Không thay đổi logic, chỉ tăng độ nhất quán visual.

## 4) Suggested File Scope for FE
- `src/features/spot-trading/SpotTradingModulePage.js`
- `src/features/spot-trading/components/TradingHeader.js`
- `src/features/spot-trading/components/TradingForm.js`
- `src/features/spot-trading/components/OrderBook.js`
- `src/features/spot-trading/components/RecentTrades.js`
- `src/features/spot-trading/components/OpenOrders.js`
- (Nếu cần shell integration) route page wrapper tại `src/app/(webapp)/app/spot-trading/page.js`

## 5) QA Smoke After FE Fix
- [ ] Desktop + mobile render pass.
- [ ] Không đổi behavior đặt lệnh/hủy lệnh/history.
- [ ] Không đổi endpoint gọi API.
- [ ] Không đổi CTA direction hiện có của button.
