# [Assets] - API Contract Freeze Note (v1.0)

## 1) Freeze Scope
- Endpoint: `GET /api/v1/user/assets`
- Freeze date: `2026-04-01`
- Owner: `BE`
- Contract type: `non-breaking freeze` cho sprint hiện tại

## 2) Request Contract
- Method: `GET`
- Headers:
  - `Authorization: Bearer <supabase_access_token>` (required)
  - `Content-Type: application/json` (optional for GET, accepted)
- Body: none

## 3) Response Contract (Frozen)
### 3.1 Success `200`
```json
{
  "totalBalanceBTC": "0.00000000",
  "totalBalanceUSDT": "0.00",
  "fundingAccount": {
    "balanceBTC": "0.00000000",
    "balanceUSDT": "0.00"
  },
  "tradingAccount": {
    "balanceBTC": "0.00000000",
    "balanceUSDT": "0.00"
  },
  "assets": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "balance": "0.10000000",
      "price": "65000.00",
      "valueUSDT": "6500.00",
      "iconUrl": "https://...",
      "fundingBalance": "0.05000000",
      "tradingBalance": "0.05000000"
    }
  ],
  "fetchedAt": "2026-04-01T16:00:00.000Z"
}
```

### 3.2 Unauthorized `401`
```json
{
  "error": {
    "code": "ASSET_UNAUTHORIZED",
    "message": "Unauthorized",
    "requestId": "trace-id"
  }
}
```

### 3.3 Server error `500`
```json
{
  "error": {
    "code": "ASSET_FETCH_FAILED",
    "message": "Failed to fetch assets",
    "requestId": "trace-id"
  }
}
```

### 3.4 Not found `404` (reserved)
```json
{
  "error": {
    "code": "ASSET_USER_NOT_FOUND",
    "message": "User not found",
    "requestId": "trace-id"
  }
}
```
Note: `404` đang là nhánh reserve trong route; hiện runtime chủ yếu trả `401` hoặc `500` cho lỗi auth/data.

## 4) Example Scenarios (Frozen)
### 4.1 Happy path (has balances)
- Status: `200`
- `assets.length > 0`
- Các field số đều trả dạng string để giữ ổn định với FE hiện tại.

### 4.2 Empty portfolio
- Status: `200`
- `assets: []`
- `totalBalanceBTC = "0.00000000"`, `totalBalanceUSDT = "0.00"`
- `fundingAccount/tradingAccount` đều bằng `0`.

### 4.3 Missing/invalid token
- Status: `401`
- Error code: `ASSET_UNAUTHORIZED`

## 5) Compatibility Rules
- Không đổi tên field trong payload success đã freeze.
- Không đổi `error.code` hiện có (`ASSET_UNAUTHORIZED`, `ASSET_FETCH_FAILED`) trong sprint này.
- Nếu cần chuẩn hóa sang envelope `{ data, meta }`, xử lý ở phase `P1` và phải có non-breaking plan.

## 6) Source of Freeze
- Route: `src/app/api/v1/user/assets/route.js`
- Domain payload builder: `src/server/user/assetsRepository.js`
- Data baseline: `db/migrations/003_create_user_assets_current_truth.sql`
