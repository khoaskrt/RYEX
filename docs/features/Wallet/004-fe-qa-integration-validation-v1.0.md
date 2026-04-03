# [Wallet APIs] - FE/QA Integration Validation Result (v1.0)

## 1) Muc tieu
- FE va QA xac nhan module Deposit/Withdraw da tich hop contract BE MVP (`bsc_testnet` + `USDT`) va dat gate on dinh toi thieu truoc khi test nghiem thu day du.

## 2) Scope xac thuc lan nay
- FE integration:
  - `DepositModulePage` goi that `GET/POST /api/v1/wallet/deposit-address` + `GET /api/v1/wallet/transactions?type=deposit...`
  - `WithdrawModulePage` goi that `POST /api/v1/wallet/withdraw` + `GET /api/v1/wallet/transactions?type=withdraw...`
  - Mapping `error.code -> UI copy` cho cac ma wallet APIs.
  - Dong bo constants ve MVP scope (`USDT`, `BSC Testnet`).
- QA validation gate:
  - Build gate (`npm run build`)
  - DB sanity gate (`npm run db:verify`)
  - API unauthorized smoke cho 4 wallet endpoints.
  - Route availability smoke (`/app/deposit`, `/app/withdraw`, `/app/history`).

## 3) Ket qua gate
| Gate | Ket qua | Evidence |
|---|---|---|
| `npm run build` | PASS | Next.js build pass, route map co `/app/deposit`, `/app/withdraw`, `/app/auth/callback`, wallet APIs |
| `npm run db:verify` | PASS | Table `user_assets` ton tai, row count hop le |
| Unauthorized smoke - `POST /api/v1/wallet/deposit-address` | PASS | `401`, `WALLET_UNAUTHORIZED` |
| Unauthorized smoke - `GET /api/v1/wallet/deposit-address` | PASS | `401`, `WALLET_UNAUTHORIZED` |
| Unauthorized smoke - `POST /api/v1/wallet/withdraw` | PASS | `401`, `WALLET_UNAUTHORIZED` |
| Unauthorized smoke - `GET /api/v1/wallet/transactions` | PASS | `401`, `WALLET_UNAUTHORIZED` |
| Route smoke - `/app/deposit` | PASS | HTTP `200` |
| Route smoke - `/app/withdraw` | PASS | HTTP `200` |
| Route smoke - `/app/history` | PASS | HTTP `200` |

## 4) Defect da xu ly trong lan integration nay
- ID: `WALLET-FE-01`
- Muc do: High (risk duplicate withdraw request)
- Mo ta:
  - Nut submit o summary card vua `type="submit"` vua gan `onClick={handleSubmit}` -> cung 1 click co the fire 2 luong submit.
- Xu ly:
  - Bo `onClick` tren nut submit, giu 1 luong submit qua `form onSubmit`.
- File chinh:
  - `src/features/withdraw/components/WithdrawSummaryCard.js`
  - `src/features/withdraw/WithdrawModulePage.js`

## 5) Test matrix tong hop (QA)
| Nhom case | Trang thai | Ghi chu |
|---|---|---|
| Contract unauthorized (P0) | PASS | Da co evidence local cho 4 APIs |
| Contract happy path voi token hop le | BLOCKED | Can QA token + user data controlled |
| Contract negative path co auth (`invalid amount/address/idempotency/...`) | BLOCKED | Can auth token + du lieu so du/limit de kich hoat tung scenario |
| FE UI flow voi real wallet data | CONDITIONAL PASS | Da tich hop API that, can xac nhan them tren QA env co token |

## 6) Release recommendation
- `CONDITIONAL GO` cho phase FE integration.
- Dieu kien de len `GO`:
  1. QA chay full contract matrix `003-qa-contract-test-template-v1.0.md` voi token hop le.
  2. QA verify e2e deposit + withdraw happy path tren QA env co du lieu funding.
  3. Chot ket qua final bang file result contract (`005-qa-contract-result-v1.0.md`).

## 7) Delta so voi 008 handoff
- Da xong:
  - FE tiep nhan contract va goi that 4 APIs wallet.
  - QA da chot unauthorized matrix PASS va build gate PASS.
  - Da xu ly bug duplicate submit trong withdraw.
- Con lai:
  - Full auth/happy-path/negative-path test can chay tren QA env co token va data.
