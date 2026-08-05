// Payout / rule constants — exported so tests can verify them
export const MSG_NOTHING_TO_COMPARE = 'Nothing to compare — please enter text on both sides.';
export const MSG_NO_DIFFERENCES = 'No differences — the two inputs are identical.';

/**
 * Compute a line-level diff between two strings.
 *
 * @param {string} left  - The left / original input.
 * @param {string} right - The right / changed input.
 * @returns {{ status: 'empty'|'identical'|'diff', message: string, hunks: Array }}
 *   status  – machine-readable outcome
 *   message – human-readable summary suitable for the result region
 *   hunks   – array of { type: 'added'|'removed'|'unchanged', line: string }
 */
export function compare(left, right) {
  // ── Blank-input guard ────────────────────────────────────────────────────
  // If either side is empty (or contains only whitespace) we cannot produce a
  // meaningful diff, so return early with a clear user-facing message.
  if (!left || !left.trim() || !right || !right.trim()) {
    return {
      status: 'empty',
      message: MSG_NOTHING_TO_COMPARE,
      hunks: [],
    };
  }

  // ── Line splitting ───────────────────────────────────────────────────────
  const leftLines  = left.split('\n');
  const rightLines = right.split('\n');

  // ── Identical-input guard ────────────────────────────────────────────────
  if (left === right) {
    return {
      status: 'identical',
      message: MSG_NO_DIFFERENCES,
      hunks: leftLines.map(line => ({ type: 'unchanged', line })),
    };
  }

  // ── Simple LCS-based line diff ───────────────────────────────────────────
  const hunks = lcsLineDiff(leftLines, rightLines);

  return {
    status: 'diff',
    message: `${hunks.filter(h => h.type !== 'unchanged').length} change(s) found.`,
    hunks,
  };
}

// ── Longest Common Subsequence (line-level) ──────────────────────────────────
// Pure function: (string[], string[]) -> hunk[]
function lcsLineDiff(left, right) {
  const m = left.length;
  const n = right.length;

  // Build LCS length table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build hunks
  const hunks = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      hunks.unshift({ type: 'unchanged', line: left[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      hunks.unshift({ type: 'added', line: right[j - 1] });
      j--;
    } else {
      hunks.unshift({ type: 'removed', line: left[i - 1] });
      i--;
    }
  }

  return hunks;
}
