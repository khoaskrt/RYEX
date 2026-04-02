import PriceChart from '@/features/market/PriceChart';
import AppTopNav from '@/shared/components/AppTopNav';
import LandingFooter from '@/shared/components/LandingFooter';

const TOKEN_VISUAL_MAP = {
  BTCUSDT: { mark: '₿', color: '#f2a900', iconUrl: '/images/tokens/btc.png' },
  ETHUSDT: { mark: 'Ξ', color: '#627eea', iconUrl: '/images/tokens/eth.png' },
  SOLUSDT: { mark: 'S', color: '#14f195', iconUrl: '/images/tokens/sol.png' },
  BNBUSDT: { mark: 'B', color: '#f3ba2f', iconUrl: '/images/tokens/bnb.png' },
  XRPUSDT: { mark: 'X', color: '#23292f', iconUrl: '/images/tokens/xrp.png' },
  ADAUSDT: { mark: 'A', color: '#0033ad', iconUrl: '/images/tokens/ada.png' },
};

const DEFAULT_VISUAL = { mark: '•', color: '#006c4f', iconUrl: '' };

const TOKEN_DETAIL_MAP = {
  BTCUSDT: {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$67,842.15',
    change24h: '-0.42%',
    high24h: '$68,910.20',
    low24h: '$66,980.40',
    volumeToken: '38.4K',
    volumeUsd: '$2.61B',
    marketCap: '$1.34T',
    circulatingSupply: '19,840,621 BTC',
    totalSupply: '21,000,000 BTC',
    rank: '#1',
    dominance: '52.8%',
    aboutTitle: 'Về Bitcoin (BTC)',
    aboutText1:
      'Bitcoin là đồng tiền mã hóa đầu tiên trên thế giới, được xây dựng trên mạng lưới blockchain phi tập trung và hoạt động mà không cần bên trung gian.',
    aboutText2:
      'Bitcoin thường được xem là tài sản lưu trữ giá trị trong thị trường crypto, với nguồn cung tối đa cố định 21 triệu BTC và cơ chế bảo mật bằng Proof-of-Work.',
  },
};

function getTokenPresentation(requestedSymbol) {
  const marketPair = requestedSymbol.endsWith('USDT') ? requestedSymbol : `${requestedSymbol}USDT`;
  const symbol = marketPair.replace(/USDT$/, '');
  const visual = TOKEN_VISUAL_MAP[marketPair] || DEFAULT_VISUAL;

  if (TOKEN_DETAIL_MAP[marketPair]) {
    return {
      ...TOKEN_DETAIL_MAP[marketPair],
      iconUrl: visual.iconUrl,
      mark: visual.mark,
      markColor: visual.color,
    };
  }

  return {
    ...TOKEN_DETAIL_MAP.BTCUSDT,
    name: symbol,
    symbol,
    circulatingSupply: `-- ${symbol}`,
    totalSupply: `-- ${symbol}`,
    aboutTitle: `Về ${symbol} (${symbol})`,
    iconUrl: visual.iconUrl,
    mark: visual.mark,
    markColor: visual.color,
  };
}

export default function PricePage({ searchParams, data }) {
  const requestedSymbol = (searchParams?.symbol || 'BTCUSDT').toUpperCase();
  const fallbackToken = getTokenPresentation(requestedSymbol);
  const token = {
    ...fallbackToken,
    name: data?.name || fallbackToken.name,
    symbol: data?.symbolShort || fallbackToken.symbol,
    price: data?.priceDisplay || fallbackToken.price,
    change24h: data?.change24hDisplay || fallbackToken.change24h,
    high24h: data?.high24hDisplay || fallbackToken.high24h,
    low24h: data?.low24hDisplay || fallbackToken.low24h,
    volumeToken: data?.volumeTokenDisplay || fallbackToken.volumeToken,
    volumeUsd: data?.volumeUsdDisplay || fallbackToken.volumeUsd,
    marketCap: data?.marketCapDisplay || fallbackToken.marketCap,
    circulatingSupply: data?.circulatingSupplyDisplay || fallbackToken.circulatingSupply,
    totalSupply: data?.totalSupplyDisplay || fallbackToken.totalSupply,
    rank: data?.rankDisplay || fallbackToken.rank,
    dominance: data?.dominanceDisplay || fallbackToken.dominance,
    iconUrl: data?.iconUrl || fallbackToken.iconUrl,
  };
  const isChangeUp = Number(data?.change24hPercent) >= 0;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-surface font-body text-on-surface antialiased">
        <AppTopNav activeSection="market" />

        <main className="mx-auto min-h-screen max-w-7xl px-8 pb-20 pt-24">
          <section className="mb-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center bg-transparent">
                  {token.iconUrl ? (
                    <img
                      alt={`${token.name} ${token.symbol} cryptocurrency logo`}
                      className="h-14 w-14 object-contain"
                      src={token.iconUrl}
                    />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: token.markColor }}>
                      {token.mark}
                    </span>
                  )}
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight">{token.name}</h1>
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-sm font-bold text-on-surface-variant">
                      {token.symbol}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black tracking-tighter">{token.price}</span>
                    <span className={`flex items-center gap-1 font-bold ${isChangeUp ? 'text-primary' : 'text-error'}`}>
                      <span className="material-symbols-outlined text-sm">{isChangeUp ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                      {token.change24h}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 rounded-2xl bg-surface-container-low p-6 sm:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cao nhất 24h</p>
                  <p className="text-lg font-bold">{token.high24h}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Thấp nhất 24h</p>
                  <p className="text-lg font-bold">{token.low24h}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Khối lượng ({token.symbol})</p>
                  <p className="text-lg font-bold">{token.volumeToken}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Khối lượng (USD)</p>
                  <p className="text-lg font-bold">{token.volumeUsd}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <PriceChart symbol={requestedSymbol} defaultInterval="1h" />

              <div className="rounded-3xl bg-surface-container-lowest p-10 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{token.aboutTitle}</h2>
                <div className="prose prose-slate max-w-none leading-relaxed text-on-surface-variant">
                  <p className="mb-4">{token.aboutText1}</p>
                  <p className="mb-6">{token.aboutText2}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 lg:col-span-4">
              <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                <h3 className="mb-6 text-xl font-extrabold">Thống kê thị trường</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-on-surface-variant">Vốn hóa thị trường</span><span className="font-bold text-on-surface">{token.marketCap}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-on-surface-variant">Cung lưu hành</span><span className="font-bold text-on-surface">{token.circulatingSupply}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-on-surface-variant">Tổng cung tối đa</span><span className="font-bold text-on-surface">{token.totalSupply}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-on-surface-variant">Xếp hạng thị trường</span><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{token.rank}</span></div>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-on-surface-variant">Tỷ lệ thống trị</span><span className="font-bold text-on-surface">{token.dominance}</span></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
