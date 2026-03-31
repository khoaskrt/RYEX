# 📦 Tóm tắt: Kết nối Supabase cho RYEX

## ✅ **Đã cài đặt**
```bash
npm install @supabase/supabase-js  # ✅ Done
```

## 📄 **Files được tạo**

### 1. SQL Files (để import vào Supabase Dashboard)
- `supabase-complete-schema.sql` ← **Chạy file này TRƯỚC**
- `supabase-rls-policies.sql` ← **Chạy file này SAU**

### 2. Code Files (đã ready)
- `src/shared/lib/supabase/client.js`
- `src/shared/lib/supabase/server.js`
- `src/server/auth/supabaseRepository.js`
- `src/app/api/v1/user/profile/route.js`

### 3. Documentation
- `SETUP_SUPABASE_STEP_BY_STEP.md` ← **ĐỌC FILE NÀY**
- `docs/supabase-integration-guide.md`
- `SUPABASE_QUICKSTART.md`

### 4. Test Script
```bash
npm run db:test  # Test connection
```

---

## 🚀 **Quick Setup (3 phút)**

### Bước 1: Tạo tables
1. Mở https://supabase.com/dashboard
2. Chọn project: **hpfpkfgackikqsstrpbc**
3. Vào **SQL Editor** → **New query**
4. Copy/paste nội dung `supabase-complete-schema.sql`
5. Click **Run** → Đợi "Success"

### Bước 2: Enable RLS
1. **SQL Editor** → **New query**
2. Copy/paste nội dung `supabase-rls-policies.sql`
3. Click **Run** → Đợi "Success"

### Bước 3: Verify
```bash
npm run db:test
```

**Xong!** 🎉

---

## 📊 **7 Tables được tạo**

| Table | Mô tả |
|-------|-------|
| `users` | Thông tin user chính |
| `auth_identities` | Liên kết Firebase Auth |
| `user_sessions` | Sessions đang active |
| `trusted_devices` | Thiết bị trusted |
| `auth_verification_events` | Log verify email |
| `auth_login_events` | Log login |
| `audit_events` | Audit trail |

---

## 🔑 **Thông tin bạn CẦN GỬI** (Đã có trong `.env`)

✅ Đã có đầy đủ:
```bash
SUPABASE_URL=https://hpfpkfgackikqsstrpbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
POSTGRES_URL=postgres://...
```

---

## ⚙️ **Cấu hình trên Supabase Dashboard**

### Authentication Settings
1. Vào **Authentication** → **Providers**
2. **Disable tất cả** (Email, Google, GitHub, etc.)
   - Vì RYEX dùng Firebase Auth

### Verify Tables
1. Vào **Table Editor**
2. Thấy 7 tables với icon 🔒 màu xanh = RLS enabled

### Verify RLS Policies
1. Click vào table `users`
2. Tab **Policies** → Thấy 3 policies

---

## 📝 **Không cần CSV import**

**Lý do:** SQL files tự động tạo schema + constraints + indexes.
Chỉ cần copy/paste SQL vào Supabase Dashboard là xong!

---

## 🎯 **Next Steps**

1. ✅ Chạy `supabase-complete-schema.sql` trong Supabase SQL Editor
2. ✅ Chạy `supabase-rls-policies.sql` trong Supabase SQL Editor
3. ✅ Verify: `npm run db:test`
4. ✅ Disable Supabase Auth providers
5. ✅ Test API: Login vào app → Test `/api/v1/user/profile`

---

## 🔗 **Links quan trọng**

- Supabase Dashboard: https://supabase.com/dashboard/project/hpfpkfgackikqsstrpbc
- SQL Editor: https://supabase.com/dashboard/project/hpfpkfgackikqsstrpbc/sql
- Table Editor: https://supabase.com/dashboard/project/hpfpkfgackikqsstrpbc/editor

---

**📖 Chi tiết: Đọc `SETUP_SUPABASE_STEP_BY_STEP.md`**
