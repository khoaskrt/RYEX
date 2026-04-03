# user_wallets

## Purpose
Luu custodial wallet cua tung user theo tung chain trong `public.user_wallets`.

## Column Dictionary
| Column | Type | Null | Default | Definition |
|---|---|---|---|---|
| `wallet_id` | UUID | NO | `gen_random_uuid()` | Dinh danh wallet noi bo, PK. |
| `user_id` | UUID | NO | - | User so huu wallet, map toi `public.users.supa_id`. |
| `chain` | TEXT | NO | - | Chain wallet (MVP: `bsc_testnet`). |
| `address` | TEXT | NO | - | Dia chi nhan nap cua user. |
| `encrypted_key` | TEXT | NO | - | Private key da ma hoa (khong expose qua API). |
| `iv` | TEXT | NO | - | Initialization vector cho encrypted private key. |
| `auth_tag` | TEXT | NO | - | Auth tag cho ma hoa AEAD. |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Thoi diem tao wallet. |
| `last_used_at` | TIMESTAMPTZ | YES | - | Thoi diem wallet duoc dung gan nhat. |

## Constraints
- Primary key: `user_wallets_pkey(wallet_id)`
- Foreign key: `user_wallets_user_id_fkey(user_id -> users.supa_id)` (`ON DELETE CASCADE`)
- Unique constraint: `user_wallets_user_chain_unique(user_id, chain)`
- Index: `idx_user_wallets_user_id(user_id)`
- Index: `idx_user_wallets_chain(chain)`
- Index: `idx_user_wallets_address(address)`

## RLS
- Enabled.

## Policies
- `user_wallets_select_own`
  - `FOR SELECT`
  - `USING (auth.uid() = user_id)`

## Source
- `db/migrations/006_create_user_wallets.sql`
