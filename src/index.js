// ── src/index.js — Main Entry Point ──────────────────────────────────────
// Imports all modules, initialises tab switching, and starts the app.
// This file mirrors app.js (which index.html loads directly) but lives
// inside src/ so it can be imported or tested independently.
//
// Module responsibilities:
//   storage.js   — localStorage read/write, seedSampleDeck
//   cards.js     — pure card/deck operations (add, delete, group, shuffle)
//   formView.js  — add-card form validation & submission UI
//   listView.js  — deck-grouped card list rendering
//   study.js     — pure study-session state machine
//   studyView.js — study tab UI (deck picker, flip card, round summary)

import { loadCards, seedSampleDeck } from './storage.js';
import { getDeckNames, getCardsByDeck } from './cards.js';
import { init as initForm, refreshDeckSuggestions } from './formView.js';
import { init as initList, render as renderList } from './listView.js';
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
import { init as initStudy, showDeckPicker } from './studyView.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────
// Seed sample data on very first load, then read whatever is stored.
seedSampleDeck();
let cards = loadCards();

// ── DOM refs ──────────────────────────────────────────────────────────────
const tabCards  = document.getElementById('tab-cards');
const tabStudy  = document.getElementById('tab-study');
const cardsView = document.getElementById('cards-view');
const studyView = document.getElementById('study-view');

// ── Tab switching ──────────────────────────────────────────────────────────

/**
 * Activate either the 'cards' or 'study' tab.
 * Updates ARIA attributes, shows/hides panels, and triggers a
 * deck-picker refresh whenever the Study tab becomes visible.
 *
 * @param {'cards'|'study'} tab
 */
function activateTab(tab) {
  const isCards = tab === 'cards';

  tabCards.classList.toggle('active', isCards);
  tabCards.setAttribute('aria-selected', String(isCards));
  cardsView.classList.toggle('active', isCards);

  tabStudy.classList.toggle('active', !isCards);
  tabStudy.setAttribute('aria-selected', String(!isCards));
  studyView.classList.toggle('active', !isCards);

  // Always refresh the deck picker when switching to Study so it
  // reflects any cards added/deleted while on the Cards tab.
  if (!isCards) showDeckPicker();
}

tabCards.addEventListener('click', () => activateTab('cards'));
tabStudy.addEventListener('click', () => activateTab('study'));

// Keyboard navigation: arrow keys move between tabs (ARIA tabs pattern)
[tabCards, tabStudy].forEach((btn, idx, arr) => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = arr[(idx + (e.key === 'ArrowRight' ? 1 : arr.length - 1)) % arr.length];
      next.focus();
      next.click();
    }
  });
});

// ── Initialise views ───────────────────────────────────────────────────────

// Form view: on successful card add, update shared state and re-render list
initForm({
  getCards: () => cards,
  onCardAdded(updatedCards) {
    cards = updatedCards;
    renderList();
    refreshDeckSuggestions();
  },
});

// List view: on card delete, update shared state and refresh deck suggestions
initList({
  getCards: () => cards,
  onCardDeleted(updatedCards) {
    cards = updatedCards;
    refreshDeckSuggestions();
  },
});

// Study view: pass a live getter so it always sees the current cards array
initStudy({
  getCards: () => cards,
});

// ── Initial renders ────────────────────────────────────────────────────────
refreshDeckSuggestions();
renderList();
// Study tab starts hidden; showDeckPicker() fires on first tab activation.

// ── Named exports for lightweight unit-test access ─────────────────────────
// Tests can import { activateTab } from './index.js' without a full DOM.
export { activateTab };
