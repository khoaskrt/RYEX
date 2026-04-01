# RYEX Database (Supabase-Only)

## Scope
Thư mục `db/` chỉ lưu thông tin liên quan trực tiếp đến database của dự án:
- Schema changes (SQL migrations)
- Quy ước apply schema trên Supabase
- Tài liệu DB ngắn gọn phục vụ vận hành

## Structure
- `db/migrations/`: Các migration SQL theo thứ tự thực thi.
- `db/schema/`: Schema snapshot theo từng bảng (đọc nhanh theo table).

## Table Relationship Map
```text
users (1)
  ├─< auth_identities
  ├─< user_sessions
  ├─< trusted_devices
  ├─< user_assets
  ├─< auth_verification_events   (nullable user_id)
  ├─< auth_login_events          (nullable user_id)
  └─< audit_events               (nullable actor_user_id)
```

Chi tiết cột/constraint/index của từng bảng nằm trong `db/schema/*.md`.

## Why Keep Migrations If We Use Supabase?
Dù dùng Supabase, migration vẫn là nguồn sự thật cho schema:
- Version hóa thay đổi bảng/index/constraint/RLS
- Reproducible giữa các môi trường
- Dễ audit và rollback theo lịch sử thay đổi

## Current Migration Order
Apply theo thứ tự tăng dần:
1. `001_auth_identity_baseline.sql`
2. `002_auth_users_status_length_fix.sql`
3. `003_auth_trusted_devices.sql`
4. `004_auth_verification_event_types.sql`
5. `005_enable_rls_policies.sql`
6. `006_create_user_assets.sql`

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_or_publishable_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Common Commands
```bash
npm run db:verify    # kiểm tra bảng user_assets
npm run db:seed:assets
npm run db:location
```

## Recommended Workflow
1. Tạo migration mới trong `db/migrations/` với số thứ tự tiếp theo (`007_...sql`).
2. Apply lên Supabase SQL Editor hoặc qua pipeline deploy.
3. Cập nhật docs domain nếu thay đổi schema/contract.
4. Verify bằng script DB và API liên quan.

## References
- Supabase Docs: https://supabase.com/docs
- Data SoT: `docs/domain/data-sot.md`
