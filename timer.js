// Pure timer module — no DOM access; accepts callbacks for decoupled UI updates
// State is fully encapsulated; callers drive it via start/pause/reset/setDuration.

export class Timer {
  /**
   * @param {object} opts
   * @param {number}   opts.duration  - initial seconds
   * @param {function} opts.onTick    - called each second with (remaining, total)
   * @param {function} opts.onExpire  - called when timer reaches 0
   */
  constructor({ duration, onTick, onExpire }) {
    this._total    = duration;
    this._remaining = duration;
    this._onTick   = onTick   || (() => {});
    this._onExpire = onExpire || (() => {});
    this._intervalId = null;
  }

  get remaining() { return this._remaining; }
  get total()     { return this._total; }
  get running()   { return this._intervalId !== null; }

  start() {
    if (this.running) return;
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  pause() {
    if (!this.running) return;
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  reset() {
    this.pause();
    this._remaining = this._total;
    this._onTick(this._remaining, this._total);
  }

  /** Replace duration and restart from the new value (paused). */
  setDuration(seconds) {
    this.pause();
    this._total     = seconds;
    this._remaining = seconds;
    this._onTick(this._remaining, this._total);
  }

  _tick() {
    this._remaining -= 1;
    this._onTick(this._remaining, this._total);
    if (this._remaining <= 0) {
      this.pause();
      this._onExpire();
    }
  }
}
