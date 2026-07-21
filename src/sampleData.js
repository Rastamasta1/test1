// CAROLINE — sampleData.js
// Seeds a small set of sample expenses into localStorage on first load,
// so the Summary view has meaningful data to show out of the box.
// "First load" is detected via a dedicated 'seeded' flag key (separate
// from the expenses data itself), per operator guidance — this way
// legitimately-empty data (e.g. after the user deletes everything via
// "Clear all data") is never mistaken for "never seeded" and re-populated.

import { loadExpenses, setExpenses, CATEGORIES } from './storage.js';

export const SEEDED_FLAG_KEY = 'expenses_seeded';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

/**
 * Build a small, varied set of sample expenses spanning the current
 * month and the previous month, covering every category, so the
 * Summary view's month selector and category bars have real data to
 * render on first load.
 * @returns {Array<object>}
 */
function buildSampleExpenses() {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  const prevDate = new Date(curYear, curMonth - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();

  const samples = [
    { amount: 42.5, category: 'food', day: 2, note: 'Groceries', monthOffset: 0 },
    { amount: 15.0, category: 'transport', day: 3, note: 'Bus pass', monthOffset: 0 },
    { amount: 120.0, category: 'home', day: 5, note: 'Utilities', monthOffset: 0 },
    { amount: 30.0, category: 'fun', day: 8, note: 'Movie night', monthOffset: 0 },
    { amount: 18.75, category: 'other', day: 10, note: 'Misc', monthOffset: 0 },
    { amount: 55.2, category: 'food', day: 12, note: 'Dinner out', monthOffset: 0 },
    { amount: 60.0, category: 'food', day: 4, note: 'Groceries', monthOffset: 1 },
    { amount: 22.0, category: 'transport', day: 6, note: 'Rideshare', monthOffset: 1 },
    { amount: 95.0, category: 'home', day: 9, note: 'Internet bill', monthOffset: 1 },
    { amount: 40.0, category: 'fun', day: 14, note: 'Concert', monthOffset: 1 },
    { amount: 12.3, category: 'other', day: 20, note: 'Misc', monthOffset: 1 }
  ];

  return samples.map((s, i) => {
    const year = s.monthOffset === 0 ? curYear : prevYear;
    const month = s.monthOffset === 0 ? curMonth : prevMonth;
    return {
      id: `sample-${i + 1}`,
      amount: s.amount,
      category: CATEGORIES.includes(s.category) ? s.category : 'other',
      date: toDateStr(year, month, s.day),
      note: s.note
    };
  });
}

/**
 * Seed sample expenses into localStorage if (and only if) this is the
 * app's first load: the 'seeded' flag has never been set AND there is
 * currently no expense data. The flag is then set regardless of
 * whether seeding actually happened, so this never fires again — even
 * if the user later deletes every expense via "Clear all data".
 * Safe to call multiple times (idempotent after the first successful run).
 */
export function seedSampleData() {
  try {
    const alreadySeeded = localStorage.getItem(SEEDED_FLAG_KEY) === 'true';
    if (!alreadySeeded) {
      const existing = loadExpenses();
      if (existing.length === 0) {
        setExpenses(buildSampleExpenses());
      }
      localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    }
  } catch (err) {
    console.error('CAROLINE: failed to seed sample data', err);
  }
}

seedSampleData();
