// spin-button.js — Reusable SPIN button component for Lucky Reels.
// Manages the primary SPIN action button (#spin) declared in index.html.
// Pure view/controller: knows nothing about RNG, paytable, or spin logic. It
// owns the button's disabled-state rules and fires a callback on click.
//
// DISABLED RULES:
//   - Disabled while a spin is in progress (spinning === true).
//   - Disabled when credits < current bet (can't afford a spin).
//   - Disabled when hard-locked (e.g. out-of-credits state).
//
// Usage (from ui.js):
//   import { createSpinButton } from './spin-button.js';
//   const spinBtn = createSpinButton({
//     button: document.getElementById('spin'),
//     onSpin: () => doSpin(),
//   });
//   spinBtn.refresh({ credits: state.credits, bet: state.bet });
//   // On spin start: spinBtn.setSpinning(true);
//   // On spin end:   spinBtn.setSpinning(false);

export function createSpinButton(opts = {}) {
  const button = opts.button || document.getElementById('spin');
  const onSpin = typeof opts.onSpin === 'function' ? opts.onSpin : null;

  let spinning = false;
  let locked = false; // hard lock (e.g. out of credits)
  let credits = Infinity;
  let bet = 0;

  // Recompute and apply the disabled state + visual spinning class.
  function render() {
    if (!button) return;
    const cantAfford = credits < bet;
    const disabled = spinning || locked || cantAfford;
    button.disabled = disabled;
    button.classList.toggle('is-spinning', spinning);
    button.setAttribute('aria-busy', String(spinning));
  }

  // Update the spinning flag (locks the button while true).
  function setSpinning(flag) {
    spinning = !!flag;
    render();
  }

  // Hard enable/disable regardless of affordability (e.g. out-of-credits).
  function setEnabled(flag) {
    locked = !flag;
    render();
  }

  // Update affordability inputs and re-render.
  // ctx: { credits, bet } — either may be omitted to keep prior value.
  function refresh(ctx = {}) {
    if (typeof ctx.credits === 'number') credits = ctx.credits;
    if (typeof ctx.bet === 'number') bet = ctx.bet;
    render();
  }

  function isSpinning() {
    return spinning;
  }

  function bind() {
    if (!button) return;
    button.addEventListener('click', () => {
      if (button.disabled || spinning || locked) return;
      if (credits < bet) return;
      if (onSpin) onSpin();
    });
  }

  bind();
  render();

  return {
    button,
    setSpinning,
    setEnabled,
    refresh,
    isSpinning,
    render,
  };
}

export default createSpinButton;
