import { test } from 'node:test';
import assert from 'node:assert';
import { clamp } from './clamp.js';

test('inside range returns n unchanged', () => {
  assert.strictEqual(clamp(5, 0, 10), 5);
});

test('below lo returns lo', () => {
  assert.strictEqual(clamp(-3, 0, 10), 0);
});

test('above hi returns hi', () => {
  assert.strictEqual(clamp(15, 0, 10), 10);
});

test('exactly at lo returns lo', () => {
  assert.strictEqual(clamp(0, 0, 10), 0);
});

test('exactly at hi returns hi', () => {
  assert.strictEqual(clamp(10, 0, 10), 10);
});

test('lo > hi throws an Error naming both bounds', () => {
  assert.throws(
    () => clamp(5, 10, 0),
    /10.*0/
  );
});
