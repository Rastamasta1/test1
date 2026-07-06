// game-state.js — Pure game-state controller for Lucky Reels.
// Owns the mutable session state: credits, current bet, and spinning flag.
// No DOM, no RNG, no paytable/spin logic — just state + transitions + a tiny
// subscribe/notify mechanism so UI components (credits-display, bet-selector,
// spin-button, out-of-credits) can react to changes.
//
// Usage (from ui.js):
//   import { createGameState } from './game-state.js';
//   const gs = createGameState({ startCredits: 1000, bet: 10 });
//   const unsub = gs.subscribe((state, change) => render(state));
//   if (gs.canSpin()) { gs.placeBet(); /* run spin */ gs.addWin(win); }

const DEFAULT_BET_VALUES = [10, 25, 50, 100];

export function createGameState(opts = {}) {
  const startCredits =
    typeof opts.startCredits === 'number' ? opts.startCredits : 1000;
  const betValues =
    Array.isArray(opts.betValues) && opts.betValues.length
      ? opts.betValues.slice()
      : DEFAULT_BET_VALUES.slice();
  const minBet =
    typeof opts.minBet === 'number' ? opts.minBet : Math.min(...betValues);

  const state = {
    credits: startCredits,
    bet: typeof opts.bet === 'number' ? opts.bet : betValues[0],
    spinning: false,
    lastWin: 0,
    totalWagered: 0,
    totalWon: 0,
    spins: 0,
  };

  const listeners = new Set();

  function getState() {
    // Return a shallow copy so consumers can't mutate internal state directly.
    return { ...state };
  }

  function notify(change) {
    const snapshot = getState();
    listeners.forEach((fn) => {
      try {
        fn(snapshot, change);
      } catch (e) {
        // A misbehaving listener must not break state propagation.
        if (typeof console !== 'undefined') console.error(e);
      }
    });
  }

  // Subscribe to state changes. Returns an unsubscribe function.
  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    // Immediately push current state to the new subscriber.
    try {
      fn(getState(), 'init');
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
    }
    return () => listeners.delete(fn);
  }

  // Can the player start a spin right now?
  function canSpin() {
    return !state.spinning && state.credits >= state.bet && state.bet > 0;
  }

  // Is the player unable to afford even the smallest bet?
  function isBroke() {
    return state.credits < minBet;
  }

  // Set the active bet (must be one of betValues). Returns true on change.
  function setBet(value) {
    const val = Number(value);
    if (!betValues.includes(val)) return false;
    if (state.spinning) return false;
    if (val === state.bet) return true;
    state.bet = val;
    notify('bet');
    return true;
  }

  function getBet() {
    return state.bet;
  }

  function getCredits() {
    return state.credits;
  }

  // Flip the spinning flag. UI locks controls while true.
  function setSpinning(flag) {
    const next = !!flag;
    if (next === state.spinning) return;
    state.spinning = next;
    notify('spinning');
  }

  function isSpinning() {
    return state.spinning;
  }

  // Deduct the current bet to start a spin. Returns the bet placed, or 0 if
  // the player can't afford it. Also marks the session spinning.
  function placeBet() {
    if (!canSpin()) return 0;
    state.credits -= state.bet;
    state.totalWagered += state.bet;
    state.spins += 1;
    state.lastWin = 0;
    state.spinning = true;
    notify('placeBet');
    return state.bet;
  }

  // Credit a win amount, record it, and clear the spinning flag.
  function addWin(amount) {
    const win = Number(amount) || 0;
    if (win > 0) {
      state.credits += win;
      state.totalWon += win;
    }
    state.lastWin = win;
    state.spinning = false;
    notify('addWin');
    return state.credits;
  }

  // Reset credits back to the starting bankroll (Reset Credits button).
  function reset() {
    state.credits = startCredits;
    state.lastWin = 0;
    state.spinning = false;
    notify('reset');
    return state.credits;
  }

  // Empirical RTP for the current session (informational only).
  function sessionRTP() {
    return state.totalWagered > 0 ? state.totalWon / state.totalWagered : 0;
  }

  return {
    startCredits,
    betValues,
    minBet,
    getState,
    subscribe,
    canSpin,
    isBroke,
    setBet,
    getBet,
    getCredits,
    setSpinning,
    isSpinning,
    placeBet,
    addWin,
    reset,
    sessionRTP,
  };
}

export default createGameState;
