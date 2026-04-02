'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingFooter from '@/shared/components/LandingFooter';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import { DepositHeroBanner } from './components/DepositHeroBanner';
import { DepositEntryPanel } from './components/DepositEntryPanel';
import { DepositSidebarPanel } from './components/DepositSidebarPanel';
import { DepositTopNav } from './components/DepositTopNav';
import { DEPOSIT_HISTORY_RECORDS, DEPOSIT_STATES, DEPOSIT_TOKENS } from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

function getProfileVisual(session) {
  const user = session?.user;
  if (!user) return DEFAULT_PROFILE_VISUAL;

  const email = (user.email || '').trim();
  const initial = email ? email.charAt(0).toUpperCase() : 'U';
  const provider = (user.app_metadata?.provider || '').toLowerCase();
  const userMeta = user.user_metadata || {};
  const avatarCandidate = userMeta.avatar_url || userMeta.picture || userMeta.photoURL || '';

  if (provider === 'google' && avatarCandidate) {
    return {
      avatarUrl: avatarCandidate,
      initial,
    };
  }

  return {
    avatarUrl: '',
    initial,
  };
}

export function DepositModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedToken, setSelectedToken] = useState(DEPOSIT_TOKENS[0]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const hasSession = Boolean(data.session);
      setIsAuthenticated(hasSession);
      setProfileVisual(hasSession ? getProfileVisual(data.session) : DEFAULT_PROFILE_VISUAL);
      setIsAuthResolved(true);
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);
      setIsAuthenticated(hasSession);
      setProfileVisual(hasSession ? getProfileVisual(session) : DEFAULT_PROFILE_VISUAL);
      setIsAuthResolved(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace(ROUTES.login);
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <DepositTopNav
        isAuthenticated={isAuthenticated}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        profileVisual={profileVisual}
      />

      <FundingNavigationSidebar />
      <FundingNavigationTabBar />

      <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:ml-60">
        <DepositHeroBanner />

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <DepositEntryPanel tokens={DEPOSIT_TOKENS} selectedToken={selectedToken} onSelectToken={setSelectedToken} />
          <DepositSidebarPanel depositHistory={DEPOSIT_HISTORY_RECORDS} selectedToken={selectedToken} states={DEPOSIT_STATES} />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
