# Auth System Architecture (RYEX Crypto MVP)

## 1. Architecture summary

RYEX MVP cho `AUTH + User Identity` dùng kiến trúc **modular monolith** (web-first, spot-first), với nguyên tắc:

- **Firebase Auth** xử lý danh tính đăng nhập và trạng thái verify email (nguồn sự thật cho auth credential).
- **PostgreSQL** lưu dữ liệu nội bộ phục vụ vận hành sản phẩm: user profile, mirror/meta auth, event/audit, session nội bộ.
- Luồng P0 bám BA: `signup email/password -> popup xác nhận gửi verification email -> click email link -> auto-login -> redirect /app/market`.
- Tách module rõ ràng để BE/FE/QA triển khai song song, hạn chế ambiguity và giữ đường mở rộng phase-2 (MFA, risk scoring, richer KYC).

---

## 2. Assumptions & constraints

### Assumptions
- Firebase project đã cấu hình Email/Password provider + email verification action handler.
- Firebase giữ TTL verification link theo default/best-practice hiện tại.
- Sau khi verify thành công, client nhận được authenticated state (auto-login) theo flow đã chốt.
- Chưa triển khai CAPTCHA trong MVP; chống abuse bằng rate limit + telemetry.
- Một user map 1-1 với một `firebase_uid` trong scope hiện tại.

### Constraints
- Password policy bắt buộc: `>=8`, có chữ hoa, số, ký tự đặc biệt.
- Message email existed cố định: **"Email đã được sử dụng, hãy sử dụng email khác"**.
- Secret/private key chỉ tồn tại server env; không lộ qua client bundle/log/event.
- MVP-safe: ưu tiên correctness và auditability hơn tối ưu phức tạp.

---

## 3. Key decisions + trade-offs

1) **Firebase as Auth SoT, PostgreSQL as Product SoR (identity meta)**
- **Decision:** Firebase là nguồn sự thật cho credential + email_verified; Postgres mirror metadata cần cho nghiệp vụ.
- **Trade-off:** Giảm thời gian build auth core và rủi ro crypto/security, đổi lại cần cơ chế đồng bộ trạng thái (eventual consistency ngắn hạn).

2) **Modular monolith thay vì microservices**
- **Decision:** Deploy một backend service, chia module nội bộ.
- **Trade-off:** Nhanh ra MVP, đơn giản vận hành; đánh đổi là cần discipline boundaries để tránh coupling.

3) **Server-authoritative sync**
- **Decision:** Các sự kiện auth quan trọng (signup success, email verify success, login success/fail) phải được ghi audit ở backend.
- **Trade-off:** Tăng thêm I/O ghi DB nhưng đổi lại có trace đầy đủ cho QA/support/compliance.

4) **Session tối thiểu nội bộ**
- **Decision:** Dùng Firebase session cho auth chính, thêm bảng session nội bộ để audit/risk flags.
- **Trade-off:** Không thay Firebase session engine, nhưng vẫn có dữ liệu phân tích/security tối thiểu.

5) **No CAPTCHA in MVP**
- **Decision:** Không thêm CAPTCHA theo scope.
- **Trade-off:** UX tốt hơn nhưng tăng risk abuse; bù bằng rate-limit, cooldown resend (P1), anomaly alert.

---

## 4. Proposed modules/services

## Container-level (MVP)

- **Web App (FE)**  
  Trang `/app/auth/signup`, `/app/auth/login`, verify handler route, và redirect `/app/market`.
- **API App (BE modular monolith)**  
  Module:
  - `auth-identity`: sync Firebase identity, issue app session metadata, error mapping.
  - `user-profile`: lifecycle user nội bộ, preference/status cơ bản.
  - `audit-observability`: auth events, login/verify events, trace id correlation.
  - `security-gateway`: rate limit, request validation, IP/device fingerprint capture.
- **Firebase Auth**  
  Signup credential, email verification link, auth state.
- **PostgreSQL**  
  Dữ liệu nội bộ identity/profile/audit/session.
- **(Optional P1) Analytics sink**  
  Forward event đã redact.

## Module boundaries

- `auth-identity` **owns**: firebase UID mapping, identity status mirror, auth event normalization.
- `user-profile` **owns**: hồ sơ user nội bộ, lifecycle internal status.
- `audit-observability` **owns**: immutable auth/security event log.
- `security-gateway` **owns**: throttling policy + abuse counters.
- FE chỉ gọi public API; không truy cập trực tiếp Firebase Admin hay DB.

---

## 5. Data model & state machines (PostgreSQL chi tiết)

## 5.1 Data ownership boundary: Firebase vs PostgreSQL

### Firebase giữ (SoT)
- `firebase_uid`
- Email/password hash & credential internals
- `email_verified` canonical state
- Verify link token/TTL/validation internals
- Provider-level auth errors chi tiết

### PostgreSQL giữ (internal product data)
- User profile và lifecycle nội bộ
- Auth identity mirror/meta (không lưu password, không lưu verify token)
- Signup/verify/login events phục vụ audit/ops/QA
- Session metadata nội bộ (device/ip timestamps)
- Security/rate-limit counters (nếu chọn lưu persistent)

---

## 5.2 PostgreSQL schema đề xuất

> Naming chuẩn snake_case, timestamp UTC, UUID v4/v7 đều được (khuyến nghị v7 nếu stack hỗ trợ).

### Table: `users`
- **Purpose:** hồ sơ user nội bộ.
- Columns:
  - `id UUID PK`
  - `firebase_uid VARCHAR(128) NOT NULL UNIQUE`
  - `email CITEXT NOT NULL UNIQUE`
  - `display_name VARCHAR(120) NULL`
  - `status VARCHAR(20) NOT NULL DEFAULT 'pending_email_verification'`
    - CHECK in (`pending_email_verification`, `active`, `locked`, `disabled`)
  - `kyc_status VARCHAR(20) NOT NULL DEFAULT 'not_started'`
    - CHECK in (`not_started`, `pending`, `approved`, `rejected`)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `activated_at TIMESTAMPTZ NULL`
  - `last_login_at TIMESTAMPTZ NULL`
- Indexes:
  - `UNIQUE(firebase_uid)`
  - `UNIQUE(email)`
  - `INDEX(status)`
  - `INDEX(created_at)`

### Table: `auth_identities`
- **Purpose:** mirror trạng thái identity từ Firebase để query nhanh + audit context.
- Columns:
  - `id UUID PK`
  - `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  - `firebase_uid VARCHAR(128) NOT NULL`
  - `provider VARCHAR(30) NOT NULL DEFAULT 'password'`
  - `email CITEXT NOT NULL`
  - `email_verified BOOLEAN NOT NULL DEFAULT false`
  - `email_verified_at TIMESTAMPTZ NULL`
  - `last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `sync_version INT NOT NULL DEFAULT 1`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Constraints/Indexes:
  - `UNIQUE(user_id, provider)`
  - `UNIQUE(firebase_uid, provider)`
  - `CHECK(provider IN ('password'))` (MVP)
  - `INDEX(email_verified, updated_at)`

### Table: `auth_verification_events`
- **Purpose:** log vòng đời verification (không chứa secret token).
- Columns:
  - `id UUID PK`
  - `user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  - `firebase_uid VARCHAR(128) NULL`
  - `email CITEXT NULL`
  - `event_type VARCHAR(40) NOT NULL`
    - CHECK in (`verification_email_sent`, `verification_link_clicked`, `verification_succeeded`, `verification_failed`)
  - `event_status VARCHAR(20) NOT NULL`
    - CHECK in (`success`, `failed`, `ignored`)
  - `failure_reason_code VARCHAR(50) NULL`
    - vd: `LINK_EXPIRED`, `LINK_INVALID`, `PROVIDER_ERROR`
  - `request_id VARCHAR(64) NULL`
  - `ip INET NULL`
  - `user_agent TEXT NULL`
  - `occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `metadata JSONB NOT NULL DEFAULT '{}'::jsonb` (redacted only)
- Indexes:
  - `INDEX(user_id, occurred_at DESC)`
  - `INDEX(event_type, occurred_at DESC)`
  - `INDEX(event_status, occurred_at DESC)`

### Table: `auth_login_events`
- **Purpose:** login attempts/success/failure để audit + risk.
- Columns:
  - `id UUID PK`
  - `user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  - `firebase_uid VARCHAR(128) NULL`
  - `email CITEXT NULL`
  - `login_method VARCHAR(30) NOT NULL DEFAULT 'email_link'`
  - `result VARCHAR(20) NOT NULL` CHECK in (`success`, `failed`)
  - `failure_reason_code VARCHAR(50) NULL`
  - `request_id VARCHAR(64) NULL`
  - `ip INET NULL`
  - `user_agent TEXT NULL`
  - `device_id VARCHAR(128) NULL`
  - `occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- Indexes:
  - `INDEX(user_id, occurred_at DESC)`
  - `INDEX(result, occurred_at DESC)`
  - `INDEX(email, occurred_at DESC)`

### Table: `user_sessions`
- **Purpose:** metadata session nội bộ (không thay Firebase token).
- Columns:
  - `id UUID PK`
  - `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  - `session_ref VARCHAR(128) NOT NULL UNIQUE` (opaque id do BE tạo)
  - `auth_provider VARCHAR(30) NOT NULL DEFAULT 'firebase'`
  - `started_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()`
  - `ended_at TIMESTAMPTZ NULL`
  - `termination_reason VARCHAR(30) NULL` (`logout`, `expired`, `revoked`, `idle_timeout`)
  - `ip INET NULL`
  - `user_agent TEXT NULL`
  - `device_id VARCHAR(128) NULL`
  - `risk_level VARCHAR(20) NOT NULL DEFAULT 'low'`
- Indexes:
  - `UNIQUE(session_ref)`
  - `INDEX(user_id, started_at DESC)`
  - `INDEX(last_seen_at DESC)`
  - Partial index active: `INDEX(user_id) WHERE ended_at IS NULL`

### Table: `audit_events`
- **Purpose:** audit trail hợp nhất cho hành vi auth/identity quan trọng.
- Columns:
  - `id UUID PK`
  - `actor_type VARCHAR(20) NOT NULL` (`user`, `system`, `admin`)
  - `actor_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  - `action VARCHAR(80) NOT NULL`
    - vd: `AUTH_SIGNUP_CREATED`, `AUTH_VERIFY_SUCCESS`, `AUTH_LOGIN_SUCCESS`
  - `resource_type VARCHAR(40) NOT NULL` (`user`, `identity`, `session`)
  - `resource_id VARCHAR(128) NULL`
  - `request_id VARCHAR(64) NULL`
  - `ip INET NULL`
  - `user_agent TEXT NULL`
  - `payload JSONB NOT NULL DEFAULT '{}'::jsonb` (redacted)
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Indexes:
  - `INDEX(action, created_at DESC)`
  - `INDEX(actor_user_id, created_at DESC)`
  - `INDEX(resource_type, resource_id)`

---

## 5.3 State machines

## A) Signup + Verification State Machine (P0)

States:
1. `SIGNUP_INIT`
2. `SIGNUP_SUBMITTED`
3. `ACCOUNT_CREATED_UNVERIFIED`
4. `VERIFICATION_EMAIL_SENT`
5. `VERIFY_LINK_CLICKED`
6. `VERIFIED_AUTHENTICATED`
7. `ACTIVE_REDIRECTED_MARKET`
8. `FAILED` (sub-states: `VALIDATION_ERROR`, `EMAIL_EXISTS`, `PROVIDER_ERROR`, `LINK_INVALID`, `LINK_EXPIRED`)

Transitions:
- `SIGNUP_INIT -> SIGNUP_SUBMITTED` khi FE submit hợp lệ.
- `SIGNUP_SUBMITTED -> ACCOUNT_CREATED_UNVERIFIED` khi Firebase create user success.
- `ACCOUNT_CREATED_UNVERIFIED -> VERIFICATION_EMAIL_SENT` khi send verification email success (hiển thị popup).
- `VERIFICATION_EMAIL_SENT -> VERIFY_LINK_CLICKED` khi user click link.
- `VERIFY_LINK_CLICKED -> VERIFIED_AUTHENTICATED` khi Firebase xác thực hợp lệ + session available.
- `VERIFIED_AUTHENTICATED -> ACTIVE_REDIRECTED_MARKET` khi FE redirect `/app/market`.
- Bất kỳ bước nào lỗi -> `FAILED[*]` với mã lỗi chuẩn hóa.

## B) Internal User Status State Machine

- `pending_email_verification` -> `active` (khi `email_verified = true` sync thành công)
- `active` -> `locked` (security action/manual)
- `locked` -> `active` (manual unlock)
- `active|locked` -> `disabled` (compliance/admin)

---

## 6. API boundary draft

## 6.1 Public API (FE gọi)

### `POST /api/v1/auth/signup`
- Purpose: tạo account qua Firebase + tạo mirror user nội bộ.
- Request:
  - `email`, `password`, `displayName?`
- Validation:
  - email format
  - password policy chuẩn BA
- Success:
  - `201`
  - body: `{ userId, email, verificationEmailSent: true, next: "check_email_popup" }`
- Errors:
  - `409 AUTH_EMAIL_ALREADY_EXISTS` -> message chuẩn BA
  - `422 AUTH_PASSWORD_POLICY_FAILED`
  - `400 AUTH_INVALID_INPUT`
  - `503 AUTH_PROVIDER_TEMPORARY_FAILURE`

### `GET /api/v1/auth/verify-email/callback`
- Purpose: endpoint callback/page bootstrap sau click verify link (tuỳ app router triển khai).
- Success:
  - xác nhận verified + auto-login context
  - response/redirect hint tới `/app/market`
- Errors:
  - `400 AUTH_VERIFICATION_LINK_INVALID`
  - `410 AUTH_VERIFICATION_LINK_EXPIRED`

### `POST /api/v1/auth/session/sync`
- Purpose: FE gửi Firebase ID token, BE verify token, upsert internal session + sync identity state.
- Success: `200 { sessionRef, userStatus, emailVerified }`
- Errors: `401 AUTH_INVALID_TOKEN`, `403 AUTH_EMAIL_NOT_VERIFIED` (nếu policy yêu cầu tại điểm gọi)

### `POST /api/v1/auth/logout`
- Purpose: đóng internal session metadata.
- Success: `204`

## 6.2 Internal/Admin API

### `POST /internal/v1/auth/events`
- Ingest event từ auth hooks/service nội bộ (restricted).
- Chỉ network nội bộ/service account.

### `GET /internal/v1/users/:id/auth-timeline`
- Trả timeline audit/login/verify phục vụ support/ops.
- RBAC: admin/support scope.

### `POST /internal/v1/users/:id/lock` và `/unlock`
- Khóa/mở khóa account nội bộ (MVP optional, nhưng schema sẵn).

## Error taxonomy (chuẩn hóa FE mapping)

- `AUTH_INVALID_INPUT`
- `AUTH_PASSWORD_POLICY_FAILED`
- `AUTH_EMAIL_ALREADY_EXISTS`
- `AUTH_PROVIDER_TEMPORARY_FAILURE`
- `AUTH_VERIFICATION_LINK_INVALID`
- `AUTH_VERIFICATION_LINK_EXPIRED`
- `AUTH_INVALID_TOKEN`
- `AUTH_UNAUTHORIZED`
- `AUTH_RATE_LIMITED`
- `AUTH_INTERNAL_ERROR`

Quy ước response lỗi:

```json
{
  "error": {
    "code": "AUTH_EMAIL_ALREADY_EXISTS",
    "message": "Email đã được sử dụng, hãy sử dụng email khác",
    "requestId": "..."
  }
}
```

---

## 7. NFR/SLO proposal

## Security baseline
- Server-side validation bắt buộc cho email/password policy.
- Firebase Admin credentials chỉ qua server env/secrets manager.
- Redaction: cấm log password/token/secret/raw verify payload nhạy cảm.
- Rate limit baseline:
  - signup: 5 req/IP/15 phút
  - verify callback: 20 req/IP/15 phút
  - session sync: 60 req/IP/15 phút
- Least privilege cho DB role (tách read/write nếu có thể).

## Reliability & consistency
- Upsert `users` + `auth_identities` trong transaction DB.
- Auth events ghi theo outbox-like pattern đơn giản (insert audit trong cùng request lifecycle).
- Nếu sync Postgres fail sau Firebase create user: trả lỗi recoverable + enqueue retry sync.

## Performance SLO (MVP realistic)
- `POST /auth/signup`: p95 < 700ms (không tính latency gửi mail provider không đồng bộ).
- `POST /auth/session/sync`: p95 < 300ms.
- Error rate auth API (5xx): < 1%/day.
- Event ingest loss: < 0.1% (best effort + retry ngắn).

## Operability
- Health checks: `/health/live`, `/health/ready` (DB + Firebase admin reachability).
- Alert:
  - spike `AUTH_PROVIDER_TEMPORARY_FAILURE`
  - tăng bất thường `AUTH_VERIFICATION_LINK_EXPIRED`
  - signup fail rate > threshold.

---

## 8. Risks & mitigation

1. **Firebase/Postgres drift**
- Risk: `email_verified` ở Firebase true nhưng mirror chưa cập nhật.
- Mitigation: sync on every `session/sync` + periodic reconciliation job (cron 5-15 phút).

2. **Abuse do chưa có CAPTCHA**
- Risk: spam signup/verify traffic.
- Mitigation: rate limit, IP/device fingerprint nhẹ, anomaly alerts, blacklist disposable domain (P1 quyết định PO).

3. **Thông điệp lỗi không nhất quán FE/BE**
- Risk: UX sai AC (đặc biệt email existed).
- Mitigation: fixed error code taxonomy + contract test FE/BE.

4. **Leaking sensitive data qua logs/events**
- Risk: vi phạm security/compliance.
- Mitigation: logging policy + redaction middleware + QA security test case bắt buộc.

5. **TTL/verify link behavior khác kỳ vọng**
- Risk: fail verify do expired link tăng.
- Mitigation: giữ Firebase default như BA chốt, theo dõi metric expired ratio để tối ưu P1 resend UX.

---

## 9. Handoff notes

## BE handoff checklist
- Implement module `auth-identity`, `user-profile`, `audit-observability`, `security-gateway` theo boundaries.
- Tạo migrations cho 6 bảng: `users`, `auth_identities`, `auth_verification_events`, `auth_login_events`, `user_sessions`, `audit_events`.
- Enforce constraints/indexes như schema đề xuất; dùng `citext` cho email.
- Implement public/internal APIs + error taxonomy chuẩn hóa.
- Bổ sung contract tests:
  - signup success
  - email exists
  - weak password
  - verify invalid/expired
  - session sync success/fail
- Bổ sung reconciliation job (MVP-lite) cho identity mirror.

## FE handoff checklist
- Signup form validation đồng bộ policy với BE (nhưng BE là nguồn quyết định cuối).
- Hiển thị popup “đã gửi verification email” đúng AC.
- Xử lý callback verify link và auto-redirect `/app/market`.
- Map error code -> message tiếng Việt chuẩn BA (đặc biệt email existed message cố định).
- Không log token/secret lên console; tracking event chỉ gửi payload đã redact.
- Chuẩn bị UI state cho P1 resend (feature flag/off nếu chưa bật).

## QA handoff checklist
- Test matrix theo AC-01..AC-10 + negative cases.
- Kiểm thử DB side-effects:
  - signup tạo `users`, `auth_identities`, audit/event đúng
  - verify/login ghi events và session đúng
- Security checks:
  - không có password/token/secret trong logs/events/network payload ngoài chuẩn
- Rate-limit tests (signup/session sync).
- Regression UI signup layout (không landing nav, logo về `/`, không dải đen).

## Migration strategy (PostgreSQL)
- **Phase M1 (expand, non-breaking):**
  1. Enable extension `citext`.
  2. Tạo bảng mới + indexes + constraints.
  3. Deploy code write-path dual safe (ghi đầy đủ bảng mới).
- **Phase M2 (backfill + verify):**
  1. Backfill users hiện hữu (nếu có) từ Firebase export/admin script.
  2. Chạy reconciliation và report drift.
- **Phase M3 (enforce):**
  1. Bật strict checks ở runtime (reject inconsistent critical states).
  2. Chốt dashboard/alerts auth SLO.
- **Rollback plan:**
  - API fallback đọc Firebase trực tiếp cho trạng thái verify nếu mirror lỗi.
  - Không drop bảng trong MVP; chỉ disable write-path mới qua feature flag nếu sự cố.

---

Tài liệu này đủ để BE/FE/QA bắt đầu triển khai ngay cho scope AUTH + User Identity MVP, đồng thời giữ đường mở rộng an toàn cho phase sau mà không thay đổi kiến trúc nền.
