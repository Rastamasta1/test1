/**
 * src/roundTripDemo.js — demonstrates export→import round-trip fidelity.
 *
 * Exports:
 *   roundTripDemo() → { before: {count,totalQuantity}, after: {count,totalQuantity} }
 *
 * Reads the live store (src/store.js, seeded from data/fixtures.json),
 * exports it to a JSON file via storeSerialize.exportStore, then imports
 * that file's contents into a fresh, empty in-memory store and tallies
 * both (via storeTally.tallyStore) so the before/after counts and summed
 * quantities can be compared — printed to the console and asserted equal,
 * proving the round-trip reproduces every record and quantity exactly.
 *
 * This module owns only the demo/orchestration: it reuses exportStore and
 * tallyStore rather than reimplementing serialization or tallying, and it
 * does not touch src/store.js's own state (a separate, freshly-created
 * plain object stands in for the "empty store" that receives the import).
 */

import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import * as store from './store.js';
import { exportStore } from './storeSerialize.js';
import { tallyStore } from './storeTally.js';

/**
 * Run the export → import round-trip demo end-to-end.
 *
 * @returns {{before: {count:number,totalQuantity:number}, after: {count:number,totalQuantity:number}}}
 */
export function roundTripDemo() {
  // Tally the live, populated store BEFORE export.
  const before = tallyStore(store);
  console.log(`[round-trip] before export — count: ${before.count}, totalQuantity: ${before.totalQuantity}`);

  // Export the live store to a JSON file on disk.
  const json = exportStore(store);
  const dir = mkdtempSync(path.join(tmpdir(), 'wyr-roundtrip-'));
  const filePath = path.join(dir, 'store-export.json');
  writeFileSync(filePath, json, 'utf8');
  console.log(`[round-trip] exported store to ${filePath}`);

  // Import that file's contents into a brand-new, empty store.
  const importedRecords = JSON.parse(readFileSync(filePath, 'utf8'));
  const emptyStore = {
    records: [],
    list() {
      return this.records;
    },
  };
  importedRecords.forEach(r => emptyStore.records.push(r));

  // Tally the freshly-imported store AFTER import.
  const after = tallyStore(emptyStore);
  console.log(`[round-trip] after import  — count: ${after.count}, totalQuantity: ${after.totalQuantity}`);

  assert.equal(after.count, before.count, 'round-trip record count must match');
  assert.equal(after.totalQuantity, before.totalQuantity, 'round-trip summed quantity must match');
  console.log('[round-trip] OK: tallies are equal before export and after import');

  return { before, after };
}

// ── Main block: run the demo when this file is executed directly ─────────
if (import.meta.url === `file://${process.argv[1]}`) {
  roundTripDemo();
}
