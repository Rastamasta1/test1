// ── src/study.js — Study Session State & Logic ───────────────────────────
// Pure module: no DOM access, no side-effects beyond its own state.
// Import and call these functions from app.js to drive the study UI.
//
// Progress model: tracks UNIQUE cards mastered vs original deck size.
// Re-queued cards do NOT inflate the total — the bar only advances on
// "Got it" clicks.

import { getCardsByDeck } from './cards.js';
import { shuffleDeck } from './cards.js';

// ── Exported constant ─────────────────────────────────────────────────────
/** Sentinel value returned by advance() when the round is finished. */
export const ROUND_COMPLETE = 'ROUND_COMPLETE';

// ── Internal state (module-level singleton) ───────────────────────────────
// All fields are reset by startSession().
let _deckName     = '';   // name of the active deck
let _queue        = [];   // cards still to show this round (mutated)
let _total        = 0;    // original deck size (fixed denominator)
let _masteredCount = 0;   // unique cards marked "Got it"
let _gotItCount   = 0;    // total "Got it" button presses
let _againCount   = 0;    // total "Again" button presses
let _active       = false; // true while a session is running

// ── Session lifecycle ─────────────────────────────────────────────────────

/**
 * Start a new study session for the given deck.
 *
 * @param {Array}  cards    - Full cards array (from app state)
 * @param {string} deckName - Deck to study
 * @param {(() => number)} [rng=Math.random] - Optional RNG for testability
 * @returns {SessionSnapshot} Current state snapshot
 * @throws {Error} If the deck has no cards
 */
export function startSession(cards, deckName, rng = Math.random) {
  const deckCards = getCardsByDeck(cards, deckName);
  if (!deckCards || deckCards.length === 0) {
    throw new Error(`Deck "${deckName}" has no cards.`);
  }

  _deckName      = deckName;
  _queue         = shuffleDeck(deckCards, rng);
  _total         = deckCards.length;
  _masteredCount = 0;
  _gotItCount    = 0;
  _againCount    = 0;
  _active        = true;

  return getSnapshot();
}

/**
 * End the current session and reset all state.
 */
export function endSession() {
  _active        = false;
  _deckName      = '';
  _queue         = [];
  _total         = 0;
  _masteredCount = 0;
  _gotItCount    = 0;
  _againCount    = 0;
}

// ── Card actions ──────────────────────────────────────────────────────────

/**
 * Mark the current card as "Got it".
 * Removes it from the queue permanently and advances masteredCount.
 *
 * @returns {SessionSnapshot | ROUND_COMPLETE}
 */
export function markGotIt() {
  _assertActive();
  _gotItCount++;
  _masteredCount++;
  // Remove the front card (the one the user just answered)
  _queue.shift();
  if (_masteredCount >= _total) {
    _active = false;
    return ROUND_COMPLETE;
  }
  return getSnapshot();
}

/**
 * Mark the current card as "Again".
 * Moves it to the END of the queue so it reappears later.
 *
 * @returns {SessionSnapshot}
 */
export function markAgain() {
  _assertActive();
  _againCount++;
  // Move the front card to the back
  const card = _queue.shift();
  _queue.push(card);
  return getSnapshot();
}

// ── Queries ───────────────────────────────────────────────────────────────

/**
 * Return the card currently at the front of the queue.
 *
 * @returns {{ id: string, deck: string, front: string, back: string } | null}
 */
export function currentCard() {
  if (!_active || _queue.length === 0) return null;
  return _queue[0];
}

/**
 * Whether a session is currently active.
 * @returns {boolean}
 */
export function isActive() {
  return _active;
}

/**
 * Return a plain-object snapshot of the current session state.
 * Safe to spread/destructure in the UI layer.
 *
 * @returns {SessionSnapshot}
 */
export function getSnapshot() {
  return {
    deckName:      _deckName,
    total:         _total,         // original deck size
    masteredCount: _masteredCount, // unique cards done
    gotItCount:    _gotItCount,    // total "got it" presses
    againCount:    _againCount,    // total "again" presses
    remaining:     _queue.length,  // cards left in queue (includes re-queued)
    progressPct:   _total === 0 ? 0 : Math.round((_masteredCount / _total) * 100),
    card:          _queue[0] ?? null,
    active:        _active,
  };
}

/**
 * Return a round-summary object (call after ROUND_COMPLETE is returned).
 *
 * @returns {RoundSummary}
 */
export function getRoundSummary() {
  const totalAttempts = _gotItCount + _againCount;
  const accuracyPct   = totalAttempts === 0
    ? 100
    : Math.round((_gotItCount / totalAttempts) * 100);

  return {
    deckName:     _deckName,
    total:        _total,
    gotItCount:   _gotItCount,
    againCount:   _againCount,
    accuracyPct,
    perfect:      _againCount === 0,
  };
}

// ── Internal helpers ───────────────────────────────────────────────────────

function _assertActive() {
  if (!_active) throw new Error('No active study session.');
  if (_queue.length === 0) throw new Error('Queue is empty.');
}

/**
 * @typedef {object} SessionSnapshot
 * @property {string}  deckName
 * @property {number}  total         - Original deck size
 * @property {number}  masteredCount - Unique cards mastered so far
 * @property {number}  gotItCount    - Total "Got it" presses
 * @property {number}  againCount    - Total "Again" presses
 * @property {number}  remaining     - Cards left in queue
 * @property {number}  progressPct   - 0-100 based on masteredCount/total
 * @property {object|null} card      - Current card at front of queue
 * @property {boolean} active
 */

/**
 * @typedef {object} RoundSummary
 * @property {string}  deckName
 * @property {number}  total
 * @property {number}  gotItCount
 * @property {number}  againCount
 * @property {number}  accuracyPct  - 0-100
 * @property {boolean} perfect      - true if againCount === 0
 */
