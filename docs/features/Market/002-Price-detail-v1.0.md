# 002-Price-detail - BA Brief (v1.0)

## 1. Problem framing
- Business goal:
  - Cung cấp trang chi tiết token đủ dữ liệu giá và chỉ số để user ra quyết định nhanh sau khi rời market list.
- User pain:
  - User cần một trang detail tập trung (price, high/low, volume, market cap, supply, rank, dominance, chart).
  - Khi dữ liệu upstream lỗi, user vẫn cần trang không vỡ layout và có fallback hợp lý.
- KPI:
  - `Price detail page load success rate`.
  - `Price detail API success/stale rate`.
  - `Detail-to-chart interaction success rate`.
  - Tỷ lệ điều hướng thành công từ market list sang detail.

## 2. Scope
- In-scope (P0/P1/P2):
  - `P0`:
    - Route `/app/price/[symbol]`.
    - API `GET /api/v1/market/price/[symbol]`.
    - Server preload `getMarketPriceDetail(symbol)`.
    - Render fallback token presentation khi data thiếu/lỗi.
  - `P1`:
    - Chuẩn hóa error contract endpoint price theo `docs/contracts/api-v1.md`.
    - Chuẩn hóa token visual mapping dùng chung giữa market list và detail.
  - `P2`:
    - Mở rộng thông tin token (metadata/insight sâu hơn).
- Out-of-scope:
  - Phân tích kỹ thuật nâng cao (indicators complex).
  - Personalized portfolio position trên detail page.

## 3. Runtime Gap (if any)
- Expected behavior:
  - User mở `/app/price/[symbol]` luôn thấy trang detail đầy đủ với dữ liệu mới nhất hoặc fallback an toàn.
- Current behavior:
  - Server page preload detail data từ service.
  - `PricePage` merge runtime data với fallback map (đặc biệt cho symbol không đầy đủ metadata).
  - Error contract của price API chưa chuẩn `error.code` (đang trả string `error`).
- Proposed resolution:
  - Giữ runtime hiện tại làm baseline.
  - Ưu tiên chuẩn hóa contract lỗi endpoint price.
  - Bước tiếp theo tách shared token presentation map để giảm duplicate logic.

## 4. User stories
- US-01:
  - Là user từ market list, tôi muốn vào trang chi tiết token cụ thể để xem các chỉ số quan trọng.
- US-02:
  - Là user, tôi muốn thấy chart giá và số liệu 24h trong cùng một màn hình.
- US-03:
  - Là user xem token ít phổ biến, tôi muốn trang vẫn hiển thị ổn định ngay cả khi metadata thiếu.
- US-04:
  - Là user gặp lỗi upstream, tôi muốn vẫn thấy fallback thay vì trang lỗi trắng.

## 5. Acceptance criteria (Given/When/Then)
- AC-01 (Route mapping):
  - Given user truy cập `/app/price/{symbol}`
  - When server xử lý request
  - Then route map symbol về cặp market pair (`USDT`) đúng và gọi service preload.

- AC-02 (Price detail happy path):
  - Given upstream market khả dụng
  - When gọi `GET /api/v1/market/price/[symbol]`
  - Then trả `200` với payload detail gồm `symbol`, `symbolShort`, `priceDisplay`, `change24hDisplay`, `high24hDisplay`, `low24hDisplay`, `volume*`, `marketCapDisplay`, `rankDisplay`, `stale`.

- AC-03 (Fallback display when data missing):
  - Given payload thiếu một số field (market cap/supply/icon...)
  - When render `PricePage`
  - Then UI dùng fallback presentation mà không crash layout.

- AC-04 (Unknown symbol handling):
  - Given symbol chưa có full mapping local
  - When render detail
  - Then tên/symbol và section about vẫn hiển thị theo fallback rule.

- AC-05 (Upstream degrade with cache):
  - Given upstream lỗi tạm thời nhưng cache detail còn
  - When gọi API detail
  - Then trả payload cache với `stale=true`.

- AC-06 (Upstream degrade without cache):
  - Given upstream lỗi và không có cache
  - When gọi API detail
  - Then trả nhánh service unavailable (`503` path).

- AC-07 (Navigation integrity):
  - Given user click token row từ market list
  - When điều hướng sang detail
  - Then symbol trên detail khớp token đã chọn.

- AC-08 (Chart integration):
  - Given detail page đã load
  - When user xem chart
  - Then `PriceChart` gọi kline API theo symbol hiện tại và render được dữ liệu.

## 6. Impact map
- FE impact:
  - `src/app/(webapp)/app/price/[symbol]/page.js`.
  - `src/app/price/page.js`.
  - `src/features/market/PriceChart.js`.
  - Token visual/detail fallback logic và render section chỉ số.
- BE impact:
  - `src/app/api/v1/market/price/[symbol]/route.js`.
  - `src/server/market/SpotMarket.js` (`getMarketPriceDetail`).
  - CoinGecko enrichment cho market cap/supply/rank/icon + BTC dominance (khi BTC).
- QA impact:
  - API tests:
    - happy path,
    - stale with cache,
    - error path without cache.
  - UI tests:
    - symbol mapping correctness,
    - fallback rendering,
    - chart load + interval switching,
    - navigation from market list.

## 7. Risks + decisions
- Risks:
  - R-01: Metadata từ CoinGecko không đầy đủ làm một số field rỗng.
  - R-02: Error contract endpoint price chưa đồng nhất với chuẩn v1.
  - R-03: Token mapping lặp ở nhiều nơi dễ drift icon/name behavior.
- Decisions cần PO chốt:
  - D-01: Ưu tiên chuẩn hóa error envelope cho price endpoint trong sprint nào.
  - D-02: Có đầu tư gom shared token mapping ngay hay sau khi hoàn thành market core.

## 8. Delta (optional)
- Changed:
  - Khởi tạo brief cho feature `002-price-detail` thuộc nhánh Market.
- Reason:
  - Cần chuẩn hóa nghiệp vụ và acceptance criteria cho trang chi tiết token.
- Impact:
  - Tạo baseline handoff FE/BE/QA cho luồng market list -> price detail -> chart.
