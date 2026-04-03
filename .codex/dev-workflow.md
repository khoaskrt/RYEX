# Development Workflow Guide

## Starting Dev Server

### ⚠️ Important: Always Check Port 3000 First

**Problem**: Multiple `npm run dev` commands can spawn duplicate dev servers, causing:
- Race conditions
- Random 500 errors
- Request routing issues

**Solution**: Use the safe starter script

```bash
# Recommended way (auto-cleanup)
./scripts/dev-safe.sh

# OR manual cleanup before starting
kill -9 $(lsof -ti:3000) 2>/dev/null && npm run dev
```

---

## Quick Commands

```bash
# Check if dev server is running
lsof -ti:3000

# Count processes on port 3000
lsof -ti:3000 | wc -l

# Kill all processes on port 3000
kill -9 $(lsof -ti:3000)

# Verify webapp is up
curl -s http://localhost:3000 -o /dev/null -w "%{http_code}\n"

# Test signup API
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ryex.vn","password":"Test@123","displayName":"Test"}'
```

---

## Development Environment

### Required Environment Variables (.env)

```bash
# Supabase Auth
SUPABASE_URL="https://hpfpkfgackikqsstrpbc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Database
DATABASE_URL="postgres://..."

# Dev Only - SSL Bypass (REMOVE IN PRODUCTION)
POSTGRES_SSL_NO_VERIFY="true"
NODE_TLS_REJECT_UNAUTHORIZED="0"

# Market Data
COINGECKO_API_KEY="..."
```

⚠️ **Security Warning**: `NODE_TLS_REJECT_UNAUTHORIZED=0` disables SSL verification. Only use in development. Remove before production deploy.

---

## Database Management

### Check Database Status

```bash
# Verify user_assets table
npm run db:verify

# Check database location
npm run db:location

# Verify auth trigger
NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/db/verify-auth-trigger.mjs
```

### Apply Migrations

```bash
# Single migration
NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/db/apply-single-migration.mjs db/migrations/<file>.sql

# Create auth trigger (if missing)
NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/db/create-auth-trigger.mjs
```

---

## Common Issues & Fixes

### Issue 1: Dev Server Won't Start

**Symptoms**: `EADDRINUSE: address already in use :::3000`

**Fix**:
```bash
kill -9 $(lsof -ti:3000)
npm run dev
```

### Issue 2: Signup API Returns 500

**Check**:
1. Database trigger exists: `scripts/db/verify-auth-trigger.mjs`
2. SSL config in `.env`: `POSTGRES_SSL_NO_VERIFY=true`
3. Tables exist: `auth_identities`, `user_sessions`, `audit_events`

**Fix**: See [.codex/fix-auth-signup-2026-04-03.md](.codex/fix-auth-signup-2026-04-03.md)

### Issue 3: Next.js Cache Issues

**Symptoms**: Code changes not reflected, old errors persist

**Fix**:
```bash
rm -rf .next
npm run dev
```

---

## Build & Test

```bash
# Production build
npm run build

# Test build output
npm run start

# Run database verification
npm run db:verify
```

---

## Port Management Best Practices

1. **Always check before starting**: `lsof -ti:3000`
2. **Use safe starter script**: `./scripts/dev-safe.sh`
3. **Kill properly on exit**: `Ctrl+C` then verify with `lsof -ti:3000`
4. **If port stuck**: `kill -9 $(lsof -ti:3000)`

---

## Logs Location

- Dev server output: `/tmp/ryex-single-dev.log` (when backgrounded)
- Next.js cache: `.next/`
- Build trace: `.next/trace`

---

## Reference

- QA Report: [.codex/qa-incident-report-2026-04-03.md](.codex/qa-incident-report-2026-04-03.md)
- Auth Fix: [.codex/fix-auth-signup-2026-04-03.md](.codex/fix-auth-signup-2026-04-03.md)
- Database Migrations: `db/migrations/`

---

**Last Updated**: 2026-04-03  
**Status**: All critical issues resolved ✅
