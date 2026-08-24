import test from 'node:test';
import assert from 'node:assert/strict';
import { seededShuffle } from './seededShuffle.js';

const input = [1, 2, 3, 4, 5, 6, 7, 8];

test('same seed twice gives identical order', () => {
  const a = seededShuffle(input, 42);
  const b = seededShuffle(input, 42);
  assert.deepEqual(a, b);
});

test('does not mutate the input array', () => {
  const before = [...input];
  seededShuffle(input, 7);
  assert.deepEqual(input, before);
});

test('output is a permutation of the input', () => {
  const out = seededShuffle(input, 99);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort(), [...input].sort());
});
