# Profile Module

## Overview
Profile module quản lý thông tin tài khoản người dùng, bao gồm:
- User profile summary (email, UID, member since)
- Security settings (2FA, password change)
- Login history tracking
- Support & settings sections

## Components

### Main Module
- **ProfileModulePage.js**: Main profile page with navigation sidebar & content sections

### Components
- **ProfileSidebar.js**: Desktop sidebar navigation (dashboard, security, support, settings)
- **ProfileSummaryCard.js**: User profile overview card
- **SecurityCard.js**: Security settings card
- **LoginHistoryCard.js**: Login history table with suspicious activity detection
- **SupportColumn.js**: Support & settings column

### Shared Components
- **ProfileDropdown.js** (`src/shared/components/`): Hover-enabled profile navigation dropdown
  - Used in all authenticated app pages
  - Quick access to profile sections
  - Logout button
  - Pattern: Same as AssetsDropdown hover interaction

## Routes
- **Profile Page**: `/app/profile`
- **API Endpoints**:
  - `GET /api/v1/user/profile` - Fetch user profile
  - `PATCH /api/v1/user/profile` - Update display name

## Features

### Profile Summary
- Display user email (masked)
- User UID (first 12 chars)
- Member since date
- Avatar (OAuth provider) or initial fallback

### Login History
- Last 50 login events from `auth_login_events` table
- Columns: Time, IP, Device, Location
- Suspicious activity detection (IP/device changes + failed attempts)
- Real-time sync with auth state changes

### Navigation
- **Desktop**: Sidebar with active section tracking on scroll
- **Mobile**: Responsive layout (sidebar hidden)
- **Dropdown**: ProfileDropdown in top nav for quick access from any page

## Data Flow
1. Auth session from Supabase
2. Profile data from `users` table
3. Login events from `auth_login_events` table
4. Real-time updates via `onAuthStateChange`

## Integration with Navigation Bar
ProfileModulePage implements custom navigation bar with:
- RYEX logo + nav links (Thị trường, Giao dịch dropdown)
- Email masked display
- **AssetsDropdown** (hover to preview portfolio)
- **ProfileDropdown** (hover to access profile sections)

Pattern: Both dropdowns use consistent hover/close timer pattern for UX coherence.

## Documentation
- **BA Brief**: `docs/features/Profile/001-Read-update/001-Read-update-v1.0.md`
- **Dropdown Spec**: `docs/features/Profile/002-profile-navigation-dropdown-v1.0.md`
- **Supabase Integration**: `docs/features/Profile/001-Read-update/supabase-integration-v1.0.md`

## Related Features
- **Assets Module**: Shares navigation pattern via AssetsDropdown
- **Auth Module**: Provides session & user data
- **Funding Navigation**: Similar sidebar pattern for Assets/Deposit/Withdraw pages

---

**Last Updated**: 2026-04-02 (v1.0)
