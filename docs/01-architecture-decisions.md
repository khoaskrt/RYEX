# RYEX Architecture Decisions (ADR Lite)

## 1) Document Control
- Version: `v1.1`
- Owner: `BA + Tech Lead`
- Last updated: `2026-04-02`
- Status: `Active`
- Related map: `docs/00-system-map.md`
- Purpose: Ghi lại các quyết định kiến trúc có ảnh hưởng cross-domain để giảm conflict khi mở rộng team.

## 2) ADR Lite Working Rules
- Mỗi decision phải có: `Context`, `Decision`, `Consequences`, `Status`.
- Chỉ ghi các quyết định ảnh hưởng nhiều role/domain (không ghi chi tiết code-level nhỏ).
- Status chuẩn:
  - `Accepted`: đang áp dụng.
  - `Proposed`: đang chờ chốt.
  - `Superseded`: đã bị thay thế (phải chỉ rõ ADR mới thay thế).
- Mọi thay đổi sau khi chốt phải thêm `Delta` ở cuối tài liệu.

## 3) Decision Log
| ADR ID | Title | Status | Date | Owner |
|---|---|---|---|---|
| ADR-001 | Layered architecture: App Router -> API v1 -> Domain Services | Accepted | 2026-03-31 | Tech Lead |
| ADR-002 | Auth authority: Supabase Auth + Postgres/Supabase audit/session data | Accepted | 2026-03-31 | BE |
| ADR-003 | Market data strategy: Backend proxy + stale fallback | Accepted | 2026-03-31 | BE |
| ADR-004 | API contract normalization (`error` vs `error.code`) | Proposed | 2026-03-31 | BA + BE + QA |
| ADR-005 | FE auth unification (2 pattern -> 1 journey chuẩn) | Proposed | 2026-03-31 | PO + BA + FE |
| ADR-006 | Web shell consistency: App uses Landing Footer, Landing uses App Header | Accepted | 2026-04-02 | BA + FE |

## 4) ADR Details
### ADR-001: Layered architecture: App Router -> API v1 -> Domain Services
- Status: `Accepted`
- Context:
  - MVP cần tốc độ delivery cao nhưng vẫn giữ boundary rõ giữa UI và business logic.
  - Codebase đã tổ chức theo `src/app`, `src/app/api/v1`, `src/server`.
- Decision:
  - Chuẩn hóa luồng xử lý theo 3 lớp:
    - UI (App Router + feature modules)
    - API v1 route handlers
    - Domain services và data access
- Consequences:
  - FE/BE handoff rõ hơn, giảm logic business nằm rải rác ở UI.
  - Cần kỷ luật code review để tránh route handler “phình” logic.

### ADR-002: Auth authority: Supabase Auth + Postgres/Supabase audit/session data
- Status: `Accepted`
- Context:
  - Cần xử lý signup/verify/session nhanh cho MVP nhưng vẫn có audit trail.
  - Runtime hiện có Supabase Auth + lưu dữ liệu user/audit vào DB.
- Decision:
  - Supabase Auth là nguồn xác thực chính.
  - Postgres/Supabase lưu user projection, verification events, audit events, session-related data.
- Consequences:
  - Đáp ứng nhanh MVP auth và khả năng truy vết vận hành.
  - Tăng yêu cầu đồng bộ contract giữa Supabase Auth state và DB state.

### ADR-003: Market data strategy: Backend proxy + stale fallback
- Status: `Accepted`
- Context:
  - UI cần dữ liệu thị trường realtime nhưng không phụ thuộc trực tiếp upstream từ client.
  - Upstream market APIs có khả năng bị degrade theo thời điểm.
- Decision:
  - Client chỉ gọi API nội bộ (`/api/v1/market/*`).
  - Backend proxy tới Binance/CoinGecko và ưu tiên trải nghiệm “degraded but usable” qua stale fallback.
- Consequences:
  - Giảm coupling client-upstream, tăng khả năng kiểm soát contract.
  - Cần monitor rõ trạng thái stale để QA và vận hành phát hiện bất thường.

### ADR-004: API contract normalization (`error` vs `error.code`)
- Status: `Proposed`
- Context:
  - Hiện trạng API có nguy cơ không đồng nhất error envelope giữa các endpoint.
  - QA cần contract-first verification; FE cần error mapping ổn định.
- Decision:
  - Đề xuất chuẩn hóa envelope lỗi API v1 về format thống nhất, có `error.code` bắt buộc cho nhánh lỗi nghiệp vụ.
- Consequences:
  - Giảm ambiguity khi test và xử lý lỗi trên UI.
  - Cần effort migration endpoint hiện tại + update regression pack.
- Open points:
  - Danh sách `error.code` canonical theo domain Auth/Market/Profile.
  - Mức backward compatibility trong giai đoạn chuyển đổi.

### ADR-005: FE auth unification (2 pattern -> 1 journey chuẩn)
- Status: `Proposed`
- Context:
  - FE hiện tồn tại song song `AuthModulePage` và `StitchLoginPage`.
  - Rủi ro lệch UX, lệch behavior, và tăng cost regression khi mở rộng role.
- Decision:
  - Đề xuất gom về 1 journey auth chuẩn cho MVP+1, đồng bộ với auth contract backend.
- Consequences:
  - Giảm conflict nghiệp vụ và giảm duplicate test scope.
  - Cần plan chuyển đổi route/screen/state và truyền thông nội bộ để tránh break flow.
- Open points:
  - Chọn journey chuẩn cuối cùng.
  - Lộ trình deprecate pattern còn lại.

### ADR-006: Web shell consistency: App uses Landing Footer, Landing uses App Header
- Status: `Accepted`
- Context:
  - Landing page và các app page đang có header/footer khác nhau, gây lệch nhận diện và tăng scope regression khi đổi UI shell.
  - Product yêu cầu đồng bộ chéo: footer app theo landing, header landing theo app baseline.
- Decision:
  - Chuẩn hóa footer toàn bộ app pages theo landing footer component dùng chung.
  - Landing page dùng header theo app shell baseline (market-style top nav).
- Consequences:
  - Giảm sai lệch giao diện giữa marketing và app shell.
  - Tăng tính tái sử dụng component và giảm duplicate footer code khi có thay đổi nội dung pháp lý/branding.

## 5) Decision Intake Template (Copy/Paste)
```md
### ADR-XXX: [Title]
- Status: `Proposed | Accepted | Superseded`
- Context:
  - ...
- Decision:
  - ...
- Consequences:
  - ...
- Open points (optional):
  - ...
- Superseded by (if any):
  - ADR-YYY
```

## 6) Review Cadence
- Review định kỳ: mỗi sprint planning và sau incident lớn.
- Điều kiện bắt buộc tạo ADR mới:
  - Thay đổi ảnh hưởng >= 2 domain.
  - Thay đổi contract API/UI làm đổi QA regression scope.
  - Thay đổi công nghệ nền tảng hoặc auth/data authority.

## 7) Delta
- `v1.0` (2026-03-31):
  - Created tài liệu ADR lite ban đầu.
  - Seed 5 ADR theo runtime hiện tại của MVP.
- `v1.1` (2026-04-02):
  - Added ADR-006 cho quyết định đồng bộ shell UI giữa landing và app.
  - Updated document control version/date.
