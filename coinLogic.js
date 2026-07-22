// coinLogic.js — pure, importable coin-flip logic module
// No DOM, no side-effects; accepts an optional seed for testing.

export const HEADS = 'heads';
export const TAILS = 'tails';

/** Target probability: 50 % heads, 50 % tails (fair coin). */
export const TARGET_RTP = 0.5;

/**
 * Returns 'heads' or 'tails'.
 * @param {() => number} [rng] - optional RNG function returning [0, 1);
 *                               defaults to Math.random for production use.
 */
export function flipCoin(rng = Math.random) {
  return rng() < TARGET_RTP ? HEADS : TAILS;
}
