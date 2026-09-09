/**
 * test/escape-tab.test.mjs — guards escapeHtml.js's escHtml() leaves
 * a tab character unescaped.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml does not escape a tab character between letters', () => {
  assert.strictEqual(escHtml('a\tb'), 'a\tb');
});
