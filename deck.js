/**
 * deck.js — deck building and shuffling for Would You Rather.
 *
 * Exports:
 *   shuffle(arr, seed?) — pure Fisher-Yates shuffle; returns a new array. When a
 *                          numeric seed is supplied, output is deterministic (same
 *                          arr + seed always yields the same order); omitted, uses Math.random()
 *   buildDeck()    — returns all questions (built-ins + custom) in randomized order
 */

import { getQuestions } from './storage.js';

/**
 * mulberry32 — small, fast deterministic PRNG.
 * Given a numeric seed, returns a function that yields a new
 * pseudo-random number in the range [0, 1) on each call.
 *
 * @param {number} seed
 * @returns {Function} generator — call repeatedly for successive values in [0,1)
 */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle — pure function, does not mutate the input array.
 * Accepts an optional seed parameter: when omitted, randomness comes from
 * Math.random() exactly as before. When a numeric seed is given, randomness
 * comes from a deterministic mulberry32 PRNG initialised from that seed, so
 * repeated calls with the same arr and the same seed return an array with
 * an identical element order.
 *
 * @param {Array} arr
 * @param {number} [seed] - optional seed; when provided, shuffle order is deterministic
 * @returns {Array} new shuffled array
 */
export function shuffle(arr, seed) {
  const a = [...arr];
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a full randomized deck for the current session.
 * Combines built-in questions with any user-added custom questions,
 * then returns them in a freshly shuffled order.
 *
 * @returns {Array<{id:string, optionA:string, optionB:string, builtin:boolean}>}
 */
export function buildDeck() {
  return shuffle(getQuestions());
}
