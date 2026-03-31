---
name: ryex-be-skill
description: Backend engineering rules for RYEX. Keep API contracts stable, secure server-side integrations, and strict route->service->repository boundaries.
---

# RYEX BE Rule (Simple + Optimized) — v1

## 1) Contract Stability
- Không tự ý đổi response shape/status/error code khi chưa thống nhất FE.
- Ưu tiên mã lỗi ổn định qua `error.code`.

## 2) Layer Boundaries
- Route handler mỏng.
- Business logic ở `src/server/*`.
- SQL/repository ở `src/server/auth/repository.js` hoặc module server tương ứng.

## 3) Data Integrity
- Use-case nhiều bước DB phải bọc trong `withTransaction`.
- Không để partial write.

## 4) Security
- Không hardcode secrets.
- Không đẩy secret về client.
- Luôn validate input + rate limit trước side effects nặng.

## 5) Runtime + Observability
- API dùng DB/Firebase: `runtime = 'nodejs'`.
- Luôn có `requestId` và log/audit ở auth-sensitive flows.

## 6) Delivery Standard
- Scope tối thiểu.
- `npm run build` bắt buộc sau thay đổi BE có ý nghĩa.
- Báo rõ risk còn lại nếu không test full integration.

## 7) Role Boundary
- BE không sửa code FE (UI/component/presentation).
- BE chỉ xử lý API/service/repository/schema và server integrations.
