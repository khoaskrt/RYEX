# RYEX Database — Source of Truth (repo)

Mục lục repo: [`docs/INDEX.md`](../docs/INDEX.md).

## 1) Scope
- `db/migrations/`: SQL migration — **đơn nguồn kỹ thuật** cho schema.
- **Quy ước tên:** cùng một “mốc” số có thể tách nhánh bằng `001.1`, `001.2`, `002.1`, … để **không trùng** `001_*.sql` hai lần và vẫn sort đúng thứ tự (001.1 trước 001.2).
- `db/schema/`: Snapshot từng bảng (cột, constraint, RLS ghi chú) — **đơn nguồn tài liệu** song hành với migration.
- Chiến lược bảo mật runtime: xem `docs/domain/data-sot.md` (service role từ BE, RLS cho client/JWT).

## 2) Hai “track” migration (không trộn trên cùng một DB)

### Track A — Supabase / production hiện tại (khuyến nghị)
Bảng `public.users` dùng `supa_id` + `users_id` (`001.1_users_current_truth_baseline.sql`). Auth/session/audit tương thích Supabase nằm ở `010_create_auth_identities_compat.sql`.

**Thứ tự apply gợi ý:**

| # | File | Ghi chú |
|---|------|---------|
| 1 | `001.1_users_current_truth_baseline.sql` | Profile + RLS `auth.uid() = supa_id` |
| 2 | `002.1_fix_auth_handle_new_user_trigger.sql` | Trigger `handle_new_user` / signup |
| 3 | `003.1_create_user_assets_current_truth.sql` | Số dư tài sản |
| 4 | `010_create_auth_identities_compat.sql` | `auth_*`, `user_sessions`, `audit_events` (FK `users.users_id`) |
| 5 | `006_create_user_wallets.sql` | Custodial wallet |
| 6 | `007_create_wallet_transactions.sql` | Lịch sử nap/rút |
| 7 | `008_create_deposit_monitor_state.sql` | Checkpoint scan deposit |
| 8 | `009_create_withdraw_limits.sql` | Hạn mức rut |

Sau bước 4 có thể cần **migration tay** cho `trusted_devices` nếu dùng bảng từ `003.2_auth_trusted_devices.sql`: file đó FK tới `users(id)` (legacy); runtime BE dùng `users.users_id` — xem `db/schema/trusted_devices.md`.

### Track B — Legacy Firebase / prototype
- `001.2_auth_identity_baseline.sql`: tạo `users(id, firebase_uid, …)` — **mâu thuẫn** với Track A (hai định nghĩa `users` khác nhau).
- `002.2_auth_users_status_length_fix.sql`, `004_auth_verification_event_types.sql`: chỉnh trên schema legacy.
- `003.2_auth_trusted_devices.sql`: FK `users(id)` — cặp với Track B.
- `005_enable_rls_policies.sql`: policy dựa trên JWT claim `firebase_uid` / `service_role` — **không** dùng trực tiếp cho Supabase `auth.uid()` mà không viết lại policy.

**Không** apply cả `001.1` (Supabase users) và `001.2_auth_identity_baseline` trên cùng một database.

## 3) Inventory bảng `public` (snapshot docs)

| Table | Schema doc |
|-------|------------|
| `users` | `schema/users.md` |
| `user_assets` | `schema/user_assets.md` |
| `user_wallets` | `schema/user_wallets.md` |
| `wallet_transactions` | `schema/wallet_transactions.md` |
| `deposit_monitor_state` | `schema/deposit_monitor_state.md` |
| `withdraw_limits` | `schema/withdraw_limits.md` |
| `auth_identities` | `schema/auth_identities.md` |
| `auth_verification_events` | `schema/auth_verification_events.md` |
| `auth_login_events` | `schema/auth_login_events.md` |
| `user_sessions` | `schema/user_sessions.md` |
| `audit_events` | `schema/audit_events.md` |
| `trusted_devices` | `schema/trusted_devices.md` |

## 4) Verify sau khi apply
```bash
npm run db:verify
```
Kiểm tra tồn tại các bảng core qua Supabase REST (service role).  
Kiểm tra riêng một bảng (legacy): `npm run db:verify:assets`.

## 5) Biến môi trường
```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DATABASE_URL=<postgres_connection_string>
```

## 6) Workflow thay đổi schema
1. Thêm migration mới (số tăng dần, một concern mỗi file khi có thể).
2. Cập nhật `db/schema/<table>.md` tương ứng.
3. Cập nhật `docs/domain/data-sot.md` (migration map + RLS map).
4. Chạy `npm run db:verify` trên môi trường target.

## 7) Script `scripts/db/apply-all-migrations.mjs`
Danh sách file trong script **lịch sử** có thể không khớp Track A; ưu tiên **thứ tự mục §2** khi bootstrap Supabase mới. Đọc comment đầu file script trước khi chạy.
