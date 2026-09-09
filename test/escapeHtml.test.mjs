/**
 * test/escapeHtml.test.mjs — proves escapeHtml.js's escHtml() escapes
 * each of the five unsafe characters and leaves a plain string unchanged.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { escHtml } from '../escapeHtml.js';

test('escHtml escapes ampersand', () => {
  assert.strictEqual(escHtml('&'), '&amp;');
});

test('escHtml escapes less-than', () => {
  assert.strictEqual(escHtml('<'), '&lt;');
});

test('escHtml escapes greater-than', () => {
  assert.strictEqual(escHtml('>'), '&gt;');
});

test('escHtml escapes double quote', () => {
  assert.strictEqual(escHtml('"'), '&quot;');
});

test('escHtml escapes single quote', () => {
  assert.strictEqual(escHtml("'"), '&#39;');
});

test('escHtml escapes all five characters together', () => {
  assert.strictEqual(escHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
});

test('escHtml leaves a plain string unchanged', () => {
  assert.strictEqual(escHtml('hello world 123'), 'hello world 123');
});

test('escHtml coerces non-string input via String()', () => {
  assert.strictEqual(escHtml(42), '42');
});
