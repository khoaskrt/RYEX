# [History] - UIUX + FE Handoff (v1.0)

## 1. Mục tiêu trang
Trang `Lịch sử tài khoản` cho phép user đã đăng nhập xem lịch sử nạp/rút trong khu vực `Tài sản / Lịch sử`, lọc nhanh theo coin, trạng thái, khoảng thời gian và tải CSV theo bộ lọc hiện tại.

## 2. Scope v1
- Chỉ hiển thị lịch sử `Nạp` và `Rút`.
- Bảng dữ liệu gồm: `Coin`, `Số lượng`, `Thời gian`, `Bản ghi blockchain`, `Trạng thái`, `Ghi chú`, `ID lệnh`.
- Filter gồm: `Coin`, `Trạng thái`, `Từ ngày`, `Đến ngày`.
- Phân trang với `page size = 20`.
- Nút `Tải CSV` export dữ liệu theo filter hiện tại.
- Empty state: hiển thị thông điệp thân thiện + ảnh minh hoạ.

## 3. User Flow
1. User click `Lịch sử` từ funding navigation (`/app/history`).
2. Mặc định hiển thị dữ liệu 30 ngày gần nhất.
3. User chỉnh filter -> dữ liệu reload tại chỗ.
4. User bấm `Tải CSV` -> tải file `ryex-history.csv` theo filter hiện tại.
5. Nếu không có dữ liệu -> hiển thị `Không tìm thấy bản ghi nào` + illustration `history-empty.svg`.

## 4. Component Mapping
### Reuse
- `DepositTopNav` (header/auth state đồng bộ).
- `FundingNavigationSidebar`, `FundingNavigationTabBar`.
- `LandingFooter`.

### New
- `src/features/history/HistoryModulePage.js`
- `src/features/history/constants.js`
- `src/app/(webapp)/app/history/page.js`
- `public/images/history-empty.svg`

## 5. Interaction States (v1)
### Filter controls
- Default: hiển thị lựa chọn hiện tại.
- Hover: border/foreground nhấn nhẹ.
- Focus: `focus:ring-2 focus:ring-primary-container`.
- Disabled: dùng cho nút phân trang khi hết trang.

### Data states
- Loading: kế thừa shell loading chung của webapp.
- Data: hiển thị table (desktop) / card list (mobile).
- Empty: ảnh + copy + nút `Đặt lại bộ lọc`.

## 6. Handoff Notes
- Layout mobile-first, desktop có `lg:ml-60` để tránh đè sidebar.
- Date filter dùng chuẩn input `type="date"`.
- CSV encode bằng blob client-side, escape dấu `"` cho an toàn dữ liệu.
- Route history đã được normalize qua `ROUTES.history` để tránh hardcode/404.
