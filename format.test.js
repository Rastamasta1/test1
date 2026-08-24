import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPercent, pluralize } from './format.js';

test('formatPercent rounds down', () => {
  assert.equal(formatPercent(1, 3), '33%');
});

test('formatPercent rounds up', () => {
  assert.equal(formatPercent(2, 3), '67%');
});

test('formatPercent whole=0 returns em dash', () => {
  assert.equal(formatPercent(0, 0), '\u2014');
});

test('pluralize at n=0', () => {
  assert.equal(pluralize(0, 'vote'), '0 votes');
});

test('pluralize at n=1', () => {
  assert.equal(pluralize(1, 'vote'), '1 vote');
});

test('pluralize at n=2', () => {
  assert.equal(pluralize(2, 'vote'), '2 votes');
});
