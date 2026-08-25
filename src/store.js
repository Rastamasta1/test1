/**
 * src/store.js — in-memory store backed by data/fixtures.json.
 *
 * Exports:
 *   add(record)   → record        appends a record, returns it
 *   list()        → Record[]      returns all records (live array)
 *   remove(id)    → Record|null   removes and returns the record, or null if not found (idempotent)
 *   find(id)      → Record|undefined
 *   count()       → number
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = path.join(__dirname, '..', 'data', 'fixtures.json');

function loadFixtures() {
  const raw = readFileSync(FIXTURES_PATH, 'utf8');
  return JSON.parse(raw);
}

// In-memory records, seeded once from data/fixtures.json.
const records = loadFixtures();

/**
 * Add a new record to the store.
 * @param {{id:number|string, name:string, description:string, quantity:number}} record
 * @returns {object} the record that was added
 */
export function add(record) {
  records.push(record);
  return record;
}

/**
 * Return all records currently in the store.
 * @returns {object[]}
 */
export function list() {
  return records;
}

/**
 * Remove a record by id.
 * Idempotent: removing an id that is not present (including one already
 * removed) returns null rather than throwing.
 * @param {number|string} id
 * @returns {object|null} the removed record, or null if none matched
 */
export function remove(id) {
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  const [removed] = records.splice(idx, 1);
  return removed;
}

/**
 * Find a single record by id.
 * @param {number|string} id
 * @returns {object|undefined}
 */
export function find(id) {
  return records.find(r => r.id === id);
}

/**
 * Adjust a record's quantity by a signed delta (positive raises, negative lowers).
 * Refuses to let quantity go below zero: if record.quantity + delta < 0,
 * the record is returned unchanged (delta not applied).
 * @param {number|string} id
 * @param {number} delta
 * @returns {object|undefined} the record (updated in place, or unchanged if the
 *   guard blocked it), or undefined if no record with that id exists
 */
export function adjust(id, delta) {
  const record = find(id);
  if (!record) return undefined;
  const next = record.quantity + delta;
  if (next < 0) return record;
  record.quantity = next;
  return record;
}

/**
 * Search records whose name contains the query substring.
 * @param {string} query
 * @returns {object[]} records whose name includes query (case-sensitive substring match)
 */
export function search(query) {
  if (!query) return [];
  return records.filter(r => r.name.includes(query));
}

/**
 * Count of records currently in the store.
 * @returns {number}
 */
export function count() {
  return records.length;
}

// ── Main block: print all 14 records when run directly ────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const all = list();
  console.log(`Store has ${all.length} record(s):`);
  all.forEach(r => {
    console.log(`#${r.id} ${r.name} — ${r.description} (qty: ${r.quantity})`);
  });
}
