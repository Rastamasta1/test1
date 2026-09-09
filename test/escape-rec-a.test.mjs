/**
 * test/escape-rec-a.test.mjs — guards escapeHtml.js's escHtml() double-quote
 * escaping within a mixed string.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a double quote inside a mixed string', () => {
  assert.strictEqual(escHtml('a"b'), 'a&quot;b');
});
