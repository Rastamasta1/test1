import { test } from 'node:test';
import assert from 'node:assert';
import { longestStreak } from './streak.js';

test('empty array returns 0', () => {
  assert.strictEqual(longestStreak([]), 0);
});

test('single element returns 1', () => {
  assert.strictEqual(longestStreak(['a']), 1);
});

test('tie between an early and a late run picks either length', () => {
  assert.strictEqual(
    longestStreak(['a', 'a', 'b', 'a', 'b', 'b']),
    2
  );
});

test('run at the very end of the array is counted', () => {
  assert.strictEqual(
    longestStreak(['a', 'b', 'a', 'b', 'b', 'b']),
    3
  );
});
