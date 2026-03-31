# Backend Engineering Skill (RYEX)

## 1) Mục tiêu
Thiết kế và triển khai backend theo hướng **đơn giản, an toàn, dễ mở rộng** cho RYEX.

Ưu tiên:
1. Correctness trước, performance sau.
2. Contract rõ ràng giữa FE-BE.
3. Mọi thay đổi đều truy vết được (request_id, event log, audit).

---

## 2) Bối cảnh dự án (đã đọc từ codebase)
- Kiến trúc: **modular monolith**.
- API layer: `src/app/api/v1/**/route.js` (Next.js App Router route handlers).
- Domain/server layer: `src/server/**`.
- Auth SoT: **Firebase Auth**.
- Internal data SoR: **PostgreSQL** (`users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `audit_events`, `user_sessions`, ...).
- Market data: BE proxy qua Binance/CoinGecko (`/api/v1/market/tickers`).

---

## 3) Scope trách nhiệm BE
- Thiết kế API contract (request/response/error).
- Xử lý business logic server-side.
- Quản lý transaction DB, data integrity, idempotency cơ bản.
- Chuẩn hóa error mapping + HTTP status.
- Logging/audit tối thiểu cho flow nhạy cảm.
- Bảo mật: rate limit, validate input, không lộ secret.

Không làm thay FE:
- Render UI, state UI, loading skeleton, UX messaging chi tiết trên client.

---

## 4) Quy ước triển khai chuẩn

### 4.1 Route handler
- Mỗi endpoint đặt ở `src/app/api/v1/<domain>/<action>/route.js`.
- Mặc định `export const runtime = 'nodejs';` nếu cần Firebase Admin/Node APIs.
- Bọc toàn bộ xử lý bằng `try/catch`, luôn trả JSON nhất quán.

### 4.2 Service/repository
- Nghiệp vụ đặt tại `src/server/<domain>/*`.
- Query SQL đi qua repository function, **không viết SQL inline ở route** (trừ trường hợp rất nhỏ, tạm thời).
- Query luôn dùng parameterized SQL (`$1, $2...`).

### 4.3 Transaction
- Nghiệp vụ ghi nhiều bảng bắt buộc dùng `withTransaction(...)`.
- Nếu bước ngoài DB fail (vd external provider), phải map lỗi rõ trước khi commit logic phụ thuộc.

### 4.4 Error handling
- Dùng error chuẩn (`AuthApiError`, mapping helpers) theo pattern hiện tại.
- Không trả stack trace cho client.
- HTTP code rõ ràng:
  - `400` input thiếu/sai format cơ bản.
  - `401/403` auth/permission.
  - `404` resource không tồn tại.
  - `409` conflict (email đã tồn tại, duplicate logical key).
  - `422` business rule fail.
  - `429` rate limit.
  - `5xx` lỗi hệ thống/phụ thuộc.

### 4.5 Observability tối thiểu
- Luôn tạo/propagate `requestId` (`x-request-id` hoặc generate).
- Log server dạng có ngữ cảnh: endpoint, action, requestId, outcome.
- Với auth flow: ghi `verification/login/audit events` theo repository hiện có.

### 4.6 Security baseline
- Không log secret/token/password/raw credential.
- Validate payload trước khi gọi provider/DB.
- Luôn có rate limit cho endpoint public nhạy cảm (`signup`, `login-challenge`, `resend`, ...).
- Không hardcode secrets; dùng env + fail-fast khi thiếu.

---

## 5) Workflow BE chuẩn (Simple + Fast)

### Bước A: Chốt contract trước
- Input: fields bắt buộc/tùy chọn, validation.
- Output: schema success + schema error.
- Danh sách status code.

### Bước B: Implement theo thứ tự
1. Route skeleton + validation.
2. Service/repository logic.
3. Error mapping.
4. Audit/log hooks.
5. Local verify (happy path + 1-2 lỗi chính).

### Bước C: Handoff cho FE
- Endpoint URL, method.
- Sample request/response.
- Error codes FE cần handle.
- Ghi chú edge cases.

---

## 6) Definition of Done (BE)
Một task BE chỉ xem là done khi đủ:
- [ ] Contract rõ và nhất quán.
- [ ] Input được validate.
- [ ] Logic DB an toàn (transaction nếu cần).
- [ ] Error/status code đúng ngữ nghĩa.
- [ ] Có requestId + log/audit phù hợp.
- [ ] Không lộ secret/sensitive data.
- [ ] Build/test cục bộ pass.
- [ ] Có ghi chú handoff cho FE/QA.

---

## 7) Quick playbooks

### 7.1 Thêm endpoint mới
- Tạo `route.js` trong `src/app/api/v1/...`.
- Tạo service/repo trong `src/server/...`.
- Dùng pattern `getRequestMeta` + rate limit + error mapping.
- Trả JSON cấu trúc ổn định.

### 7.2 Mở rộng endpoint hiện có
- Không phá backward compatibility nếu FE đang dùng.
- Chỉ thêm field mới theo hướng optional trước.
- Nếu thay đổi breaking: tạo version route mới hoặc plan migration.

### 7.3 Thay đổi schema DB
- Tạo migration mới trong `db/migrations`.
- Không sửa migration cũ đã áp dụng.
- Viết rollback strategy tối thiểu trong ghi chú PR/task.

---

## 8) Cam kết mở rộng liên tục
Skill này là bản `v1` (lean). Mỗi khi làm feature mới, bổ sung thêm:
- Checklist theo domain (`auth`, `market`, `user`, `risk`).
- Bộ error catalog chuẩn hóa.
- Test matrix regression theo API.
