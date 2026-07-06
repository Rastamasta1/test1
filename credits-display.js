// credits-display.js — Reusable credits / bet / win display component for Lucky Reels.
// Pure view: renders numeric stats and plays an eased count-up animation on wins.
// Knows nothing about RNG, paytable, or spin logic. Bound to the stat elements
// declared in index.html (#credits, #bet, #win).
//
// Usage (from ui.js):
//   import { createCreditsDisplay } from './credits-display.js';
//   const display = createCreditsDisplay({
//     credits: document.getElementById('credits'),
//     bet: document.getElementById('bet'),
//     win: document.getElementById('win'),
//   });
//   display.setCredits(1000);
//   display.countUpWin(250, { onDone: (v) => display.setCredits(state.credits) });

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// easeOutCubic for a lively-but-settling count-up.
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function fmt(n) {
  return Math.round(n).toLocaleString();
}

// Create a credits-display controller bound to the given stat elements.
// els: { credits, bet, win } — any may be omitted; calls are no-ops if missing.
export function createCreditsDisplay(els = {}) {
  const creditsEl = els.credits || document.getElementById('credits');
  const betEl = els.bet || document.getElementById('bet');
  const winEl = els.win || document.getElementById('win');

  let winRaf = null;
  let creditsRaf = null;

  function cancelWinTween() {
    if (winRaf) {
      cancelAnimationFrame(winRaf);
      winRaf = null;
    }
  }

  function cancelCreditsTween() {
    if (creditsRaf) {
      cancelAnimationFrame(creditsRaf);
      creditsRaf = null;
    }
  }

  function setCredits(value) {
    if (creditsEl) creditsEl.textContent = fmt(value);
  }

  function setBet(value) {
    if (betEl) betEl.textContent = fmt(value);
  }

  // Instantly set the win value (used to reset to 0 on a new spin).
  function setWin(value) {
    cancelWinTween();
    if (winEl) {
      winEl.textContent = fmt(value);
      winEl.classList.remove('is-counting', 'is-win-flash');
    }
  }

  // Eased count-up on the win value from `from` -> `target`.
  // opts: { duration=800, from=0, onDone(target) }
  function countUpWin(target, opts = {}) {
    cancelWinTween();
    if (!winEl) return Promise.resolve(target);

    const from = typeof opts.from === 'number' ? opts.from : 0;
    const duration = typeof opts.duration === 'number' ? opts.duration : 800;

    // Reduced motion / non-positive: snap to final value with a subtle flash.
    if (prefersReducedMotion() || target <= from || duration <= 0) {
      winEl.textContent = fmt(target);
      if (target > 0) {
        winEl.classList.add('is-win-flash');
        setTimeout(() => winEl.classList.remove('is-win-flash'), 600);
      }
      if (typeof opts.onDone === 'function') opts.onDone(target);
      return Promise.resolve(target);
    }

    winEl.classList.add('is-counting');

    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        const value = from + (target - from) * eased;
        winEl.textContent = fmt(value);
        if (t < 1) {
          winRaf = requestAnimationFrame(step);
        } else {
          winRaf = null;
          winEl.textContent = fmt(target);
          winEl.classList.remove('is-counting');
          winEl.classList.add('is-win-flash');
          setTimeout(() => winEl.classList.remove('is-win-flash'), 600);
          if (typeof opts.onDone === 'function') opts.onDone(target);
          resolve(target);
        }
      };
      winRaf = requestAnimationFrame(step);
    });
  }

  // Optionally animate the credits counter tween (e.g. after a win is banked).
  // opts: { duration=700, onDone(target) }
  function animateCreditsChange(from, target, opts = {}) {
    cancelCreditsTween();
    if (!creditsEl) return Promise.resolve(target);

    const duration = typeof opts.duration === 'number' ? opts.duration : 700;

    if (prefersReducedMotion() || duration <= 0 || from === target) {
      creditsEl.textContent = fmt(target);
      if (typeof opts.onDone === 'function') opts.onDone(target);
      return Promise.resolve(target);
    }

    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        const value = from + (target - from) * eased;
        creditsEl.textContent = fmt(value);
        if (t < 1) {
          creditsRaf = requestAnimationFrame(step);
        } else {
          creditsRaf = null;
          creditsEl.textContent = fmt(target);
          if (typeof opts.onDone === 'function') opts.onDone(target);
          resolve(target);
        }
      };
      creditsRaf = requestAnimationFrame(step);
    });
  }

  function cancel() {
    cancelWinTween();
    cancelCreditsTween();
  }

  return {
    creditsEl,
    betEl,
    winEl,
    setCredits,
    setBet,
    setWin,
    countUpWin,
    animateCreditsChange,
    cancel,
  };
}

export default createCreditsDisplay;
