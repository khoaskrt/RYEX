# RYEX Source Code Structure

## Overview

This directory contains all source code for the RYEX crypto exchange platform.

## Folder Structure

### `/app` - Next.js App Router
- `(marketing)/` - Public marketing pages (/, /about)
- `(webapp)/app/` - Authenticated app routes (market, trading, portfolio, wallet)
- `api/v1/` - API route handlers
- `price/` - Token price detail pages

### `/features` - Feature Modules
Each feature is self-contained with its own:
- Components
- Hooks
- Utilities
- Business logic

**Current Features:**
- `auth/` - Authentication (signup, login, verify)
- `landing-page/` - Landing page components
- `market/` - Market data (tickers, charts, realtime)

**Planned Features:**
- `trading/` - Order placement and execution
- `portfolio/` - Holdings and PnL tracking
- `wallet/` - Deposits, withdrawals, balances

### `/server` - Server-Side Business Logic
Domain services that handle business rules, data access, and external integrations.

**Structure per domain:**
- `repository.js` - Database queries
- `service.js` - Business logic
- `validation.js` - Input validation
- `errors.js` - Domain-specific errors

**Current Domains:**
- `auth/` - User authentication
- `market/` - Market data fetching
- `db/` - Database infrastructure

### `/shared` - Shared Utilities
Cross-cutting concerns used by multiple features.

- `components/` - Reusable UI components
  - `ui/` - Base components (Button, Input, Modal)
  - `layout/` - Layout components (Header, Footer)
  - `charts/` - Chart components
- `hooks/` - Shared React hooks
- `lib/` - Shared libraries
  - `auth/` - Auth utilities
  - `supabase/` - Supabase client
  - `firebase/` - Firebase client
  - `format/` - Formatting utilities
- `config/` - App configuration
- `types/` - TypeScript types (when migrated)
- `styles/` - Global styles

### `/utils` [DEPRECATED]
⚠️ This folder is deprecated. New code should use `/shared/lib/` instead.
Existing code will be migrated gradually.

## Development Guidelines

### Adding a New Feature
1. Create feature folder in `/features/[feature-name]/`
2. Keep feature-specific code isolated
3. Extract shared utilities to `/shared/`
4. Add API routes in `/app/api/v1/[feature-name]/`
5. Add domain logic in `/server/[feature-name]/`

### Code Organization Principles
- **Feature-first**: Group by feature, not by type
- **Colocation**: Keep related code together
- **Separation of Concerns**: UI (features) ↔ Business Logic (server) ↔ Infrastructure (shared)
- **Domain-Driven**: Each domain is independent

### Import Paths
```javascript
// Features
import { MarketTable } from '@/features/market/components/MarketTable'

// Shared
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/hooks/useAuth'

// Server (API routes only)
import { authService } from '@/server/auth/service'

// Config
import { API_ENDPOINTS } from '@/shared/config/api-endpoints'
```

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Auth**: Firebase Authentication
- **Charts**: Lightweight Charts

## Next Steps
- [ ] Migrate `/utils/` to `/shared/lib/`
- [ ] Add TypeScript support
- [ ] Implement Trading feature
- [ ] Implement Wallet feature
- [ ] Add comprehensive test coverage
