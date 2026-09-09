/**
 * test/escape-apostrophe.test.mjs — guards escapeHtml.js's escHtml() apostrophe escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a lone apostrophe', () => {
  assert.strictEqual(escHtml("'"), '&#39;');
});

test('escHtml escapes an apostrophe within text', () => {
  assert.strictEqual(escHtml("it's"), 'it&#39;s');
});
