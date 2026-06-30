const express = require('express');
const portfoliosDb = require('../db/portfolios');
const holdingsDb = require('../db/holdings');
const valuation = require('../services/valuation');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// List portfolios for a user (user id via header for now)
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.header('x-user-id');
  if (!userId) {
    const err = new Error('Missing x-user-id header');
    err.status = 400;
    throw err;
  }
  const data = await portfoliosDb.listByUser(userId);
  res.json({ data });
}));

// Get a single portfolio
router.get('/:id', asyncHandler(async (req, res) => {
  const data = await portfoliosDb.getById(req.params.id);
  if (!data) {
    const err = new Error('Portfolio not found');
    err.status = 404;
    throw err;
  }
  res.json({ data });
}));

// Create a portfolio
router.post('/', asyncHandler(async (req, res) => {
  const data = await portfoliosDb.create(req.body);
  res.status(201).json({ data });
}));

// List holdings for a portfolio
router.get('/:id/holdings', asyncHandler(async (req, res) => {
  const data = await holdingsDb.listByPortfolio(req.params.id);
  res.json({ data });
}));

// Valuation / PnL for a portfolio
router.get('/:id/valuation', asyncHandler(async (req, res) => {
  const holdings = await holdingsDb.listByPortfolio(req.params.id);
  const result = valuation.computePortfolioValue
    ? valuation.computePortfolioValue(holdings, req.query.prices)
    : valuation(holdings);
  res.json({ data: result });
}));

module.exports = router;
