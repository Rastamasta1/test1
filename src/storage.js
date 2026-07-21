// CAROLINE — storage.js
// Pure data-layer module: localStorage persistence for expenses.
// No DOM access here — only load/save/add/delete logic.

export const STORAGE_KEY = 'expenses';

export const CATEGORIES = ['food', 'transport', 'home', 'fun', 'other'];

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Load all expenses from localStorage.
 * @returns {Array<{id:string, amount:number, category:string, date:string, note:string}>}
 */
export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('CAROLINE: failed to load expenses from localStorage', err);
    return [];
  }
}

/**
 * Persist the full expenses array to localStorage.
 * @param {Array<object>} expenses
 */
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('CAROLINE: failed to save expenses to localStorage', err);
  }
}

/**
 * Validate and add a new expense. Returns the updated list.
 * Throws an Error with a human-readable message if validation fails
 * (caller / UI is responsible for catching and displaying inline errors).
 *
 * @param {{amount:number|string, category:string, date:string, note?:string}} input
 * @returns {Array<object>} updated expenses array (already persisted)
 */
export function addExpense(input) {
  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a number greater than 0.');
  }

  if (!CATEGORIES.includes(input.category)) {
    throw new Error('Category must be one of: ' + CATEGORIES.join(', '));
  }

  if (!input.date) {
    throw new Error('Date is required.');
  }

  const expense = {
    id: generateId(),
    amount: Math.round(amount * 100) / 100,
    category: input.category,
    date: input.date,
    note: input.note ? String(input.note).trim() : ''
  };

  const expenses = loadExpenses();
  expenses.push(expense);
  saveExpenses(expenses);
  return expenses;
}

/**
 * Delete an expense by id. Returns the updated list.
 * @param {string} id
 * @returns {Array<object>} updated expenses array (already persisted)
 */
export function deleteExpense(id) {
  const expenses = loadExpenses().filter((exp) => exp.id !== id);
  saveExpenses(expenses);
  return expenses;
}

/**
 * Replace the entire expenses list (used for seeding sample data
 * or importing) and persist it.
 * @param {Array<object>} expenses
 * @returns {Array<object>}
 */
export function setExpenses(expenses) {
  const safe = Array.isArray(expenses) ? expenses : [];
  saveExpenses(safe);
  return safe;
}

/**
 * Remove all stored expenses.
 * @returns {Array<object>} empty array
 */
export function clearExpenses() {
  saveExpenses([]);
  return [];
}
