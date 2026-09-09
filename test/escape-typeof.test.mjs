/**
 * test/escape-typeof.test.mjs — guards that escapeHtml.js keeps exporting
 * escHtml as a function (typeof check).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escapeHtml.js exports escHtml with typeof "function"', () => {
  assert.strictEqual(typeof escHtml, 'function');
});
