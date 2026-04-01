# User Assets API - BA Brief (v1.0)

## 1. Problem framing
- **Business goal**: Enable users to view their real crypto asset balances across funding and trading accounts to manage their portfolio effectively.
- **User pain**: Currently users see hardcoded demo data on `/app/assets` page. They cannot see their actual holdings, making the page unusable for real portfolio management.
- **KPI**:
  - 100% authenticated users can view their real asset balances
  - API response time < 500ms (p95)
  - Zero unauthorized access to other users' asset data

## 2. Scope
### In-scope (P0)
- GET `/api/v1/user/assets` endpoint returning user's total balance, account breakdown, and asset list
- Authentication via Firebase bearer token (consistent with `/api/v1/user/profile` pattern)
- Response includes: total BTC/USDT balance, funding account balance, trading account balance, asset list with current prices
- Error handling for: unauthorized (401), user not found (404), server error (500)
- Price data integration from existing market module (`fetchMarketTickers`)

### Out-of-scope
- Real-time WebSocket updates (use polling for now, same as market page)
- Asset transaction history (covered in separate History feature)
- Deposit/withdraw/transfer actions (separate endpoints)
- Multi-currency base display (USDT only for v1.0)

## 3. Runtime Gap
**Expected behavior**: API should return real user balances from database
**Current behavior**: FE shows hardcoded demo data
**Proposed resolution**:
1. Create user_assets table in Postgres with columns: user_id, symbol, balance, account_type (funding/trading)
2. BE endpoint queries this table and joins with live market prices
3. FE replaces hardcoded data with API call

## 4. User stories
### US-01: View total asset balance (P0)
As an authenticated user, I want to see my total crypto holdings in BTC and USDT equivalent, so I can understand my overall portfolio value.

### US-02: View account breakdown (P0)
As an authenticated user, I want to see separate balances for my funding and trading accounts, so I can manage liquidity across accounts.

### US-03: View asset list with live prices (P0)
As an authenticated user, I want to see a list of all my assets with current market prices and USDT value, so I can track individual holdings.

### US-04: Error handling (P0)
As a user, when API fails or I'm not authorized, I should see clear error messages instead of broken UI.

## 5. Acceptance criteria (Given/When/Then)

### AC-01: Successful asset fetch
- **Given**: User is authenticated with valid Firebase token
- **When**: User requests `GET /api/v1/user/assets` with `Authorization: Bearer <valid_token>`
- **Then**:
  - API returns HTTP 200
  - Response shape matches:
    ```json
    {
      "totalBalanceBTC": "1.42857400",
      "totalBalanceUSDT": "92450.25",
      "fundingAccount": {
        "balanceBTC": "0.58291000",
        "balanceUSDT": "37714.28"
      },
      "tradingAccount": {
        "balanceBTC": "0.84566400",
        "balanceUSDT": "54735.97"
      },
      "assets": [
        {
          "symbol": "BTC",
          "name": "Bitcoin",
          "balance": "1.42857400",
          "price": "64714.20",
          "valueUSDT": "92450.25",
          "iconUrl": "https://...",
          "accountType": "combined"
        }
      ],
      "fetchedAt": "2024-04-01T10:30:00.000Z"
    }
    ```

### AC-02: Unauthorized access
- **Given**: User sends request without bearer token or with invalid token
- **When**: User requests `GET /api/v1/user/assets`
- **Then**:
  - API returns HTTP 401
  - Response: `{ "error": { "code": "ASSET_UNAUTHORIZED", "message": "Unauthorized" } }`

### AC-03: User not found
- **Given**: Valid Firebase token but user doesn't exist in database
- **When**: User requests `GET /api/v1/user/assets`
- **Then**:
  - API returns HTTP 404
  - Response: `{ "error": { "code": "ASSET_USER_NOT_FOUND", "message": "User not found" } }`

### AC-04: Server error
- **Given**: Database connection fails or unexpected error occurs
- **When**: User requests `GET /api/v1/user/assets`
- **Then**:
  - API returns HTTP 500
  - Response: `{ "error": { "code": "ASSET_FETCH_FAILED", "message": "Failed to fetch assets" } }`
  - Error is logged server-side with requestId for debugging

### AC-05: Empty asset list (new user)
- **Given**: User exists but has no assets yet
- **When**: User requests `GET /api/v1/user/assets`
- **Then**:
  - API returns HTTP 200
  - `assets` array is empty `[]`
  - `totalBalanceBTC` and `totalBalanceUSDT` are `"0"`

### AC-06: Price calculation accuracy
- **Given**: User has 1.5 BTC at current price $64,714.20
- **When**: API calculates `valueUSDT`
- **Then**: `valueUSDT` = "97071.30" (1.5 × 64714.20, formatted to 2 decimal places)

## 6. Impact map

### FE impact
- **Files**: `src/app/(webapp)/app/assets/page.js`
- **Changes**:
  - Replace `HARDCODED_ASSETS` with API call to `/api/v1/user/assets`
  - Add loading state during fetch
  - Add error state with retry button
  - Integrate real-time price updates from market client (reuse existing `fetchMarketTickers` pattern)
  - Handle empty state for new users
- **New dependencies**: None (reuse existing market client utilities)

### BE impact
- **New files**:
  - `src/app/api/v1/user/assets/route.js` (route handler)
  - `src/server/user/assetsRepository.js` (data layer)
- **Database changes**:
  - Create `user_assets` table:
    ```sql
    CREATE TABLE user_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symbol VARCHAR(20) NOT NULL,
      balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
      account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('funding', 'trading')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, symbol, account_type)
    );
    CREATE INDEX idx_user_assets_user_id ON user_assets(user_id);
    ```
- **Runtime**: `export const runtime = 'nodejs'` (uses Postgres + Supabase)
- **Auth pattern**: Reuse `extractBearerToken` + `verifyFirebaseUid` from `/api/v1/user/profile`

### QA impact
- **New test pack**: User Assets Pack (add to `.codex/Rule/qa-living-matrix.md`)
- **Test cases**:
  - ASSET-01: GET /api/v1/user/assets without token → 401 ASSET_UNAUTHORIZED
  - ASSET-02: GET /api/v1/user/assets with invalid token → 401 ASSET_UNAUTHORIZED
  - ASSET-03: GET /api/v1/user/assets with valid token, user exists → 200 with correct shape
  - ASSET-04: GET /api/v1/user/assets for new user (no assets) → 200 with empty assets array
  - ASSET-05: Verify price calculation accuracy (balance × market price = valueUSDT)
  - ASSET-06: Verify total balance = sum of all account balances
- **Regression scope**:
  - Auth Pack: ensure existing auth endpoints still work
  - User Pack: ensure `/api/v1/user/profile` unaffected

## 7. Risks + decisions

### Risks
1. **Performance risk (Medium)**:
   - If user has 100+ assets, joining with live market prices may be slow
   - **Mitigation**: Add pagination if needed (defer to P1), optimize SQL with proper indexes

2. **Data consistency risk (Low)**:
   - Market price updates may lag, causing temporary value mismatch
   - **Mitigation**: Include `fetchedAt` timestamp so user knows data freshness

3. **Security risk (Low)**:
   - Must ensure users can only see their own assets
   - **Mitigation**: Always filter by `firebase_uid` in repository layer, never trust user input for user_id

4. **Migration risk (Low)**:
   - Need to populate initial demo data for existing test users
   - **Mitigation**: Create seed script to populate `user_assets` table for test accounts

### Decisions cần PO chốt
1. **Initial asset seeding**: Should we auto-create demo balances for new signups, or start with $0?
   - **Recommendation**: Start with $0 (empty state), require explicit deposit action

2. **Price data source**: Reuse market module's Binance/CoinGecko proxy or fetch separately?
   - **Recommendation**: Reuse `fetchMarketTickers()` to avoid duplicate API calls and ensure consistency

3. **Account type handling**: Support funding/trading split in v1.0 or show combined first?
   - **Recommendation**: Support split in API from day 1 (easier than migration later), FE displays both

## 8. Delta
N/A - Initial version

---

## API Contract Specification

### Endpoint
```
GET /api/v1/user/assets
```

### Headers
```
Authorization: Bearer <firebase_id_token>
```

### Response (200 OK)
```json
{
  "totalBalanceBTC": "1.42857400",
  "totalBalanceUSDT": "92450.25",
  "fundingAccount": {
    "balanceBTC": "0.58291000",
    "balanceUSDT": "37714.28"
  },
  "tradingAccount": {
    "balanceBTC": "0.84566400",
    "balanceUSDT": "54735.97"
  },
  "assets": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "balance": "1.42857400",
      "price": "64714.20",
      "valueUSDT": "92450.25",
      "iconUrl": "https://...",
      "fundingBalance": "0.58291000",
      "tradingBalance": "0.84566400"
    }
  ],
  "fetchedAt": "2024-04-01T10:30:00.000Z"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": {
    "code": "ASSET_UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

#### 404 Not Found
```json
{
  "error": {
    "code": "ASSET_USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "ASSET_FETCH_FAILED",
    "message": "Failed to fetch assets"
  }
}
```

---

## Handoff Checklist
- [x] Business goal + KPI defined
- [x] User stories written with Given/When/Then AC
- [x] P0/P1/P2 priority assigned
- [x] FE/BE/QA impact mapped
- [x] API contract specified (endpoint, auth, response shape, error codes)
- [x] Database schema defined
- [x] Risks identified with mitigation
- [x] Open decisions listed for PO
- [x] QA test pack cases listed

**Status**: ✅ Ready for handoff to BE team

**Next action**: BE team implements route handler + repository, then FE integrates API
