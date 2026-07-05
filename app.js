// Main entry point for the feedback wall app.
// Wires the data services and UI components together and starts the app.
// index.html loads this module (<script type="module" src="app.js">).
//
// The heavy lifting lives in feedbackController.js, which coordinates the
// submission form, feedback list, and average rating header. Here we simply
// resolve the mount points from the DOM and boot the controller.

import { createFeedbackController } from './feedbackController.js';

function start() {
  const formMount = document.getElementById('form-mount');
  const listMount = document.getElementById('list-mount');
  const summaryMount = document.getElementById('summary-mount');

  if (!listMount) {
    console.error('app.js: #list-mount not found in the DOM.');
    return;
  }

  createFeedbackController({
    formMount,
    listMount,
    summaryMount,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
