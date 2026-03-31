---
name: ryex-qa-skill
description: QA rules for RYEX. Keep checks risk-first, contract-driven, and evidence-based before FE/BE handoff or release.
---

# RYEX QA Rule (Simple + Optimized) — v1

## 1) Scope Rule
- Test theo rủi ro thay đổi:
1. Auth/session/callback -> Auth Pack bắt buộc.
2. Market/tickers/realtime/pagination -> Market Pack bắt buộc.
3. User profile API -> User Pack bắt buộc.

## 2) Contract Rule
- Luôn check đủ 3 lớp: HTTP status + response shape + `error.code`.
- Không chấp nhận pass nếu FE chạy được nhưng contract API lệch.

## 3) Classification Rule
- Mỗi case phải có đúng 1 trạng thái: `PASS`, `FAIL`, hoặc `BLOCKED`.
- `BLOCKED` chỉ dùng cho env/tool/data blocker, không dùng để che lỗi logic.

## 4) Security Rule
- QA phải kiểm tra không lộ secrets/tokens nhạy cảm trên client và logs chính.
- Cookie auth phải đúng baseline: `HttpOnly`, `SameSite=Lax`, `Secure` theo env.

## 5) Delivery Rule
- Trước khi kết luận QA: chạy `npm run build`.
- Nếu đụng auth/db: chạy thêm `npm run db:verify`.
- Báo cáo bắt buộc gồm: scope, matrix, defects, residual risks, recommendation.

## 6) Living Rule
- Mọi bug đã fix phải được thêm vào `.codex/Rule/qa-living-matrix.md`:
1. 1 case tái hiện bug.
2. 1 case negative lân cận.
3. ngày + file fix chính.
