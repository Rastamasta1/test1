/**
 * test/escape-unicode.test.mjs — guards escapeHtml.js's escHtml() leaves
 * a non-ASCII letter unescaped.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml leaves a non-ASCII letter unchanged', () => {
  assert.strictEqual(escHtml('ü'), 'ü');
});
