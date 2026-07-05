// tests/timerState.test.js
// Zero-dependency integration test scenarios for the countdown timer flow.
// Imports the real timerState module and simulates full user flows by
// chaining the pure transition functions. Runs in the browser (tests/index.html)
// or any ESM environment. Reports results to console and, if present, the DOM.

import {
  createTimerState,
  setMinutes,
  start,
  pause,
  reset,
  tick,
  formatTime,
} from '../timerState.js';

const results = [];

function assert(cond, message) {
  if (!cond) throw new Error(message || 'Assertion failed');
}

function eq(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      (message ? message + ' — ' : '') +
        `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
    console.log('\u2714 ' + name);
  } catch (err) {
    results.push({ name, ok: false, error: err.message });
    console.error('\u2718 ' + name + ' — ' + err.message);
  }
}

// Helper: run tick() n times.
function tickN(state, n) {
  for (let i = 0; i < n; i++) state = tick(state);
  return state;
}

// --- Scenario: initial state -------------------------------------------------
test('createTimerState converts minutes to seconds', () => {
  const s = createTimerState(5);
  eq(s.setSeconds, 300);
  eq(s.remainingSeconds, 300);
  eq(s.running, false);
  eq(s.finished, false);
});

test('createTimerState clamps invalid minutes to zero', () => {
  eq(createTimerState(-3).setSeconds, 0);
  eq(createTimerState(NaN).setSeconds, 0);
  eq(createTimerState('abc').setSeconds, 0);
});

test('createTimerState clamps large minutes to 999', () => {
  eq(createTimerState(5000).setSeconds, 999 * 60);
});

// --- Scenario: set minutes ---------------------------------------------------
test('setMinutes updates duration and resets remaining, stops timer', () => {
  let s = createTimerState(1);
  s = start(s);
  s = setMinutes(s, 2);
  eq(s.setSeconds, 120);
  eq(s.remainingSeconds, 120);
  eq(s.running, false);
  eq(s.finished, false);
});

// --- Scenario: start / tick / pause / resume / finish ------------------------
test('full flow: start, tick down, pause, resume, finish', () => {
  let s = createTimerState(0);
  s = setMinutes(s, 0); // 0 minutes
  s = createTimerState(1); // 60 seconds for a real countdown

  s = start(s);
  eq(s.running, true);
  eq(s.finished, false);

  s = tickN(s, 10);
  eq(s.remainingSeconds, 50);
  eq(s.running, true);

  s = pause(s);
  eq(s.running, false);

  // ticks while paused do nothing
  s = tickN(s, 5);
  eq(s.remainingSeconds, 50);

  s = start(s); // resume
  eq(s.running, true);
  s = tickN(s, 50);
  eq(s.remainingSeconds, 0);
  eq(s.running, false);
  eq(s.finished, true);
});

test('tick does not decrement when not running', () => {
  let s = createTimerState(2);
  s = tickN(s, 3);
  eq(s.remainingSeconds, 120);
  eq(s.running, false);
});

test('tick never goes below zero', () => {
  let s = createTimerState(1);
  s = start(s);
  s = tickN(s, 100);
  eq(s.remainingSeconds, 0);
  eq(s.finished, true);
  eq(s.running, false);
});

// --- Scenario: start with nothing remaining ----------------------------------
test('start with zero remaining marks finished immediately', () => {
  let s = createTimerState(0);
  s = start(s);
  eq(s.running, false);
  eq(s.finished, true);
});

// --- Scenario: reset ---------------------------------------------------------
test('reset restores remaining to setSeconds and stops', () => {
  let s = createTimerState(3);
  s = start(s);
  s = tickN(s, 30);
  eq(s.remainingSeconds, 150);
  s = reset(s);
  eq(s.remainingSeconds, 180);
  eq(s.running, false);
  eq(s.finished, false);
});

test('reset after finish clears finished flag', () => {
  let s = createTimerState(1);
  s = start(s);
  s = tickN(s, 60);
  eq(s.finished, true);
  s = reset(s);
  eq(s.finished, false);
  eq(s.remainingSeconds, 60);
});

// --- Scenario: formatTime ----------------------------------------------------
test('formatTime pads minutes and seconds to MM:SS', () => {
  eq(formatTime(0), '00:00');
  eq(formatTime(5), '00:05');
  eq(formatTime(65), '01:05');
  eq(formatTime(600), '10:00');
  eq(formatTime(3599), '59:59');
});

test('formatTime clamps negative input to 00:00', () => {
  eq(formatTime(-10), '00:00');
});

// --- Report ------------------------------------------------------------------
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
const summary = `${passed} passed, ${failed} failed, ${results.length} total`;
console.log('\n' + summary);

if (typeof document !== 'undefined') {
  const root = document.getElementById('results');
  if (root) {
    const head = document.createElement('h2');
    head.textContent = summary;
    head.style.color = failed === 0 ? '#16a34a' : '#dc2626';
    root.appendChild(head);
    for (const r of results) {
      const li = document.createElement('div');
      li.textContent = (r.ok ? '\u2714 ' : '\u2718 ') + r.name + (r.ok ? '' : ' — ' + r.error);
      li.style.color = r.ok ? '#16a34a' : '#dc2626';
      li.style.fontFamily = 'ui-monospace, Menlo, Consolas, monospace';
      li.style.padding = '2px 0';
      root.appendChild(li);
    }
  }
}

export { results };
