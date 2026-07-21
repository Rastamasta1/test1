// CAROLINE — summary.js
// Pure data module: computes per-category totals and grand total for a
// given month from expense data in storage. No DOM access here.
//
// Currency: configurable via CURRENCY_SYMBOL (operator guidance: keep a
// simple configurable currency symbol constant rather than hardcoding
// 'USD'/'$' inline throughout the UI).
//
// Month selection: available months are derived dynamically from the
// dates present in stored expenses, plus the current month, so the
// month selector always has a sensible range even with sparse data
// (operator guidance).

import { loadExpenses, clearExpenses, CATEGORIES } from './storage.js';

/** Configurable currency symbol used for display formatting. */
export const CURRENCY_SYMBOL = '$';

/**
 * Format a numeric amount using the configured currency symbol,
 * e.g. formatCurrency(12.5) -> "$12.50".
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const safe = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return `${CURRENCY_SYMBOL}${safe.toFixed(2)}`;
}

/**
 * Extract a 'YYYY-MM' month key from an ISO-ish date string
 * (expects expense.date to be 'YYYY-MM-DD', as produced by the
 * Add form's date input).
 * @param {string} dateStr
 * @returns {string} e.g. '2024-03', or '' if invalid input
 */
export function getMonthKey(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.length < 7) return '';
  return dateStr.slice(0, 7);
}

/**
 * Get the 'YYYY-MM' key for a given date (defaults to now).
 * @param {Date} [referenceDate]
 * @returns {string}
 */
export function getCurrentMonthKey(referenceDate = new Date()) {
  const yyyy = referenceDate.getFullYear();
  const mm = String(referenceDate.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

/**
 * Derive the list of selectable months: every month that has at least
 * one expense, plus the current month, deduplicated and sorted with
 * the most recent month first.
 * @param {Array<object>} [expenses] - defaults to loading from storage
 * @returns {string[]} array of 'YYYY-MM' keys, descending (newest first)
 */
export function getAvailableMonths(expenses = loadExpenses()) {
  const months = new Set();
  months.add(getCurrentMonthKey());

  expenses.forEach((exp) => {
    const key = getMonthKey(exp && exp.date);
    if (key) months.add(key);
  });

  return Array.from(months).sort().reverse();
}

/**
 * Filter an expenses array down to only those falling within the
 * given month key.
 * @param {Array<object>} expenses
 * @param {string} monthKey - 'YYYY-MM'
 * @returns {Array<object>}
 */
export function filterExpensesByMonth(expenses, monthKey) {
  if (!Array.isArray(expenses)) return [];
  return expenses.filter((exp) => getMonthKey(exp && exp.date) === monthKey);
}

/**
 * Compute the total amount per category for a given month.
 * Every known category is present in the result (defaulting to 0),
 * so the UI can render a bar for every category even when the total
 * is zero. Any expense with an unrecognized category is bucketed
 * under 'other' defensively.
 *
 * @param {Array<object>} expenses
 * @param {string} monthKey - 'YYYY-MM'
 * @returns {Object<string, number>} e.g. { food: 42.5, transport: 0, ... }
 */
export function computeCategoryTotals(expenses, monthKey) {
  const totals = {};
  CATEGORIES.forEach((cat) => {
    totals[cat] = 0;
  });

  filterExpensesByMonth(expenses, monthKey).forEach((exp) => {
    const cat = CATEGORIES.includes(exp.category) ? exp.category : 'other';
    const amount = Number(exp.amount) || 0;
    totals[cat] = Math.round((totals[cat] + amount) * 100) / 100;
  });

  return totals;
}

/**
 * Sum a category-totals map into a single grand total.
 * @param {Object<string, number>} categoryTotals
 * @returns {number}
 */
export function computeGrandTotal(categoryTotals) {
  const sum = Object.values(categoryTotals || {}).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0
  );
  return Math.round(sum * 100) / 100;
}

/**
 * Convenience aggregate: compute the full monthly summary (per-category
 * totals + grand total) for a given month, reading live data from
 * storage by default. Pure with respect to its inputs when an explicit
 * expenses array is passed (useful for testing).
 *
 * @param {string} [monthKey] - defaults to the current month
 * @param {Array<object>} [expenses] - defaults to loading from storage
 * @returns {{monthKey:string, categoryTotals:Object<string,number>, grandTotal:number}}
 */
export function getMonthlySummary(monthKey = getCurrentMonthKey(), expenses = loadExpenses()) {
  const categoryTotals = computeCategoryTotals(expenses, monthKey);
  const grandTotal = computeGrandTotal(categoryTotals);
  return { monthKey, categoryTotals, grandTotal };
}

/**
 * Clear all stored expenses. Pure delegation to storage.js's
 * clearExpenses — no DOM access, no confirm() here; the confirm
 * dialog and any re-rendering are the caller's (UI layer's)
 * responsibility, per the project's separation of pure logic from
 * DOM rendering.
 * @returns {Array<object>} empty array (already persisted)
 */
export function clearAllData() {
  return clearExpenses();
}
