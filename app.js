import { Timer } from './timer.js';
import { MODES, LONG_BREAK_INTERVAL, TOTAL_SLOTS } from './presets.js';

// ── DOM refs ────────────────────────────────────────────────────────────────
const timerDisplay  = document.getElementById('timer-display');
const timerLabel    = document.getElementById('timer-label');
const ringProgress  = document.getElementById('ring-progress');
const btnStart      = document.getElementById('btn-start');
const btnStartLabel = document.getElementById('btn-start-label');
const btnReset      = document.getElementById('btn-reset');
const btnSkip       = document.getElementById('btn-skip');
const sessionCount  = document.getElementById('session-count');
const pomodoroDots  = document.getElementById('pomodoro-dots');
const modeTabs      = document.querySelectorAll('.mode-tab');

// ── Ring geometry ────────────────────────────────────────────────────────────
const RING_RADIUS      = 88;                          // matches SVG r="88"
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~552.9
ringProgress.style.strokeDasharray  = RING_CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = 0;

// ── App state ────────────────────────────────────────────────────────────────
let currentMode      = 'pomodoro';  // key into MODES
let completedPomodoros = 0;         // 0-based count since app load

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing(remaining, total) {
  const fraction = total > 0 ? remaining / total : 0;
  // offset = 0  → full ring (start); offset = circumference → empty ring (done)
  ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - fraction);
}

function updateDots() {
  const dots = pomodoroDots.querySelectorAll('.dot');
  const slot  = completedPomodoros % TOTAL_SLOTS; // which dot is "current"
  dots.forEach((dot, i) => {
    // Dots before the current slot in this cycle are "done" (filled darker)
    dot.classList.toggle('active',    i === slot && currentMode === 'pomodoro');
    dot.classList.toggle('completed', i < slot);
  });
}

function updateSessionDisplay() {
  // Session number = position within the current 4-slot cycle (1-based)
  const slotIndex = completedPomodoros % TOTAL_SLOTS;
  sessionCount.textContent = slotIndex + 1;
}

function setTabActive(mode) {
  modeTabs.forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function setStartButton(isRunning) {
  btnStartLabel.textContent = isRunning ? 'Pause' : 'Start';
  btnStart.setAttribute('aria-label', isRunning ? 'Pause timer' : 'Start timer');
}

// ── Timer callbacks ──────────────────────────────────────────────────────────
function onTick(remaining, total) {
  timerDisplay.textContent = formatTime(remaining);
  updateRing(remaining, total);
  // Reflect running state in button (in case of external calls)
  setStartButton(timer.running);
}

function onExpire() {
  setStartButton(false);

  if (currentMode === 'pomodoro') {
    completedPomodoros += 1;
    updateDots();
    updateSessionDisplay();

    // Choose break type
    const nextMode = completedPomodoros % LONG_BREAK_INTERVAL === 0
      ? 'long-break'
      : 'short-break';
    switchMode(nextMode);
  } else {
    // After a break, return to pomodoro
    switchMode('pomodoro');
  }
}

// ── Timer instance ───────────────────────────────────────────────────────────
const timer = new Timer({
  duration: MODES[currentMode].duration,
  onTick,
  onExpire,
});

// Render initial state
timerDisplay.textContent = formatTime(MODES[currentMode].duration);
timerLabel.textContent   = MODES[currentMode].label;
updateRing(MODES[currentMode].duration, MODES[currentMode].duration);
updateSessionDisplay();
updateDots();

// ── Mode switching ───────────────────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;
  const preset = MODES[mode];

  timer.setDuration(preset.duration);   // resets & calls onTick once
  timerLabel.textContent = preset.label;

  setTabActive(mode);
  setStartButton(false);
  updateDots();
}

// ── Button wiring ────────────────────────────────────────────────────────────
btnStart.addEventListener('click', () => {
  if (timer.running) {
    timer.pause();
    setStartButton(false);
  } else {
    timer.start();
    setStartButton(true);
  }
});

btnReset.addEventListener('click', () => {
  timer.reset();          // pauses and resets to current mode duration
  setStartButton(false);
  updateRing(timer.remaining, timer.total);
});

btnSkip.addEventListener('click', () => {
  timer.pause();
  onExpire();             // reuse the same "session ended" logic
});

// ── Tab wiring ───────────────────────────────────────────────────────────────
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;
    if (mode === currentMode) return;
    switchMode(mode);
  });
});
