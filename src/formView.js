// ── src/formView.js — Add-Card Form View ──────────────────────────────────
// Manages the add-card form: validation, deck autocomplete, submit handling.
// Receives a cards array ref via init() and calls back on successful add.

import { validateCard, addCard, getDeckNames } from './cards.js';

// ── DOM refs (resolved once on init) ──────────────────────────────────────
let _inputDeck, _inputFront, _inputBack;
let _errorDeck, _errorFront, _errorBack;
let _deckSuggestions;
let _onCardAdded; // callback(updatedCards)
let _getCards;    // getter fn () => currentCards

/**
 * Initialise the form view.
 *
 * @param {object} opts
 * @param {() => Array}    opts.getCards     - Returns the current cards array
 * @param {(cards: Array) => void} opts.onCardAdded - Called with updated cards after a successful add
 */
export function init({ getCards, onCardAdded }) {
  _getCards    = getCards;
  _onCardAdded = onCardAdded;

  _inputDeck       = document.getElementById('input-deck');
  _inputFront      = document.getElementById('input-front');
  _inputBack       = document.getElementById('input-back');
  _errorDeck       = document.getElementById('error-deck');
  _errorFront      = document.getElementById('error-front');
  _errorBack       = document.getElementById('error-back');
  _deckSuggestions = document.getElementById('deck-suggestions');

  const form = document.getElementById('add-card-form');
  form.addEventListener('submit', _handleSubmit);

  // Clear per-field error as soon as the user types — immediate feedback
  _inputDeck.addEventListener('input',  () => _clearFieldError(_inputDeck,  _errorDeck));
  _inputFront.addEventListener('input', () => _clearFieldError(_inputFront, _errorFront));
  _inputBack.addEventListener('input',  () => _clearFieldError(_inputBack,  _errorBack));

  // Initial datalist population
  refreshDeckSuggestions();
}

/**
 * Refresh the <datalist> with current deck names.
 * Call this whenever the cards array changes.
 */
export function refreshDeckSuggestions() {
  if (!_deckSuggestions) return;
  const names = getDeckNames(_getCards());
  _deckSuggestions.innerHTML = names
    .map(n => `<option value="${_escapeAttr(n)}"></option>`)
    .join('');
}

// ── Private helpers ────────────────────────────────────────────────────────

function _handleSubmit(e) {
  e.preventDefault();

  const deck  = _inputDeck.value;
  const front = _inputFront.value;
  const back  = _inputBack.value;

  // Validate all fields — returns { deck, front, back } where non-empty string = error message
  const errors  = validateCard({ deck, front, back });
  const hasError = errors.deck || errors.front || errors.back;

  _setFieldError(_inputDeck,  _errorDeck,  errors.deck);
  _setFieldError(_inputFront, _errorFront, errors.front);
  _setFieldError(_inputBack,  _errorBack,  errors.back);

  if (hasError) {
    // Focus the first field that has an error so the user knows where to look
    if (errors.deck)       _inputDeck.focus();
    else if (errors.front) _inputFront.focus();
    else                   _inputBack.focus();
    return;
  }

  let updatedCards;
  try {
    const result = addCard(_getCards(), { deck, front, back });
    updatedCards = result.cards;
  } catch (err) {
    // Defensive — validation above should prevent this, but surface it if it occurs
    _setFieldError(_inputFront, _errorFront, err.message);
    return;
  }

  // Keep deck name for convenience; clear front & back for rapid entry
  _inputFront.value = '';
  _inputBack.value  = '';
  _clearAllErrors();

  _onCardAdded(updatedCards);
  refreshDeckSuggestions();

  // Return focus to front field so user can quickly add another card
  _inputFront.focus();
}

/**
 * Show or clear a field-level error.
 *
 * @param {HTMLElement} inputEl  - The input/textarea element
 * @param {HTMLElement} errorEl  - The sibling error <span>
 * @param {string}      message  - Non-empty = error; empty string = clear
 */
function _setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add('error');
    errorEl.textContent = '\u26A0 ' + message;
    errorEl.classList.add('visible');
    // ARIA: ensure screen readers announce the inline error
    errorEl.setAttribute('role', 'alert');
  } else {
    inputEl.classList.remove('error');
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
  }
}

/**
 * Clear error state for a single field (called on user input).
 *
 * @param {HTMLElement} inputEl
 * @param {HTMLElement} errorEl
 */
function _clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('error');
  errorEl.classList.remove('visible');
  errorEl.textContent = '';
}

/** Clear all three field errors at once (e.g. after successful submit). */
function _clearAllErrors() {
  _clearFieldError(_inputDeck,  _errorDeck);
  _clearFieldError(_inputFront, _errorFront);
  _clearFieldError(_inputBack,  _errorBack);
}

function _escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}
