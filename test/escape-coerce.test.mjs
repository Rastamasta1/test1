/**
 * test/escape-coerce.test.mjs — guards escapeHtml.js's escHtml() coercion
 * of non-string input via String().
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml coerces a number via String()', () => {
  assert.strictEqual(escHtml(42), '42');
});

test('escHtml coerces null via String()', () => {
  assert.strictEqual(escHtml(null), 'null');
});
