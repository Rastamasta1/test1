// Feedback form component for the feedback wall app.
// Renders the submission form (name, star rating, comment) into a container,
// validates input, persists via feedbackService, and reports status.
//
// Usage:
//   import { createFeedbackForm } from './feedbackForm.js';
//   createFeedbackForm(document.getElementById('form-mount'), {
//     onSubmitted: () => { /* re-render list + summary */ },
//   });

import { createStarInput } from './starInput.js';
import { insertFeedback } from './feedbackService.js';

export function createFeedbackForm(container, options = {}) {
  if (!container) {
    throw new Error('createFeedbackForm requires a container element');
  }

  const onSubmitted = typeof options.onSubmitted === 'function' ? options.onSubmitted : null;

  container.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'feedback-form';
  form.noValidate = true;

  // ---------- Name field ----------
  const nameField = document.createElement('div');
  nameField.className = 'form-field';
  const nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'feedback-name');
  nameLabel.textContent = 'Your name';
  const nameInput = document.createElement('input');
  nameInput.id = 'feedback-name';
  nameInput.name = 'name';
  nameInput.type = 'text';
  nameInput.maxLength = 80;
  nameInput.placeholder = 'Jane Doe';
  nameInput.autocomplete = 'name';
  nameField.append(nameLabel, nameInput);

  // ---------- Rating field ----------
  const ratingField = document.createElement('div');
  ratingField.className = 'form-field';
  const ratingLabel = document.createElement('label');
  ratingLabel.textContent = 'Rating';
  const starMount = document.createElement('div');
  ratingField.append(ratingLabel, starMount);

  // ---------- Comment field ----------
  const commentField = document.createElement('div');
  commentField.className = 'form-field';
  const commentLabel = document.createElement('label');
  commentLabel.setAttribute('for', 'feedback-comment');
  commentLabel.textContent = 'Comment';
  const commentInput = document.createElement('textarea');
  commentInput.id = 'feedback-comment';
  commentInput.name = 'comment';
  commentInput.maxLength = 1000;
  commentInput.placeholder = 'Share your thoughts...';
  commentField.append(commentLabel, commentInput);

  // ---------- Submit button ----------
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Submit feedback';

  // ---------- Status message ----------
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(nameField, ratingField, commentField, submitBtn, status);
  container.appendChild(form);

  const starInput = createStarInput(starMount);

  function setStatus(message, type) {
    status.textContent = message || '';
    status.classList.remove('success', 'error');
    if (type) status.classList.add(type);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const rating = starInput.getValue();
    const comment = commentInput.value.trim();

    if (!name) {
      setStatus('Please enter your name.', 'error');
      nameInput.focus();
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setStatus('Please select a star rating.', 'error');
      return;
    }
    if (!comment) {
      setStatus('Please enter a comment.', 'error');
      commentInput.focus();
      return;
    }

    submitBtn.disabled = true;
    setStatus('Submitting...', null);

    try {
      await insertFeedback(name, rating, comment);
      setStatus('Thanks for your feedback!', 'success');
      form.reset();
      starInput.reset();
      if (onSubmitted) await onSubmitted();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setStatus('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  return { element: form, setStatus };
}
