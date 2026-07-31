/**
 * timer.js — Pure countdown timer module.
 * Accepts callbacks; holds no DOM references.
 */

export class Timer {
  /**
   * @param {{ onTick: (remaining: number) => void, onComplete: () => void }} callbacks
   */
  constructor({ onTick, onComplete }) {
    this._onTick     = onTick;
    this._onComplete = onComplete;
    this._intervalId = null;
    this._remaining  = 0;
    this._state      = 'idle'; // 'idle' | 'running' | 'paused'
  }

  /**
   * Start (or restart) the timer.
   * If paused, calling start() continues from the paused remaining time.
   * If a new duration is supplied while idle it uses that; otherwise
   * keeps the current remaining value.
   *
   * @param {number} [durationSeconds] - full duration when starting fresh
   */
  start(durationSeconds) {
    if (this._state === 'running') return;

    if (this._state === 'idle') {
      // Fresh start: set remaining to the supplied duration
      this._remaining = durationSeconds ?? this._remaining;
    }
    // 'paused' → continue from where we left off, ignore durationSeconds

    if (this._remaining <= 0) return;

    this._state = 'running';
    this._intervalId = setInterval(() => {
      this._remaining -= 1;
      this._onTick(this._remaining);
      if (this._remaining <= 0) {
        this._clearInterval();
        this._state = 'idle';
        this._onComplete();
      }
    }, 1000);
  }

  pause() {
    if (this._state !== 'running') return;
    this._clearInterval();
    this._state = 'paused';
  }

  reset() {
    this._clearInterval();
    this._remaining = 0;
    this._state = 'idle';
  }

  isRunning() {
    return this._state === 'running';
  }

  isIdle() {
    return this._state === 'idle';
  }

  _clearInterval() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}
