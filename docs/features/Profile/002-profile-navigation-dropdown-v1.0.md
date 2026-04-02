# Profile Navigation Dropdown (v1.0)

## 1. Overview
ProfileDropdown component cung cấp quick access menu cho Profile navigation từ bất kỳ page nào trong app. Component này follow pattern của AssetsDropdown với hover interaction.

## 2. Component

### 2.1 ProfileDropdown
- **File**: `src/shared/components/ProfileDropdown.js`
- **Purpose**: Hover-enabled profile menu với navigation items
- **Behavior**:
  - Hover vào avatar → hiện dropdown menu
  - Click avatar → redirect về `/app/profile`
  - Dropdown chứa 4 navigation items từ ProfileSidebar
  - Logout button ở cuối dropdown
  - Auto close khi click outside hoặc mouse leave

## 3. Navigation Items
1. **Bảng điều khiển** → `/app/profile#profile-dashboard` (icon: dashboard)
2. **Bảo mật** → `/app/profile#profile-security` (icon: shield)
3. **Hỗ trợ** → `/app/profile#profile-support` (icon: help)
4. **Cài đặt** → `/app/profile#profile-settings` (icon: settings)
5. **Đăng xuất** → Sign out + redirect to `/app/auth/login`

## 4. Integration Pattern

### In any page header:
```js
import ProfileDropdown from '@/shared/components/ProfileDropdown';

// In JSX (navigation bar):
<div className="flex items-center gap-3">
  <span className="hidden text-sm font-semibold text-[#3c4a43] md:inline">
    {profile.emailMasked}
  </span>
  <AssetsDropdown />
  <ProfileDropdown />
</div>
```

## 5. Design Tokens
- Avatar size: `h-9 w-9` (36x36px)
- Dropdown width: `320px`
- Border radius: `rounded-2xl` (16px)
- Shadow: `shadow-[0_12px_32px_rgba(0,0,0,0.08)]`
- Item icon size: `text-[20px]`
- Hover close delay: `120ms`

## 6. Interaction States
1. **Default**: Avatar button resting state
2. **Hover**: Avatar background change + dropdown appears
3. **Open**: Dropdown visible with navigation items
4. **Click avatar**: Redirect to profile page
5. **Click item**: Redirect + scroll to section
6. **Click logout**: Sign out + redirect to login

## 7. Applied Pages
- ✅ `/app/profile` (ProfileModulePage.js) - Replaced static avatar link với ProfileDropdown
- Future: All authenticated app pages should use ProfileDropdown

## 8. Profile Visual Logic
- Fetch session từ Supabase auth
- Extract avatar URL từ OAuth provider (Google)
- Fallback: Display email initial (uppercase)
- Avatar refresh on auth state change

## 9. QA Checklist
- [ ] Verify hover shows dropdown menu
- [ ] Verify click avatar redirects to `/app/profile`
- [ ] Verify click nav item scrolls to correct section
- [ ] Verify logout button signs out and redirects
- [ ] Verify dropdown closes on click outside
- [ ] Verify dropdown closes on mouse leave (with delay)
- [ ] Verify avatar image displays for OAuth users
- [ ] Verify initial fallback for email-only users

## 10. Pattern Consistency
ProfileDropdown follows the exact same interaction pattern as AssetsDropdown:
- Hover to preview
- Click button to navigate
- onMouseEnter/onMouseLeave with timer
- Same visual hierarchy (header, content, footer)
- Same Tailwind tokens (colors, spacing, shadows)

## 11. Changelog

### v1.0 - 2026-04-02
- **Added**: ProfileDropdown component with hover interaction
- **Added**: Profile navigation items from ProfileSidebar
- **Added**: Logout button in dropdown footer
- **Integration**: Replaced static avatar link in ProfileModulePage
- **Integration**: Added AssetsDropdown to ProfileModulePage nav bar
- **Pattern**: Reused AssetsDropdown hover/close timer pattern for consistency
