// diff.js — UI controller for the live diff tool
// Attaches input listeners on both sides so the result updates on every edit.

// Inline diff computation (replaces missing diffEngine.js module)
function computeDiff(leftText, rightText) {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const hunks = [];

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

  // Traceback
  let i = m, j = n;
  const result = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      result.push({ type: 'unchanged', text: leftLines[i - 1] + '\n' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', text: rightLines[j - 1] + '\n' });
      j--;
    } else {
      result.push({ type: 'removed', text: leftLines[i - 1] + '\n' });
      i--;
    }
  }

  return result.reverse();
}

const leftEl = document.getElementById('left');
const rightEl = document.getElementById('right');
const resultEl = document.getElementById('result');

function computeAndRender() {
  const leftText = leftEl.value;
  const rightText = rightEl.value;

  // Identical inputs (including both blank)
  if (leftText === rightText) {
    if (leftText.trim() === '') {
      resultEl.textContent = 'Enter text on either side to see differences.';
    } else {
      resultEl.textContent = 'No differences — the two inputs are identical.';
    }
    resultEl.className = 'result result--empty';
    return;
  }

  // One side blank
  if (leftText.trim() === '') {
    resultEl.textContent = 'Left side is empty — all content is new on the right.';
    resultEl.className = 'result result--empty';
    return;
  }
  if (rightText.trim() === '') {
    resultEl.textContent = 'Right side is empty — all content has been removed.';
    resultEl.className = 'result result--empty';
    return;
  }

  // Compute actual diff
  const hunks = computeDiff(leftText, rightText);
  resultEl.innerHTML = renderHunks(hunks);
  resultEl.className = 'result result--diff';
}

function renderHunks(hunks) {
  if (!hunks || hunks.length === 0) {
    return '<span class="no-diff">No differences found.</span>';
  }
  return hunks.map(hunk => {
    const escapedText = escapeHtml(hunk.text);
    if (hunk.type === 'added') {
      return `<ins class="diff-added">${escapedText}</ins>`;
    } else if (hunk.type === 'removed') {
      return `<del class="diff-removed">${escapedText}</del>`;
    } else {
      return `<span class="diff-unchanged">${escapedText}</span>`;
    }
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Live listeners — recompute on every keystroke on either side
leftEl.addEventListener('input', computeAndRender);
rightEl.addEventListener('input', computeAndRender);

// Initial render on page load
computeAndRender();
