// timerState.js
// Pure data model for the countdown timer. No DOM, no timers here —
// just state and pure transition functions. UI code drives this module.

/**
 * @typedef {Object} TimerState
 * @property {number} setSeconds       - the configured duration in seconds (from minutes input)
 * @property {number} remainingSeconds - seconds left on the countdown
 * @property {boolean} running         - whether the timer is actively counting down
 * @property {boolean} finished        - whether the countdown reached zero
 */

/**
 * Create a fresh timer state from a given number of minutes.
 * @param {number} minutes
 * @returns {TimerState}
 */
export function createTimerState(minutes = 0) {
  const setSeconds = clampSeconds(minutes) ;
  return {
    setSeconds,
    remainingSeconds: setSeconds,
    running: false,
    finished: false,
  };
}

/**
 * Set the configured duration (in minutes) and reset the remaining time to it.
 * Stops the timer.
 * @param {TimerState} state
 * @param {number} minutes
 * @returns {TimerState}
 */
export function setMinutes(state, minutes) {
  const setSeconds = clampSeconds(minutes);
  return {
    ...state,
    setSeconds,
    remainingSeconds: setSeconds,
    running: false,
    finished: false,
  };
}

/**
 * Start (or resume) the countdown. No-op if already finished with 0 remaining.
 * @param {TimerState} state
 * @returns {TimerState}
 */
export function start(state) {
  if (state.remainingSeconds <= 0) {
    return { ...state, running: false, finished: true };
  }
  return { ...state, running: true, finished: false };
}

/**
 * Pause the countdown.
 * @param {TimerState} state
 * @returns {TimerState}
 */
export function pause(state) {
  return { ...state, running: false };
}

/**
 * Reset remaining time back to the configured duration and stop.
 * @param {TimerState} state
 * @returns {TimerState}
 */
export function reset(state) {
  return {
    ...state,
    remainingSeconds: state.setSeconds,
    running: false,
    finished: false,
  };
}

/**
 * Advance the countdown by one second. Only decrements when running.
 * Marks finished and stops when it hits zero.
 * @param {TimerState} state
 * @returns {TimerState}
 */
export function tick(state) {
  if (!state.running) return state;
  const remainingSeconds = Math.max(0, state.remainingSeconds - 1);
  const finished = remainingSeconds === 0;
  return {
    ...state,
    remainingSeconds,
    running: !finished,
    finished,
  };
}

/**
 * Format a number of seconds as MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Clamp minutes into a valid range (0..999) and convert to whole seconds.
 * @param {number} minutes
 * @returns {number}
 */
function clampSeconds(minutes) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m < 0) return 0;
  const clamped = Math.min(999, Math.floor(m));
  return clamped * 60;
}
