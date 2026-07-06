// win-feedback.js — Reusable win/lose visual feedback component for Lucky Reels.
// Provides casino-quality reactions to a spin result: tiered celebrations
// (small / big / mega / jackpot) with a gold coin+spark burst, a banner, a
// machine glow flash, and subtle lose feedback. Pure view: knows nothing about
// RNG, paytable, or spin logic. The caller (ui.js) passes the evaluated result.
//
// Bound to markup in index.html: #machine, #reels, #message.
// Complements payline-highlight.js (line visuals) + credits-display.js (count-up).
//
// Usage (from ui.js):
//   import { createWinFeedback } from './win-feedback.js';
//   const feedback = createWinFeedback({
//     machine: document.getElementById('machine'),
//     reels: document.getElementById('reels'),
//     message: document.getElementById('message'),
//   });
//   feedback.win(result.totalWin, state.bet);  // celebrate a win
//   feedback.lose();                            // subtle no-win feedback
//   feedback.reset();                           // clear message + effects

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Classify a win by its multiple of the total bet.
// Returns { tier, label } — tier drives visual intensity.
function classifyWin(win, bet) {
  if (win <= 0) return { tier: 'none', label: '' };
  const ratio = bet > 0 ? win / bet : win;
  if (ratio >= 50) return { tier: 'jackpot', label: 'JACKPOT!' };
  if (ratio >= 20) return { tier: 'mega', label: 'MEGA WIN!' };
  if (ratio >= 5) return { tier: 'big', label: 'BIG WIN!' };
  return { tier: 'small', label: 'WIN!' };
}

// Coin / spark glyphs used in the burst.
const BURST_GLYPHS = ['\u{1F4B0}', '\u{1F4B5}', '\u2728', '\u{1F31F}', '\u{1F48E}'];

export function createWinFeedback(opts = {}) {
  const machine = opts.machine || document.getElementById('machine');
  const reels = opts.reels || document.getElementById('reels');
  const message = opts.message || document.getElementById('message');

  let timers = [];
  let overlay = null;
  let banner = null;

  function clearTimers() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  }

  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }

  // Lazily create the burst overlay layer inside the reels container.
  function ensureOverlay() {
    if (overlay && overlay.isConnected) return overlay;
    const host = reels || machine;
    if (!host) return null;
    overlay = document.createElement('div');
    overlay.className = 'win-feedback__overlay';
    overlay.setAttribute('aria-hidden', 'true');
    host.appendChild(overlay);
    return overlay;
  }

  // Spawn `count` coin/spark particles that arc up and fade.
  function coinBurst(count) {
    const layer = ensureOverlay();
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'win-feedback__coin';
      p.textContent = BURST_GLYPHS[i % BURST_GLYPHS.length];
      const startX = 20 + Math.random() * 60; // vw-ish percent across
      const driftX = (Math.random() - 0.5) * 60; // horizontal drift
      const rise = 40 + Math.random() * 45; // how high it flies (%)
      const delay = Math.random() * 260;
      const dur = 900 + Math.random() * 700;
      const rot = (Math.random() - 0.5) * 720;
      p.style.setProperty('--start-x', startX + '%');
      p.style.setProperty('--drift-x', driftX + '%');
      p.style.setProperty('--rise', rise + '%');
      p.style.setProperty('--delay', delay + 'ms');
      p.style.setProperty('--dur', dur + 'ms');
      p.style.setProperty('--rot', rot + 'deg');
      layer.appendChild(p);
      later(() => p.remove(), delay + dur + 60);
    }
  }

  // Show a large celebratory banner for a limited time.
  function showBanner(label, tier) {
    const host = machine || reels;
    if (!host || !label) return;
    if (banner && banner.isConnected) banner.remove();
    banner = document.createElement('div');
    banner.className = 'win-feedback__banner win-feedback__banner--' + tier;
    banner.textContent = label;
    banner.setAttribute('role', 'status');
    host.appendChild(banner);
    // Force reflow then animate in.
    void banner.offsetWidth;
    banner.classList.add('is-shown');
    const hold = tier === 'jackpot' ? 2600 : tier === 'mega' ? 2200 : 1800;
    const el = banner;
    later(() => {
      el.classList.remove('is-shown');
      later(() => el.remove(), 400);
    }, hold);
  }

  // Flash the machine shell with a gold glow pulse for the win tier.
  function flashMachine(tier) {
    if (!machine) return;
    const cls = 'is-win-flash win-tier--' + tier;
    machine.classList.add('is-win-flash', 'win-tier--' + tier);
    later(() => {
      machine.classList.remove('is-win-flash', 'win-tier--' + tier);
    }, tier === 'jackpot' ? 1600 : 900);
    return cls;
  }

  // Update the message line with win styling.
  function setWinMessage(win, label) {
    if (!message) return;
    message.classList.remove('is-lose');
    message.classList.add('is-win');
    message.textContent = label
      ? `${label} You won ${Number(win).toLocaleString()}!`
      : `You won ${Number(win).toLocaleString()}!`;
  }

  function setLoseMessage() {
    if (!message) return;
    message.classList.remove('is-win');
    message.classList.add('is-lose');
    message.textContent = 'No win \u2014 spin again!';
  }

  // PUBLIC: celebrate a win of `win` credits at `bet`.
  function win(winAmount, bet) {
    clearWorkVisuals();
    const { tier, label } = classifyWin(winAmount, bet);
    if (tier === 'none') {
      lose();
      return { tier, label };
    }
    setWinMessage(winAmount, label);

    if (prefersReducedMotion()) {
      // Keep it calm: message + a single static banner-less state.
      return { tier, label };
    }

    flashMachine(tier);

    const counts = { small: 8, big: 16, mega: 26, jackpot: 40 };
    coinBurst(counts[tier] || 10);

    if (tier !== 'small') {
      showBanner(label, tier);
      // A second delayed burst for the bigger tiers adds a shower feel.
      if (tier === 'mega' || tier === 'jackpot') {
        later(() => coinBurst((counts[tier] || 20) / 2), 420);
      }
    }
    return { tier, label };
  }

  // PUBLIC: subtle no-win feedback.
  function lose() {
    clearWorkVisuals();
    setLoseMessage();
    if (prefersReducedMotion() || !reels) return;
    reels.classList.add('is-lose-dim');
    later(() => reels.classList.remove('is-lose-dim'), 500);
  }

  // Clear transient visuals (banners, particles) without touching the message.
  function clearWorkVisuals() {
    clearTimers();
    if (overlay) overlay.innerHTML = '';
    if (banner && banner.isConnected) banner.remove();
    banner = null;
    if (machine) {
      machine.classList.remove(
        'is-win-flash',
        'win-tier--small',
        'win-tier--big',
        'win-tier--mega',
        'win-tier--jackpot'
      );
    }
    if (reels) reels.classList.remove('is-lose-dim');
  }

  // PUBLIC: fully reset feedback (e.g. at the start of a new spin).
  function reset() {
    clearWorkVisuals();
    if (message) {
      message.textContent = '';
      message.classList.remove('is-win', 'is-lose');
    }
  }

  return {
    machine,
    reels,
    message,
    classifyWin,
    win,
    lose,
    reset,
    coinBurst,
    showBanner,
  };
}

export default createWinFeedback;
