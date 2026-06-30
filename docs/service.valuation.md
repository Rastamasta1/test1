# Portfolio Valuation & PnL Service

Module: `src/services/valuation.js`
Track: DATA

Computes market value and unrealized profit/loss for portfolio holdings.

## Price input
Prices are passed in by the caller (fetched by a separate market-data module) as a map keyed by `asset_id`:

```js
const priceMap = {
  '<asset-uuid>': { price: 191.23, currency: 'USD' },
};
```

## API

### `valueHolding(holding, price)`
Values one holding. Returns:
| Field | Meaning |
|---|---|
| costBasis | quantity * avg_cost |
| marketValue | quantity * price |
| unrealizedPnl | marketValue - costBasis |
| unrealizedPnlPct | PnL as % of cost basis |

### `valuePortfolio(holdings, priceMap)`
Values an array of holdings, returns `{ positions, totals }`.
`totals` includes `costBasis`, `marketValue`, `unrealizedPnl`, `unrealizedPnlPct`, `positionCount`, `pricedCount`.

### `valuePortfolioById(accessToken, portfolioId, priceMap)`
Loads holdings via the DAL (`createDal` from `src/db`) under the user's token, then values them.

## Notes
- Numeric inputs from Postgres `numeric` columns arrive as strings; the service coerces them safely.
- Money values rounded to 2dp, prices/quantities preserved at higher precision.
- Multi-currency conversion is out of scope here; callers should pass prices already in the portfolio base currency or handle FX upstream.
