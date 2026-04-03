# Auth Signup Fix - 2026-04-03

## Problem
`POST /api/v1/auth/signup` trả về `AUTH_INTERNAL_ERROR` (500) cho tất cả requests, ngăn chặn hoàn toàn user registration.

## Root Causes

### 1. Database Trigger Missing (P0)
**Issue**: Function `handle_new_user()` exists nhưng trigger không được attached vào `auth.users` table.

**Impact**: Khi Supabase Auth tạo user trong `auth.users`, không có gì sync sang `public.users` → application không biết user này tồn tại.

**Fix**:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Script**: `scripts/db/create-auth-trigger.mjs`

---

### 2. SSL Certificate Rejection (P0)
**Issue**: `pgPool.connect()` fail với error `SELF_SIGNED_CERT_IN_CHAIN` vì Supabase pooler dùng self-signed cert.

**Impact**: Mọi database operation trong signup flow đều crash.

**Fix**: Added to `.env`:
```bash
POSTGRES_SSL_NO_VERIFY="true"
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

And updated [src/server/db/postgres.js](src/server/db/postgres.js):
```js
ssl: resolveSslConfig(connectionString) || { rejectUnauthorized: false }
```

---

### 3. Missing Database Tables (P0)
**Issue**: Tables `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events` không tồn tại.

**Impact**: Signup transaction fail khi insert vào các bảng audit/logging.

**Fix**: Created compatible schema migration `010_create_auth_identities_compat.sql` that uses:
- `supa_id` (matches Supabase auth) instead of legacy `firebase_uid`
- `users_id` (application internal ID) as foreign key target
- All required audit/event tables

**Script**: `scripts/db/apply-single-migration.mjs db/migrations/010_create_auth_identities_compat.sql`

---

## Schema Alignment

### Before (Broken)
- Migration `001_auth_identity_baseline.sql`: used `firebase_uid` schema
- `001_users_current_truth_baseline.sql`: used `supa_id` + `users_id` schema
- **Conflict**: Cannot create `auth_identities` with FK to non-existent columns

### After (Fixed)
- Users table: `supa_id` (PK, maps to `auth.users.id`), `users_id` (internal UUID)
- Auth identities: `user_id` → `users.users_id`, `supa_id` (denorm from Supabase)
- All audit tables: `user_id` → `users.users_id`

---

## Files Changed

1. [.env](.env): Added SSL bypass env vars (dev only)
2. [src/server/db/postgres.js](src/server/db/postgres.js): Added fallback SSL config
3. [db/migrations/010_create_auth_identities_compat.sql](db/migrations/010_create_auth_identities_compat.sql): Created compatible schema
4. [scripts/db/create-auth-trigger.mjs](scripts/db/create-auth-trigger.mjs): Trigger creation script
5. [scripts/db/verify-auth-trigger.mjs](scripts/db/verify-auth-trigger.mjs): Verification script
6. [scripts/db/apply-single-migration.mjs](scripts/db/apply-single-migration.mjs): Migration runner

---

## Verification

### Test Cases Passed
```bash
# Happy path
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ryex.vn","password":"Test@123","displayName":"Test"}'
# → 201 with userId, email, verificationEmailSent

# Missing input
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -d '{}'
# → 400 AUTH_INVALID_INPUT

# Weak password
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -d '{"email":"weak@ryex.vn","password":"123"}'
# → 422 AUTH_PASSWORD_POLICY_FAILED

# Duplicate email
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -d '{"email":"test@ryex.vn","password":"Test@123"}'
# → 409 AUTH_EMAIL_ALREADY_EXISTS
```

**All test cases: ✅ PASS**

---

## Production Readiness

### Resolved Issues
- ✅ Signup API returns 201 for valid payloads
- ✅ Validation working (empty input, weak password, duplicate email)
- ✅ Database trigger active
- ✅ All audit/event tables created
- ✅ SSL connection working

### Remaining Considerations

1. **SSL Bypass is Dev-Only**
   - `.env` has `NODE_TLS_REJECT_UNAUTHORIZED="0"` 
   - ⚠️ Must remove for production
   - Production should use proper SSL cert or Supabase direct connection (not pooler)

2. **Email Verification Flow**
   - Signup creates user and sends verification email
   - Email link → `GET /api/v1/auth/verify-email/callback`
   - Need to test full flow: signup → email → verify → login

3. **Login Flow**
   - After email verified, user needs to login via `/app/auth/login`
   - Login → session sync → redirect `/app/market`
   - Need integration test

---

## QA Status Update

| Gate | Status | Notes |
|------|--------|-------|
| Build Gate | ✅ PASS | Compiled without errors |
| Auth Pack - Signup | ✅ PASS | All validation + happy path working |
| Auth Pack - Verify | ⚠️ PENDING | Need to test email verification callback |
| Auth Pack - Login | ⚠️ PENDING | Need to test full login flow |
| Market Pack | ✅ PASS | Tickers API working |
| User Pack | ⚠️ PENDING | Depends on auth session |

**Updated Recommendation**: 🟡 **CONDITIONAL GO**
- Signup working ✅
- Need to verify full auth flow (verify email + login)
- Remove SSL bypass before production deploy

---

## Reference
- QA Incident Report: [.codex/qa-incident-report-2026-04-03.md](.codex/qa-incident-report-2026-04-03.md)
- Auth Baseline Migrations: `db/migrations/001_users_current_truth_baseline.sql`
- Trigger Fix: `db/migrations/002_fix_auth_handle_new_user_trigger.sql`
- Schema Compat: `db/migrations/010_create_auth_identities_compat.sql`

---

**Date**: 2026-04-03  
**Fixed By**: QA + BE collaboration (no DevOps)  
**Time to Resolution**: ~2 hours (investigation + fix + verification)
