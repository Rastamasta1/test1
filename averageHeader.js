// Average rating header component for the feedback wall app.
// Renders the average rating summary (numeric value, stars, and count)
// into a container, matching the .rating-summary styles in styles/layout.css.
//
// Usage:
//   import { createAverageHeader } from './averageHeader.js';
//   const header = createAverageHeader(document.getElementById('summary-mount'));
//   header.render(feedbackArray); // update whenever the list changes

import { computeAverageRating } from './ratingUtils.js';
import { createStarDisplay } from './starDisplay.js';

export function createAverageHeader(container) {
  if (!container) {
    throw new Error('createAverageHeader requires a container element');
  }

  container.classList.add('rating-summary');

  // Render the summary for a given list of feedback rows.
  function render(feedbackList) {
    const rows = Array.isArray(feedbackList) ? feedbackList : [];
    const count = rows.length;
    const average = computeAverageRating(rows);

    container.innerHTML = '';

    // Numeric average value
    const valueEl = document.createElement('span');
    valueEl.className = 'average-value';
    valueEl.textContent = count === 0 ? '—' : average.toFixed(1);

    // Star display for the average
    const starsEl = createStarDisplay(average, { className: 'average-stars' });

    // Count of ratings
    const countEl = document.createElement('span');
    countEl.className = 'average-count';
    if (count === 0) {
      countEl.textContent = 'No ratings yet';
    } else {
      countEl.textContent = `Based on ${count} rating${count === 1 ? '' : 's'}`;
    }

    container.append(valueEl, starsEl, countEl);
  }

  // Initial empty render
  render([]);

  return { element: container, render };
}
