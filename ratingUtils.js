// Rating utilities for the feedback wall app

// Compute the average rating from a list of feedback rows.
// Each row is expected to have a numeric `rating` field (1-5).
// Returns a number rounded to one decimal place, or 0 when the list is empty.
export function computeAverageRating(feedbackList) {
  if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
    return 0;
  }

  const validRatings = feedbackList
    .map((f) => Number(f && f.rating))
    .filter((r) => Number.isFinite(r));

  if (validRatings.length === 0) {
    return 0;
  }

  const sum = validRatings.reduce((total, r) => total + r, 0);
  const average = sum / validRatings.length;

  return Math.round(average * 10) / 10;
}
