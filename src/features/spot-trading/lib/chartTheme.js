export const chartTheme = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#191c1e',
  },
  grid: {
    vertLines: { color: 'rgba(108, 122, 115, 0.1)' },
    horzLines: { color: 'rgba(108, 122, 115, 0.1)' },
  },
  rightPriceScale: {
    borderColor: 'rgba(108, 122, 115, 0.2)',
  },
  timeScale: {
    borderColor: 'rgba(108, 122, 115, 0.2)',
  },
  crosshair: {
    mode: 0,
  },
};

export const candleTheme = {
  upColor: '#01bc8d',
  downColor: '#ba1a1a',
  borderVisible: false,
  wickUpColor: '#01bc8d',
  wickDownColor: '#ba1a1a',
};

export const lineTheme = {
  color: '#006c4f',
  lineWidth: 2,
};

export const volumeTheme = {
  priceFormat: {
    type: 'volume',
  },
  priceScaleId: '',
};
