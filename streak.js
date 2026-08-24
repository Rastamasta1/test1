/**
 * streak.js — pure streak-length calculation for Would You Rather.
 *
 * Exports:
 *   longestStreak(choices) — length of the longest run of consecutive
 *   identical entries in an array of 'a'/'b' strings. Empty array → 0.
 */

export function longestStreak(choices) {
  if (!Array.isArray(choices) || choices.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < choices.length; i++) {
    if (choices[i] === choices[i - 1]) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }

  return longest;
}
