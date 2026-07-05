// Feedback card component for the feedback wall app.
// Renders a single feedback entry (name, star rating, date, comment)
// as a DOM element matching the .feedback-card styles in styles/layout.css.
//
// Usage:
//   import { createFeedbackCard } from './feedbackCard.js';
//   const card = createFeedbackCard(feedback);
//   listEl.appendChild(card);

import { createStarDisplay } from './starDisplay.js';
import { formatRelativeDate, formatDate } from './dateUtils.js';

// Build a card element for one feedback row.
// `feedback` is expected to have: name, rating, comment, created_at.
export function createFeedbackCard(feedback = {}) {
  const { name = '', rating = 0, comment = '', created_at = '' } = feedback;

  const card = document.createElement('article');
  card.className = 'feedback-card';

  // ---------- Header (name + date) ----------
  const header = document.createElement('div');
  header.className = 'feedback-card-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'feedback-name';
  nameEl.textContent = name || 'Anonymous';

  const dateEl = document.createElement('time');
  dateEl.className = 'feedback-date';
  if (created_at) {
    dateEl.setAttribute('datetime', created_at);
    dateEl.setAttribute('title', formatDate(created_at));
    dateEl.textContent = formatRelativeDate(created_at);
  }

  header.append(nameEl, dateEl);

  // ---------- Stars ----------
  const stars = createStarDisplay(rating, { className: 'feedback-stars' });

  // ---------- Comment ----------
  const commentEl = document.createElement('p');
  commentEl.className = 'feedback-comment';
  commentEl.textContent = comment;

  card.append(header, stars, commentEl);

  return card;
}
