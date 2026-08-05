/**
 * src/page.js — page controller for the Vinyl Record Store.
 *
 * Responsibilities:
 *  - Fetch records from data/fixtures.json
 *  - Render them using renderRecords from src/render.js
 *  - Re-render when the compact toggle changes
 */

import { renderRecords } from './render.js';

// ── DOM refs ──────────────────────────────────────────────────────────────
const toggle       = document.getElementById('compact-toggle');
const recordCount  = document.getElementById('record-count');
const viewBadge    = document.getElementById('view-mode-badge');
const container    = document.getElementById('records-container');
const body         = document.body;

// ── State ─────────────────────────────────────────────────────────────────
let records = [];
let compact = false;

// ── Render ────────────────────────────────────────────────────────────────
function render() {
  container.innerHTML = renderRecords(records, compact);

  // Status bar
  recordCount.textContent = records.length === 1
    ? '1 record'
    : `${records.length} records`;

  viewBadge.textContent = compact ? 'Compact view' : 'Full view';

  // Body class drives CSS compact overrides
  body.classList.toggle('compact-mode', compact);

  // Keep aria-checked in sync
  toggle.setAttribute('aria-checked', String(compact));
}

// ── Toggle handler ────────────────────────────────────────────────────────
toggle.addEventListener('change', () => {
  compact = toggle.checked;
  render();
});

// ── Boot: fetch fixtures and render ──────────────────────────────────────
async function init() {
  try {
    const response = await fetch('data/fixtures.json');
    if (!response.ok) {
      throw new Error(`Failed to load fixtures: ${response.status} ${response.statusText}`);
    }
    records = await response.json();
  } catch (err) {
    container.innerHTML = `<p class="status-message">Error loading records: ${err.message}</p>`;
    recordCount.textContent = '0 records';
    return;
  }

  render();
}

init();
