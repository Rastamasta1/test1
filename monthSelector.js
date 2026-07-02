// Month selector component for the finance tracker.
// Populates the #month-select dropdown, wires prev/next buttons, and
// notifies a callback whenever the selected month changes.
// Uses the shared dateUtils helpers so month formatting stays consistent.
import {
  currentMonth,
  formatMonthLabel,
  monthOptions,
  prevMonth,
  nextMonth,
  addMonths
} from './dateUtils.js';

// initMonthSelector({ onChange, initial, count })
// - onChange(month): called with 'YYYY-MM' whenever the selection changes.
// - initial: starting month ('YYYY-MM'), defaults to currentMonth().
// - count: how many months back to list, defaults to 12.
// Returns a small controller: { getMonth, setMonth, refresh }.
export function initMonthSelector({ onChange = () => {}, initial = currentMonth(), count = 12 } = {}) {
  const select = document.getElementById('month-select');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  if (!select || !prevBtn || !nextBtn) {
    throw new Error('monthSelector: required elements (month-select, prev-month, next-month) not found');
  }

  let current = initial;

  // Build the option list. If `current` is outside the default range
  // (e.g. selected an older month manually), ensure it is present.
  function buildOptions() {
    const opts = monthOptions(count);
    if (!opts.some(o => o.value === current)) {
      opts.push({ value: current, label: formatMonthLabel(current) });
      // keep newest-first ordering
      opts.sort((a, b) => (a.value < b.value ? 1 : a.value > b.value ? -1 : 0));
    }
    select.innerHTML = '';
    for (const opt of opts) {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.label;
      select.appendChild(el);
    }
    select.value = current;
  }

  // Disable the next button when we're at the current (latest) month —
  // no future months to browse.
  function updateNavState() {
    nextBtn.disabled = current >= currentMonth();
  }

  function setMonth(month, notify = true) {
    if (!month || month === current && select.value === month) {
      // still refresh nav state in case of re-entry
    }
    current = month;
    buildOptions();
    updateNavState();
    if (notify) onChange(current);
  }

  function refresh() {
    buildOptions();
    updateNavState();
  }

  // Wire events.
  select.addEventListener('change', () => {
    setMonth(select.value);
  });

  prevBtn.addEventListener('click', () => {
    setMonth(prevMonth(current));
  });

  nextBtn.addEventListener('click', () => {
    if (current >= currentMonth()) return;
    setMonth(nextMonth(current));
  });

  // Initial render (do not double-fire onChange here; caller decides).
  buildOptions();
  updateNavState();

  return {
    getMonth: () => current,
    setMonth,
    refresh,
    // Convenience wrappers
    goPrev: () => setMonth(prevMonth(current)),
    goNext: () => { if (current < currentMonth()) setMonth(nextMonth(current)); },
    jump: (n) => setMonth(addMonths(current, n))
  };
}
