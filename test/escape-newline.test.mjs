/**
 * test/escape-newline.test.mjs — guards escapeHtml.js's escHtml() leaves
 * a newline character unescaped.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml does not escape a newline character between letters', () => {
  assert.strictEqual(escHtml('a\nb'), 'a\nb');
});
