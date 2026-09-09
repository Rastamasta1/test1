/**
 * escapeHtml.js — shared HTML-escaping helper.
 *
 * Exports:
 *   escHtml(str) → string — coerces input via String(str) and escapes
 *     the five characters unsafe to interpolate into HTML: & < > " '
 */

export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
