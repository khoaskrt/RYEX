# Trading Account Interaction Spec v1.0

## 1) Global States
- Default:
  - Hiển thị hero + KPI + bảng vị thế + panel phụ.
- Hover:
  - Card nâng nhẹ `hover:-translate-y-1`.
  - Button/row đổi nền bằng `hover:bg-surface-container-high` hoặc tương đương.
- Active/Pressed:
  - CTA chính dùng `active:scale-95`.
- Focus:
  - Inputs/buttons có `focus:ring-2 focus:ring-primary-container`.
- Disabled:
  - Nút `Đang đồng bộ dữ liệu...` ở hero là disabled demo.
- Loading:
  - Trạng thái loading toàn trang: `Loading dashboard...` trước khi auth resolve.
- Error:
  - Phase hiện tại chưa kết nối API nên chưa có error API thực; giữ reserved cho phase sau.
- Empty:
  - Khi filter/search không có dữ liệu vị thế, hiển thị empty row với icon + message.

## 2) Position Filter + Search
- Filter chips:
  - `Tất cả`, `Đang mở`, `Cảnh báo`.
  - Click đổi state active ngay (client-side).
- Search:
  - Input tìm theo symbol (BTCUSDT...).
  - Kết hợp với filter, trả về tập giao cắt.

## 3) Open Orders Panel
- Item hiển thị:
  - Symbol, side badge, loại lệnh, mức filled, giá và số lượng.
- CTA `Hủy tất cả`:
  - Chỉ UI state, chưa bind action backend.

## 4) Risk Monitor
- Thanh progress hardcode cho:
  - Available Margin
  - Daily Volume
- Dành chỗ để nối dữ liệu thực trong phase integration.

## 5) Accessibility Notes
- Touch targets >= 40px với controls chính (`h-10`, `h-11`).
- Focus ring rõ ràng cho keyboard users.
- Màu trạng thái PnL:
  - Dương: `text-primary`
  - Âm: `text-error`
