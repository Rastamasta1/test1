/**
 * test/escape-number.test.mjs — guards escapeHtml.js's escHtml() coercion
 * of a number via String().
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml coerces a number to its string form', () => {
  assert.strictEqual(escHtml(42), '42');
});
