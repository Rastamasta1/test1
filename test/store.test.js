import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, list, remove, find, count, validate } from '../src/store.js';

// ── validate ─────────────────────────────────────────────────────────────────

test('validate: accepts a fully-populated record', () => {
  const result = validate({ id: 'x-1', name: 'Test', description: 'Desc', category: 'Rock' });
  assert.equal(result.valid, true);
});

test('validate: rejects a record missing id', () => {
  const result = validate({ name: 'Test', description: 'Desc', category: 'Rock' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('id')));
});

test('validate: rejects a record missing name', () => {
  const result = validate({ id: 'x-2', description: 'Desc', category: 'Rock' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('name')));
});

test('validate: rejects a record missing description', () => {
  const result = validate({ id: 'x-3', name: 'Test', category: 'Rock' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('description')));
});

test('validate: rejects a record missing category', () => {
  const result = validate({ id: 'x-4', name: 'Test', description: 'Desc' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('category')));
});

test('validate: rejects a record with empty-string name', () => {
  const result = validate({ id: 'x-5', name: '   ', description: 'Desc', category: 'Rock' });
  assert.equal(result.valid, false);
});

test('validate: rejects null', () => {
  const result = validate(null);
  assert.equal(result.valid, false);
  assert.ok(Array.isArray(result.errors) && result.errors.length > 0);
});

test('validate: reports multiple missing fields at once', () => {
  const result = validate({ id: 'x-6' });
  assert.equal(result.valid, false);
  // name, description, category all missing
  assert.ok(result.errors.length >= 3);
});

// ── count & list (fixture data) ───────────────────────────────────────────────

test('count: store starts with 24 fixture records', () => {
  assert.equal(count(), 24);
});

test('list: returns an array with 24 items initially', () => {
  const records = list();
  assert.ok(Array.isArray(records));
  assert.equal(records.length, 24);
});

test('list: each item has id, name, description, category', () => {
  for (const record of list()) {
    assert.ok('id' in record, 'missing id');
    assert.ok('name' in record, 'missing name');
    assert.ok('description' in record, 'missing description');
    assert.ok('category' in record, 'missing category');
  }
});

test('list: returns defensive copies (mutating result does not affect store)', () => {
  const before = list();
  before[0].name = '__MUTATED__';
  const after = list();
  assert.notEqual(after[0].name, '__MUTATED__');
});

// ── find ─────────────────────────────────────────────────────────────────────

test('find: returns the correct record for a known id', () => {
  const record = find('rec-001');
  assert.ok(record !== undefined);
  assert.equal(record.id, 'rec-001');
});

test('find: returns undefined for an unknown id', () => {
  assert.equal(find('no-such-id'), undefined);
});

test('find: returns a defensive copy', () => {
  const r = find('rec-002');
  const originalName = r.name;
  r.name = '__CHANGED__';
  assert.equal(find('rec-002').name, originalName);
});

// ── add ───────────────────────────────────────────────────────────────────────

test('add: inserts a new record and returns it', () => {
  const newRecord = { id: 'test-add-001', name: 'Added Album', description: 'A new album', category: 'Jazz' };
  const returned = add(newRecord);
  assert.equal(returned.id, 'test-add-001');
  assert.equal(returned.name, 'Added Album');
  // count should increase
  assert.equal(count(), 25);
});

test('add: new record is findable after insert', () => {
  const found = find('test-add-001');
  assert.ok(found !== undefined);
  assert.equal(found.name, 'Added Album');
});

test('add: throws when id already exists', () => {
  assert.throws(
    () => add({ id: 'test-add-001', name: 'Dup', description: 'Dup', category: 'Rock' }),
    /already exists/
  );
});

test('add: throws when record is invalid (missing field)', () => {
  assert.throws(
    () => add({ id: 'test-invalid', name: 'No desc', category: 'Rock' }),
    /Invalid record/
  );
});

// ── remove ────────────────────────────────────────────────────────────────────

test('remove: returns the removed record', () => {
  const removed = remove('test-add-001');
  assert.ok(removed !== undefined);
  assert.equal(removed.id, 'test-add-001');
  assert.equal(removed.name, 'Added Album');
});

test('remove: record is no longer findable after removal', () => {
  assert.equal(find('test-add-001'), undefined);
});

test('remove: count decreases after removal', () => {
  // After removing test-add-001 we should be back to 24
  assert.equal(count(), 24);
});

test('remove: is idempotent — removing the same id twice returns undefined the second time', () => {
  // First: remove a fixture record
  const first = remove('rec-024');
  assert.ok(first !== undefined, 'first remove should return the record');
  assert.equal(first.id, 'rec-024');

  // Second: same id, should return undefined without throwing
  const second = remove('rec-024');
  assert.equal(second, undefined);
});

test('remove: returns undefined for a completely unknown id', () => {
  assert.equal(remove('never-existed'), undefined);
});

test('remove: list reflects removal', () => {
  const all = list();
  assert.ok(all.every(r => r.id !== 'rec-024'));
});
