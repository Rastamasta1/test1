/**
 * test/escape-byok-c.test.mjs — guards escapeHtml.js's escHtml() on a tag-like string.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a simple tag', () => {
  assert.strictEqual(escHtml('<b>'), '&lt;b&gt;');
});
