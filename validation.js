// Form validation helpers for the feedback wall app.
// Pure functions that validate individual fields and the whole feedback
// payload. Each field validator returns { valid, message }. The combined
// validateFeedback returns { valid, errors, values } where errors maps
// field names to messages.
//
// Usage:
//   import { validateFeedback } from './validation.js';
//   const result = validateFeedback({ name, rating, comment });
//   if (!result.valid) { /* show result.errors */ }

export const NAME_MAX = 80;
export const COMMENT_MAX = 1000;
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Validate the visitor name. Trims whitespace, requires non-empty,
// and enforces the max length.
export function validateName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) {
    return { valid: false, message: 'Please enter your name.' };
  }
  if (name.length > NAME_MAX) {
    return { valid: false, message: `Name must be ${NAME_MAX} characters or fewer.` };
  }
  return { valid: true, message: '' };
}

// Validate the star rating. Must be a whole number between 1 and 5.
export function validateRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating) || !Number.isInteger(rating)) {
    return { valid: false, message: 'Please select a star rating.' };
  }
  if (rating < MIN_RATING || rating > MAX_RATING) {
    return { valid: false, message: 'Please select a star rating.' };
  }
  return { valid: true, message: '' };
}

// Validate the comment. Trims whitespace, requires non-empty,
// and enforces the max length.
export function validateComment(value) {
  const comment = typeof value === 'string' ? value.trim() : '';
  if (!comment) {
    return { valid: false, message: 'Please enter a comment.' };
  }
  if (comment.length > COMMENT_MAX) {
    return { valid: false, message: `Comment must be ${COMMENT_MAX} characters or fewer.` };
  }
  return { valid: true, message: '' };
}

// Validate a full feedback payload { name, rating, comment }.
// Returns { valid, errors, values } where:
//   - valid: boolean, true when all fields pass
//   - errors: { name?, rating?, comment? } message map (only failing fields)
//   - values: trimmed/normalized { name, rating, comment } ready to persist
//   - firstError: the first error message (or '') for a single status line
export function validateFeedback({ name, rating, comment } = {}) {
  const nameResult = validateName(name);
  const ratingResult = validateRating(rating);
  const commentResult = validateComment(comment);

  const errors = {};
  if (!nameResult.valid) errors.name = nameResult.message;
  if (!ratingResult.valid) errors.rating = ratingResult.message;
  if (!commentResult.valid) errors.comment = commentResult.message;

  const valid = nameResult.valid && ratingResult.valid && commentResult.valid;

  const values = {
    name: typeof name === 'string' ? name.trim() : '',
    rating: Number(rating),
    comment: typeof comment === 'string' ? comment.trim() : '',
  };

  const firstError = errors.name || errors.rating || errors.comment || '';

  return { valid, errors, values, firstError };
}
