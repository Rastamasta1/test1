// ── Cards module ────────────────────────────────────────────────────────────
// Pure functions that operate on an in-memory cards array.
// All mutations return a NEW array — never mutate in place.
// Persistence is handled by the caller via src/storage.js.

import { addCard as storageAdd, deleteCard as storageDelete, getDeckNames, getCardsByDeck } from './storage.js';

// ── Re-export storage helpers so callers only need one import ────────────────
export { getDeckNames, getCardsByDeck };

/**
 * Add a new flashcard to the array.
 * Delegates id generation and persistence to storage.js.
 *
 * @param {Array}  cards     - Current cards array
 * @param {{ deck: string, front: string, back: string }} data
 * @returns {{ cards: Array, card: Object }} Updated array + the new card
 */
export function addCard(cards, { deck, front, back }) {
  if (!deck || !deck.trim()) throw new Error('Deck name is required.');
  if (!front || !front.trim()) throw new Error('Front text is required.');
  if (!back || !back.trim()) throw new Error('Back text is required.');

  // storageAdd persists and returns the updated array
  const updated = storageAdd(cards, { deck, front, back });
  const card = updated[updated.length - 1];
  return { cards: updated, card };
}

/**
 * Delete a card by id.
 *
 * @param {Array}  cards - Current cards array
 * @param {string} id    - Card id to remove
 * @returns {Array} Updated cards array
 */
export function deleteCard(cards, id) {
  if (!id) throw new Error('Card id is required.');
  return storageDelete(cards, id);
}

/**
 * Group cards by deck, sorted alphabetically by deck name.
 * Cards within each group are sorted by createdAt (oldest first).
 *
 * @param {Array} cards
 * @returns {Array<{ deckName: string, cards: Array }>}
 */
export function getCardsGroupedByDeck(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return [];

  // Build a Map keyed by deck name
  const map = new Map();
  for (const card of cards) {
    const key = card.deck;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(card);
  }

  // Sort deck names alphabetically
  const sortedKeys = [...map.keys()].sort((a, b) => a.localeCompare(b));

  return sortedKeys.map(deckName => ({
    deckName,
    cards: map.get(deckName).slice().sort((a, b) => a.createdAt - b.createdAt),
  }));
}

/**
 * Return a shuffled copy of the given cards array for study mode.
 * Uses a Fisher-Yates shuffle so every permutation is equally likely.
 *
 * @param {Array} cards
 * @param {(() => number)} [rng=Math.random]  Optional RNG for testability
 * @returns {Array} New shuffled array (original untouched)
 */
export function shuffleDeck(cards, rng = Math.random) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Validate card fields without creating a card.
 * Returns an object of field -> error message (empty means valid).
 *
 * @param {{ deck: string, front: string, back: string }} data
 * @returns {{ deck: string, front: string, back: string }}
 */
export function validateCard({ deck = '', front = '', back = '' }) {
  return {
    deck:  deck.trim()  ? '' : 'Deck name is required.',
    front: front.trim() ? '' : 'Front text is required.',
    back:  back.trim()  ? '' : 'Back text is required.',
  };
}
