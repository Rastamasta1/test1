// app.js — UI controller
// Wires input event listeners to computeDiff and renders results live.
import { computeDiff, NOTHING_TO_COMPARE, NO_DIFFERENCES } from './src/diff.js';

const leftInput   = document.getElementById('left-input');
const rightInput  = document.getElementById('right-input');
const resultRegion = document.getElementById('result-region');

/**
 * compareInputs() — reads both textareas, calls computeDiff, and
 * re-renders the result region.  Called on every 'input' event.
 */
export function compareInputs() {
  const left  = leftInput.value;
  const right = rightInput.value;

  const result = computeDiff(left, right);
  renderResult(result);
}

/**
 * Render a diff result object into #result-region.
 * @param {{ type: string, message?: string, hunks?: Array }} result
 */
function renderResult(result) {
  // Clear previous content
  resultRegion.innerHTML = '';

  if (result.type === 'empty') {
    // Either side is blank — show placeholder message
    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = NOTHING_TO_COMPARE;
    resultRegion.appendChild(p);
    return;
  }

  if (result.type === 'identical') {
    // Both sides are identical — say so plainly
    const p = document.createElement('p');
    p.className = 'message';
    p.textContent = NO_DIFFERENCES;
    resultRegion.appendChild(p);
    return;
  }

  // type === 'diff' — render hunks
  const fragment = document.createDocumentFragment();
  for (const hunk of result.hunks) {
    const hunkEl = document.createElement('span');
    hunkEl.className = 'hunk';

    for (const lineText of hunk.lines) {
      const lineEl = document.createElement('span');
      lineEl.className = 'line ' + hunk.kind;
      lineEl.textContent = lineText;
      hunkEl.appendChild(lineEl);
    }

    fragment.appendChild(hunkEl);
  }
  resultRegion.appendChild(fragment);
}

// Attach input event listeners so the result updates on every edit
leftInput.addEventListener('input', compareInputs);
rightInput.addEventListener('input', compareInputs);

// Initial render when the page loads (both empty → nothing to compare)
compareInputs();
