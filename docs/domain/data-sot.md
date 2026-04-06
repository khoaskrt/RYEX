# RYEX Data Domain SoT (MVP v1)

## 1) Document Control
- Version: `v1.4`
- Owner: `BA` (co-own: `BE`, `DB/Infra`, `QA`)
- Last updated: `2026-04-06`
- Status: `Active`
- Parent docs:
  - `docs/00-system-map.md`
  - `docs/01-architecture-decisions.md`
  - `docs/contracts/api-v1.md`
  - `db/README.md` (thứ tự migration + hai track Supabase vs legacy)
- Source-of-truth note: Tài liệu **nghiệp vụ + lineage API** tại đây; chi tiết cột/constraint từng bảng tại `db/schema/*.md` và SQL tại `db/migrations/`.

## 2) Phối hợp role (RACI gọn)
| Hoạt động | BA | BE | DB/Infra | QA |
|---|---|---|---|---|
| Giữ `data-sot.md` và traceability business ↔ schema | **A/R** | C | C | I |
| Viết/apply migration, đồng bộ `db/schema/*.md` | I | **R** | **A/R** (prod apply) | I |
| `npm run db:verify` trên env target trước release | I | C | C | **R** (gate) |
| Chốt khi nào bật RLS/policy Supabase cho bảng “UNRESTRICTED” | C | **R** | **A** | C |

*(A = accountable, R = responsible, C = consulted, I = informed)*

## 3) Problem Framing
- Business goal:
  - Baseline dữ liệu khớp runtime (Supabase + BE) để giảm schema drift.
  - Handoff FE/BE/QA rõ ràng cho Profile, Assets, Auth, Wallet.
- KPI: migration apply success rate; schema drift incident count; data incident MTTR.

## 4) Data Architecture Overview (Current Runtime)
- Primary data store: PostgreSQL (Supabase-hosted).
- Data access paths:
  - Supabase **service role** (`src/shared/lib/supabase/server.js`, `src/server/db/postgres.js`) cho hầu hết API.
  - Supabase **anon / user JWT** cho client; RLS áp dụng khi query trực tiếp qua PostgREST.
- Security model:
  - RLS: một số bảng bật policy `auth.uid()`; bảng auth/audit có thể **chưa** bật RLS trên dashboard tới khi có policy Supabase chuẩn (không dùng claim `firebase_uid` từ file legacy `005`).
  - Service role **bypass RLS** — vẫn phải kiểm soát quyền ở tầng API.

## 5) Schema Map (Current Truth — public)
| Table | Purpose | Keys/Constraints chính | Consumed by |
|---|---|---|---|
| `users` | Profile nội bộ | PK `supa_id` → `auth.users`; unique `users_id` | Trigger signup, profile API |
| `user_assets` | Số dư theo symbol/account | PK `(user_id, symbol, account_type)` | Assets API |
| `auth_identities` | Provider/password + verify | FK `user_id → users.users_id`; unique `(supa_id, provider)` | Auth repository |
| `auth_verification_events` | Log verify/resend/challenge | Indexes theo user/type/time | Auth rate-limit / audit |
| `auth_login_events` | Log login success/fail | Indexes theo user/result | Security audit |
| `user_sessions` | Phiên đăng nhập | `session_ref` unique | Session lifecycle |
| `audit_events` | Audit tổng quát | `actor_type` check | Ops / compliance nhẹ |
| `trusted_devices` | Thiết bị tin cậy | Unique `(user_id, device_id)` | Login challenge (xem FK note trong `db/schema/trusted_devices.md`) |
| `user_wallets` | Custodial wallet | Unique `(user_id, chain)` | Wallet deposit |
| `wallet_transactions` | Lịch sử nap/rút | Status/type checks; idempotency indexes | Wallet APIs + processor |
| `deposit_monitor_state` | Checkpoint scan | PK `wallet_id` | Deposit monitor job |
| `withdraw_limits` | Hạn mức rut | PK `user_id` | Withdraw validation |
| `spot_orders` | Lệnh spot trading | status/type/side checks + TIF lock `GTC` | Trading API |
| `spot_trades` | Bản ghi khớp lệnh spot | FK `order_id`, fee default `0` | Trading API + history |

## 6) Migration Map — Track Supabase (khuyến nghị)
| Order | File | Summary |
|---|---|---|
| 1 | `001.1_users_current_truth_baseline.sql` | `users` + RLS profile |
| 2 | `002.1_fix_auth_handle_new_user_trigger.sql` | Trigger signup |
| 3 | `003.1_create_user_assets_current_truth.sql` | `user_assets` |
| 4 | `010_create_auth_identities_compat.sql` | Auth + session + audit (FK `users.users_id`) |
| 5 | `006_create_user_wallets.sql` | Wallet |
| 6 | `007_create_wallet_transactions.sql` | Tx history |
| 7 | `008_create_deposit_monitor_state.sql` | Monitor state |
| 8 | `009_create_withdraw_limits.sql` | Limits |
| 9 | `011_create_spot_trading_orders.sql` | Spot orders/trades cho BTCUSDT MVP |

**Legacy / không mix:** `001.2_auth_identity_baseline.sql`, `005_enable_rls_policies.sql` (Firebase JWT), `003.2_auth_trusted_devices.sql` (FK `users(id)`) — xem `db/README.md` §2.

## 7) RLS Map (tóm tắt)
### 7.1 Đã định nghĩa trong migration repo (Supabase / wallet)
| Table | RLS | Ghi chú |
|---|---|---|
| `users` | Enabled | `profiles_*` / `auth.uid() = supa_id` |
| `user_assets` | Enabled | own-row policies |
| `user_wallets` | Enabled | `SELECT` own (`auth.uid() = user_id`) |
| `wallet_transactions` | Enabled | `SELECT` own (`auth.uid() = user_id`) |
| `spot_orders` | Enabled | `SELECT` own (`auth.uid() = user_id`) |
| `spot_trades` | Enabled | `SELECT` own (`auth.uid() = user_id`) |
| `deposit_monitor_state` | **Không** trong migration hiện tại | Chỉ server/jobs ghi |
| `withdraw_limits` | **Không** trong migration hiện tại | Chỉ server ghi |

### 7.2 Auth / audit (dashboard có thể UNRESTRICTED)
- `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events`, `trusted_devices`: có thể **chưa** bật RLS trên Supabase cho tới khi có policy dùng `auth.uid()` hoặc `service_role` đúng chuẩn Supabase.
- File `005_enable_rls_policies.sql` là **mẫu Firebase-era** — không coi là baseline RLS cho Supabase mà không review.

### 7.3 Policy matrix (JWT context, khi RLS bật)
| Table | Own-data pattern | Service role |
|---|---|---|
| `users` | `auth.uid() = supa_id` | Bypass (server) |
| `user_assets` | `auth.uid() = user_id` | Bypass |
| `user_wallets` / `wallet_transactions` | `auth.uid() = user_id` | Bypass |

## 8) API/Service → Table Lineage (mở rộng)
| Runtime flow | Path | Tables |
|---|---|---|
| Signup / verify | Auth API + trigger | `users`, `auth_identities`, `auth_verification_events` |
| Login / session | Auth API | `auth_login_events`, `user_sessions`, `trusted_devices` |
| Profile | API | `users` |
| Assets | API | `user_assets` |
| Wallet | API + processor | `user_wallets`, `wallet_transactions`, `deposit_monitor_state`, `withdraw_limits`, `user_assets` |
| Spot Trading | API + matching service | `spot_orders`, `spot_trades`, `user_assets` |

## 9) FE/BE/QA Impact
- **FE:** phụ thuộc contract API; không giả định RLS cho phép client đọc trực tiếp mọi bảng.
- **BE:** mọi thay đổi schema → migration + `db/schema/*.md` + cập nhật mục 5–7 trong file này.
- **QA:** `npm run db:verify` phải PASS trên env test trước gate; bổ sung case khi bật RLS mới.

## 10) Runtime Gap (Expected vs Current)
| Gap ID | Expected | Direction |
|---|---|---|
| G-DATA-01 | Docs khớp repo | Đã đồng bộ `db/README.md` + schema map v1.2; duy trì sau mỗi DB change |
| G-DATA-02 | RLS đồng nhất dashboard | Chốt migration policy Supabase cho bảng auth/ops hoặc ghi rõ “server-only” |

## 11) Risks
| Risk | Mitigation |
|---|---|
| Apply sai track (hai `001`) | Chỉ Track A trong `db/README.md` §2 |
| Policy legacy `005` trên Supabase | Review trước khi apply; ưu tiên policy `auth.uid()` |

## 12) Traceability + Change Control
- Chuỗi: `Goal → Story → AC → Migration + schema snapshot → API → QA`
- Đổi schema: Delta trong PR + bump minor SoT.

## 13) Delta
- `v1.4` (2026-04-06):
  - Thêm Spot Trading MVP schema + lineage: `spot_orders`, `spot_trades`, migration `011_create_spot_trading_orders.sql`.
  - Bổ sung RLS map và API lineage cho trading endpoints.
- `v1.3` (2026-04-04):
  - Đổi tên migration trùng số: `001.1`/`001.2` (users Supabase vs auth legacy), `002.1`/`002.2`, `003.1`/`003.2`; cập nhật mọi tham chiếu trong repo.
- `v1.2` (2026-04-04):
  - Mở rộng schema map, migration map (Track Supabase + legacy pointer), RLS map, lineage API, RACI role.
  - Trỏ `db/README.md` và `db/schema/*` cho toàn bộ bảng public đang tài liệu hóa.
- `v1.1` (2026-04-02): Baseline `users` + `user_assets` sync.
- `v1.0` (2026-03-31): Khởi tạo SoT.
