// app.js
// UI controller: wires the DOM to the pure timerState module and
// drives the countdown with a 1-second interval tick.

import {
  createTimerState,
  setMinutes,
  start,
  pause,
  reset,
  tick,
  formatTime,
} from './timerState.js';

const displayEl = document.getElementById('display');
const statusEl = document.getElementById('status');
const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let state = createTimerState(Number(minutesInput.value) || 0);
let intervalId = null;
// Tracks whether we've already run the one-time completion effect for the
// current finished state, so it does not re-fire on every render.
let completionHandled = false;

/**
 * Update the enabled/disabled state of the control buttons based on
 * the current timer state.
 */
function updateButtonStates() {
  startBtn.disabled = state.running || state.remainingSeconds <= 0;
  pauseBtn.disabled = !state.running;
  resetBtn.disabled =
    state.running === false &&
    state.remainingSeconds === state.setSeconds &&
    !state.finished;
}

/** Update the status message area based on the current state. */
function updateStatus() {
  if (state.finished) {
    statusEl.textContent = "Time's up!";
    statusEl.classList.add('finished');
  } else {
    statusEl.textContent = '';
    statusEl.classList.remove('finished');
  }
}

/** Render the current state to the DOM. */
function render() {
  displayEl.textContent = formatTime(state.remainingSeconds);
  displayEl.classList.toggle('finished', state.finished);
  updateStatus();
  updateButtonStates();
}

/**
 * One-time side effects to run the moment the countdown reaches zero.
 * Called from the tick loop when the timer transitions to finished.
 */
function handleCompletion() {
  if (completionHandled) return;
  completionHandled = true;
  // Ensure the interval is stopped and the UI reflects the finished state.
  stopInterval();
  // Attempt to focus the reset button so the next action is obvious.
  // Guarded because focus can throw in some environments.
  try {
    resetBtn.focus({ preventScroll: true });
  } catch (_) {
    /* ignore focus errors */
  }
}

/** Start the 1-second interval if not already running. */
function startInterval() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    state = tick(state);
    if (state.finished) {
      handleCompletion();
    } else if (!state.running) {
      stopInterval();
    }
    render();
  }, 1000);
}

/** Clear the interval. */
function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

startBtn.addEventListener('click', () => {
  completionHandled = false;
  state = start(state);
  if (state.running) {
    startInterval();
  } else if (state.finished) {
    // Started with nothing left to count -> immediate completion.
    handleCompletion();
  }
  render();
});

pauseBtn.addEventListener('click', () => {
  state = pause(state);
  stopInterval();
  render();
});

resetBtn.addEventListener('click', () => {
  completionHandled = false;
  state = reset(state);
  stopInterval();
  render();
});

minutesInput.addEventListener('input', () => {
  completionHandled = false;
  state = setMinutes(state, Number(minutesInput.value) || 0);
  stopInterval();
  render();
});

render();
