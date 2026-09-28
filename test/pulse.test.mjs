import test from 'node:test';
import assert from 'node:assert/strict';
import { keyPulseClass } from '../game.js';

test('keyPulseClass returns the keypulse modifier for a truthy argument', () => {
  assert.equal(keyPulseClass(true), ' choice-card--keypulse');
});

test('keyPulseClass returns an empty string for a falsy argument', () => {
  assert.equal(keyPulseClass(false), '');
});
