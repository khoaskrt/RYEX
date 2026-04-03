# [Wallet APIs] - Release Gate Checklist + Role Assignment (v1.4)

## 1) Muc tieu
- Tiep tuc follow next actions theo role den muc co the dong gate.
- Cap nhat trang thai tung task bang evidence run moi nhat.

## 2) Trang thai hien tai (update 2026-04-03, 22:45 ICT)
- BE: da hoan tat implementation processor + contract + env guard.
- FE: da re-verify mapping sau BE fix.
- QA: co 3 snapshot:
  - Snapshot truoc: matrix PASS.
  - Snapshot local env audit moi nhat: matrix FAIL do `WALLET_ENV_INVALID` (env blocker).
  - Snapshot Stage 3 re-run: flow Step 1->7 PASS (processor-level), con caveat on-chain tx that.
- Release: chua du dieu kien chot GO.
- Stage 1 status: DONE (env unblock completed, can move to Stage 2 contract re-run).
- Stage 2 status: DONE (matrix PASS lai, can move to Stage 3 E2E testnet).

## 3) Checklist theo task/role
| Item | Task ID | Owner | Support | Deliverable bat buoc | Ket qua moi nhat |
|---|---|---|---|---|---|
| 1 | `T-07` Deposit monitor + idempotent credit | BE | QA, BA | Scan/process deposit + idempotency tuple proof + credit funding | DONE |
| 2 | `T-08` Withdraw processor + atomic debit | BE | QA, BA | Processor `pending -> confirming/completed/failed` + atomic debit | DONE |
| 3 | Contract-shape fix (numeric as string) | BE | FE, QA | Numeric fields tra ve string theo freeze contract | DONE |
| 4 | Env hardening `WALLET_ENCRYPTION_KEY` | BE | Release, QA | Startup guard + env checklist | DONE (code + local env unblock) |
| 5 | FE re-verify mapping sau BE fix | FE | QA | Verify layout/state/loading/error/empty khong vo | DONE |
| 6 | Full QA matrix re-run | QA | BE, FE | `WALLET-CT-01..16` + shape assertions PASS | DONE (re-confirmed at Stage 2) |
| 7 | E2E testnet full flow | QA | BE | `create address -> deposit on-chain -> auto credit -> withdraw -> history` PASS | PARTIAL PASS (processor flow PASS, on-chain tx that chua co) |
| 8 | BA final traceability check | BA | QA, BE, FE | Map `Goal -> Story -> AC -> Evidence` | DONE (conditional by blocker item 7/9) |
| 9 | Release readiness gate | Release Manager/Tech Lead | QA, BE, FE, BA | Monitoring/alerts/rollback + final decision | IN_PROGRESS |

## 4) Evidence moi nhat

### QA matrix re-run (Item 6)
- Source of truth:
  - `docs/features/Wallet/005-qa-contract-result-v1.0.md` (co re-run snapshot 2026-04-03)
- Ket qua:
  - Snapshot truoc: `16/16 PASS`, shape `3/3 PASS`.
  - Snapshot local moi nhat: `4 PASS / 12 FAIL`, shape `1 PASS / 2 FAIL`.
  - Root cause local fail: thieu env keys wallet (`WALLET_ENCRYPTION_KEY`, `WALLET_INTERNAL_API_KEY`).

### BE processor proofs (Items 1-2)
- Deposit monitor:
  - same tuple call 2 lan -> lan 1 `credited`, lan 2 `duplicate`
  - funding chi tang 1 lan
- Withdraw processor:
  - pending withdraw duoc process thanh completed
  - funding debit atomically theo amount

### FE re-verify (Item 5)
- `npm run build` PASS
- Route smoke `/app/deposit`, `/app/withdraw`, `/app/history` PASS
- Mapping payload string khong vo luong hien thi chinh

## 5) Definition of Done status
| Task | DoD status | Note |
|---|---|---|
| `T-07` | PASS | Local proof da co day du |
| `T-08` | PASS | Local proof da co day du |
| `T-12` | PARTIAL PASS | Contract matrix PASS + Stage 3 processor flow PASS; con thieu tx on-chain that |
| `T-13` | IN_PROGRESS | Chua co release sign-off cuoi cung |

## 6) GO/NO-GO hien tai
- Decision hien tai (sau Stage 3 re-run): `CONDITIONAL GO`
- Dieu kien de len `GO`:
  1. Hoan tat E2E testnet transfer that (deposit on-chain) tu sender funded va attach explorer evidence.
  2. Release Manager/Tech Lead ky monitoring + rollback checklist.

## 7) Next actions (con lai)
1. Release/DevOps: cap fund sender wallet testnet (`BNB + USDT`) cho vi da provision.
2. QA + BE: re-run Step 2 bang tx on-chain that, attach explorer link + tx metadata.
3. BA: cap nhat traceability final theo evidence moi.
4. Release Manager/Tech Lead: review monitoring + rollback, ky gate cuoi.

## 8) Execution checklist theo chang (BA/BE/FE/QA support nhau)
| Chang | Deadline (ICT) | Owner | Support bat buoc | Viec can hoan tat | Output bat buoc | Exit criteria |
|---|---|---|---|---|---|---|
| 1. Unblock env | 2026-04-03 17:00 | BE Lead | DevOps, QA | Set `WALLET_ENCRYPTION_KEY` (64-hex) + `WALLET_INTERNAL_API_KEY`, restart app, smoke wallet POST routes | Evidence startup + 2 sample call khong con `WALLET_ENV_INVALID` | Env dat entry criteria runbook |
| 2. Contract re-run | 2026-04-03 18:00 | QA Lead | BE, FE | Chay `npm run build`, `npm run db:verify`, `node --env-file=.env scripts/run-wallet-matrix.mjs` | Matrix report moi trong `005-qa-contract-result-v1.0.md` | `WALLET-CT-01..16` PASS + shape PASS |
| 3. E2E testnet flow | 2026-04-03 21:00 | QA Lead | BE, FE | Chay full flow that theo runbook `007` | File ket qua `008-e2e-testnet-result-v1.0.md` + tx hash + API/DB/UI evidence | Step 1->7 PASS (hoac BLOCKED dung rule) |
| 4. FE re-verify | 2026-04-04 09:30 | FE Lead | QA | Re-verify `/app/deposit`, `/app/withdraw`, `/app/history`, check error.code mapping + nav consistency | FE verification note + screenshot | UI khong lech contract va khong vo state |
| 5. BA traceability final | 2026-04-04 10:30 | BA | QA, BE, FE | Chot map `Goal -> Story -> AC -> Evidence` | Traceability update trong docs Wallet | AC P0 co evidence day du |
| 6. Release gate final | 2026-04-04 11:30 | Release Manager/Tech Lead | BA, QA, BE, FE | Chot monitoring/alert/rollback va review open defects | Bien ban quyet dinh `GO | CONDITIONAL GO | NO-GO` | Khong con blocker High/Critical |

### Operating rule during execution
1. Tre > 30 phut o bat ky chang nao: owner phai bao blocker ngay trong kenh chung.
2. Neu Chang 2 FAIL vi logic (khong phai env): dung Chang 3, mo bug-fix loop BE + QA.
3. Chi ky `GO` khi Chang 3 co tx hash that va evidence day du.

## 9) Stage 1 execution evidence (2026-04-03)
- Owner executed: BE (support QA)
- Actions:
  - Added env keys in local `.env`:
    - `WALLET_ENCRYPTION_KEY` (64-hex, validated)
    - `WALLET_INTERNAL_API_KEY` (non-empty)
  - Restarted app and smoke-tested:
    - `POST /api/v1/wallet/deposit-address` (without token) -> `WALLET_UNAUTHORIZED`
    - `POST /api/v1/wallet/withdraw` (without token) -> `WALLET_UNAUTHORIZED`
- Result:
  - `WALLET_ENV_INVALID`: NOT OBSERVED in stage-1 smoke routes.
  - Stage 1 classification: `PASS`.

## 10) Stage 2 execution evidence (2026-04-03)
- Owner executed: QA (support BE, FE)
- Actions:
  - Re-ran mandatory gates:
    - `npm run build` -> PASS
    - `npm run db:verify` -> PASS
  - Re-ran matrix:
    - `node --env-file=.env scripts/run-wallet-matrix.mjs`
- Result summary:
  - `overall = PASS`
  - Assertions: `16 PASS / 0 FAIL`
  - Shape checks: `3 PASS / 0 FAIL`
- Stage 2 classification: `PASS`.

## 11) Stage 3 execution evidence (2026-04-03)
- Owner executed: QA (support BE, FE)
- Result:
  - Run 1: `BLOCKED` (thieu sender + RPC env)
  - Re-run: `PARTIAL PASS` (full processor flow PASS, con thieu tx on-chain that)
- Evidence file:
  - `docs/features/Wallet/008-e2e-testnet-result-v1.0.md`
- Step summary:
  - Re-run provisioning:
    - `hasSenderPrivateKeyEnv=true`
    - `hasSenderAddressEnv=true`
    - `hasRpcEnv=true`
  - Re-run flow:
    - Step 1->7 PASS tren processor/internal path
    - Deposit idempotency PASS (`credited=1`, call duplicate `duplicate=1`)
    - Withdraw processor PASS (`pending -> completed`, funding debit dung 1 lan)
  - Caveat:
    - Sender chua funded (`BNB=0`, USDT testnet chua cap), Step 2 dung tuple synthetic mode.
- Gate impact:
  - `T-12` nang len `PARTIAL PASS` (khong con BLOCKED toan bo).
  - `T-13` van `IN_PROGRESS`, release decision giu `CONDITIONAL GO`.

## 12) Proactive actions while waiting USDT faucet window
- Da thuc hien on-chain infra smoke bang `tBNB`:
  - Tx hash: `0x8c44a1f3bdc95540e440cd76a77a4b47780d701c6a720ccb3f3daa5141491902`
  - Explorer: `https://testnet.bscscan.com/tx/0x8c44a1f3bdc95540e440cd76a77a4b47780d701c6a720ccb3f3daa5141491902`
  - Ket luan: signer + RPC + broadcast path hoat dong.
- Da bo sung preflight script:
  - `scripts/wallet-stage3-preflight.mjs`
  - Run command: `node --env-file=.env scripts/wallet-stage3-preflight.mjs`
  - Current snapshot:
    - `infraReady=true`
    - `usdtReady=false` (thieu `USDT_CONTRACT_ADDRESS_TESTNET` hoac sender USDT balance = 0)
- Ke hoach run ngay khi co USDT:
  1. Set `USDT_CONTRACT_ADDRESS_TESTNET` vao `.env`.
  2. Verify `usdtReady=true` bang preflight script.
  3. Re-run Step 2 bang transfer on-chain that + attach explorer evidence.
  4. Re-run Stage 3 closure report va chot gate cuoi.
