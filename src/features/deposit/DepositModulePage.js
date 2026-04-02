'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AssetsDropdown from '@/shared/components/AssetsDropdown';
import LandingFooter from '@/shared/components/LandingFooter';
import { supabase } from '@/shared/lib/supabase/client';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const DEPOSIT_TOKENS = [
  { symbol: 'USDT', name: 'Tether USD', network: 'TRC20', eta: '1-3 phút', fee: '0 USDT' },
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', eta: '10-30 phút', fee: '0 BTC' },
  { symbol: 'ETH', name: 'Ethereum', network: 'ERC20', eta: '3-10 phút', fee: '0 ETH' },
  { symbol: 'SOL', name: 'Solana', network: 'SOL', eta: '1-2 phút', fee: '0 SOL' },
];

const DEPOSIT_STATES = [
  {
    key: 'default',
    icon: 'check_circle',
    title: 'Mặc định (Default)',
    description: 'Sẵn sàng nhận nạp tiền, QR và địa chỉ ví đã được cấp.',
    badgeClass: 'bg-primary-container/20 text-primary',
  },
  {
    key: 'loading',
    icon: 'progress_activity',
    title: 'Đang tải (Loading)',
    description: 'Đang khởi tạo địa chỉ nạp tiền và đồng bộ trạng thái mạng lưới.',
    badgeClass: 'bg-surface-container-high text-on-surface-variant animate-pulse',
  },
  {
    key: 'error',
    icon: 'error',
    title: 'Lỗi (Error)',
    description: 'Không thể tạo địa chỉ nạp tiền. User có thể bấm thử lại.',
    badgeClass: 'bg-error-container text-error',
  },
  {
    key: 'empty',
    icon: 'inbox',
    title: 'Trống (Empty)',
    description: 'Chưa có lịch sử nạp tiền nào. Gợi ý thao tác nạp ngay.',
    badgeClass: 'bg-surface-container-low text-on-surface-variant',
  },
];

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
      router.replace('/app/auth/login');
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
      <nav className="fixed top-0 z-50 w-full border-b border-outline-variant/25 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-10">
            <Link className="text-2xl font-black tracking-tighter text-primary" href="/">
              RYEX
            </Link>
            <div className="hidden h-full items-center gap-8 md:flex">
              <Link className="flex h-full items-center text-on-surface-variant transition-colors hover:text-primary-container" href="/app/market">
                Thị trường
              </Link>
              <Link className="flex h-full items-center text-on-surface-variant transition-colors hover:text-primary-container" href="/app/assets">
                Tài sản
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
                </button>

                <AssetsDropdown />

                <Link
                  href="/app/profile"
                  className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-outline-variant/40 bg-surface-container-low text-sm font-bold text-primary transition-all hover:border-primary-container hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                >
                  {profileVisual.avatarUrl ? (
                    <img alt="Avatar người dùng" className="h-full w-full object-cover" src={profileVisual.avatarUrl} />
                  ) : (
                    profileVisual.initial
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
                  href="/app/auth/login"
                >
                  Đăng nhập
                </Link>
                <Link
                  className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary shadow-[0_12px_32px_rgba(0,108,79,0.22)] transition-all hover:opacity-90 active:scale-95"
                  href="/app/auth/signup"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <header className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-[0_24px_48px_rgba(0,108,79,0.22)] md:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/85">Deposit Center</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Nạp tiền vào tài khoản</h1>
              <p className="mt-3 text-sm text-white/90 md:text-base">
                Màn hình này là điểm đến chung sau khi user bấm <span className="font-bold">"Nạp tiền"</span> ở bất kỳ khu vực nào.
                Hiện tại UI hardcode để chốt UX, sau đó sẽ tích hợp API và flow xử lý thật.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/15 p-3 text-center backdrop-blur">
              <div>
                <p className="text-xs text-white/80">Trạng thái</p>
                <p className="text-sm font-bold">Live Mock</p>
              </div>
              <div>
                <p className="text-xs text-white/80">Độ ưu tiên</p>
                <p className="text-sm font-bold">P0 UI</p>
              </div>
              <div>
                <p className="text-xs text-white/80">Ngôn ngữ</p>
                <p className="text-sm font-bold">VI (EN)</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <article className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] lg:col-span-7 lg:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">Nạp Crypto</h2>
              <span className="rounded-lg bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary">Bước 1/3</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DEPOSIT_TOKENS.map((token) => {
                const isSelected = selectedToken.symbol === token.symbol;
                return (
                  <button
                    key={token.symbol}
                    className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container ${
                      isSelected
                        ? 'border-primary bg-primary-container/10 shadow-[0_12px_24px_rgba(1,188,141,0.12)]'
                        : 'border-outline-variant/30 bg-surface hover:border-primary-container/70 hover:bg-surface-container-low active:scale-[0.99]'
                    }`}
                    onClick={() => setSelectedToken(token)}
                    type="button"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-base font-bold text-on-surface">{token.symbol}</p>
                      <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                        {token.network}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{token.name}</p>
                    <p className="mt-2 text-xs font-medium text-on-surface-variant">Xác nhận: {token.eta}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-outline-variant/30 bg-surface p-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ ví nạp ({selectedToken.network})</p>
                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-3 text-sm font-semibold text-on-surface">
                  0xA9F2...7D3C...5E11
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-high px-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    Sao chép
                  </button>
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container-high px-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    Quét QR
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Lưu ý mạng nạp</p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">verified_user</span>
                    Chỉ nạp đúng mạng <span className="font-bold text-on-surface">{selectedToken.network}</span> để tránh mất tài sản.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">schedule</span>
                    Thời gian xử lý dự kiến: <span className="font-bold text-on-surface">{selectedToken.eta}</span>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">payments</span>
                    Phí nạp hiện tại: <span className="font-bold text-on-surface">{selectedToken.fee}</span>.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button className="h-11 rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 text-sm font-bold text-on-primary shadow-[0_12px_24px_rgba(0,108,79,0.2)] transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container">
                Tôi đã chuyển tiền
              </button>
              <button className="h-11 rounded-xl bg-surface-container-high px-4 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container">
                Làm mới trạng thái
              </button>
              <button
                className="h-11 rounded-xl border border-outline-variant/40 bg-surface px-4 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:cursor-not-allowed disabled:opacity-40"
                disabled
              >
                Tạm khóa (Disabled)
              </button>
            </div>
          </article>

          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-lg font-extrabold">Tóm tắt giao dịch nạp</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Tài sản</span>
                  <span className="font-bold text-on-surface">{selectedToken.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Mạng</span>
                  <span className="font-bold text-on-surface">{selectedToken.network}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Số tiền tối thiểu</span>
                  <span className="font-bold text-on-surface">10 {selectedToken.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Trạng thái hiện tại</span>
                  <span className="rounded-md bg-primary-container/20 px-2 py-1 text-xs font-bold text-primary">Chờ xác nhận</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-surface-container-low p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bảo mật</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Hệ thống yêu cầu xác thực 2 lớp (2FA) trước khi mở tính năng rút tiền sau nạp.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-lg font-extrabold">Interaction States (Hardcode Preview)</h3>
              <div className="space-y-3">
                {DEPOSIT_STATES.map((state) => (
                  <div key={state.key} className="rounded-xl border border-outline-variant/20 bg-surface p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{state.icon}</span>
                        <p className="text-sm font-bold text-on-surface">{state.title}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${state.badgeClass}`}>Preview</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{state.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
              <h3 className="mb-3 text-lg font-extrabold">Lịch sử nạp gần nhất (Empty state demo)</h3>
              <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">account_balance_wallet</span>
                <p className="mt-3 text-sm font-semibold text-on-surface">Chưa có giao dịch nạp</p>
                <p className="mt-1 text-xs text-on-surface-variant">Sau khi nạp thành công, lịch sử sẽ hiển thị tại đây.</p>
                <button className="mt-4 rounded-lg bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-xs font-bold text-on-primary transition-all hover:opacity-90 active:scale-95">
                  Nạp tiền ngay
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
