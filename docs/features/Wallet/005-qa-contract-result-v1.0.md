# [Wallet APIs] - QA Contract Test Result (v1.1)

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
| Deposit on-chain BSC testnet | BLOCKED | Chua co funded sender + transaction that tren testnet trong run nay |
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
- E2E testnet: `BLOCKED` o buoc transfer on-chain that.

## 8) Recommendation
- Recommendation: `CONDITIONAL GO`
- Dieu kien de len `GO`:
  1. QA thuc hien transfer on-chain that tren BSC testnet cho luong deposit.
  2. Attach evidence tx hash testnet + xac nhan credit/withdraw/history sau transfer that.
  3. Release Manager/Tech Lead sign-off monitoring/rollback checklist.
