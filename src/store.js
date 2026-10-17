// src/store.js
// Pure ES module: vinyl record store with add, list, remove, find, count.
// remove() returns the removed record and is idempotent (returns null if not found).

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

// Load fixtures from data/fixtures.json relative to project root (one level up from src/).
const fixturesPath = join(__dir, '..', 'data', 'fixtures.json');
const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8'));

// Internal mutable store — seeded with fixtures on module load.
let records = fixtures.map(r => ({ ...r }));

/**
 * Add a new record to the store.
 * @param {{ id: string, name: string, description: string }} record
 * @returns The added record.
 */
export function add(record) {
  if (!record || !record.id) throw new Error('record.id is required');
  records.push({ ...record });
  return { ...record };
}

/**
 * Return a shallow copy of all records.
 * @returns {Array}
 */
export function list() {
  return records.map(r => ({ ...r }));
}

/**
 * Remove a record by id.
 * Idempotent: returns null (not an error) when the id is not present.
 * @param {string} id
 * @returns The removed record, or null if it was not found.
 */
export function remove(id) {
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;
  const [removed] = records.splice(index, 1);
  return { ...removed };
}

/**
 * Find a record by id.
 * @param {string} id
 * @returns The record, or null if not found.
 */
export function find(id) {
  const record = records.find(r => r.id === id);
  return record ? { ...record } : null;
}

/**
 * Return the number of records currently in the store.
 * @returns {number}
 */
export function count() {
  return records.length;
}

// When run directly (node src/store.js), print all records.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(`Store contains ${count()} records:\n`);
  for (const r of list()) {
    console.log(`[${r.id}] ${r.name}`);
    console.log(`  ${r.description}\n`);
  }
}
