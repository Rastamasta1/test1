// game-controller.js — Orchestrates the full spin flow for Lucky Reels.
// Wires the pure logic modules (rng, spin, evaluate, paytable) to the reusable
// UI component modules (game-state, reel-view, spin-animation-controller,
// credits-display, bet-selector, spin-button, paytable-panel, payline-highlight,
// out-of-credits, win-feedback). This is the single place that knows the
// end-to-end spin sequence; individual components stay dumb/reusable.
//
// Usage (from ui.js):
//   import { createGameController } from './game-controller.js';
//   const controller = createGameController();
//   controller.init();

import { createRng } from './rng.js';
import { SYMBOLS, REELS, ROWS } from './paytable.js';
import { spin } from './spin.js';
import { evaluateOutcome } from './evaluate.js';

import { createGameState } from './game-state.js';
import { createReelView } from './reel-view.js';
import { createSpinController } from './spin-animation-controller.js';
import { createCreditsDisplay } from './credits-display.js';
import { createBetSelector } from './bet-selector.js';
import { createSpinButton } from './spin-button.js';
import { createPaytablePanel } from './paytable-panel.js';
import { createPaylineHighlight } from './payline-highlight.js';
import { createOutOfCredits } from './out-of-credits.js';
import { createWinFeedback } from './win-feedback.js';

const START_CREDITS = 1000;

export function createGameController(opts = {}) {
  const rng = opts.rng || createRng();

  const el = {
    machine: document.getElementById('machine'),
    reels: document.getElementById('reels'),
    overlay: document.getElementById('paylines-overlay'),
    message: document.getElementById('message'),
    credits: document.getElementById('credits'),
    bet: document.getElementById('bet'),
    win: document.getElementById('win'),
    spin: document.getElementById('spin'),
    reset: document.getElementById('reset'),
    outOfCredits: document.getElementById('out-of-credits'),
    betBtns: document.querySelectorAll('.bet-btn'),
  };

  // ---- State ----
  const gs = createGameState({ startCredits: START_CREDITS, bet: 10 });

  // ---- View components ----
  const reelView = createReelView(el.reels, el.overlay);
  const highlight = createPaylineHighlight(el.reels, el.overlay);
  const feedback = createWinFeedback({
    machine: el.machine,
    reels: el.reels,
    message: el.message,
  });
  const display = createCreditsDisplay({
    credits: el.credits,
    bet: el.bet,
    win: el.win,
  });
  const paytable = createPaytablePanel();

  // Random filler grid for tumble frames during spin animation.
  function randomFillGrid() {
    const grid = [];
    for (let reel = 0; reel < REELS; reel++) {
      grid[reel] = [];
      for (let row = 0; row < ROWS; row++) {
        grid[reel][row] = rng.pick(SYMBOLS).id;
      }
    }
    return grid;
  }

  const spinController = createSpinController(reelView, {
    fillGrid: randomFillGrid,
  });

  const betSelector = createBetSelector({
    buttons: el.betBtns,
    initial: gs.getBet(),
    onChange: (bet) => {
      gs.setBet(bet);
      display.setBet(bet);
    },
  });

  const spinButton = createSpinButton({
    button: el.spin,
    onSpin: () => runSpin(),
  });

  const outOfCredits = createOutOfCredits({
    panel: el.outOfCredits,
    resetButton: el.reset,
    minBet: gs.minBet,
    onReset: () => {
      gs.reset();
      feedback.reset();
    },
  });

  // ---- Reactive rendering ----
  gs.subscribe((state) => {
    display.setCredits(state.credits);
    display.setBet(state.bet);
    spinButton.refresh({ credits: state.credits, bet: state.bet });
    spinButton.setSpinning(state.spinning);
    betSelector.setDisabled(state.spinning);
    if (!state.spinning) {
      betSelector.refresh(state.credits);
      outOfCredits.update(state.credits);
    }
  });

  // ---- The orchestrated spin flow ----
  async function runSpin() {
    if (!gs.canSpin()) return;

    // 1. Reset transient visuals + place the bet.
    highlight.clear();
    reelView.clearHighlights();
    feedback.reset();
    display.setWin(0);
    gs.placeBet();

    // 2. Compute the outcome, then animate reels landing on it.
    const outcome = spin(rng);
    await spinController.play(outcome.grid);

    // 3. Evaluate wins against the final grid.
    const result = evaluateOutcome(outcome.grid, gs.getBet());

    // 4. Present result.
    if (result.totalWin > 0) {
      highlight.show(result.winningLines);
      feedback.win(result.totalWin, gs.getBet());
      display.countUpWin(result.totalWin, {
        onDone: () => {
          gs.addWin(result.totalWin);
        },
      });
    } else {
      feedback.lose();
      gs.addWin(0);
    }
  }

  function init() {
    reelView.renderGrid(randomFillGrid());
    paytable.build();
    // Push initial state through the display.
    const s = gs.getState();
    display.setCredits(s.credits);
    display.setBet(s.bet);
    display.setWin(0);
    spinButton.refresh({ credits: s.credits, bet: s.bet });
    outOfCredits.update(s.credits);
  }

  return {
    gs,
    reelView,
    spinController,
    display,
    betSelector,
    spinButton,
    paytable,
    outOfCredits,
    feedback,
    highlight,
    runSpin,
    init,
  };
}

export default createGameController;
