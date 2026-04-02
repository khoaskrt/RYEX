# 003-Kline-chart - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Cung cấp chart nến (kline) trực quan trên trang detail token để user quan sát biến động giá theo khung thời gian.
- User pain:
  - User cần dữ liệu biểu đồ cập nhật liên tục, dễ đọc và đổi interval nhanh.
  - Khi dữ liệu kline lỗi/gián đoạn, user không muốn trang bị vỡ hoặc đóng băng.
- KPI:
  - `Kline API success rate`.
  - `Chart render success rate`.
  - `Interval switch responsiveness`.
  - `Chart refresh stability` (polling mỗi chu kỳ).

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `GET /api/v1/market/kline`.
    - Validate query `symbol`, `interval`, `limit`.
    - FE component `PriceChart` render candlestick chart.
    - Polling chart data theo chu kỳ 10 giây.
  - `P1`:
    - Chuẩn hóa error code namespace theo chuẩn API v1 (`MARKET_*`).
    - Bổ sung `requestId` vào error response.
  - `P2`:
    - Mở rộng interval options/indicator overlays.
- Out-of-scope:
  - Advanced technical analysis toolkit.
  - Multi-series comparison chart.
  - Backtesting features.

## 3. Runtime Gap (if any)
- Expected behavior:
  - API kline trả dữ liệu chuẩn hóa nến và FE hiển thị chart ổn định qua các lần refresh.
  - Input không hợp lệ phải trả lỗi có code rõ ràng.
- Current behavior:
  - API đã validate `interval` và `limit`, trả error code cho invalid input.
  - FE đã có polling 10s và interval switch (`1h`, `1d`, `1w`, `1M`).
  - Error code hiện tại còn generic (`INVALID_INTERVAL`, `INVALID_LIMIT`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`) chưa chuẩn prefix domain đầy đủ.
- Proposed resolution:
  - Giữ baseline runtime hiện tại.
  - Chuẩn hóa error code sang namespace `MARKET_*` theo roadmap contract.
  - Bổ sung trace/requestId cho debugging cross-team.

## 4. User stories
- US-01:
  - Là user ở trang detail, tôi muốn thấy chart nến để hiểu xu hướng giá token.
- US-02:
  - Là user, tôi muốn đổi interval nhanh (`1h/1d/1w/1M`) để xem biến động ở nhiều khung thời gian.
- US-03:
  - Là user, tôi muốn chart tự làm mới định kỳ mà không cần reload trang.
- US-04:
  - Là user gặp lỗi dữ liệu, tôi muốn giao diện vẫn ổn định và có trạng thái loading/error phù hợp.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Kline happy path):
  - Given query hợp lệ (`symbol`, `interval`, `limit`)
  - When gọi `GET /api/v1/market/kline`
  - Then trả `200` với `symbol`, `interval`, `data[]`, `fetchedAt`, `stale`.

- AC-02 (Invalid interval):
  - Given `interval` không nằm trong danh sách cho phép
  - When gọi kline API
  - Then trả `400` với error code invalid interval.

- AC-03 (Invalid limit):
  - Given `limit` < 1 hoặc > 1000
  - When gọi kline API
  - Then trả `400` với error code invalid limit.

- AC-04 (Upstream degrade with cache):
  - Given upstream lỗi nhưng cache kline còn
  - When gọi kline API
  - Then trả payload cache với `stale=true`.

- AC-05 (Upstream degrade without cache):
  - Given upstream lỗi và không có cache
  - When gọi kline API
  - Then trả nhánh service unavailable (`503` path).

- AC-06 (Chart initial load):
  - Given user vào trang detail token
  - When `PriceChart` mount
  - Then chart render được nến từ kline data và fit content.

- AC-07 (Interval switching):
  - Given chart đang hiển thị
  - When user đổi interval
  - Then FE gọi lại kline API với interval mới và cập nhật chart data.

- AC-08 (Polling refresh):
  - Given chart đang mở
  - When qua chu kỳ refresh 10 giây
  - Then FE gọi lại kline API và cập nhật chart không crash UI.

## 6. Impact map
- FE impact:
  - `src/features/market/PriceChart.js`.
  - State handling:
    - `activeInterval`
    - `isLoading`
  - Chart render lifecycle + resize behavior.
- BE impact:
  - `src/app/api/v1/market/kline/route.js`.
  - `src/server/market/SpotMarket.js` (`getMarketKline`).
  - Kline cache key theo `symbol_interval_limit`.
- QA impact:
  - API tests:
    - valid params,
    - invalid interval,
    - invalid limit,
    - stale fallback path.
  - UI tests:
    - chart load,
    - interval switch,
    - polling update,
    - loading overlay behavior.

## 7. Risks + decisions
- Risks:
  - R-01: Upstream kline latency/timeout làm chart update giật hoặc stale thường xuyên.
  - R-02: Error code chưa chuẩn domain prefix gây khó thống nhất automation.
  - R-03: Polling liên tục có thể tăng load nếu scale user đồng thời cao.
- Decisions cần PO chốt:
  - D-01: Ưu tiên chuẩn hóa error code endpoint kline ở sprint contract nào.
  - D-02: Có cần tối ưu refresh strategy (polling adaptive) ở phase sau không.

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `003-kline-chart` thuộc nhánh Market.
- Reason:
  - Cần chuẩn hóa nghiệp vụ và tiêu chí test cho chart nến realtime.
- Impact:
  - Hoàn tất bộ brief Market core (`001`-`003`) cho handoff FE/BE/QA.
