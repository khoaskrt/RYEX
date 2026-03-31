# RYEX Deployment Runbook

## Pre-Deployment Checklist

- [ ] All tests passing (`npm run build`)
- [ ] Database migrations ready (`db/migrations/`)
- [ ] Environment variables configured
- [ ] Staging deployment successful
- [ ] Security review completed

## Deployment Steps

### 1. Prepare Release
```bash
npm run build
npm run db:verify
```

### 2. Database Migration
```bash
# Run migrations in production
npm run db:migrate:prod
```

### 3. Deploy Application
```bash
# Deploy to production
npm run deploy
```

### 4. Post-Deployment Verification
- [ ] Health check endpoints responding
- [ ] Auth flow working
- [ ] Market data updating
- [ ] Monitor error logs for 15 minutes

## Rollback Procedure

If issues detected:
```bash
# Rollback to previous version
npm run deploy:rollback
```

## Monitoring

- Error tracking: [Link to monitoring dashboard]
- Performance metrics: [Link to metrics]
- User analytics: [Link to analytics]

---
Last updated: 2026-03-31
