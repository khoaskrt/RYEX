---
name: ryex-be-skill
description: Backend engineering execution rules for RYEX. Use when editing API routes, server domain logic, auth/session, database access, and third-party market/auth integrations.
---

## 0) Mandatory Pre-Task Rule Read
- Trước khi thực hiện bất kỳ tác vụ nào, bắt buộc đọc file rule BE tương ứng với hệ đang chạy:
  - `.codex`: `.codex/Rule/rule_be.md`
  - `.codex (legacy path)`: `.codex/Rules/rule_be.md`
- Nếu chưa đọc rule, không được bắt đầu edit/code/test cho task BE.
- Nếu task/bug liên quan Database, bắt buộc review log migration trong `/Users/mac/Desktop/RYEX/db/migrations` trước khi code/fix.


# RYEX BE Skill (Simple + Optimized) — v1

## 1) Project Context (Must Keep in Mind)
- Stack: Next.js App Router Route Handlers (`src/app/api/v1/*`) + domain server layer (`src/server/*`).
- Auth flow hiện tại dựa trên Supabase Auth + Postgres audit/session tables.
- Market data đi qua backend proxy (`/api/v1/market/tickers`) và normalize ở `src/server/market/*`.

## 2) Non-Negotiable Rules

### 2.1) Auth Pattern Consistency (CRITICAL - Learned from Assets API 401 incident)
**BEFORE implementing any protected API endpoint:**

1. **Verify current auth stack:**
   - Grep existing API routes: `grep -r "verifyIdToken\|getUser\|createClient" src/app/api/v1/*/route.js`
   - Check imports: What auth library is actively used? (legacy auth stack vs Supabase Auth)
   - **NEVER assume** - always cross-reference with working endpoints

2. **Cross-reference pattern from similar endpoint:**
   - Find a working protected endpoint (e.g., `/api/v1/user/profile`)
   - Copy exact auth verification pattern
   - Use identical token extraction + verification method

3. **Check for deprecated dependencies:**
   - If you see legacy auth guards in code while project uses Supabase → **STOP and ask user**
   - If migration is in progress, explicitly confirm which auth to use

4. **Test with real session token:**
   - After implementation, verify token from actual user session works
   - Check server logs show successful verification

**Why this matters:**
- Incident: Assets API implemented with legacy auth guard while project had migrated to Supabase
- Impact: 100% of requests returned 401, blocking entire feature
- Root cause: Didn't verify current auth pattern before coding
- Cost: 2+ hours debugging, user frustration, delayed feature launch

**Rule violation = P0 blocker.** No exceptions.

---

### 2.2) Contract-first API:
- Mọi thay đổi BE phải giữ ổn định contract response (shape + error code).
- Ưu tiên `error.code` nhất quán (vd: `AUTH_INVALID_INPUT`) thay vì message tự do.

### 2.3) Route mỏng, domain dày:
- `src/app/api/v1/*/route.js` chỉ parse request, gọi domain service, map response.
- Logic nghiệp vụ, query SQL, side effects đặt ở `src/server/*`.

### 2.4) Transaction boundaries rõ ràng:
- Nhiều thao tác DB liên quan 1 use-case phải dùng `withTransaction`.
- Không để trạng thái nửa vời (user tạo xong nhưng audit/session thất bại).

### 2.5) Security baseline:
- Không hardcode secret/key/token trong code.
- Không log secret, token đầy đủ, hoặc PII nhạy cảm.
- Validation + rate limit chạy trước side effects tốn kém.

### 2.6) Runtime/infra consistency:
- Route dùng DB/Supabase Auth phải chạy `export const runtime = 'nodejs'`.
- Không chuyển qua Edge nếu còn dependency Node APIs.

### 2.7) Error + observability:
- Chuẩn hóa `requestId`, `ip`, `userAgent` qua helper chung.
- Luôn ghi đủ audit/verification/login events cho auth-sensitive flows.

### 2.8) Scope discipline:
- Chỉ sửa file cần thiết cho yêu cầu.
- Không refactor kiến trúc rộng nếu chưa được yêu cầu.

### 2.9) Role boundary (must):
- BE không sửa code FE (UI/component/presentation).
- BE chỉ xử lý API/service/repository/schema và server integrations.

## 3) Optimized Working Flow
Before coding:
1. **[MANDATORY] Verify auth pattern** (see 2.1) - grep existing routes, cross-reference working endpoint
2. Chốt use-case + API contract bị ảnh hưởng.
3. Khoanh vùng đúng 3 lớp: route handler -> service/repository -> DB/schema.

During coding:
1. Validate input sớm, fail fast bằng `AuthApiError`/domain error phù hợp.
2. Đặt side effects theo thứ tự an toàn: validate -> rate limit -> provider -> DB transaction -> response.
3. Ưu tiên helper có sẵn (`jsonError`, `withTransaction`, `getRequestMeta`, repository methods).

After coding:
1. Chạy `npm run build`.
2. Nếu đụng DB/auth: chạy thêm `npm run db:verify` (và `npm run db:location` nếu cần xác nhận môi trường DB).
3. Self-check contract: status code, response JSON shape, error codes không vỡ FE.

## 4) BE Done Checklist (Output format)
- Files changed.
- API contracts impacted (if any).
- Security checks passed (secrets/logging/rate-limit/runtime).
- Test/build evidence (`build`, optional `db:*`).
- Residual risks / follow-ups.

## 5) Current Backend Map (Quick Reference)
- API routes: `src/app/api/v1/auth/*`, `src/app/api/v1/market/*`, `src/app/api/v1/user/*`
- Auth domain: `src/server/auth/*`
- Market domain: `src/server/market/*`
- DB layer: `src/server/db/postgres.js`
- Shared server env: `src/shared/lib/env.server.js`
