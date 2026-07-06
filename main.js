// main.js — Entry point for Lucky Reels.
// Wires all logic + component modules together via the game-controller and
// starts the app once the DOM is ready. This is the single bootstrap file
// loaded by index.html (type="module"). It intentionally contains no game
// logic itself — every behaviour lives in its dedicated module/component.
//
// Pipeline it activates (see game-controller.js):
//   rng.js -> spin.js -> evaluate.js (pure logic)
//   game-state.js (state)
//   reel-view.js + spin-animation-controller.js (reels + animation)
//   credits-display.js, bet-selector.js, spin-button.js (controls)
//   paytable-panel.js (paytable)
//   payline-highlight.js + win-feedback.js (casino-quality win visuals)
//   out-of-credits.js (broke state)

import { createGameController } from './game-controller.js';

function start() {
  const controller = createGameController();
  controller.init();

  // Expose for debugging in the console (non-essential).
  if (typeof window !== 'undefined') {
    window.LuckyReels = controller;
  }

  return controller;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

export { start };
export default start;
