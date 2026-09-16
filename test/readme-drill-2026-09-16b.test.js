/**
 * test/readme-drill-2026-09-16b.test.js — guards that README.md's last
 * non-empty line reads exactly the 2026-09-16b goal-loop drill sentence.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const EXPECTED = 'Goal-loop drill 2026-09-16b: authored, signed and merged by an Atrytone goal.';

test('README.md last non-empty line reads exactly the 2026-09-16b drill sentence', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const lines = readme.split(/\r?\n/);

  let lastNonEmpty = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() !== '') {
      lastNonEmpty = lines[i];
      break;
    }
  }

  assert.strictEqual(lastNonEmpty, EXPECTED);
});
