# [Wallet APIs] - QA Contract Test Result (v1.3)

## 1) Environment + Test Data
| Field | Value | Note |
|---|---|---|
| Env URL | `http://127.0.0.1:4030` | Local start (`next start`) |
| QA User A | `qa.wallet.a.<timestamp>@ryex.local` | User co wallet + funding |
| QA User B | `qa.wallet.b.<timestamp>@ryex.local` | User moi de test `WALLET_NOT_FOUND` |
| Token source | Supabase session token (`signInWithPassword`) | Tao tu test script |
| Chain | `bsc_testnet` | Freeze |
| Symbol | `USDT` | Freeze |
| Test time window | `2026-04-03 (UTC+7)` | Re-run full matrix |
| Seed data | `user_assets` funding = `1000` USDT | De test withdraw validations |

## 2) Contract Test Cases
| ID | Expected | Actual | Status |
|---|---|---|---|
| WALLET-CT-01 | `401`, `WALLET_UNAUTHORIZED` | `401`, `WALLET_UNAUTHORIZED` | PASS |
| WALLET-CT-02 | `400`, `WALLET_UNSUPPORTED_CHAIN` | `400`, `WALLET_UNSUPPORTED_CHAIN` | PASS |
| WALLET-CT-03 | `400`, `WALLET_UNSUPPORTED_SYMBOL` | `400`, `WALLET_UNSUPPORTED_SYMBOL` | PASS |
| WALLET-CT-04 | `200`, create deposit address | `200`, co `address` | PASS |
| WALLET-CT-05 | `404`, `WALLET_NOT_FOUND` | `404`, `WALLET_NOT_FOUND` | PASS |
| WALLET-CT-06 | `200`, existing address | `200`, dung address da tao | PASS |
| WALLET-CT-07 | `401`, `WALLET_UNAUTHORIZED` | `401`, `WALLET_UNAUTHORIZED` | PASS |
| WALLET-CT-08 | `400`, `WITHDRAW_INVALID_ADDRESS` | `400`, `WITHDRAW_INVALID_ADDRESS` | PASS |
| WALLET-CT-09 | `400`, `WITHDRAW_AMOUNT_TOO_SMALL` | `400`, `WITHDRAW_AMOUNT_TOO_SMALL` | PASS |
| WALLET-CT-10 | `400`, `WITHDRAW_AMOUNT_TOO_LARGE` | `400`, `WITHDRAW_AMOUNT_TOO_LARGE` | PASS |
| WALLET-CT-11 | `400`, `WITHDRAW_INSUFFICIENT_BALANCE` | `400`, `WITHDRAW_INSUFFICIENT_BALANCE` | PASS |
| WALLET-CT-12 | `200`, withdraw `pending` | `200`, `pending` | PASS |
| WALLET-CT-13 | `409`, `WITHDRAW_DUPLICATE_REQUEST` | `409`, `WITHDRAW_DUPLICATE_REQUEST` | PASS |
| WALLET-CT-14 | `400`, `WALLET_INVALID_PAGINATION` | `400`, `WALLET_INVALID_PAGINATION` | PASS |
| WALLET-CT-15 | `400`, `WALLET_INVALID_FILTER` | `400`, `WALLET_INVALID_FILTER` | PASS |
| WALLET-CT-16 | `200`, `transactions[]` + pagination | `200`, dung shape | PASS |

## 3) Payload Shape Assertions
| ID | Assertion | Actual | Status |
|---|---|---|---|
| WALLET-SHAPE-01 | Error shape `{ error: { code, message, requestId } }` | Dung shape | PASS |
| WALLET-SHAPE-02 | Withdraw success shape co day du keys contract | Dung shape | PASS |
| WALLET-SHAPE-03 | Numeric fields tra ve string | `requestedAmountUSDT/platformFeeUSDT/networkFeeBNB/receiveAmountUSDT/transactions[].amount` deu la string | PASS |

## 4) Security / Logging Checks
| ID | Check | Actual | Status |
|---|---|---|---|
| WALLET-SEC-01 | Khong lo secret fields (`private_key/encrypted_key/auth_tag/iv`) | Khong thay field nhay cam trong API payload | PASS |
| WALLET-SEC-02 | Unauthorized behavior | Dung `WALLET_UNAUTHORIZED` tren protected endpoints khi thieu token | PASS |
| WALLET-SEC-03 | Error request correlation | Error co `requestId` day du | PASS |

## 5) E2E Flow Status
Flow target: `create address -> deposit on-chain -> auto credit funding -> withdraw -> verify history`

| Step | Status | Notes |
|---|---|---|
| Create deposit address | PASS | Da pass qua CT04 |
| Deposit on-chain BSC testnet | PARTIAL PASS | Re-run Stage 3 da co tuple evidence + real block number; tx transfer that van pending funding |
| Auto credit funding sau confirmations | PASS (processor-level local proof) | Da co proof idempotent credit qua internal deposit monitor |
| Withdraw + verify history | PASS (processor-level local proof) | Da co proof pending->completed + atomic debit |

## 6) Build Gates
| Gate | Status |
|---|---|
| `npm run build` | PASS |
| `npm run db:verify` | PASS |

## 7) Summary
- Contract cases: `16/16 PASS`
- Shape assertions: `3/3 PASS`
- E2E testnet: `PARTIAL PASS` (full processor flow PASS, con thieu tx on-chain that tu sender funded).

## 8) Recommendation
- Recommendation: `CONDITIONAL GO`
- Dieu kien de len `GO`:
  1. Release/DevOps cap fund sender testnet (`BNB + USDT`) de tao transfer that.
  2. Attach evidence tx hash testnet + xac nhan credit/withdraw/history sau transfer that.
  3. Release Manager/Tech Lead sign-off monitoring/rollback checklist.

## 9) Re-run Snapshot (2026-04-03, local env audit)
- Trigger:
  - QA re-run theo yeu cau "ra soat lai toan bo do smooth/stable theo plan".
- Gates:
  - `npm run build`: PASS
  - `npm run db:verify`: PASS
- Wallet matrix (`scripts/run-wallet-matrix.mjs`, base `http://127.0.0.1:4030`):
  - Tong quan: `overall = FAIL`
  - Assertions: `4 PASS / 12 FAIL`
  - Shape checks: `1 PASS / 2 FAIL`
- Root cause:
  - Env key chua dat entry criteria:
    - `WALLET_ENCRYPTION_KEY`: missing (len=0, invalid 64-hex)
    - `WALLET_INTERNAL_API_KEY`: missing
  - Cac route `POST /api/v1/wallet/deposit-address` va `POST /api/v1/wallet/withdraw` tra `500 WALLET_ENV_INVALID`, dan den fail contract matrix.
- Classification:
  - Trang thai run nay: `BLOCKED` (environment blocker), khong du dieu kien ket luan smooth/stable tren local env hien tai.
- Recommendation cap nhat:
  - `NO-GO` cho local run nay cho den khi set dung wallet env keys theo release checklist va re-run matrix.

## 10) Stage 2 Re-run Snapshot (2026-04-03, 15:43 UTC / 22:43 ICT)
- Trigger:
  - Execute Stage 2 theo execution checklist: contract re-run sau khi Stage 1 unblock env.
- Gates:
  - `npm run build`: PASS
  - `npm run db:verify`: PASS
- Wallet matrix (`node --env-file=.env scripts/run-wallet-matrix.mjs`, base `http://127.0.0.1:4030`):
  - Tong quan: `overall = PASS`
  - Assertions: `16 PASS / 0 FAIL`
  - Shape checks: `3 PASS / 0 FAIL`
- Sample evidence:
  - QA users:
    - `qa.wallet.a.1775205781325@ryex.local`
    - `qa.wallet.b.1775205781325@ryex.local`
  - `WALLET-CT-12`: `200`, `status=pending`, numeric fields dang string.
  - `WALLET-CT-13`: `409 WITHDRAW_DUPLICATE_REQUEST`.
  - `WALLET-CT-16`: `200`, co `transactions[]` + `pagination`.
- Classification:
  - Stage 2 status: `PASS`.
- Recommendation cap nhat:
  - Release gate quay lai `CONDITIONAL GO`.
  - Dieu kien de len `GO`: hoan tat Chặng 3 (E2E testnet full flow co tx hash that) + sign-off release checklist.
