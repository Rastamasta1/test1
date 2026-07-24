// Pomodoro timer state machine: 25/5 work/break cycles.
// Plain browser JS, no build step. Loaded as a module from index.html.

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const phaseEl = document.getElementById('phase');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const sessionCountEl = document.getElementById('session-count');

const state = {
  phase: 'work',        // 'work' | 'break'
  remaining: WORK_SECONDS,
  running: false,
  sessions: 0,
  intervalId: null,
};

function phaseDuration(phase) {
  return phase === 'work' ? WORK_SECONDS : BREAK_SECONDS;
}

function phaseLabel(phase) {
  return phase === 'work' ? 'Work' : 'Break';
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function render() {
  phaseEl.textContent = phaseLabel(state.phase);
  timerEl.textContent = formatTime(state.remaining);
  sessionCountEl.textContent = String(state.sessions);
}

// Move from the finished phase to the next one. A completed work phase
// increments the session counter before switching to a break.
function advancePhase() {
  if (state.phase === 'work') {
    state.sessions += 1;
    state.phase = 'break';
  } else {
    state.phase = 'work';
  }
  state.remaining = phaseDuration(state.phase);
}

function tick() {
  if (state.remaining > 0) {
    state.remaining -= 1;
  }
  if (state.remaining === 0) {
    advancePhase();
  }
  render();
}

function start() {
  if (state.running) return;
  state.running = true;
  state.intervalId = setInterval(tick, 1000);
}

function pause() {
  state.running = false;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

function reset() {
  pause();
  state.phase = 'work';
  state.remaining = WORK_SECONDS;
  state.sessions = 0;
  render();
}

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);

render();

export { state, start, pause, reset, tick, advancePhase, formatTime };
