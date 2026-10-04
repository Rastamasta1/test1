/**
 * test/lodash-version.test.mjs — guards that package-lock.json pins lodash
 * at 4.18.0 or later (the version that resolves the published ReDoS
 * advisories against 4.17.20), never the vulnerable 4.17.20 itself.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCK_PATH = join(__dirname, '..', 'package-lock.json');

const VULNERABLE_VERSION = '4.17.20';
const MIN_MAJOR = 4;
const MIN_MINOR = 18;

function loadLock() {
  const raw = readFileSync(LOCK_PATH, 'utf8');
  return JSON.parse(raw);
}

/**
 * Parse a semver-ish string's major.minor and assert it is >= the required
 * major.minor (major must match-or-exceed; if major is equal, minor must
 * be >= MIN_MINOR).
 */
function assertAtLeastMinVersion(version, label) {
  assert.notStrictEqual(version, VULNERABLE_VERSION, `${label} must not be the vulnerable ${VULNERABLE_VERSION}`);

  const match = /^(\d+)\.(\d+)(?:\.(\d+))?/.exec(version);
  assert.ok(match, `${label} ('${version}') must parse as a semver-ish version`);

  const major = Number(match[1]);
  const minor = Number(match[2]);

  const atLeast = major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR);
  assert.ok(
    atLeast,
    `${label} ('${version}') must be at least ${MIN_MAJOR}.${MIN_MINOR}`,
  );
}

test('package-lock.json node_modules/lodash entry is at least 4.18 and not the vulnerable 4.17.20', () => {
  const lock = loadLock();
  const entry = lock.packages && lock.packages['node_modules/lodash'];
  assert.ok(entry, "packages['node_modules/lodash'] must exist in package-lock.json");
  assertAtLeastMinVersion(entry.version, "packages['node_modules/lodash'].version");
});

test('package-lock.json root dependency pin for lodash is at least 4.18 and not the vulnerable 4.17.20', () => {
  const lock = loadLock();
  const rootDeps = lock.packages && lock.packages[''] && lock.packages[''].dependencies;
  assert.ok(rootDeps, "packages[''].dependencies must exist in package-lock.json");
  const version = rootDeps.lodash;
  assert.ok(version, "packages[''].dependencies.lodash must exist in package-lock.json");
  assertAtLeastMinVersion(version, "packages[''].dependencies.lodash");
});
