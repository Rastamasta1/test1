/**
 * stats.js — renders the My Stats tab view.
 *
 * Exports:
 *   renderStats(containerEl, { onReset })  — populate the stats view element
 */

import {
  getQuestions,
  getStats,
  resetStats,
  deleteQuestion,
  updateQuestion,
} from './storage.js';

// ── Utility: escape HTML ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Render a single custom-question card ─────────────────────────────────
function renderCustomCard(q) {
  return `
    <div class="custom-q-card" data-id="${escHtml(q.id)}">
      <div class="custom-q-options">
        <strong>A:</strong> ${escHtml(q.optionA)}<br/>
        <strong>B:</strong> ${escHtml(q.optionB)}
      </div>
      <div class="custom-q-actions">
        <button class="btn btn--ghost btn--sm btn-edit-q">Edit</button>
        <button class="btn btn--danger btn--sm btn-delete-q">Delete</button>
      </div>
    </div>
  `;
}

// ── Attach edit/delete listeners on custom-question cards ─────────────────
function attachCustomCardListeners(container, onMutate) {
  container.querySelectorAll('.btn-delete-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.custom-q-card');
      const id = card.dataset.id;
      if (!confirm('Delete this question?')) return;
      deleteQuestion(id);
      onMutate();
    });
  });

  container.querySelectorAll('.btn-edit-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.custom-q-card');
      const id = card.dataset.id;
      const q = getQuestions().find(x => x.id === id);
      if (!q) return;

      card.innerHTML = `
        <form class="edit-form" id="edit-form-${escHtml(id)}">
          <div class="form-group">
            <label class="form-label" for="edit-a-${escHtml(id)}">Option A</label>
            <textarea
              id="edit-a-${escHtml(id)}"
              name="optionA"
              class="form-input"
              rows="2"
              required
            >${escHtml(q.optionA)}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-b-${escHtml(id)}">Option B</label>
            <textarea
              id="edit-b-${escHtml(id)}"
              name="optionB"
              class="form-input"
              rows="2"
              required
            >${escHtml(q.optionB)}</textarea>
          </div>
          <div class="edit-form-actions">
            <button type="submit" class="btn btn--primary btn--sm">Save</button>
            <button type="button" class="btn btn--ghost btn--sm btn-cancel-edit">Cancel</button>
          </div>
        </form>
      `;

      card.querySelector('.btn-cancel-edit').addEventListener('click', () => {
        onMutate();
      });

      card.querySelector(`#edit-form-${id}`).addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newA = formData.get('optionA').trim();
        const newB = formData.get('optionB').trim();
        if (!newA || !newB) return;
        updateQuestion(id, newA, newB);
        onMutate();
      });
    });
  });
}

/**
 * Render the My Stats tab into the given container element.
 *
 * @param {HTMLElement} el         - The #view-stats container
 * @param {object}      callbacks
 * @param {Function}    callbacks.onReset   - Called after stats are reset (e.g. to rebuild game deck)
 * @param {Function}    callbacks.onMutate  - Called after a custom question is edited/deleted
 */
export function renderStats(el, { onReset = () => {}, onMutate = () => {} } = {}) {
  const stats = getStats();
  const pct = stats.answered === 0
    ? 0
    : Math.round((stats.agreedWithMajority / stats.answered) * 100);

  const customQs = getQuestions().filter(q => !q.builtin);

  el.innerHTML = `
    <div class="stats-wrap">
      <h2 class="stats-title">My Stats</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">${stats.answered}</span>
          <span class="stat-label">Questions Answered</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${pct}%</span>
          <span class="stat-label">Agreed with Majority</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${customQs.length}</span>
          <span class="stat-label">Custom Questions</span>
        </div>
      </div>

      ${customQs.length > 0 ? `
        <p class="stats-section-title">Your Custom Questions</p>
        <div class="custom-questions-list" id="custom-q-list">
          ${customQs.map(q => renderCustomCard(q)).join('')}
        </div>
      ` : ''}

      <div class="stats-footer">
        <button class="btn btn--danger btn--sm" id="btn-reset-stats">
          Reset my stats
        </button>
      </div>
    </div>
  `;

  // Reset button
  el.querySelector('#btn-reset-stats').addEventListener('click', () => {
    if (!confirm('Reset all stats and vote history? This cannot be undone.')) return;
    resetStats();
    onReset();
    // Re-render with zeroed stats
    renderStats(el, { onReset, onMutate });
  });

  // Edit/delete listeners for custom questions
  attachCustomCardListeners(el, () => {
    onMutate();
    renderStats(el, { onReset, onMutate });
  });
}
