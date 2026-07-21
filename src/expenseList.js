// CAROLINE — expenseList.js
// Renders the expense list (#expense-list) with per-row delete buttons.
// Delete buttons call storage.deleteExpense and trigger a re-render.
// Pure UI-rendering module: reads from storage, writes to the DOM only.

import { loadExpenses, deleteExpense } from './storage.js';

const expenseList = document.getElementById('expense-list');

const CATEGORY_LABELS = {
  food: 'Food',
  transport: 'Transport',
  home: 'Home',
  fun: 'Fun',
  other: 'Other'
};

/**
 * Format a numeric amount as USD with 2 decimals, e.g. "$12.50".
 * @param {number} amount
 * @returns {string}
 */
function formatUSD(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Render the current list of expenses (most recent date first) into
 * #expense-list, with a delete button per row that removes the
 * expense from storage and re-renders the list.
 */
export function renderExpenseList() {
  if (!expenseList) return;

  const expenses = loadExpenses()
    .slice()
    .sort((a, b) => {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });

  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'expense-empty';
    empty.textContent = 'No expenses yet. Add your first one above.';
    expenseList.appendChild(empty);
    return;
  }

  expenses.forEach((exp) => {
    const li = document.createElement('li');
    li.className = 'expense-row';
    li.dataset.id = exp.id;

    const info = document.createElement('div');
    info.className = 'expense-info';

    const primary = document.createElement('div');
    primary.className = 'expense-primary';
    primary.textContent = `${formatUSD(exp.amount)} — ${CATEGORY_LABELS[exp.category] || exp.category}`;

    const secondary = document.createElement('div');
    secondary.className = 'expense-secondary';
    secondary.textContent = exp.note ? `${exp.date} · ${exp.note}` : exp.date;

    info.appendChild(primary);
    info.appendChild(secondary);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', 'Delete expense');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      deleteExpense(exp.id);
      renderExpenseList();
    });

    li.appendChild(info);
    li.appendChild(deleteBtn);
    expenseList.appendChild(li);
  });
}
