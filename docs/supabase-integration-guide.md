# 📘 Hướng dẫn tích hợp Supabase vào RYEX

## 🎯 Tổng quan
RYEX sử dụng **Firebase Auth** cho authentication và **Supabase (PostgreSQL)** cho database chính.

### Kiến trúc:
```
User → Firebase Auth (Login/Signup)
     → Next.js API Routes
     → Supabase (Store user data)
```

---

## 📦 Các package đã cài đặt
```bash
npm install @supabase/supabase-js firebase firebase-admin pg
```

---

## 🔐 Biến môi trường (.env)

```bash
# Firebase Auth (Authentication)
FIREBASE_PROJECT_ID="ryex-2312f"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@ryex-2312f.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="..."
NEXT_PUBLIC_FIREBASE_API_KEY="..."

# Supabase (Database)
SUPABASE_URL="https://hpfpkfgackikqsstrpbc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."  # Client-side
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."     # Server-side (GIỮ BÍ MẬT!)

# PostgreSQL Connection
POSTGRES_URL="postgres://postgres.hpfpkfgackikqsstrpbc:..."
```

---

## 🛠️ Cách sử dụng

### 1. Client-side (Browser)
```javascript
// src/shared/lib/supabase/client.js
import { supabase } from '../../shared/lib/supabase/client';

// Query data (chỉ đọc dữ liệu public hoặc của user hiện tại)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com');
```

### 2. Server-side (API Routes)
```javascript
// src/app/api/v1/user/profile/route.js
import { supabaseAdmin } from '../../../../../shared/lib/supabase/server';

// Insert/Update với service role key (bypass RLS)
const { data, error } = await supabaseAdmin
  .from('users')
  .insert({ firebase_uid: uid, email: 'user@example.com' });
```

### 3. Sử dụng Repository Pattern
```javascript
import { upsertUserSupabase } from '../../../../../server/auth/supabaseRepository';

// Tạo/update user
const user = await upsertUserSupabase({
  firebaseUid: 'abc123',
  email: 'user@example.com',
  displayName: 'John Doe',
});
```

---

## 🔒 Row Level Security (RLS)

### Cách hoạt động:
- **Service Role Key** (backend): Bypass tất cả RLS policies
- **Anon Key** (frontend): Chỉ truy cập dữ liệu theo policies

### Apply migration:
```bash
# Option 1: Qua Supabase Dashboard
# Vào SQL Editor → Copy nội dung db/migrations/005_enable_rls_policies.sql → Execute

# Option 2: Qua CLI
psql $POSTGRES_URL < db/migrations/005_enable_rls_policies.sql
```

### Policies đã setup:
- ✅ Users chỉ xem/sửa dữ liệu của chính họ
- ✅ Service role (backend) có full access
- ✅ Auth events chỉ đọc (read-only cho users)

---

## 🧪 Testing

### Test kết nối:
```javascript
// Test trong API route
const { data } = await supabaseAdmin
  .from('users')
  .select('count')
  .single();

console.log('Connected! User count:', data.count);
```

### Test RLS:
```javascript
// Thử query với anon key (phải fail nếu không có Firebase token)
const { data, error } = await supabase
  .from('users')
  .select('*');

// error: "row-level security policy violation"
```

---

## 📋 Checklist cấu hình trên Supabase Dashboard

### Bước 1: Database
- [x] Verify tables đã tồn tại: `users`, `auth_identities`, `user_sessions`
- [ ] Run migration `005_enable_rls_policies.sql` trong SQL Editor
- [ ] Verify RLS policies đã active (Table Editor → RLS icon màu xanh)

### Bước 2: Authentication
- [ ] Vào **Authentication** → **Providers**
- [ ] Disable tất cả providers (vì dùng Firebase Auth)
- [ ] (Optional) Enable "Custom Auth" nếu muốn sync Firebase UID

### Bước 3: API Settings
- [ ] Verify **Settings** → **API**
  - [x] URL: `https://hpfpkfgackikqsstrpbc.supabase.co`
  - [x] anon key: đã có trong `.env`
  - [x] service_role key: đã có trong `.env`

### Bước 4: Security (Optional)
- [ ] Vào **Settings** → **API** → **JWT Settings**
- [ ] Note lại `JWT Secret` (đã có trong `.env`)
- [ ] (Advanced) Tạo custom JWT claims cho Firebase integration

---

## 🔄 Migration workflow

### Tạo migration mới:
```bash
# Tạo file
touch db/migrations/006_my_new_migration.sql

# Edit file với SQL commands
```

### Apply migrations:
```bash
# Option 1: Supabase Dashboard SQL Editor
# Copy/paste nội dung file → Execute

# Option 2: CLI
psql $POSTGRES_URL < db/migrations/006_my_new_migration.sql
```

### Rollback (nếu cần):
```sql
-- Tạo file db/rollbacks/006_rollback.sql
DROP POLICY IF EXISTS my_policy ON users;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## 🚨 Security best practices

### ❌ KHÔNG BAO GIỜ:
- Expose `SUPABASE_SERVICE_ROLE_KEY` trong client code
- Commit `.env` vào git
- Disable RLS trừ khi cần thiết
- Dùng `SELECT *` khi chỉ cần một vài columns

### ✅ NÊN:
- Dùng service role key chỉ trong API routes
- Validate input trước khi insert/update
- Log tất cả sensitive operations vào `audit_events`
- Test RLS policies với anon key

---

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"
→ Chưa run migrations. Execute các file trong `db/migrations/`

### Lỗi: "permission denied for table"
→ RLS chặn. Check policies hoặc dùng service role key

### Lỗi: "JWT expired"
→ Firebase token hết hạn. Refresh token ở client

### Lỗi: "invalid connection string"
→ Check `POSTGRES_URL` trong `.env`

---

## 📚 Tài liệu tham khảo
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
