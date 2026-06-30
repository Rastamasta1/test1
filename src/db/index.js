const { createUserClient, createServiceClient } = require('./supabaseClient');
const { portfoliosRepo } = require('./portfolios');
const { holdingsRepo } = require('./holdings');

/**
 * Build a data access layer bound to a user's access token.
 */
function createDal(accessToken) {
  return {
    portfolios: portfoliosRepo(accessToken),
    holdings: holdingsRepo(accessToken),
  };
}

module.exports = { createDal, createUserClient, createServiceClient };
