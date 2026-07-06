// evaluate.js — Pure win-evaluation logic for Lucky Reels
// No UI, no side effects. Given a spun 3x3 grid + bet, returns total win and
// the list of winning paylines (with per-line detail for highlighting).
//
// PAYOUT MODEL (matches paytable.js RTP model)
// -------------------------------------------
// The total `bet` is split evenly across all paylines (bet / PAYLINE_COUNT per
// line). A payline wins when all 3 of its cells show the SAME symbol id.
// A winning line pays (bet / PAYLINE_COUNT) * multiplier(symbol).
// Overall RTP therefore equals the per-line expected return (95%).

import {
  PAYLINES,
  PAYLINE_COUNT,
  PAYTABLE,
  SYMBOL_BY_ID,
  REELS,
  ROWS,
} from './paytable.js';
import { getLineSymbolIds, getLineCellIndices } from './paylines.js';

// The per-line stake given a total bet.
export function lineBet(bet) {
  return bet / PAYLINE_COUNT;
}

// Evaluate a single payline against a reel-major grid (grid[reel][row]).
// Returns a winning-line detail object, or null if the line does not win.
export function evaluateLine(grid, payline, bet) {
  const ids = getLineSymbolIds(grid, payline);
  const first = ids[0];
  // All cells must match the first symbol id.
  for (let i = 1; i < ids.length; i++) {
    if (ids[i] !== first) return null;
  }
  const multiplier = PAYTABLE[first] || 0;
  if (multiplier <= 0) return null;
  const win = lineBet(bet) * multiplier;
  return {
    lineId: payline.id,
    name: payline.name,
    symbolId: first,
    symbol: SYMBOL_BY_ID[first] || null,
    multiplier,
    win,
    // linear grid indices (row-major) for the UI to highlight cells.
    cellIndices: getLineCellIndices(payline),
    // [reel,row] pairs along the line.
    cells: payline.cells.map((row, reel) => [reel, row]),
  };
}

// Evaluate an outcome given as a reel-major grid: grid[reel][row] = symbolId.
// Returns { totalWin, winningLines, lineBet, bet }.
export function evaluateOutcome(grid, bet) {
  const winningLines = [];
  let totalWin = 0;
  for (const payline of PAYLINES) {
    const result = evaluateLine(grid, payline, bet);
    if (result) {
      winningLines.push(result);
      totalWin += result.win;
    }
  }
  return {
    bet,
    lineBet: lineBet(bet),
    totalWin,
    winningLines,
  };
}

// Convenience: accept a row-major flat array of length REELS*ROWS
// (index = row * REELS + reel) and evaluate it. Useful when the UI keeps the
// grid as a flat 9-element array laid out row by row.
export function evaluateFlat(cells, bet) {
  if (!Array.isArray(cells) || cells.length !== REELS * ROWS) {
    throw new Error('evaluateFlat expects a flat array of length ' + REELS * ROWS);
  }
  // Rebuild reel-major grid[reel][row].
  const grid = [];
  for (let reel = 0; reel < REELS; reel++) {
    grid[reel] = [];
    for (let row = 0; row < ROWS; row++) {
      grid[reel][row] = cells[row * REELS + reel];
    }
  }
  return evaluateOutcome(grid, bet);
}

// Top-level alias used by the UI: evaluate a spin outcome.
// Accepts either a reel-major 2D grid or a flat row-major array.
export function evaluateSpin(outcome, bet) {
  if (Array.isArray(outcome) && outcome.length === REELS * ROWS && !Array.isArray(outcome[0])) {
    return evaluateFlat(outcome, bet);
  }
  return evaluateOutcome(outcome, bet);
}
