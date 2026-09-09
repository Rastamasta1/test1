/**
 * test/escape-empty.test.mjs — guards escapeHtml.js's escHtml() on an empty string.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml returns an empty string for an empty string input', () => {
  assert.strictEqual(escHtml(''), '');
});
