const { createDal } = require('../db');

/**
 * Portfolio valuation & PnL service.
 *
 * Prices are supplied by the caller as a map keyed by asset_id:
 *   { [assetId]: { price: number, currency: 'USD' } }
 * (Price fetching is handled by a separate market-data module.)
 */

function toNumber(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function round(n, dp = 2) {
  const f = Math.pow(10, dp);
  return Math.round((n + Number.EPSILON) * f) / f;
}

/**
 * Value a single holding given a current unit price.
 * @returns {{quantity:number, avgCost:number, price:number, costBasis:number, marketValue:number, unrealizedPnl:number, unrealizedPnlPct:number}}
 */
function valueHolding(holding, price) {
  const quantity = toNumber(holding.quantity);
  const avgCost = toNumber(holding.avg_cost);
  const unitPrice = toNumber(price);

  const costBasis = quantity * avgCost;
  const marketValue = quantity * unitPrice;
  const unrealizedPnl = marketValue - costBasis;
  const unrealizedPnlPct = costBasis !== 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    quantity,
    avgCost: round(avgCost, 8),
    price: round(unitPrice, 8),
    costBasis: round(costBasis),
    marketValue: round(marketValue),
    unrealizedPnl: round(unrealizedPnl),
    unrealizedPnlPct: round(unrealizedPnlPct, 4),
  };
}

/**
 * Compute a full valuation for a portfolio's holdings.
 * @param {Array} holdings - holding rows (must include id, asset_id, quantity, avg_cost)
 * @param {Object} priceMap - { [assetId]: { price, currency } }
 * @returns {{positions:Array, totals:Object}}
 */
function valuePortfolio(holdings, priceMap = {}) {
  const positions = (holdings || []).map((h) => {
    const entry = priceMap[h.asset_id] || {};
    const valued = valueHolding(h, entry.price);
    return {
      holdingId: h.id,
      assetId: h.asset_id,
      symbol: h.symbol || (h.asset && h.asset.symbol) || null,
      ...valued,
      hasPrice: entry.price != null,
    };
  });

  const totals = positions.reduce(
    (acc, p) => {
      acc.costBasis += p.costBasis;
      acc.marketValue += p.marketValue;
      acc.unrealizedPnl += p.unrealizedPnl;
      return acc;
    },
    { costBasis: 0, marketValue: 0, unrealizedPnl: 0 }
  );

  totals.costBasis = round(totals.costBasis);
  totals.marketValue = round(totals.marketValue);
  totals.unrealizedPnl = round(totals.unrealizedPnl);
  totals.unrealizedPnlPct = totals.costBasis !== 0
    ? round((totals.unrealizedPnl / totals.costBasis) * 100, 4)
    : 0;
  totals.positionCount = positions.length;
  totals.pricedCount = positions.filter((p) => p.hasPrice).length;

  return { positions, totals };
}

/**
 * Load holdings for a portfolio (scoped to the user's token) and value them.
 * @param {string} accessToken - user access token
 * @param {string} portfolioId
 * @param {Object} priceMap - { [assetId]: { price, currency } }
 */
async function valuePortfolioById(accessToken, portfolioId, priceMap = {}) {
  const dal = createDal(accessToken);
  const holdings = await dal.holdings.listByPortfolio(portfolioId);
  const valuation = valuePortfolio(holdings, priceMap);
  return { portfolioId, ...valuation };
}

module.exports = {
  valueHolding,
  valuePortfolio,
  valuePortfolioById,
};
