/**
 * test/escape-mixed.test.mjs — guards escapeHtml.js's escHtml() on mixed input
 * containing several unsafe characters together.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes mixed angle brackets, ampersand, and quotes together', () => {
  assert.strictEqual(escHtml('a<b&"c"'), 'a&lt;b&amp;&quot;c&quot;');
});
