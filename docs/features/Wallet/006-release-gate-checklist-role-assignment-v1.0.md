# [Wallet APIs] - Release Gate Checklist + Role Assignment (v1.2)

## 1) Muc tieu
- Tiep tuc follow next actions theo role den muc co the dong gate.
- Cap nhat trang thai tung task bang evidence run moi nhat.

## 2) Trang thai hien tai (update 2026-04-03)
- BE: da hoan tat implementation processor + contract + env guard.
- FE: da re-verify mapping sau BE fix.
- QA: da re-run full contract matrix `WALLET-CT-01..16`, ket qua PASS toan bo.
- Release: con 2 blocker operational de chot GO.

## 3) Checklist theo task/role
| Item | Task ID | Owner | Support | Deliverable bat buoc | Ket qua moi nhat |
|---|---|---|---|---|---|
| 1 | `T-07` Deposit monitor + idempotent credit | BE | QA, BA | Scan/process deposit + idempotency tuple proof + credit funding | DONE |
| 2 | `T-08` Withdraw processor + atomic debit | BE | QA, BA | Processor `pending -> confirming/completed/failed` + atomic debit | DONE |
| 3 | Contract-shape fix (numeric as string) | BE | FE, QA | Numeric fields tra ve string theo freeze contract | DONE |
| 4 | Env hardening `WALLET_ENCRYPTION_KEY` | BE | Release, QA | Startup guard + env checklist | DONE (code), TARGET-ENV CHECKLIST: IN_PROGRESS |
| 5 | FE re-verify mapping sau BE fix | FE | QA | Verify layout/state/loading/error/empty khong vo | DONE |
| 6 | Full QA matrix re-run | QA | BE, FE | `WALLET-CT-01..16` + shape assertions PASS | DONE |
| 7 | E2E testnet full flow | QA | BE | `create address -> deposit on-chain -> auto credit -> withdraw -> history` PASS | BLOCKED (can transfer on-chain that) |
| 8 | BA final traceability check | BA | QA, BE, FE | Map `Goal -> Story -> AC -> Evidence` | DONE (conditional by blocker item 7/9) |
| 9 | Release readiness gate | Release Manager/Tech Lead | QA, BE, FE, BA | Monitoring/alerts/rollback + final decision | IN_PROGRESS |

## 4) Evidence moi nhat

### QA matrix re-run (Item 6)
- Source of truth:
  - `docs/features/Wallet/005-qa-contract-result-v1.0.md` (v1.1)
- Ket qua:
  - Contract cases: `16/16 PASS`
  - Shape assertions: `3/3 PASS`
  - Numeric-string freeze: PASS

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
| `T-12` | PARTIAL PASS | Contract matrix PASS; E2E testnet full flow con BLOCKED |
| `T-13` | IN_PROGRESS | Chua co release sign-off cuoi cung |

## 6) GO/NO-GO hien tai
- Decision: `CONDITIONAL GO`
- Con 2 dieu kien de dat `GO`:
  1. Hoan tat E2E testnet transfer that (deposit on-chain) va attach tx hash evidence.
  2. Release Manager/Tech Lead ky monitoring + rollback checklist.

## 7) Next actions (con lai)
1. QA + BE: chay theo runbook `docs/features/Wallet/007-e2e-testnet-execution-checklist-v1.0.md`, ghi tx hash va evidence day du.
2. Release Manager/Tech Lead: chot runbook rollback, alert threshold, dashboard monitor va ky gate.
3. BA: cap nhat traceability final + chot ban release gate sau khi 1-2 PASS.
