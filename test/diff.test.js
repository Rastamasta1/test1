import { diffLines } from '../src/diff.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('diffLines', () => {
  it('reports added and removed lines for a known input pair', () => {
    const a = 'hello\nworld\nfoo';
    const b = 'hello\nearth\nfoo\nbar';
    const { added, removed } = diffLines(a, b);
    // 'world' was in a but not b -> removed
    // 'earth' and 'bar' are in b but not a -> added
    assert.deepEqual(removed, ['world']);
    assert.deepEqual(added, ['earth', 'bar']);
  });

  it('reports nothing when inputs are identical', () => {
    const a = 'alpha\nbeta\ngamma';
    const { added, removed } = diffLines(a, a);
    assert.deepEqual(added, []);
    assert.deepEqual(removed, []);
  });

  it('handles empty string inputs', () => {
    const { added, removed } = diffLines('', '');
    assert.deepEqual(added, []);
    assert.deepEqual(removed, []);
  });

  it('all lines added when a is empty', () => {
    const b = 'x\ny\nz';
    const { added, removed } = diffLines('', b);
    // empty string splits to [''] so '' is removed once
    // x, y, z are added
    assert.deepEqual(removed, ['']);
    assert.deepEqual(added, ['x', 'y', 'z']);
  });

  it('all lines removed when b is empty', () => {
    const a = 'x\ny\nz';
    const { added, removed } = diffLines(a, '');
    assert.deepEqual(removed, ['x', 'y', 'z']);
    assert.deepEqual(added, ['']);
  });

  it('correctly handles duplicate lines', () => {
    const a = 'a\na\nb';
    const b = 'a\nb\nb';
    const { added, removed } = diffLines(a, b);
    // one extra 'a' in a -> removed
    // one extra 'b' in b -> added
    assert.deepEqual(removed, ['a']);
    assert.deepEqual(added, ['b']);
  });

  it('correctly handles blank lines in diff', () => {
    const a = 'line1\n\nline3';
    const b = 'line1\nline3\nline4';
    const { added, removed } = diffLines(a, b);
    // blank line is removed from a
    // line4 is added in b
    assert.deepEqual(removed, ['']);
    assert.deepEqual(added, ['line4']);
  });

  it('preserves order of removed lines (a order)', () => {
    const a = 'z\ny\nx';
    const b = 'y';
    const { added, removed } = diffLines(a, b);
    // z and x removed, in the order they appear in a
    assert.deepEqual(removed, ['z', 'x']);
    assert.deepEqual(added, []);
  });

  it('preserves order of added lines (b order)', () => {
    const a = 'y';
    const b = 'z\ny\nx';
    const { added, removed } = diffLines(a, b);
    // z and x added, in the order they appear in b
    assert.deepEqual(added, ['z', 'x']);
    assert.deepEqual(removed, []);
  });
});
