# RYEX Market Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.0`
- Owner: `BA` (co-own: `BE Market`, `FE Market`, `QA`)
- Last updated: `2026-03-31`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
- Source-of-truth note: Đây là tài liệu active duy nhất cho Market domain.

## 2) Problem Framing
- Business goal:
  - Cung cấp dữ liệu thị trường realtime đủ ổn định cho user ra quyết định giao dịch.
  - Đảm bảo experience “degraded but usable” khi upstream gián đoạn.
- User pain đang giải quyết:
  - Không muốn UI thị trường bị trắng hoặc crash khi nguồn ngoài lỗi.
  - Cần xem list token, detail token và chart trong cùng hệ thống nhất quán.
- KPI theo dõi:
  - `Market page data refresh success rate`.
  - `Stale response ratio` (tickers/price/kline).
  - `Time-to-recover` khi upstream Binance/CoinGecko lỗi.
  - `Search + pagination UX success` (không lỗi điều hướng/trạng thái).

## 3) Scope & Priority
### In-scope
- `P0`:
  - Tickers list realtime (`/api/v1/market/tickers`).
  - Price detail (`/api/v1/market/price/[symbol]` + page `/app/price/[symbol]`).
  - Kline chart (`/api/v1/market/kline`).
  - In-memory cache ngắn hạn + stale fallback.
- `P1`:
  - Contract consistency giữa các market endpoints.
  - Tối ưu icon/data fallback cho token chưa map.
- `P2`:
  - Mở rộng universe token và indicator nâng cao.

### Out-of-scope (Market domain hiện tại)
- Matching engine/đặt lệnh real exchange.
- Order book depth, trade history cấp exchange.
- Portfolio/PnL cá nhân hóa theo user account.

## 4) Runtime Architecture (Market)
- FE routes:
  - `/app/market` -> `MarketModulePage`.
  - `/app/price/[symbol]` -> preload detail và render `PricePage`.
  - `PriceChart` fetch kline theo interval.
- API routes:
  - `GET /api/v1/market/tickers`
  - `GET /api/v1/market/price/[symbol]`
  - `GET /api/v1/market/kline`
- Service layer:
  - `src/server/market/binanceSpotMarket.js` là service chính cho tickers/price/kline.
  - Upstream chính: Binance (`ticker`, `klines`), supplemental: CoinGecko (`market cap`, `icon`, supply, rank, BTC dominance).
- Cache strategy:
  - TTL mặc định `5s` cho tickers/price/kline.
  - Khi fetch lỗi nhưng cache còn: trả payload cũ + `stale: true`.
  - Khi fetch lỗi và không có cache: trả nhánh service unavailable.

## 5) API Contract Matrix (Current Runtime)
| Endpoint | Purpose | Input | Success contract | Error contract hiện tại |
|---|---|---|---|---|
| `GET /api/v1/market/tickers` | Lấy danh sách ticker cho market list | Query rỗng (symbols đọc từ env/service) | `200` với `data[]`, `fetchedAt`, `stale` | `status=503` (hoặc upstream status), body hiện tại: `{ error: "Failed to fetch market tickers" }` |
| `GET /api/v1/market/price/[symbol]` | Lấy chi tiết 1 token | Path `symbol` (vd `BTC`, `BTCUSDT`) | `200` với `symbol`, `symbolShort`, `priceDisplay`, `change24hDisplay`, `marketCapDisplay`, `rankDisplay`, `stale`, ... | `status=503` (hoặc upstream status), body hiện tại: `{ error: "Failed to fetch market price detail" }` |
| `GET /api/v1/market/kline` | Lấy dữ liệu nến cho chart | Query `symbol`, `interval`, `limit` | `200` với `symbol`, `interval`, `data[]`, `fetchedAt`, `stale` | Validation error: `{ error: { message, code } }` (`INVALID_INTERVAL`, `INVALID_LIMIT`), upstream/internal: `SERVICE_UNAVAILABLE`/`INTERNAL_ERROR` |

Ghi chú:
- Market contract đang **chưa đồng nhất**: `kline` dùng `error.code`, còn `tickers/price` đang trả `error` dạng string.

## 6) Core Flows (Business View)
### 6.1 Market List Realtime
1. User vào `/app/market` (sau khi auth session hợp lệ).
2. FE gọi `GET /api/v1/market/tickers`.
3. Service fetch Binance ticker batch + enrich CoinGecko.
4. API trả `data[]`, `fetchedAt`, `stale`.
5. FE render list, top gainer/loser/volume, search + pagination.
6. FE polling định kỳ theo `NEXT_PUBLIC_MARKET_REFRESH_MS` (fallback default 10s).
7. Nếu fetch fail: FE giữ UI ổn định, bật trạng thái lỗi/stale.

### 6.2 Price Detail
1. User click token từ market list.
2. Điều hướng `/app/price/[symbol]`.
3. Server page preload `getMarketPriceDetail`.
4. `PricePage` merge data runtime với fallback presentation local.
5. User thấy overview price, supply, rank, dominance, thông tin token.

### 6.3 Kline Chart
1. `PriceChart` gọi `GET /api/v1/market/kline?symbol&interval&limit=100`.
2. API validate `interval`, `limit`.
3. Service fetch klines từ Binance, normalize về `time/open/high/low/close/volume`.
4. FE render candlestick chart.
5. Polling chart mỗi 10s và đổi interval theo thao tác user.

## 7) Data & Config Dependencies
### Upstream dependencies
- Binance base URL: `BINANCE_MARKET_BASE_URL` (default `https://data-api.binance.vision`).
- CoinGecko base URL: `COINGECKO_BASE_URL` (default `https://api.coingecko.com/api/v3`).
- Optional keys:
  - `COINGECKO_API_KEY`
  - `COINGECKO_PRO_API_KEY`

### Runtime config
- `MARKET_SYMBOLS`: danh sách symbol ưu tiên; service vẫn đảm bảo tối thiểu universe theo default set.
- `MARKET_REFRESH_MS` / `NEXT_PUBLIC_MARKET_REFRESH_MS`: chu kỳ refresh phía client.

### Persistence
- Market domain hiện không lưu price history vào DB nội bộ; dữ liệu runtime chủ yếu từ upstream + cache in-memory.

## 8) FE/BE/QA Impact Map
### FE impact
- `MarketModulePage`:
  - Auth-gated entry.
  - Polling tickers + state `loading/error/stale/lastUpdated`.
  - Search reset page + pagination clamp.
- `PricePage`:
  - Fallback UI nếu preload data fail.
  - Token visual map local.
- `PriceChart`:
  - Interval switch + chart polling.

### BE impact
- `binanceSpotMarket` là single service point cho market read APIs.
- In-memory cache hiện theo process, không shared giữa instance.
- CoinGecko enrich có thể thiếu dữ liệu; service fallback về `--` để tránh vỡ contract UI.

### QA impact
- Contract-first test pack:
  - `tickers`: shape `data[]`, `fetchedAt`, `stale`.
  - `price`: detail shape + stale behavior.
  - `kline`: validation `INVALID_INTERVAL`, `INVALID_LIMIT`, data[] format.
- UI regression:
  - Search change reset page về 1.
  - Current page clamp khi filtered result giảm.
  - Unknown token vẫn render fallback icon/mark.

## 9) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Current runtime | Direction |
|---|---|---|---|
| G-MKT-01 | Error envelope thống nhất toàn market API | `kline` có `error.code`, `tickers/price` dùng `error` string | Chuẩn hóa contract lỗi trong `docs/contracts/api-v1.md` |
| G-MKT-02 | Một nguồn token visual mapping dùng chung | Mapping icon/mark đang lặp giữa market list và price page | Trích xuất shared token presentation map |
| G-MKT-03 | Cache behavior nhất quán khi scale nhiều instance | Cache in-memory cục bộ theo process | Cân nhắc shared cache khi rollout multi-instance |

## 10) Risks + Open Decisions
| Risk | Type | Mô tả | Mitigation ngắn hạn |
|---|---|---|---|
| R-MKT-01 | Operational | Upstream Binance/CoinGecko không ổn định theo thời điểm | Giữ stale fallback + monitor stale ratio |
| R-MKT-02 | Technical | Contract lỗi chưa đồng nhất làm khó QA automation | Ưu tiên ADR-004 cho market endpoints |
| R-MKT-03 | Product/Data | Detail page phụ thuộc fallback text tĩnh cho token chưa enrich đủ | Bổ sung rule fallback rõ trong contract docs |

Decisions cần PO/Tech Lead chốt:
- Ưu tiên chuẩn hóa error contract market trong sprint nào.
- Mức đầu tư shared cache trước/sau giai đoạn scale traffic.

## 11) Traceability Backbone (Market)
Mọi market change phải map theo chuỗi:

`Business goal -> User story -> Acceptance Criteria -> API/UI impact -> QA market pack`

Ví dụ:
- Goal: user luôn thấy bảng giá khả dụng.
- Story: khi upstream lỗi tạm thời, UI vẫn hiển thị dữ liệu gần nhất.
- AC: `tickers` trả `stale=true` nếu dùng cache fallback.
- Impact: `getMarketTickers` + `MarketModulePage`.
- QA: test nhánh upstream degrade có/không cache.

## 12) Change Control
- Không đổi behavior market APIs đã chốt nếu chưa ghi impact FE/BE/QA.
- Mọi thay đổi sau chốt phải thêm `Delta`:
  - `Changed`
  - `Reason`
  - `Impact`
- Versioning:
  - Minor: `v1.0 -> v1.1`
  - Major: `v1.x -> v2.0`

## 13) Delta
- `v1.0` (2026-03-31):
  - Created initial Market domain source-of-truth.
  - Captured current runtime flows, API contracts, and known architectural gaps.
