// out-of-credits.js — Reusable out-of-credits state component for Lucky Reels.
// Manages the #out-of-credits banner + #reset button declared in index.html.
// Pure view/controller: knows nothing about RNG, paytable, or spin logic. It
// decides whether the player can still afford the smallest bet, reveals the
// banner when broke, and fires an onReset callback when Reset Credits is
// pressed.
//
// Usage (from ui.js):
//   import { createOutOfCredits } from './out-of-credits.js';
//   const ooc = createOutOfCredits({
//     panel: document.getElementById('out-of-credits'),
//     resetButton: document.getElementById('reset'),
//     minBet: 10,
//     onReset: () => { state.credits = START_CREDITS; /* re-render */ },
//   });
//   ooc.update(state.credits);  // call after every spin / bet change

export function createOutOfCredits(opts = {}) {
  const panel = opts.panel || document.getElementById('out-of-credits');
  const resetButton = opts.resetButton || document.getElementById('reset');
  const onReset = typeof opts.onReset === 'function' ? opts.onReset : null;
  const minBet = typeof opts.minBet === 'number' ? opts.minBet : 10;

  let broke = false;

  function isBroke() {
    return broke;
  }

  function show() {
    if (panel) {
      panel.hidden = false;
      panel.classList.add('is-shown');
    }
  }

  function hide() {
    if (panel) {
      panel.hidden = true;
      panel.classList.remove('is-shown');
    }
  }

  // Recompute broke state from current credits and reflect it in the DOM.
  // Returns true if the player is now out of credits.
  function update(credits) {
    const nowBroke = typeof credits === 'number' && credits < minBet;
    if (nowBroke === broke) {
      // Keep DOM in sync in case it drifted.
      if (nowBroke) show();
      else hide();
      return broke;
    }
    broke = nowBroke;
    if (broke) show();
    else hide();
    return broke;
  }

  function bind() {
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        hide();
        broke = false;
        if (onReset) onReset();
      });
    }
  }

  bind();
  // Reflect initial hidden state.
  if (panel && panel.hidden) broke = false;

  return {
    panel,
    resetButton,
    minBet,
    update,
    show,
    hide,
    isBroke,
  };
}

export default createOutOfCredits;
