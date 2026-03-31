# Local PostgreSQL setup

## Start database

```bash
npm run db:up
```

Database connection defaults:
- Host: `localhost`
- Port: `5432`
- Database: `ryex_local`
- User: `ryex`
- Password: `ryex_dev_password`

Suggested env var for app:

```env
DATABASE_URL="postgres://ryex:ryex_dev_password@localhost:5432/ryex_local"
```

## Stop database

```bash
npm run db:down
```

## View logs

```bash
npm run db:logs
```

## Apply firebase auth migration

```bash
npm run db:migrate:firebase-auth
```

## Verify auth schema quickly

```bash
npm run db:verify:auth-schema
```

Expected checks:
- `users.email` unique
- `users.firebase_uid` unique (nullable via partial index)
- `users_status_check` exists
- `auth_sessions` indexes exist (`user_id`, `expires_at`, active sessions)

## Recommended local flow

```bash
npm run db:up
npm run db:migrate:firebase-auth
npm run db:verify:auth-schema
```

## Re-run init schema

Init SQL in `db/init/001_schema.sql` only runs when database volume is empty.
If you need to reset and apply from scratch:

```bash
docker compose down -v
docker compose up -d
```
