// Feedback list component for the feedback wall app.
// Renders a list of feedback entries (newest-first) into a container,
// using createFeedbackCard for each row. Handles loading, empty, and error states.
//
// Usage:
//   import { createFeedbackList } from './feedbackList.js';
//   const list = createFeedbackList(document.getElementById('list-mount'));
//   await list.load();          // fetch + render from Supabase
//   list.render(feedbackArray); // render a provided array directly

import { createFeedbackCard } from './feedbackCard.js';
import { fetchAllFeedback } from './feedbackService.js';

export function createFeedbackList(container, options = {}) {
  if (!container) {
    throw new Error('createFeedbackList requires a container element');
  }

  container.classList.add('feedback-list');

  // Render a provided array of feedback rows (assumed newest-first).
  function render(feedbackList) {
    container.innerHTML = '';

    const rows = Array.isArray(feedbackList) ? feedbackList : [];

    if (rows.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No feedback yet. Be the first to leave some!';
      container.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    rows.forEach((feedback) => {
      fragment.appendChild(createFeedbackCard(feedback));
    });
    container.appendChild(fragment);
  }

  // Show a loading placeholder.
  function showLoading() {
    container.innerHTML = '';
    const loading = document.createElement('p');
    loading.className = 'empty-state';
    loading.textContent = 'Loading feedback...';
    container.appendChild(loading);
  }

  // Show an error message.
  function showError(message) {
    container.innerHTML = '';
    const error = document.createElement('p');
    error.className = 'empty-state';
    error.textContent = message || 'Could not load feedback. Please try again.';
    container.appendChild(error);
  }

  // Fetch from Supabase and render. Returns the fetched rows so callers
  // (e.g. app.js) can also update the average rating summary.
  async function load() {
    showLoading();
    try {
      const rows = await fetchAllFeedback();
      render(rows);
      return rows;
    } catch (err) {
      console.error('Failed to load feedback:', err);
      showError('Could not load feedback. Please try again.');
      return [];
    }
  }

  if (options.autoLoad) {
    load();
  }

  return { element: container, render, load, showLoading, showError };
}
