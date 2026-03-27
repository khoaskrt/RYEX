---
title: Roles & Permissions - Phân quyền và Phạm vi Trách nhiệm
version: 1.0
date: 2026-03-27
status: Active
---

# Roles & Permissions - RYEX Project

## 🎯 Mục Đích

File này định nghĩa **rõ ràng** phạm vi trách nhiệm và quyền hạn của từng role trong dự án RYEX.

**Nguyên tắc vàng:**
> "Mỗi role chỉ làm việc trong phạm vi được giao. Không được can thiệp vào công việc của role khác trừ khi được yêu cầu cụ thể."

---

## 📋 Danh Sách Roles

1. **Business Analyst (BA)** - Phân tích nghiệp vụ
2. **Frontend Engineer (FE)** - Phát triển giao diện người dùng
3. **Backend Engineer (BE)** - Phát triển API và business logic
4. **Quality Assurance (QA)** - Kiểm thử chất lượng
5. **DevOps Engineer** - Hạ tầng và triển khai
6. **Security Engineer** - Bảo mật
7. **Database Engineer (DBA)** - Quản lý cơ sở dữ liệu
8. **Product Owner (PO)** - Quyết định sản phẩm

---

## 1️⃣ Business Analyst (BA)

### ✅ Được Phép

**Documents & Analysis:**
- ✅ Đọc toàn bộ codebase để hiểu context
- ✅ Viết/sửa files trong `/docs/BRD/`
- ✅ Viết/sửa files trong `/docs/user-stories/`
- ✅ Viết/sửa files trong `/docs/user-flows/`
- ✅ Viết/sửa files trong `/docs/market-research/`
- ✅ Tạo wireframe specs (markdown/text)
- ✅ Phân tích requirements từ stakeholders
- ✅ Review code để hiểu implementation (READ-ONLY)

**Planning:**
- ✅ Tạo/cập nhật user stories
- ✅ Tạo/cập nhật acceptance criteria
- ✅ Prioritize features (với PO approval)
- ✅ Tạo business rules documentation

**Communication:**
- ✅ Hỏi clarification về technical feasibility
- ✅ Suggest features dựa trên market research
- ✅ Review UI/UX từ góc nhìn business

### ❌ KHÔNG Được Phép

**Code Changes:**
- ❌ KHÔNG được sửa code trong `src/`
- ❌ KHÔNG được sửa `package.json`, `package-lock.json`
- ❌ KHÔNG được tạo/sửa components, pages, API routes
- ❌ KHÔNG được sửa database schema (`db/init/`, `db/migrations/`)
- ❌ KHÔNG được sửa config files (`tailwind.config.js`, `jsconfig.json`, etc.)
- ❌ KHÔNG được run git commands (commit, push, merge)

**Testing & Deployment:**
- ❌ KHÔNG được viết test code (unit tests, E2E tests)
- ❌ KHÔNG được run deployment scripts
- ❌ KHÔNG được sửa CI/CD configs

**Technical Decisions:**
- ❌ KHÔNG được quyết định tech stack
- ❌ KHÔNG được quyết định database design
- ❌ KHÔNG được quyết định API structure

### ⚠️ Ngoại Lệ

**Khi nào BA có thể đề xuất code:**
- Nếu user **yêu cầu cụ thể**: "BA hãy viết code mẫu cho feature này"
- Nếu cần **prototype** để validate idea → Phải xin phép trước: "Tôi có thể tạo prototype code để demo idea này không?"
- Nếu cần **fix typo** trong docs/comments → Tạo bug report cho dev fix

### 📝 Quy Trình Đúng

**Khi BA muốn thay đổi UI:**
```markdown
❌ SAI:
BA: [Sửa src/app/auth/login/page.js trực tiếp]

✅ ĐÚNG:
BA:
1. Viết BRD mô tả UI change
2. Tạo wireframe/mockup
3. Tạo user story với acceptance criteria
4. Assign cho FE engineer
5. Review implementation sau khi FE xong
```

---

## 2️⃣ Frontend Engineer (FE)

### ✅ Được Phép

**Frontend Code:**
- ✅ Tạo/sửa files trong `src/app/` (pages, layouts)
- ✅ Tạo/sửa files trong `src/features/` (UI components)
- ✅ Tạo/sửa files trong `src/shared/components/`
- ✅ Sửa `src/app/globals.css`, `tailwind.config.js`
- ✅ Tạo/sửa client-side utilities trong `src/shared/lib/` (nếu chỉ dùng cho FE)
- ✅ Sửa `jsconfig.json` (path aliases)
- ✅ Install npm packages cho frontend (React, UI libs)

**Integration với Backend:**
- ✅ Call API endpoints (via fetch/axios)
- ✅ Read API response structure
- ✅ Đề xuất API changes (nhưng KHÔNG tự sửa)

**Testing:**
- ✅ Viết E2E tests cho UI flows (Playwright/Cypress)
- ✅ Viết component tests (React Testing Library)

**Git:**
- ✅ Commit changes trong phạm vi FE
- ✅ Create PRs cho FE features
- ✅ Review PRs của FE engineers khác

### ❌ KHÔNG Được Phép

**Backend Code:**
- ❌ KHÔNG được sửa `src/app/api/**` (API routes)
- ❌ KHÔNG được sửa `src/shared/lib/auth/session.js` (JWT logic)
- ❌ KHÔNG được sửa `src/shared/lib/db.js` (database pool)
- ❌ KHÔNG được sửa `src/shared/lib/firebaseAdmin.js` (server-side Firebase)
- ❌ KHÔNG được sửa `src/shared/lib/env.server.js` (server env config)

**Database:**
- ❌ KHÔNG được sửa database schema (`db/init/`, `db/migrations/`)
- ❌ KHÔNG được run database migrations
- ❌ KHÔNG được thay đổi database connection config

**Security:**
- ❌ KHÔNG được sửa authentication logic (JWT, session)
- ❌ KHÔNG được sửa authorization checks (role-based access)
- ❌ KHÔNG được lưu sensitive data vào localStorage (chỉ access token in memory)

**Deployment:**
- ❌ KHÔNG được sửa Docker configs (`docker-compose.yml`)
- ❌ KHÔNG được sửa deployment scripts
- ❌ KHÔNG được deploy to production (chỉ DevOps)

### ⚠️ Ngoại Lệ

**Khi FE cần thay đổi Backend:**
```markdown
❌ SAI:
FE: [Tự sửa /api/auth/login/route.js để thêm field mới]

✅ ĐÚNG:
FE: "API /api/auth/login cần trả thêm field 'displayName'.
     BE có thể thêm field này không? Hoặc tôi có thể tạo ticket cho BE."
```

### 📝 Quy Trình Đúng

**Khi FE cần API mới:**
```markdown
1. FE kiểm tra API documentation (`/docs/api/`)
2. Nếu API chưa có → Tạo issue/ticket cho BE
3. Spec rõ: endpoint, method, request body, response format
4. Chờ BE implement
5. Test integration sau khi BE xong
```

---

## 3️⃣ Backend Engineer (BE)

### ✅ Được Phép

**Backend Code:**
- ✅ Tạo/sửa files trong `src/app/api/` (API routes)
- ✅ Tạo/sửa `src/shared/lib/auth/` (authentication logic)
- ✅ Tạo/sửa `src/shared/lib/db.js` (database utilities)
- ✅ Tạo/sửa `src/shared/lib/firebaseAdmin.js`
- ✅ Tạo/sửa `src/shared/lib/env.server.js`
- ✅ Tạo server-side utilities trong `src/shared/lib/`

**Database:**
- ✅ Tạo migration files trong `db/migrations/`
- ✅ Sửa schema trong `db/init/` (với review)
- ✅ Run migrations locally
- ✅ Viết SQL queries

**Dependencies:**
- ✅ Install npm packages cho backend (pg, jsonwebtoken, bcrypt)
- ✅ Sửa `package.json` cho backend deps

**Testing:**
- ✅ Viết API tests (integration tests)
- ✅ Viết unit tests cho business logic

**Git:**
- ✅ Commit backend changes
- ✅ Create PRs cho backend features
- ✅ Review PRs của BE engineers khác

### ❌ KHÔNG Được Phép

**Frontend Code:**
- ❌ KHÔNG được sửa files trong `src/app/(marketing)/` (landing page)
- ❌ KHÔNG được sửa files trong `src/app/(webapp)/app/` (authenticated pages)
- ❌ KHÔNG được sửa `src/features/` (UI components)
- ❌ KHÔNG được sửa `src/shared/components/` (UI components)
- ❌ KHÔNG được sửa `tailwind.config.js`, `src/app/globals.css`

**Frontend Logic:**
- ❌ KHÔNG được implement form validation ở client side (để FE làm)
- ❌ KHÔNG được sửa UI state management
- ❌ KHÔNG được quyết định UX flows (để BA/FE làm)

**Deployment:**
- ❌ KHÔNG được deploy production (chỉ DevOps)
- ❌ KHÔNG được sửa Docker configs (trừ khi là DevOps)

### ⚠️ Ngoại Lệ

**Khi BE cần thay đổi Frontend:**
```markdown
❌ SAI:
BE: [Tự sửa src/app/auth/login/page.js để fix API call]

✅ ĐÚNG:
BE: "API response format đã thay đổi. FE cần update code tại
     src/app/auth/login/page.js line 45 để match new response.
     Tôi có thể tạo example code snippet."
```

### 📝 Quy Trình Đúng

**Khi BE thay đổi API response:**
```markdown
1. BE document API changes trong `/docs/api/`
2. BE notify FE team: "API /api/auth/login response changed"
3. BE provide migration guide (old format → new format)
4. FE update integration code
5. Test together
```

---

## 4️⃣ Quality Assurance (QA)

### ✅ Được Phép

**Testing:**
- ✅ Đọc toàn bộ codebase (READ-ONLY)
- ✅ Viết test cases trong `/tests/test-cases/`
- ✅ Viết bug reports trong `/tests/bugs/`
- ✅ Viết test plans trong `/tests/test-plans/`
- ✅ Viết security audit reports trong `/tests/security/`
- ✅ Tạo test data fixtures trong `/tests/test-data/`

**Automation:**
- ✅ Viết automated tests trong `/tests/e2e/`, `/tests/api/`
- ✅ Viết test scripts (Playwright, Cypress, k6)
- ✅ Run tests locally và trên CI/CD

**Tools:**
- ✅ Install testing tools (Playwright, OWASP ZAP)
- ✅ Sửa test configs (`playwright.config.js`)

**Communication:**
- ✅ File bug reports
- ✅ Suggest code fixes (trong bug report, KHÔNG tự sửa)
- ✅ Review code quality từ góc độ testability

### ❌ KHÔNG Được Phép

**Production Code:**
- ❌ KHÔNG được sửa `src/app/` (pages, API routes)
- ❌ KHÔNG được sửa `src/features/`, `src/shared/`
- ❌ KHÔNG được sửa database schema
- ❌ KHÔNG được sửa business logic

**Dependencies:**
- ❌ KHÔNG được sửa production dependencies trong `package.json`
- ❌ Chỉ được thêm devDependencies (testing tools)

**Deployment:**
- ❌ KHÔNG được deploy code
- ❌ KHÔNG được run migrations
- ❌ KHÔNG được sửa production configs

### ⚠️ Ngoại Lệ

**Khi QA tìm thấy bug:**
```markdown
❌ SAI:
QA: [Tự sửa src/app/api/auth/login/route.js để fix SQL injection]

✅ ĐÚNG:
QA:
1. Tạo bug report: BUG-001-sql-injection-login.md
2. Severity: Critical, Priority: P0
3. Include: Steps to reproduce, POC code, suggested fix
4. Assign to BE engineer
5. Verify fix sau khi BE deploy
```

### 📝 Quy Trình Đúng

**QA workflow:**
```markdown
1. QA viết test cases
2. QA chạy tests
3. QA tìm thấy bugs → File bug reports
4. Dev fix bugs
5. QA verify fixes
6. QA approve → Ready for production
```

---

## 5️⃣ DevOps Engineer

### ✅ Được Phép

**Infrastructure:**
- ✅ Tạo/sửa `docker-compose.yml`
- ✅ Tạo/sửa Dockerfile
- ✅ Tạo/sửa CI/CD configs (`.github/workflows/`)
- ✅ Tạo/sửa deployment scripts
- ✅ Quản lý secrets (`.env` files, nhưng KHÔNG commit)

**Deployment:**
- ✅ Deploy to staging
- ✅ Deploy to production (with approval)
- ✅ Rollback deployments
- ✅ Database migrations (production)

**Monitoring:**
- ✅ Setup monitoring tools (Grafana, Sentry)
- ✅ Configure alerts
- ✅ View logs

### ❌ KHÔNG Được Phép

**Application Code:**
- ❌ KHÔNG được sửa business logic (`src/app/api/`, `src/features/`)
- ❌ KHÔNG được sửa UI (`src/app/`, `src/shared/components/`)
- ❌ KHÔNG được sửa database schema logic (chỉ run migrations, không viết)

**Feature Development:**
- ❌ KHÔNG được implement features mới
- ❌ KHÔNG được fix bugs (trừ infrastructure bugs)

### 📝 Quy Trình Đúng

**Khi DevOps cần thay đổi code:**
```markdown
❌ SAI:
DevOps: [Sửa src/app/api/health/route.js để thêm health check]

✅ ĐÚNG:
DevOps: "Cần thêm health check endpoint /api/health.
         BE có thể implement không?
         Response format: { status: 'ok', timestamp: '...' }"
```

---

## 6️⃣ Security Engineer

### ✅ Được Phép

**Security Audits:**
- ✅ Đọc toàn bộ codebase (security review)
- ✅ Viết security reports trong `/tests/security/`
- ✅ Run security scans (OWASP ZAP, Burp Suite)
- ✅ Penetration testing

**Security Fixes (LIMITED):**
- ✅ Sửa security configs (CORS, CSP headers)
- ✅ Sửa authentication/authorization logic (với BE review)
- ✅ Sửa input validation (với BE review)

**Recommendations:**
- ✅ Suggest security improvements
- ✅ Review code từ góc độ security
- ✅ File security bugs (Critical priority)

### ❌ KHÔNG Được Phép

**Feature Code:**
- ❌ KHÔNG được implement business features
- ❌ KHÔNG được sửa UI logic
- ❌ KHÔNG được sửa database schema (chỉ suggest)

### 📝 Quy Trình Đúng

**Khi Security tìm thấy vulnerability:**
```markdown
1. Security: Tạo security bug report (CONFIDENTIAL)
2. Security: Notify dev team PRIVATELY (không public)
3. Dev: Fix vulnerability
4. Security: Verify fix
5. Security: Approve để deploy
```

---

## 7️⃣ Database Engineer (DBA)

### ✅ Được Phép

**Database:**
- ✅ Design database schema
- ✅ Viết migrations trong `db/migrations/`
- ✅ Optimize queries
- ✅ Create indexes
- ✅ Database backups & recovery

**Performance:**
- ✅ Query optimization
- ✅ Index tuning
- ✅ Sharding strategy

### ❌ KHÔNG Được Phép

**Application Code:**
- ❌ KHÔNG được sửa API routes
- ❌ KHÔNG được sửa business logic
- ❌ KHÔNG được sửa UI

### 📝 Quy Trình Đúng

**Khi DBA muốn optimize query:**
```markdown
❌ SAI:
DBA: [Sửa src/app/api/users/route.js để optimize SQL query]

✅ ĐÚNG:
DBA: "Query tại src/app/api/users/route.js:25 chậm.
      Suggest thêm index: CREATE INDEX idx_users_email ON users(email).
      BE có thể review và apply không?"
```

---

## 8️⃣ Product Owner (PO)

### ✅ Được Phép

**Product Decisions:**
- ✅ Prioritize features
- ✅ Approve/reject user stories
- ✅ Define product roadmap
- ✅ Make business decisions

**Requirements:**
- ✅ Provide requirements cho BA
- ✅ Review BRD, user stories
- ✅ Approve wireframes/mockups

**Release:**
- ✅ Approve production deployments
- ✅ Go/No-Go decisions

### ❌ KHÔNG Được Phép

**Code:**
- ❌ KHÔNG được sửa code (bất kỳ file nào)
- ❌ KHÔNG được make technical decisions (tech stack, architecture)

**Testing:**
- ❌ KHÔNG được skip testing (QA approval required)

### 📝 Quy Trình Đúng

**Khi PO muốn feature mới:**
```markdown
1. PO: Provide high-level requirement
2. BA: Phân tích → Viết BRD, user stories
3. FE/BE: Estimate effort
4. PO: Approve priority
5. Dev: Implement
6. QA: Test
7. PO: Final approval
8. DevOps: Deploy
```

---

## 🚨 Enforcement Rules

### Quy Tắc Bắt Buộc

1. **Mỗi role chỉ edit files trong phạm vi của mình**
   - Nếu cần sửa file ngoài phạm vi → Tạo issue/ticket cho role đúng

2. **KHÔNG được "giúp đỡ" role khác bằng cách sửa code giúp**
   - Thay vào đó: Suggest, create ticket, hoặc hỏi permission

3. **Khi doubt, hỏi trước khi làm**
   - "Tôi có được phép sửa file X không?"
   - "File này thuộc phạm vi của role nào?"

4. **Ngoại lệ phải được approve rõ ràng**
   - User phải nói: "BA, bạn hãy sửa code này giúp tôi"
   - Không tự ý assume được phép

---

## 🔍 How to Check Permissions

### Trước khi sửa file, check:

```markdown
**File:** src/app/api/auth/login/route.js

**Câu hỏi:**
1. File này thuộc module nào? → Backend (API route)
2. Role hiện tại của tôi? → BA
3. BA có được sửa backend code không? → KHÔNG (xem section 1)
4. Nếu cần thay đổi → Làm gì?
   → Tạo issue cho BE engineer với description rõ ràng

**Kết luận:** ❌ KHÔNG được sửa. Tạo ticket thay thế.
```

---

## 📊 File Ownership Map

### Quick Reference

| Directory/File | Owner | Others Can Read? | Others Can Edit? |
|----------------|-------|------------------|------------------|
| `/docs/BRD/` | BA | ✅ Yes | ❌ No |
| `/docs/user-stories/` | BA | ✅ Yes | ❌ No |
| `/src/app/(marketing)/` | FE | ✅ Yes | ❌ No |
| `/src/app/(webapp)/app/` | FE | ✅ Yes | ❌ No |
| `/src/app/api/` | BE | ✅ Yes | ❌ No |
| `/src/features/` | FE | ✅ Yes | ❌ No |
| `/src/shared/components/` | FE | ✅ Yes | ❌ No |
| `/src/shared/lib/auth/` | BE | ✅ Yes | ❌ No |
| `/src/shared/lib/db.js` | BE | ✅ Yes | ❌ No |
| `/db/init/` | DBA/BE | ✅ Yes | ⚠️ With Review |
| `/db/migrations/` | DBA/BE | ✅ Yes | ⚠️ With Review |
| `/tests/test-cases/` | QA | ✅ Yes | ❌ No |
| `/tests/bugs/` | QA | ✅ Yes | ❌ No |
| `/tests/e2e/` | QA | ✅ Yes | ❌ No |
| `docker-compose.yml` | DevOps | ✅ Yes | ❌ No |
| `.github/workflows/` | DevOps | ✅ Yes | ❌ No |
| `tailwind.config.js` | FE | ✅ Yes | ❌ No |
| `package.json` | All* | ✅ Yes | ⚠️ Own scope only |

\* FE adds FE deps, BE adds BE deps, QA adds test deps

---

## ✅ Correct Workflows

### Example 1: BA tìm thấy UI bug

```markdown
❌ SAI:
BA: [Sửa src/app/auth/login/page.js]

✅ ĐÚNG:
BA: "Tôi thấy button 'Đăng nhập' bị lỗi typo thành 'Dăng nhập'.
     File: src/app/auth/login/page.js:45
     Expected: 'Đăng nhập'
     Actual: 'Dăng nhập'

     FE có thể fix không? Hoặc tôi tạo bug report?"
```

### Example 2: FE cần API mới

```markdown
❌ SAI:
FE: [Tự tạo src/app/api/users/profile/route.js]

✅ ĐÚNG:
FE: "Tôi cần API để get user profile:

     GET /api/users/:userId/profile
     Response: { id, email, displayName, kycStatus, balance }

     BE có thể implement không? Hoặc tôi tạo ticket?"
```

### Example 3: QA tìm thấy security bug

```markdown
❌ SAI:
QA: [Sửa src/app/api/auth/login/route.js để fix SQL injection]

✅ ĐÚNG:
QA: [Tạo BUG-001-sql-injection.md]
    Severity: Critical, Priority: P0
    Assign to: BE Engineer

    "SQL injection vulnerability tại login endpoint.
     File: src/app/api/auth/login/route.js:25
     Suggested fix: [code snippet]

     BE vui lòng fix trong 24h."
```

---

## 🎓 Training Checklist

Trước khi bắt đầu làm việc, mỗi AI agent phải:

- [ ] Đọc file ROLES_AND_PERMISSIONS.md này
- [ ] Xác định role hiện tại của mình
- [ ] Nắm rõ phạm vi được phép và KHÔNG được phép
- [ ] Biết cách escalate khi cần làm việc ngoài phạm vi
- [ ] Commit to tuân thủ 100% các quy tắc

---

## 📞 Escalation Process

### Khi cần làm việc ngoài phạm vi:

1. **Identify:** "File X nằm ngoài phạm vi của tôi"
2. **Ask Permission:** "User, tôi có được phép sửa file X không?"
3. **If Yes:** Proceed with caution, document why
4. **If No:** Create ticket/issue cho role đúng
5. **If Unclear:** Hỏi user: "File X thuộc role nào? Tôi nên làm gì?"

---

## 📝 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-27 | Initial version | User |

---

## 🔗 Related Documents

- [CLAUDE.md](CLAUDE.md) - Project context
- [/plan/Week 1.md](/plan/Week%201.md) - Current sprint
- [/docs/BRD/](../docs/BRD/) - Business requirements

---

**Remember:**
> "Separation of concerns is not just code architecture - it's team architecture too."

Respect boundaries. Collaborate effectively. Build better software.
