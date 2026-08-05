// diff.js — pure ES module for computing line-by-line diffs
// Exports: computeDiff(left, right) -> { type, lines } result object

export const NOTHING_TO_COMPARE = 'Nothing to compare';
export const NO_DIFFERENCES = 'No differences';

/**
 * Compute a line-by-line diff between two strings.
 *
 * @param {string} left  - Left/original side text
 * @param {string} right - Right/modified side text
 * @returns {{ type: 'empty'|'identical'|'diff', message?: string, hunks?: Array }}
 */
export function computeDiff(left, right) {
  // Blank-input guard: if either side is empty (or whitespace-only), say so plainly
  const leftTrimmed = (left ?? '').trim();
  const rightTrimmed = (right ?? '').trim();

  if (leftTrimmed === '' || rightTrimmed === '') {
    return { type: 'empty', message: NOTHING_TO_COMPARE };
  }

  const leftLines = left.split('\n');
  const rightLines = right.split('\n');

  // Identical content check
  if (left === right) {
    return { type: 'identical', message: NO_DIFFERENCES };
  }

  // Compute LCS-based diff
  const hunks = lcsLineDiff(leftLines, rightLines);

  return { type: 'diff', hunks };
}

/**
 * LCS-based line diff.
 * Returns an array of hunk objects:
 *   { kind: 'equal'|'removed'|'added', lines: string[] }
 */
function lcsLineDiff(leftLines, rightLines) {
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff operations
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      ops.push({ kind: 'equal', line: leftLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ kind: 'added', line: rightLines[j - 1] });
      j--;
    } else {
      ops.push({ kind: 'removed', line: leftLines[i - 1] });
      i--;
    }
  }
  ops.reverse();

  // Collapse consecutive same-kind ops into hunks
  const hunks = [];
  for (const op of ops) {
    if (hunks.length > 0 && hunks[hunks.length - 1].kind === op.kind) {
      hunks[hunks.length - 1].lines.push(op.line);
    } else {
      hunks.push({ kind: op.kind, lines: [op.line] });
    }
  }

  return hunks;
}
