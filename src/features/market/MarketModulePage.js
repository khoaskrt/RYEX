'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import {
  fetchMarketTickers,
  formatPercentChange,
  formatUsdCompact,
  formatUsdPrice,
  getMarketRefreshIntervalMs,
} from './realtime/marketClient';

const TOKEN_ROWS_PER_PAGE = 10;
const PAGINATION_WINDOW = 2;

const TOKEN_VISUAL_MAP = {
  BTCUSDT: { mark: '₿', color: '#f2a900', iconUrl: '/images/tokens/btc.png' },
  ETHUSDT: { mark: 'Ξ', color: '#627eea', iconUrl: '/images/tokens/eth.png' },
  SOLUSDT: { mark: 'S', color: '#14f195', iconUrl: '/images/tokens/sol.png' },
  BNBUSDT: { mark: 'B', color: '#f3ba2f', iconUrl: '/images/tokens/bnb.png' },
  XRPUSDT: { mark: 'X', color: '#23292f', iconUrl: '/images/tokens/xrp.png' },
  ADAUSDT: { mark: 'A', color: '#0033ad', iconUrl: '/images/tokens/ada.png' },
};

const DEFAULT_VISUAL = { mark: '•', color: '#006c4f', iconUrl: '' };

function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getPaginationItems(totalPages, currentPage, windowSize = PAGINATION_WINDOW) {
  if (totalPages <= 1) return [1];

  const pages = new Set([1, totalPages, currentPage]);
  for (let offset = 1; offset <= windowSize; offset += 1) {
    pages.add(Math.max(1, currentPage - offset));
    pages.add(Math.min(totalPages, currentPage + offset));
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items = [];

  sortedPages.forEach((page, index) => {
    if (index > 0) {
      const prevPage = sortedPages[index - 1];
      if (page - prevPage > 1) {
        items.push(`ellipsis-${prevPage}-${page}`);
      }
    }
    items.push(page);
  });

  return items;
}

export function MarketModulePage() {
  const router = useRouter();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [marketRows, setMarketRows] = useState([]);
  const [marketMeta, setMarketMeta] = useState({
    loading: true,
    error: '',
    stale: false,
    lastUpdated: '',
  });

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!data.session) {
        router.replace('/app/auth/login');
        return;
      }
      setIsAuthResolved(true);
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/app/auth/login');
        return;
      }
      setIsAuthResolved(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace('/app/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    if (!isAuthResolved) return;

    let isMounted = true;
    const refreshMs = getMarketRefreshIntervalMs();

    async function loadMarketData() {
      try {
        const payload = await fetchMarketTickers();
        if (!isMounted) return;

        setMarketRows(Array.isArray(payload.data) ? payload.data : []);
        setMarketMeta({
          loading: false,
          error: '',
          stale: Boolean(payload.stale),
          lastUpdated: payload.fetchedAt || new Date().toISOString(),
        });
      } catch (error) {
        if (!isMounted) return;

        setMarketMeta((prev) => ({
          ...prev,
          loading: false,
          stale: true,
          error: 'Không thể cập nhật dữ liệu thị trường lúc này.',
        }));
      }
    }

    loadMarketData();
    const intervalId = setInterval(loadMarketData, refreshMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAuthResolved]);

  const normalizedSearchTerm = searchTerm.trim().toUpperCase();
  const filteredRows = marketRows.filter((row) => {
    if (!normalizedSearchTerm) return true;
    const symbol = (row.symbol || '').toUpperCase();
    const shortSymbol = symbol.replace(/USDT$/, '');
    const name = (row.name || '').toUpperCase();
    return symbol.includes(normalizedSearchTerm) || shortSymbol.includes(normalizedSearchTerm) || name.includes(normalizedSearchTerm);
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / TOKEN_ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginationItems = getPaginationItems(totalPages, safeCurrentPage);
  const paginatedRows = filteredRows.slice((safeCurrentPage - 1) * TOKEN_ROWS_PER_PAGE, safeCurrentPage * TOKEN_ROWS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const topGainer =
    marketRows.length > 0
      ? marketRows.reduce((maxItem, item) =>
          toNumber(item.change24hPercent, 0) > toNumber(maxItem.change24hPercent, 0) ? item : maxItem
        )
      : null;

  const topVolume =
    marketRows.length > 0
      ? marketRows.reduce((maxItem, item) => (toNumber(item.volume24h, 0) > toNumber(maxItem.volume24h, 0) ? item : maxItem))
      : null;

  const topLoser =
    marketRows.length > 0
      ? marketRows.reduce((minItem, item) =>
          toNumber(item.change24hPercent, 0) < toNumber(minItem.change24hPercent, 0) ? item : minItem
        )
      : null;

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-sm text-on-surface-variant">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface text-on-surface antialiased">
      <nav className="fixed top-0 z-50 w-full border-b border-[#bbcac1]/15 bg-[#f7f9fb]/80 shadow-[0_12px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-8">
          <div className="flex items-center gap-10">
            <span className="text-2xl font-black tracking-tighter text-[#006c4f]">RYEX</span>
            <div className="hidden h-full items-center gap-8 md:flex">
              <a className="flex h-full items-center border-b-2 border-[#01bc8d] pb-1 font-bold text-[#006c4f]" href="#">
                Thị trường
              </a>
              <div className="group relative flex h-full items-center">
                <button className="flex h-full items-center gap-1 text-[#3c4a43] transition-colors group-hover:text-[#01bc8d]">
                  Giao dịch
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-180">
                    expand_more
                  </span>
                </button>
                <div className="absolute left-0 top-16 hidden w-[380px] overflow-hidden rounded-2xl border border-[#bbcac1]/20 bg-surface-container-lowest py-2 shadow-[0_24px_48px_rgba(0,0,0,0.1)] group-hover:block">
                  <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                      <span className="material-symbols-outlined">sync</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Chuyển đổi</div>
                      <div className="text-sm leading-tight text-on-surface-variant">Cách đơn giản nhất để giao dịch</div>
                    </div>
                  </a>
                  <a className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-container-low" href="#">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/10 text-primary">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Giao dịch giao ngay</div>
                      <div className="text-sm leading-tight text-on-surface-variant">
                        Giao dịch tiền điện tử với các công cụ toàn diện
                      </div>
                    </div>
                  </a>
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
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg px-5 py-2 text-sm font-semibold text-[#3c4a43] transition-all hover:bg-[#f2f4f6]"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      </nav>

      <main className="min-h-screen pt-16">
        <section className="bg-surface px-8 pb-12 pt-16">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-on-surface">Toàn cảnh thị trường</h1>
              <p className="max-w-xl text-lg text-on-surface-variant">
                Theo dõi dữ liệu thời gian thực cho hơn 500+ tài sản kỹ thuật số hàng đầu.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full rounded-xl border-none bg-surface-container-lowest py-3 pl-12 pr-4 ring-1 ring-[#bbcac1]/30 transition-all outline-none focus:ring-2 focus:ring-primary-container"
                placeholder="Tìm kiếm đồng coin..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                type="text"
              />
            </div>
          </div>
        </section>

        <section className="mb-12 px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-[#bbcac1]/10 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(0,0,0,0.02)]">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="mb-1 text-sm font-medium text-on-surface-variant">Tăng mạnh nhất</span>
                  <span className="text-lg font-bold">
                    {topGainer ? `${topGainer.symbol.replace(/USDT$/, '')} / USDT` : '-- / USDT'}
                  </span>
                </div>
                <span className="rounded bg-primary-container/10 px-2 py-1 text-xs font-bold text-primary">
                  {topGainer ? formatPercentChange(topGainer.change24hPercent) : '--'}
                </span>
              </div>
              <div className="flex h-16 w-full items-end gap-1">
                <div className="h-[30%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[45%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[40%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[60%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[55%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[80%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[100%] flex-1 rounded-t-sm bg-primary-container/20" />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[#bbcac1]/10 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(0,0,0,0.02)]">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="mb-1 text-sm font-medium text-on-surface-variant">Khối lượng 24h</span>
                  <span className="text-lg font-bold">
                    {topVolume ? `${topVolume.symbol.replace(/USDT$/, '')} / USDT` : '-- / USDT'}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant">
                  {topVolume ? formatUsdCompact(topVolume.volume24h) : '--'}
                </span>
              </div>
              <div className="flex h-16 w-full items-end gap-1">
                <div className="h-[70%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[85%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[60%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[90%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[75%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[80%] flex-1 rounded-t-sm bg-outline-variant/20" />
                <div className="h-[85%] flex-1 rounded-t-sm bg-outline-variant/20" />
              </div>
            </div>

            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#bbcac1]/10 bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(0,0,0,0.02)]">
              <div className="absolute right-0 top-0 rounded-bl-lg bg-[#ba1a1a] p-1 text-[10px] font-bold uppercase text-white">
                Giảm mạnh
              </div>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="mb-1 text-sm font-medium text-on-surface-variant">Giảm mạnh nhất</span>
                  <span className="text-lg font-bold">
                    {topLoser ? `${topLoser.symbol.replace(/USDT$/, '')} / USDT` : '-- / USDT'}
                  </span>
                </div>
                <span className="rounded bg-[#ba1a1a]/10 px-2 py-1 text-xs font-bold text-[#ba1a1a]">
                  {topLoser ? formatPercentChange(topLoser.change24hPercent) : '--'}
                </span>
              </div>
              <div className="flex h-16 w-full items-end gap-1">
                <div className="h-[20%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[30%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[25%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[40%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[35%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[50%] flex-1 rounded-t-sm bg-primary-container/20" />
                <div className="h-[55%] flex-1 rounded-t-sm bg-primary-container/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between border-b border-[#bbcac1]/15 pb-4">
              <div className="flex items-center gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button className="whitespace-nowrap border-b-2 border-[#01bc8d] pb-4 font-bold text-[#006c4f]">Tất cả</button>
                <button className="flex items-center gap-1 whitespace-nowrap pb-4 font-medium text-on-surface-variant transition-colors hover:text-[#01bc8d]">
                  <span className="material-symbols-outlined text-[18px]">star</span> Yêu thích
                </button>
                <button className="whitespace-nowrap pb-4 font-medium text-on-surface-variant transition-colors hover:text-[#01bc8d]">Hot</button>
                <button className="whitespace-nowrap pb-4 font-medium text-on-surface-variant transition-colors hover:text-[#01bc8d]">New</button>
                <button className="whitespace-nowrap pb-4 font-medium text-on-surface-variant transition-colors hover:text-[#01bc8d]">Layer 1</button>
                <button className="whitespace-nowrap pb-4 font-medium text-on-surface-variant transition-colors hover:text-[#01bc8d]">DeFi</button>
              </div>
              <div className="flex items-center gap-4 py-2">
                <div className="flex rounded-lg bg-surface-container-low p-1">
                  <button className="rounded-md bg-surface-container-lowest p-1 px-3 text-sm font-bold shadow-sm">Spot</button>
                  <button className="p-1 px-3 text-sm font-medium text-on-surface-variant">Futures</button>
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 text-sm">
              <div className="font-medium text-on-surface-variant">
                {marketMeta.loading ? 'Đang tải dữ liệu thị trường...' : `${filteredRows.length} tài sản`}
              </div>
              <div className="flex items-center gap-3">
                {marketMeta.error ? <span className="text-[#ba1a1a]">{marketMeta.error}</span> : null}
                {marketMeta.stale && !marketMeta.error ? (
                  <span className="rounded bg-[#ba1a1a]/10 px-2 py-1 text-xs font-bold text-[#ba1a1a]">Dữ liệu tạm thời</span>
                ) : null}
                {marketMeta.lastUpdated ? (
                  <span className="text-xs text-on-surface-variant">Cập nhật: {new Date(marketMeta.lastUpdated).toLocaleTimeString('vi-VN')}</span>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-surface-container-high bg-surface-container-low/50">
                      <th className="px-8 py-5 text-sm font-bold tracking-wider text-on-surface-variant">Tên</th>
                      <th className="px-6 py-5 text-sm font-bold tracking-wider text-on-surface-variant">Giá</th>
                      <th className="px-6 py-5 text-sm font-bold tracking-wider text-on-surface-variant">Thay đổi 24h</th>
                      <th className="px-6 py-5 text-sm font-bold tracking-wider text-on-surface-variant">Vốn hóa thị trường</th>
                      <th className="px-6 py-5 text-sm font-bold tracking-wider text-on-surface-variant">Khối lượng 24h</th>
                      <th className="px-8 py-5 text-right text-sm font-bold tracking-wider text-on-surface-variant">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {paginatedRows.map((row, idx) => {
                      const symbol = row.symbol || '';
                      const symbolShort = symbol.replace(/USDT$/, '');
                      const visual = TOKEN_VISUAL_MAP[symbol] || DEFAULT_VISUAL;
                      const mark = visual.mark;
                      const color = visual.color;
                      const iconUrl = row.iconUrl || visual.iconUrl;

                      return (
                        <tr className="group transition-colors hover:bg-surface-container-low" key={`${symbol}-${idx}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-6 w-6 items-center justify-center bg-transparent">
                              {iconUrl ? (
                                <img
                                  alt={`${row.name} logo`}
                                  className="h-6 w-6 rounded-full object-contain"
                                  loading="lazy"
                                  src={iconUrl}
                                />
                              ) : (
                                <span className="text-lg font-bold" style={{ color }}>
                                  {mark}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-lg font-bold">{row.name}</div>
                              <div className="text-sm text-on-surface-variant">{symbolShort}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-lg font-bold">{formatUsdPrice(row.price)}</td>
                        <td className={`px-6 py-6 font-bold ${row.isUp ? 'text-[#01bc8d]' : 'text-[#ba1a1a]'}`}>
                          {formatPercentChange(row.change24hPercent)}
                        </td>
                        <td className="px-6 py-6 font-medium text-on-surface-variant">{row.marketCapDisplay}</td>
                        <td className="px-6 py-6 font-medium text-on-surface-variant">{formatUsdCompact(row.volume24h)}</td>
                        <td className="px-8 py-6 text-right">
                          <button className="rounded-xl bg-surface-container-highest px-6 py-2.5 text-sm font-bold transition-all group-hover:liquidity-gradient group-hover:text-white">
                            Giao dịch
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                    {!marketMeta.loading && filteredRows.length === 0 ? (
                      <tr>
                        <td className="px-8 py-8 text-center text-sm text-on-surface-variant" colSpan={6}>
                          Không tìm thấy tài sản phù hợp.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-surface-container-high bg-surface-container-low/30 px-6 py-5">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bbcac1]/40 bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-[#01bc8d]/50 hover:bg-primary-container/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {paginationItems.map((item) => {
                  if (typeof item === 'string') {
                    return (
                      <span className="px-1.5 text-sm font-medium text-on-surface-variant" key={item}>
                        ...
                      </span>
                    );
                  }

                  const isActive = item === safeCurrentPage;
                  return (
                    <button
                      className={`h-9 min-w-9 rounded-full border px-2 text-sm font-bold transition-colors ${
                        isActive
                          ? 'border-[#01bc8d]/40 bg-primary-container/20 text-primary'
                          : 'border-transparent bg-transparent text-on-surface-variant hover:border-[#bbcac1]/40 hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bbcac1]/40 bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-[#01bc8d]/50 hover:bg-primary-container/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full bg-[#f2f4f6] px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="text-lg font-bold text-[#3c4a43]">RYEX Markets</span>
            <p className="text-sm leading-relaxed text-[#3c4a43]">
              © 2024 RYEX Markets. Được cấp phép và điều hành bởi Cơ quan Quản lý Tài chính Việt Nam. Sàn giao dịch
              tài sản số uy tín và bảo mật hàng đầu cho các nhà đầu tư tổ chức và cá nhân.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-6 md:justify-end">
            {['Điều khoản', 'Bảo mật', 'Cấp phép', 'Rủi ro', 'Hỗ trợ'].map((item) => (
              <a className="text-sm text-[#3c4a43] transition-colors duration-200 hover:text-[#01bc8d]" href="#" key={item}>
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-[#e6e8ea] pt-8">
          <p className="max-w-4xl text-[10px] leading-normal text-on-surface-variant/60">
            Cảnh báo rủi ro: Đầu tư vào tài sản số mang lại rủi ro đáng kể và có thể dẫn đến việc mất toàn bộ vốn đầu
            tư. Bạn nên cân nhắc tình hình tài chính, kinh nghiệm đầu tư và khẩu vị rủi ro trước khi bắt đầu giao
            dịch. Hiệu suất trong quá khứ không đảm bảo cho kết quả trong tương lai. RYEX không cung cấp lời khuyên
            đầu tư.
          </p>
        </div>
      </footer>
    </div>
  );
}
