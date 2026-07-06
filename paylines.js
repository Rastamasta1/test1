// paylines.js — Payline coordinate maps + helpers for Lucky Reels
// Builds on the canonical PAYLINES data defined in paytable.js.
// Pure data + helpers, no UI, no dependencies (besides paytable.js).

import { PAYLINES, PAYLINE_COUNT, REELS, ROWS } from './paytable.js';

// Re-export the canonical payline definitions so consumers can import
// everything payline-related from this single module if they prefer.
export { PAYLINES, PAYLINE_COUNT };

// Distinct gold/gem accent colors for visually highlighting each line.
// Index matches payline id (0..4).
export const PAYLINE_COLORS = [
  '#ffd54a', // Top Row     — bright gold
  '#4ade80', // Middle Row  — emerald green
  '#ff6b6b', // Bottom Row  — ruby red
  '#5ac8fa', // Diagonal \u2198 — sky/diamond
  '#c084fc', // Diagonal \u2197 — amethyst
];

// Get the color for a payline id (falls back to gold).
export function lineColor(id) {
  return PAYLINE_COLORS[id] || '#ffd54a';
}

// Convert a payline into explicit [reel, row] coordinate pairs.
// PAYLINES store `cells` as [reel0Row, reel1Row, reel2Row]; this maps them
// to full grid coordinates useful for the UI to locate/highlight cells.
//   returns e.g. [[0,0],[1,1],[2,2]] for the \u2198 diagonal.
export function getLineCells(payline) {
  return payline.cells.map((row, reel) => [reel, row]);
}

// Same as getLineCells but by payline id.
export function getLineCellsById(id) {
  const pl = PAYLINES.find((p) => p.id === id);
  return pl ? getLineCells(pl) : [];
}

// Flatten a payline's cells into linear grid indices (row-major:
// index = row * REELS + reel), matching a 3x3 grid rendered row by row.
export function getLineCellIndices(payline) {
  return payline.cells.map((row, reel) => row * REELS + reel);
}

// Extract the symbol ids sitting on a payline for a given grid.
// `grid` is a 2D array grid[reel][row] of symbol ids (as produced by the
// spin logic). Returns the 3 symbol ids along the line, in reel order.
export function getLineSymbolIds(grid, payline) {
  return payline.cells.map((row, reel) => grid[reel][row]);
}

// Convenience: total number of grid cells.
export const GRID_CELL_COUNT = REELS * ROWS;
