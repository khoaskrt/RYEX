# [Wallet APIs] - BE Handoff Pack for FE/QA (v1.0)

## 1) Muc tieu handoff
- FE/QA xac thuc lai contract APIs tu BE truoc khi bat dau integration UI va test full flow.
- Giam rui ro FE code theo contract sai hoac QA test sai expectation.

## 2) Scope BE da san sang
- `POST /api/v1/wallet/deposit-address`
- `GET /api/v1/wallet/deposit-address`
- `POST /api/v1/wallet/withdraw`
- `GET /api/v1/wallet/transactions`

## 3) Auth + Header standards
- Tat ca APIs wallet deu yeu cau:
  - `Authorization: Bearer <access_token>`
- Withdraw khuyen nghi gui them:
  - `x-idempotency-key: <unique_key_per_click>`

## 4) Contract freeze summary
- Chain/token MVP:
  - `chain = bsc_testnet`
  - `symbol = USDT`
- Error shape freeze:
```json
{
  "error": {
    "code": "...",
    "message": "...",
    "requestId": "..."
  }
}
```
- Numeric values (`amount`, `fees`, `balances`) tra ve dang string.

## 5) API samples
### 5.1 POST /api/v1/wallet/deposit-address
Request body:
```json
{
  "chain": "bsc_testnet",
  "symbol": "USDT"
}
```
Success 200 (sample):
```json
{
  "address": "0x...",
  "network": "BSC Testnet",
  "symbol": "USDT",
  "contractAddress": "0x...",
  "requiredConfirmations": 12,
  "estimatedArrival": "Du kien 1-10 phut trong dieu kien mang binh thuong",
  "createdAt": "2026-04-03T...Z"
}
```

### 5.2 GET /api/v1/wallet/deposit-address?chain=bsc_testnet
Success 200: cung shape voi POST.
Error 404:
- `WALLET_NOT_FOUND`

### 5.3 POST /api/v1/wallet/withdraw
Headers:
- `x-idempotency-key: wd-<timestamp-or-uuid>`

Request body:
```json
{
  "chain": "bsc_testnet",
  "symbol": "USDT",
  "toAddress": "0x...",
  "amount": "50.00000000",
  "accountType": "funding"
}
```
Success 200 (sample):
```json
{
  "transactionId": "...",
  "status": "pending",
  "requestedAmountUSDT": "50.00000000",
  "platformFeeUSDT": "0",
  "networkFeeBNB": "0.00000000",
  "receiveAmountUSDT": "50.00000000",
  "estimatedTime": "Du kien 1-10 phut trong dieu kien mang binh thuong",
  "submittedAt": "2026-04-03T...Z"
}
```

### 5.4 GET /api/v1/wallet/transactions?type=all&status=all&limit=20&offset=0
Success 200 (sample):
```json
{
  "transactions": [
    {
      "transactionId": "...",
      "type": "withdraw",
      "symbol": "USDT",
      "amount": "50.00000000",
      "status": "pending"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

## 6) Error code map FE/QA can lock
- Auth:
  - `WALLET_UNAUTHORIZED` (401)
- Deposit:
  - `WALLET_UNSUPPORTED_CHAIN` (400)
  - `WALLET_UNSUPPORTED_SYMBOL` (400)
  - `WALLET_NOT_FOUND` (404)
  - `WALLET_CREATION_FAILED` (500)
- Withdraw:
  - `WITHDRAW_INVALID_ADDRESS` (400)
  - `WITHDRAW_INVALID_ACCOUNT_TYPE` (400)
  - `WITHDRAW_INVALID_AMOUNT` (400)
  - `WITHDRAW_AMOUNT_TOO_SMALL` (400)
  - `WITHDRAW_AMOUNT_TOO_LARGE` (400)
  - `WITHDRAW_INSUFFICIENT_BALANCE` (400)
  - `WITHDRAW_LIMIT_EXCEEDED` (400)
  - `WITHDRAW_RATE_LIMIT` (429)
  - `WITHDRAW_DUPLICATE_REQUEST` (409)
- Transactions:
  - `WALLET_INVALID_FILTER` (400)
  - `WALLET_INVALID_PAGINATION` (400)

## 7) FE pre-integration validation checklist
- [ ] Goi POST deposit-address voi token hop le -> 200 + payload dung shape.
- [ ] Goi GET deposit-address khi chua co wallet -> 404 `WALLET_NOT_FOUND`.
- [ ] Goi withdraw voi input invalid -> dung `error.code` theo matrix.
- [ ] Goi transactions voi filter/pagination -> dung payload + pagination.
- [ ] Verify UI copy map dung tung `error.code` (khong parse message tu do).

## 8) QA pre-test validation checklist
- [ ] Unauthorized test cho 4 APIs -> 401 `WALLET_UNAUTHORIZED`.
- [ ] Contract shape test cho 4 APIs (happy + error).
- [ ] Idempotency test: cung `x-idempotency-key` submit 2 lan -> lan sau 409 `WITHDRAW_DUPLICATE_REQUEST`.
- [ ] Numeric fields xac nhan dang string.
- [ ] Log safety: khong lo `private key`/`encrypted key` trong API payload.

## 9) Handoff status
- Status: `READY_FOR_FE_QA_VALIDATION`
- Expected next step:
  - FE/QA chay validation checklist muc 7-8.
  - Neu pass -> bat dau integration UI + QA contract/e2e test.

## 10) QA test template
- QA dung template nay de ghi ket qua pass/fail:
  - `docs/features/Wallet/003-qa-contract-test-template-v1.0.md`
