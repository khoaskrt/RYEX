# deposit_monitor_state

## Purpose
Luu checkpoint scan blockchain cho tung wallet de monitor deposit an toan trong `public.deposit_monitor_state`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `wallet_id` | UUID | NO | - | Wallet duoc monitor (dong thoi la PK). |
| `chain` | TEXT | NO | - | Chain duoc scan (MVP: `bsc_testnet`). |
| `last_scanned_block` | BIGINT | NO | `0` | Block cuoi cung da scan. |
| `last_scan_at` | TIMESTAMPTZ | NO | `now()` | Lan scan gan nhat. |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Lan cap nhat state gan nhat. |

## Constraints
- Primary key: `deposit_monitor_state_pkey(wallet_id)`
- Foreign key: `deposit_monitor_state_wallet_id_fkey(wallet_id -> user_wallets.wallet_id)` (`ON DELETE CASCADE`)
- Index: `idx_deposit_monitor_state_chain(chain)`
- Index: `idx_deposit_monitor_state_updated_at(updated_at)`

## RLS
- Khong bat RLS trong migration hien tai.

## Policies
- Khong co policy duoc khai bao trong migration hien tai.

## Source
- `db/migrations/008_create_deposit_monitor_state.sql`
