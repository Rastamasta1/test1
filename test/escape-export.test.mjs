/**
 * test/escape-export.test.mjs — guards that escapeHtml.js keeps exporting
 * escHtml as a function.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escapeHtml.js exports escHtml as a function', () => {
  assert.strictEqual(typeof escHtml, 'function');
});
