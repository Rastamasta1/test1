/**
 * customQuestions.js — localStorage load/save for custom questions.
 *
 * Thin re-export facade over storage.js for the custom-questions
 * subset of functionality. Import from here when you only need
 * custom-question operations, without pulling in votes/stats.
 *
 * Exports:
 *   loadCustomQuestions()              → Question[]
 *   saveCustomQuestion(optionA, optionB) → Question
 *   editCustomQuestion(id, optionA, optionB) → void
 *   removeCustomQuestion(id)            → void
 *   seedSampleIfNeeded()                → void  (call once on boot)
 */

import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from './storage.js';

const SEED_KEY = 'wyr_sample_seeded';

/**
 * Validate a pair of question options.
 * @param {string} optionA
 * @param {string} optionB
 * @returns {boolean}
 */
function isValidQuestion(optionA, optionB) {
  const a = String(optionA).trim();
  const b = String(optionB).trim();
  if (!a || !b) return false;
  if (a === b) return false;
  if (a.length > 140 || b.length > 140) return false;
  return true;
}

/**
 * Return only the user-created (non-builtin) questions from localStorage.
 * @returns {Array<{id:string, optionA:string, optionB:string, builtin:false}>}
 */
export function loadCustomQuestions() {
  return getQuestions().filter(q => !q.builtin);
}

/**
 * Persist a new custom question.
 * Both options are trimmed; callers must validate non-empty before calling.
 * @param {string} optionA
 * @param {string} optionB
 * @returns {{id:string, optionA:string, optionB:string, builtin:false}}
 */
export function saveCustomQuestion(optionA, optionB) {
  if (!isValidQuestion(optionA, optionB)) {
    const a = String(optionA).trim();
    const b = String(optionB).trim();
    let reason = 'invalid question';
    if (!a || !b) reason = 'both options are required';
    else if (a === b) reason = 'options must not be identical';
    else if (a.length > 140 || b.length > 140) reason = 'options must be at most 140 characters';
    throw new Error(reason);
  }
  return addQuestion(optionA, optionB);
}

/**
 * Update an existing custom question in place.
 * @param {string} id
 * @param {string} optionA
 * @param {string} optionB
 */
export function editCustomQuestion(id, optionA, optionB) {
  if (!isValidQuestion(optionA, optionB)) {
    const a = String(optionA).trim();
    const b = String(optionB).trim();
    let reason = 'invalid question';
    if (!a || !b) reason = 'both options are required';
    else if (a === b) reason = 'options must not be identical';
    else if (a.length > 140 || b.length > 140) reason = 'options must be at most 140 characters';
    throw new Error(reason);
  }
  updateQuestion(id, optionA, optionB);
}

/**
 * Remove a custom question by id.
 * @param {string} id
 */
export function removeCustomQuestion(id) {
  deleteQuestion(id);
}

/**
 * Seed one sample custom question on the very first load of the app.
 * Idempotent — guarded by a localStorage flag so it only runs once.
 * Call this once during app boot (before initGame).
 */
export function seedSampleIfNeeded() {
  if (localStorage.getItem(SEED_KEY)) return;
  addQuestion(
    'Only be able to whisper for the rest of your life',
    'Only be able to shout for the rest of your life'
  );
  localStorage.setItem(SEED_KEY, '1');
}
