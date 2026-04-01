# [Assets] - Task Breakdown (v1.0)

## 1) Sprint Goal
- Đưa flow `/app/assets` về trạng thái production-ready ở mức MVP: chạy ổn định theo contract, có data baseline rõ, testable end-to-end.

## 2) Work Breakdown by Owner

### BE Owner
- `BE-01 (P0)`: Chốt migration current-truth cho `user_assets`.
  - Output: migration SQL mới + apply order rõ trong `db/migrations`.
  - Dependency: none.
- `BE-02 (P0)`: Cập nhật schema snapshot cho `user_assets`.
  - Output: `db/schema/user_assets.md` (column/constraint/index/RLS).
  - Dependency: `BE-01`.
- `BE-03 (P0)`: Xác nhận contract endpoint `GET /api/v1/user/assets` (status, error.code, payload shape) non-breaking.
  - Output: contract freeze note + response examples happy/401/empty.
  - Dependency: `BE-01`.
- `BE-04 (P1)`: Harden logging/observability cho assets API (không lộ token/PII).
  - Output: log guideline + sanitized logs.
  - Dependency: `BE-03`.

### FE Owner
- `FE-01 (P0)`: Xác nhận mapping UI theo contract assets đã chốt.
  - Output: mapping matrix field API -> UI component.
  - Dependency: `BE-03`.
- `FE-02 (P0)`: Hoàn thiện UX states cho `/app/assets`.
  - Output: loading/error/empty-state theo AC.
  - Dependency: `FE-01`.
- `FE-03 (P1)`: Chuẩn hóa copy lỗi theo `error.code` assets.
  - Output: bảng `error.code -> UI message`.
  - Dependency: `BE-03`.

### QA Owner
- `QA-01 (P0)`: Thiết kế test pack contract-first cho assets API.
  - Output: test cases happy/401/empty/schema-drift guard.
  - Dependency: `BE-03`.
- `QA-02 (P0)`: Chạy regression webapp liên quan auth -> assets.
  - Output: report PASS/FAIL/BLOCKED + evidence.
  - Dependency: `QA-01`, `FE-02`.
- `QA-03 (P1)`: Thiết lập checklist release gate cho Assets.
  - Output: sign-off checklist trước deploy.
  - Dependency: `QA-02`.

### BA Owner
- `BA-01 (P0)`: Cập nhật ownership map để include Assets domain flow.
  - Output: update `docs/00-system-map.md`.
  - Dependency: none.
- `BA-02 (P0)`: Bổ sung `/api/v1/user/assets` vào API contract matrix.
  - Output: update `docs/contracts/api-v1.md`.
  - Dependency: `BE-03`.
- `BA-03 (P0)`: Đồng bộ Data SoT để loại bỏ mismatch migration history.
  - Output: update `docs/domain/data-sot.md`.
  - Dependency: `BE-01`, `BE-02`.
- `BA-04 (P1)`: Publish final handoff pack FE/BE/QA cho Assets.
  - Output: release-ready brief + open decisions log.
  - Dependency: `FE-02`, `QA-02`, `BA-02`, `BA-03`.

## 3) Execution Order (Recommended)
1. `BE-01` -> `BE-02` -> `BE-03`
2. Song song: `FE-01/FE-02` và `QA-01`
3. `QA-02`
4. `BA-01/BA-02/BA-03`
5. P1 hardening + final publish (`BE-04`, `FE-03`, `QA-03`, `BA-04`)

## 4) RACI (Quick)
- Data baseline (`user_assets`): **R=BE**, A=BE Lead, C=BA/QA, I=FE
- API contract assets: **R=BE+BA**, A=PO/Lead, C=QA/FE, I=All
- UI states assets: **R=FE**, A=FE Lead, C=BA/QA, I=BE
- Regression & release gate: **R=QA**, A=QA Lead, C=FE/BE/BA, I=PO

## 5) Ready-to-Assign Checklist
- [x] Migration `user_assets` đã chốt và apply order rõ.
- [x] Contract `/api/v1/user/assets` đã freeze (happy/401/empty).
- [x] FE states pass theo AC.
- [x] QA report PASS hoặc có blocker rõ owner + ETA.
- [x] Docs SoT (`system-map`, `api-v1`, `data-sot`) đã đồng bộ.
