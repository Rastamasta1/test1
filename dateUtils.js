// Date & month utility helpers for the finance tracker.
// Month strings are 'YYYY-MM'. Date strings are 'YYYY-MM-DD' (ISO date, matches schema `date`).

// Zero-pad a number to 2 digits.
function pad2(n) {
  return String(n).padStart(2, '0');
}

// Current month as 'YYYY-MM' (local time).
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

// Today's date as 'YYYY-MM-DD' (local time) — handy default for the date input.
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

// Human-friendly month label, e.g. '2025-01' -> 'January 2025'.
export function formatMonthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Human-friendly date label, e.g. '2025-01-15' -> 'Wed, Jan 15, 2025'.
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

// Add `n` months to a 'YYYY-MM' string (n may be negative). Returns 'YYYY-MM'.
export function addMonths(month, n) {
  const [y, m] = month.split('-').map(Number);
  const total = (y * 12 + (m - 1)) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12 + 12) % 12;
  return `${ny}-${pad2(nm + 1)}`;
}

// Previous / next month convenience wrappers.
export function prevMonth(month) {
  return addMonths(month, -1);
}

export function nextMonth(month) {
  return addMonths(month, 1);
}

// Extract 'YYYY-MM' from a 'YYYY-MM-DD' date string.
export function monthOf(dateStr) {
  return dateStr.slice(0, 7);
}

// Build a list of month options (newest first) going back `count` months from the current month.
// Returns [{ value: 'YYYY-MM', label: 'January 2025' }, ...].
export function monthOptions(count = 12, from = currentMonth()) {
  const options = [];
  for (let i = 0; i < count; i++) {
    const value = addMonths(from, -i);
    options.push({ value, label: formatMonthLabel(value) });
  }
  return options;
}

// Group an array of transactions by their `date` field.
// Returns an array of { date, label, items } sorted newest date first,
// with items preserving the incoming order (service already sorts newest first).
export function groupByDate(transactions = []) {
  const map = new Map();
  for (const tx of transactions) {
    if (!map.has(tx.date)) map.set(tx.date, []);
    map.get(tx.date).push(tx);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .map(([date, items]) => ({ date, label: formatDate(date), items }));
}
