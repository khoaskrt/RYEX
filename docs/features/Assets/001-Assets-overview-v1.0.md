# [Assets] - BA Brief (v1.0)

## 1. Problem framing
- Business goal: Kích hoạt luồng xem tài sản trên `/app/assets` bằng dữ liệu thật, ổn định và testable.
- User pain: UI Assets đã có nhưng có nguy cơ lỗi runtime/rỗng dữ liệu vì BE-DB-Docs chưa đồng bộ source-of-truth.
- KPI:
  - `GET /api/v1/user/assets` success rate (2xx) >= 99% cho user đã đăng nhập.
  - Tỷ lệ `ASSET_FETCH_FAILED` < 1%.
  - p95 thời gian tải dữ liệu assets < 2 giây.

## 2. Scope
- In-scope:
  - `P0`: Đồng bộ FE-BE-DB cho `GET /api/v1/user/assets` (contract chạy ổn định, có happy path + empty state + unauthorized).
  - `P0`: Chốt migration/schema current-truth cho `user_assets`.
  - `P0`: Bổ sung Assets vào docs ownership + API contract matrix.
  - `P1`: Chuẩn hóa success envelope theo roadmap API v1 (`data/meta`) theo hướng non-breaking.
- Out-of-scope:
  - Nạp/rút/chuyển tiền thật.
  - Trading engine/settlement.
  - Backoffice reconciliation.

## 3. Runtime Gap
- Expected behavior:
  - User đăng nhập mở `/app/assets` thấy tổng tài sản + danh sách coin, không lỗi 500.
- Current behavior:
  - FE đã gọi đúng `GET /api/v1/user/assets` với bearer token.
  - BE route + repository đã tồn tại.
  - Baseline DB/docs current-truth hiện chưa thể hiện rõ `user_assets` trong migration set đang active.
  - API contract docs chưa liệt kê endpoint `/api/v1/user/assets`.
- Proposed resolution:
  - Chốt current-truth data cho `user_assets` trước (migration + schema snapshot).
  - Freeze contract endpoint assets và cập nhật SoT docs.
  - QA chạy contract/regression pack cho Assets trước khi đóng P0.

## 4. Acceptance criteria (Given/When/Then)
- AC-01 (Auth success):
  - Given user đã đăng nhập hợp lệ
  - When FE gọi `GET /api/v1/user/assets` với bearer token
  - Then API trả `200` và payload có đủ field FE đang dùng: `totalBalanceBTC`, `totalBalanceUSDT`, `fundingAccount`, `tradingAccount`, `assets[]`, `fetchedAt`.

- AC-02 (Unauthorized):
  - Given request thiếu token hoặc token invalid
  - When gọi `GET /api/v1/user/assets`
  - Then API trả `401` với `error.code = ASSET_UNAUTHORIZED`.

- AC-03 (Data baseline consistency):
  - Given môi trường DB theo migration order chính thức
  - When BE query bảng `user_assets`
  - Then không phát sinh lỗi thiếu bảng/thiếu cột; endpoint không trả `ASSET_FETCH_FAILED` do schema drift.

- AC-04 (Empty state):
  - Given user chưa có bản ghi tài sản
  - When gọi assets API
  - Then API trả `200` với `assets: []` và các tổng số dư bằng `0`.

- AC-05 (Traceability docs):
  - Given feature Assets được chốt P0
  - When review docs
  - Then có đủ mapping: business goal -> AC -> API contract -> data impact -> QA cases.

## 5. Impact map
- FE impact:
  - Giữ flow auth/token hiện tại; đảm bảo render đúng loading/error/empty state theo contract chốt.
- BE impact:
  - Khóa contract cho `/api/v1/user/assets`; đảm bảo auth verify + `error.code` + shape response ổn định.
- QA impact:
  - Bổ sung test pack Assets: happy path, unauthorized, empty state, schema consistency.

## 6. Risks + decisions
- Risks:
  - Technical: schema drift giữa code và migration cho `user_assets`.
  - Product: user thấy lỗi ở màn Assets làm giảm trust.
  - Operational: thiếu SoT assets gây lệch handoff FE-BE-QA.
  - Security: debug/log có thể lộ thông tin nhạy cảm nếu không kiểm soát.

- Decisions cần PO/Lead chốt:
  - Ưu tiên P0 cho data baseline trước hay contract docs trước (khuyến nghị: baseline data trước).
  - Deadline freeze contract cho `/api/v1/user/assets` trong sprint hiện tại.
  - Mức ưu tiên chuẩn hóa success envelope (`P1`) ngay sprint này hay để sprint kế tiếp.

## 7. Delta
- Changed: Promote draft `v0.1` -> refinal `v1.0` và chuẩn hóa wording để handoff.
- Reason: Chuẩn bị phân công task theo owner FE/BE/QA/BA.
- Impact: Có thể dùng ngay làm input cho task breakdown và sprint assignment.
