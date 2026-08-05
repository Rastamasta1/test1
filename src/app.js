import { compare } from './diff.js';

const leftEl   = document.getElementById('left');
const rightEl  = document.getElementById('right');
const resultEl = document.getElementById('result');

/**
 * Render the result of compare() into the result region.
 * @param {{ status: string, message: string, hunks: Array }} result
 */
function render(result) {
  resultEl.innerHTML = '';

  if (result.status === 'empty' || result.status === 'identical') {
    const msg = document.createElement('p');
    msg.className = 'status-msg';
    msg.textContent = result.message;
    resultEl.appendChild(msg);
    return;
  }

  // status === 'diff'
  const summary = document.createElement('p');
  summary.className = 'diff-summary';
  summary.textContent = result.message;
  resultEl.appendChild(summary);

  const table = document.createElement('table');
  table.className = 'hunk-table';
  table.setAttribute('aria-label', 'Diff hunks');

  for (const hunk of result.hunks) {
    const tr = document.createElement('tr');
    tr.className = hunk.type;

    const markerTd = document.createElement('td');
    markerTd.className = 'marker';
    markerTd.setAttribute('aria-hidden', 'true');
    markerTd.textContent =
      hunk.type === 'added'     ? '+' :
      hunk.type === 'removed'   ? '-' : ' ';

    const lineTd = document.createElement('td');
    // Preserve content as text to avoid XSS
    lineTd.textContent = hunk.line;

    tr.appendChild(markerTd);
    tr.appendChild(lineTd);
    table.appendChild(tr);
  }

  resultEl.appendChild(table);
}

/**
 * Run a comparison with the current textarea values and render.
 */
function update() {
  const result = compare(leftEl.value, rightEl.value);
  render(result);
}

// ── Live listeners ────────────────────────────────────────────────────────────
// Both textareas trigger update on every keystroke / paste / cut.
leftEl.addEventListener('input',  update);
rightEl.addEventListener('input', update);

// Initial render so the result region shows the empty-state message on load.
update();
