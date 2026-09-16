/**
 * test/readme-goal-loop-drills.test.js — guards README.md's '## Goal-loop drills'
 * section: the exact heading line, a following sentence containing the verbatim
 * phrase 'records each goal-built change', and that '## Running the tests' still
 * appears after it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const README = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const LINES = README.split(/\r?\n/);

test('README.md contains the exact line "## Goal-loop drills"', () => {
  assert.ok(
    LINES.includes('## Goal-loop drills'),
    'expected a line reading exactly "## Goal-loop drills" in README.md',
  );
});

test('a sentence after the heading contains the verbatim phrase "records each goal-built change"', () => {
  const headingIndex = LINES.indexOf('## Goal-loop drills');
  assert.notStrictEqual(headingIndex, -1, 'heading must exist before checking what follows it');

  const after = LINES.slice(headingIndex + 1).join('\n');
  assert.ok(
    after.includes('records each goal-built change'),
    'expected a sentence after the heading containing "records each goal-built change"',
  );
});

test('"## Running the tests" still appears after the Goal-loop drills heading', () => {
  const headingIndex = LINES.indexOf('## Goal-loop drills');
  assert.notStrictEqual(headingIndex, -1, 'heading must exist before checking what follows it');

  const runningTestsIndex = LINES.indexOf('## Running the tests');
  assert.notStrictEqual(
    runningTestsIndex,
    -1,
    'expected a line reading exactly "## Running the tests" in README.md',
  );
  assert.ok(
    runningTestsIndex > headingIndex,
    '"## Running the tests" must still appear after "## Goal-loop drills"',
  );
});
