/**
 * app.js — UI controller for Pomodoro Timer
 * Contains Timer (logic) and storage (localStorage) inline.
 * Wires button clicks, updates DOM each tick, increments session count on focus completion.
 */

// --- Timer class (inlined) ---
class Timer {
  constructor({ onTick, onComplete }) {
    this._onTick = onTick;
    this._onComplete = onComplete;
    this._intervalId = null;
    this._remaining = 0;
    this._running = false;
  }

  start(duration) {
    if (this._running) return;
    if (this._remaining === 0) {
      this._remaining = duration;
    }
    this._running = true;
    this._intervalId = setInterval(() => {
      this._remaining -= 1;
      this._onTick(this._remaining);
      if (this._remaining <= 0) {
        this._clearInterval();
        this._running = false;
        this._onComplete();
      }
    }, 1000);
  }

  pause() {
    this._clearInterval();
    this._running = false;
  }

  reset() {
    this._clearInterval();
    this._running = false;
    this._remaining = 0;
  }

  isRunning() {
    return this._running;
  }

  isIdle() {
    return !this._running && this._remaining === 0;
  }

  _clearInterval() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}

// --- Storage helpers (inlined) ---
const SESSION_KEY = 'pomodoro_session_count';

function getSessionCount() {
  return parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
}

function incrementSessionCount() {
  const current = getSessionCount();
  localStorage.setItem(SESSION_KEY, String(current + 1));
}

// --- DOM refs ---
const modeLabel      = document.getElementById('mode-label');
const timerDisplay   = document.getElementById('timer-display');
const btnStartPause  = document.getElementById('btn-start-pause');
const btnReset       = document.getElementById('btn-reset');
const btnModeFocus   = document.getElementById('btn-mode-focus');
const btnModeBreak   = document.getElementById('btn-mode-break');
const sessionCountEl = document.getElementById('session-count');

// --- Mode config ---
const MODES = {
  focus: { label: 'Focus Session',  seconds: 25 * 60, btnId: 'btn-mode-focus' },
  break: { label: 'Break Session',  seconds:  5 * 60, btnId: 'btn-mode-break' },
};

let currentMode = 'focus';

// --- Helpers ---
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderDisplay(seconds) {
  timerDisplay.textContent = formatTime(seconds);
}

function renderSessionCount() {
  sessionCountEl.textContent = getSessionCount();
}

function setModeBtnActive(mode) {
  btnModeFocus.classList.toggle('active', mode === 'focus');
  btnModeBreak.classList.toggle('active', mode === 'break');
}

function renderMode(mode) {
  modeLabel.textContent = MODES[mode].label;
  setModeBtnActive(mode);
  document.title = `Pomodoro — ${MODES[mode].label}`;
}

// --- Timer instance ---
const timer = new Timer({
  onTick(remaining) {
    renderDisplay(remaining);
  },
  onComplete() {
    // If a focus session just finished, increment the counter
    if (currentMode === 'focus') {
      incrementSessionCount();
      renderSessionCount();
    }
    // Stop and show the finished state
    btnStartPause.textContent = 'Start';
    renderDisplay(0);
  },
});

// --- Switch mode helper ---
function switchMode(mode) {
  if (mode === currentMode && !timer.isIdle()) {
    // Same mode clicked while running: do nothing to avoid disruption
    return;
  }
  timer.reset();
  currentMode = mode;
  renderMode(mode);
  renderDisplay(MODES[mode].seconds);
  btnStartPause.textContent = 'Start';
}

// --- Button: Start / Pause ---
btnStartPause.addEventListener('click', () => {
  if (timer.isRunning()) {
    timer.pause();
    btnStartPause.textContent = 'Resume';
  } else {
    // Start or resume
    const duration = MODES[currentMode].seconds;
    timer.start(duration);
    btnStartPause.textContent = 'Pause';
  }
});

// --- Button: Reset ---
btnReset.addEventListener('click', () => {
  timer.reset();
  renderDisplay(MODES[currentMode].seconds);
  btnStartPause.textContent = 'Start';
});

// --- Button: Mode — Focus ---
btnModeFocus.addEventListener('click', () => {
  switchMode('focus');
});

// --- Button: Mode — Break ---
btnModeBreak.addEventListener('click', () => {
  switchMode('break');
});

// --- Init ---
renderMode(currentMode);
renderDisplay(MODES[currentMode].seconds);
renderSessionCount();
