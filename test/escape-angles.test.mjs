/**
 * test/escape-angles.test.mjs — guards escapeHtml.js's escHtml() angle-bracket escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes angle brackets around a tag-like string', () => {
  assert.strictEqual(escHtml('<b>'), '&lt;b&gt;');
});
