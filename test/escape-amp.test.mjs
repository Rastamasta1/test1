/**
 * test/escape-amp.test.mjs — guards escapeHtml.js's escHtml() ampersand escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a lone ampersand', () => {
  assert.strictEqual(escHtml('&'), '&amp;');
});

test('escHtml escapes an ampersand within text', () => {
  assert.strictEqual(escHtml('a & b'), 'a &amp; b');
});
