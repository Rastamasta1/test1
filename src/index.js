// Import necessary modules
const express = require('express');
const routes = require('./api/routes');
const config = require('../config.json');

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use API routes
app.use('/api', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${config.loggingLevel} mode.`);
});
