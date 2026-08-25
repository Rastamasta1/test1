/**
 * src/storeSerialize.js — round-trip export for the store.
 *
 * Exports:
 *   exportStore(store) → string   serializes every record (all fields,
 *                                  including quantity) to a JSON string
 *
 * `store` may be:
 *   - a store-like object exposing `list()` (e.g. `import * as store from
 *     './store.js'`), in which case `store.list()` is called to obtain the
 *     live records, or
 *   - a plain array of record objects, passed directly.
 *
 * This is intentionally a pure, one-directional function: given the same
 * records it always produces the same JSON string, and it does not touch
 * the filesystem or any other module's state. Writing the string to a file
 * and reading a file back into an empty store are separate concerns left
 * to their own tasks (e.g. an importStore counterpart) so this module's
 * scope stays exactly "serialize records to JSON".
 */

/**
 * Serialize every record and quantity in the given store to a JSON string.
 *
 * @param {{list: () => object[]} | object[]} store - a store-like object
 *   with a `list()` method, or a plain array of records.
 * @returns {string} JSON string of the full record array. Every field on
 *   each record (id, name, description, quantity, etc.) is preserved
 *   exactly as it appears in the store, so re-parsing this string yields
 *   record objects deep-equal to the originals.
 */
export function exportStore(store) {
  const records = Array.isArray(store)
    ? store
    : (typeof store?.list === 'function' ? store.list() : []);

  return JSON.stringify(records);
}
