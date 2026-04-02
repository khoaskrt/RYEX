import AppTopNav from '@/shared/components/AppTopNav';

export function DepositTopNav({ isAuthenticated, isLoggingOut, onLogout, profileVisual }) {
  return (
    <AppTopNav
      isAuthenticated={isAuthenticated}
      isLoggingOut={isLoggingOut}
      onLogout={onLogout}
      profileVisual={profileVisual}
    />
  );
}
