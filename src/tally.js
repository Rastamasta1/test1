/**
 * src/tally.js — prints a tally of the store's records.
 *
 * Reads the existing store (src/store.js), which itself seeds from
 * data/fixtures.json, and reports:
 *   - the count of records
 *   - the sum of their quantities
 *
 * Because tally() reads store.list() live on each call, the summed
 * quantity reflects any adjust() mutation applied to the store, and is
 * unchanged by search() (a non-mutating read).
 *
 * Exports:
 *   tally() → { count: number, totalQuantity: number }
 */

import { list } from './store.js';

/**
 * Compute the current record count and summed quantity from the store.
 * @returns {{count:number, totalQuantity:number}}
 */
export function tally() {
  const records = list();
  const count = records.length;
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  return { count, totalQuantity };
}

// ── Main block: print the tally when run directly ──────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const { count, totalQuantity } = tally();
  console.log(`Record count: ${count}`);
  console.log(`Summed quantity: ${totalQuantity}`);
}
