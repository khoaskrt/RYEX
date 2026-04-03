'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DepositTopNav } from '@/features/deposit/components/DepositTopNav';
import FundingNavigationSidebar from '@/shared/components/FundingNavigationSidebar';
import FundingNavigationTabBar from '@/shared/components/FundingNavigationTabBar';
import LandingFooter from '@/shared/components/LandingFooter';
import { ROUTES } from '@/shared/config/routes';
import { supabase } from '@/shared/lib/supabase/client';
import { HISTORY_PAGE_SIZE, HISTORY_STATUS_OPTIONS } from './constants';

const DEFAULT_PROFILE_VISUAL = {
  avatarUrl: '',
  initial: 'U',
};

const STATUS_CLASS_MAP = {
  completed: 'bg-primary-container/20 text-primary',
  confirming: 'bg-secondary-container/40 text-secondary',
  pending: 'bg-surface-container-high text-on-surface-variant',
  failed: 'bg-error-container text-error',
};

const STATUS_LABEL_MAP = {
  completed: 'Hoàn thành',
  confirming: 'Đang xác nhận',
  pending: 'Chờ xử lý',
  failed: 'Thất bại',
};

const TYPE_LABEL_MAP = {
  deposit: 'Nạp',
  withdraw: 'Rút',
};

const ERROR_COPY_MAP = {
  WALLET_UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  WALLET_INVALID_FILTER: 'Bộ lọc không hợp lệ. Vui lòng kiểm tra lại.',
  WALLET_INVALID_PAGINATION: 'Phân trang không hợp lệ.',
  WALLET_TRANSACTIONS_FETCH_FAILED: 'Không thể tải lịch sử giao dịch. Vui lòng thử lại.',
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

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sanitizeCsvValue(value) {
  const escaped = String(value ?? '').replace(/"/g, '""');
  return `"${escaped}"`;
}

function mapApiRecord(record) {
  return {
    orderId: record.transactionId || '--',
    type: record.type || 'withdraw',
    coin: record.symbol || 'USDT',
    amount: record.amount || '0.00000000',
    timestamp: record.createdAt || new Date().toISOString(),
    blockchainRecord: record.txHash || record.toAddress || '--',
    status: record.status || 'pending',
    note: record.explorerUrl ? 'Đã đồng bộ với blockchain explorer' : 'Đang chờ đồng bộ blockchain',
  };
}

export function HistoryModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileVisual, setProfileVisual] = useState(DEFAULT_PROFILE_VISUAL);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const [coinFilter, setCoinFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState(toDateInputValue(defaultFrom));
  const [toDate, setToDate] = useState(toDateInputValue(now));
  const [currentPage, setCurrentPage] = useState(1);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');

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

  async function fetchHistoryRecords() {
    setIsLoadingRecords(true);
    setRecordsError('');

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        setRecordsError(ERROR_COPY_MAP.WALLET_UNAUTHORIZED);
        setHistoryRecords([]);
        return;
      }

      const response = await fetch('/api/v1/wallet/transactions?type=all&status=all&limit=200&offset=0', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = payload?.error?.code || 'WALLET_TRANSACTIONS_FETCH_FAILED';
        setRecordsError(ERROR_COPY_MAP[code] || payload?.error?.message || ERROR_COPY_MAP.WALLET_TRANSACTIONS_FETCH_FAILED);
        setHistoryRecords([]);
        return;
      }

      const mapped = Array.isArray(payload.transactions) ? payload.transactions.map(mapApiRecord) : [];
      setHistoryRecords(mapped);
    } catch (error) {
      console.error('Failed to fetch wallet transactions', error);
      setRecordsError(ERROR_COPY_MAP.WALLET_TRANSACTIONS_FETCH_FAILED);
      setHistoryRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  }

  useEffect(() => {
    if (!isAuthResolved || !isAuthenticated) return;
    fetchHistoryRecords();
  }, [isAuthResolved, isAuthenticated]);

  const coinOptions = useMemo(() => {
    return ['all', ...new Set(historyRecords.map((record) => record.coin))];
  }, [historyRecords]);

  const filteredRecords = useMemo(() => {
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const toTime = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

    return historyRecords
      .filter((record) => {
        const recordTime = new Date(record.timestamp).getTime();
        if (Number.isNaN(recordTime)) return false;
        if (record.type !== 'deposit' && record.type !== 'withdraw') return false;
        if (coinFilter !== 'all' && record.coin !== coinFilter) return false;
        if (statusFilter !== 'all' && record.status !== statusFilter) return false;
        if (recordTime < fromTime || recordTime > toTime) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [coinFilter, fromDate, historyRecords, statusFilter, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / HISTORY_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * HISTORY_PAGE_SIZE;
    return filteredRecords.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredRecords, safePage]);

  function handleDownloadCsv() {
    const headers = ['Coin', 'Số lượng', 'Thời gian', 'Bản ghi blockchain', 'Trạng thái', 'Ghi chú', 'ID lệnh', 'Loại'];
    const rows = filteredRecords.map((record) => [
      record.coin,
      record.amount,
      formatDateTime(record.timestamp),
      record.blockchainRecord,
      STATUS_LABEL_MAP[record.status] || record.status,
      record.note,
      record.orderId,
      TYPE_LABEL_MAP[record.type] || record.type,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => sanitizeCsvValue(value)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ryex-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleFilterChange(setter, value) {
    setter(value);
    setCurrentPage(1);
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

      <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 pb-12 pt-24 sm:px-6 lg:ml-60 lg:px-8">
        <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Lịch sử tài khoản</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                Theo dõi lịch sử nạp và rút trong 30 ngày gần nhất. Bạn có thể lọc dữ liệu và tải CSV theo bộ lọc hiện tại.
              </p>
            </div>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-5 text-sm font-bold text-on-primary shadow-[0_12px_24px_rgba(0,108,79,0.2)] transition-all hover:opacity-90 active:scale-95"
              onClick={handleDownloadCsv}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Tải CSV
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm font-semibold text-on-surface-variant">
              Coin
              <select
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
                value={coinFilter}
                onChange={(event) => handleFilterChange(setCoinFilter, event.target.value)}
              >
                {coinOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Tất cả coin' : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-semibold text-on-surface-variant">
              Trạng thái
              <select
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
                value={statusFilter}
                onChange={(event) => handleFilterChange(setStatusFilter, event.target.value)}
              >
                {HISTORY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-semibold text-on-surface-variant">
              Từ ngày
              <input
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
                type="date"
                value={fromDate}
                onChange={(event) => handleFilterChange(setFromDate, event.target.value)}
              />
            </label>

            <label className="space-y-1 text-sm font-semibold text-on-surface-variant">
              Đến ngày
              <input
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
                type="date"
                value={toDate}
                onChange={(event) => handleFilterChange(setToDate, event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
          {recordsError ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-error">error</span>
              <h3 className="mt-4 text-lg font-bold text-on-surface">Không thể tải lịch sử giao dịch</h3>
              <p className="mt-1 max-w-md text-sm text-on-surface-variant">{recordsError}</p>
              <button
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-surface-container-high px-4 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
                onClick={fetchHistoryRecords}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : isLoadingRecords ? (
            <div className="flex items-center justify-center px-6 py-16">
              <p className="text-sm text-on-surface-variant">Đang tải lịch sử giao dịch...</p>
            </div>
          ) : paginatedRecords.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Coin</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Số lượng</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Thời gian</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Bản ghi blockchain</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Ghi chú</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">ID lệnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {paginatedRecords.map((record) => (
                      <tr key={record.orderId} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                              {TYPE_LABEL_MAP[record.type]}
                            </span>
                            <span className="font-bold text-on-surface">{record.coin}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-on-surface">{record.amount}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDateTime(record.timestamp)}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-on-surface-variant">{record.blockchainRecord}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${
                              STATUS_CLASS_MAP[record.status] || 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {STATUS_LABEL_MAP[record.status] || record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{record.note}</td>
                        <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{record.orderId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {paginatedRecords.map((record) => (
                  <article key={record.orderId} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                          {TYPE_LABEL_MAP[record.type]}
                        </span>
                        <span className="font-bold text-on-surface">{record.coin}</span>
                      </div>
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-bold ${
                          STATUS_CLASS_MAP[record.status] || 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {STATUS_LABEL_MAP[record.status] || record.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{record.amount}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{formatDateTime(record.timestamp)}</p>
                    <p className="mt-2 font-mono text-xs text-on-surface-variant">{record.blockchainRecord}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">{record.note}</p>
                    <p className="mt-1 font-mono text-[11px] text-outline">ID: {record.orderId}</p>
                  </article>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-outline-variant/15 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <p className="text-sm text-on-surface-variant">
                  Hiển thị {paginatedRecords.length} / {filteredRecords.length} bản ghi
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-surface-container-high px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="text-sm font-semibold text-on-surface">
                    Trang {safePage} / {totalPages}
                  </span>
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-surface-container-high px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    type="button"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <img alt="Không có dữ liệu lịch sử" className="h-36 w-36" src="/images/history-empty.svg" />
              <h3 className="mt-4 text-lg font-bold text-on-surface">Không tìm thấy bản ghi nào</h3>
              <p className="mt-1 max-w-md text-sm text-on-surface-variant">
                Thử thay đổi bộ lọc coin, trạng thái hoặc khoảng thời gian để xem dữ liệu phù hợp hơn.
              </p>
              <button
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-surface-container-high px-4 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
                onClick={() => {
                  setCoinFilter('all');
                  setStatusFilter('all');
                  setFromDate(toDateInputValue(defaultFrom));
                  setToDate(toDateInputValue(now));
                  setCurrentPage(1);
                }}
                type="button"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
          Xem thêm tài sản tổng quan tại{' '}
          <Link className="font-bold text-primary hover:underline" href={ROUTES.assets}>
            trang Tài sản
          </Link>
          .
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
