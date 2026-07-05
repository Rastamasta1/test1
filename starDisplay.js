// Read-only star rating display component for the feedback wall app.
//
// Usage:
//   import { renderStars, createStarDisplay } from './starDisplay.js';
//   const text = renderStars(4);            // '\u2605\u2605\u2605\u2605\u2606'
//   const el = createStarDisplay(4.5);      // <span class="star-display">...</span>

const MAX_STARS = 5;
const FILLED = '\u2605'; // ★
const EMPTY = '\u2606';  // ☆

function clamp(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > MAX_STARS) return MAX_STARS;
  return n;
}

// Return a plain string of filled/empty stars for the given rating.
// The rating is rounded to the nearest whole star for display.
export function renderStars(rating) {
  const rounded = Math.round(clamp(rating));
  let out = '';
  for (let i = 1; i <= MAX_STARS; i += 1) {
    out += i <= rounded ? FILLED : EMPTY;
  }
  return out;
}

// Create a DOM <span> element showing the star rating.
// options.className lets callers style it (defaults to 'star-display').
// options.showValue appends the numeric value (e.g. '4.5').
export function createStarDisplay(rating, options = {}) {
  const value = clamp(rating);
  const span = document.createElement('span');
  span.className = options.className || 'star-display';
  span.setAttribute('role', 'img');
  span.setAttribute(
    'aria-label',
    `${Math.round(value * 10) / 10} out of ${MAX_STARS} stars`
  );

  const starsSpan = document.createElement('span');
  starsSpan.className = 'star-display-stars';
  starsSpan.setAttribute('aria-hidden', 'true');
  starsSpan.textContent = renderStars(value);
  span.appendChild(starsSpan);

  if (options.showValue) {
    const valueSpan = document.createElement('span');
    valueSpan.className = 'star-display-value';
    valueSpan.setAttribute('aria-hidden', 'true');
    valueSpan.textContent = ` ${Math.round(value * 10) / 10}`;
    span.appendChild(valueSpan);
  }

  return span;
}
