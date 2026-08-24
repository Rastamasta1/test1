/**
 * seededShuffle.js — pure deterministic Fisher-Yates shuffle.
 *
 * Exports:
 *   seededShuffle(arr, seed) → new array, same elements as arr, shuffled
 *   deterministically from seed (no Math.random; LCG-driven).
 */

function lcgNext(state) {
  // Numerical Recipes LCG constants; 32-bit unsigned via >>> 0.
  return (Math.imul(1664525, state) + 1013904223) >>> 0;
}

export function seededShuffle(arr, seed) {
  const a = arr.slice();
  let state = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    state = lcgNext(state);
    const j = state % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
