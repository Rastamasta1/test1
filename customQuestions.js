/**
 * customQuestions.js — CRUD helpers for user-created questions.
 *
 * Exports:
 *   loadCustomQuestions()               → Question[]
 *   saveCustomQuestion(optionA, optionB) → Question
 *   editCustomQuestion(id, a, b)         → void
 *   removeCustomQuestion(id)             → void
 *   seedSampleIfNeeded()                 → void
 */

import {
  getQuestions,
  addQuestion,
  reviseQuestion,
  deleteQuestion,
} from './storage.js';

/**
 * Return only the custom (non-builtin) questions.
 */
export function loadCustomQuestions() {
  return getQuestions().filter(q => !q.builtin);
}

/**
 * Persist a new custom question and return it.
 */
export function saveCustomQuestion(optionA, optionB) {
  return addQuestion(optionA, optionB);
}

/**
 * Edit an existing custom question by id.
 * Delegates to reviseQuestion (renamed from updateQuestion — rename only).
 */
export function editCustomQuestion(id, optionA, optionB) {
  reviseQuestion(id, optionA, optionB);
}

/**
 * Delete a custom question by id.
 */
export function removeCustomQuestion(id) {
  deleteQuestion(id);
}

/**
 * Seed one sample custom question if no custom questions exist yet.
 */
export function seedSampleIfNeeded() {
  const existing = loadCustomQuestions();
  if (existing.length === 0) {
    addQuestion(
      'Have the ability to time travel but only backwards',
      'Have the ability to teleport but only to places you have already been'
    );
  }
}
