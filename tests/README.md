# RYEX Test Suite

## Overview

Comprehensive test coverage for RYEX crypto exchange platform.

## Test Structure

### `/e2e` - End-to-End Tests
Full user flow testing using Playwright (to be configured).

**Coverage:**
- Auth flows (signup, login, verify)
- Market data viewing
- Trading flows (future)
- Wallet operations (future)

**Run:**
```bash
npm run test:e2e
```

**TODO:** Install Playwright
```bash
npm install -D @playwright/test
```

### `/integration` - Integration Tests
API and service integration testing.

**Coverage:**
- API endpoints (status, response shape, error codes)
- Database operations
- External service integrations

**Run:**
```bash
npm run test:integration
```

### `/fixtures` - Test Data
Mock data and fixtures for tests.

**Files:**
- `mock-data.js` - Common test data (users, tickers, tokens)

## Test Strategy

### Priority Levels

**P0 - Critical (Must Test):**
- Auth flows (signup, login, verify, logout)
- Market data fetching
- Order placement (future)
- Deposit/withdrawal (future)

**P1 - High (Should Test):**
- Profile management
- Error handling
- Cache behavior
- Rate limiting

**P2 - Medium (Nice to Test):**
- UI components
- Formatting utilities
- Non-critical features

### Test Pyramid

```
      /\
     /  \    E2E Tests (10%)
    /____\   - Full user flows
   /      \  Integration Tests (30%)
  /________\ - API + DB + Services
 /          \ Unit Tests (60%)
/__________  - Functions + Components
```

## Writing Tests

### E2E Test Example
```javascript
test('should complete signup flow', async ({ page }) => {
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/auth/verify-sent');
});
```

### Integration Test Example
```javascript
test('GET /api/v1/market/tickers returns data', async () => {
  const response = await fetch('http://localhost:3000/api/v1/market/tickers');
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('fetchedAt');
});
```

### Using Fixtures
```javascript
import { mockUser, mockMarketTickers } from '../fixtures/mock-data';

test('should display user profile', async () => {
  // Use mockUser in test
});
```

## QA Integration

Tests follow QA skill guidelines:

- **Contract-first verification**: status + response shape + error.code
- **Risk-first approach**: Critical paths tested first
- **Evidence-based**: Clear PASS/FAIL/BLOCKED classification

See: `.claude/skills/skill_qa.md`

## Running Tests

### All Tests
```bash
npm test
```

### E2E Only
```bash
npm run test:e2e
```

### Integration Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm test -- --watch
```

## CI/CD Integration

Tests should run on:
- ✅ Every PR
- ✅ Before deployment
- ✅ Nightly regression suite

**TODO:** Configure GitHub Actions workflow

## Test Coverage Goals

- **Auth**: 90%+ coverage
- **Trading**: 95%+ coverage (when implemented)
- **Wallet**: 95%+ coverage (when implemented)
- **Market**: 80%+ coverage
- **Overall**: 85%+ coverage

## Debugging Tests

### Enable Debug Mode
```bash
DEBUG=true npm test
```

### Run Single Test
```bash
npm test -- auth.spec.js
```

### Playwright UI Mode
```bash
npx playwright test --ui
```

## Next Steps

- [ ] Install and configure Playwright
- [ ] Add Jest for unit/integration tests
- [ ] Configure test coverage reporting
- [ ] Set up CI/CD test pipeline
- [ ] Add visual regression tests
- [ ] Add performance tests

## References

- [Playwright Docs](https://playwright.dev/)
- [Jest Docs](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
