// CAROLINE — addForm.js
// Wires the Add-expense form: defaults the date field to today,
// validates inputs (amount must be > 0, with inline error messaging),
// calls storage.addExpense on submit, and delegates list rendering
// (with per-row delete buttons) to src/expenseList.js.

import { addExpense, CATEGORIES } from './storage.js';
import { renderExpenseList } from './expenseList.js';

const form = document.getElementById('expense-form');
const amountInput = document.getElementById('expense-amount');
const categorySelect = document.getElementById('expense-category');
const dateInput = document.getElementById('expense-date');
const noteInput = document.getElementById('expense-note');
const amountError = document.getElementById('expense-amount-error');
const categoryError = document.getElementById('expense-category-error');
const dateError = document.getElementById('expense-date-error');

const AMOUNT_REQUIRED_MSG = 'Enter an amount greater than 0.';

function clearErrors() {
  if (amountError) amountError.textContent = '';
  if (categoryError) categoryError.textContent = '';
  if (dateError) dateError.textContent = '';
  if (amountInput) amountInput.setAttribute('aria-invalid', 'false');
}

/**
 * Default the date field to today (local time, YYYY-MM-DD) if empty.
 */
function setDefaultDate() {
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Validate raw form values. Returns a map of field -> error message
 * (empty object means valid).
 * Amount validation: must be a finite number strictly greater than 0.
 * Empty string, non-numeric, zero, and negative values are all rejected
 * with the same clear inline message.
 */
function validate({ amount, category, date }) {
  const errors = {};

  const trimmedAmount = typeof amount === 'string' ? amount.trim() : amount;
  const numericAmount = Number(trimmedAmount);

  const isEmpty = trimmedAmount === '' || trimmedAmount === null || trimmedAmount === undefined;
  const isInvalidNumber = !Number.isFinite(numericAmount);
  const isNotPositive = !isInvalidNumber && numericAmount <= 0;

  if (isEmpty || isInvalidNumber || isNotPositive) {
    errors.amount = AMOUNT_REQUIRED_MSG;
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = 'Select a valid category.';
  }

  if (!date) {
    errors.date = 'Date is required.';
  }

  return errors;
}

function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const amount = amountInput ? amountInput.value : '';
  const category = categorySelect ? categorySelect.value : '';
  const date = dateInput ? dateInput.value : '';
  const note = noteInput ? noteInput.value : '';

  const errors = validate({ amount, category, date });

  if (Object.keys(errors).length > 0) {
    if (errors.amount && amountError) {
      amountError.textContent = errors.amount;
      if (amountInput) amountInput.setAttribute('aria-invalid', 'true');
    }
    if (errors.category && categoryError) categoryError.textContent = errors.category;
    if (errors.date && dateError) dateError.textContent = errors.date;
    return;
  }

  try {
    addExpense({ amount, category, date, note });
  } catch (err) {
    if (amountError) {
      amountError.textContent = err.message || AMOUNT_REQUIRED_MSG;
      if (amountInput) amountInput.setAttribute('aria-invalid', 'true');
    }
    return;
  }

  renderExpenseList();
  form.reset();
  setDefaultDate();
  if (categorySelect) categorySelect.value = category;
}

/**
 * Initialize the Add-expense form: default date, initial list render,
 * and submit wiring. Safe to call once on module load.
 */
export function initAddForm() {
  setDefaultDate();
  renderExpenseList();

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Clear the amount error as soon as the user starts fixing it.
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      if (amountError && amountError.textContent) {
        const numericAmount = Number(amountInput.value.trim());
        if (Number.isFinite(numericAmount) && numericAmount > 0) {
          amountError.textContent = '';
          amountInput.setAttribute('aria-invalid', 'false');
        }
      }
    });
  }
}

initAddForm();
