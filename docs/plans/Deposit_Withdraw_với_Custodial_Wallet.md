# [BSC USDT Deposit/Withdraw with Custodial Wallet] - BA Brief (v1.2)

## 1. Problem Framing
- Business goal:
  - Mở luong nap/rut USDT that tren BSC Testnet cho webapp RYEX thay vi mock data.
  - Tao nen tang van hanh custodial wallet de co the mo rong sang mainnet sau khi MVP on dinh.
- User pain:
  - User hien khong the nap/rut that, khong theo doi duoc trang thai giao dich blockchain.
  - So du tren Funding/History khong dong bo voi giao dich ben ngoai.
- KPI:
  - `Deposit detection SLA`: >= 95% lenh nap du dieu kien duoc credit trong <= 10 phut.
  - `Withdraw success rate`: >= 98% withdraw request hop le duoc broadcast thanh cong.
  - `API reliability`: p95 response cho wallet APIs < 800ms (khong tinh background processing).
  - `Data integrity`: 0 truong hop double-credit/double-debit tren cung mot su kien chain.

## 2. Scope
- In-scope P0 (must-have cho MVP):
  - Chi ho tro `USDT` tren `bsc_testnet`.
  - Moi user co 1 deposit address duy nhat theo chain.
  - API tao/lay deposit address:
    - `POST /api/v1/wallet/deposit-address`
    - `GET /api/v1/wallet/deposit-address`
  - API submit withdraw:
    - `POST /api/v1/wallet/withdraw`
  - API lich su:
    - `GET /api/v1/wallet/transactions`
  - DB baseline:
    - `user_wallets`
    - `wallet_transactions`
    - `deposit_monitor_state`
    - `withdraw_limits`
  - Co co che idempotency cho deposit credit/debit de tranh ghi nhan trung.
  - Co co che run background processing kha thi voi runtime thuc te (worker/cron), khong phu thuoc vong lap trong request lifecycle.
  - Dong bo so du vao `public.user_assets` account_type `funding`.
- In-scope P1 (next increment, sau khi P0 on dinh):
  - `GET /api/v1/wallet/balances` cho debug/ops.
  - Explorer deep link trong UI history.
  - Retry policy + operational dashboard cho failed/pending bat thuong.
- In-scope P2 (post-MVP):
  - 2FA step-up cho withdraw.
  - Address whitelist.
  - Multi-chain/multi-token.
- Out-of-scope:
  - Mainnet rollout.
  - Auto transfer giua `trading` va `funding`.
  - Custody hardening cap KMS/HSM production-grade (chi ghi roadmap).
  - OTC/P2P settlement flows.

## 3. Runtime Gap
- Gap-01: UI/flow hien tai dang mock.
  - Expected behavior:
    - Deposit/Withdraw/History hien data that theo wallet APIs.
  - Current behavior:
    - Deposit/Withdraw/History su dung mock constants tai `src/features/*` va chua goi wallet APIs.
  - Proposed resolution:
    - FE thay mock datasource bang call APIs wallet, giu layout hien tai, bo sung loading/error/empty theo contract.
- Gap-02: Chua co wallet API/domain module.
  - Expected behavior:
    - Co wallet domain layer + API routes theo contract.
  - Current behavior:
    - Chi co user assets API; chua co `src/server/wallet/*` va `src/app/api/v1/wallet/*`.
  - Proposed resolution:
    - Tao module wallet domain + API routes node runtime.
- Gap-03: Chua co execution model cho background processing.
  - Expected behavior:
    - Deposit monitor + withdraw processor chay on dinh 24/7.
  - Current behavior:
    - Chua co worker/cron stack duoc khai bao trong repo.
  - Proposed resolution:
    - Da chot mo hinh `Scheduler/Cron incremental processing` (tham chieu Section 7 - D-01).
- Gap-04: Data integrity/race condition chua duoc dinh nghia.
  - Expected behavior:
    - Khong double-credit/debit khi retry/reorg/concurrency.
  - Current behavior:
    - Chua co idempotency key + locking quy chuan trong plan cu.
  - Proposed resolution:
    - Them unique keys va transactional update cho `user_assets` + `wallet_transactions`.

## 4. User Stories
- US-01 (P0): As an authenticated user, toi muon xem dia chi nap USDT/BSC cua toi de chuyen USDT vao san.
- US-02 (P0): As an authenticated user, toi muon gui yeu cau rut USDT toi vi ben ngoai voi validation ro rang.
- US-03 (P0): As system, toi muon detect giao dich nap hop le va credit dung so du Funding mot lan duy nhat.
- US-04 (P0): As user, toi muon xem lich su nap/rut theo trang thai de theo doi tien trinh.
- US-05 (P1): As ops/admin, toi muon co signal canh bao khi queue xu ly bi ket hoac gas wallet thieu.

## 5. Acceptance Criteria (Given/When/Then)
- AC-01 Auth guard:
  - Given request khong co bearer token hop le
  - When goi bat ky wallet API nao
  - Then tra `401` voi `error.code = WALLET_UNAUTHORIZED`.
- AC-02 Tao/lay deposit address:
  - Given user da dang nhap va chua co wallet `bsc_testnet`
  - When goi `POST /api/v1/wallet/deposit-address`
  - Then he thong tao wallet, luu encrypted key, tra ve address va metadata chain/token.
- AC-03 Deposit address idempotent:
  - Given user da co wallet `bsc_testnet`
  - When goi lai `POST /api/v1/wallet/deposit-address`
  - Then tra ve cung 1 address da ton tai, khong tao them wallet moi.
- AC-04 Get deposit address:
  - Given user da co wallet
  - When goi `GET /api/v1/wallet/deposit-address?chain=bsc_testnet`
  - Then tra `200` voi address va createdAt.
- AC-05 Deposit detection:
  - Given co transfer USDT hop le toi deposit address cua user
  - When monitor process du confirmations da chot (MVP: 12)
  - Then tao record deposit `completed` va credit `user_assets` funding dung 1 lan.
- AC-06 Deposit idempotency:
  - Given cung mot su kien chain duoc scan lap lai do retry/restart
  - When xu ly credit
  - Then he thong khong duoc credit trung, state sau cung khong doi.
- AC-07 Submit withdraw:
  - Given user co du so du funding va input hop le
  - When goi `POST /api/v1/wallet/withdraw`
  - Then tao `wallet_transactions` status `pending` va tra `transactionId`.
- AC-08 Withdraw validation:
  - Given input withdraw vi pham rule
  - When submit
  - Then tra `400` voi `error.code` dung theo loi:
    - `WITHDRAW_INVALID_ADDRESS`
    - `WITHDRAW_AMOUNT_TOO_SMALL`
    - `WITHDRAW_AMOUNT_TOO_LARGE`
    - `WITHDRAW_INSUFFICIENT_BALANCE`
    - `WITHDRAW_LIMIT_EXCEEDED`.
- AC-09 Withdraw processing:
  - Given lenh withdraw `pending`
  - When processor sign va broadcast thanh cong
  - Then update tx hash, status `confirming/completed` theo rule, va tru so du funding atomically.
- AC-10 Withdraw failure handling:
  - Given broadcast loi hoac timeout
  - When processor xu ly that bai
  - Then update status `failed`, luu ly do loi, khong tru so du neu chua broadcast thanh cong.
- AC-11 Transaction history:
  - Given user da co giao dich
  - When goi `GET /api/v1/wallet/transactions` voi filter/pagination
  - Then tra danh sach dung user, dung thu tu moi nhat, va payload co pagination.
- AC-12 Secret safety:
  - Given moi API response/log
  - When tra du lieu wallet transaction
  - Then tuyet doi khong co `encrypted_key`, `private_key`, `authTag`, `iv`.
- AC-13 Precision safety:
  - Given amount token co 18 decimals
  - When tinh toan amount/fee/balance
  - Then khong duoc dung float JS cho business-critical math.
- AC-14 Navigation consistency:
  - Given user dang login
  - When di qua Assets/Deposit/Withdraw/History
  - Then funding nav/top nav duoc dong bo, khong lech state dieu huong.

## 6. Impact Map
- FE impact:
  - `src/features/deposit/*`: bo mock address/history, map API states.
  - `src/features/withdraw/*`: bo mock submit, map validation tu BE error codes.
  - `src/features/history/*`: map history API + pagination that.
  - `src/features/funding/*`: dam bao so du funding cap nhat sau nap/rut.
- BE impact:
  - Tao `src/server/wallet/*`:
    - `walletService`
    - `walletRepository`
    - `blockchainService`
    - `validation`
    - `encryption`
    - `depositMonitor`
    - `withdrawProcessor`.
  - Tao `src/app/api/v1/wallet/*` routes.
  - Tao migrations moi sau migration hien co de tranh drift.
  - Dinh nghia error-code matrix wallet API.
- QA impact:
  - Contract tests:
    - happy path
    - unauthorized
    - invalid input
    - insufficient balance
    - idempotency retry.
  - E2E testnet flow:
    - create deposit address -> send USDT -> auto credit -> withdraw -> verify history.
  - Regression:
    - auth session
    - `/api/v1/user/assets`
    - funding-related navigation consistency.

## 7. Risks + Decisions
- Risks:
  - Technical:
    - Background worker khong co host/runtime phu hop se gay miss SLA.
    - Scan theo balance change de double-credit neu khong co idempotency/ledger.
    - So hoc token dung float se sai so du.
  - Operational:
    - Gas wallet thieu BNB lam treo withdraw queue.
    - RPC downtime/lag lam cham detect deposit.
  - Security:
    - Custodial key co nguy co cao neu app key bi compromise.
  - Product:
    - Scope UI da dang chain/coin hien tai mau thuan voi MVP 1 chain/1 token.
- Decisions (Locked - Phase 0 sign-off on 2026-04-03):
  - D-01: Execution model = `Scheduler/Cron incremental processing` (khong dung long-running in-request loop).
    - Deposit scan job chay dinh ky, luu `last_scanned_block` de resume.
    - Withdraw processor job chay dinh ky, retry theo backoff.
  - D-02: Fee policy freeze cho MVP:
    - `networkFee` la phi mang bang `BNB` (chi de hien thi/ops), khong tru vao amount USDT user withdraw.
    - `platformFeeUSDT = 0` trong MVP testnet.
    - `receiveAmountUSDT = requestedAmountUSDT` khi `platformFeeUSDT = 0`.
  - D-03: Confirmation + UX SLA freeze:
    - `requiredConfirmations = 12`.
    - UX copy SLA: "Du kien 1-10 phut trong dieu kien mang binh thuong".
  - D-04: Idempotency strategy freeze:
    - Deposit uniqueness key: `(chain, tx_hash, log_index, to_address)` unique.
    - Withdraw submission idempotency: header `X-Idempotency-Key`, unique theo `(user_id, idempotency_key, action)` trong 24h.
    - Credit/debit `user_assets` bat buoc trong transaction atomically.
  - D-05: Release gate freeze:
    - Chi cho phep `bsc_testnet + USDT` cho MVP.
    - Mainnet = blocked cho den khi co KMS/HSM + 2FA withdraw + security review pass.

## 8. Delta (v1.2 vs v1.1)
- Changed:
  - Chot chinh thuc D-01..D-05 (pending -> locked).
  - Freeze API contract matrix cho wallet APIs (request/response/error.code).
  - Danh dau Phase 0 da sign-off voi timestamp.
- Reason:
  - Team can mot baseline contract da khoa de bat dau implement khong tranh cai lai scope.
- Impact:
  - BE/FE/QA co the trien khai ngay theo contract co dinh.
  - Giam scope drift va rework trong sprint.

## 9. Execution Workflow Theo Phase (BA -> BE -> FE -> QA -> Release)
| Phase | Muc tieu | Task chinh | Deliverable |
|---|---|---|---|
| Phase 0 - BA Alignment | Freeze scope P0 va contract first | Chot decisions D-01..D-05, freeze error code matrix, freeze payload shape | BA brief approved + API contract matrix + sprint backlog |
| Phase 1 - BE Foundation | Co du backend nen tang cho wallet | Tao migrations, tao wallet domain services, tao APIs deposit-address/withdraw/transactions | BE APIs chay duoc tren test env + migration apply pass |
| Phase 2 - BE Processing | Co dong bo chain -> DB -> user_assets | Implement deposit monitor + withdraw processor + idempotency + locking | End-to-end backend flow pass tren BSC testnet |
| Phase 3 - FE Integration | UI bo mock, noi API that | Deposit/Withdraw/History map API states + copy theo error.code | Web flows hoat dong voi data that |
| Phase 4 - QA Certification | Xac nhan contract va regression | Contract test, E2E testnet, negative tests, nav consistency tests | QA sign-off + bug report da triage |
| Phase 5 - Release Gate | Go-live testnet an toan | Release checklist, monitoring setup, rollback plan | Release note + production checklist pass |

## 10. Owner/Support Theo Tung Task
| Task ID | Task | Owner | Support | Output |
|---|---|---|---|---|
| T-01 | Freeze scope va contract wallet APIs | BA | BE Lead, FE Lead, QA Lead, PO | Scope freeze doc + API matrix |
| T-02 | Chot execution model background processing | BE Lead | BA, DevOps/Infra, PO | Worker/cron decision record |
| T-03 | Tao migrations `user_wallets/wallet_transactions/deposit_monitor_state/withdraw_limits` | BE | BA, QA | SQL migration files + apply log |
| T-04 | Implement `POST/GET deposit-address` | BE | FE, QA | API endpoints + error handling |
| T-05 | Implement `POST withdraw` + limits validation | BE | BA, QA | API endpoint + validation matrix |
| T-06 | Implement `GET transactions` + pagination/filter | BE | FE, QA | API endpoint + response samples |
| T-07 | Implement deposit monitor + idempotent credit `user_assets` | BE | QA | Processing worker + idempotency proof |
| T-08 | Implement withdraw processor + atomic debit | BE | QA | Processor worker + failure handling |
| T-09 | FE integrate Deposit page voi deposit-address API | FE | BE, QA | Updated Deposit UI states |
| T-10 | FE integrate Withdraw page voi withdraw API | FE | BE, QA | Updated Withdraw UI states |
| T-11 | FE integrate History page voi transactions API | FE | BE, QA | Updated History UI + pagination |
| T-12 | Contract test + E2E testnet + regression | QA | FE, BE | Test report + bug list |
| T-13 | Release readiness va go-live testnet | Release Manager/Tech Lead | QA, FE, BE, BA | Signed release checklist |

## 11. Input/Output Handoff Cho Moi Role
| Role | Input bat buoc | Output ban giao |
|---|---|---|
| BA | Product goal, user pain, constraints runtime, existing docs/code context | Scope freeze, AC Given/When/Then, priority P0/P1/P2, decision log, release gate criteria |
| BE | BA brief approved, API matrix, DB current truth, env requirements | APIs + domain services + migrations + processing jobs + runbook + sample responses |
| FE | BE API contract freeze, error code mapping, UX states specs | Updated UI integration (no mock), loading/error/empty/success states, tracking events |
| QA | BA AC + BE/FE deliverables + seeded test data | Contract test evidence, E2E report, regression report, blocker list, sign-off status |
| Release | QA sign-off, monitoring checklist, rollback plan | Release decision, deployment record, post-release observation report |

## 12. Entry/Exit Criteria De Team Bat Dau Ngay
| Phase | Entry criteria | Exit criteria |
|---|---|---|
| Phase 0 - BA Alignment | Co business goal + owner duoc assign | Scope P0/P1/P2 freeze, API contract freeze, decisions D-01..D-05 locked (Signed-off: 2026-04-03) |
| Phase 1 - BE Foundation | Scope freeze + env testnet available | Migrations apply pass, APIs core pass smoke test, security baseline pass |
| Phase 2 - BE Processing | Phase 1 done + test wallet funded | Deposit/withdraw processing pass E2E backend, idempotency check pass |
| Phase 3 - FE Integration | APIs stable tren test env + sample data | UI bo mock hoan tat, all AC FE pass, nav consistency pass |
| Phase 4 - QA Certification | FE/BE integration complete | Contract tests pass, E2E testnet pass, no open blocker severity high/critical |
| Phase 5 - Release Gate | QA sign-off + rollback plan ready | Release checklist pass, monitoring/alerts enabled, release approved |

## 13. API Contract Matrix (Frozen - 2026-04-03)
| API | Auth | Request | Success Response (shape) | Error Codes (freeze) |
|---|---|---|---|---|
| `POST /api/v1/wallet/deposit-address` | Bearer token required | `{ chain: "bsc_testnet", symbol: "USDT" }` | `{ address, network, symbol, contractAddress, requiredConfirmations, estimatedArrival, createdAt }` | `WALLET_UNAUTHORIZED`, `WALLET_CREATION_FAILED`, `WALLET_UNSUPPORTED_CHAIN` |
| `GET /api/v1/wallet/deposit-address` | Bearer token required | Query: `chain=bsc_testnet` | `{ address, network, symbol, requiredConfirmations, createdAt }` | `WALLET_UNAUTHORIZED`, `WALLET_NOT_FOUND`, `WALLET_UNSUPPORTED_CHAIN` |
| `POST /api/v1/wallet/withdraw` | Bearer token required | `{ chain: "bsc_testnet", symbol: "USDT", toAddress, amount, accountType: "funding" }` + `X-Idempotency-Key` | `{ transactionId, status, requestedAmountUSDT, platformFeeUSDT, networkFeeBNB, receiveAmountUSDT, estimatedTime, submittedAt }` | `WALLET_UNAUTHORIZED`, `WITHDRAW_INVALID_ADDRESS`, `WITHDRAW_AMOUNT_TOO_SMALL`, `WITHDRAW_AMOUNT_TOO_LARGE`, `WITHDRAW_INSUFFICIENT_BALANCE`, `WITHDRAW_LIMIT_EXCEEDED`, `WITHDRAW_RATE_LIMIT`, `WITHDRAW_DUPLICATE_REQUEST` |
| `GET /api/v1/wallet/transactions` | Bearer token required | Query: `type`, `status`, `limit`, `offset` | `{ transactions: [], pagination: { total, limit, offset } }` | `WALLET_UNAUTHORIZED`, `WALLET_INVALID_PAGINATION` |

### Contract Notes (Frozen)
- Chain/token freeze: chi nhan `chain = bsc_testnet`, `symbol = USDT` cho MVP.
- Numeric fields tra ve dang string (`amount`, `fees`, `balances`) de tranh precision drift.
- `networkFeeBNB` la thong tin phi mang, khong tru vao `requestedAmountUSDT` trong MVP.
- Moi error response follow shape:
  - `{ error: { code, message, requestId } }`.

## 14. Phase 0 Sign-off Record
- Status: `DONE`
- Signed date: `2026-04-03`
- Scope freeze:
  - P0/P1/P2 da khoa theo Section 2.
- Decisions locked:
  - D-01..D-05 da khoa theo Section 7.
- Contract freeze:
  - API matrix da khoa theo Section 13.
- Next executable task:
  - `T-03` (BE tao migrations wallet baseline) bat dau ngay.
