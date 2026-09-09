/**
 * test/escape-byok-b.test.mjs — guards escapeHtml.js's escHtml() ampersand
 * escaping when the ampersand sits inside a word (not isolated).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes an ampersand inside a word', () => {
  assert.strictEqual(escHtml('a&b'), 'a&amp;b');
});
