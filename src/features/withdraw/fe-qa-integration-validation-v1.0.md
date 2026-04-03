# Withdraw Feature - FE/QA Integration Validation Pointer (v1.0)

Nguon su that ban ket qua FE/QA integration wallet APIs:
- `/Users/mac/Desktop/RYEX/docs/features/Wallet/004-fe-qa-integration-validation-v1.0.md`

Tom tat nhanh:
- FE da tich hop API that cho luong deposit/withdraw theo freeze contract (`bsc_testnet`, `USDT`).
- QA gate local da PASS cho build, db sanity va unauthorized matrix.
- Da fix loi duplicate submit tren withdraw (`WALLET-FE-01`).
- Trang thai release hien tai: `CONDITIONAL GO` cho den khi QA chay full matrix co auth token.
