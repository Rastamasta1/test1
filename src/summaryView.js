// CAROLINE — summaryView.js
// DOM rendering for the Summary view: horizontal CSS bars per category
// with amounts, a grand total, a month selector, and a "Clear all
// data" action. Reads computed data from the pure src/summary.js
// module — no computation logic lives here, only DOM construction/
// updates and confirm-dialog wiring.

import {
  getAvailableMonths,
  getMonthlySummary,
  formatCurrency,
  getCurrentMonthKey,
  clearAllData
} from './summary.js';
import { CATEGORIES } from './storage.js';
import { renderExpenseList } from './expenseList.js';

const monthSelect = document.getElementById('summary-month-select');
const barsContainer = document.getElementById('summary-bars');
const grandTotalEl = document.getElementById('summary-grand-total');
const clearDataBtn = document.getElementById('summary-clear-btn');

const CATEGORY_LABELS = {
  food: 'Food',
  transport: 'Transport',
  home: 'Home',
  fun: 'Fun',
  other: 'Other'
};

/**
 * Format a 'YYYY-MM' key as a human-readable month/year label,
 * e.g. '2024-03' -> 'March 2024'.
 * @param {string} monthKey
 * @returns {string}
 */
function formatMonthLabel(monthKey) {
  const parts = String(monthKey).split('-');
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return monthKey;
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/**
 * (Re)populate the month <select> with the currently available months,
 * preserving/selecting the given month if present.
 * @param {string} selectedMonth
 */
function populateMonthOptions(selectedMonth) {
  if (!monthSelect) return;

  const months = getAvailableMonths();
  const previousValue = monthSelect.value;
  monthSelect.innerHTML = '';

  months.forEach((monthKey) => {
    const opt = document.createElement('option');
    opt.value = monthKey;
    opt.textContent = formatMonthLabel(monthKey);
    monthSelect.appendChild(opt);
  });

  const target = selectedMonth || previousValue || getCurrentMonthKey();
  if (months.includes(target)) {
    monthSelect.value = target;
  } else if (months.length > 0) {
    monthSelect.value = months[0];
  }
}

/**
 * Render the category bars + grand total for the given month.
 * Bar width is proportional to the largest category total for that
 * month (so the biggest category always fills 100%); with all-zero
 * data every bar renders at 0% width without division errors.
 * @param {string} [monthKey] - defaults to the current month
 */
export function renderSummaryView(monthKey = getCurrentMonthKey()) {
  if (!barsContainer || !grandTotalEl) return;

  populateMonthOptions(monthKey);
  const activeMonth = monthSelect ? monthSelect.value : monthKey;

  const { categoryTotals, grandTotal } = getMonthlySummary(activeMonth);
  const values = Object.values(categoryTotals);
  const maxValue = Math.max(0, ...values);

  barsContainer.innerHTML = '';

  CATEGORIES.forEach((cat) => {
    const amount = categoryTotals[cat] || 0;
    const pct = maxValue > 0 ? Math.round((amount / maxValue) * 100) : 0;

    const row = document.createElement('div');
    row.className = 'summary-bar-row';

    const label = document.createElement('div');
    label.className = 'summary-bar-label';
    label.textContent = CATEGORY_LABELS[cat] || cat;

    const track = document.createElement('div');
    track.className = 'summary-bar-track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${CATEGORY_LABELS[cat] || cat}: ${formatCurrency(amount)}`);

    const fill = document.createElement('div');
    fill.className = 'summary-bar-fill';
    fill.style.width = `${pct}%`;

    const amountEl = document.createElement('span');
    amountEl.className = 'summary-bar-amount';
    amountEl.textContent = formatCurrency(amount);

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(amountEl);
    barsContainer.appendChild(row);
  });

  grandTotalEl.textContent = formatCurrency(grandTotal);
}

/**
 * Handle a click on the "Clear all data" button: confirm with the
 * user, then (if confirmed) empty storage via the pure clearAllData()
 * helper in summary.js, and re-render BOTH views — the Summary view
 * (bars/total/month selector) and the Add view's expense list — so
 * the UI is consistent no matter which tab is currently visible.
 */
function handleClearData() {
  const confirmed = window.confirm(
    'Are you sure you want to clear all expense data? This cannot be undone.'
  );
  if (!confirmed) return;

  clearAllData();
  renderSummaryView(getCurrentMonthKey());
  renderExpenseList();
}

/**
 * Wire up the month selector's change handler, the Summary tab
 * button, and the "Clear all data" button so the view re-renders
 * with fresh data whenever it becomes visible or data changes.
 * Safe to call once on module load.
 */
export function initSummaryView() {
  renderSummaryView(getCurrentMonthKey());

  if (monthSelect) {
    monthSelect.addEventListener('change', () => {
      renderSummaryView(monthSelect.value);
    });
  }

  const tabSummaryBtn = document.getElementById('tab-summary');
  if (tabSummaryBtn) {
    tabSummaryBtn.addEventListener('click', () => {
      renderSummaryView(monthSelect ? monthSelect.value : getCurrentMonthKey());
    });
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', handleClearData);
  }
}

initSummaryView();
