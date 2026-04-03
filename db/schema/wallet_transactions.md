# wallet_transactions

## Purpose
Luu lich su giao dich nap/rut wallet va trang thai xu ly trong `public.wallet_transactions`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `transaction_id` | UUID | NO | `gen_random_uuid()` | Dinh danh giao dich noi bo, PK. |
| `user_id` | UUID | NO | - | User tao/so huu giao dich. |
| `wallet_id` | UUID | YES | - | Wallet lien quan den giao dich. |
| `tx_type` | TEXT | NO | - | Loai giao dich: `deposit`/`withdraw`. |
| `symbol` | TEXT | NO | - | Ma tai san (MVP: `USDT`). |
| `chain` | TEXT | NO | - | Blockchain network (MVP: `bsc_testnet`). |
| `account_type` | TEXT | NO | `funding` | Loai tai khoan so du (`funding`/`trading`). |
| `amount` | NUMERIC(36,18) | NO | - | So tien giao dich. |
| `requested_amount_usdt` | NUMERIC(36,18) | YES | - | So tien user yeu cau rut. |
| `platform_fee_usdt` | NUMERIC(36,18) | NO | `0` | Phi nen tang tinh theo USDT (MVP = 0). |
| `receive_amount_usdt` | NUMERIC(36,18) | YES | - | So tien user nhan duoc sau phi. |
| `network_fee_bnb` | NUMERIC(36,18) | NO | `0` | Phi mang BNB (info cho ops/UI). |
| `tx_hash` | TEXT | YES | - | Hash giao dich tren chain. |
| `log_index` | INTEGER | YES | - | Log index cho su kien deposit. |
| `from_address` | TEXT | YES | - | Dia chi gui. |
| `to_address` | TEXT | YES | - | Dia chi nhan. |
| `block_number` | BIGINT | YES | - | Block chua giao dich. |
| `confirmations` | INTEGER | NO | `0` | So xac nhan chain hien tai. |
| `status` | TEXT | NO | - | Trang thai: `pending`/`confirming`/`completed`/`failed`. |
| `idempotency_key` | TEXT | YES | - | Key chong submit withdraw trung. |
| `error_code` | TEXT | YES | - | Ma loi xu ly backend (neu co). |
| `error_message` | TEXT | YES | - | Mo ta loi backend (internal/debug). |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem tao giao dich. |
| `confirmed_at` | TIMESTAMPTZ | YES | - | Thoi diem dat xac nhan yeu cau. |
| `completed_at` | TIMESTAMPTZ | YES | - | Thoi diem ket thuc xu ly. |

## Constraints
- Primary key: `wallet_transactions_pkey(transaction_id)`
- Foreign key: `wallet_transactions_user_id_fkey(user_id -> users.supa_id)` (`ON DELETE CASCADE`)
- Foreign key: `wallet_transactions_wallet_id_fkey(wallet_id -> user_wallets.wallet_id)` (`ON DELETE SET NULL`)
- Check constraint: `wallet_transactions_type_check(tx_type in ('deposit','withdraw'))`
- Check constraint: `wallet_transactions_status_check(status in ('pending','confirming','completed','failed'))`
- Check constraint: `wallet_transactions_account_type_check(account_type in ('funding','trading'))`
- Index: `idx_wallet_transactions_user_created(user_id, created_at DESC)`
- Index: `idx_wallet_transactions_status(status)`
- Index: `idx_wallet_transactions_chain_symbol(chain, symbol)`
- Index: `idx_wallet_transactions_tx_hash(tx_hash)`
- Unique partial index (deposit idempotency): `uq_wallet_transactions_deposit_event(chain, tx_hash, log_index, to_address)` where `tx_type='deposit'`
- Unique partial index (withdraw idempotency): `uq_wallet_transactions_withdraw_idempotency(user_id, tx_type, idempotency_key)` where `tx_type='withdraw'`

## RLS
- Enabled.

## Policies
- `wallet_transactions_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = user_id)`

## Source
- `db/migrations/007_create_wallet_transactions.sql`
