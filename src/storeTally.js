/**
 * src/storeTally.js — record count and summed quantities for round-trip comparison.
 *
 * Exports:
 *   tallyStore(store) → { count: number, totalQuantity: number }
 *
 * `store` may be:
 *   - a store-like object exposing `list()` (e.g. `import * as store from
 *     './store.js'`), in which case `store.list()` is called to obtain the
 *     live records, or
 *   - a plain array of record objects, passed directly.
 *
 * This exists so a round-trip demo (export the store to a file, import that
 * file into a second, empty store) can print a tally of each store and
 * compare them: tallyStore(sourceStore) before export must equal
 * tallyStore(importedStore) after import for the round-trip to be proven
 * exact, not just "ran without throwing".
 *
 * Pure and read-only: it never mutates the store or records passed in.
 */

/**
 * Compute the record count and summed quantity for the given store.
 *
 * @param {{list: () => object[]} | object[]} store - a store-like object
 *   with a `list()` method, or a plain array of records.
 * @returns {{count:number, totalQuantity:number}}
 */
export function tallyStore(store) {
  const records = Array.isArray(store)
    ? store
    : (typeof store?.list === 'function' ? store.list() : []);

  const count = records.length;
  const totalQuantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  return { count, totalQuantity };
}
