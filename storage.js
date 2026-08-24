/**
 * storage.js — all localStorage persistence for Would You Rather.
 *
 * Exports:
 *   getQuestions()                    → Question[]
 *   addQuestion(optionA, optionB)     → Question
 *   updateQuestion(id, optionA, optionB) → void
 *   deleteQuestion(id)                → void
 *   getVotes(questionId)              → { a: number, b: number }
 *   recordVote(questionId, choice)    → void
 *   getSessionVotes()                 → { [questionId]: 'a'|'b' }
 *   recordSessionVote(questionId, choice) → void
 *   clearSessionVotes()               → void
 *   getStats()                        → { answered: number, agreedWithMajority: number }
 *   resetStats()                      → void
 */

// ── Storage keys ──────────────────────────────────────────────────────────
const KEY_CUSTOM_QUESTIONS = 'wyr_custom_questions';
const KEY_VOTES            = 'wyr_votes';
const KEY_STATS            = 'wyr_stats';

// Session votes live only in memory (cleared on page reload)
let _sessionVotes = {};

// ── Built-in questions (15) with seeded baseline vote counts ─────────────
export const BUILTIN_QUESTIONS = [
  { id: 'b01', optionA: 'Be able to fly',                          optionB: 'Be able to turn invisible',            builtin: true, votes: { a: 312, b: 278 } },
  { id: 'b02', optionA: 'Always be 10 minutes late',              optionB: 'Always be 2 hours early',              builtin: true, votes: { a: 198, b: 341 } },
  { id: 'b03', optionA: 'Have unlimited money but no friends',    optionB: 'Have great friends but no money',       builtin: true, votes: { a: 189, b: 422 } },
  { id: 'b04', optionA: 'Only eat sweet food forever',            optionB: 'Only eat savoury food forever',         builtin: true, votes: { a: 267, b: 304 } },
  { id: 'b05', optionA: 'Know when you will die',                 optionB: 'Know how you will die',                builtin: true, votes: { a: 388, b: 211 } },
  { id: 'b06', optionA: 'Live in the past',                       optionB: 'Live in the future',                   builtin: true, votes: { a: 145, b: 460 } },
  { id: 'b07', optionA: 'Be the funniest person in the room',     optionB: 'Be the smartest person in the room',   builtin: true, votes: { a: 256, b: 389 } },
  { id: 'b08', optionA: 'Lose all your memories from birth to 18',optionB: 'Lose the last 5 years of memories',     builtin: true, votes: { a: 201, b: 334 } },
  { id: 'b09', optionA: 'Always speak your mind',                 optionB: 'Always know what others are thinking',  builtin: true, votes: { a: 278, b: 367 } },
  { id: 'b10', optionA: 'Have a rewind button for life',          optionB: 'Have a pause button for life',          builtin: true, votes: { a: 312, b: 401 } },
  { id: 'b11', optionA: 'Be famous but hated',                    optionB: 'Be unknown but beloved',               builtin: true, votes: { a: 134, b: 498 } },
  { id: 'b12', optionA: 'Fight one horse-sized duck',             optionB: 'Fight one hundred duck-sized horses',   builtin: true, votes: { a: 423, b: 287 } },
  { id: 'b13', optionA: 'Never need to sleep',                    optionB: 'Never need to eat',                    builtin: true, votes: { a: 356, b: 289 } },
  { id: 'b14', optionA: 'Be able to talk to animals',             optionB: 'Be able to speak every human language', builtin: true, votes: { a: 344, b: 367 } },
  { id: 'b15', optionA: 'Always feel too hot',                    optionB: 'Always feel too cold',                 builtin: true, votes: { a: 231, b: 298 } },
];

// ── Internal helpers ──────────────────────────────────────────────────────
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Questions ─────────────────────────────────────────────────────────────

/**
 * Returns all questions: builtins + custom, merged together.
 * For builtins, baseline vote counts come from BUILTIN_QUESTIONS;
 * additional votes from localStorage are layered on top.
 */
export function getQuestions() {
  const custom = loadJSON(KEY_CUSTOM_QUESTIONS, []);
  return [...BUILTIN_QUESTIONS, ...custom];
}

/**
 * Add a new custom question. Persists to localStorage.
 * Returns the created Question object.
 */
export function addQuestion(optionA, optionB) {
  const custom = loadJSON(KEY_CUSTOM_QUESTIONS, []);
  const q = {
    id: generateId(),
    optionA: optionA.trim(),
    optionB: optionB.trim(),
    builtin: false,
  };
  custom.push(q);
  saveJSON(KEY_CUSTOM_QUESTIONS, custom);
  return q;
}

/**
 * Update an existing custom question by id.
 */
export function updateQuestion(id, optionA, optionB) {
  const custom = loadJSON(KEY_CUSTOM_QUESTIONS, []);
  const idx = custom.findIndex(q => q.id === id);
  if (idx === -1) return;
  custom[idx].optionA = optionA.trim();
  custom[idx].optionB = optionB.trim();
  saveJSON(KEY_CUSTOM_QUESTIONS, custom);
}

/**
 * Delete a custom question by id.
 */
export function deleteQuestion(id) {
  const custom = loadJSON(KEY_CUSTOM_QUESTIONS, []);
  saveJSON(KEY_CUSTOM_QUESTIONS, custom.filter(q => q.id !== id));
}

// ── Votes ─────────────────────────────────────────────────────────────────

/**
 * Get accumulated vote counts for a question.
 * For built-ins, baseline numbers are seeded from BUILTIN_QUESTIONS;
 * extra votes from localStorage are added on top.
 */
export function getVotes(questionId) {
  const stored = loadJSON(KEY_VOTES, {});
  const extra = stored[questionId] || { a: 0, b: 0 };

  const builtin = BUILTIN_QUESTIONS.find(q => q.id === questionId);
  if (builtin) {
    return {
      a: builtin.votes.a + extra.a,
      b: builtin.votes.b + extra.b,
    };
  }
  return { a: extra.a, b: extra.b };
}

/**
 * Pure: compute integer vote-split percentages that always sum to 100.
 * Zero total votes returns a 50/50 split. No DOM, no localStorage.
 * @param {{a?:number,b?:number}} votes
 * @returns {{aPct:number, bPct:number}}
 */
export function computeSplit(votes) {
  const a = (votes && votes.a) || 0;
  const b = (votes && votes.b) || 0;
  const total = a + b;
  if (total === 0) return { aPct: 50, bPct: 50 };
  const aPct = Math.round((a / total) * 100);
  return { aPct, bPct: 100 - aPct };
}

/**
 * Persist one vote (choice = 'a' or 'b') for a question.
 */
export function recordVote(questionId, choice) {
  const stored = loadJSON(KEY_VOTES, {});
  if (!stored[questionId]) stored[questionId] = { a: 0, b: 0 };
  if (choice === 'a') stored[questionId].a++;
  else if (choice === 'b') stored[questionId].b++;
  saveJSON(KEY_VOTES, stored);

  // Update stats
  const votes = getVotes(questionId);
  const total = votes.a + votes.b;
  const majorityIsA = votes.a >= votes.b;
  const choseMajority = (majorityIsA && choice === 'a') || (!majorityIsA && choice === 'b');
  _updateStats(choseMajority);
}

// ── Session votes (in-memory only) ───────────────────────────────────────

export function getSessionVotes() {
  return _sessionVotes;
}

export function recordSessionVote(questionId, choice) {
  _sessionVotes[questionId] = choice;
}

export function clearSessionVotes() {
  _sessionVotes = {};
}

// ── Stats ─────────────────────────────────────────────────────────────────

function _updateStats(agreedWithMajority) {
  const stats = loadJSON(KEY_STATS, { answered: 0, agreedWithMajority: 0 });
  stats.answered++;
  if (agreedWithMajority) stats.agreedWithMajority++;
  saveJSON(KEY_STATS, stats);
}

export function getStats() {
  return loadJSON(KEY_STATS, { answered: 0, agreedWithMajority: 0 });
}

export function resetStats() {
  saveJSON(KEY_STATS, { answered: 0, agreedWithMajority: 0 });
  saveJSON(KEY_VOTES, {});
  clearSessionVotes();
}
