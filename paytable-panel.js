// paytable-panel.js — Reusable toggleable paytable panel component for Lucky Reels.
// Builds the paytable list from the canonical SYMBOLS data in paytable.js and
// manages the toggle button open/close state. Pure view/controller: knows
// nothing about RNG, spins, or credits.
//
// Bound to markup in index.html:
//   #paytable-toggle (button, aria-controls="paytable")
//   #paytable        (aside, [hidden])
//   #paytable-list   (ul)
//   #rtp             (span for declared RTP text)
//
// Usage (from ui.js):
//   import { createPaytablePanel } from './paytable-panel.js';
//   const panel = createPaytablePanel();
//   panel.build();      // render rows + RTP
//   panel.toggle();     // open/close

import { SYMBOLS, DECLARED_RTP } from './paytable.js';

export function createPaytablePanel(opts = {}) {
  const toggleBtn = opts.toggle || document.getElementById('paytable-toggle');
  const panel = opts.panel || document.getElementById('paytable');
  const list = opts.list || document.getElementById('paytable-list');
  const rtpEl = opts.rtp || document.getElementById('rtp');

  let built = false;

  // Render one paytable row for a symbol.
  function rowFor(sym) {
    const li = document.createElement('li');
    li.className = 'paytable__row';
    li.setAttribute('data-symbol', sym.id);
    li.innerHTML =
      `<span class="paytable__symbol" aria-hidden="true">${sym.emoji}</span>` +
      `<span class="paytable__name">${sym.name}</span>` +
      `<span class="paytable__mult">\u00D7${sym.multiplier}</span>`;
    return li;
  }

  // Build/refresh the list + RTP display from paytable data.
  function build() {
    if (list) {
      list.innerHTML = '';
      // Highest-paying symbols first for a satisfying "jackpot at top" read.
      const ordered = SYMBOLS.slice().sort((a, b) => b.multiplier - a.multiplier);
      ordered.forEach((s) => list.appendChild(rowFor(s)));
    }
    if (rtpEl) rtpEl.textContent = (DECLARED_RTP * 100).toFixed(1) + '%';
    built = true;
  }

  function isOpen() {
    return !!panel && !panel.hidden;
  }

  function reflectToggleState(open) {
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(open));
  }

  function open() {
    if (!built) build();
    if (panel) panel.hidden = false;
    reflectToggleState(true);
  }

  function close() {
    if (panel) panel.hidden = true;
    reflectToggleState(false);
  }

  function toggle() {
    if (isOpen()) close();
    else open();
  }

  function bind() {
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }
    // Close on Escape when the panel is open (nice keyboard polish).
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) close();
    });
  }

  bind();
  reflectToggleState(isOpen());

  return {
    toggleBtn,
    panel,
    list,
    rtpEl,
    build,
    open,
    close,
    toggle,
    isOpen,
  };
}

export default createPaytablePanel;
