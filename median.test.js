import test from 'node:test';
import assert from 'node:assert/strict';
import { median } from './median.js';

test('odd length returns middle element', () => {
  assert.equal(median([1, 3, 2]), 2);
});

test('even length returns mean of two middles', () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
});

test('unsorted input is handled correctly', () => {
  assert.equal(median([5, 1, 4, 2, 3]), 3);
});

test('does not mutate the input array', () => {
  const input = [3, 1, 2];
  const copy = [...input];
  median(input);
  assert.deepEqual(input, copy);
});

test('empty array returns null', () => {
  assert.equal(median([]), null);
});
