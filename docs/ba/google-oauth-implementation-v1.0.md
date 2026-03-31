# [Google OAuth Login] - BA Brief (v1.0)

**Date**: 2026-03-31
**Author**: BA Team
**Domain**: Auth

---

## 1. Problem framing

### Business goal
Enable users to sign in to RYEX using their Google accounts, reducing friction in the authentication process and increasing conversion rates for new user onboarding.

### User pain
- Users need to remember yet another password for RYEX platform
- Email/password signup requires multiple steps (email verification)
- Users prefer quick social login options available on competing platforms

### KPI
- Increase login conversion rate by enabling alternative auth method
- Reduce abandoned signup flows
- Track % of users choosing Google OAuth vs email/password

---

## 2. Scope

### In-scope (P0)
- ✅ Add Google OAuth login button to login page
- ✅ Implement Supabase OAuth flow for Google provider
- ✅ Create OAuth callback handler page
- ✅ Redirect authenticated users to market dashboard
- ✅ Handle OAuth errors gracefully
- ✅ Maintain existing UI design system

### Out-of-scope
- Backend API integration for Google OAuth (future: session sync, audit logs)
- User profile data enrichment from Google account
- Other OAuth providers (Facebook, Apple, etc.)
- Linking Google account to existing email/password account
- Google OAuth for signup page (separate story)

---

## 3. Runtime Gap

### Expected behavior
Google login button should trigger Supabase OAuth flow and redirect to dashboard upon success.

### Current behavior (before implementation)
Button was disabled with "Coming soon" label and no functionality.

### Proposed resolution
Implemented Supabase `signInWithOAuth` with Google provider and created callback handler.

---

## 4. User stories

### US-01: User clicks "Continue with Google" (P0)
**As a** returning user
**I want to** click "Continue with Google" button
**So that** I can quickly sign in without typing credentials

### US-02: OAuth callback processing (P0)
**As a** user completing Google OAuth flow
**I want to** be automatically redirected to dashboard after authorization
**So that** I can seamlessly access my account

### US-03: OAuth error handling (P0)
**As a** user encountering OAuth errors
**I want to** see a clear error message and be redirected back to login
**So that** I understand what went wrong and can try again

---

## 5. Acceptance criteria (Given/When/Then)

### AC-01: Google login button is visible and clickable
- **Given** user is on `/app/auth/login` page
- **When** page loads
- **Then** "Continue with Google" button is visible (not disabled)
- **And** button shows Google icon and text "Continue with Google"

### AC-02: OAuth flow initiates on button click
- **Given** user is on login page
- **When** user clicks "Continue with Google" button
- **Then** button text changes to "Đang xử lý..."
- **And** button becomes disabled to prevent double-click
- **And** user is redirected to Google OAuth consent screen

### AC-03: Successful OAuth redirects to dashboard
- **Given** user completes Google OAuth successfully
- **When** callback page processes the session
- **Then** user is redirected to `/app/market` (dashboard)
- **And** user session is established via Supabase

### AC-04: OAuth errors show feedback
- **Given** user encounters OAuth error (denied consent, network error, etc.)
- **When** callback page detects error
- **Then** error message is displayed: "Đăng nhập thất bại: [error]"
- **And** user is redirected to `/app/auth/login` after 2 seconds

### AC-05: UI consistency maintained
- **Given** implementation is complete
- **When** reviewing the UI
- **Then** button styling matches existing RYEX design system
- **And** no other UI elements have changed
- **And** header/footer remain consistent with market page

---

## 6. Impact map

### FE impact
**Files changed:**
1. `/src/features/auth/StitchLoginPage.js`
   - Added `handleGoogleLogin()` async function
   - Connected function to Google button `onClick` handler
   - Updated button: removed `disabled`, removed `title`, changed text
   - Added loading state to button with conditional text rendering

2. `/src/app/(webapp)/app/auth/callback/page.js` (NEW FILE)
   - Created OAuth callback handler page
   - Handles session retrieval via `supabase.auth.getSession()`
   - Implements error states with user feedback
   - Redirects to dashboard on success or login on failure

**Dependencies:**
- Uses existing `supabaseClient.js` (`/src/supabaseClient.js`)
- No changes to `supabaseClient.js` required
- Supabase client already configured with proper env vars

**State management:**
- Reuses existing `isSubmitting` state for loading UX
- Reuses existing `submitError` state for error display
- No new state variables introduced

### BE impact
**None.** This implementation uses Supabase client-side OAuth flow. No backend API changes required.

**Future consideration:** When BE implements session sync, will need to call `/api/v1/auth/session/sync` after OAuth callback to create audit logs and sync session to PostgreSQL.

### QA impact
**New test cases required:**

1. **AUTH-OAUTH-01** (P0): Click "Continue with Google" triggers OAuth popup/redirect
2. **AUTH-OAUTH-02** (P0): Successful Google login redirects to `/app/market`
3. **AUTH-OAUTH-03** (P0): User already logged in on login page → auto-redirect to dashboard
4. **AUTH-OAUTH-04** (P1): User denies Google consent → error shown, redirect to login
5. **AUTH-OAUTH-05** (P1): Network error during OAuth → error shown, redirect to login
6. **AUTH-OAUTH-06** (P2): Button disabled during OAuth flow (no double-click)
7. **AUTH-OAUTH-07** (P2): Callback page shows loading spinner during processing

**Regression scope:**
- AUTH Pack (existing email/password login must still work)
- Session state management (existing `onAuthStateChange` listener)

---

## 7. Risks + decisions

### Risks

**R-01: Supabase Google OAuth not configured in production**
- **Severity**: HIGH (blocks feature)
- **Mitigation**: Verify Supabase dashboard has Google OAuth provider enabled with correct redirect URLs
- **Action**: DevOps/Admin must configure before deployment

**R-02: Redirect URL mismatch**
- **Severity**: MEDIUM (OAuth fails)
- **Current**: Redirect set to `${window.location.origin}/app/auth/callback`
- **Mitigation**: Ensure all environments (dev, staging, prod) have callback URL whitelisted in Supabase
- **Action**: Document required URLs in deployment checklist

**R-03: No session sync with backend**
- **Severity**: LOW (tech debt)
- **Impact**: User authenticated in Supabase but no audit log in PostgreSQL
- **Mitigation**: Accept for MVP; plan backend integration in next sprint
- **Action**: Create follow-up story for BE session sync

**R-04: User profile data not enriched**
- **Severity**: LOW (enhancement)
- **Impact**: Google profile photo, name not automatically populated
- **Mitigation**: Accept for MVP; can enhance later
- **Action**: Consider for future iteration

### Decisions cần PO chốt

**D-01: Should Google OAuth also work on signup page?**
- Current: Only implemented on login page (`/app/auth/login`)
- Question: Should we also add Google button to signup page?
- **Recommendation**: YES, but separate story. Signup has different flow (email verification notice, etc.)

**D-02: What happens if Google account email already exists as email/password account?**
- Current: Supabase will link accounts if email matches (default behavior)
- Question: Is this acceptable or need custom logic?
- **Recommendation**: Accept Supabase default for MVP

**D-03: Should we track which auth method user used?**
- Current: No tracking of "signed up via Google" vs "signed up via email"
- Question: Do we need analytics/metadata on auth provider?
- **Recommendation**: Add in BE session sync story if needed for reporting

---

## 8. Implementation details

### Technical approach
- **OAuth library**: Supabase Auth (`@supabase/supabase-js`)
- **Flow type**: OAuth 2.0 with PKCE (Supabase default)
- **Provider**: Google OAuth 2.0
- **Session storage**: Supabase session (localStorage + cookies)

### Code changes summary

#### File: `/src/features/auth/StitchLoginPage.js`

**Added function:**
```javascript
async function handleGoogleLogin() {
  setSubmitError('');
  setIsSubmitting(true);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/auth/callback`,
      },
    });

    if (error) {
      setSubmitError(getLoginErrorMessage(error));
      setIsSubmitting(false);
    }
  } catch (error) {
    setSubmitError(getLoginErrorMessage(error));
    setIsSubmitting(false);
  }
}
```

**Updated button:**
```jsx
<button
  className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-low py-3 transition-all hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isSubmitting}
  type="button"
  onClick={handleGoogleLogin}
>
  <img
    alt="Google"
    className="h-7 w-7 object-contain"
    src="/images/google-icon.png"
  />
  <span className="font-semibold text-on-surface">
    {isSubmitting ? 'Đang xử lý...' : 'Continue with Google'}
  </span>
</button>
```

#### File: `/src/app/(webapp)/app/auth/callback/page.js` (NEW)

**Full implementation:**
- `useEffect` hook to process OAuth callback on mount
- Calls `supabase.auth.getSession()` to retrieve session
- Redirects to `/app/market` on success
- Shows error message and redirects to `/app/auth/login` on failure
- Displays loading spinner during processing

### Environment requirements

**Required Supabase config:**
1. Google OAuth provider enabled in Supabase dashboard
2. Google OAuth credentials (Client ID, Client Secret) configured
3. Redirect URLs whitelisted:
   - `http://localhost:3000/app/auth/callback` (dev)
   - `https://staging.ryex.com/app/auth/callback` (staging)
   - `https://ryex.com/app/auth/callback` (production)

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` (already configured)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already configured)

---

## 9. Deployment checklist

### Pre-deployment
- [ ] Verify Supabase Google OAuth enabled in dashboard
- [ ] Verify redirect URLs whitelisted for target environment
- [ ] Run `npm run build` successfully
- [ ] QA executes AUTH-OAUTH test pack
- [ ] No console errors in browser during OAuth flow

### Post-deployment
- [ ] Smoke test: Click "Continue with Google" in production
- [ ] Verify OAuth consent screen appears
- [ ] Verify successful login redirects to dashboard
- [ ] Verify session persists on page refresh
- [ ] Monitor logs for OAuth errors in first 24 hours

---

## 10. Open questions

**Q1**: Should we add Google OAuth to signup page as well?
**Status**: PENDING PO decision

**Q2**: Do we need backend session sync in this sprint?
**Status**: DECIDED - NO, defer to next sprint

**Q3**: Should we auto-populate user profile from Google data?
**Status**: PENDING PO decision (low priority)

---

## Changelog

### v1.0 - 2026-03-31
- Initial documentation after FE implementation
- Defined scope, stories, AC, risks, and decisions
- Documented technical approach and code changes
