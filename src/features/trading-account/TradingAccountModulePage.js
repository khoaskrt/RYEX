'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AppTopNav from '@/shared/components/AppTopNav';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import LandingFooter from '@/shared/components/LandingFooter';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import {
  TRADING_ACTIVITY_TIMELINE,
  TRADING_FILTERS,
  TRADING_KPI_CARDS,
  TRADING_OPEN_ORDERS,
  TRADING_OVERVIEW,
  TRADING_POSITIONS,
} from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const CARD_TONE_CLASS_MAP = {
  primary: 'bg-primary-container/15 text-primary',
  secondary: 'bg-secondary-container/35 text-secondary',
  surface: 'bg-surface-container-high text-on-surface-variant',
};

const SIDE_CLASS_MAP = {
  Long: 'bg-primary-container/15 text-primary',
  Short: 'bg-error-container text-error',
};

const TIMELINE_TONE_CLASS_MAP = {
  success: 'bg-primary-container/20 text-primary',
  info: 'bg-secondary-container/35 text-secondary',
  warning: 'bg-surface-container-high text-on-surface',
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

function getPnlClass(value) {
  return String(value).startsWith('-') ? 'text-error' : 'text-primary';
}

export function TradingAccountModulePage() {
  const router = useRouter();

  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeFilter, setActiveFilter] = useState(TRADING_FILTERS[0].key);
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

  const filteredPositions = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return TRADING_POSITIONS.filter((position) => {
      const matchesSearch = !searchLower || position.symbol.toLowerCase().includes(searchLower);

      if (activeFilter === 'open') {
        return matchesSearch && position.status === 'open';
      }

      if (activeFilter === 'warning') {
        return matchesSearch && position.status === 'warning';
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
        <header className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_16px_32px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-primary/10" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-secondary/10" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Trading Account</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">Tài khoản giao dịch</h1>
              <p className="mt-3 max-w-2xl text-sm text-on-surface-variant sm:text-base">
                Theo dõi vị thế đang mở, quản trị rủi ro và chuẩn bị luồng vào lệnh. Bản hiện tại là UI hardcode để chốt trải nghiệm trước khi
                kết nối dữ liệu thật.
              </p>
            </div>

            <div className="min-w-[260px] rounded-xl bg-surface-container-low p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Tổng Equity</p>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface">{TRADING_OVERVIEW.totalEquityUSDT} USDT</p>
              <p className="mt-1 text-sm text-primary">PnL chưa chốt: {TRADING_OVERVIEW.unrealizedPnlUSDT} USDT</p>
              <div className="mt-3 h-2 rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${TRADING_OVERVIEW.marginUsagePercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">Sử dụng ký quỹ: {TRADING_OVERVIEW.marginUsagePercent}%</p>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container px-5 text-sm font-bold text-on-primary shadow-[0_12px_24px_rgba(0,108,79,0.22)] transition-all hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              Mở vị thế mới
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-low px-5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              Chuyển tài sản
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-low px-5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container"
              disabled
            >
              Đang đồng bộ dữ liệu...
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TRADING_KPI_CARDS.map((card) => (
            <article
              key={card.key}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-on-surface">{card.title}</h2>
                  <p className="mt-1 text-xs text-on-surface-variant">{card.subtitle}</p>
                </div>
                <span className={`material-symbols-outlined rounded-lg p-2 text-xl ${CARD_TONE_CLASS_MAP[card.tone] || CARD_TONE_CLASS_MAP.surface}`}>
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-on-surface">{card.amount}</p>
              <p className={`mt-1 text-sm font-semibold ${getPnlClass(card.delta)}`}>{card.delta}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_32px_rgba(0,0,0,0.03)] xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-on-surface">Vị thế đang mở</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Theo dõi biến động theo thời gian thực (UI demo).</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-1">
                {TRADING_FILTERS.map((filter) => {
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
              <label className="relative block" htmlFor="trading-position-search">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  id="trading-position-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm theo mã cặp giao dịch (VD: BTCUSDT)"
                  className="w-full rounded-xl border border-outline-variant/35 bg-surface-container-low py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pair</th>
                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Side</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Entry</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mark</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">PnL</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Liq. Price</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredPositions.length > 0 ? (
                    filteredPositions.map((position) => (
                      <tr key={position.id} className="transition-colors hover:bg-surface-container-low/70">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-on-surface">{position.symbol}</p>
                          <p className="text-xs text-on-surface-variant">Leverage {position.leverage}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${SIDE_CLASS_MAP[position.side] || SIDE_CLASS_MAP.Long}`}>
                            {position.side}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{position.entryPrice}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{position.markPrice}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{position.quantity}</td>
                        <td className={`px-6 py-4 text-right text-sm font-bold ${getPnlClass(position.pnl)}`}>
                          {position.pnl}
                          <p className="text-xs font-semibold text-on-surface-variant">{position.pnlPercent}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface-variant">{position.liquidationPrice}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-on-surface">{position.margin}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-14 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">candlestick_chart</span>
                        <p className="mt-3 text-base font-semibold text-on-surface">Không có vị thế phù hợp</p>
                        <p className="mt-1 text-sm text-on-surface-variant">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-6 xl:col-span-4">
            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface">Lệnh chờ khớp</h3>
                <button
                  type="button"
                  className="text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                >
                  Hủy tất cả
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {TRADING_OPEN_ORDERS.map((order) => (
                  <div key={order.id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-on-surface">{order.symbol}</p>
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${order.side === 'Buy' ? 'bg-primary-container/15 text-primary' : 'bg-error-container text-error'}`}>
                        {order.side}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {order.type} • Filled {order.filled}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-on-surface">
                      <span>Giá: {order.price}</span>
                      <span>SL: {order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-bold text-on-surface">Risk Monitor</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Mức an toàn tài khoản hiện tại: {TRADING_OVERVIEW.riskLevel}</p>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Available Margin</span>
                    <span>{TRADING_OVERVIEW.availableMarginUSDT} USDT</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-primary-container" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Daily Volume</span>
                    <span>{TRADING_OVERVIEW.dailyVolumeUSDT} USDT</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high">
                    <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-secondary to-secondary-container" />
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_12px_28px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-bold text-on-surface">Hoạt động gần đây</h3>
              <div className="mt-4 space-y-3">
                {TRADING_ACTIVITY_TIMELINE.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-3">
                    <span className={`mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-bold ${TIMELINE_TONE_CLASS_MAP[item.tone] || TIMELINE_TONE_CLASS_MAP.info}`}>
                      {item.time}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{item.title}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{item.detail}</p>
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
