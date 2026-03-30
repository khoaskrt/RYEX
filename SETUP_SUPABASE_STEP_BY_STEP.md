# 🚀 Setup Supabase cho RYEX - Từng bước một

## 📋 **Bước 1: Tạo tables trong Supabase**

### A. Mở Supabase Dashboard
1. Truy cập: https://supabase.com/dashboard
2. Login vào account của bạn
3. Chọn project: **hpfpkfgackikqsstrpbc**

### B. Chạy SQL tạo tables
1. Click vào **SQL Editor** (ở left sidebar, icon ⚡)
2. Click nút **"New query"** màu xanh
3. Mở file `supabase-complete-schema.sql` trong VS Code
4. Copy **TOÀN BỘ** nội dung file
5. Paste vào SQL Editor trên Supabase
6. Click nút **"Run"** (hoặc Ctrl+Enter)
7. Đợi thông báo: ✅ **"Success. No rows returned"**

### C. Verify tables đã tạo
1. Click vào **Table Editor** (ở left sidebar, icon 📊)
2. Bạn sẽ thấy 7 tables mới:
   - ✅ users
   - ✅ auth_identities
   - ✅ auth_verification_events
   - ✅ auth_login_events
   - ✅ user_sessions
   - ✅ trusted_devices
   - ✅ audit_events

---

## 🔒 **Bước 2: Enable Row Level Security (RLS)**

### A. Chạy SQL tạo RLS policies
1. Vẫn trong **SQL Editor**, click **"New query"**
2. Mở file `supabase-rls-policies.sql` trong VS Code
3. Copy **TOÀN BỘ** nội dung file
4. Paste vào SQL Editor
5. Click **"Run"**
6. Đợi thông báo: ✅ **"Success"**

### B. Verify RLS đã enable
1. Quay lại **Table Editor**
2. Click vào table `users`
3. Nhìn lên thanh header, bạn sẽ thấy icon 🔒 màu **XANH** (RLS enabled)
4. Click vào tab **"Policies"** (ở top bar)
5. Bạn sẽ thấy 3 policies:
   - ✅ users_select_own
   - ✅ users_update_own
   - ✅ users_service_role_all

---

## ✅ **Bước 3: Test connection**

### A. Chạy test script
```bash
npm run db:test
```

### B. Kết quả mong đợi
Bạn sẽ thấy output như sau:
```
🔍 Testing Supabase connection...

✅ Test 1: Basic connection
   ✓ Connection successful!

✅ Test 2: Count users
   ✓ Total users: 0

✅ Test 3: List tables
   ✓ Tables found:
     - users
     - auth_identities
     ...

✅ Test 5: Test insert permission
   ✓ Insert successful!
   ✓ Test user deleted (cleanup)

🎉 All tests passed! Supabase is ready to use.
```

### C. Nếu test FAILED
Kiểm tra:
- [ ] `.env` file có đầy đủ `SUPABASE_URL` và keys?
- [ ] Đã chạy `supabase-complete-schema.sql` chưa?
- [ ] Internet connection ổn định?

---

## 🔧 **Bước 4: Cấu hình Authentication (Optional)**

### Disable Supabase Auth (vì dùng Firebase)
1. Trong Supabase Dashboard, vào **Authentication** (left sidebar)
2. Click vào **Providers**
3. Disable tất cả providers:
   - Email: **OFF**
   - Google: **OFF**
   - GitHub: **OFF**
   - (Các providers khác cũng OFF)
4. Click **Save**

**Lý do:** RYEX dùng Firebase Auth, không cần Supabase Auth

---

## 🧪 **Bước 5: Test API endpoints**

### A. Start dev server
```bash
npm run dev
```

### B. Test GET profile endpoint
1. Mở app RYEX: http://localhost:3000
2. Login/Signup để lấy Firebase token
3. Mở DevTools (F12) → Console
4. Copy Firebase token từ localStorage:
```javascript
localStorage.getItem('firebase_token')
```

5. Test API với curl:
```bash
curl http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN_HERE"
```

### C. Kết quả mong đợi
```json
{
  "user": {
    "id": "uuid-here",
    "email": "your-email@example.com",
    "displayName": null,
    "status": "pending_email_verification",
    "emailVerified": false,
    "createdAt": "2026-03-30T..."
  }
}
```

---

## 📊 **Bước 6: Verify data trong Supabase**

### Xem dữ liệu user vừa tạo
1. Vào **Table Editor**
2. Click vào table **users**
3. Bạn sẽ thấy user record vừa signup
4. Click vào table **auth_identities** để xem auth data

---

## ✨ **DONE! Setup hoàn tất**

### Checklist cuối cùng:
- [x] Tables đã tạo (7 tables)
- [x] RLS policies đã enable
- [x] Test connection pass
- [x] Supabase Auth disabled
- [x] API endpoints hoạt động
- [x] Data được lưu vào Supabase

---

## 📚 **Files quan trọng**

### SQL files (để import vào Supabase):
1. `supabase-complete-schema.sql` - Tạo tables
2. `supabase-rls-policies.sql` - Enable RLS

### Code files (đã setup sẵn):
3. `src/shared/lib/supabase/client.js` - Client Supabase
4. `src/shared/lib/supabase/server.js` - Server Supabase
5. `src/server/auth/supabaseRepository.js` - Repository functions
6. `src/app/api/v1/user/profile/route.js` - Example API

### Docs:
7. `docs/supabase-integration-guide.md` - Full guide
8. `SUPABASE_QUICKSTART.md` - Quick reference

---

## 🐛 **Troubleshooting**

### Lỗi: "relation does not exist"
→ Chưa chạy `supabase-complete-schema.sql`

### Lỗi: "permission denied for table users"
→ Chưa chạy `supabase-rls-policies.sql` hoặc đang dùng anon key thay vì service role key

### Lỗi: "jwt malformed"
→ Firebase token không hợp lệ hoặc đã hết hạn

### Test script fails
→ Check `.env` có đầy đủ biến môi trường:
```bash
SUPABASE_URL=https://hpfpkfgackikqsstrpbc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 💡 **Tips**

- **Backup data**: Export từ Table Editor trước khi chạy migration mới
- **Monitor logs**: Check **Logs** tab trong Supabase để debug
- **API limits**: Free tier có giới hạn 500MB database và 2GB bandwidth/month
- **Security**: KHÔNG BAO GIỜ commit `SUPABASE_SERVICE_ROLE_KEY` vào git

---

## 🎯 **Next Steps**

1. **Update existing code**: Thay raw Postgres queries bằng Supabase client
2. **Add more tables**: Tạo tables cho features khác (products, orders, etc.)
3. **Setup realtime**: Enable realtime subscriptions nếu cần
4. **Add indexes**: Optimize queries với indexes
5. **Setup backup**: Enable Point-in-Time Recovery (paid plan)

---

**🎉 Chúc mừng! Bạn đã tích hợp thành công Supabase vào RYEX.**
