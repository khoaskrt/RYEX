# 🚀 Supabase Quick Start - RYEX

## ✅ Checklist thiết lập Supabase

### 1️⃣ **Cài đặt packages** (✅ Đã xong)
```bash
npm install @supabase/supabase-js
```

### 2️⃣ **Apply migrations trên Supabase**

#### Option A: Qua Supabase Dashboard (Recommended)
1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project: `hpfpkfgackikqsstrpbc`
3. Vào **SQL Editor** (left sidebar)
4. Copy toàn bộ nội dung file `db/migrations/005_enable_rls_policies.sql`
5. Paste vào SQL Editor → Click **Run**
6. Đợi thông báo "Success"

#### Option B: Qua CLI
```bash
psql $POSTGRES_URL < db/migrations/005_enable_rls_policies.sql
```

### 3️⃣ **Verify setup**

#### Test kết nối:
```bash
npm run db:test
```

Kết quả mong đợi:
```
✅ Test 1: Basic connection
   ✓ Connection successful!

✅ Test 2: Count users
   ✓ Total users: X

✅ Test 3: List tables
   ✓ Tables found:
     - users
     - auth_identities
     - user_sessions
     ...

✅ Test 4: Check RLS
   🔒 Enabled users
   🔒 Enabled auth_identities
   ...

🎉 All tests passed!
```

---

## 📝 **Cấu hình trên Supabase Dashboard**

### A. Verify Tables
1. Vào **Table Editor**
2. Check các bảng tồn tại:
   - ✅ `users`
   - ✅ `auth_identities`
   - ✅ `user_sessions`
   - ✅ `trusted_devices`
   - ✅ `auth_verification_events`
   - ✅ `auth_login_events`
   - ✅ `audit_events`

### B. Verify RLS Policies
1. Trong **Table Editor**, click vào bảng `users`
2. Click tab **"Policies"** ở phía trên
3. Xác nhận có policies:
   - ✅ `users_select_own` (SELECT)
   - ✅ `users_update_own` (UPDATE)
   - ✅ `users_service_role_all` (ALL)
4. Icon 🔒 màu **xanh** = RLS đang active

### C. Authentication Settings
1. Vào **Authentication** → **Providers**
2. **Disable** tất cả providers (Email, Google, etc.)
   - ✅ Email: OFF
   - ✅ Google: OFF
   - ✅ GitHub: OFF
   (Vì RYEX dùng Firebase Auth)

### D. API Keys Verification
1. Vào **Settings** → **API**
2. Xác nhận các keys match với `.env`:
   - Project URL: `https://hpfpkfgackikqsstrpbc.supabase.co`
   - anon key: `eyJhbGc...` (đã có trong `.env`)
   - service_role key: `eyJhbGc...` (đã có trong `.env`)

---

## 🧪 **Test API Endpoints**

### Test 1: Get user profile
```bash
# Get Firebase token trước
# (Login vào app, copy token từ DevTools)

curl http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Test 2: Update profile
```bash
curl -X PATCH http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "John Doe"}'
```

---

## 🔐 **Security Checklist**

### ❌ KHÔNG BAO GIỜ:
- [ ] Commit `.env` vào git
- [ ] Expose `SUPABASE_SERVICE_ROLE_KEY` trong client code
- [ ] Disable RLS trên production tables
- [ ] Share service role key qua chat/email

### ✅ ĐÃ SETUP:
- [x] RLS enabled trên tất cả tables
- [x] Service role key chỉ dùng server-side
- [x] Anon key cho client-side
- [x] Firebase Auth integration

---

## 📚 **Files đã tạo**

### Core files:
1. `src/shared/lib/supabase/client.js` - Client-side Supabase instance
2. `src/shared/lib/supabase/server.js` - Server-side Supabase instance
3. `src/server/auth/supabaseRepository.js` - Repository pattern cho auth

### Example files:
4. `src/app/api/v1/user/profile/route.js` - Example API endpoint

### Migration files:
5. `db/migrations/005_enable_rls_policies.sql` - RLS policies

### Documentation:
6. `docs/supabase-integration-guide.md` - Full documentation
7. `scripts/test-supabase-connection.js` - Test script

---

## 🐛 **Troubleshooting**

### Lỗi: "relation does not exist"
**Nguyên nhân:** Chưa apply migrations
**Giải pháp:** Run migrations theo bước 2️⃣

### Lỗi: "permission denied for table users"
**Nguyên nhân:** RLS đang chặn query
**Giải pháp:**
- Dùng `supabaseAdmin` (service role key) trong API routes
- Hoặc pass Firebase JWT vào Supabase client

### Lỗi: "invalid connection string"
**Nguyên nhân:** `POSTGRES_URL` sai hoặc thiếu
**Giải pháp:** Check `.env` file, verify URL từ Supabase Dashboard

### Test script fails
**Giải pháp:**
```bash
# Install missing dependency
npm install dotenv

# Verify .env has all required vars
grep SUPABASE .env
```

---

## 🎯 **Next Steps**

1. **Apply migration**: Run SQL trong Supabase Dashboard
2. **Test connection**: `npm run db:test`
3. **Update existing code**: Replace raw Postgres queries với Supabase client
4. **Test endpoints**: Verify `/api/v1/user/profile` hoạt động
5. **Monitor**: Check Supabase Dashboard → **Logs** tab

---

## 📞 **Support**

- Supabase Docs: https://supabase.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth
- RYEX Docs: `docs/supabase-integration-guide.md`

---

**✅ Setup hoàn tất khi:**
- [ ] `npm run db:test` pass tất cả tests
- [ ] RLS policies active trên Dashboard
- [ ] API endpoints hoạt động với Firebase token
- [ ] No errors trong console khi query Supabase
