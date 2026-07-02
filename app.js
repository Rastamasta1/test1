// Main UI controller for the Finance Tracker.
// Wires month selector, transaction form (add/edit/delete), category filter,
// dashboard summary, category bars, and the grouped transactions list.
import { initMonthSelector } from './monthSelector.js';
import {
  CATEGORIES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  getCategoryColor,
  getCategoryLabel,
  getCategoryIcon
} from './categories.js';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthData
} from './transactionsService.js';
import { todayISO, groupByDate } from './dateUtils.js';

// ---- Element references ----
const form = document.getElementById('transaction-form');
const txId = document.getElementById('tx-id');
const txAmount = document.getElementById('tx-amount');
const txCategory = document.getElementById('tx-category');
const txDate = document.getElementById('tx-date');
const txNote = document.getElementById('tx-note');
const submitBtn = document.getElementById('submit-btn');
const cancelEdit = document.getElementById('cancel-edit');
const categoryFilter = document.getElementById('category-filter');

const balanceValue = document.getElementById('balance-value');
const incomeValue = document.getElementById('income-value');
const expenseValue = document.getElementById('expense-value');
const categoryBars = document.getElementById('category-bars');
const transactionsList = document.getElementById('transactions-list');
const emptyState = document.getElementById('empty-state');

// ---- State ----
let currentMonthSel = null;
let activeFilter = '';
let editingId = null;

// ---- Formatting ----
const fmtMoney = (n) =>
  '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---- Category dropdown population ----
function selectedType() {
  const checked = form.querySelector('input[name="type"]:checked');
  return checked ? checked.value : 'expense';
}

function populateCategorySelect() {
  const list = selectedType() === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const prev = txCategory.value;
  txCategory.innerHTML = '';
  for (const cat of list) {
    const opt = document.createElement('option');
    opt.value = cat.key;
    opt.textContent = `${cat.icon} ${cat.label}`;
    txCategory.appendChild(opt);
  }
  if (list.some((c) => c.key === prev)) txCategory.value = prev;
}

function populateFilter() {
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  for (const cat of CATEGORIES) {
    const opt = document.createElement('option');
    opt.value = cat.key;
    opt.textContent = `${cat.icon} ${cat.label}`;
    categoryFilter.appendChild(opt);
  }
}

// ---- Dashboard summary render ----
function renderSummary(summary) {
  balanceValue.textContent = fmtMoney(summary.balance);
  incomeValue.textContent = fmtMoney(summary.income);
  expenseValue.textContent = fmtMoney(summary.expense);
}

// ---- Category bars (expenses only) ----
function renderCategoryBars(transactions) {
  const totals = {};
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount || 0);
  }
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  categoryBars.innerHTML = '';
  if (entries.length === 0) {
    const p = document.createElement('p');
    p.className = 'cat-empty';
    p.textContent = 'No expenses to show.';
    categoryBars.appendChild(p);
    return;
  }
  const max = Math.max(...entries.map((e) => e[1]));
  for (const [key, amt] of entries) {
    const row = document.createElement('div');
    row.className = 'cat-bar-row';
    const pct = max > 0 ? Math.round((amt / max) * 100) : 0;
    row.innerHTML = `
      <div class="cat-bar-head">
        <span class="cat-bar-name">${getCategoryIcon(key)} ${getCategoryLabel(key)}</span>
        <span class="cat-bar-amount">${fmtMoney(amt)}</span>
      </div>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${pct}%;background:${getCategoryColor(key)}"></div>
      </div>`;
    categoryBars.appendChild(row);
  }
}

// ---- Transactions list ----
function renderList(transactions) {
  transactionsList.innerHTML = '';
  if (!transactions.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  const groups = groupByDate(transactions);
  for (const group of groups) {
    const wrap = document.createElement('div');
    wrap.className = 'tx-group';
    const label = document.createElement('div');
    label.className = 'tx-group-label';
    label.textContent = group.label;
    wrap.appendChild(label);
    const items = document.createElement('div');
    items.className = 'tx-items';
    for (const tx of group.items) {
      const item = document.createElement('div');
      item.className = 'tx-item';
      const sign = tx.type === 'income' ? '+' : '-';
      item.innerHTML = `
        <div class="tx-icon" style="background:${getCategoryColor(tx.category)}22;color:${getCategoryColor(tx.category)}">${getCategoryIcon(tx.category)}</div>
        <div class="tx-body">
          <div class="tx-cat">${getCategoryLabel(tx.category)}</div>
          ${tx.note ? `<div class="tx-note">${escapeHtml(tx.note)}</div>` : ''}
        </div>
        <div class="tx-amount ${tx.type}">${sign}${fmtMoney(tx.amount)}</div>
        <div class="tx-actions">
          <button class="tx-action-btn edit" title="Edit" data-edit="${tx.id}">✎</button>
          <button class="tx-action-btn delete" title="Delete" data-delete="${tx.id}">🗑</button>
        </div>`;
      item.querySelector('[data-edit]').addEventListener('click', () => startEdit(tx));
      item.querySelector('[data-delete]').addEventListener('click', () => handleDelete(tx.id));
      items.appendChild(item);
    }
    wrap.appendChild(items);
    transactionsList.appendChild(wrap);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---- Data load & render ----
async function refresh() {
  try {
    const { transactions, summary } = await getMonthData({
      month: currentMonthSel,
      category: activeFilter || null
    });
    // Summary + bars computed from filtered set for the selected month.
    renderSummary(summary);
    renderCategoryBars(transactions);
    renderList(transactions);
  } catch (err) {
    console.error('Failed to load month data:', err);
  }
}

// ---- Edit / cancel ----
function startEdit(tx) {
  editingId = tx.id;
  txId.value = tx.id;
  const typeInput = form.querySelector(`input[name="type"][value="${tx.type}"]`);
  if (typeInput) typeInput.checked = true;
  populateCategorySelect();
  txAmount.value = tx.amount;
  txCategory.value = tx.category;
  txDate.value = tx.date;
  txNote.value = tx.note || '';
  submitBtn.textContent = 'Save';
  cancelEdit.hidden = false;
  txAmount.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  txId.value = '';
  const expense = form.querySelector('input[name="type"][value="expense"]');
  if (expense) expense.checked = true;
  populateCategorySelect();
  txDate.value = todayISO();
  submitBtn.textContent = 'Add';
  cancelEdit.hidden = true;
}

// ---- Submit ----
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    type: selectedType(),
    amount: parseFloat(txAmount.value),
    category: txCategory.value,
    date: txDate.value,
    note: txNote.value.trim()
  };
  if (!(payload.amount >= 0) || !payload.category || !payload.date) return;
  try {
    submitBtn.disabled = true;
    if (editingId) {
      await updateTransaction(editingId, payload);
    } else {
      await addTransaction(payload);
    }
    resetForm();
    await refresh();
  } catch (err) {
    console.error('Save failed:', err);
  } finally {
    submitBtn.disabled = false;
  }
});

cancelEdit.addEventListener('click', () => resetForm());

async function handleDelete(id) {
  if (!confirm('Delete this transaction?')) return;
  try {
    await deleteTransaction(id);
    if (editingId === id) resetForm();
    await refresh();
  } catch (err) {
    console.error('Delete failed:', err);
  }
}

// Re-populate category dropdown when the type toggle changes.
form.querySelectorAll('input[name="type"]').forEach((r) =>
  r.addEventListener('change', populateCategorySelect)
);

categoryFilter.addEventListener('change', () => {
  activeFilter = categoryFilter.value;
  refresh();
});

// ---- Init ----
const controller = initMonthSelector({
  onChange: (month) => {
    currentMonthSel = month;
    refresh();
  }
});
currentMonthSel = controller.getMonth();

populateFilter();
resetForm();
refresh();
