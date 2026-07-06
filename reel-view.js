// reel-view.js — Reusable 3x3 reel-grid view component for Lucky Reels.
// Encapsulates all DOM rendering + animation of the reels and payline overlay.
// Pure view: knows nothing about credits, bets, or RNG. Given outcome grids
// and winning-line data it renders them; the caller (ui.js) drives timing.
//
// Depends on the existing markup in index.html (#reels, #paylines-overlay,
// .reel[data-reel], .cell[data-reel][data-row]) and the CSS classes defined in
// styles/reels.css + styles/spin-animation.css (.is-spinning/.is-settled/.is-win).

import { SYMBOL_BY_ID, PAYLINES, REELS, ROWS } from './paytable.js';
import { lineColor, getLineCells } from './paylines.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Create a reel-view controller bound to a #reels root element (and its
// #paylines-overlay child). Returns an API object.
export function createReelView(rootEl, overlayEl) {
  const reels = rootEl;
  const overlay =
    overlayEl || reels.querySelector('.paylines-overlay') || null;
  const reelEls = Array.from(reels.querySelectorAll('.reel'));

  function cellEl(reel, row) {
    return reels.querySelector(
      `.cell[data-reel="${reel}"][data-row="${row}"]`
    );
  }

  // Render a single symbol into a cell (with optional staggered entrance).
  function setCell(reel, row, id, animate = false) {
    const cell = cellEl(reel, row);
    if (!cell) return;
    const sym = SYMBOL_BY_ID[id];
    cell.innerHTML =
      `<span class="cell__symbol"${
        animate ? ` style="--enter-delay:${row * 40}ms"` : ''
      }>${sym ? sym.emoji : '?'}</span>`;
    if (animate) {
      const glyph = cell.firstElementChild;
      if (glyph) glyph.classList.add('cell__symbol--enter');
    }
  }

  // Render a full reel-major grid[reel][row].
  function renderGrid(grid, animate = false) {
    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) {
        setCell(reel, row, grid[reel][row], animate);
      }
    }
  }

  // Render a single reel column from a grid.
  function renderReel(grid, reel, animate = false) {
    for (let row = 0; row < ROWS; row++) {
      setCell(reel, row, grid[reel][row], animate);
    }
  }

  // Begin the spin animation on all reels.
  function startSpin() {
    reels.classList.add('is-spinning');
    reelEls.forEach((r) => {
      r.classList.remove('is-settled', 'is-stopping');
      r.classList.add('is-spinning');
    });
  }

  // Stop and settle a single reel, landing it on its final symbols.
  function stopReel(reel, grid) {
    const r = reelEls[reel];
    if (!r) return;
    r.classList.remove('is-spinning');
    r.classList.add('is-settled');
    renderReel(grid, reel, true);
    setTimeout(() => r.classList.remove('is-settled'), 400);
  }

  // Ensure the whole-machine spin cue is removed and final grid is shown.
  function endSpin(grid) {
    reels.classList.remove('is-spinning');
    reelEls.forEach((r) => r.classList.remove('is-spinning'));
    if (grid) renderGrid(grid);
  }

  // Remove all win highlights + payline overlay lines.
  function clearHighlights() {
    reels
      .querySelectorAll('.cell.is-win')
      .forEach((c) => c.classList.remove('is-win'));
    if (overlay) overlay.innerHTML = '';
  }

  // Draw the SVG payline polylines for a set of winning lines.
  function drawPaylines(winningLines) {
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.setAttribute('viewBox', '0 0 100 100');
    overlay.setAttribute('preserveAspectRatio', 'none');
    const colWidth = 100 / REELS;
    const rowHeight = 100 / ROWS;
    winningLines.forEach((line) => {
      const pl = PAYLINES.find((p) => p.id === line.lineId);
      if (!pl) return;
      const pts = getLineCells(pl)
        .map(
          ([reel, row]) =>
            `${colWidth * reel + colWidth / 2},${
              rowHeight * row + rowHeight / 2
            }`
        )
        .join(' ');
      const poly = document.createElementNS(SVG_NS, 'polyline');
      poly.setAttribute('points', pts);
      poly.setAttribute('class', 'payline is-active');
      poly.setAttribute('stroke', lineColor(pl.id));
      poly.style.color = lineColor(pl.id);
      overlay.appendChild(poly);
    });
  }

  // Highlight winning cells and draw payline overlay.
  function highlightWins(winningLines) {
    winningLines.forEach((line) => {
      const cells = line.cells || getLineCells(
        PAYLINES.find((p) => p.id === line.lineId) || { cells: [] }
      );
      cells.forEach(([reel, row]) => {
        const cell = cellEl(reel, row);
        if (cell) cell.classList.add('is-win');
      });
    });
    drawPaylines(winningLines);
  }

  return {
    reelEls,
    cellEl,
    setCell,
    renderGrid,
    renderReel,
    startSpin,
    stopReel,
    endSpin,
    clearHighlights,
    drawPaylines,
    highlightWins,
  };
}

export default createReelView;
