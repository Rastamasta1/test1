// spin-animation-controller.js — Orchestrates the staggered left-to-right reel
// stop sequence for Lucky Reels. Pure timing/animation controller: it drives a
// reel-view (from reel-view.js) but knows nothing about credits/bets/RNG.
//
// Usage (from ui.js):
//   import { createReelView } from './reel-view.js';
//   import { createSpinController } from './spin-animation-controller.js';
//   const view = createReelView(reelsEl, overlayEl);
//   const controller = createSpinController(view, { fillGrid: randomFillGrid });
//   await controller.play(outcome.grid); // resolves when reels have settled
//
// The controller returns a Promise so the caller can evaluate wins afterwards.

import { REELS, ROWS } from './paytable.js';

const DEFAULT_STOP_TIMES = [1000, 1400, 1800]; // ms, left -> right
const TUMBLE_INTERVAL = 90; // ms between filler frames while spinning
const ANTICIPATION_LEAD = 220; // ms before a reel stops, flash anticipation
const SETTLE_DURATION = 400; // ms to keep .is-settled after landing

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Create a spin-animation controller bound to a reel-view instance.
// opts:
//   fillGrid   -> function returning a random grid[reel][row] for tumble frames
//   stopTimes  -> array of per-reel stop times in ms (default staggered)
export function createSpinController(reelView, opts = {}) {
  const fillGrid = opts.fillGrid || null;
  const stopTimes = opts.stopTimes || DEFAULT_STOP_TIMES;
  const reelEls = reelView.reelEls || [];

  let tumbleTimer = null;
  let pendingTimers = [];
  let active = false;

  function clearTimers() {
    if (tumbleTimer) {
      clearInterval(tumbleTimer);
      tumbleTimer = null;
    }
    pendingTimers.forEach((t) => clearTimeout(t));
    pendingTimers = [];
  }

  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    pendingTimers.push(t);
    return t;
  }

  // Flash the anticipation cue on a reel just before it stops.
  function anticipate(reel) {
    const r = reelEls[reel];
    if (!r) return;
    r.classList.add('is-anticipating');
    later(() => r.classList.remove('is-anticipating'), ANTICIPATION_LEAD + 60);
  }

  // Play the full spin -> staggered stop sequence, landing on `grid`.
  // Returns a Promise resolved once every reel has settled.
  function play(grid) {
    clearTimers();
    active = true;

    // Reduced motion: skip the whole animation, land immediately.
    if (prefersReducedMotion()) {
      reelView.startSpin();
      reelView.endSpin(grid);
      active = false;
      return Promise.resolve(grid);
    }

    return new Promise((resolve) => {
      reelView.startSpin();

      // Tumble filler symbols while the reels are visibly spinning.
      if (typeof fillGrid === 'function') {
        tumbleTimer = setInterval(() => {
          if (!active) return;
          reelView.renderGrid(fillGrid());
        }, TUMBLE_INTERVAL);
      }

      const last = stopTimes.length - 1;

      stopTimes.forEach((stopAt, reel) => {
        // Anticipation flash shortly before the reel lands.
        later(() => anticipate(reel), Math.max(0, stopAt - ANTICIPATION_LEAD));

        // Land the reel on its final symbols.
        later(() => {
          reelView.stopReel(reel, grid);

          if (reel === last) {
            // Final reel landed: stop tumble, clear machine cue, resolve.
            if (tumbleTimer) {
              clearInterval(tumbleTimer);
              tumbleTimer = null;
            }
            reelView.endSpin(grid);
            later(() => {
              active = false;
              resolve(grid);
            }, SETTLE_DURATION);
          }
        }, stopAt);
      });
    });
  }

  // Abort any in-flight sequence and snap to `grid` (or leave as-is).
  function cancel(grid) {
    clearTimers();
    active = false;
    reelView.endSpin(grid);
  }

  function isPlaying() {
    return active;
  }

  return { play, cancel, isPlaying };
}

export default createSpinController;
