# RYEX Database (Current Truth Baseline)

## Scope
Thư mục `db/` lưu schema/migration đúng với database đang chạy thực tế.

## Structure
- `db/migrations/`: Migration SQL theo thứ tự thực thi.
- `db/schema/`: Snapshot schema theo từng bảng.

## Current Table Map
```text
users
user_assets
```

## Current Migration Order
Apply theo thứ tự tăng dần:
1. `001_users_current_truth_baseline.sql`
2. `002_fix_auth_handle_new_user_trigger.sql`
3. `003_create_user_assets_current_truth.sql`

## Environment Variables
```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DATABASE_URL=<postgres_connection_string>
```

## Recommended Workflow
1. Mọi thay đổi schema phải tạo migration mới theo số tiếp theo (`002_...sql`).
2. Apply lên Supabase theo thứ tự migration.
3. Cập nhật `db/schema/*.md` để snapshot luôn khớp thực tế.
