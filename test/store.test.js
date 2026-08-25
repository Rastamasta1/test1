/**
 * test/store.test.js — verifies src/store.js's remove() contract:
 *   - remove(id) returns the removed record
 *   - remove(id) is idempotent (repeated calls on the same id return null)
 *   - remove(id) on an id that was never present returns null
 *
 * Scope note: search() is added by a separate task; these tests only
 * cover remove()'s pre-existing contract, which must keep holding once
 * search() lands alongside it in src/store.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { list, remove, count } from '../src/store.js';

test('remove() returns the removed record', () => {
  const beforeCount = count();
  const target = list()[0];
  assert.ok(target, 'fixture data must have at least one record');

  const removed = remove(target.id);

  assert.deepEqual(removed, target);
  assert.equal(count(), beforeCount - 1);
});

test('remove() is idempotent — repeated calls on an already-removed id return null', () => {
  const target = list()[0];
  assert.ok(target, 'fixture data must have at least one record');

  const first = remove(target.id);
  assert.ok(first, 'first removal should return the record');
  assert.equal(first.id, target.id);

  const countAfterFirst = count();

  const second = remove(target.id);
  assert.equal(second, null);

  const third = remove(target.id);
  assert.equal(third, null);

  // Idempotent also means no further mutation of the store on repeat calls.
  assert.equal(count(), countAfterFirst);
});

test('remove() on an id that was never present returns null', () => {
  assert.equal(remove('never-existed-id-12345'), null);
});
