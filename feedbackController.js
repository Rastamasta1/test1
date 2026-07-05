// Feedback controller for the feedback wall app.
// Wires the submission form, feedback list, and average rating header
// together, coordinating loading, rendering, and refresh-after-submit.
//
// Usage:
//   import { createFeedbackController } from './feedbackController.js';
//   createFeedbackController({
//     formMount: document.getElementById('form-mount'),
//     listMount: document.getElementById('list-mount'),
//     summaryMount: document.getElementById('summary-mount'),
//   });

import { createFeedbackForm } from './feedbackForm.js';
import { createFeedbackList } from './feedbackList.js';
import { createAverageHeader } from './averageHeader.js';
import { showToast } from './toast.js';

export function createFeedbackController(options = {}) {
  const { formMount, listMount, summaryMount } = options;

  if (!listMount) {
    throw new Error('createFeedbackController requires a listMount element');
  }

  const list = createFeedbackList(listMount);
  const header = summaryMount ? createAverageHeader(summaryMount) : null;

  // Fetch feedback, render the list, and update the average header.
  async function refresh() {
    const rows = await list.load();
    if (header) header.render(rows);
    return rows;
  }

  // Called after a successful submission.
  async function handleSubmitted() {
    showToast('Thanks for your feedback!', { type: 'success' });
    await refresh();
  }

  let form = null;
  if (formMount) {
    form = createFeedbackForm(formMount, {
      onSubmitted: handleSubmitted,
    });
  }

  // Initial load
  refresh();

  return { list, header, form, refresh };
}
