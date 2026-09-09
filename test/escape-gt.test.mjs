/**
 * test/escape-gt.test.mjs — guards escapeHtml.js's escHtml() greater-than escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a lone greater-than sign', () => {
  assert.strictEqual(escHtml('>'), '&gt;');
});
