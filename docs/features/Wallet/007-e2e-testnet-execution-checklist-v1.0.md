# [Wallet APIs] - E2E Testnet Execution Checklist (v1.0)

## 1) Muc tieu
- Chay 1 lan full flow that tren testnet de dong blocker Item `T-07/T-08/T-12`:
  - `create deposit address -> transfer on-chain -> auto credit funding -> withdraw -> history verify`
- Thu thap evidence du de BA + Release Manager chot `GO`.

## 2) Owner / Support
| Role | Trach nhiem |
|---|---|
| QA (Owner) | Dieu phoi test, ghi log evidence, ket luan PASS/FAIL/BLOCKED |
| BE (Support) | Ho tro monitor processor/internal routes, check DB consistency |
| FE (Support) | Verify UI state + history render + error mapping |
| BA (Support) | Verify traceability `Goal -> AC -> Evidence` |

## 3) Entry Criteria (bat buoc truoc khi chay)
- `npm run build` = PASS.
- `npm run db:verify` = PASS.
- Env da set:
  - `WALLET_ENCRYPTION_KEY` (64-char hex)
  - `WALLET_INTERNAL_API_KEY` (neu goi internal processor route)
- Co QA account A (receiver) dang co session token hop le.
- Co sender wallet tren BSC testnet da duoc faucet BNB + co USDT testnet de transfer.
- Co truy cap BSC testnet explorer (`https://testnet.bscscan.com`).

## 4) Test Data Setup
| Field | Gia tri mau |
|---|---|
| Chain | `bsc_testnet` |
| Symbol | `USDT` |
| Deposit amount test | `15.00000000` USDT |
| Withdraw amount test | `10.00000000` USDT |
| Confirmations target | `12` |
| Idempotency key | `e2e-wd-<timestamp>` |

## 5) Execution Steps (run 1 phat)

### Step 1 - Tao deposit address (API + UI)
- API:
  - `POST /api/v1/wallet/deposit-address` body `{ "chain":"bsc_testnet", "symbol":"USDT" }`
- Expected:
  - `200`, co `address`, `network`, `requiredConfirmations`.
- Evidence bat buoc:
  - JSON response + screenshot UI `/app/deposit` hien dung address.

### Step 2 - Transfer that on-chain vao deposit address
- Tu sender wallet, transfer `15 USDT` den address o Step 1.
- Capture:
  - `txHash`.
  - explorer URL transaction.
- Expected:
  - Tx duoc mined tren BSC testnet.
- Evidence bat buoc:
  - Link explorer + screenshot trang tx (status success, to_address dung).

### Step 3 - Chay deposit monitor processor
- Goi internal route (hoac scheduler neu da setup):
  - `POST /api/v1/wallet/internal/deposit-monitor`
  - Header: `x-wallet-internal-key: <WALLET_INTERNAL_API_KEY>`
  - Body event tuple:
```json
{
  "events": [
    {
      "chain": "bsc_testnet",
      "symbol": "USDT",
      "txHash": "<TX_HASH_STEP_2>",
      "logIndex": <LOG_INDEX>,
      "toAddress": "<DEPOSIT_ADDRESS>",
      "fromAddress": "<SENDER_ADDRESS>",
      "amount": "15.00000000",
      "blockNumber": <BLOCK_NUMBER>,
      "confirmations": 12
    }
  ]
}
```
- Expected:
  - Call 1: `credited=1`
  - Call 2 (same tuple): `duplicate=1` (idempotent).
- Evidence bat buoc:
  - Response JSON lan 1 + lan 2.
  - DB snapshot:
    - `wallet_transactions` chi 1 row theo tuple `(chain, tx_hash, log_index, to_address)`
    - `user_assets` funding tang dung +15.

### Step 4 - Verify UI sau credit
- Mo `/app/history` + `/app/deposit`.
- Expected:
  - Co transaction deposit status hop le.
  - Balance funding tren UI cap nhat dung.
- Evidence bat buoc:
  - Screenshot balance + row history deposit.

### Step 5 - Tao withdraw request
- API:
  - `POST /api/v1/wallet/withdraw`
  - Header: `x-idempotency-key: e2e-wd-<timestamp>`
  - Body amount `10.00000000` USDT.
- Expected:
  - `200`, `status=pending`, amount fields dang string.
- Evidence bat buoc:
  - JSON response + transactionId.

### Step 6 - Chay withdraw processor
- Goi internal route:
  - `POST /api/v1/wallet/internal/withdraw-processor` body `{ "limit": 20 }`
- Expected:
  - pending -> completed
  - Funding balance giam dung `10` USDT
  - `tx_hash` duoc set
- Evidence bat buoc:
  - Response JSON processor.
  - DB snapshot transaction status + balance truoc/sau.

### Step 7 - Verify history + contract final
- API:
  - `GET /api/v1/wallet/transactions?type=all&status=all&limit=20&offset=0`
- Expected:
  - Co ca deposit + withdraw records.
  - Numeric fields dang string.
- UI:
  - `/app/history` render dung status/amount/type.
- Evidence bat buoc:
  - API payload + screenshot history table.

## 6) Exit Criteria (de danh PASS)
- Full flow Step 1 -> Step 7 hoan thanh khong FAIL logic.
- Deposit idempotency proof dat:
  - same tuple khong double-credit.
- Withdraw atomic debit proof dat:
  - balance tru dung 1 lan, status completed.
- Contract freeze dat:
  - numeric fields trong wallet payload dang string.
- Co du evidence files/link/screenshots theo muc 5.

## 7) BLOCKED Rules
- Danh `BLOCKED` khi:
  - Khong co sender testnet funded.
  - Khong lay duoc `txHash/logIndex/blockNumber` tren explorer.
  - Thieu env key (`WALLET_ENCRYPTION_KEY`, `WALLET_INTERNAL_API_KEY`).
- Khong duoc danh `BLOCKED` neu la loi logic API/business.

## 8) Output mau sau khi chay
- Tao file ket qua: `docs/features/Wallet/008-e2e-testnet-result-v1.0.md`
- Mau report nhanh:
```md
### E2E Testnet Run - 2026-04-03
- Owner: QA
- Support: BE, FE
- Result: PASS | FAIL | BLOCKED
- TxHash deposit:
- TxHash withdraw:
- Balance before/after:
- Idempotency proof:
- Contract shape check:
- Residual risk:
- Recommendation: GO | CONDITIONAL GO | NO-GO
```
