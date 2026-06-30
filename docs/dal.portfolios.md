# Data Access Layer: Portfolios & Holdings

Modules: `src/db/portfolios.js`, `src/db/holdings.js`, exported via `src/db/index.js`.

## Usage

```js
const { createDal } = require('./src/db');

// accessToken is the user's Supabase JWT — operations run under their RLS.
const dal = createDal(accessToken);

const portfolios = await dal.portfolios.list();
const p = await dal.portfolios.create({ userId, name: 'Growth' });
const holdings = await dal.holdings.listByPortfolio(p.id);
await dal.holdings.upsert({ portfolioId: p.id, assetId, quantity: 10, avgCost: 150.25 });
```

## Portfolios API
| Method | Description |
|---|---|
| `list({ includeArchived })` | List portfolios (active by default) |
| `getById(id)` | Fetch one portfolio |
| `create({ userId, name, description?, baseCurrency? })` | Create portfolio |
| `update(id, patch)` | Update name/description/baseCurrency/isArchived |
| `archive(id)` | Soft-archive a portfolio |
| `remove(id)` | Hard delete (cascades holdings/transactions) |

## Holdings API
| Method | Description |
|---|---|
| `listByPortfolio(portfolioId)` | List holdings with joined asset data |
| `getById(id)` | Fetch one holding with asset |
| `findByAsset(portfolioId, assetId)` | Find existing holding for a pair |
| `upsert({ portfolioId, assetId, quantity, avgCost })` | Insert or update on the unique pair |
| `update(id, { quantity?, avgCost? })` | Update position |
| `remove(id)` | Delete holding |

## Security
All queries run against Supabase with the user's JWT, so the RLS policies defined in `0001_portfolio_assets_schema.sql` enforce ownership automatically. The service-role client (`createServiceClient`) bypasses RLS and should only be used in trusted server-side jobs.
