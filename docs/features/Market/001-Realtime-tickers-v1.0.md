# 001-Realtime-tickers - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Cung cấp bảng giá realtime đủ ổn định để user theo dõi thị trường và đi vào flow xem chi tiết/giao dịch.
- User pain:
  - Khi dữ liệu không cập nhật hoặc lỗi upstream, user mất niềm tin vào dữ liệu market.
  - User cần tìm token nhanh và điều hướng mượt từ list sang detail.
- KPI:
  - `Tickers fetch success rate`.
  - `Stale fallback availability rate`.
  - `Market page render stability` khi upstream lỗi.
  - `Search-to-result latency` trên market list.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - `GET /api/v1/market/tickers`.
    - Polling client theo `NEXT_PUBLIC_MARKET_REFRESH_MS` (fallback default 10s).
    - Stale fallback khi upstream lỗi nhưng còn cache.
    - Search + pagination + top gainers/losers/volume summary.
  - `P1`:
    - Chuẩn hóa error contract endpoint tickers theo `docs/contracts/api-v1.md`.
    - Chuẩn hóa `requestId`/trace cho debugging.
  - `P2`:
    - Tối ưu sorting/filtering nâng cao theo category watchlist.
- Out-of-scope:
  - Order book realtime.
  - Trade execution engine.
  - Personalized portfolio ranking.

## 3. Runtime Gap (if any)
- Expected behavior:
  - API tickers trả dữ liệu liên tục, nếu upstream degrade vẫn có dữ liệu tạm (`stale=true`).
  - FE hiển thị trạng thái rõ: loading/error/stale/lastUpdated.
- Current behavior:
  - API trả `data[]`, `fetchedAt`, `stale`; cache TTL ngắn và fallback khi lỗi.
  - FE đã có polling, search reset page, pagination clamp, error banner.
  - Error shape endpoint tickers chưa theo chuẩn `error.code` (đang là string `error`).
- Proposed resolution:
  - Giữ flow runtime hiện tại làm baseline.
  - Ưu tiên chuẩn hóa error envelope cho tickers trong sprint contract.
  - Giữ non-breaking payload cho FE hiện tại khi migrate.

## 4. User stories
- US-01:
  - Là user đã đăng nhập, tôi muốn thấy bảng giá market cập nhật định kỳ mà không cần reload trang.
- US-02:
  - Là user muốn tìm nhanh token, tôi muốn search theo symbol hoặc tên token.
- US-03:
  - Là user khi upstream lỗi tạm thời, tôi vẫn muốn xem dữ liệu gần nhất thay vì màn hình trống.
- US-04:
  - Là user, tôi muốn chuyển từ row token sang trang chi tiết token nhanh chóng.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Tickers happy path):
  - Given upstream khả dụng
  - When gọi `GET /api/v1/market/tickers`
  - Then trả `200` với `data[]`, `fetchedAt`, `stale=false`.

- AC-02 (Upstream degrade with cache):
  - Given upstream lỗi tạm thời và cache còn
  - When gọi tickers
  - Then trả `200` với payload cũ và `stale=true`.

- AC-03 (Upstream degrade without cache):
  - Given upstream lỗi và không có cache khả dụng
  - When gọi tickers
  - Then trả lỗi service unavailable (`503` path).

- AC-04 (Client polling):
  - Given user đang ở `/app/market`
  - When qua mỗi chu kỳ refresh
  - Then client tự gọi lại tickers API và cập nhật `lastUpdated`.

- AC-05 (Search behavior):
  - Given user nhập search term
  - When list được lọc
  - Then kết quả match theo `symbol`, `shortSymbol`, hoặc `name`.

- AC-06 (Pagination reset + clamp):
  - Given user đang ở page > 1
  - When đổi search term
  - Then page reset về 1; nếu total pages giảm thì current page bị clamp hợp lệ.

- AC-07 (UI degraded state):
  - Given fetch lỗi ở client
  - When cập nhật state market
  - Then UI hiển thị thông báo lỗi và không crash table layout.

- AC-08 (Row navigation):
  - Given user click vào token row hoặc nút “Giao dịch”
  - When action xảy ra
  - Then điều hướng tới `/app/price/[symbol]` đúng token.

## 6. Impact map
- FE impact:
  - `src/features/market/MarketModulePage.js`.
  - `src/features/market/realtime/marketClient.js`.
  - Render state: `loading/error/stale/lastUpdated`.
  - Search/pagination và điều hướng detail.
- BE impact:
  - `src/app/api/v1/market/tickers/route.js`.
  - `src/server/market/SpotMarket.js`:
    - fetch Binance batch ticker.
    - enrich CoinGecko market cap/icon.
    - cache TTL + stale fallback.
- QA impact:
  - API tests:
    - happy path, degrade with cache, degrade without cache.
  - UI tests:
    - polling update.
    - search + pagination reset/clamp.
    - stale/error banner.
    - row navigation and fallback token rendering.

## 7. Risks + decisions
- Risks:
  - R-01: Upstream Binance/CoinGecko gián đoạn làm tăng tần suất stale/error.
  - R-02: Error contract chưa chuẩn hóa có thể gây mismatch khi FE/QA automation mở rộng.
  - R-03: Cache in-memory theo process có thể không nhất quán khi scale multi-instance.
- Decisions cần PO chốt:
  - D-01: Mức ưu tiên chuẩn hóa `error.code` cho tickers endpoint trong sprint tới.
  - D-02: Thời điểm đầu tư shared cache khi traffic tăng.

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `001-realtime-tickers` thuộc nhánh Market.
- Reason:
  - Cần chuẩn hóa handoff nghiệp vụ và test matrix cho market list realtime.
- Impact:
  - Tạo baseline để FE/BE/QA triển khai và regression ổn định cho market homepage.
