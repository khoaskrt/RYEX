# [Funding Account] - UIUX + FE Handoff (v1.0)

## 1. Mục tiêu
Dựng trang `Tài khoản tài trợ (Funding Account)` theo hướng **hardcode UI trước** để làm chuẩn giao diện và luồng điều hướng từ khu vực Assets (`/app/assets`) khi user bấm `Tài trợ`.

## 2. Scope v1 (Hardcode)
- Route mới: `/app/funding`.
- Hero summary:
  - Tổng số dư Funding (BTC + USDT quy đổi).
  - Có thể rút ngay.
  - Đang chờ xác nhận.
  - Trạng thái hệ thống.
- Account cards:
  - Funding chính.
  - Funding P2P.
  - Funding bị khóa.
- Funding assets table:
  - Tài sản, Tổng, Khả dụng, Đang khóa, Giá trị, biến động 24h.
  - Filter hardcode: `Tất cả`, `Đang có số dư`, `Số dư 0`.
  - Search UI (client-side trên mock data).
- Right column:
  - Hành động nhanh (`Nạp`, `Rút`, `Lịch sử`).
  - Giao dịch gần đây (mock).

## 3. User Flow
1. User ở trang Assets bấm nút `Tài trợ`.
2. Hệ thống điều hướng sang `/app/funding`.
3. User xem tổng quan funding + danh sách coin.
4. User có thể chuyển nhanh sang `Nạp tiền`, `Rút tiền`, `Lịch sử`.

## 4. Component Mapping
### Reuse
- `AppTopNav`
- `FundingNavigationSidebar`
- `FundingNavigationTabBar`
- `LandingFooter`

### New
- `src/features/funding/FundingModulePage.js`
- `src/features/funding/constants.js`
- `src/features/funding/index.js`
- `src/app/(webapp)/app/funding/page.js`

### Updated
- `src/shared/config/routes.js` (add `funding` route)
- `src/shared/lib/navigation/fundingNavigation.js` (add `goToFunding`)
- `src/shared/components/FundingNavigationSidebar.js` (use route constant)
- `src/shared/components/FundingNavigationTabBar.js` (use route constant)
- `src/app/(webapp)/app/assets/page.js` (add redirect button to funding)

## 5. Interaction States (v1)
- Buttons: default, hover, active, focus.
- Search input: default, focus, filtered state.
- Table:
  - Data state (mặc định).
  - Empty state khi filter/search không match.
- Status badges: success/pending/error.

## 6. Responsive Notes
- Mobile-first layout.
- Desktop giữ offset `lg:ml-60` để tránh đè sidebar.
- Table dùng `overflow-x-auto` để không vỡ layout mobile.

## 7. A11y Baseline
- Touch target các nút chính tối thiểu `h-10`.
- Input có `label` rõ ràng (`htmlFor="funding-search"`).
- Focus state có `focus:ring-2`.

## 8. Next Phase (Integration)
- Thay mock constants bằng API funding thật.
- Đồng bộ số dư với `assetsRepository` và lịch sử transaction backend.
- Bổ sung loading skeleton + error recovery state theo contract API.
