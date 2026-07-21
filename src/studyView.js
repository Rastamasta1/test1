// ── src/studyView.js — Study Tab UI ───────────────────────────────────────
// Drives the Study tab: deck picker, study session, and round-complete screen.
// Consumes the pure src/study.js module for all state logic.
// No direct DOM manipulation outside this file for the study view.

import {
  ROUND_COMPLETE,
  startSession,
  endSession,
  markGotIt,
  markAgain,
  currentCard,
  isActive,
  getSnapshot,
  getRoundSummary,
} from './study.js';

// ── DOM refs (resolved in init) ────────────────────────────────────────────
let _getCards;          // () => Array — live card array from app state

// Setup / picker
let _studySetup;
let _deckPickerList;
let _emptyStudyState;

// Session panel
let _studySession;
let _progressLabel;
let _progressBarRole;
let _studyProgressBar;
let _btnExitStudy;
let _flipCard;
let _cardFrontText;
let _cardBackText;
let _studyActions;
let _btnAgain;
let _btnGotIt;

// Round complete panel
let _roundComplete;
let _roundSummaryText;
let _statGotIt;
let _statAgain;
let _statTotal;
let _btnStudyAgain;
let _btnPickDeck;

// Local UI state (flip only — all session state lives in study.js)
let _cardFlipped = false;
let _activeDeck  = '';   // name of the deck being studied (for "Study Again")

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialise the study view.
 * Must be called once from app.js after the DOM is ready.
 *
 * @param {object} opts
 * @param {() => Array} opts.getCards  Returns the current cards array.
 */
export function init({ getCards }) {
  _getCards = getCards;

  // Resolve all DOM refs
  _studySetup       = document.getElementById('study-setup');
  _deckPickerList   = document.getElementById('deck-picker-list');
  _emptyStudyState  = document.getElementById('empty-study-state');

  _studySession     = document.getElementById('study-session');
  _progressLabel    = document.getElementById('progress-label');
  _progressBarRole  = document.getElementById('progress-bar-role');
  _studyProgressBar = document.getElementById('study-progress-bar');
  _btnExitStudy     = document.getElementById('btn-exit-study');
  _flipCard         = document.getElementById('flip-card');
  _cardFrontText    = document.getElementById('card-front-text');
  _cardBackText     = document.getElementById('card-back-text');
  _studyActions     = document.getElementById('study-actions');
  _btnAgain         = document.getElementById('btn-again');
  _btnGotIt         = document.getElementById('btn-gotit');

  _roundComplete    = document.getElementById('round-complete');
  _roundSummaryText = document.getElementById('round-summary-text');
  _statGotIt        = document.getElementById('stat-got-it');
  _statAgain        = document.getElementById('stat-again');
  _statTotal        = document.getElementById('stat-total');
  _btnStudyAgain    = document.getElementById('btn-study-again');
  _btnPickDeck      = document.getElementById('btn-pick-deck');

  // Wire up events
  _btnExitStudy.addEventListener('click', _handleExit);
  _btnStudyAgain.addEventListener('click', _handleStudyAgain);
  _btnPickDeck.addEventListener('click', showDeckPicker);

  // Flip card — click or keyboard (Space / Enter)
  _flipCard.addEventListener('click', _handleFlip);
  _flipCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      _handleFlip();
    }
  });

  // Got it / Again
  _btnGotIt.addEventListener('click', _handleGotIt);
  _btnAgain.addEventListener('click',  _handleAgain);
}

/**
 * Render the deck picker panel.
 * Call this whenever the Study tab becomes visible or card data changes.
 */
export function showDeckPicker() {
  // End any active session so state is clean
  if (isActive()) endSession();

  _setPanel('setup');

  const cards = _getCards();

  // Build unique sorted deck names with counts
  const deckMap = new Map();
  for (const c of cards) {
    deckMap.set(c.deck, (deckMap.get(c.deck) || 0) + 1);
  }
  const sortedDecks = [...deckMap.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Clear previous items, keep the empty-state node
  _deckPickerList
    .querySelectorAll('.deck-picker-item')
    .forEach(el => el.remove());

  if (sortedDecks.length === 0) {
    _emptyStudyState.style.display = '';
    return;
  }
  _emptyStudyState.style.display = 'none';

  for (const [name, count] of sortedDecks) {
    const item = _buildDeckPickerItem(name, count);
    _deckPickerList.appendChild(item);
  }
}

// ── Private: panel management ──────────────────────────────────────────────

/**
 * Show exactly one of: 'setup' | 'session' | 'complete'.
 * Hides the other two.
 *
 * @param {'setup'|'session'|'complete'} which
 */
function _setPanel(which) {
  _studySetup.style.display    = which === 'setup'    ? '' : 'none';
  _studySession.style.display  = which === 'session'  ? '' : 'none';
  _roundComplete.style.display = which === 'complete' ? '' : 'none';
}

// ── Private: deck picker item builder ─────────────────────────────────────

function _buildDeckPickerItem(name, count) {
  const item = document.createElement('div');
  item.className = 'deck-picker-item';
  item.setAttribute('role', 'listitem');
  item.setAttribute('tabindex', '0');
  item.setAttribute('data-deck', name);
  item.innerHTML = `
    <span class="deck-picker-name">${_escapeHtml(name)}</span>
    <span class="deck-picker-count">${count} card${count !== 1 ? 's' : ''}</span>
  `;

  const startFn = () => _startStudySession(name);
  item.addEventListener('click', startFn);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startFn();
    }
  });

  return item;
}

// ── Private: study session lifecycle ──────────────────────────────────────

function _startStudySession(deckName) {
  let snapshot;
  try {
    snapshot = startSession(_getCards(), deckName);
  } catch (err) {
    // Deck became empty between renders — fall back to picker
    console.warn('[studyView] startSession failed:', err);
    showDeckPicker();
    return;
  }

  _activeDeck = deckName;
  _setPanel('session');
  _renderCard(snapshot);
}

/**
 * Render the current card from a snapshot.
 * Always shows the FRONT first; resets flip state.
 *
 * @param {object} snapshot — SessionSnapshot from study.js
 */
function _renderCard(snapshot) {
  const { card } = snapshot;
  if (!card) return; // shouldn't happen; guard anyway

  // ── Reset flip state ──────────────────────────────────────────────────
  _cardFlipped = false;
  _flipCard.classList.remove('flipped');

  // Hide action buttons until the user flips the card
  _studyActions.style.display = 'none';

  // ── Populate text on both faces ───────────────────────────────────────
  _cardFrontText.textContent = card.front;
  _cardBackText.textContent  = card.back;

  // ── ARIA: front visible, back hidden ──────────────────────────────────
  _flipCard.querySelector('.flip-card-front').setAttribute('aria-hidden', 'false');
  _flipCard.querySelector('.flip-card-back').setAttribute('aria-hidden', 'true');

  // Re-enable the flip-card so keyboard users can interact
  _flipCard.setAttribute('tabindex', '0');
  _flipCard.setAttribute('aria-label', 'Flashcard – click to flip');

  // ── Update progress bar ───────────────────────────────────────────────
  _updateProgress(snapshot);
}

/**
 * Update the progress indicator.
 * Shows "masteredCount of total" and advances the bar only on unique
 * cards mastered (re-queued cards do not inflate the denominator).
 *
 * @param {{ masteredCount: number, total: number, progressPct: number }} snapshot
 */
function _updateProgress({ masteredCount, total, progressPct }) {
  _progressLabel.textContent    = `${masteredCount} of ${total}`;
  _studyProgressBar.style.width = progressPct + '%';
  _progressBarRole.setAttribute('aria-valuenow', String(progressPct));
}

// ── Private: flip ──────────────────────────────────────────────────────────

/**
 * Flip the card to reveal the back.
 * Only acts on the first flip; subsequent clicks before an answer do nothing.
 */
function _handleFlip() {
  // Ignore if already flipped (user hasn't pressed Again/Got-it yet)
  if (_cardFlipped) return;
  _cardFlipped = true;

  // Trigger CSS 3-D rotation
  _flipCard.classList.add('flipped');

  // Update ARIA so assistive tech reads the back face
  _flipCard.querySelector('.flip-card-front').setAttribute('aria-hidden', 'true');
  _flipCard.querySelector('.flip-card-back').setAttribute('aria-hidden', 'false');
  _flipCard.setAttribute('aria-label', 'Flashcard – showing back');

  // Reveal action buttons
  _studyActions.style.display = 'flex';

  // Move focus to the "Got it" button so keyboard users can answer immediately
  _btnGotIt.focus();
}

// ── Private: Got it / Again ────────────────────────────────────────────────

function _handleGotIt() {
  const result = markGotIt();
  if (result === ROUND_COMPLETE) {
    _showRoundComplete();
  } else {
    _renderCard(result);
  }
}

function _handleAgain() {
  const snapshot = markAgain();
  _renderCard(snapshot);
}

// ── Private: exit ──────────────────────────────────────────────────────────

function _handleExit() {
  endSession();
  showDeckPicker();
}

// ── Private: Study Again ───────────────────────────────────────────────────

function _handleStudyAgain() {
  _startStudySession(_activeDeck);
}

// ── Private: round complete ────────────────────────────────────────────────

function _showRoundComplete() {
  const summary = getRoundSummary();

  _setPanel('complete');

  const totalAttempts = summary.gotItCount + summary.againCount;
  const pct = totalAttempts === 0
    ? 100
    : Math.round((summary.gotItCount / totalAttempts) * 100);

  _roundSummaryText.textContent = summary.perfect
    ? `Perfect round — you knew all ${summary.total} cards! 🌟`
    : `You got ${pct}% of attempts right this round.`;

  _statGotIt.textContent = summary.gotItCount;
  _statAgain.textContent = summary.againCount;
  _statTotal.textContent = summary.total;
}

// ── Utility ────────────────────────────────────────────────────────────────

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
