# Project Structure

- `app/`: Next.js routing layer (URL mapping, layouts, route groups)
  - `(marketing)/`: public marketing pages
  - `(webapp)/app/*`: authenticated exchange webapp routes under `/app`
- `features/`: domain modules (business logic and UI by domain)
  - `landing-page/`
  - `auth/`
  - `market/`
- `shared/`: cross-domain utilities, components, configs, and styles

## Routing Intent

- `/` -> landing page
- `/app` -> webapp dashboard shell
- `/app/auth/login` -> auth login module
- `/app/auth/signup` -> auth signup module
- `/app/market` -> market module

## Import Convention

- Use `@/*` alias for imports from `src/*` (configured in `jsconfig.json`)

## Market Realtime (MVP)

- `GET /api/v1/market/tickers` lấy dữ liệu Binance Spot qua backend proxy.
- UI `/app/market` refresh mặc định mỗi 10 giây.

Environment variables:

- `MARKET_SYMBOLS` (default: `BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT,ADAUSDT`)
- `MARKET_REFRESH_MS` (default: `10000`)
- `NEXT_PUBLIC_MARKET_REFRESH_MS` (optional override ở client)
- `BINANCE_MARKET_BASE_URL` (default: `https://data-api.binance.vision`)
- `COINGECKO_API_KEY` (optional: dùng để lấy `market cap` cho từng token)
- `COINGECKO_PRO_API_KEY` (optional: ưu tiên nếu dùng gói Pro của CoinGecko)
- `COINGECKO_BASE_URL` (default: `https://api.coingecko.com/api/v3`)
