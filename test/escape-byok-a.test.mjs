/**
 * test/escape-byok-a.test.mjs — guards escapeHtml.js's escHtml() arity:
 * the exported function must declare exactly one parameter.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml declares exactly one parameter', () => {
  assert.strictEqual(escHtml.length, 1);
});
