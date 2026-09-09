/**
 * test/escape-lt.test.mjs — guards escapeHtml.js's escHtml() less-than escaping.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes a lone less-than sign', () => {
  assert.strictEqual(escHtml('<'), '&lt;');
});
