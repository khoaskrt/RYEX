# [Withdraw/Deposit Wallet API] - BE Phase 1 Delivery (v1.0)

## Scope delivered
- Added wallet DB migrations:
  - `006_create_user_wallets.sql`
  - `007_create_wallet_transactions.sql`
  - `008_create_deposit_monitor_state.sql`
  - `009_create_withdraw_limits.sql`
- Added wallet server module under `src/server/wallet/*`.
- Added protected wallet APIs:
  - `POST /api/v1/wallet/deposit-address`
  - `GET /api/v1/wallet/deposit-address`
  - `POST /api/v1/wallet/withdraw`
  - `GET /api/v1/wallet/transactions`

## Auth pattern
- Reused Supabase bearer-token verification pattern used by existing protected APIs.
- All wallet routes run with `runtime = 'nodejs'`.

## Contract notes
- MVP freeze: only `bsc_testnet` + `USDT`.
- Error response shape:
```json
{
  "error": {
    "code": "...",
    "message": "...",
    "requestId": "..."
  }
}
```
- Numeric token values are returned as strings.

## Not in this phase
- Background processing implementation (`depositMonitor`, `withdrawProcessor`) is not shipped yet.
- On-chain broadcast/signing flow is not shipped yet.

## Next backend task
- Start `T-07/T-08`: processing jobs + idempotent credit/debit path.
