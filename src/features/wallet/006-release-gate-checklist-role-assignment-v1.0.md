# Wallet Feature - Release Gate Checklist Pointer (v1.4)

Nguon su that:
- `/Users/mac/Desktop/RYEX/docs/features/Wallet/006-release-gate-checklist-role-assignment-v1.0.md`

Tom tat cap nhat:
- Stage 1 da hoan tat: env wallet key da duoc unblock va smoke routes khong con `WALLET_ENV_INVALID`.
- Stage 2 da hoan tat: matrix `WALLET-CT-01..16` PASS lai, shape assertions PASS.
- Stage 3 re-run: full flow processor-level PASS (Step 1->7), idempotency/debit proofs da co.
- Provision infra gate da dat: sender env + RPC access da set.
- Residual gate: chua co transfer on-chain that tu sender funded, nen release van `CONDITIONAL GO`.
- Da bo sung execution checklist theo chang trong source-of-truth docs:
  - Chang 1..6 co owner/support/deadline/output/exit criteria ro rang.
- Muc tieu hien tai:
  - Fund sender testnet that -> attach explorer evidence Step 2 -> BA traceability -> release gate final.

Proactive trong thoi gian cho faucet USDT:
- Da co on-chain smoke tx `tBNB` thanh cong (proof signer+RPC+broadcast).
- Da co script preflight `scripts/wallet-stage3-preflight.mjs` de check readiness 1 lenh truoc khi chay Stage 3 that.
