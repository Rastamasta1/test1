// ── src/listView.js — Deck-Grouped Card List View ─────────────────────────
// Renders all flashcards grouped by deck into #deck-list-container.
// Each card shows front/back text and a delete button.
// Caller must re-render after mutations by calling render() again.

import { getCardsGroupedByDeck, deleteCard } from './cards.js';

// ── DOM refs (resolved once on init) ──────────────────────────────────────
let _container;       // #deck-list-container
let _emptyState;      // #empty-cards-state
let _getCards;        // () => current cards array
let _onCardDeleted;   // (updatedCards: Array) => void

/**
 * Initialise the list view.
 *
 * @param {object} opts
 * @param {() => Array}            opts.getCards       - Returns the current cards array
 * @param {(cards: Array) => void} opts.onCardDeleted  - Called with updated cards after a delete
 */
export function init({ getCards, onCardDeleted }) {
  _getCards      = getCards;
  _onCardDeleted = onCardDeleted;

  _container  = document.getElementById('deck-list-container');
  _emptyState = document.getElementById('empty-cards-state');

  // Single delegated listener for all delete buttons — survives re-renders
  _container.addEventListener('click', _handleDeleteClick);

  // Initial render
  render();
}

/**
 * (Re-)render the full deck list.
 * Call this whenever the cards array changes.
 */
export function render() {
  if (!_container) return; // not yet initialised

  // Remove previous deck groups, keep the empty-state node in the DOM
  _container
    .querySelectorAll('.deck-group')
    .forEach(el => el.remove());

  const grouped = getCardsGroupedByDeck(_getCards());

  if (grouped.length === 0) {
    _emptyState.style.display = '';
    return;
  }

  _emptyState.style.display = 'none';

  for (const group of grouped) {
    _container.appendChild(_buildDeckGroup(group));
  }
}

// ── Private builders ───────────────────────────────────────────────────────

/**
 * Build the DOM subtree for one deck group.
 *
 * @param {{ deckName: string, cards: Array }} group
 * @returns {HTMLElement}
 */
function _buildDeckGroup({ deckName, cards }) {
  const groupEl = document.createElement('div');
  groupEl.className = 'deck-group';
  groupEl.setAttribute('data-deck', deckName);

  // ── Header ──
  const header = document.createElement('div');
  header.className = 'deck-group-header';
  header.innerHTML = `
    <span class="deck-name-badge">
      <span aria-hidden="true">\uD83D\uDDC2\uFE0F</span>
      <span>${_escapeHtml(deckName)}</span>
      <span class="deck-count" aria-label="${cards.length} card${cards.length !== 1 ? 's' : ''}">${cards.length}</span>
    </span>
  `;
  groupEl.appendChild(header);

  // ── Card items ──
  for (const card of cards) {
    groupEl.appendChild(_buildCardItem(card));
  }

  return groupEl;
}

/**
 * Build the DOM element for one flashcard row.
 *
 * @param {{ id: string, front: string, back: string }} card
 * @returns {HTMLElement}
 */
function _buildCardItem(card) {
  const item = document.createElement('div');
  item.className = 'flashcard-item';
  item.setAttribute('data-id', card.id);

  item.innerHTML = `
    <div class="flashcard-texts">
      <div class="flashcard-front">${_escapeHtml(card.front)}</div>
      <div class="flashcard-back">${_escapeHtml(card.back)}</div>
    </div>
    <div class="flashcard-actions">
      <button
        class="btn btn-danger btn-delete"
        data-id="${_escapeAttr(card.id)}"
        aria-label="Delete card: ${_escapeAttr(card.front)}"
        title="Delete this card"
      >
        \uD83D\uDDD1 Delete
      </button>
    </div>
  `;

  return item;
}

// ── Event handlers ─────────────────────────────────────────────────────────

/**
 * Delegated click handler on #deck-list-container.
 * Only acts when a .btn-delete is clicked (or a descendant of one).
 *
 * @param {MouseEvent} e
 */
function _handleDeleteClick(e) {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  if (!id) return;

  // Optimistic animated removal before re-render
  const item = _container.querySelector(`.flashcard-item[data-id="${CSS.escape(id)}"]`);
  if (item) {
    item.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(8px)';
  }

  // Short delay matches the CSS transition, then commit the delete
  setTimeout(() => {
    let updatedCards;
    try {
      updatedCards = deleteCard(_getCards(), id);
    } catch (err) {
      console.warn('[listView] deleteCard failed:', err);
      // Re-render to restore consistent state
      render();
      return;
    }
    _onCardDeleted(updatedCards);
    render();
  }, 180);
}

// ── Escape helpers ─────────────────────────────────────────────────────────

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function _escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}
