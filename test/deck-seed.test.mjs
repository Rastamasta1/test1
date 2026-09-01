/**
 * test/deck-seed.test.mjs — proves deck.js's shuffle() is deterministic
 * when seeded, pure (does not mutate its input), and still valid
 * (same elements, same length) when called without a seed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { shuffle } from '../deck.js';

const SAMPLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('shuffle(arr, seed) is deterministic for a fixed seed', () => {
  const a = shuffle(SAMPLE, 42);
  const b = shuffle(SAMPLE, 42);
  assert.deepStrictEqual(a, b);
});

test('shuffle(arr, seed) does not mutate the input array', () => {
  const original = [...SAMPLE];
  shuffle(SAMPLE, 42);
  assert.deepStrictEqual(SAMPLE, original);
});

test('shuffle(arr) without a seed returns an array with the same elements', () => {
  const result = shuffle(SAMPLE);
  assert.strictEqual(result.length, SAMPLE.length);
  assert.deepStrictEqual(
    [...result].sort((x, y) => x - y),
    [...SAMPLE].sort((x, y) => x - y),
  );
});
