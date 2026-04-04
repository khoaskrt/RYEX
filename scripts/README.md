# Scripts

## Database (`scripts/db/`)
| Script | Mục đích |
|--------|----------|
| `verify-schema.mjs` | `npm run db:verify` — kiểm tra bảng `public` trên Supabase (service role). |
| `check-user-assets.mjs` | `npm run db:verify:assets` — kiểm tra riêng `user_assets`. |
| `apply-migration.mjs` | Apply một file SQL trong `db/migrations/` (xem usage trong file). |
| `apply-all-migrations.mjs` | Legacy — **không** dùng làm nguồn thứ tự; ưu tiên [`db/README.md`](../db/README.md). |
| `verify-auth-trigger.mjs` | Kiểm tra trigger auth (dev). |
| Các file khác | Preflight seed, location check — mở file xem comment đầu. |

## Khác
| Script | Mục đích |
|--------|----------|
| `run-wallet-matrix.mjs` | Matrix test wallet API. |
| `wallet-stage3-preflight.mjs` | Preflight stage 3 wallet. |
| `dev-safe.sh` | Helper dev (xem nội dung). |
