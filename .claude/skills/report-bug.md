---
skill: report-bug
description: Báo cáo bug chi tiết theo chuẩn QA cho dự án RYEX
tags: [qa, bug-report, issue-tracking]
model: sonnet
---

# Báo Cáo Bug

Bạn là QA Engineer chuyên nghiệp, báo cáo bugs chi tiết, dễ reproduce cho developers.

## Nhiệm vụ

Tạo bug report chuẩn chỉnh với đầy đủ thông tin:
1. Clear title & description
2. Steps to reproduce
3. Expected vs Actual results
4. Screenshots/Videos
5. Environment details
6. Priority & severity
7. Suggested fix (nếu có)

## Bug Report Template

### Cấu Trúc File

Tạo file tại `/tests/bugs/BUG-XXX-<short-description>.md`:

```markdown
# Bug Report: [Bug Title]

**Bug ID:** BUG-XXX
**Status:** Open | In Progress | Fixed | Closed | Won't Fix
**Priority:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Severity:** Critical | Major | Minor | Trivial
**Category:** Functional | Security | Performance | UI/UX | Data
**Reported By:** QA Agent
**Date Reported:** [YYYY-MM-DD]
**Assigned To:** [Developer name]
**Sprint:** Week X

---

## Summary

**One-line description of the bug**
[Clear, concise summary in Vietnamese]

**Impact:**
- User Impact: [High/Medium/Low] - [How many users affected?]
- Business Impact: [Revenue loss / Compliance risk / Security risk / UX degradation]
- Workaround Available: [Yes/No] - [If yes, describe]

---

## Environment

| Item | Details |
|------|---------|
| **Environment** | Staging | Production | Local |
| **URL** | [Full URL where bug occurs] |
| **Browser** | Chrome 120.0.6099.129 | Firefox | Safari |
| **OS** | macOS 14.2 | Windows 11 | iOS 17 |
| **Device** | Desktop | Mobile (iPhone 15) | Tablet |
| **Screen Size** | 1920x1080 | 375x667 |
| **User Role** | Trader | Admin | Unverified User |
| **App Version** | v1.0.0 (commit: a1b2c3d) |

---

## Steps to Reproduce

**Preconditions:**
- [Any setup required, e.g., "User must be logged in"]
- [Test data needed, e.g., "User has 1,000,000 VND balance"]

**Steps:**

1. **[Action 1]**
   - Navigate to [URL/page]
   - Example: Go to `/app/auth/login`

2. **[Action 2]**
   - Click/Enter [specific element]
   - Example: Enter email `test@ryex.vn` in "Email" field

3. **[Action 3]**
   - [Specific action that triggers bug]
   - Example: Click "Đăng nhập" button

4. **[Action 4]**
   - [Observe result]
   - Example: Wait for response

**Reproducibility:**
- [ ] Always (100%)
- [ ] Frequently (>50%)
- [ ] Sometimes (<50%)
- [ ] Rare (<10%)

---

## Expected Result

**What SHOULD happen:**

[Clear description of correct behavior]

Example:
- User is redirected to `/app` dashboard
- Access token stored in memory
- Refresh token stored in HttpOnly cookie
- User name displayed in header: "Xin chào, [Name]"

---

## Actual Result

**What ACTUALLY happens:**

[Clear description of buggy behavior]

Example:
- User stays on login page
- No redirect occurs
- Console shows error: `TypeError: Cannot read property 'email' of undefined`
- No tokens stored

---

## Visual Evidence

### Screenshots
- **Before Action:** [Screenshot 1]
- **After Action (Bug State):** [Screenshot 2]
- **Console Errors:** [Screenshot 3]
- **Network Tab:** [Screenshot 4]

### Video
- **Recording:** [Link to Loom/video file]
- **Duration:** [X seconds]

### Console Logs
```
[Error] TypeError: Cannot read property 'email' of undefined
    at handleLogin (login.js:45)
    at onClick (Button.js:12)
```

### Network Request/Response
**Request:**
```json
POST /api/auth/login
{
  "email": "test@ryex.vn",
  "password": "Test@123"
}
```

**Response:**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Something went wrong",
  "details": null
}
```

---

## Root Cause Analysis (If Known)

**Suspected Cause:**
[Your hypothesis about what's causing the bug]

Example:
- Null check missing for `user.email` in line 45 of `login.js`
- API returns 500 error when Firebase Auth is down
- Refresh token cookie not being set due to incorrect `sameSite` config

**Code Location:**
- File: `src/app/(webapp)/app/auth/login/page.js`
- Line: 45
- Function: `handleLogin()`

**Stack Trace:**
```
Error: Cannot read property 'email' of undefined
    at handleLogin (/src/app/auth/login/page.js:45:12)
    at async onClick (/src/components/Button.js:12:5)
```

---

## Severity vs Priority

### Severity: [Critical | Major | Minor | Trivial]
**Definition:**
- **Critical:** System crash, data loss, security breach
- **Major:** Core feature broken, workaround difficult
- **Minor:** Feature works but with issues, easy workaround
- **Trivial:** Cosmetic issue, typo

**This Bug:** [Severity level + Rationale]

### Priority: [P0 | P1 | P2 | P3]
**Definition:**
- **P0:** BLOCKER - Must fix before release
- **P1:** High - Fix in current sprint
- **P2:** Medium - Fix in next sprint
- **P3:** Low - Backlog

**This Bug:** [Priority level + Rationale]

---

## Business Impact

### User Impact
- **Affected Users:** [All users | Logged-in users | Admins only | X% of users]
- **Frequency:** [Every login | Random | Specific conditions]
- **Impact:** [Cannot login → Cannot trade → Loss of revenue]

### Compliance/Legal Impact
- [ ] VASP compliance violation
- [ ] Data privacy breach (GDPR)
- [ ] Audit trail broken
- [ ] AML/KYC process affected

### Financial Impact
- **Estimated Loss:** [X VND/day if not fixed]
- **Example:** "If login broken for 1 day, lose 100 new signups × 1M VND avg lifetime value = 100M VND"

---

## Suggested Fix

**Proposed Solution:**

[How to fix this bug - if you know]

Example:
```javascript
// Current (buggy) code:
const email = user.email; // user is undefined

// Proposed fix:
const email = user?.email || 'Unknown'; // Add null check

// OR better:
if (!user) {
  throw new Error('User not found');
}
const email = user.email;
```

**Alternative Solutions:**
1. [Solution A]
2. [Solution B]

**Recommended:** [Which solution and why]

---

## Related Information

### Related Bugs
- BUG-XXX: Similar issue in signup flow
- BUG-YYY: Firebase timeout errors

### Related User Stories
- RYEX-015: User Login Feature
- RYEX-016: Session Management

### Related Test Cases
- TC-001: Successful Login (FAILED)
- TC-002: Invalid Password (PASSED)

### Related Documentation
- BRD: `/docs/BRD/authentication.md`
- API Spec: `/docs/api/auth.md`

---

## Developer Notes

**Assigned To:** [Developer name]
**ETA:** [Expected fix date]

**Developer Comments:**
- [Date] [Developer]: "Investigating root cause"
- [Date] [Developer]: "Fixed in commit abc123"
- [Date] [Developer]: "Deployed to staging for QA verification"

---

## QA Verification

**Fix Verified By:** [QA name]
**Verification Date:** [YYYY-MM-DD]
**Verification Status:** [Pass | Fail]

**Verification Steps:**
1. [Step 1]
2. [Step 2]
3. Result: [Pass/Fail]

**Regression Testing:**
- [ ] Related features still work
- [ ] No new bugs introduced
- [ ] Performance not degraded

**Sign-off:**
- [ ] QA Approved
- [ ] Ready for Production

---

## Changelog

| Date | Status | Comment | By |
|------|--------|---------|-----|
| 2026-03-27 | Open | Bug reported | QA Agent |
| 2026-03-28 | In Progress | Developer assigned | Dev Team |
| 2026-03-29 | Fixed | Fix deployed to staging | Dev X |
| 2026-03-30 | Closed | Verified and approved | QA Agent |
```

---

## Bug Report Examples

### Example 1: Critical Security Bug

```markdown
# Bug Report: SQL Injection Vulnerability in Login Endpoint

**Bug ID:** BUG-001
**Status:** Open
**Priority:** P0 (Critical)
**Severity:** Critical
**Category:** Security
**Reported By:** QA Agent
**Date:** 2026-03-27

---

## Summary

**SQL Injection vulnerability allows unauthorized database access through login form**

**Impact:**
- User Impact: High - All users affected
- Business Impact: CRITICAL - Entire user database at risk
- Compliance Risk: VASP license revocation
- Workaround: NONE - Requires immediate fix

---

## Environment

| Item | Details |
|------|---------|
| Environment | Production |
| URL | https://ryex.vn/app/auth/login |
| Endpoint | POST /api/auth/login |

---

## Steps to Reproduce

**Preconditions:** None

**Steps:**
1. Navigate to `/app/auth/login`
2. Enter email: `admin' OR '1'='1'--`
3. Enter password: `anything`
4. Click "Đăng nhập"

**Reproducibility:** Always (100%)

---

## Expected Result

- Login should FAIL
- Error: "Email hoặc mật khẩu không đúng"
- SQL injection payload treated as literal string

---

## Actual Result

- ❌ Login SUCCEEDS
- ❌ Bypasses authentication
- ❌ Logs in as first user in database (usually admin)
- ❌ Full access granted

---

## Visual Evidence

**Network Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "admin-uuid",
    "email": "admin@ryex.vn",
    "role": "admin"
  }
}
```

---

## Root Cause

**Code Location:** `src/app/api/auth/login/route.js:25`

**Vulnerable Code:**
```javascript
// UNSAFE - String concatenation
const query = `SELECT * FROM users WHERE email = '${email}' AND password_hash = '${hash}'`;
const result = await pool.query(query);
```

**Exploit:**
```sql
-- Input: admin' OR '1'='1'--
-- Resulting query:
SELECT * FROM users WHERE email = 'admin' OR '1'='1'--' AND password_hash = '...'

-- '1'='1' is always true → Returns all users
```

---

## Suggested Fix

**Solution:**

```javascript
// SAFE - Parameterized query
const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
const result = await pool.query(query, [email, hash]);
```

**Why this fixes it:**
- `$1`, `$2` are placeholders
- Values are escaped by pg library
- SQL injection impossible

---

## Business Impact

**Severity: CRITICAL**
- Entire user database exposed
- Attacker can steal funds
- VASP license at risk
- Legal liability

**Action Required:**
1. IMMEDIATE: Take production offline
2. Deploy fix within 2 hours
3. Security audit all endpoints
4. Notify affected users (if data stolen)
```

---

### Example 2: UI/UX Bug

```markdown
# Bug Report: Vietnamese Characters Display as "?" on Mobile Safari

**Bug ID:** BUG-042
**Status:** Open
**Priority:** P1 (High)
**Severity:** Major
**Category:** UI/UX

---

## Summary

Vietnamese characters (ă, ê, ô, ơ, ư) display as "?" on iOS Safari

**Impact:**
- User Impact: High - All iOS users (30% of user base)
- Business Impact: Poor UX, unprofessional appearance
- Workaround: Use Chrome on iOS (but users don't know this)

---

## Steps to Reproduce

1. Open https://ryex.vn on iPhone Safari
2. Navigate to login page
3. Observe button text

**Reproducibility:** Always on iOS Safari, never on Chrome/Firefox

---

## Expected Result

Button shows: "Đăng nhập"

---

## Actual Result

Button shows: "?ang nh?p"

---

## Visual Evidence

[Screenshot of iOS Safari showing "?" characters]

---

## Root Cause

**Missing UTF-8 charset declaration in HTML**

**Fix:**

```html
<!-- Add to src/app/layout.js -->
<head>
  <meta charSet="UTF-8" />
  {/* ... */}
</head>
```

---

## Priority: P1

**Rationale:** 30% of users affected, but site still functional
```

---

## Bug Priority Guidelines for RYEX

### P0 - Critical (Fix Immediately)
- [ ] Security vulnerabilities (SQL injection, XSS)
- [ ] Data loss bugs
- [ ] Payment/withdrawal errors (money at risk)
- [ ] Complete feature broken (cannot login, cannot trade)
- [ ] Compliance violations (VASP requirements)
- [ ] Production down

**SLA:** Fix within 2-4 hours

### P1 - High (Fix This Sprint)
- [ ] Major feature broken (workaround exists)
- [ ] Significant UX degradation
- [ ] Performance issues (>5s load time)
- [ ] Error affecting >20% of users
- [ ] Vietnamese text issues

**SLA:** Fix within 2-3 days

### P2 - Medium (Fix Next Sprint)
- [ ] Minor feature issue
- [ ] Cosmetic bugs
- [ ] Edge cases (<5% users affected)
- [ ] Non-critical validation errors

**SLA:** Fix within 1-2 weeks

### P3 - Low (Backlog)
- [ ] Nice-to-have improvements
- [ ] Typos in non-critical text
- [ ] Rare edge cases
- [ ] Feature requests (not bugs)

**SLA:** No commitment

---

## Best Practices

### 1. Title Format
✅ **Good:** "Login fails with error 'Cannot read property email' when Firebase is offline"
❌ **Bad:** "Login broken"

### 2. Reproducible Steps
- Clear, numbered steps
- Include exact URLs, inputs, clicks
- Should be able to copy-paste and reproduce

### 3. Evidence
- Always include screenshots
- Console errors are CRITICAL
- Network tab for API bugs
- Video for complex flows

### 4. Impact Assessment
- How many users affected?
- Business revenue impact?
- Compliance/legal risk?
- Workaround available?

### 5. Suggested Fix
- If you know how to fix, suggest it
- Helps developer prioritize
- Shows you understand root cause

---

## Tools for Bug Reporting

### Screenshot/Screen Recording
- **macOS:** Cmd+Shift+5 (built-in)
- **Windows:** Win+Shift+S (Snipping Tool)
- **Chrome Extension:** Awesome Screenshot
- **Video:** Loom, Snagit

### Browser DevTools
- **Console:** See JavaScript errors
- **Network:** See API requests/responses
- **Application:** See cookies, localStorage
- **Performance:** See load times

### Bug Tracking
- **GitHub Issues:** (current)
- **Linear:** (recommended for RYEX)
- **Jira:** (enterprise option)

---

## Output

Tạo file tại `/tests/bugs/BUG-XXX-<description>.md`

Sau khi báo cáo bug, hỏi user:
- "Bug này có đủ thông tin để developer reproduce không?"
- "Tôi có nên thêm test case để prevent regression không?"
- "Priority có hợp lý không (cần escalate không)?"
- "Tôi có nên tạo ticket trong GitHub/Linear không?"
