/**
 * test/escape-slash.test.mjs — guards escapeHtml.js's escHtml() leaves
 * a forward slash unescaped.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml does not escape a forward slash', () => {
  assert.strictEqual(escHtml('/'), '/');
});
