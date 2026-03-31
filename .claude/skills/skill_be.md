---
name: ryex-be-skill
description: Backend engineering execution rules for RYEX. Use when editing API routes, server domain logic, auth/session, database access, and third-party market/auth integrations.
---

## 0) Mandatory Pre-Task Rule Read
- Trước khi thực hiện bất kỳ tác vụ nào, bắt buộc đọc file rule BE tương ứng với hệ đang chạy:
  - `.codex`: `.codex/Rule/rule_be.md`
  - `.claude`: `.claude/Rules/rule_be.md`
- Nếu chưa đọc rule, không được bắt đầu edit/code/test cho task BE.


# RYEX BE Skill (Simple + Optimized) — v1

## 0) Rule vs Skill Scope (BE)
- Rule: ràng buộc bắt buộc, không được vi phạm (contract, security, role boundary, runtime).
- Skill: ngữ cảnh dự án + quy trình làm việc tối ưu + checklist bàn giao.

## 1) Project Context (Must Keep in Mind)
- Stack: Next.js App Router Route Handlers (`src/app/api/v1/*`) + domain server layer (`src/server/*`).
- Auth flow hiện tại dựa trên Firebase Admin + Postgres audit/session tables.
- Market data đi qua backend proxy (`/api/v1/market/tickers`) và normalize ở `src/server/market/*`.

## 2) Non-Negotiable Rules (belongs to Rule file)
1. Contract-first API:
- Mọi thay đổi BE phải giữ ổn định contract response (shape + error code).
- Ưu tiên `error.code` nhất quán (vd: `AUTH_INVALID_INPUT`) thay vì message tự do.

2. Route mỏng, domain dày:
- `src/app/api/v1/*/route.js` chỉ parse request, gọi domain service, map response.
- Logic nghiệp vụ, query SQL, side effects đặt ở `src/server/*`.

3. Transaction boundaries rõ ràng:
- Nhiều thao tác DB liên quan 1 use-case phải dùng `withTransaction`.
- Không để trạng thái nửa vời (user tạo xong nhưng audit/session thất bại).

4. Security baseline:
- Không hardcode secret/key/token trong code.
- Không log secret, token đầy đủ, hoặc PII nhạy cảm.
- Validation + rate limit chạy trước side effects tốn kém.

5. Runtime/infra consistency:
- Route dùng DB/Firebase phải chạy `export const runtime = 'nodejs'`.
- Không chuyển qua Edge nếu còn dependency Node APIs.

6. Error + observability:
- Chuẩn hóa `requestId`, `ip`, `userAgent` qua helper chung.
- Luôn ghi đủ audit/verification/login events cho auth-sensitive flows.

7. Scope discipline:
- Chỉ sửa file cần thiết cho yêu cầu.
- Không refactor kiến trúc rộng nếu chưa được yêu cầu.

8. Role boundary (must):
- BE không sửa code FE (UI/component/presentation).
- BE chỉ xử lý API/service/repository/schema và server integrations.

## 3) Optimized Working Flow
Before coding:
1. Chốt use-case + API contract bị ảnh hưởng.
2. Khoanh vùng đúng 3 lớp: route handler -> service/repository -> DB/schema.

During coding:
1. Validate input sớm, fail fast bằng `AuthApiError`/domain error phù hợp.
2. Đặt side effects theo thứ tự an toàn: validate -> rate limit -> provider -> DB transaction -> response.
3. Ưu tiên helper có sẵn (`jsonError`, `withTransaction`, `getRequestMeta`, repository methods).

After coding:
1. Chạy `npm run build`.
2. Nếu đụng DB/auth: chạy thêm `npm run db:verify` (và `npm run db:test` nếu cần).
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
