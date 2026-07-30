// habitModel.js — pure habit data logic

/**
 * Create a new habit object.
 * @param {string} name
 * @returns {object}
 */
export function createHabit(name) {
  return {
    id: crypto.randomUUID(),
    name: name,
    completedDays: [] // array of ISO date strings e.g. '2025-01-15'
  };
}

/**
 * Toggle a day on/off for a habit (immutable).
 * If the day is already completed, un-mark it; otherwise mark it.
 * @param {object} habit
 * @param {string} dateStr — ISO date string
 * @returns {object} new habit object
 */
export function toggleDay(habit, dateStr) {
  const already = habit.completedDays.includes(dateStr);
  return {
    ...habit,
    completedDays: already
      ? habit.completedDays.filter(d => d !== dateStr)
      : [...habit.completedDays, dateStr]
  };
}

/**
 * Return the last 7 calendar days (today + 6 prior), newest last.
 * @returns {string[]} array of ISO date strings
 */
export function getSevenDayWindow() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
