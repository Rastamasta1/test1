/**
 * test/escape-rec-c.test.mjs — guards escapeHtml.js's escHtml() leaves
 * a plain word with no unsafe characters unchanged.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml leaves a plain word unchanged', () => {
  assert.strictEqual(escHtml('plain'), 'plain');
});
