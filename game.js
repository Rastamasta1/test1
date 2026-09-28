/**
 * game.js — renders the current question with two choice cards,
 * handles voting (records via storage.js), blocks double-voting
 * the same question in one session, and shows vote-split reveal.
 *
 * Public API:
 *   initGame(containerEl)  — mount the game view into containerEl
 *   resetGame()            — re-shuffle and restart (used by stats reset)
 */

import {
  getQuestions,
  recordVote,
  getVotes,
  getSessionVotes,
  recordSessionVote,
} from './storage.js';
import { escHtml } from './escapeHtml.js';

// ── Shuffle (Fisher-Yates) ─────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Module state ──────────────────────────────────────────────────────────
let deck = [];          // shuffled question list for this session
let currentIndex = 0;  // pointer into deck
let container = null;  // mounted DOM element
let currentQuestion = null;  // question object shown by the last renderQuestion call
let currentRevealed = false; // whether the currently shown card has been answered
let keydownInstalled = false; // guard so the document listener is only added once

// ── Public: decide what a keypress does (pure) ────────────────────────────
export function keyAction(key, revealed) {
  if (!revealed) {
    if (key === 'a' || key === 'A') return 'A';
    if (key === 'b' || key === 'B') return 'B';
    return null;
  }
  if (key === 'Enter' || key === 'n' || key === 'N') return 'next';
  return null;
}

// ── Public: class modifier for a card chosen via keyboard (pure) ──────────
export function keyPulseClass(fromKey) {
  return fromKey ? ' choice-card--keypulse' : '';
}

// ── Public: mount game view ───────────────────────────────────────────────
export function initGame(containerEl) {
  container = containerEl;
  startSession();
  if (!keydownInstalled) {
    document.addEventListener('keydown', handleKeydown);
    keydownInstalled = true;
  }
}

// ── Handle a document-level keydown ──────────────────────────────────────
function handleKeydown(event) {
  const tag = event.target && event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  const action = keyAction(event.key, currentRevealed);
  if (!action || !currentQuestion) return;

  if (action === 'A') {
    handleChoice(currentQuestion, 'a', true);
  } else if (action === 'B') {
    handleChoice(currentQuestion, 'b', true);
  } else if (action === 'next') {
    handleNext();
  }
}

// ── Public: restart (e.g. after stats reset) ─────────────────────────────
export function resetGame() {
  if (container) startSession();
}

// ── Build a fresh shuffled deck and render first card ─────────────────────
function startSession() {
  deck = shuffle(getQuestions());
  currentIndex = 0;
  renderCurrent();
}

// ── Render the current question (or the "all done" screen) ────────────────
function renderCurrent() {
  if (!container) return;

  if (deck.length === 0) {
    renderEmpty();
    return;
  }

  // Skip questions already answered this session
  while (currentIndex < deck.length) {
    const q = deck[currentIndex];
    const sv = getSessionVotes();
    if (!sv[q.id]) break;   // not yet voted this session → show it
    currentIndex++;
  }

  if (currentIndex >= deck.length) {
    renderDone();
    return;
  }

  const question = deck[currentIndex];
  renderQuestion(question, false, false);
}

// ── Render a single question with choice cards ───────────────────────────
function renderQuestion(question, revealed, fromKey) {
  currentQuestion = question;
  currentRevealed = revealed;

  const votes = getVotes(question.id);   // { a: number, b: number }
  const sessionVotes = getSessionVotes();
  const alreadyVoted = !!sessionVotes[question.id];  // double-vote guard

  const totalAfter = votes.a + votes.b;
  const pctA = totalAfter === 0 ? 50 : Math.round((votes.a / totalAfter) * 100);
  const pctB = 100 - pctA;

  const progressNum = Math.min(currentIndex + 1, deck.length);
  const progressTotal = deck.length;

  container.innerHTML = `
    <div class="game-wrap">
      <div class="progress-bar-wrap" aria-label="Question ${progressNum} of ${progressTotal}">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${Math.round((progressNum / progressTotal) * 100)}%"></div>
        </div>
        <span class="progress-label">${progressNum} / ${progressTotal}</span>
      </div>

      <p class="wyr-prompt">Would you rather…</p>

      <div class="cards-row">
        <!-- Option A -->
        <button
          class="choice-card choice-card--a${revealed ? ' choice-card--revealed' : ''}${alreadyVoted && sessionVotes[question.id] === 'a' ? ' choice-card--chosen' + keyPulseClass(fromKey) : ''}"
          data-choice="a"
          ${alreadyVoted ? 'disabled aria-disabled="true"' : ''}
          aria-label="Choose: ${escHtml(question.optionA)}"
        >
          <span class="choice-letter" aria-hidden="true">A</span>
          <span class="choice-text">${escHtml(question.optionA)}</span>
          ${revealed ? `
            <span class="vote-bar-wrap" aria-label="${pctA}% chose this">
              <span class="vote-bar vote-bar--a" style="width:${pctA}%"></span>
            </span>
            <span class="vote-pct">${pctA}%</span>
          ` : ''}
        </button>

        <span class="or-divider" aria-hidden="true">or</span>

        <!-- Option B -->
        <button
          class="choice-card choice-card--b${revealed ? ' choice-card--revealed' : ''}${alreadyVoted && sessionVotes[question.id] === 'b' ? ' choice-card--chosen' + keyPulseClass(fromKey) : ''}"
          data-choice="b"
          ${alreadyVoted ? 'disabled aria-disabled="true"' : ''}
          aria-label="Choose: ${escHtml(question.optionB)}"
        >
          <span class="choice-letter" aria-hidden="true">B</span>
          <span class="choice-text">${escHtml(question.optionB)}</span>
          ${revealed ? `
            <span class="vote-bar-wrap" aria-label="${pctB}% chose this">
              <span class="vote-bar vote-bar--b" style="width:${pctB}%"></span>
            </span>
            <span class="vote-pct">${pctB}%</span>
          ` : ''}
        </button>
      </div>

      <p class="keys-hint">Keys: A · B · Enter</p>

      ${revealed || alreadyVoted ? `
        <div class="reveal-footer">
          ${alreadyVoted && !revealed ? '<p class="already-voted-msg">You already answered this one this session.</p>' : ''}
          <button class="btn btn--next" id="btn-next">Next question ›</button>
        </div>
      ` : ''}
    </div>
  `;

  // Attach listeners
  container.querySelectorAll('.choice-card:not([disabled])').forEach(card => {
    card.addEventListener('click', () => handleChoice(question, card.dataset.choice, false));
  });

  const nextBtn = container.querySelector('#btn-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', handleNext);
  }
}

// ── Handle a choice click or keypress ────────────────────────────────────
function handleChoice(question, choice, fromKey) {
  // Guard: block double-voting this session
  const sv = getSessionVotes();
  if (sv[question.id]) return;

  // Record in persistent storage and session
  recordVote(question.id, choice);
  recordSessionVote(question.id, choice);

  // Re-render with reveal
  renderQuestion(question, true, fromKey);
}

// ── Handle Next button ───────────────────────────────────────────────────
function handleNext() {
  currentIndex++;
  renderCurrent();
}

// ── Empty deck screens ───────────────────────────────────────────────────
function renderDone() {
  container.innerHTML = `
    <div class="game-wrap game-wrap--done">
      <div class="done-icon" aria-hidden="true">🎉</div>
      <h2 class="done-title">You've answered every question!</h2>
      <p class="done-sub">Add more in the <strong>Add Question</strong> tab, or shuffle again.</p>
      <button class="btn btn--primary" id="btn-restart">Shuffle &amp; Play Again</button>
    </div>
  `;
  container.querySelector('#btn-restart').addEventListener('click', () => {
    startSession();
  });
}

function renderEmpty() {
  container.innerHTML = `
    <div class="game-wrap game-wrap--done">
      <div class="done-icon" aria-hidden="true">🤔</div>
      <h2 class="done-title">No questions yet!</h2>
      <p class="done-sub">Head to <strong>Add Question</strong> to create your first one.</p>
    </div>
  `;
}
