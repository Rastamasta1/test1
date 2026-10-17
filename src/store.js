import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = join(__dirname, '..', 'data', 'fixtures.json');

// Load fixtures into in-memory store
const fixturesRaw = readFileSync(FIXTURES_PATH, 'utf-8');
const initialRecords = JSON.parse(fixturesRaw);

/** @type {Map<string, object>} */
const store = new Map();

for (const record of initialRecords) {
  store.set(record.id, { ...record });
}

/**
 * Validate a record. Returns { valid: true } or { valid: false, errors: string[] }.
 * A record must have all four fields: id, name, description, category.
 */
export function validate(record) {
  const required = ['id', 'name', 'description', 'category'];
  const errors = [];
  for (const field of required) {
    if (
      record == null ||
      !(field in record) ||
      record[field] === null ||
      record[field] === undefined ||
      String(record[field]).trim() === ''
    ) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}

/**
 * Add a record to the store.
 * Throws if the record is invalid or if the id already exists.
 */
export function add(record) {
  const result = validate(record);
  if (!result.valid) {
    throw new Error(`Invalid record: ${result.errors.join(', ')}`);
  }
  if (store.has(record.id)) {
    throw new Error(`Record with id "${record.id}" already exists`);
  }
  store.set(record.id, { ...record });
  return store.get(record.id);
}

/**
 * List all records in the store as an array.
 */
export function list() {
  return Array.from(store.values()).map(r => ({ ...r }));
}

/**
 * Remove a record by id. Returns the removed record, or undefined if not found.
 * Calling remove with the same id twice is not an error — the second call returns undefined.
 */
export function remove(id) {
  const record = store.get(id);
  if (record !== undefined) {
    store.delete(id);
    return { ...record };
  }
  // Idempotent: already removed, not an error
  return undefined;
}

/**
 * Find a record by id. Returns the record or undefined.
 */
export function find(id) {
  const record = store.get(id);
  return record !== undefined ? { ...record } : undefined;
}

/**
 * Return the number of records currently in the store.
 */
export function count() {
  return store.size;
}

/**
 * Search records by query substring.
 * Returns records whose name or description contains the query (case-insensitive).
 * If query is empty, null, or undefined, all records are returned.
 * Returns defensive copies.
 *
 * @param {string} query
 * @returns {Array<object>}
 */
export function search(query) {
  // Normalise: null/undefined/empty → return everything
  if (query == null || String(query).trim() === '') {
    return list();
  }
  const needle = String(query).toLowerCase();
  return Array.from(store.values())
    .filter(r =>
      String(r.name).toLowerCase().includes(needle) ||
      String(r.description).toLowerCase().includes(needle)
    )
    .map(r => ({ ...r }));
}

// When run directly, print all records
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Vinyl Record Store — ${count()} records:\n`);
  for (const record of list()) {
    console.log(`[${record.id}] ${record.name} (${record.category})`);
    console.log(`  ${record.description}`);
    console.log();
  }
}
