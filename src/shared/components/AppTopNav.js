'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import AssetsDropdown from './AssetsDropdown';
import ProfileDropdown from './ProfileDropdown';

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

export default function AppTopNav({
  activeSection = 'none',
  isAuthenticated,
  isLoggingOut = false,
  onLogout,
  profileVisual,
  emailText = '',
  showEmail = false,
}) {
  const controlledMode = typeof isAuthenticated === 'boolean';
  const [autoAuthResolved, setAutoAuthResolved] = useState(controlledMode);
  const [autoIsAuthenticated, setAutoIsAuthenticated] = useState(false);
  const [autoProfileVisual, setAutoProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [autoIsLoggingOut, setAutoIsLoggingOut] = useState(false);

  useEffect(() => {
    if (controlledMode) return undefined;

    let isMounted = true;

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const hasSession = Boolean(data.session);
      setAutoIsAuthenticated(hasSession);
      setAutoProfileVisual(hasSession ? getProfileVisual(data.session) : DEFAULT_PROFILE_VISUAL);
      setAutoAuthResolved(true);
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);
      setAutoIsAuthenticated(hasSession);
      setAutoProfileVisual(hasSession ? getProfileVisual(session) : DEFAULT_PROFILE_VISUAL);
      setAutoAuthResolved(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [controlledMode]);

  const effectiveAuthResolved = controlledMode ? true : autoAuthResolved;
  const effectiveIsAuthenticated = controlledMode ? isAuthenticated : autoIsAuthenticated;
  const effectiveProfileVisual = controlledMode ? profileVisual || DEFAULT_PROFILE_VISUAL : autoProfileVisual;
  const effectiveIsLoggingOut = controlledMode ? isLoggingOut : autoIsLoggingOut;

  async function handleLogoutClick() {
    if (onLogout) {
      await onLogout();
      return;
    }

    setAutoIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setAutoIsLoggingOut(false);
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
        <div className="flex items-center gap-10">
          <Link className="text-2xl font-black tracking-tighter text-[#006c4f]" href={ROUTES.marketingHome}>
            RYEX
          </Link>
          <div className="hidden h-full items-center gap-8 md:flex">
            <Link
              className={
                activeSection === 'market'
                  ? 'flex h-full items-center border-b-2 border-[#01bc8d] pb-1 font-bold text-[#006c4f]'
                  : 'flex h-full items-center text-[#3c4a43] transition-colors hover:text-[#01bc8d]'
              }
              href={ROUTES.market}
            >
              Thị trường
            </Link>
            <div className="group relative flex h-full items-center">
              <button className="flex h-full items-center gap-1 text-[#3c4a43] transition-colors group-hover:text-[#01bc8d]" type="button">
                Giao dịch
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">expand_more</span>
              </button>
              <div className="absolute left-0 top-full hidden w-[380px] pt-2 group-hover:block">
                <div className="overflow-hidden rounded-2xl border border-[#bbcac1]/20 bg-surface-container-lowest py-2 shadow-[0_24px_48px_rgba(0,0,0,0.1)]">
                <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                    <span className="material-symbols-outlined">sync</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Chuyển đổi</div>
                    <div className="text-sm leading-tight text-on-surface-variant">Cách đơn giản nhất để giao dịch</div>
                  </div>
                </a>
                <Link className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href={ROUTES.spotTrading}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Giao dịch giao ngay</div>
                    <div className="text-sm leading-tight text-on-surface-variant">Giao dịch tiền điện tử với các công cụ toàn diện</div>
                  </div>
                </Link>
                <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <div>
                    <div className="font-bold text-on-surface">Giao dịch P2P</div>
                    <div className="text-sm leading-tight text-on-surface-variant">
                      Từ các thương gia đã được xác minh, sử dụng nhiều phương thức thanh toán nội địa
                    </div>
                  </div>
                </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showEmail && effectiveIsAuthenticated ? <span className="hidden text-sm font-semibold text-[#3c4a43] md:inline">{emailText}</span> : null}
          {effectiveAuthResolved && effectiveIsAuthenticated ? (
            <>
              <AssetsDropdown />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link
                className="inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
                href={ROUTES.login}
              >
                Đăng nhập
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-xl px-6 text-sm font-bold text-white liquidity-gradient shadow-lg transition-transform duration-200 active:scale-95"
                href={ROUTES.signup}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
