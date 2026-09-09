/**
 * test/escape-twice.test.mjs — guards escapeHtml.js's escHtml() idempotence:
 * escaping an already-escaped ampersand entity escapes its own ampersand again.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml applied twice to "&" escapes the entity\'s own ampersand', () => {
  assert.strictEqual(escHtml(escHtml('&')), '&amp;amp;');
});
