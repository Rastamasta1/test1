// storage.js — pure ES module for persisting the last-used conversion pair

const STORAGE_KEY = 'unitConverter_lastPair';

/**
 * Save the last-used pair to localStorage.
 * @param {{ type: string, from: string, to: string }} pair
 */
export function saveLastPair(pair) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
  } catch (_) {
    // localStorage may be unavailable (private mode, quota, etc.)
  }
}

/**
 * Load the last-used pair from localStorage.
 * Returns null if nothing is saved or data is invalid.
 * @returns {{ type: string, from: string, to: string } | null}
 */
export function loadLastPair() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.type === 'string' &&
      typeof parsed.from === 'string' &&
      typeof parsed.to === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch (_) {
    return null;
  }
}
