/**
 * app.js — entry point for Would You Rather.
 *
 * Responsibilities:
 *  - Tab switching (Play / My Stats / Add Question)
 *  - Initialize game view via game.js
 *  - Render stats view via stats.js
 *  - Render add-question form via addQuestion.js
 */

import { initGame, resetGame } from './game.js';
import { addQuestion } from './storage.js';
import { renderStats } from './stats.js';
import { renderAddQuestion } from './addQuestion.js';
import { seedSampleIfNeeded } from './customQuestions.js';

// ── DOM refs ──────────────────────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab-btn');
const views = {
  game:  document.getElementById('view-game'),
  stats: document.getElementById('view-stats'),
  add:   document.getElementById('view-add'),
};

// ── Tab switching ─────────────────────────────────────────────────────────
function activateTab(name) {
  tabs.forEach(btn => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle('tab-btn--active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  Object.entries(views).forEach(([key, el]) => {
    if (key === name) {
      el.removeAttribute('hidden');
      el.classList.add('view--active');
    } else {
      el.setAttribute('hidden', '');
      el.classList.remove('view--active');
    }
  });

  if (name === 'stats') renderStatsView();
  if (name === 'add')   renderAddView();
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// ── Stats view ────────────────────────────────────────────────────────────
function renderStatsView() {
  renderStats(views.stats, {
    onReset: () => resetGame(),
    onMutate: () => resetGame(),
  });
}

// ── Add Question view ─────────────────────────────────────────────────────
function renderAddView() {
  renderAddQuestion(views.add, {
    onSave: () => resetGame(),
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────
seedSampleIfNeeded();
initGame(views.game);
activateTab('game');
