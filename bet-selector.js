// bet-selector.js — Reusable bet-amount selector component for Lucky Reels.
// Manages the 10/25/50/100 bet buttons declared in index.html (.bet-btn[data-bet]).
// Pure view/controller: knows nothing about RNG, paytable, or spin logic. It
// tracks the active bet, toggles the .is-active class, disables buttons while
// spinning or when a bet exceeds available credits, and notifies via onChange.
//
// Usage (from ui.js):
//   import { createBetSelector } from './bet-selector.js';
//   const betSelector = createBetSelector({
//     buttons: document.querySelectorAll('.bet-btn'),
//     initial: 10,
//     onChange: (bet) => { state.bet = bet; display.setBet(bet); },
//   });
//   // While spinning:  betSelector.setDisabled(true);
//   // After a spin:    betSelector.refresh(state.credits);

export function createBetSelector(opts = {}) {
  const buttons = Array.from(
    opts.buttons || document.querySelectorAll('.bet-btn')
  );
  const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;

  // Available bet values parsed from the buttons (fallback to defaults).
  const values = buttons.map((b) => Number(b.dataset.bet));
  const minBet = values.length ? Math.min(...values) : 10;

  let currentBet =
    typeof opts.initial === 'number' ? opts.initial : values[0] || 10;
  let locked = false; // hard lock (e.g. while spinning)
  let credits = Infinity; // last known credits for affordability checks

  function buttonFor(value) {
    return buttons.find((b) => Number(b.dataset.bet) === value) || null;
  }

  // Apply active-state class to reflect the current bet.
  function renderActive() {
    buttons.forEach((b) => {
      const val = Number(b.dataset.bet);
      b.classList.toggle('is-active', val === currentBet);
      b.setAttribute('aria-pressed', String(val === currentBet));
    });
  }

  // Enable/disable individual buttons based on lock + affordability.
  function renderDisabled() {
    buttons.forEach((b) => {
      const val = Number(b.dataset.bet);
      const unaffordable = val > credits;
      b.disabled = locked || unaffordable;
    });
  }

  // Programmatically set the active bet (no-op if locked or invalid).
  function setBet(value, silent = false) {
    const val = Number(value);
    if (!values.includes(val)) return false;
    if (locked) return false;
    if (val === currentBet) {
      renderActive();
      return true;
    }
    currentBet = val;
    renderActive();
    if (!silent && onChange) onChange(currentBet);
    return true;
  }

  function getBet() {
    return currentBet;
  }

  // Hard lock/unlock all buttons (e.g. during a spin).
  function setDisabled(flag) {
    locked = !!flag;
    renderDisabled();
  }

  // Recompute affordability against current credits and, if the active bet is
  // now unaffordable, drop to the largest affordable bet (down to minBet).
  function refresh(nextCredits) {
    if (typeof nextCredits === 'number') credits = nextCredits;
    // Auto-adjust the active bet down if it's no longer affordable.
    if (currentBet > credits) {
      const affordable = values
        .filter((v) => v <= credits)
        .sort((a, b) => b - a);
      if (affordable.length) setBet(affordable[0]);
    }
    renderActive();
    renderDisabled();
  }

  function bind() {
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (locked || btn.disabled) return;
        setBet(Number(btn.dataset.bet));
      });
    });
  }

  bind();
  renderActive();
  renderDisabled();

  return {
    buttons,
    values,
    minBet,
    setBet,
    getBet,
    setDisabled,
    refresh,
    renderActive,
    renderDisabled,
  };
}

export default createBetSelector;
