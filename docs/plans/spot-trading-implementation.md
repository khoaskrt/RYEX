# [Spot Trading Implementation] - BA Breakdown (v1.0)

## 1. Problem Framing
- Business goal:
  - Nâng cấp trang Spot Trading từ UI mock thành luồng giao dịch có thể vận hành trong RYEX MVP.
  - Tạo trải nghiệm giao dịch giống chuẩn CEX (KuCoin-like) nhưng vẫn phù hợp phạm vi kỹ thuật hiện tại (polling, market data proxy).
- User pain:
  - Người dùng thấy đầy đủ UI nhưng không thể giao dịch thật trong hệ thống nội bộ.
  - Dữ liệu chart/order book/recent trades/open orders đang mock nên giảm niềm tin.
- KPI (go-live gate):
  - 100% khối dữ liệu chính trên trang spot lấy từ API runtime (không còn mock data cứng).
  - 100% flow đặt lệnh market/limit trong phạm vi P0 chạy end-to-end thành công.
  - 0 lỗi P0 về sai số dư (double debit/credit) trong regression pack trading.
  - p95 API trading (`POST /trading/orders`, `GET /trading/orders`, `GET /trading/trades`) < 300ms trong môi trường staging ổn định.

## 2. Scope and Priority
- In-scope P0 (must-have cho bản triển khai đầu):
  - Tạo schema DB cho `spot_orders`, `spot_trades` + index + RLS.
  - Tạo trading APIs: đặt lệnh, xem lệnh, hủy lệnh, lịch sử khớp lệnh.
  - Tích hợp chart thật từ `/api/v1/market/kline` bằng `lightweight-charts`.
  - Tích hợp order book + recent trades + ticker real-time bằng polling.
  - Tích hợp TradingForm với số dư thực và validation trước submit.
  - Tích hợp Open Orders + Trade History với khả năng cancel order đang mở.
- In-scope P1 (hardening ngay sau P0):
  - Tối ưu polling lifecycle (không stack request, abort request cũ).
  - Cải thiện loading/error/stale-state UX.
  - Chuẩn hóa notification + error code mapping giữa BE và FE.
- In-scope P2 (future):
  - Stop-limit hoàn chỉnh với trigger engine riêng.
  - WebSocket real-time cho thị trường và order lifecycle.
  - Mở rộng multi-symbol/multi-market sâu hơn (beyond BTCUSDT-first).
- Out-of-scope (v1.0):
  - Kết nối lệnh với sàn ngoài để khớp lệnh thật.
  - Futures/margin/advanced order types.
  - Engine matching production-grade (high-frequency order book engine).

## 2.1 Ownership Clarification (Locked)
- PO responsibility:
  - Cung cấp thông tin bên thứ 3 mà dev không tự lấy được (ví dụ: tài liệu/contract/API từ đối tác).
  - Không chịu trách nhiệm define schema DB hay design kỹ thuật nội bộ.
- BA responsibility:
  - Chốt business rules với BE (order lifecycle, validation behavior, error semantics).
  - Define test cases để QA thực thi và report theo AC.
  - Update plan/contract docs để dev có thông tin triển khai rõ ràng.
- BE responsibility:
  - Tự define schema DB, transaction strategy, indexing, locking.
  - Document lại quyết định kỹ thuật (schema/API details) sau khi chốt triển khai.
- QA responsibility:
  - Thực thi test cases do BA bàn giao.
  - Validate contract và regression theo release gates.

## 3. Runtime Gap (Expected vs Current)
- Gap-01: Trading data đang mock ở FE.
  - Expected: chart/orderbook/trades/ticker lấy từ API runtime.
  - Current: component render mock constants/placeholder.
  - Resolution: thay mock source bằng hooks polling + API adapters.
- Gap-02: Chưa có domain trading order lifecycle.
  - Expected: có order repository + matching service + trading APIs.
  - Current: chỉ có market APIs và user assets APIs.
  - Resolution: bổ sung module `src/server/trading/*` và API routes tương ứng.
- Gap-03: Chưa có DB schema cho orders/trades.
  - Expected: lưu được order/trade + trạng thái + truy vấn theo user/symbol.
  - Current: chưa có table chuyên dụng cho spot trading.
  - Resolution: migration mới tạo `spot_orders`, `spot_trades`, index và policy.
- Gap-04: Chưa có contract cancel/list/history theo user.
  - Expected: FE gọi được list/cancel/trade-history theo pagination/filter.
  - Current: API chưa tồn tại.
  - Resolution: triển khai API contract và QA pack theo AC bên dưới.

## 4. Product Backlog Breakdown (By Epic)

### Epic A - Trading Backend Foundation (P0)
- A1. DB migration tạo `spot_orders`, `spot_trades`, index, constraints, RLS.
- A2. `orderRepository` cho create/read/update/cancel/list.
- A3. `orderMatchingService` cho market/limit execution mô phỏng.
- A4. Trading APIs:
  - `POST /api/v1/trading/orders`
  - `GET /api/v1/trading/orders`
  - `DELETE /api/v1/trading/orders/:id`
  - `GET /api/v1/trading/trades`

### Epic B - Market Data Real-time Integration (P0)
- B1. Tạo API market bổ sung:
  - `GET /api/v1/market/orderbook`
  - `GET /api/v1/market/trades`
- B2. Mở rộng `SpotMarket` service để map dữ liệu Binance depth/trades.
- B3. Hook `useMarketData(symbol)` gom ticker/orderbook/trades polling 10s.

### Epic C - Chart Implementation (P0)
- C1. Tạo `TradingChartCanvas` dùng `lightweight-charts`.
- C2. Replace placeholder chart trong `TradingChart.js`.
- C3. Theme config tách riêng (`chartTheme.js`) + responsive resize handling.

### Epic D - Trade Execution UX (P0)
- D1. Hook `useUserBalances` lấy số dư funding/trading thật.
- D2. Update `TradingForm`:
  - balance-aware validation
  - submit order thật
  - loading/submitting states
- D3. Notification component cho success/error.

### Epic E - Order Management UI (P0)
- E1. Hook `useOrderManagement` (open orders + trade history + cancel).
- E2. Update `OpenOrders` để hiển thị data thật.
- E3. Bổ sung tab trade history và hành vi refresh chuẩn.

### Epic F - Hardening & Release (P1)
- F1. Error/stale-data handling toàn module.
- F2. Performance pass (memo/debounce/abort inflight requests).
- F3. Responsive/mobile pass.
- F4. Release checklist + regression sign-off.

## 5. User Stories
- US-01 (P0): As a trader, tôi muốn xem chart nến theo cặp coin và timeframe để quyết định điểm vào lệnh.
- US-02 (P0): As a trader, tôi muốn xem order book và recent trades cập nhật liên tục để ước lượng thanh khoản.
- US-03 (P0): As a trader, tôi muốn đặt market/limit order với kiểm tra số dư thực để tránh submit lỗi.
- US-04 (P0): As a trader, tôi muốn xem và hủy lệnh mở để kiểm soát rủi ro.
- US-05 (P0): As a trader, tôi muốn xem lịch sử giao dịch đã khớp để đối soát hoạt động.
- US-06 (P1): As operations team, chúng tôi muốn release gates rõ ràng để go-live an toàn.

## 6. Acceptance Criteria (Given/When/Then)
- AC-01 Chart real data:
  - Given user mở trang spot
  - When chart area render
  - Then dữ liệu nến được lấy từ `/api/v1/market/kline` và hiển thị đúng theo `symbol + interval`.
- AC-02 Order book/trades real data:
  - Given polling đang hoạt động
  - When chu kỳ 10 giây chạy
  - Then order book và recent trades được cập nhật từ market APIs mới, không cần reload trang.
- AC-03 Place market order:
  - Given user đã đăng nhập và đủ số dư
  - When submit market order hợp lệ
  - Then hệ thống tạo order, thực thi mô phỏng theo giá thị trường, ghi trade, cập nhật số dư atomically.
- AC-04 Place limit order:
  - Given user submit limit order hợp lệ
  - When giá thị trường đạt điều kiện khớp theo rule đã định
  - Then order chuyển trạng thái phù hợp (`open` -> `partial/filled`) và có bản ghi trade khi khớp.
- AC-05 Cancel open order:
  - Given order thuộc user và đang `open`
  - When user bấm cancel
  - Then API trả thành công và order không còn trong danh sách open orders.
- AC-06 Access control:
  - Given user A cố truy cập order/trade của user B
  - When gọi APIs trading
  - Then hệ thống chặn theo RLS và không lộ dữ liệu trái quyền.
- AC-07 Form validation:
  - Given input amount/price không hợp lệ hoặc thiếu số dư
  - When user submit
  - Then FE chặn submit và hiển thị lỗi rõ ràng, không gọi API sai.
- AC-08 Error resilience:
  - Given market API tạm thời lỗi mạng
  - When polling thất bại
  - Then UI hiển thị trạng thái lỗi/stale nhưng không crash trang.

## 7. Handoff Impact Map
- FE impact:
  - `src/features/spot-trading/components/*` (TradingChart, OrderBook, RecentTrades, TradingForm, OpenOrders, TradingHeader).
  - `src/features/spot-trading/hooks/*` (market data, balances, order management).
  - `src/features/spot-trading/lib/*` (theme + validation).
- BE impact:
  - `db/migrations/*` (schema trading).
  - `src/server/trading/*` (repo + matching).
  - `src/app/api/v1/trading/*` và `src/app/api/v1/market/*` mới.
  - `src/server/market/SpotMarket.js` mở rộng adapter dữ liệu.
- QA impact:
  - API contract tests cho trading endpoints.
  - E2E pack: load chart -> place order -> verify balances -> cancel/list/history.
  - Regression pack: auth, assets consistency, market polling stability.

## 8. Execution Plan by Phase

| Phase | Owner chính | Deliverables | Exit Criteria |
|---|---|---|---|
| Phase 1 - Backend Foundation | BE | Migration + repo + matching + trading APIs | API happy path pass + RLS pass + balance atomicity pass |
| Phase 2 - Chart Integration | FE | `TradingChartCanvas` + chart replace + theme | Chart render ổn định đa timeframe, không leak khi unmount |
| Phase 3 - Market Data Integration | FE + BE | market APIs mới + `useMarketData` + bind vào header/orderbook/trades | Dữ liệu update 10s, không còn mock data ở 3 block |
| Phase 4 - Trading Form Integration | FE + BE | `useUserBalances` + submit order thật + validation/notification | Place order end-to-end pass (market + limit) |
| Phase 5 - Open Orders Management | FE + BE | `useOrderManagement` + cancel + history tab | Open/cancel/history flow pass với data thật |
| Phase 6 - Hardening & Release | FE + QA + Ops | lỗi/loading/perf/mobile + release checklist | Không còn P0/P1 blocker, sign-off đủ vai trò |

## 9. API Contract Baseline (for FE/QA alignment)

### Existing APIs (reuse)
- `GET /api/v1/market/tickers`
- `GET /api/v1/market/kline?symbol=BTCUSDT&interval=1h`
- `GET /api/v1/market/price/:symbol`
- `GET /api/v1/user/assets`

### New APIs (P0)
- `GET /api/v1/market/orderbook?symbol=BTCUSDT&depth=20`
- `GET /api/v1/market/trades?symbol=BTCUSDT&limit=50`
- `POST /api/v1/trading/orders`
- `GET /api/v1/trading/orders?status=open&symbol=BTCUSDT&limit=50&offset=0`
- `DELETE /api/v1/trading/orders/:id`
- `GET /api/v1/trading/trades?symbol=BTCUSDT&limit=50&offset=0`

### Error code baseline (P0 minimum)
- `TRADING_UNAUTHORIZED`
- `TRADING_INVALID_SYMBOL`
- `TRADING_INVALID_ORDER_TYPE`
- `TRADING_INVALID_AMOUNT`
- `TRADING_INVALID_PRICE`
- `TRADING_INSUFFICIENT_BALANCE`
- `TRADING_ORDER_NOT_FOUND`
- `TRADING_ORDER_NOT_CANCELLABLE`
- `TRADING_INTERNAL_ERROR`

### Contract ownership note
- Schema DB và API response schema chi tiết do BE define trong implementation docs.
- BA review cùng BE để bảo đảm khớp nghiệp vụ và AC, không để drift với plan này.

## 10. Data Model Baseline
- `spot_orders`:
  - core fields: `user_id`, `symbol`, `side`, `type`, `status`, `price`, `amount`, `filled_amount`, `time_in_force`, timestamps.
- `spot_trades`:
  - core fields: `order_id`, `user_id`, `symbol`, `side`, `price`, `amount`, `fee`, `fee_asset`, `executed_at`.
- Atomicity requirement:
  - cập nhật order/trade/balance phải nằm trong transaction để tránh lệch số dư.

## 11. QA Test Pack Breakdown
- API Contract Pack:
  - auth guard, validation errors, success payload shape, pagination/filter correctness.
- Trading Core Pack:
  - market buy/sell, limit order lifecycle, cancel open order.
- Balance Integrity Pack:
  - debit/credit chính xác sau execution, không double update khi retry.
- UI Runtime Pack:
  - chart render/refresh, orderbook/trades refresh, form validation, open orders/history consistency.
- Resilience Pack:
  - network failure, API timeout, stale UI state, retry behavior.

## 11.1 BA Test Cases for QA (Phase 1 baseline)
- TC-API-001 Place Market Buy Success:
  - Precondition: user có đủ `USDT` trading balance.
  - Step: `POST /api/v1/trading/orders` với `side=buy`, `type=market`, `amount>0`.
  - Expected: `200/201`, trả `orderId`, status execution hợp lệ, có trade record tương ứng.
- TC-API-002 Place Market Sell Success:
  - Precondition: user có đủ token base asset.
  - Step: submit market sell hợp lệ.
  - Expected: order/trade được ghi nhận, balance cập nhật đúng chiều.
- TC-API-003 Limit Order Open:
  - Precondition: giá limit chưa khớp ngay.
  - Step: submit `type=limit` với `price` hợp lệ.
  - Expected: order status `open`, chưa tạo trade ngay.
- TC-API-004 Cancel Open Order:
  - Precondition: có order `open` thuộc user.
  - Step: `DELETE /api/v1/trading/orders/:id`.
  - Expected: API success, order không còn trong open-orders list.
- TC-API-005 Unauthorized Access:
  - Step: gọi trading APIs không có token hoặc token sai.
  - Expected: trả lỗi auth đúng `error.code` (theo contract BE publish).
- TC-API-006 Insufficient Balance:
  - Step: submit order vượt available balance.
  - Expected: request bị từ chối, không tạo order/trade, balance không đổi.
- TC-API-007 Data Isolation:
  - Step: user A thử truy cập/hủy order của user B.
  - Expected: bị chặn bởi auth/RLS, không lộ dữ liệu.
- TC-API-008 Precision and Atomicity:
  - Step: chạy order với decimal amount và kiểm tra kết quả DB.
  - Expected: không sai lệch precision, không có trạng thái nửa chừng order/trade/balance.

## 12. Risks and Decisions
- Risks:
  - R1: Race condition khi concurrent orders cập nhật cùng một asset balance.
  - R2: Polling nhiều nguồn gây spike request hoặc dữ liệu lệch nhịp hiển thị.
  - R3: Binance rate-limit hoặc lỗi upstream ảnh hưởng UX real-time.
  - R4: Scope creep sang stop-limit hoàn chỉnh làm trễ go-live.
- Decisions (lock cho v1.0):
  - D1: Realtime strategy dùng polling 10s (không WebSocket trong P0).
  - D2: Matching engine mô phỏng nội bộ, chưa kết nối external exchange.
  - D3: Ưu tiên market + limit cho go-live; stop-limit để P2.
  - D4: Mọi hiển thị số dư/form submit phải dùng data thật từ APIs runtime.
  - D5: Fee policy MVP = non-fee (`platformFee = 0`), chưa thu phí giao dịch ở bản MVP.
  - D6: Schema DB do BE tự define và chịu trách nhiệm technical documentation.
  - D7: BA + BE đồng sở hữu phần business rules/contract alignment trước khi FE tích hợp.

## 13. Timeline and Critical Path
- Timeline estimate: 7-11 ngày làm việc.
- Critical path: Phase 1 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6.
- Parallel track: Phase 2 có thể chạy song song với Phase 1.

## 14. Release Gate Checklist
- BA:
  - Scope P0/P1/P2 đã lock.
  - AC đã testable và mapping đầy đủ với API/UI.
- FE:
  - Không còn mock data trong các block spot chính.
  - UI states đầy đủ: loading/empty/error/stale.
- BE:
  - APIs trading hoạt động ổn định, error codes nhất quán.
  - Transactional integrity pass.
- QA:
  - Trading core + regression pack pass.
  - Không còn defect P0/P1 mở.
- Ops/PM:
  - Có rollback plan và monitoring window sau release.

## 14.1 Phase 1 Execution Order (Who does what)
1. BA:
  - Publish `Phase 1 Contract Brief`: rule nghiệp vụ, state transitions, AC mapping, QA test cases baseline.
2. BE:
  - Define schema + migration + repository/service/API contracts chi tiết.
  - Publish technical doc ngắn cho schema/API/error map sau khi lock.
3. BA + BE:
  - Joint review 1 vòng để chốt behavior cuối (đúng nghiệp vụ + khả thi kỹ thuật).
4. QA:
  - Dựa vào BA test cases + BE contract để chuẩn bị/execute API contract tests Phase 1.
5. FE:
  - Chưa tích hợp full; chỉ chuẩn bị interface mapping theo contract đã lock để giảm rework.
6. BA:
  - Xác nhận Phase 1 exit criteria đạt trước khi chuyển qua Phase 2/3.

## 15. Definition of Done (Plan Level)
- End-to-end flow `view market data -> place order -> see open order/trade history -> cancel order` chạy được với dữ liệu runtime.
- Security baseline đạt: auth guard + RLS đúng user ownership.
- Performance baseline đạt theo KPI và không có blocker go-live.
- Handoff docs đủ cho FE/BE/QA triển khai không cần suy diễn thêm.

## 16. FE + QA Execution Update (2026-04-06)
- FE + QA đã vào thực thi Phase 1 theo contract đã lock.
- Kết quả đã ghi tại:
  - `docs/features/Market/005-spot-trading-fe-qa-phase1-execution-v1.0.md`

### 16.1 Current Status
- PASS:
  - Build + db verification.
  - Public market endpoints (`orderbook`, `trades`) happy path + negative params.
  - Trading auth guard (`TRADING_UNAUTHORIZED`) cho các endpoint chính.
  - Trading authenticated read endpoints (`GET /trading/orders`, `GET /trading/trades`) sau khi apply migration `011`.
  - Trading validation errors (`TRADING_INVALID_SYMBOL`, `TRADING_INVALID_TIME_IN_FORCE`, `TRADING_INSUFFICIENT_BALANCE`).
  - Trading happy path sau khi seed test balance:
    - market buy/sell success (`filled`, fee = `0`)
    - limit order open (`GTC`)
    - cancel open order success
    - cancel non-open trả `TRADING_ORDER_NOT_CANCELLABLE`
  - Spot trading route shell render.
- BLOCKED:
  - Ghi nhận environment issue đã xử lý: trước khi apply migration `011`, trading APIs có auth trả `500` do thiếu `spot_orders/spot_trades`.

### 16.2 Next Step Order (Locked)
1. BE xử lý warning Next.js async params tại route delete order.
2. FE verify UI end-to-end submit/cancel/history trên token test và chốt regression.
3. BA xác nhận exit criteria Phase 1 rồi chuyển Phase 2/3 theo kế hoạch.
