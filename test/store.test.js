/**
 * test/store.test.js — tests for src/store.js search() and remove() behavior.
 *
 * Mutation coverage:
 *   - search() returning all records regardless of query (e.g. returning `records`
 *     unfiltered) is caught by asserting the match count is less than the total count.
 *   - search() using `===` instead of substring `includes()` is caught by using a
 *     query that appears only as a substring of the name, not the whole name.
 *   - remove() failing to return the removed record (e.g. returning undefined or the
 *     index) is caught by asserting the returned object equals the pre-removal record.
 *   - remove() not being idempotent (e.g. throwing or returning something other than
 *     null on a second call for the same id) is caught by asserting the second call
 *     returns null and the record count does not decrease further.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { search, remove, find, list, count, adjust } from '../src/store.js';

test('search(q) matches some records but not all', () => {
  const total = count();
  const matches = search('Basket');

  assert.ok(matches.length > 0, 'expected at least one match');
  assert.ok(matches.length < total, 'expected not every record to match');
  matches.forEach(r => {
    assert.ok(r.name.includes('Basket'), `record "${r.name}" should contain "Basket"`);
  });

  // Sanity: every record NOT returned genuinely does not contain the query.
  const nonMatches = list().filter(r => !matches.includes(r));
  assert.ok(nonMatches.length > 0);
  nonMatches.forEach(r => {
    assert.ok(!r.name.includes('Basket'), `record "${r.name}" should not contain "Basket"`);
  });
});

test('adjust(id, delta) raises, lowers, and refuses to go below zero', () => {
  // Fixture id 1 (Copper Kettle) starts at quantity 12.
  const raised = adjust(1, 5);
  assert.equal(raised.quantity, 17, 'raising by 5 should give 17');

  const lowered = adjust(1, -3);
  assert.equal(lowered.quantity, 14, 'lowering by 3 should give 14');

  // Fixture id 14 (Pewter Bookend Pair) starts at quantity 7 — too low to absorb a big drop.
  const before = find(14).quantity;
  assert.equal(before, 7, 'sanity check on fixture id 14 starting quantity');
  const blocked = adjust(14, -100);
  assert.equal(blocked.quantity, before, 'quantity must be unchanged when delta would go below zero');
  assert.equal(blocked.quantity, 7);

  assert.equal(adjust(9999, 1), undefined, 'adjusting a nonexistent id returns undefined');
});

test('remove() returns the removed record and is idempotent', () => {
  const target = find(5);
  assert.ok(target, 'fixture record with id 5 should exist before removal');

  const before = count();
  const removed = remove(5);
  assert.deepEqual(removed, target);
  assert.equal(count(), before - 1);
  assert.equal(find(5), undefined);

  // Idempotent: removing the same id again returns null and does not change count.
  const secondRemoval = remove(5);
  assert.equal(secondRemoval, null);
  assert.equal(count(), before - 1);
});
