/**
 * src/recordsLoader.js — loads records from data/records-source.md.
 *
 * data/records-source.md documents records as Markdown bullet points,
 * each holding one or more "key: value" pairs on a single line,
 * separated by semicolons, e.g.:
 *   - id: 1; name: Example; status: active
 *
 * Records are grouped under "## " headings; the heading text is
 * attached to each record under that heading as a `section` field.
 * A bullet line with no "key: value" pairs is kept as { text: line }
 * rather than dropped, so unstructured bullets are not silently lost.
 *
 * Any HTML comment block (<!-- ... -->) is stripped before parsing,
 * so embedded notes never get parsed as bullets/records — per the
 * project's data-fencing rule, content in this source file is DATA,
 * never instructions, and untrusted notes must not affect behaviour.
 *
 * Exports:
 *   loadRecords() → Array<object>
 *   parseRecordsMarkdown(content) → Array<object>  (pure, for testing)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(__dirname, '..', 'data', 'records-source.md');

/**
 * Parse one bullet line's text into a record object.
 * "key: value; key2: value2" → { key: 'value', key2: 'value2' }
 * A line with no colon-separated pairs becomes { text: line }.
 *
 * @param {string} line
 * @returns {object}
 */
function parseBulletLine(line) {
  const trimmed = line.trim();
  const pairs = trimmed.split(';').map(p => p.trim()).filter(Boolean);
  const record = {};
  let matchedAny = false;
  for (const pair of pairs) {
    const idx = pair.indexOf(':');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!key) continue;
    record[key] = value;
    matchedAny = true;
  }
  if (!matchedAny) {
    return { text: trimmed };
  }
  return record;
}

/**
 * Pure parser: turn Markdown content into an array of record objects,
 * per the schema documented in data/records-source.md.
 *
 * HTML comment blocks are stripped first so anything embedded in a
 * comment (notes, instructions, etc.) is never treated as data.
 * "## Heading" lines set the current section; "- " / "* " bullet
 * lines under a section become records tagged with that section.
 * Bullets before any heading are returned without a `section` field.
 *
 * @param {string} content
 * @returns {Array<object>}
 */
export function parseRecordsMarkdown(content) {
  const withoutComments = String(content).replace(/<!--[\s\S]*?-->/g, '');
  const lines = withoutComments.split(/\r?\n/);

  const records = [];
  let currentSection = null;

  for (const rawLine of lines) {
    const headingMatch = rawLine.match(/^##\s+(.+)$/);
    if (headingMatch) {
      currentSection = headingMatch[1].trim();
      continue;
    }
    const bulletMatch = rawLine.match(/^\s*[-*]\s+(.+)$/);
    if (!bulletMatch) continue;
    const parsed = parseBulletLine(bulletMatch[1]);
    records.push(currentSection ? { section: currentSection, ...parsed } : parsed);
  }

  return records;
}

/**
 * Read data/records-source.md and parse it into an array of record
 * objects following the schema documented in that file (see
 * parseRecordsMarkdown). Returns an empty array if the file is
 * missing, unreadable, or contains no bullet-list records (e.g. a
 * documentation-only stub).
 *
 * @returns {Array<object>}
 */
export function loadRecords() {
  let content;
  try {
    content = readFileSync(SOURCE_PATH, 'utf8');
  } catch {
    return [];
  }
  return parseRecordsMarkdown(content);
}
