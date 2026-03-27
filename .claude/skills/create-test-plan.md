---
skill: create-test-plan
description: Tạo test plan chi tiết cho sprints và releases của RYEX
tags: [qa, test-plan, strategy]
model: sonnet
---

# Tạo Test Plan

Bạn là QA Engineer chuyên lập kế hoạch testing cho dự án RYEX.

## Nhiệm vụ

Tạo test plan toàn diện cho sprint/release, bao gồm:
1. Test scope & objectives
2. Test strategy (manual vs automated)
3. Test schedule & resources
4. Entry/exit criteria
5. Risk assessment
6. Test deliverables

## Test Plan Template

### Cấu Trúc File

Tạo file tại `/tests/test-plans/<sprint-or-release>-test-plan.md`:

```markdown
# Test Plan: [Sprint/Release Name]

**Project:** RYEX - Licensed Crypto Exchange
**Version:** [Sprint X / Release v1.0]
**Test Plan ID:** TP-XXX
**Author:** QA Agent
**Date:** [YYYY-MM-DD]
**Status:** Draft | Approved | In Progress | Completed

---

## 1. Executive Summary

### 1.1 Purpose
[Why are we testing this sprint/release?]

Example:
- Validate MVP Week 1 features before production launch
- Ensure authentication flow is secure and functional
- Verify VASP compliance for KYC/AML features

### 1.2 Scope Summary
**In Scope:**
- Authentication (login, signup, logout)
- Session management (JWT, refresh tokens)
- User profile (basic info display)
- Market data page (read-only)

**Out of Scope:**
- Trading engine (planned for Sprint 2)
- Crypto deposits/withdrawals (planned for Sprint 3)
- Mobile app testing (web only for MVP)

### 1.3 Test Objectives
1. ✅ Verify all P0 user stories meet acceptance criteria
2. ✅ Ensure no critical security vulnerabilities
3. ✅ Validate VASP compliance requirements
4. ✅ Confirm Vietnamese UX is error-free
5. ✅ Achieve >80% automated test coverage

---

## 2. Test Scope

### 2.1 Features to Test

| Feature ID | Feature Name | Priority | Test Type | Status |
|------------|--------------|----------|-----------|--------|
| RYEX-001 | User Signup | P0 | Functional, Security | Planned |
| RYEX-002 | User Login | P0 | Functional, Security, Performance | Planned |
| RYEX-003 | Session Management | P0 | Functional, Security | Planned |
| RYEX-004 | User Profile | P1 | Functional, UI | Planned |
| RYEX-005 | Market Data | P1 | Functional, Performance | Planned |

### 2.2 Test Types

#### Functional Testing
- [ ] Feature functionality (happy path)
- [ ] Negative testing (invalid inputs)
- [ ] Edge cases (boundary conditions)
- [ ] Integration testing (API + DB + Firebase)

#### Non-Functional Testing
- [ ] Security testing (OWASP Top 10)
- [ ] Performance testing (load, stress)
- [ ] Usability testing (Vietnamese UX)
- [ ] Compatibility testing (browsers, devices)
- [ ] Compliance testing (VASP requirements)

#### Regression Testing
- [ ] Smoke tests (critical paths)
- [ ] Full regression suite (all previous features)

### 2.3 Test Levels

| Level | Description | Coverage |
|-------|-------------|----------|
| **Unit Testing** | Test individual functions/components | 80%+ (dev responsibility) |
| **Integration Testing** | Test API + DB + Firebase | 100% of APIs |
| **System Testing** | Test complete user flows | 100% of P0/P1 stories |
| **UAT** | User acceptance testing | 5 beta users |

---

## 3. Test Strategy

### 3.1 Manual vs Automated

| Test Type | Manual | Automated | Tool |
|-----------|--------|-----------|------|
| Functional (Happy Path) | 20% | 80% | Playwright |
| Functional (Negative) | 30% | 70% | Playwright |
| Security | 10% | 90% | OWASP ZAP, custom scripts |
| Performance | 0% | 100% | k6 |
| UI/UX (Vietnamese) | 100% | 0% | Manual review |
| Regression | 10% | 90% | Playwright |

**Rationale:**
- Automate repetitive tests (login, API calls)
- Manual testing for UX, design, Vietnamese text
- Security automated via scripts + manual penetration testing

### 3.2 Test Environment

| Environment | Purpose | URL | Status |
|-------------|---------|-----|--------|
| **Local** | Developer testing | localhost:3000 | Active |
| **Staging** | QA testing, UAT | staging.ryex.vn | Active |
| **Production** | Live users | ryex.vn | Not yet deployed |

**Environment Setup:**
- Database: Separate staging PostgreSQL (Supabase)
- Firebase: Test project (not production)
- Test Data: Seeded test users (see `/tests/test-data/`)

### 3.3 Test Data Strategy

**Test Users:**
```json
{
  "unverified_user": {
    "email": "unverified@test.ryex.vn",
    "password": "Test@123456",
    "kyc_status": "UNVERIFIED"
  },
  "verified_user": {
    "email": "verified@test.ryex.vn",
    "password": "Test@123456",
    "kyc_status": "VERIFIED",
    "balance": 10000000
  },
  "admin": {
    "email": "admin@test.ryex.vn",
    "password": "Admin@123456",
    "role": "ADMIN"
  }
}
```

**Test Data Refresh:**
- Daily reset of staging database (automated script)
- Seed script: `/tests/scripts/seed-test-data.sql`

---

## 4. Entry & Exit Criteria

### 4.1 Entry Criteria (When to Start Testing)

- [ ] All P0 features code-complete
- [ ] Unit tests pass (>80% coverage)
- [ ] Dev team self-tested features
- [ ] Code deployed to staging
- [ ] Test environment ready (staging DB, Firebase)
- [ ] Test data seeded
- [ ] Test cases written and reviewed

### 4.2 Exit Criteria (When to Stop Testing & Release)

- [ ] All P0 test cases executed (100%)
- [ ] All P0 bugs fixed and verified
- [ ] No critical (P0) bugs open
- [ ] <3 high (P1) bugs open (with workarounds)
- [ ] >95% pass rate for automated tests
- [ ] Performance benchmarks met (login <500ms p95)
- [ ] Security scan passed (no critical vulnerabilities)
- [ ] UAT approved by 5 beta users
- [ ] Vietnamese text reviewed by native speaker
- [ ] Compliance checklist completed (VASP requirements)

---

## 5. Test Schedule

### 5.1 Timeline

| Phase | Activity | Start Date | End Date | Owner | Status |
|-------|----------|------------|----------|-------|--------|
| 1 | Test Planning | 2026-03-20 | 2026-03-22 | QA Lead | Done |
| 2 | Test Case Writing | 2026-03-23 | 2026-03-25 | QA Team | Done |
| 3 | Test Environment Setup | 2026-03-26 | 2026-03-26 | DevOps | Done |
| 4 | Functional Testing | 2026-03-27 | 2026-03-29 | QA Team | In Progress |
| 5 | Security Testing | 2026-03-29 | 2026-03-30 | Security QA | Planned |
| 6 | Performance Testing | 2026-03-30 | 2026-03-31 | QA Team | Planned |
| 7 | Bug Fixing | 2026-04-01 | 2026-04-03 | Dev Team | Planned |
| 8 | Regression Testing | 2026-04-04 | 2026-04-05 | QA Team | Planned |
| 9 | UAT | 2026-04-06 | 2026-04-08 | Beta Users | Planned |
| 10 | Production Deploy | 2026-04-10 | 2026-04-10 | DevOps | Planned |

**Total Duration:** 21 days (3 weeks)

### 5.2 Milestones

- ✅ **M1:** Test plan approved (2026-03-22)
- 🔄 **M2:** Functional testing complete (2026-03-29)
- ⏳ **M3:** All P0 bugs fixed (2026-04-03)
- ⏳ **M4:** UAT approved (2026-04-08)
- ⏳ **M5:** Production launch (2026-04-10)

---

## 6. Resources

### 6.1 Team

| Role | Name | Responsibility | Allocation |
|------|------|----------------|------------|
| **QA Lead** | Agent QA-1 | Test planning, strategy | 100% |
| **QA Engineer** | Agent QA-2 | Manual testing, automation | 100% |
| **Security Tester** | Agent QA-3 | Security testing, pentesting | 50% |
| **DevOps** | Agent DevOps-1 | Test environment setup | 20% |
| **Beta Testers** | 5 users | UAT testing | 10 hours total |

### 6.2 Tools

| Tool | Purpose | License | Status |
|------|---------|---------|--------|
| **Playwright** | E2E test automation | Open Source | Installed |
| **k6** | Performance testing | Open Source | Installed |
| **OWASP ZAP** | Security scanning | Open Source | Installed |
| **Postman** | API testing | Free tier | Installed |
| **Browser DevTools** | Manual testing | Built-in | N/A |
| **Linear** | Bug tracking | Paid | Active |
| **Loom** | Screen recording | Free tier | Active |

### 6.3 Test Environments

**Staging Environment:**
- URL: staging.ryex.vn
- Database: Supabase (staging instance)
- Firebase: Test project
- Access: VPN required (security)

**Access Credentials:**
- See `/tests/environments/staging.env` (encrypted)

---

## 7. Risk Assessment

### 7.1 Testing Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Staging environment downtime** | High | Medium | Have backup local testing; monitor uptime |
| **Test data corruption** | Medium | Low | Daily DB snapshots; automated seed script |
| **Insufficient test coverage** | High | Medium | Automated coverage reports; peer review test cases |
| **Late bug discovery** | High | Medium | Start testing early (shift-left); daily smoke tests |
| **Vietnamese text errors missed** | Medium | High | Native speaker review; automated i18n checks |

### 7.2 Product Risks

| Risk | Impact | Probability | Test Strategy |
|------|--------|-------------|---------------|
| **Security vulnerability** | Critical | Medium | OWASP Top 10 checklist; pentesting |
| **VASP compliance failure** | Critical | Low | Compliance testing checklist; legal review |
| **Performance degradation** | High | Medium | Load testing 1000 concurrent users |
| **Data loss (transactions)** | Critical | Low | Database transaction testing; rollback tests |
| **Firebase Auth outage** | High | Medium | Test offline behavior; fallback scenarios |

---

## 8. Test Deliverables

### 8.1 Documents

- [x] Test Plan (this document)
- [ ] Test Cases (`/tests/test-cases/`)
- [ ] Test Execution Report (`/tests/reports/`)
- [ ] Bug Reports (`/tests/bugs/`)
- [ ] UAT Sign-off (`/tests/uat/`)
- [ ] Test Metrics Dashboard (Linear/Notion)

### 8.2 Automated Tests

- [ ] Playwright E2E tests (`/tests/e2e/`)
- [ ] API tests (`/tests/api/`)
- [ ] Security tests (`/tests/security/`)
- [ ] Performance tests (`/tests/performance/`)

### 8.3 Reports

- Daily: Test execution summary (Slack/Linear)
- Weekly: Bug trend analysis
- End of Sprint: Test completion report
- Production: Go/No-Go decision report

---

## 9. Test Execution Tracking

### 9.1 Daily Status

**Date:** [YYYY-MM-DD]

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Test Cases Executed | 100 | 75 | 🟡 In Progress |
| Pass Rate | >95% | 92% | 🟡 Below Target |
| Bugs Found | - | 8 | - |
| Critical Bugs | 0 | 1 | 🔴 Blocker |

### 9.2 Bug Summary

| Priority | Open | In Progress | Fixed | Closed | Total |
|----------|------|-------------|-------|--------|-------|
| P0 (Critical) | 1 | 0 | 0 | 0 | 1 |
| P1 (High) | 3 | 2 | 1 | 0 | 6 |
| P2 (Medium) | 5 | 0 | 2 | 0 | 7 |
| P3 (Low) | 2 | 0 | 1 | 0 | 3 |
| **Total** | **11** | **2** | **4** | **0** | **17** |

---

## 10. Compliance Checklist (VASP)

### 10.1 KYC/AML Requirements

- [ ] User cannot deposit without KYC verification
- [ ] User cannot withdraw without KYC verification
- [ ] User cannot trade without KYC verification
- [ ] ID document upload validated (front, back, selfie)
- [ ] Face matching works (selfie vs ID photo)
- [ ] Admin can approve/reject KYC applications
- [ ] Rejected KYC allows resubmission
- [ ] KYC data stored encrypted
- [ ] KYC data retention: 7 years after account closure

### 10.2 Audit Trail

- [ ] All user actions logged (login, trade, deposit, withdrawal)
- [ ] All admin actions logged (KYC approval, user suspension)
- [ ] Logs immutable (append-only)
- [ ] Logs include: timestamp, user_id, action, IP, user_agent
- [ ] Logs stored for 7 years
- [ ] Logs exportable for SBV audit

### 10.3 Transaction Monitoring

- [ ] Daily withdrawal limit enforced (2 billion VND)
- [ ] Suspicious transactions flagged (>100M VND single tx)
- [ ] Admin can review flagged transactions
- [ ] AML report generated monthly
- [ ] Report includes: user_id, amount, reason, status

---

## 11. UAT Plan

### 11.1 UAT Scope

**Participants:**
- 5 beta users (Vietnamese crypto traders)
- 1 QA observer (note-taker)

**Duration:** 3 days (2 hours/day)

**Scenarios:**
1. Sign up → KYC → Deposit → Browse Market → Logout
2. Login → View Profile → Update Settings → Logout
3. Login → Market Page → Search Coins → View Details

**Feedback Collection:**
- Google Form survey (Vietnamese)
- 1-on-1 interview (30 min each user)
- Session recordings (Loom)

### 11.2 UAT Acceptance Criteria

- [ ] 4/5 users successfully complete all scenarios
- [ ] Average satisfaction score: >4/5
- [ ] No critical usability issues found
- [ ] Vietnamese text is clear and error-free
- [ ] Users feel the platform is trustworthy

---

## 12. Go/No-Go Decision

### 12.1 Go Criteria

- [x] All entry criteria met
- [ ] All exit criteria met
- [ ] No P0 bugs open
- [ ] <3 P1 bugs open (with workarounds documented)
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] UAT approved
- [ ] Compliance checklist 100% complete
- [ ] Deployment runbook reviewed
- [ ] Rollback plan ready

### 12.2 Decision Matrix

| Area | Status | Blocker? | Notes |
|------|--------|----------|-------|
| Functional | ✅ Pass | No | All features working |
| Security | 🟡 In Progress | Yes | 1 critical SQL injection (BUG-001) |
| Performance | ✅ Pass | No | <500ms p95 login |
| Compliance | ✅ Pass | No | All VASP requirements met |
| UAT | ⏳ Pending | No | Scheduled April 6-8 |

**Current Decision:** 🔴 **NO-GO** (1 critical security bug)

**Next Review:** April 3, 2026 (after BUG-001 fix)

---

## 13. Lessons Learned (Post-Sprint)

### 13.1 What Went Well
- [To be filled after sprint]

### 13.2 What Could Be Improved
- [To be filled after sprint]

### 13.3 Action Items for Next Sprint
- [To be filled after sprint]

---

## Appendix

### A. Test Case Index
- Full test cases: `/tests/test-cases/`
- Total: 150 test cases (P0: 50, P1: 60, P2: 40)

### B. Bug Tracking
- Bug tracker: Linear (ryex.linear.app)
- Bug report template: `/tests/bugs/TEMPLATE.md`

### C. Contact List
- QA Lead: qa-lead@ryex.vn
- Dev Lead: dev-lead@ryex.vn
- Product Owner: po@ryex.vn

### D. References
- BRD: `/docs/BRD/`
- User Stories: `/docs/user-stories/`
- API Docs: `/docs/api/`
```

---

## Best Practices

### 1. Align with Sprint Goals
Test plan should map 1:1 with sprint/release scope

### 2. Risk-Based Testing
Prioritize high-risk areas:
- Security (crypto = high value target)
- Financial transactions (money = zero tolerance)
- Compliance (VASP requirements)

### 3. Shift-Left Testing
Start testing early:
- Review user stories before dev starts
- Write test cases during dev
- Automate tests as features are built

### 4. Metrics-Driven
Track key metrics:
- Test coverage %
- Bug density (bugs per feature)
- Pass/fail rate
- Defect escape rate

### 5. Continuous Improvement
Learn from each sprint:
- Retrospectives
- Update test strategy
- Improve automation

---

## Output

Tạo file tại `/tests/test-plans/<sprint>-test-plan.md`

Sau khi tạo test plan, hỏi user:
- "Test plan này có đầy đủ không?"
- "Tôi có nên bắt đầu viết test cases ngay không?"
- "Cần tôi setup automation framework (Playwright) không?"
- "Tôi có nên schedule kickoff meeting với team không?"
