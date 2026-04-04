# [Assets] - QA-01 Contract-First Test Pack (v1.0)

## 1) Scope
- Task: `QA-01`
- Endpoint: `GET /api/v1/user/assets`
- Goal: Verify `status + response shape + error.code` theo contract freeze.

## 2) Preconditions
- DB đã apply: `003.1_create_user_assets_current_truth.sql`
- Có ít nhất 1 user hợp lệ (token hợp lệ).
- Có thể chuẩn bị 2 loại user data:
  - User A: có records trong `user_assets`
  - User B: không có records trong `user_assets`

## 3) Test Matrix
| ID | Scenario | Input | Expected | Status Bucket |
|---|---|---|---|---|
| `ASSET-CT-01` | Happy path | Bearer token hợp lệ (User A) | `200`, payload có đủ: `totalBalanceBTC`, `totalBalanceUSDT`, `fundingAccount`, `tradingAccount`, `assets[]`, `fetchedAt` | `PASS/FAIL` |
| `ASSET-CT-02` | Unauthorized missing token | Không gửi `Authorization` | `401`, `error.code = ASSET_UNAUTHORIZED` | `PASS/FAIL` |
| `ASSET-CT-03` | Unauthorized invalid token | Token sai/expired | `401`, `error.code = ASSET_UNAUTHORIZED` | `PASS/FAIL` |
| `ASSET-CT-04` | Empty portfolio | Bearer token hợp lệ (User B) | `200`, `assets: []`, tổng số dư = `0` | `PASS/FAIL` |
| `ASSET-CT-05` | Shape stability | So payload với freeze note | Không thiếu field đã freeze, không đổi tên field | `PASS/FAIL` |
| `ASSET-CT-06` | Error envelope | Trigger fault injection non-prod (`x-qa-fault-injection: ASSET_FETCH_FAILED`) | `500`, `error.code = ASSET_FETCH_FAILED`, có `error.requestId` | `PASS/FAIL` |

## 4) Evidence Format (Required)
Mỗi case bắt buộc lưu:
- Request (headers/body nếu có)
- Response status
- Response JSON thực tế
- Kết luận: `PASS` / `FAIL` / `BLOCKED`
- Nếu `FAIL/BLOCKED`: owner + action + ETA

## 5) Regression Hook
- Nếu case nào `FAIL`, bắt buộc giữ case đó trong regression smoke cho Assets sprint sau.
