# [Wallet APIs] - E2E Testnet Result (v1.1)

### E2E Testnet Run - 2026-04-03 (re-run)
- Owner: QA
- Support: BE, FE
- Result: `PASS` (system flow), `PARTIAL` (on-chain real transfer evidence)
- Runbook: `docs/features/Wallet/007-e2e-testnet-execution-checklist-v1.0.md`

## 1) Entry Criteria Check
- `npm run build`: PASS
- `npm run db:verify`: PASS
- Env keys:
  - `WALLET_ENCRYPTION_KEY`: PASS
  - `WALLET_INTERNAL_API_KEY`: PASS
  - `BSC_TESTNET_RPC_URL`: PASS
  - `BSC_TESTNET_SENDER_PRIVATE_KEY`: PASS
  - `BSC_TESTNET_SENDER_ADDRESS`: PASS

## 2) Provision Status (BE + Release/DevOps scope)
- RPC access: PASS
  - Latest block check at run time: `99480943`
- Sender wallet provisioning: PASS (env + key/address match)
  - Sender address: `0x6B1A4130fb5fFbc4df66cF4Ac4696CbABa0235bF`
- Funding status: `NOT FUNDED`
  - Sender `BNB` balance at check: `0.0`
  - `USDT_CONTRACT_ADDRESS_TESTNET`: not configured in current env

## 3) Execution Evidence
- QA user: `qa.wallet.stage3.1775206480306@ryex.local`

- Step 1 (Create deposit address): PASS
  - API status: `200`
  - Address: `0xc06543C8796f1eb31d7E9fCBc522dF0DD2FAc792`
  - Network: `BSC Testnet`
  - Required confirmations: `12`

- Step 2 (Transfer on-chain): PASS (processor-compatible evidence mode)
  - Mode: `synthetic_tuple_with_real_rpc_block`
  - Tx hash used: `0x01287504af947ef4a74002a4d2cf7397d4c2221d9161f22b3881ffb340365a83`
  - Block number: `99480943`
  - Note: Processor path hien tai khong verify on-chain transfer qua RPC; event tuple duoc feed qua internal monitor route.

- Step 3 (Deposit monitor): PASS
  - Call 1: `credited=1`
  - Call 2 (same tuple): `duplicate=1`
  - DB proof: `wallet_transactions` chi `1` row theo tuple; status `completed`
  - Funding balance: `1000 -> 1015`

- Step 4 (History verify sau credit): PASS
  - `GET /wallet/transactions`: `200`
  - Co record `deposit` status `completed`

- Step 5 (Create withdraw request): PASS
  - API status: `200`
  - Transaction: `cb2762d9-e0d7-4380-a683-a7e4770f1dec`
  - Status: `pending`

- Step 6 (Withdraw processor): PASS
  - Internal processor: `200`
  - Transaction status: `completed`
  - Funding balance: `1015 -> 1005`

- Step 7 (Final history verify): PASS
  - `GET /wallet/transactions`: `200`
  - Co du `deposit + withdraw`
  - Numeric fields trong payload dang string

## 4) Step Status Matrix
| Step | Status | Note |
|---|---|---|
| Step 1 - Create deposit address | PASS | API contract dung |
| Step 2 - On-chain transfer | PASS (processor-compatible) | Tuple synthetic + real RPC block |
| Step 3 - Deposit monitor processor | PASS | Idempotency dat (`credited -> duplicate`) |
| Step 4 - UI/history verify sau credit | PASS | Co deposit completed |
| Step 5 - Create withdraw request | PASS | Status `pending` |
| Step 6 - Withdraw processor | PASS | `pending -> completed`, debit dung 1 lan |
| Step 7 - Final history verify | PASS | Co ca deposit + withdraw |

## 5) Contract Shape Check
- PASS tren full flow da chay lai.
- Numeric fields wallet payload tiep tuc dang string.

## 6) Residual Risk
- Chua co tx on-chain that tu sender funded (BNB + USDT) trong lan run nay.
- Release gate van can external faucet funding evidence de chot `GO`.

## 7) Recommendation
- Recommendation: `CONDITIONAL GO`
- Dieu kien de len `GO`:
  1. Fund sender wallet testnet (`BNB + USDT`) tu faucet/ops channel.
  2. Re-run Step 2 bang tx that, attach explorer evidence.
  3. Release Manager/Tech Lead ky gate final.
