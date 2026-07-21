// ── Storage module ──────────────────────────────────────────────────────────
// Persists flashcard data to localStorage under a fixed key.
// Each flashcard object shape: { id, deck, front, back, createdAt }

export const STORAGE_KEY = 'flashcards_app_v1';

// ── Sample deck shown on very first load ──────────────────────────────────
const SAMPLE_CARDS = [
  { deck: 'Sample Deck', front: 'What is the capital of France?',      back: 'Paris' },
  { deck: 'Sample Deck', front: 'What is 7 × 8?',                      back: '56' },
  { deck: 'Sample Deck', front: 'What language does a browser run?',   back: 'JavaScript' },
  { deck: 'Sample Deck', front: 'How many sides does a hexagon have?', back: '6' },
  { deck: 'Sample Deck', front: 'What is H₂O commonly known as?',     back: 'Water' },
];

/**
 * Load all flashcards from localStorage.
 * @returns {Array<{id: string, deck: string, front: string, back: string, createdAt: number}>}
 */
export function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Guard: must be an array
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    // Corrupted data — return empty rather than crash
    return [];
  }
}

/**
 * Save the full flashcards array to localStorage.
 * @param {Array<{id: string, deck: string, front: string, back: string, createdAt: number}>} cards
 */
export function saveCards(cards) {
  if (!Array.isArray(cards)) {
    throw new TypeError('saveCards expects an array');
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    // e.g. storage quota exceeded — silently ignore so app keeps running
    console.warn('[storage] Could not persist cards:', e);
  }
}

/**
 * Add a single card. Generates a unique id and timestamp.
 * Returns the updated cards array.
 * @param {Array} cards  Existing cards array
 * @param {{ deck: string, front: string, back: string }} cardData
 * @returns {Array}
 */
export function addCard(cards, { deck, front, back }) {
  const newCard = {
    id: generateId(),
    deck: deck.trim(),
    front: front.trim(),
    back: back.trim(),
    createdAt: Date.now(),
  };
  const updated = [...cards, newCard];
  saveCards(updated);
  return updated;
}

/**
 * Delete a card by id.
 * Returns the updated cards array.
 * @param {Array} cards
 * @param {string} id
 * @returns {Array}
 */
export function deleteCard(cards, id) {
  const updated = cards.filter(c => c.id !== id);
  saveCards(updated);
  return updated;
}

/**
 * Return all unique deck names, sorted alphabetically.
 * @param {Array} cards
 * @returns {string[]}
 */
export function getDeckNames(cards) {
  const names = new Set(cards.map(c => c.deck));
  return [...names].sort((a, b) => a.localeCompare(b));
}

/**
 * Return cards belonging to a specific deck.
 * @param {Array} cards
 * @param {string} deckName
 * @returns {Array}
 */
export function getCardsByDeck(cards, deckName) {
  return cards.filter(c => c.deck === deckName);
}

/**
 * Seed the sample deck into localStorage if it is currently empty.
 * Safe to call on every startup — it is a no-op when cards already exist.
 *
 * @returns {Array} The cards array after seeding (may be the original empty array
 *                  that got populated, or the existing non-empty array untouched).
 */
export function seedSampleDeck() {
  // Only seed when the key is completely absent from storage
  if (localStorage.getItem(STORAGE_KEY) !== null) {
    // Storage already has data (even if the user deleted all cards later —
    // we respect their intent and do not re-inject the sample deck).
    return loadCards();
  }

  let cards = [];
  // Use a fixed base timestamp so createdAt ordering matches SAMPLE_CARDS order
  const baseTime = Date.now();
  SAMPLE_CARDS.forEach((c, i) => {
    const newCard = {
      id: generateId(),
      deck: c.deck,
      front: c.front,
      back: c.back,
      createdAt: baseTime + i, // ensure stable insertion order
    };
    cards = [...cards, newCard];
  });

  saveCards(cards);
  return cards;
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Generate a simple unique id (timestamp + random suffix).
 * @returns {string}
 */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
