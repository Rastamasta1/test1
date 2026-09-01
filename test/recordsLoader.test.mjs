/**
 * test/recordsLoader.test.mjs — proves src/recordsLoader.js's loadRecords()
 * returns an array, and that its parser correctly groups bullet records by
 * section while ignoring embedded HTML comments.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { loadRecords, parseRecordsMarkdown } from '../src/recordsLoader.js';

test('loadRecords() returns an array', () => {
  const result = loadRecords();
  assert.ok(Array.isArray(result), 'loadRecords() must return an array');
});

test('loadRecords() returns an array even for the current documentation-only source file', () => {
  const result = loadRecords();
  // The real data/records-source.md is documentation-only (no bullet
  // records), so this is legitimately an empty array — still an array.
  assert.ok(Array.isArray(result));
  assert.strictEqual(result.length, 0);
});

test('parseRecordsMarkdown groups bullet records under their nearest heading', () => {
  const md = [
    '# Title',
    '',
    '## Section A',
    '',
    '<!-- an embedded comment that must be ignored, not parsed as a record -->',
    '',
    '- id: 1; name: Alpha',
    '- id: 2; name: Beta',
    '',
    '## Section B',
    '',
    '- id: 3; name: Gamma',
    '',
  ].join('\n');

  const records = parseRecordsMarkdown(md);
  assert.deepStrictEqual(records, [
    { section: 'Section A', id: '1', name: 'Alpha' },
    { section: 'Section A', id: '2', name: 'Beta' },
    { section: 'Section B', id: '3', name: 'Gamma' },
  ]);
});

test('parseRecordsMarkdown returns an empty array for a documentation-only file with no bullets', () => {
  const md = '# Records data source\n\nThis file documents the record schema.\n';
  assert.deepStrictEqual(parseRecordsMarkdown(md), []);
});

test('parseRecordsMarkdown keeps unstructured bullets as { text: ... }', () => {
  const md = '## Notes\n\n- just a plain note with no key value pairs\n';
  assert.deepStrictEqual(parseRecordsMarkdown(md), [
    { section: 'Notes', text: 'just a plain note with no key value pairs' },
  ]);
});
