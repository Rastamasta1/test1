// Transactions data service — all CRUD against the Supabase `transactions` table.
// Import the SINGLE shared client. Never call createClient here.
import { supabase } from './supabaseClient.js';

// Column names must match schema.sql exactly:
// id, type, amount, category, date, note, created_at

// Returns [firstDay, firstDayNextMonth) date strings (YYYY-MM-DD) for a given month.
// month param is 'YYYY-MM' (e.g. '2025-01').
function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

// List transactions, optionally filtered by month ('YYYY-MM') and category key.
// Ordered by date desc, then created_at desc (newest first).
export async function listTransactions({ month = null, category = null } = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (month) {
    const { start, end } = monthRange(month);
    query = query.gte('date', start).lt('date', end);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Insert a new transaction. Returns the created row.
export async function addTransaction({ type, amount, category, date, note = '' }) {
  const payload = {
    type,
    amount: Number(amount),
    category,
    date,
    note: note || ''
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update an existing transaction by id. `fields` is a partial object.
// Returns the updated row.
export async function updateTransaction(id, fields) {
  const payload = { ...fields };
  if (payload.amount != null) payload.amount = Number(payload.amount);

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a transaction by id.
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Compute dashboard summary for a set of transactions.
// Returns { income, expense, balance, byCategory: { [key]: total } }.
export function summarize(transactions = []) {
  let income = 0;
  let expense = 0;
  const byCategory = {};

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      income += amt;
    } else {
      expense += amt;
    }
    byCategory[tx.category] = (byCategory[tx.category] || 0) + amt;
  }

  return {
    income,
    expense,
    balance: income - expense,
    byCategory
  };
}

// Convenience: fetch transactions for a month and return them plus a summary.
export async function getMonthData({ month, category = null } = {}) {
  const transactions = await listTransactions({ month, category });
  const summary = summarize(transactions);
  return { transactions, summary };
}
