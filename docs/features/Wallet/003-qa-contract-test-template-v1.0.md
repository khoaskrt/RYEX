# [Wallet APIs] - QA Contract Test Template (v1.0)

## 1) Huong dan su dung
- Muc tieu: QA xac thuc contract APIs truoc khi FE integrate full UI.
- Cach dung:
  - Tao 1 file result rieng (vd: `010-qa-contract-result-v1.0.md`) copy y nguyen bang duoi day.
  - Dien `Actual`, `Status`, `Evidence` cho tung case.
  - `Status`: `PASS` | `FAIL` | `BLOCKED`.

## 2) Environment + Test Data
| Field | Value | Note |
|---|---|---|
| Env URL | `<to_be_filled>` | Base URL QA env |
| QA User | `<to_be_filled>` | User co quyen truy cap app |
| Token source | `<to_be_filled>` | Supabase session token |
| Chain | `bsc_testnet` | Freeze |
| Symbol | `USDT` | Freeze |
| Test time window | `<to_be_filled>` | UTC+7 |

## 3) Contract Test Cases
| ID | API | Scenario | Request | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| WALLET-CT-01 | `POST /wallet/deposit-address` | Auth missing | No bearer token | `401`, `WALLET_UNAUTHORIZED` |  |  |  |
| WALLET-CT-02 | `POST /wallet/deposit-address` | Unsupported chain | `{ chain: "eth_mainnet", symbol: "USDT" }` | `400`, `WALLET_UNSUPPORTED_CHAIN` |  |  |  |
| WALLET-CT-03 | `POST /wallet/deposit-address` | Unsupported symbol | `{ chain: "bsc_testnet", symbol: "BTC" }` | `400`, `WALLET_UNSUPPORTED_SYMBOL` |  |  |  |
| WALLET-CT-04 | `POST /wallet/deposit-address` | Happy path create/get | `{ chain: "bsc_testnet", symbol: "USDT" }` | `200`, payload shape dung, co `address` |  |  |  |
| WALLET-CT-05 | `GET /wallet/deposit-address` | Wallet not found user moi | Query `chain=bsc_testnet` | `404`, `WALLET_NOT_FOUND` |  |  |  |
| WALLET-CT-06 | `GET /wallet/deposit-address` | Happy path existing wallet | Query `chain=bsc_testnet` | `200`, cung `address` da tao |  |  |  |
| WALLET-CT-07 | `POST /wallet/withdraw` | Auth missing | No bearer token | `401`, `WALLET_UNAUTHORIZED` |  |  |  |
| WALLET-CT-08 | `POST /wallet/withdraw` | Invalid address | `toAddress` sai format | `400`, `WITHDRAW_INVALID_ADDRESS` |  |  |  |
| WALLET-CT-09 | `POST /wallet/withdraw` | Amount too small | amount < min | `400`, `WITHDRAW_AMOUNT_TOO_SMALL` |  |  |  |
| WALLET-CT-10 | `POST /wallet/withdraw` | Amount too large | amount > max | `400`, `WITHDRAW_AMOUNT_TOO_LARGE` |  |  |  |
| WALLET-CT-11 | `POST /wallet/withdraw` | Insufficient balance | amount > funding balance | `400`, `WITHDRAW_INSUFFICIENT_BALANCE` |  |  |  |
| WALLET-CT-12 | `POST /wallet/withdraw` | Happy path submit | body hop le + `x-idempotency-key` | `200`, status `pending`, payload dung shape |  |  |  |
| WALLET-CT-13 | `POST /wallet/withdraw` | Idempotency duplicate | lap lai cung `x-idempotency-key` | `409`, `WITHDRAW_DUPLICATE_REQUEST` |  |  |  |
| WALLET-CT-14 | `GET /wallet/transactions` | Invalid pagination | `limit=999` | `400`, `WALLET_INVALID_PAGINATION` |  |  |  |
| WALLET-CT-15 | `GET /wallet/transactions` | Invalid filter | `type=abc` | `400`, `WALLET_INVALID_FILTER` |  |  |  |
| WALLET-CT-16 | `GET /wallet/transactions` | Happy path list | `type=all&status=all&limit=20&offset=0` | `200`, `transactions[]`, `pagination` |  |  |  |

## 4) Payload Shape Assertions
| ID | Assertion | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|
| WALLET-SHAPE-01 | Error shape | `{ error: { code, message, requestId } }` |  |  |  |
| WALLET-SHAPE-02 | Deposit success shape | Co `address/network/symbol/requiredConfirmations/createdAt` |  |  |  |
| WALLET-SHAPE-03 | Withdraw success shape | Co `transactionId/status/requestedAmountUSDT/platformFeeUSDT/networkFeeBNB/receiveAmountUSDT/submittedAt` |  |  |  |
| WALLET-SHAPE-04 | Transactions shape | Co `transactions[]` + `pagination.total/limit/offset` |  |  |  |
| WALLET-SHAPE-05 | Numeric fields as string | `amount`, `fee`, `balance` dang string |  |  |  |

## 5) Security/Logging Checks
| ID | Check | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|
| WALLET-SEC-01 | Secret leakage response | Khong co `private_key/encrypted_key/auth_tag/iv` |  |  |  |
| WALLET-SEC-02 | Unauthorized behavior | Tat ca endpoint bao ve tra `WALLET_UNAUTHORIZED` |  |  |  |
| WALLET-SEC-03 | Request correlation | Error co `requestId` |  |  |  |

## 6) Summary
- Total cases: `<to_be_filled>`
- Pass: `<to_be_filled>`
- Fail: `<to_be_filled>`
- Blocked: `<to_be_filled>`
- Overall: `PASS` | `FAIL` | `BLOCKED`
- Notes:
  - `<to_be_filled>`
