const { createUserClient } = require('./supabaseClient');

/**
 * Data access layer for the `holdings` table.
 * Holdings are unique per (portfolio_id, asset_id).
 */
function holdingsRepo(accessToken) {
  const db = createUserClient(accessToken);
  const TABLE = 'holdings';

  async function listByPortfolio(portfolioId) {
    const { data, error } = await db
      .from(TABLE)
      .select('*, asset:assets(*)')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async function getById(id) {
    const { data, error } = await db
      .from(TABLE)
      .select('*, asset:assets(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function findByAsset(portfolioId, assetId) {
    const { data, error } = await db
      .from(TABLE)
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('asset_id', assetId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /**
   * Insert or update a holding for a portfolio/asset pair.
   */
  async function upsert({ portfolioId, assetId, quantity, avgCost }) {
    const { data, error } = await db
      .from(TABLE)
      .upsert(
        {
          portfolio_id: portfolioId,
          asset_id: assetId,
          quantity,
          avg_cost: avgCost,
        },
        { onConflict: 'portfolio_id,asset_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function update(id, patch) {
    const allowed = {};
    if (patch.quantity !== undefined) allowed.quantity = patch.quantity;
    if (patch.avgCost !== undefined) allowed.avg_cost = patch.avgCost;
    const { data, error } = await db.from(TABLE).update(allowed).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function remove(id) {
    const { error } = await db.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  return { listByPortfolio, getById, findByAsset, upsert, update, remove };
}

module.exports = { holdingsRepo };
