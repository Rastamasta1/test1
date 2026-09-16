/**
 * test/changelog-goal-loop-entry.test.mjs — guards that CHANGELOG.plain.md
 * records the Goal-loop drill 2026-09-16 entry in plain language, on a
 * single line that names both README.md and the '## Goal-loop' section
 * that entry describes.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CHANGELOG_PATH = new URL('../CHANGELOG.plain.md', import.meta.url);

function readChangelogLines() {
  const content = readFileSync(CHANGELOG_PATH, 'utf8');
  return content.split(/\r?\n/);
}

test('CHANGELOG.plain.md has a line naming the Goal-loop drill 2026-09-16, README.md, and ## Goal-loop', () => {
  const lines = readChangelogLines();
  const matching = lines.find(
    (line) =>
      line.includes('Goal-loop drill 2026-09-16') &&
      line.includes('README.md') &&
      line.includes('## Goal-loop'),
  );
  assert.ok(
    matching,
    "expected a line in CHANGELOG.plain.md containing 'Goal-loop drill 2026-09-16', 'README.md', and '## Goal-loop' together",
  );
});

test('CHANGELOG.plain.md still contains the verbatim substring Goal-loop drill 2026-09-16 somewhere', () => {
  const content = readFileSync(CHANGELOG_PATH, 'utf8');
  assert.ok(content.includes('Goal-loop drill 2026-09-16'));
});
