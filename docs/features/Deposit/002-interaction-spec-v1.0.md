# [Deposit] - Interaction Spec (v1.0)

## 1. State Matrix (8 States)
Theo chuẩn UIUX của RYEX, các khối tương tác chính trong Deposit có đủ state:
1. Default
2. Hover
3. Active/Pressed
4. Focus
5. Disabled
6. Loading
7. Error
8. Empty

## 2. Component-Level States

### 2.1 Token Selection Card
- Default:
  - `border-outline-variant/30`, `bg-surface`.
- Hover:
  - `hover:border-primary-container/70`, `hover:bg-surface-container-low`.
- Active/Selected:
  - `border-primary`, `bg-primary-container/10`, shadow nhấn.
- Focus:
  - `focus-visible:ring-2 focus-visible:ring-primary-container`.
- Disabled:
  - áp dụng `disabled:opacity-40 disabled:cursor-not-allowed` khi lock network.
- Loading:
  - hiển thị skeleton card (`animate-pulse`) ở phase API.
- Error:
  - badge cảnh báo ở card + copy hướng dẫn chọn lại network.
- Empty:
  - thay danh sách token bằng empty state + CTA quay lại Assets.

### 2.2 Wallet Address Block
- Default:
  - hiển thị địa chỉ ví hardcode, nút `Sao chép`, `Quét QR`.
- Hover:
  - nút secondary đổi nền từ `surface-container-high` sang `surface-container`.
- Active:
  - `active:scale-95` cho buttons.
- Focus:
  - ring primary rõ ràng cho keyboard user.
- Disabled:
  - tất cả action button disabled khi chưa chọn token/network.
- Loading:
  - text placeholder `Đang tạo địa chỉ nạp...` + skeleton.
- Error:
  - thông báo đỏ: `Không thể tạo địa chỉ ví, vui lòng thử lại`.
- Empty:
  - không có địa chỉ khả dụng cho network đã chọn.

### 2.3 Primary/Secondary Actions
- Primary `Tôi đã chuyển tiền`:
  - Default: gradient primary.
  - Hover: `opacity-90`.
  - Active: `scale-95`.
  - Focus: ring primary.
  - Disabled: opacity 40, cursor not-allowed.
  - Loading: đổi label `Đang xác nhận...`.
  - Error: hiển thị inline error dưới nhóm button.
  - Empty: ẩn primary khi chưa đủ input.

### 2.4 Sidebar: State Preview + Empty History
- Default:
  - hiển thị summary token/network.
- Hover:
  - card state preview đổi subtle border tone.
- Active:
  - N/A cho khối tĩnh (không click chính).
- Focus:
  - áp dụng cho CTA `Nạp tiền ngay` trong empty history.
- Disabled:
  - CTA empty disabled khi user không có quyền nạp.
- Loading:
  - khối summary dùng skeleton text.
- Error:
  - badge đỏ trong summary nếu API trả lỗi.
- Empty:
  - card `Chưa có giao dịch nạp`.

## 3. Transition + Motion
- Transition color: `duration-200`.
- Pressed state: `active:scale-95`.
- Hover card nhẹ: `translate-y` chỉ dùng tại Assets card; Deposit giữ ổn định để ưu tiên readability.
- No autoplay animation nặng ở first paint.

## 4. Accessibility Notes
- Touch targets tối thiểu 40x40 (`h-10`).
- Focus visible cho mọi button interactive.
- Icon-only action cần `aria-label` khi chuyển sang component có icon-only ở phase sau.
- Màu text/error theo token để đảm bảo contrast AA.

## 5. FE Integration Hooks (Next Phase)
- `selectedToken`: state điều khiển toàn bộ panel trái/phải.
- `loadingAddress`: bật state loading cho wallet block.
- `addressError`: map theo `error.code` API.
- `depositHistory`: nếu empty -> giữ empty card, nếu có data -> render list/table.
