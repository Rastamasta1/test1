// src/store.js
// Pure in-memory record store seeded from data/fixtures.json
// validate() rejects records missing any of: id, name, description, category

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load fixtures at startup — deep-copy so mutations don't affect the import cache
const fixturesPath = new URL('../data/fixtures.json', import.meta.url);
const rawFixtures = JSON.parse(
  (await import('fs')).readFileSync(fixturesPath, 'utf8')
);

/** @type {Array<{id:string,name:string,description:string,category:string}>} */
let records = rawFixtures.map(r => ({ ...r }));

/**
 * Validate a record object.
 * Returns { valid: true } when all required fields are present and non-empty.
 * Returns { valid: false, errors: string[] } otherwise.
 */
export function validate(record) {
  const required = ['id', 'name', 'description', 'category'];
  const errors = required.filter(
    field => !record || record[field] === undefined || record[field] === null || record[field] === ''
  );
  if (errors.length === 0) {
    return { valid: true };
  }
  return { valid: false, errors: errors.map(f => `Missing required field: ${f}`) };
}

/**
 * Add a record to the store.
 * Throws if the record is invalid or a record with the same id already exists.
 */
export function add(record) {
  const result = validate(record);
  if (!result.valid) {
    throw new Error(`Invalid record: ${result.errors.join(', ')}`);
  }
  if (records.some(r => r.id === record.id)) {
    throw new Error(`Record with id "${record.id}" already exists`);
  }
  const copy = { ...record };
  records.push(copy);
  return copy;
}

/**
 * Return a shallow copy of all records.
 */
export function list() {
  return records.map(r => ({ ...r }));
}

/**
 * Remove a record by id.
 * Returns the removed record, or undefined if the id was not found (idempotent).
 */
export function remove(id) {
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    return undefined;
  }
  const [removed] = records.splice(index, 1);
  return removed;
}

/**
 * Find a record by id.
 * Returns the record or undefined.
 */
export function find(id) {
  const record = records.find(r => r.id === id);
  return record ? { ...record } : undefined;
}

/**
 * Return the total number of records in the store.
 */
export function count() {
  return records.length;
}

// When run directly: print all records
if (process.argv[1] && new URL(process.argv[1], 'file://').pathname === new URL(import.meta.url).pathname) {
  console.log(`Store contains ${count()} records:\n`);
  list().forEach(r => {
    console.log(`[${r.id}] ${r.name} (${r.category})`);
    console.log(`  ${r.description}`);
  });
}
