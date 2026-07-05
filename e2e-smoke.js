// In-browser end-to-end smoke test for the feedback wall app.
// Run from the browser console on the running site:
//   import('./e2e-smoke.js').then(m => m.runSmokeTest());
//
// Verifies pure utilities and a live Supabase insert+read round-trip.
// Reuses the real project modules so it tests the actual code paths.

import { validateFeedback } from './validation.js';
import { computeAverageRating } from './ratingUtils.js';
import { formatRelativeDate } from './dateUtils.js';
import { renderStars } from './starDisplay.js';
import { insertFeedback, fetchAllFeedback } from './feedbackService.js';

function assert(name, condition) {
  const status = condition ? 'PASS' : 'FAIL';
  // eslint-disable-next-line no-console
  console.log(`[${status}] ${name}`);
  return !!condition;
}

export async function runSmokeTest() {
  let ok = true;

  // ---------- Validation ----------
  ok = assert('rejects empty name',
    !validateFeedback({ name: '', rating: 4, comment: 'hi' }).valid) && ok;
  ok = assert('rejects rating 0',
    !validateFeedback({ name: 'A', rating: 0, comment: 'hi' }).valid) && ok;
  ok = assert('rejects empty comment',
    !validateFeedback({ name: 'A', rating: 4, comment: '' }).valid) && ok;
  ok = assert('accepts valid payload',
    validateFeedback({ name: 'A', rating: 4, comment: 'hi' }).valid) && ok;

  // ---------- Rating utils ----------
  ok = assert('average of [5,4,3] is 4',
    computeAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 3 }]) === 4) && ok;
  ok = assert('average of empty list is 0',
    computeAverageRating([]) === 0) && ok;

  // ---------- Star rendering ----------
  ok = assert('renderStars(4) has 4 filled',
    (renderStars(4).match(/\u2605/g) || []).length === 4) && ok;

  // ---------- Date utils ----------
  ok = assert('formatRelativeDate(now) is "just now"',
    formatRelativeDate(new Date().toISOString()) === 'just now') && ok;

  // ---------- Live round-trip ----------
  try {
    const marker = `smoke-${Date.now()}`;
    await insertFeedback(marker, 5, `smoke test ${marker}`);
    const rows = await fetchAllFeedback();
    const found = rows.find((r) => r.name === marker);
    ok = assert('inserted row is fetched back', !!found) && ok;
    ok = assert('fetched row rating matches', found && found.rating === 5) && ok;
    ok = assert('list is newest-first',
      rows.length < 2 ||
      new Date(rows[0].created_at) >= new Date(rows[1].created_at)) && ok;
  } catch (err) {
    ok = assert(`Supabase round-trip (error: ${err && err.message})`, false);
  }

  // eslint-disable-next-line no-console
  console.log(ok ? 'ALL SMOKE TESTS PASSED' : 'SOME SMOKE TESTS FAILED');
  return ok;
}
