/**
 * scripts/tally-demo.js — demonstrates src/tally.js against src/store.js.
 *
 * Runs two scenarios against the live store (seeded from data/fixtures.json):
 *   1. Apply a store adjustment (adjust()) — the tally's summed quantity
 *      must change, and the assertion below fails loudly if it does not.
 *   2. Run a store search (search()) — a non-mutating read — and confirm
 *      the tally's summed quantity is unchanged from the post-adjustment value.
 *
 * Usage:
 *   node --env-file=.env scripts/tally-demo.js
 *   (no env vars are actually required by src/store.js or src/tally.js;
 *   --env-file is only needed if this script is later wired into the worker)
 */

import assert from 'node:assert/strict';
import { adjust, search } from '../src/store.js';
import { tally } from '../src/tally.js';

function printTally(label) {
  const { count, totalQuantity } = tally();
  console.log(`[${label}] Record count: ${count} — Summed quantity: ${totalQuantity}`);
  return totalQuantity;
}

console.log('=== tally-demo ===');

const before = printTally('before adjustment');

// Fixture id 1 (Copper Kettle) starts at quantity 12 — raising by 5 keeps it
// well clear of the adjust() below-zero guard, so this adjustment always applies.
adjust(1, 5);

const afterAdjust = printTally('after adjustment');
assert.notEqual(
  afterAdjust,
  before,
  'expected the printed summed quantity to change after a store adjustment'
);
console.log('OK: summed quantity changed after adjustment');

// search() is a non-mutating read — it must not move the tally at all.
search('Basket');

const afterSearch = printTally('after search');
assert.equal(
  afterSearch,
  afterAdjust,
  'expected the printed summed quantity to stay unchanged after a store search'
);
console.log('OK: summed quantity unchanged after search');

console.log('=== tally-demo: all assertions passed ===');
