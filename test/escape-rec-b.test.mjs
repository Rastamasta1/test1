/**
 * test/escape-rec-b.test.mjs — guards escapeHtml.js's escHtml() single-quote
 * escaping when the character arrives via String.fromCharCode(39).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a single quote produced via String.fromCharCode(39)', () => {
  assert.strictEqual(escHtml(String.fromCharCode(39)), '&#39;');
});
