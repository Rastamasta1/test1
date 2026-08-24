/**
 * format.js — pure formatting helpers.
 *
 * Exports:
 *   formatPercent(part, whole) → string ('42%', or '—' when whole is 0)
 *   pluralize(n, word)         → string ('1 vote', '3 votes', '0 votes')
 */

export function formatPercent(part, whole) {
  if (whole === 0) return '\u2014';
  return `${Math.round((part / whole) * 100)}%`;
}

export function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
