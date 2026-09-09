/**
 * test/escape-string-tag.test.mjs — guards that escapeHtml.js keeps exporting
 * escHtml as a function, via Object.prototype.toString's internal tag.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml has the [object Function] string tag', () => {
  assert.strictEqual(Object.prototype.toString.call(escHtml), '[object Function]');
});
