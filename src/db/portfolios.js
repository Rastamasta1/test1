const { createUserClient } = require('./supabaseClient');

/**
 * Data access layer for the `portfolios` table.
 * Each function takes an accessToken so operations run under the user's RLS.
 */
function portfoliosRepo(accessToken) {
  const db = createUserClient(accessToken);
  const TABLE = 'portfolios';

  async function list({ includeArchived = false } = {}) {
    let query = db.from(TABLE).select('*').order('created_at', { ascending: false });
    if (!includeArchived) query = query.eq('is_archived', false);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async function getById(id) {
    const { data, error } = await db.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function create({ userId, name, description = null, baseCurrency = 'USD' }) {
    const { data, error } = await db
      .from(TABLE)
      .insert({ user_id: userId, name, description, base_currency: baseCurrency })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function update(id, patch) {
    const allowed = {};
    if (patch.name !== undefined) allowed.name = patch.name;
    if (patch.description !== undefined) allowed.description = patch.description;
    if (patch.baseCurrency !== undefined) allowed.base_currency = patch.baseCurrency;
    if (patch.isArchived !== undefined) allowed.is_archived = patch.isArchived;
    const { data, error } = await db.from(TABLE).update(allowed).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function archive(id) {
    return update(id, { isArchived: true });
  }

  async function remove(id) {
    const { error } = await db.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  return { list, getById, create, update, archive, remove };
}

module.exports = { portfoliosRepo };
