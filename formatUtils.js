// Formatting utilities for the recipe collection app.
// Pure functions with no side effects; safe to import anywhere.

// Format cook time (minutes) into a human-friendly string.
// 0 or falsy -> 'N/A'; < 60 -> 'Xm'; >= 60 -> 'Hh Mm' (Mm omitted when 0).
export function formatCookTime(minutes) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return 'N/A';
  const total = Math.round(m);
  if (total < 60) return `${total}m`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

// Format servings count into a friendly label.
// 1 -> '1 serving'; N -> 'N servings'; invalid -> 'N/A'.
export function formatServings(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return 'N/A';
  const c = Math.round(n);
  return c === 1 ? '1 serving' : `${c} servings`;
}

// Safely coerce to an integer, returning fallback when not a valid number.
export function formatNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

// Truncate text to a maximum length, appending an ellipsis when cut.
export function truncate(text, max = 80) {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + '\u2026';
}

// Escape a string for safe insertion into HTML.
export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
