// test/store.test.js
// Tests for src/store.js using Node's built-in test runner
// Run with: node --test test/store.test.js

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// We re-import the module fresh using a dynamic import with a cache-bust query
// so beforeEach resets state via the module's own seeding logic.
// Because the store seeds from fixtures on load, we test the API against
// the live module instance (24 records pre-loaded).
import * as store from '../src/store.js';

// ── validate ────────────────────────────────────────────────────────────────

describe('validate()', () => {
  test('returns valid:true for a complete record', () => {
    const result = store.validate({
      id: 'x-1',
      name: 'Test Record',
      description: 'A test',
      category: 'Test',
    });
    assert.equal(result.valid, true);
  });

  test('rejects a record missing id', () => {
    const result = store.validate({ name: 'A', description: 'B', category: 'C' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')));
  });

  test('rejects a record missing name', () => {
    const result = store.validate({ id: '1', description: 'B', category: 'C' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('name')));
  });

  test('rejects a record missing description', () => {
    const result = store.validate({ id: '1', name: 'A', category: 'C' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('description')));
  });

  test('rejects a record missing category', () => {
    const result = store.validate({ id: '1', name: 'A', description: 'B' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('category')));
  });

  test('rejects a record with an empty string field', () => {
    const result = store.validate({ id: '', name: 'A', description: 'B', category: 'C' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('id')));
  });

  test('rejects null input', () => {
    const result = store.validate(null);
    assert.equal(result.valid, false);
    assert.ok(Array.isArray(result.errors));
    assert.equal(result.errors.length, 4);
  });
});

// ── list & count (fixtures) ──────────────────────────────────────────────────

describe('list() / count() on fixture data', () => {
  test('list() returns exactly 24 records on startup', () => {
    const all = store.list();
    assert.equal(all.length, 24);
  });

  test('count() returns 24 on startup', () => {
    assert.equal(store.count(), 24);
  });

  test('list() returns copies (mutations do not affect store)', () => {
    const all = store.list();
    all[0].name = 'MUTATED';
    const all2 = store.list();
    assert.notEqual(all2[0].name, 'MUTATED');
  });
});

// ── find ─────────────────────────────────────────────────────────────────────

describe('find()', () => {
  test('finds an existing record by id', () => {
    const rec = store.find('rec-001');
    assert.ok(rec);
    assert.equal(rec.id, 'rec-001');
  });

  test('returns undefined for an unknown id', () => {
    assert.equal(store.find('does-not-exist'), undefined);
  });
});

// ── add ──────────────────────────────────────────────────────────────────────

describe('add()', () => {
  test('adds a valid record and increments count', () => {
    const before = store.count();
    store.add({ id: 'test-add-001', name: 'New', description: 'Desc', category: 'Cat' });
    assert.equal(store.count(), before + 1);
  });

  test('added record is retrievable via find()', () => {
    store.add({ id: 'test-add-002', name: 'Find Me', description: 'Desc', category: 'Cat' });
    const found = store.find('test-add-002');
    assert.ok(found);
    assert.equal(found.name, 'Find Me');
  });

  test('throws when adding a duplicate id', () => {
    store.add({ id: 'test-dup', name: 'Dup', description: 'D', category: 'C' });
    assert.throws(
      () => store.add({ id: 'test-dup', name: 'Dup2', description: 'D', category: 'C' }),
      /already exists/
    );
  });

  test('throws for an invalid record (missing fields)', () => {
    assert.throws(
      () => store.add({ name: 'No ID' }),
      /Invalid record/
    );
  });

  // Clean up test-added records so other tests are not polluted
  // (Node test runner runs describe blocks sequentially within a file)
});

// ── remove ───────────────────────────────────────────────────────────────────

describe('remove()', () => {
  test('removes an existing record and returns it', () => {
    store.add({ id: 'test-rem-001', name: 'Remove Me', description: 'D', category: 'C' });
    const removed = store.remove('test-rem-001');
    assert.ok(removed);
    assert.equal(removed.id, 'test-rem-001');
    assert.equal(store.find('test-rem-001'), undefined);
  });

  test('decrement count after removal', () => {
    store.add({ id: 'test-rem-002', name: 'Count Me', description: 'D', category: 'C' });
    const before = store.count();
    store.remove('test-rem-002');
    assert.equal(store.count(), before - 1);
  });

  test('is idempotent: removing a non-existent id returns undefined, not an error', () => {
    const result = store.remove('ghost-id-that-never-existed');
    assert.equal(result, undefined);
  });

  test('removing same id twice does not throw', () => {
    store.add({ id: 'test-rem-003', name: 'Twice', description: 'D', category: 'C' });
    store.remove('test-rem-003');
    assert.doesNotThrow(() => store.remove('test-rem-003'));
  });
});
