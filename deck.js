/**
 * deck.js — deck building and shuffling for Would You Rather.
 *
 * Exports:
 *   shuffle(arr)   — pure Fisher-Yates shuffle; returns a new array
 *   buildDeck()    — returns all questions (built-ins + custom) in randomized order
 */

import { getQuestions } from './storage.js';

/**
 * Fisher-Yates shuffle — pure function, does not mutate the input array.
 * Accepts an optional seed parameter (ignored in this browser implementation;
 * present so unit tests can document the interface).
 *
 * @param {Array} arr
 * @returns {Array} new shuffled array
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
