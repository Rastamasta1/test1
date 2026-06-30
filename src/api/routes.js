// Import necessary modules and services
const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');

// Endpoint to get portfolio data
router.get('/portfolio', async (req, res) => {
  try {
    const portfolioData = await portfolioService.getPortfolio();
    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Endpoint to update portfolio data
router.put('/portfolio', async (req, res) => {
  try {
    const updatedPortfolio = await portfolioService.updatePortfolio(req.body);
    res.json(updatedPortfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update portfolio data' });
  }
});

module.exports = router;