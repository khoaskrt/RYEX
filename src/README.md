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
