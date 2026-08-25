import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from './slugify.js';

test('mixed punctuation', () => {
  assert.equal(slugify('Hello, World!'), 'hello-world');
});

test('internal multiple spaces', () => {
  assert.equal(slugify('foo   bar    baz'), 'foo-bar-baz');
});

test('leading/trailing junk', () => {
  assert.equal(slugify('!!!Trim Me??'), 'trim-me');
});

test('all-punctuation empty result', () => {
  assert.equal(slugify('!!!???...'), '');
});
