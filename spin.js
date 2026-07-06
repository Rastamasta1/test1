// spin.js — Generate a 3x3 reel outcome from weighted symbol strips for Lucky Reels
// Pure logic, no UI. Uses the seedable RNG from rng.js and the weight data in
// paytable.js. Each of the REELS reels independently draws ROWS symbols from the
// SAME weighted distribution (matching the analytic RTP model in paytable.js).

import { defaultRng } from './rng.js';
import { SYMBOL_IDS, REEL_WEIGHTS, REELS, ROWS } from './paytable.js';

// Draw a single symbol id from the weighted distribution.
export function drawSymbol(rng = defaultRng) {
  return rng.weightedPick(SYMBOL_IDS, REEL_WEIGHTS);
}

// Generate a reel-major grid: grid[reel][row] = symbolId.
// This is the canonical outcome shape consumed by evaluate.js (evaluateOutcome).
export function spinReels(rng = defaultRng) {
  const grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    grid[reel] = [];
    for (let row = 0; row < ROWS; row++) {
      grid[reel][row] = drawSymbol(rng);
    }
  }
  return grid;
}

// Generate a flat row-major array of length REELS*ROWS.
// index = row * REELS + reel. Matches a 3x3 grid rendered row by row and is
// directly consumable by evaluate.js's evaluateFlat / evaluateSpin.
export function spinFlat(rng = defaultRng) {
  return gridToFlat(spinReels(rng));
}

// Convert a reel-major grid[reel][row] into a flat row-major array.
export function gridToFlat(grid) {
  const cells = new Array(REELS * ROWS);
  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      cells[row * REELS + reel] = grid[reel][row];
    }
  }
  return cells;
}

// Convert a flat row-major array back into a reel-major grid[reel][row].
export function flatToGrid(cells) {
  if (!Array.isArray(cells) || cells.length !== REELS * ROWS) {
    throw new Error('flatToGrid expects a flat array of length ' + REELS * ROWS);
  }
  const grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    grid[reel] = [];
    for (let row = 0; row < ROWS; row++) {
      grid[reel][row] = cells[row * REELS + reel];
    }
  }
  return grid;
}

// Convenience: perform a spin and return BOTH representations plus the raw rng
// draws, so the UI can drive per-reel staggered stop animations if desired.
export function spin(rng = defaultRng) {
  const grid = spinReels(rng);
  return {
    grid,               // grid[reel][row]
    flat: gridToFlat(grid), // row-major flat length 9
  };
}
