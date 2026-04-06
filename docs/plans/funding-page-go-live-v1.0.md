# Funding Page Go-Live Plan

## 1. Problem Framing
- **Business goal:** Move Funding page from UI-only demo to operational page that supports real user actions (view balances, navigate to deposit/withdraw/history, track transaction status).
- **User pain:** Current page shows hardcoded balances and non-functional CTAs, reducing trust and blocking real usage.
- **KPI (go-live success):**
  - 100% critical Funding CTAs are actionable (no dead-end button/link).
  - 100% Funding data blocks load from live API (not hardcoded constants).
  - <2% Funding API error rate during first 7 days post-release.
  - 0 P0 defects in Funding -> Deposit/Withdraw/History regression pack.

## 2. Scope and Priority
- **P0 (must-have for go-live):**
  - Replace hardcoded Funding overview, asset table, and recent activity with live API mapping.
  - Wire missing `Xem chi tiết` actions.
  - Add loading/empty/error/retry states for all data blocks.
  - Validate all visible CTA/link destinations (Funding + shared nav/footer used in this page context).
  - Complete QA regression and Ops readiness checks before release.
- **P1 (should-have, near-term hardening):**
  - Centralize CTA destinations through route constants to avoid string drift.
  - Improve transaction status UX copy for processor latency (`pending` behavior).
  - Add role-specific release checklist artifacts under feature docs.
- **P2 (future enhancement):**
  - Multi-chain/multi-token expansion in Funding summaries.
  - Dedicated metadata endpoint for fees/limits/network labels.
  - Richer portfolio analytics/widgets on Funding page.
- **Out of scope (this plan version):**
  - Re-architecture of wallet processor.
  - New trading/P2P business flows.
  - Full redesign of shared global footer/navigation.

## 3. Runtime Gap (Expected vs Current)
- **Expected behavior:** Funding page reflects live account state and each CTA performs a real action or explicit disabled behavior.
- **Current behavior:** Funding page still uses hardcoded constants and includes at least one non-functional CTA (`Xem chi tiết`).
- **Proposed resolution:** Reuse existing wallet/assets APIs and current route structure, then enforce CTA matrix + role-based release gates.

## Current State Review
- Funding page route exists at [`src/app/(webapp)/app/funding/page.js`](../../src/app/(webapp)/app/funding/page.js), rendering [`FundingModulePage`](../../src/features/funding/FundingModulePage.js).
- Funding data is currently hardcoded in [`src/features/funding/constants.js`](../../src/features/funding/constants.js) (`FUNDING_OVERVIEW`, `FUNDING_ACCOUNT_CARDS`, `FUNDING_ASSET_ROWS`, `FUNDING_RECENT_ACTIVITY`).
- Some CTAs are already functional (quick actions to deposit/withdraw/history), but account-card `Xem chi tiết` has no action and the table/recent list are display-only.
- Backend/API readiness already exists in wallet + assets:
  - [`GET /api/v1/user/assets`](../../src/app/api/v1/user/assets/route.js)
  - [`GET/POST /api/v1/wallet/deposit-address`](../../src/app/api/v1/wallet/deposit-address/route.js)
  - [`POST /api/v1/wallet/withdraw`](../../src/app/api/v1/wallet/withdraw/route.js)
  - [`GET /api/v1/wallet/transactions`](../../src/app/api/v1/wallet/transactions/route.js)

## Go-Live Strategy (Phased)

### Phase 1 - Make Funding page functional using existing APIs (no new backend contract)
- Replace hardcoded funding balances/table/recent activity in [`FundingModulePage`](../../src/features/funding/FundingModulePage.js) with live fetches:
  - balances/assets from `/api/v1/user/assets`
  - recent activity from `/api/v1/wallet/transactions?type=all&limit=N`
- Keep existing filter/search behavior, but apply it to mapped API results.
- Add robust UI states for each data block: loading, empty, and API error retry.
- Wire card-level `Xem chi tiết` buttons to existing app routes in [`src/shared/config/routes.js`](../../src/shared/config/routes.js) (e.g., assets/deposit/withdraw/history).

### Phase 2 - CTA and navigation hardening
- Standardize all Funding CTAs against route constants (avoid literal path strings inside feature constants where possible).
- Validate/replace placeholder links in shared nav/footer components used on Funding view:
  - [`src/shared/components/AppTopNav.js`](../../src/shared/components/AppTopNav.js)
  - [`src/shared/components/LandingFooter.js`](../../src/shared/components/LandingFooter.js)
- Ensure every visible button/link has a clear destination or is intentionally disabled with UX copy.

### Phase 3 - Production hardening and release gates
- Enforce environment/readiness checks before enabling Funding in production (`WALLET_ENCRYPTION_KEY`, internal processor key paths used by wallet APIs).
- Confirm internal processors are scheduled/monitored for deposit/withdraw status progression:
  - [`src/app/api/v1/wallet/internal/deposit-monitor/route.js`](../../src/app/api/v1/wallet/internal/deposit-monitor/route.js)
  - [`src/app/api/v1/wallet/internal/withdraw-processor/route.js`](../../src/app/api/v1/wallet/internal/withdraw-processor/route.js)
- Add release checklist for FE/BE/QA sign-off under docs feature scope (Assets/Wallet docs), including rollback criteria.

## 4. User Stories
- **US-01 (Funding visibility):** As a logged-in user, I want to see real Funding balances and asset rows so I can trust my available funds.
- **US-02 (Actionability):** As a logged-in user, I want all Funding CTAs to perform expected actions so I can proceed without confusion.
- **US-03 (Status tracking):** As a logged-in user, I want recent transaction statuses on Funding so I can understand if my transfer is pending/completed/failed.
- **US-04 (Safe release):** As product/ops team, we want clear release gates so Funding can go live without hidden operational risk.

## 5. Acceptance Criteria (Given/When/Then)
- **AC-01 Live overview data**
  - Given user is authenticated and APIs are healthy
  - When user opens `/app/funding`
  - Then overview values are sourced from live API mapping, not hardcoded constants.
- **AC-02 Live asset table + filters**
  - Given Funding data is returned from `/api/v1/user/assets`
  - When user applies search/filter
  - Then filtering is applied on the mapped live dataset and empty state renders when no result matches.
- **AC-03 Recent activity feed**
  - Given transactions exist from `/api/v1/wallet/transactions`
  - When Funding page loads
  - Then recent activity panel renders latest items with status badge mapping (`success/pending/error`).
- **AC-04 CTA completeness**
  - Given user can view Funding page
  - When user clicks any visible CTA/button/link
  - Then each control either routes to a valid destination or is explicitly disabled with clear UX copy.
- **AC-05 Error handling**
  - Given API request fails/timeouts
  - When Funding data blocks cannot load
  - Then user sees clear error state and a retry action without page crash.
- **AC-06 Release gate**
  - Given release candidate is prepared
  - When FE/BE/QA/Ops complete sign-off checklist
  - Then PM/Release can execute go/no-go with rollback plan documented.

## 6. CTA Matrix Baseline (BA-owned)
| Area | Control | Expected Action | Priority |
|---|---|---|---|
| Funding cards | `Xem chi tiết` | Route to a valid detail flow (`assets` or context destination) | P0 |
| Quick actions | `Đi tới nạp tiền` | Route to `/app/deposit` | P0 |
| Quick actions | `Đi tới rút tiền` | Route to `/app/withdraw` | P0 |
| Quick actions | `Đi tới lịch sử` | Route to `/app/history` | P0 |
| Recent activity | `Xem tất cả` | Route to `/app/history` | P0 |
| Shared nav/footer | Placeholder links (if visible) | Valid route or explicitly disabled UX state | P0 |

## Delivery Breakdown
- **Frontend:** `FundingModulePage` data integration + state UX + CTA wiring.
- **Backend/Ops:** validate runtime env + internal processing jobs and monitoring.
- **QA:** regressions for funding/deposit/withdraw/history navigation and live data consistency.

## Execution Workflow By Role

### BA (Business Analyst)
- Define scope baseline for Funding go-live: what is in/out for v1 (live read model + CTA functionality).
- Build and maintain a CTA matrix for Funding and shared components (`button/link -> expected destination -> acceptance condition`).
- Freeze acceptance criteria for each Funding block: Hero summary, account cards, assets table, quick actions, recent activity.
- Own UAT checklist and sign-off criteria before QA full regression starts.

### UI/UX
- Validate UX behavior for loading/empty/error states and clarify copy for non-ready actions.
- Confirm interaction and responsive behavior remain consistent with existing Assets/Deposit/Withdraw patterns.
- Approve final state map before FE implementation lock.

### FE (Frontend)
- Replace hardcoded funding datasets in `src/features/funding/constants.js` usage with live API mapping in `src/features/funding/FundingModulePage.js`.
- Wire missing CTA actions (`Xem chi tiết`) using route constants in `src/shared/config/routes.js`.
- Normalize placeholder links in shared components used by Funding view and remove dead-end UI actions.
- Implement clear data-state handling (loading, empty, error, retry) per section.

### BE (Backend)
- Confirm API contracts currently consumed by Funding (`/api/v1/user/assets`, `/api/v1/wallet/transactions`) are stable for FE mapping.
- Validate transaction payload fields needed by Funding recent-activity panel are present and documented.
- Surface any known constraints (testnet-only chain/symbol, processor latency) to BA/FE/QA as explicit release notes.

### DevOps/Ops
- Verify wallet runtime env readiness and secret configuration for production.
- Ensure internal processors (`deposit-monitor`, `withdraw-processor`) are scheduled, monitored, and alerting.
- Prepare rollback and incident response checklist for Funding-related failures.

### QA
- Execute functional matrix by role-approved CTA list and acceptance criteria.
- Run regression across Funding -> Deposit -> Withdraw -> History navigation and data consistency.
- Verify error and empty states (API unavailable, no assets, no transaction history).
- Provide release verdict with blocking/non-blocking issues.

### Release Manager / PM
- Run go/no-go meeting after BA + QA + Ops sign-offs.
- Gate release on mandatory checks: critical CTA pass, live data mapping pass, processor health pass, rollback ready.
- Approve staged rollout and post-release monitoring window.

## Handoff Sequence (Team Workflow)
1. BA publishes scope + CTA matrix + acceptance criteria.
2. UI/UX confirms state behavior and final interaction details.
3. FE and BE align API mapping and finalize implementation contract.
4. FE delivers integration build and hands over to QA with test notes.
5. QA executes full matrix and reports verdict.
6. Ops validates runtime health + rollback readiness.
7. PM/Release executes go/no-go and controlled rollout.

## 7. Impact Map (Traceability)
- **Business goal -> user story mapping**
  - Trustworthy Funding data -> US-01, US-03.
  - Actionable operations page -> US-02.
  - Safe production launch -> US-04.
- **User stories -> implementation impact**
  - **FE impact:** `src/features/funding/FundingModulePage.js`, `src/features/funding/constants.js`, `src/shared/config/routes.js`, shared nav/footer components.
  - **BE impact:** contract stability for `/api/v1/user/assets`, `/api/v1/wallet/transactions`; payload fields for Funding mapping.
  - **QA impact:** CTA matrix verification, data-state validation, full flow regression.
  - **Ops impact:** processor schedule/monitoring, env readiness, rollback protocol.

## 8. Execution Workflow by Sprint Stage
- **Stage 0 - BA Alignment Pack (owner: BA)**
  - Publish scope P0/P1/P2, CTA matrix, AC set, known risks, and open decisions.
  - Align with PO on go-live KPI and release threshold.
- **Stage 1 - Solution Alignment (owners: UI/UX + FE + BE)**
  - Confirm data-state UX and route behavior.
  - Confirm API mapping and field-level dependencies.
- **Stage 2 - Build and Internal Validation (owners: FE + BE)**
  - Implement Funding integration and CTA wiring.
  - Validate behavior in staging against runtime constraints.
- **Stage 3 - QA and UAT (owners: QA + BA)**
  - Execute QA matrix and BA UAT checklist.
  - Record blocker/non-blocker defects with release recommendation.
- **Stage 4 - Go/No-Go and Rollout (owners: Ops + PM/Release)**
  - Verify runtime and rollback readiness.
  - Execute staged release and post-release monitoring.

## 9. Go-Live Checklist by Role
- **BA checklist**
  - AC finalized and testable.
  - CTA matrix approved.
  - UAT sign-off completed.
- **FE checklist**
  - No hardcoded Funding runtime data remains.
  - All CTA routes wired or explicitly disabled.
  - Loading/empty/error/retry states implemented.
- **BE checklist**
  - API fields and status mapping are documented and stable.
  - Known runtime limits are communicated.
- **QA checklist**
  - Funding flow regression passed.
  - Error-state tests passed.
  - No unresolved P0/P1 defects.
- **Ops checklist**
  - Required wallet env config validated.
  - Internal processor jobs active and monitored.
  - Rollback runbook ready.
- **PM/Release checklist**
  - Go/no-go meeting completed.
  - KPI/risk gates accepted.
  - Monitoring window and owner on-call assigned.

## Suggested Sequence (Implementation Order)
1. Implement Funding API integration and fallback UI states.
2. Wire missing CTA actions and normalize route usage.
3. Run end-to-end functional pass across Funding -> Deposit/Withdraw/History.
4. Execute release checklist and enable in production.

## Risks to Track
- Current wallet implementation is MVP/testnet-oriented (single chain/symbol assumptions can surface in Funding summaries).
- Withdraw state may lag while processor runs; Funding UI must clearly present `pending` transitions.
- Placeholder shared links can create dead-end UX if not normalized before go-live.

## 10. Open Decisions (PO/BA to close)
- Decide exact destination for card-level `Xem chi tiết` per card type (single route vs context-specific routes).
- Confirm whether shared nav/footer placeholders must be fixed in this release or hidden on Funding scope.
- Define acceptable pending-status SLA wording for users (copy and timeout expectation).
