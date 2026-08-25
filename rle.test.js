import test from 'node:test';
import assert from 'node:assert/strict';
import { encode, decode } from './rle.js';

test('encodes runs', () => {
  assert.deepEqual(encode('aaabccccd'), [['a',3],['b',1],['c',4],['d',1]]);
});

test('encodes string with no repeats', () => {
  assert.deepEqual(encode('abcd'), [['a',1],['b',1],['c',1],['d',1]]);
});

test('empty string encodes to [] and decodes back to empty', () => {
  assert.deepEqual(encode(''), []);
  assert.equal(decode([]), '');
});

test('decode reverses encode exactly', () => {
  assert.equal(decode(encode('aaabccccd')), 'aaabccccd');
  assert.equal(decode(encode('abcd')), 'abcd');
});

test('round-trip property holds for various strings', () => {
  for (const s of ['aaabccccd', 'abcd', '', 'zzzzzzzzzz', 'xyzxyz']) {
    assert.equal(decode(encode(s)), s);
  }
});
