/**
 * src/history.js — append-only in-memory change history.
 *
 * Exports:
 *   record(id, change) → entry   appends one history entry, returns it
 *   list()             → Entry[] returns all entries in creation order
 *
 * Each entry names the record id and what changed:
 *   { id, change }
 *
 * Nothing here decides WHEN to record — callers (e.g. src/store.js's
 * add/remove/adjust) are responsible for calling record() on a mutation.
 * A pure read (like search()) must not call record(), which is what keeps
 * search from adding a line.
 */

const entries = [];

/**
 * Append one history entry.
 * @param {number|string} id     - the record id the change applied to
 * @param {string} change        - a short description of what changed
 * @returns {{id:number|string, change:string}} the entry that was appended
 */
export function record(id, change) {
  const entry = { id, change };
  entries.push(entry);
  return entry;
}

/**
 * Return all history entries in creation order.
 * @returns {Array<{id:number|string, change:string}>}
 */
export function list() {
  return [...entries];
}

// ── Main block: print the history when run directly ────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const all = list();
  console.log(`History has ${all.length} entrie(s):`);
  all.forEach((e, i) => {
    console.log(`${i + 1}. #${e.id} — ${e.change}`);
  });
}
