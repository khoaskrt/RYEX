# RYEX Database

## Overview

Database layer for RYEX crypto exchange. Uses PostgreSQL via Supabase.

## Structure

### `/migrations`
Sequential database schema migrations.

**Naming Convention:**
```
YYYYMMDD_HHMMSS_description.sql
```

**Example:**
```
20240315_120000_create_users_table.sql
20240315_130000_create_sessions_table.sql
```

### `/seeds`
Seed data for development and staging environments.

**Usage:**
```bash
# Load seed data (manual)
psql -h localhost -U postgres -d ryex < db/seeds/dev_data.sql
```

### `/schemas`
Database schema documentation and diagrams.

- Entity-Relationship Diagrams (ERD)
- Table relationships
- Index strategies

## Setup

### Local Development (Docker)
```bash
# Start PostgreSQL
npm run db:up

# Check logs
npm run db:logs

# Stop database
npm run db:down
```

### Verify Connection
```bash
npm run db:test
```

### Verify Tables
```bash
npm run db:verify
```

### Check Data Location
```bash
npm run db:location
```

## Database Schema

### Current Tables

**`users`**
- Primary user records
- Synced from Firebase Auth
- Contains: uid, email, display_name, etc.

**`sessions`**
- Active user sessions
- Used for session management
- Auto-cleanup on expiry

### Planned Tables

**Trading Domain:**
- `orders` - Order history
- `trades` - Executed trades
- `balances` - User balances per token

**Wallet Domain:**
- `deposits` - Deposit transactions
- `withdrawals` - Withdrawal transactions
- `addresses` - Wallet addresses

**Compliance Domain:**
- `kyc_records` - KYC verification status
- `audit_logs` - Audit trail

## Connection Configuration

### Environment Variables
```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Local PostgreSQL (Development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ryex
```

### Connection Priority
1. Supabase (if configured)
2. Local PostgreSQL (fallback)

## Migration Strategy

### Creating Migrations
1. Create new SQL file in `migrations/`
2. Use timestamp-based naming
3. Include both UP and DOWN migrations
4. Test on local DB first

### Running Migrations
```bash
# Manual (for now)
psql -h localhost -U postgres -d ryex < db/migrations/20240315_120000_new_migration.sql

# TODO: Automated migration tool
```

## Backup & Recovery

### Backup
```bash
# Local backup
pg_dump -h localhost -U postgres ryex > backup.sql

# Production backup
# [Configure automated backups in Supabase dashboard]
```

### Restore
```bash
psql -h localhost -U postgres ryex < backup.sql
```

## Security

- ✅ Never commit credentials
- ✅ Use environment variables
- ✅ Row-level security (RLS) in Supabase
- ✅ Principle of least privilege
- ✅ Audit sensitive operations

## Troubleshooting

### Connection Issues
```bash
# Test connection
npm run db:test

# Check if tables exist
npm run db:verify

# Verify data location
npm run db:location
```

### Common Issues
1. **Port 5432 in use**: Another PostgreSQL instance running
2. **Connection refused**: Docker not started
3. **Auth failed**: Check credentials in `.env.local`

## References

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [RYEX Domain SOT](../docs/domain/data-sot.md)
