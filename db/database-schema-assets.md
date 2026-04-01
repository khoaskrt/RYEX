# RYEX Database Schema - User Assets

## Table Relationships

```
┌─────────────────────────┐
│   auth.users            │  (Supabase Auth - Built-in)
│   (Authentication)      │
├─────────────────────────┤
│ id (UUID) PK            │◄─────────┐
│ email                   │          │
│ encrypted_password      │          │ (Not used in current impl)
│ created_at              │          │
└─────────────────────────┘          │
                                     │
                                     │
┌─────────────────────────┐          │
│   public.users          │          │
│   (User Profile)        │          │
├─────────────────────────┤          │
│ id (UUID) PK            │◄─────────┤ FK relationship
│ supa_id (legacy)   │          │ (for future direct client access)
│ email                   │          │
│ display_name            │          │
│ status                  │          │
│ kyc_status              │          │
│ created_at              │          │
│ updated_at              │          │
└─────────────────────────┘          │
         │                           │
         │ 1:N                       │
         ▼                           │
┌─────────────────────────┐          │
│   public.user_assets    │          │
│   (Crypto Portfolio)    │          │
├─────────────────────────┤          │
│ id (UUID) PK            │          │
│ user_id (UUID) FK ──────┘          │
│ symbol (VARCHAR)        │
│ balance (NUMERIC)       │
│ account_type (VARCHAR)  │ ── 'funding' or 'trading'
│ created_at              │
│ updated_at              │
│                         │
│ UNIQUE(user_id, symbol, │
│        account_type)    │
└─────────────────────────┘
```

## Current Implementation

### Backend API Flow:
```
1. User logs in → Supabase Auth generates JWT token (contains auth.users.id)
2. FE sends request with Bearer token
3. BE verifies token: supabase.auth.getUser(token) → returns user.id (auth.users.id)
4. BE queries user_assets using service_role_key (bypasses RLS)
5. Query: SELECT * FROM user_assets WHERE user_id = <public.users.id>
```

### Key Mapping:
```javascript
// API route (src/app/api/v1/user/assets/route.js)
const { data: { user } } = await supabase.auth.getUser(token);
const userId = user.id;  // This is public.users.id in current setup

// Repository (src/server/user/assetsRepository.js)
const { data: assets } = await supabase
  .from('user_assets')
  .select('symbol, balance, account_type')
  .eq('user_id', userId);  // FK to public.users.id
```

## Column Mapping Reference

### user_assets ↔ users (public.users)
| user_assets.user_id | → | public.users.id |
|---------------------|---|-----------------|
| Foreign Key         |   | Primary Key     |
| ON DELETE CASCADE   |   | UUID            |

### Data Flow Example:
```
User: john@example.com
├─ auth.users.id:        "a1b2c3d4-..."  (Supabase Auth UUID)
└─ public.users.id:      "x1y2z3w4-..."  (Profile UUID) ◄─┐
                                                           │
   public.user_assets:                                     │
   ├─ id:               "m5n6o7p8-..."                     │
   ├─ user_id:          "x1y2z3w4-..."  ──────────────────┘
   ├─ symbol:           "BTC"
   ├─ balance:          0.58291000
   └─ account_type:     "funding"
```

## RLS Policies (Row Level Security)

Current setup uses **service_role_key** in backend, which **bypasses RLS**.

RLS policies are prepared for future direct client access:
- `service_role` → Full access (current BE pattern)
- Future: Direct client access would use `auth.uid()` with proper mapping

## Migration Files

- **Canonical migration**: `db/migrations/006_create_user_assets.sql`

Apply migration theo thứ tự trong `db/migrations/` (001 -> 006).
