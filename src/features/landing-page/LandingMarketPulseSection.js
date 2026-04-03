'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { fetchMarketTickers, getMarketRefreshIntervalMs } from '@/features/market/realtime/marketClient';

const ROW_LIMIT = 5;
const FALLBACK_ROWS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: '0', change24hPercent: '0', iconUrl: '' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: '0', change24hPercent: '0', iconUrl: '' },
  { symbol: 'BNBUSDT', name: 'BNB', price: '0', change24hPercent: '0', iconUrl: '' },
  { symbol: 'SOLUSDT', name: 'Solana', price: '0', change24hPercent: '0', iconUrl: '' },
  { symbol: 'XRPUSDT', name: 'XRP', price: '0', change24hPercent: '0', iconUrl: '' },
];

const FALLBACK_ICON_COLORS = ['#F7931A', '#627EEA', '#24CF99', '#3B82F6', '#111827', '#7C3AED', '#EF4444'];

function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toShortSymbol(symbol) {
  return String(symbol || '').toUpperCase().replace(/USDT$/, '');
}

function getFallbackColor(symbol) {
  const shortSymbol = toShortSymbol(symbol);
  const seed = shortSymbol
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_ICON_COLORS[seed % FALLBACK_ICON_COLORS.length];
}

function formatPriceForLanding(value) {
  const number = toNumber(value, 0);
  if (number <= 0) return '--';

  const maximumFractionDigits = number >= 1000 ? 2 : number >= 1 ? 2 : 8;

  return `$${number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  })}`;
}

function formatPercentForLanding(value) {
  const number = toNumber(value, 0);
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function buildLandingLists(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      hotRows: FALLBACK_ROWS,
      freshRows: FALLBACK_ROWS,
    };
  }

  const byVolume = [...rows].sort((a, b) => toNumber(b.volume24h, 0) - toNumber(a.volume24h, 0));
  const hotRows = byVolume.slice(0, ROW_LIMIT);
  const hotSymbols = new Set(hotRows.map((row) => row.symbol));

  const byChange = [...rows].sort((a, b) => toNumber(b.change24hPercent, 0) - toNumber(a.change24hPercent, 0));
  const freshRows = byChange.filter((row) => !hotSymbols.has(row.symbol)).slice(0, ROW_LIMIT);

  if (freshRows.length < ROW_LIMIT) {
    const fillRows = byChange.filter((row) => !freshRows.some((existing) => existing.symbol === row.symbol));
    return {
      hotRows,
      freshRows: [...freshRows, ...fillRows].slice(0, ROW_LIMIT),
    };
  }

  return {
    hotRows,
    freshRows,
  };
}

function LandingTickerCard({ title, rows, isLoading }) {
  return (
    <div className="rounded-[2.5rem] border border-outline-variant/20 bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="mb-10 text-center text-2xl font-bold text-[#191c1e]">{title}</h3>
      <div className="space-y-8">
        {rows.map((row) => {
          const shortSymbol = toShortSymbol(row.symbol);
          const isUp = toNumber(row.change24hPercent, 0) >= 0;
          const showPlaceholder = isLoading && toNumber(row.price, 0) <= 0;

          return (
            <div className="flex items-center justify-between" key={`${title}-${row.symbol}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-transparent">
                  {row.iconUrl ? (
                    <img alt={`${shortSymbol} icon`} className="h-6 w-6 rounded-full object-cover" loading="lazy" src={row.iconUrl} />
                  ) : (
                    <span className="text-3xl font-black" style={{ color: getFallbackColor(row.symbol) }}>
                      {shortSymbol.charAt(0) || '•'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold">{shortSymbol || '--'}</p>
                  <p className="text-sm text-on-surface-variant">{row.name || '--'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#191c1e]">{showPlaceholder ? '--' : formatPriceForLanding(row.price)}</p>
                <p className={`font-bold ${isUp ? 'text-[#01BC8D]' : 'text-error'}`}>
                  {showPlaceholder ? '--' : formatPercentForLanding(row.change24hPercent)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LandingMarketPulseSection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const refreshMs = getMarketRefreshIntervalMs();

    async function loadTickers() {
      try {
        const payload = await fetchMarketTickers();
        if (!isMounted) return;
        setRows(Array.isArray(payload.data) ? payload.data : []);
      } catch (error) {
        if (!isMounted) return;
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTickers();
    const intervalId = setInterval(loadTickers, refreshMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const { hotRows, freshRows } = useMemo(() => buildLandingLists(rows), [rows]);

  return (
    <section className="bg-white px-8 py-24">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#191c1e] md:text-5xl">Tiền điện tử thịnh hành</h2>
          <p className="text-lg font-medium text-on-surface-variant">Giao dịch 1.000+ loại tiền điện tử theo thời gian thực.</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <LandingTickerCard title="Nóng" rows={hotRows} isLoading={isLoading} />
          <LandingTickerCard title="Coin mới" rows={freshRows} isLoading={isLoading} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant/30 transition-colors hover:bg-surface-container-low" type="button">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant/30 transition-colors hover:bg-surface-container-low" type="button">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <Link className="flex items-center gap-2 font-bold text-on-surface-variant transition-colors hover:text-primary" href="/app/market">
            Xem thêm
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
