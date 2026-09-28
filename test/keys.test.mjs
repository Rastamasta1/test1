import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyAction } from '../game.js';

test('keyAction maps A/B choices when not revealed', () => {
  assert.equal(keyAction('a', false), 'A');
  assert.equal(keyAction('A', false), 'A');
  assert.equal(keyAction('b', false), 'B');
  assert.equal(keyAction('B', false), 'B');
});

test('keyAction maps advance keys when revealed', () => {
  assert.equal(keyAction('Enter', true), 'next');
  assert.equal(keyAction('n', true), 'next');
  assert.equal(keyAction('N', true), 'next');
});

test('keyAction returns null for unmapped keys', () => {
  assert.equal(keyAction('x', false), null);
});
