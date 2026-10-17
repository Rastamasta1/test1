/**
 * customQuestions.js — manages custom (user-created) questions.
 *
 * Exports:
 *   loadCustomQuestions()                        → Question[]
 *   saveCustomQuestion(optionA, optionB)          → Question
 *   editCustomQuestion(id, optionA, optionB)      → void
 *   removeCustomQuestion(id)                      → void
 *   seedSampleIfNeeded()                          → void
 */

import {
  getQuestions,
  addQuestion,
  reviseQuestion,
  deleteQuestion,
} from './storage.js';

/**
 * Returns only the custom (non-builtin) questions.
 */
export function loadCustomQuestions() {
  return getQuestions().filter(q => !q.builtin);
}

/**
 * Create and persist a new custom question.
 * Returns the created Question object.
 */
export function saveCustomQuestion(optionA, optionB) {
  return addQuestion(optionA, optionB);
}

/**
 * Edit an existing custom question by id.
 * Delegates to reviseQuestion (renamed from updateQuestion).
 */
export function editCustomQuestion(id, optionA, optionB) {
  reviseQuestion(id, optionA, optionB);
}

/**
 * Remove a custom question by id.
 */
export function removeCustomQuestion(id) {
  deleteQuestion(id);
}

/**
 * Seed a sample custom question if none exist yet,
 * so first-time users see an example of a custom entry.
 */
export function seedSampleIfNeeded() {
  const existing = loadCustomQuestions();
  if (existing.length === 0) {
    addQuestion(
      'Give up social media for a year',
      'Give up watching TV/streaming for a year'
    );
  }
}
