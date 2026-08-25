/**
 * dedupe.js — pure array deduplication by derived key.
 *
 * Exports:
 *   dedupeBy(arr, keyFn) — returns a new array keeping only the FIRST
 *   element for each distinct keyFn(element) value, original order
 *   preserved. Does not mutate the input array.
 */

export function dedupeBy(arr, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
