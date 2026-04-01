# RYEX Incident Response Runbook

## Severity Levels

### P0 - Critical
- Service completely down
- Data loss/corruption
- Security breach

### P1 - High
- Major feature broken
- Performance degradation >50%
- Affecting >25% users

### P2 - Medium
- Minor feature broken
- Affecting <25% users

## Response Protocol

### 1. Detection & Triage (5 min)
- Identify severity level
- Check monitoring dashboards
- Verify scope of impact

### 2. Initial Response (15 min)
- Notify team via [communication channel]
- Create incident ticket
- Begin investigation

### 3. Mitigation (varies)
- Apply immediate fix or rollback
- Monitor impact reduction
- Document actions taken

### 4. Post-Incident
- Root cause analysis
- Update runbooks
- Add regression tests

## Common Issues

### Auth Service Down
```bash
# Check DB/Supabase connectivity baseline
npm run db:verify

# Verify session service
curl https://api.ryex.com/v1/auth/health
```

### Market Data Stale
```bash
# Check upstream API
npm run db:location

# Verify cache
# [Add cache check command]
```

---
Last updated: 2026-03-31
