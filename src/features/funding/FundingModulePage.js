'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AppTopNav from '@/shared/components/AppTopNav';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import LandingFooter from '@/shared/components/LandingFooter';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import {
  FUNDING_ACCOUNT_CARDS,
  FUNDING_ASSET_ROWS,
  FUNDING_OVERVIEW,
  FUNDING_QUICK_ACTIONS,
  FUNDING_RECENT_ACTIVITY,
} from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const FILTERS = [
  { key: 'all', label: 'Tất cả tài sản' },
  { key: 'active', label: 'Đang có số dư' },
  { key: 'zero', label: 'Số dư 0' },
];

const STATUS_CLASS_MAP = {
  success: 'bg-primary-container/20 text-primary',
  pending: 'bg-secondary-container/35 text-secondary',
  error: 'bg-error-container text-error',
};

const TREND_CLASS_MAP = {
  up: 'text-primary',
  down: 'text-error',
  flat: 'text-on-surface-variant',
};

const CARD_TONE_CLASS_MAP = {
  primary: 'bg-primary-container/10 text-primary',
  secondary: 'bg-secondary-container/40 text-secondary',
  surface: 'bg-surface-container-high text-on-surface-variant',
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

function hasPositiveBalance(asset) {
  const normalized = String(asset.total || '').replace(/,/g, '');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0;
}

export function FundingModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].key);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAssets = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return FUNDING_ASSET_ROWS.filter((asset) => {
      const matchesSearch =
        !searchLower || asset.symbol.toLowerCase().includes(searchLower) || asset.name.toLowerCase().includes(searchLower);

      if (activeFilter === 'active') {
        return matchesSearch && hasPositiveBalance(asset);
      }

      if (activeFilter === 'zero') {
        return matchesSearch && !hasPositiveBalance(asset);
      }

      return matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <AppTopNav isAuthenticated={isAuthenticated} isLoggingOut={isLoggingOut} onLogout={handleLogout} profileVisual={profileVisual} />

      <FundingNavigationSidebar />
      <FundingNavigationTabBar />

      <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:ml-60 lg:px-8">
        <header className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Funding Account</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">Tài khoản tài trợ</h1>
              <p className="mt-3 max-w-2xl text-sm text-on-surface-variant sm:text-base">
                Quản lý số dư nạp/rút, theo dõi trạng thái xử lý và chuẩn bị tài sản trước khi chuyển sang giao dịch.
              </p>
            </div>
            <div className="grid min-w-[240px] gap-3 rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Tổng số dư Funding</p>
              <p className="text-2xl font-extrabold tracking-tight text-on-surface">
                {FUNDING_OVERVIEW.totalBalanceBTC}{' '}
                <span className="text-sm font-semibold text-on-surface-variant">BTC</span>
              </p>
              <p className="text-sm font-semibold text-on-surface-variant">~ {FUNDING_OVERVIEW.totalBalanceUSDT} USDT</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Có thể rút ngay</p>
              <p className="mt-2 text-lg font-bold text-on-surface">{FUNDING_OVERVIEW.availableToWithdrawUSDT} USDT</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Đang chờ xác nhận</p>
              <p className="mt-2 text-lg font-bold text-on-surface">{FUNDING_OVERVIEW.pendingUSDT} USDT</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Trạng thái hệ thống</p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-container/20 px-3 py-1 text-sm font-bold text-primary">
                <span className="material-symbols-outlined text-base">verified</span>
                Vận hành ổn định
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FUNDING_ACCOUNT_CARDS.map((card) => (
            <article
              key={card.key}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-on-surface">{card.title}</h2>
                  <p className="mt-1 text-xs font-medium text-on-surface-variant">{card.subtitle}</p>
                </div>
                <span
                  className={`material-symbols-outlined rounded-lg p-2 text-xl ${CARD_TONE_CLASS_MAP[card.tone] || CARD_TONE_CLASS_MAP.surface}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-on-surface">
                {card.amountBTC} <span className="text-sm font-semibold text-on-surface-variant">BTC</span>
              </p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant">~ {card.amountUSDT} USDT</p>
              <button
                type="button"
                className="mt-4 inline-flex h-10 items-center rounded-lg border border-outline-variant/40 px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                Xem chi tiết
              </button>
            </article>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_32px_rgba(0,0,0,0.03)] xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-on-surface">Số dư theo tài sản</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Hardcode UI cho bản thiết kế, chưa kết nối dữ liệu backend.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-1">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`h-10 rounded-lg px-3 text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-primary-container ${
                        isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-outline-variant/15 px-5 py-4 sm:px-6">
              <label className="relative block" htmlFor="funding-search">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  id="funding-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm theo mã coin hoặc tên tài sản"
                  className="w-full rounded-xl border border-outline-variant/35 bg-surface-container-low py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tài sản</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tổng</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Khả dụng</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Đang khóa</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Giá trị</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">24h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <tr key={asset.symbol} className="transition-colors hover:bg-surface-container-low/70">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                              {asset.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{asset.symbol}</p>
                              <p className="text-xs text-on-surface-variant">{asset.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{asset.total}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{asset.available}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface-variant">{asset.inOrder}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-on-surface">{asset.fiatValue}</td>
                        <td className={`px-6 py-4 text-right text-sm font-bold ${TREND_CLASS_MAP[asset.trend] || TREND_CLASS_MAP.flat}`}>
                          {asset.change24h}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">search_off</span>
                        <p className="mt-3 text-base font-semibold text-on-surface">Không có tài sản phù hợp</p>
                        <p className="mt-1 text-sm text-on-surface-variant">Thử bỏ bộ lọc hoặc thay đổi từ khóa tìm kiếm.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-6 xl:col-span-4">
            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.03)] sm:p-6">
              <h3 className="text-lg font-bold text-on-surface">Hành động nhanh</h3>
              <div className="mt-4 space-y-3">
                {FUNDING_QUICK_ACTIONS.map((action) => (
                  <div key={action.title} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5 text-lg text-primary">{action.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{action.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{action.description}</p>
                        <Link
                          href={action.href}
                          className="mt-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-wide text-on-primary transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-container"
                        >
                          {action.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.03)] sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-on-surface">Giao dịch gần đây</h3>
                <Link className="text-xs font-bold uppercase tracking-wide text-primary hover:underline" href={ROUTES.history}>
                  Xem tất cả
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {FUNDING_RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{item.type}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{item.time}</p>
                      </div>
                      <span className={`rounded-lg px-2 py-1 text-xs font-bold ${STATUS_CLASS_MAP[item.statusTone] || STATUS_CLASS_MAP.pending}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-on-surface">{item.amount}</span>
                      <span className="font-medium text-on-surface-variant">{item.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
