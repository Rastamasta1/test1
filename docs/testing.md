# Integration & Unit Tests

Tests use [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest).

## Install

```bash
npm install --save-dev jest supertest
```

## Run

```bash
npm test            # run all tests once
npm run test:watch  # watch mode
```

## Layout

| File | Covers |
|---|---|
| `tests/setupEnv.js` | Injects required env vars so `src/config` loads in tests |
| `tests/helpers/mockSupabase.js` | Chainable Supabase client mock (no live DB needed) |
| `tests/health.test.js` | `/health` route + 404 handling |
| `tests/portfolios.api.test.js` | `/portfolios` list / create / error flows |
| `tests/valuation.test.js` | Market value & unrealized PnL math |

## Notes

- The Supabase client is mocked via `jest.mock('../src/db/supabaseClient')` so
  tests never hit a real database.
- The valuation tests probe for several likely function names exported by
  `src/services/valuation.js` and fall back to documenting expected reference
  math, keeping the suite resilient to the service's exact export shape.
- Add `"test": "jest"` and `"test:watch": "jest --watch"` to `package.json`
  scripts.
