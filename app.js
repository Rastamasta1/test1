// ── app.js — UI Controller ─────────────────────────────────────────────────
import { loadCards, seedSampleDeck } from './src/storage.js';
import {
  getDeckNames,
  getCardsByDeck,
} from './src/cards.js';
import { init as initForm, refreshDeckSuggestions } from './src/formView.js';
import { init as initList, render as renderList } from './src/listView.js';
import { init as initStudy, showDeckPicker } from './src/studyView.js';

// ── Bootstrap ──────────────────────────────────────────────────────────────
// Seed sample data on very first load, then read whatever is stored.
seedSampleDeck();
let cards = loadCards();

// ── DOM refs ───────────────────────────────────────────────────────────────
const tabCards  = document.getElementById('tab-cards');
const tabStudy  = document.getElementById('tab-study');
const cardsView = document.getElementById('cards-view');
const studyView = document.getElementById('study-view');

// ── Tabs ───────────────────────────────────────────────────────────────────
function activateTab(tab) {
  const isCards = tab === 'cards';

  tabCards.classList.toggle('active', isCards);
  tabCards.setAttribute('aria-selected', String(isCards));
  cardsView.classList.toggle('active', isCards);

  tabStudy.classList.toggle('active', !isCards);
  tabStudy.setAttribute('aria-selected', String(!isCards));
  studyView.classList.toggle('active', !isCards);

  // When the Study tab becomes active, re-render the deck picker
  // so it always reflects the latest card data.
  if (!isCards) showDeckPicker();
}

tabCards.addEventListener('click', () => activateTab('cards'));
tabStudy.addEventListener('click', () => activateTab('study'));

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

// Study view: pass a live getter so it always sees current cards
initStudy({
  getCards: () => cards,
});

// ── Initial renders ────────────────────────────────────────────────────────
refreshDeckSuggestions();
renderList();
// Study tab starts hidden; showDeckPicker() is called on tab activation.
