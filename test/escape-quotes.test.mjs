/**
 * test/escape-quotes.test.mjs — guards escapeHtml.js's escHtml() double-quote escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes double quotes around text', () => {
  assert.strictEqual(escHtml('"x"'), '&quot;x&quot;');
});
