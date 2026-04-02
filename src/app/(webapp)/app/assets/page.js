'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { goToDeposit, goToWithdraw } from '@/shared/lib/navigation/fundingNavigation';
import AssetsDropdown from '@/shared/components/AssetsDropdown';
import LandingFooter from '@/shared/components/LandingFooter';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import { getTokenIconUrl } from '@/shared/lib/ui/tokenIcons';

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

/**
 * Fetch user assets from API
 * @param {string} accessToken - Supabase access token
 * @returns {Promise<Object>} Assets payload
 */
async function fetchUserAssets(accessToken) {
  const response = await fetch('/api/v1/user/assets', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody?.error?.message || 'Failed to fetch assets');
    error.code = errorBody?.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Format number with commas
 */
function formatNumber(value) {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function mapAssetsErrorMessage(error) {
  const code = String(error?.code || '');
  if (code === 'ASSET_UNAUTHORIZED') {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (code === 'ASSET_FETCH_FAILED') {
    return 'Không thể tải dữ liệu tài sản lúc này. Vui lòng thử lại sau.';
  }
  if (error?.status === 401) {
    return 'Bạn cần đăng nhập để xem tài sản.';
  }
  return 'Không thể tải dữ liệu tài sản.';
}

export default function AssetsPage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  // Assets data state
  const [assetsData, setAssetsData] = useState(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState('');

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

  // Fetch assets when auth is resolved
  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated) return;

    let isMounted = true;

    async function loadAssets() {
      try {
        setIsLoadingAssets(true);
        setAssetsError('');

        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error('No authentication token');
        }

        const payload = await fetchUserAssets(accessToken);
        if (!isMounted) return;

        setAssetsData(payload);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load assets:', error);
        setAssetsError(mapAssetsErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingAssets(false);
        }
      }
    }

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, isAuthenticated]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace('/app/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleGoToDeposit() {
    goToDeposit(router);
  }

  function handleGoToWithdraw() {
    goToWithdraw(router);
  }

  // Filter assets based on search term
  const filteredAssets = (assetsData?.assets || []).filter((asset) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = asset.symbol.toLowerCase().includes(searchLower) || asset.name.toLowerCase().includes(searchLower);

    if (hideSmallBalances) {
      const valueNum = Number.parseFloat(asset.valueUSDT) || 0;
      return matchesSearch && valueNum >= 10;
    }

    return matchesSearch;
  });
  const hasAnyAssets = (assetsData?.assets || []).length > 0;
  const isFilterActive = searchTerm.trim().length > 0 || hideSmallBalances;
  const emptyStateTitle = hasAnyAssets && isFilterActive ? 'Không tìm thấy tài sản phù hợp' : 'Chưa có tài sản';
  const emptyStateDescription = hasAnyAssets && isFilterActive
    ? 'Thử đổi từ khóa tìm kiếm hoặc tắt bộ lọc số dư nhỏ.'
    : 'Bắt đầu bằng cách nạp tiền vào tài khoản của bạn';

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      {/* TopAppBar - Consistent with market page */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <Link className="text-2xl font-black tracking-tighter text-[#006c4f]" href="/">
              RYEX
            </Link>
            <div className="hidden h-full items-center gap-8 md:flex">
              <Link className="flex h-full items-center text-[#3c4a43] transition-colors hover:text-[#01bc8d]" href="/app/market">
                Thị trường
              </Link>
              <div className="group relative flex h-full items-center">
                <button className="flex h-full items-center gap-1 text-[#3c4a43] transition-colors group-hover:text-[#01bc8d]">
                  Giao dịch
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">
                    expand_more
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  className="rounded-lg px-5 py-2 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
                <AssetsDropdown />
                <Link
                  aria-label="Hồ sơ người dùng"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#bbcac1]/30 bg-surface-container-low text-[#3c4a43] transition-colors hover:bg-surface-container-high"
                  href="/app/users"
                  title="Hồ sơ"
                >
                  {profileVisual.avatarUrl ? (
                    <img
                      alt="Avatar người dùng"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      src={profileVisual.avatarUrl}
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase">{profileVisual.initial}</span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <button
                  className="rounded-lg px-5 py-2 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
                  onClick={() => router.push('/app/auth/login')}
                  type="button"
                >
                  Đăng nhập
                </button>
                <button
                  className="rounded-xl bg-gradient-to-br from-[#006c4f] to-[#01bc8d] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-transform duration-200 active:scale-95"
                  onClick={() => router.push('/app/auth/signup')}
                  type="button"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Funding Navigation Sidebar (Desktop) */}
      <FundingNavigationSidebar />

      {/* Funding Navigation Tab Bar (Mobile) */}
      <FundingNavigationTabBar />

      {/* Main Content */}
      <main className="min-h-screen pt-24 px-8 pb-12 max-w-[1440px] mx-auto lg:ml-60">
        {/* Loading State */}
        {isLoadingAssets && (
          <div className="flex items-center justify-center py-20">
            <p className="text-on-surface-variant">Đang tải dữ liệu tài sản...</p>
          </div>
        )}

        {/* Error State */}
        {assetsError && !isLoadingAssets && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[#ba1a1a] mb-4">{assetsError}</p>
            <button
              className="rounded-lg bg-primary text-white px-6 py-2 font-semibold hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Main Content - Only show when data loaded successfully */}
        {!isLoadingAssets && !assetsError && assetsData && (
          <>
            {/* Hero Section: Total Balance */}
            <header className="mb-12">
              <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                <span className="text-sm font-semibold tracking-wide uppercase">Tổng số dư tài sản</span>
                <button className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
                    {assetsData.totalBalanceBTC} <span className="text-xl font-medium text-on-surface-variant">BTC</span>
                  </h1>
                  <p className="text-xl text-on-surface-variant mt-1">
                    ≈ {formatNumber(assetsData.totalBalanceUSDT)} <span className="text-sm font-medium">USDT</span>
                  </p>
                </div>
                <div className="flex gap-3 mb-1">
                  <button
                    className="bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
                    onClick={handleGoToDeposit}
                    type="button"
                  >
                    Nạp tiền
                  </button>
                  <button
                    className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95"
                    onClick={handleGoToWithdraw}
                    type="button"
                  >
                    Rút tiền
                  </button>
                  <button className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-surface-container-high active:scale-95">
                    Chuyển tiền
                  </button>
                </div>
              </div>
            </header>

            {/* Bento Grid: Account Breakdown */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Funding Card */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] hover:translate-y-[-4px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Tài khoản tài trợ</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">Funding Account</p>
                  </div>
                  <span className="material-symbols-outlined text-primary bg-primary-container/10 p-2 rounded-lg">wallet</span>
                </div>
                <div className="mb-6">
                  <p className="text-2xl font-extrabold">
                    {assetsData.fundingAccount.balanceBTC} <span className="text-sm font-semibold text-on-surface-variant">BTC</span>
                  </p>
                  <p className="text-on-surface-variant font-medium">≈ {formatNumber(assetsData.fundingAccount.balanceUSDT)} USDT</p>
                </div>
                <div className="pt-6 border-t border-outline-variant/10 flex justify-between">
                  <a className="text-primary text-sm font-bold hover:underline" href="#">
                    Chi tiết
                  </a>
                  <a className="text-primary text-sm font-bold hover:underline" href="#">
                    Nạp/Rút
                  </a>
                </div>
              </div>

              {/* Trading Card */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] hover:translate-y-[-4px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Tài khoản giao dịch</h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">Trading Account</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary bg-secondary-container/10 p-2 rounded-lg">swap_horiz</span>
                </div>
                <div className="mb-6">
                  <p className="text-2xl font-extrabold">
                    {assetsData.tradingAccount.balanceBTC} <span className="text-sm font-semibold text-on-surface-variant">BTC</span>
                  </p>
                  <p className="text-on-surface-variant font-medium">≈ {formatNumber(assetsData.tradingAccount.balanceUSDT)} USDT</p>
                </div>
                <div className="pt-6 border-t border-outline-variant/10 flex justify-between">
                  <a className="text-primary text-sm font-bold hover:underline" href="#">
                    Chi tiết
                  </a>
                  <a className="text-primary text-sm font-bold hover:underline" href="#">
                    Giao dịch ngay
                  </a>
                </div>
              </div>
            </section>

            {/* Asset List: The Financial Sheet */}
            <section className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
                <h2 className="text-xl font-extrabold tracking-tight">Danh sách tài sản</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      search
                    </span>
                    <input
                      className="bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container w-64"
                      placeholder="Tìm kiếm tài sản"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="rounded border-outline-variant text-primary focus:ring-primary-container"
                      type="checkbox"
                      checked={hideSmallBalances}
                      onChange={(e) => setHideSmallBalances(e.target.checked)}
                    />
                    <span className="text-xs font-semibold text-on-surface-variant">Ẩn số dư nhỏ</span>
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tài sản</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Số dư</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Giá</th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                        Giá trị (USDT)
                      </th>
                      <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((asset, idx) => {
                        const resolvedIconUrl = getTokenIconUrl(asset.symbol, asset.iconUrl);
                        return (
                        <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full flex items-center justify-center bg-transparent">
                                {resolvedIconUrl ? (
                                  <img alt={asset.symbol} className="h-6 w-6 rounded-full object-contain" src={resolvedIconUrl} />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-primary-container/20 flex items-center justify-center text-xs font-bold text-primary">
                                    {asset.symbol.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold">{asset.symbol}</p>
                                <p className="text-xs text-on-surface-variant">{asset.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right font-semibold">{asset.balance}</td>
                          <td className="px-8 py-5 text-right font-medium">{formatNumber(asset.price)}</td>
                          <td className="px-8 py-5 text-right font-bold text-primary">{formatNumber(asset.valueUSDT)}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-4">
                              <button className="text-primary font-bold text-sm hover:underline">Giao dịch</button>
                              <button className="text-primary font-bold text-sm hover:underline" onClick={handleGoToDeposit} type="button">
                                Nạp
                              </button>
                              <button className="text-primary font-bold text-sm hover:underline" onClick={handleGoToWithdraw} type="button">
                                Rút
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">account_balance_wallet</span>
                            <div>
                              <p className="text-lg font-semibold text-on-surface mb-1">{emptyStateTitle}</p>
                              <p className="text-sm text-on-surface-variant">{emptyStateDescription}</p>
                            </div>
                            <button
                              className="bg-gradient-to-br from-[#006c4f] to-[#01bc8d] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95"
                              onClick={handleGoToDeposit}
                              type="button"
                            >
                              Nạp tiền ngay
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredAssets.length > 0 && (
                <div className="px-8 py-6 bg-surface-container-low/20 flex justify-center">
                  <button className="text-on-surface-variant font-bold text-sm hover:text-primary transition-colors flex items-center gap-2">
                    Xem tất cả tài sản
                    <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                  </button>
                </div>
              )}
            </section>

            {/* Market Pulse Footer */}
            <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl flex items-center justify-between shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim opacity-10 rounded-full translate-x-16 -translate-y-16"></div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface-variant mb-1">Nâng cấp tài khoản Institutional</h4>
                  <p className="text-on-surface font-semibold">Nhận mức phí giao dịch 0.02% và đòn bẩy lên tới 100x</p>
                </div>
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 relative z-10 transition-all active:scale-95">
                  Nâng cấp ngay
                </button>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-on-surface-variant">Bảo mật tài sản</span>
                  <span className="text-xs text-primary font-bold bg-primary-container/10 px-2 py-0.5 rounded">Hoạt động</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="w-[95%] h-full bg-gradient-to-br from-[#006c4f] to-[#01bc8d]"></div>
                  </div>
                  <span className="text-xs font-bold">95%</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
