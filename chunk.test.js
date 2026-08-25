import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunk } from './chunk.js';

test('even split', () => {
  assert.deepEqual(chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
});

test('uneven last chunk', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('size larger than array', () => {
  assert.deepEqual(chunk([1, 2], 5), [[1, 2]]);
});

test('empty array', () => {
  assert.deepEqual(chunk([], 3), []);
});

test('size < 1 throws', () => {
  assert.throws(() => chunk([1, 2], 0), /0/);
  assert.throws(() => chunk([1, 2], -1), Error);
});
