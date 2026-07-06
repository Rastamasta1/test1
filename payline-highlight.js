// payline-highlight.js — Reusable winning-line highlight component for Lucky Reels.
// Draws polished, casino-quality payline visuals over the 3x3 grid: animated
// dash-drawn SVG lines with a traveling glow, plus staggered winning-cell
// pulses. Pure view: knows nothing about RNG, bets, or credits. Given the
// winning-line data from evaluate.js it renders and animates the highlights.
//
// Bound to markup in index.html: #reels, #paylines-overlay, .cell[data-reel][data-row].
// Complements reel-view.js (which also has a simpler highlight path) — this is
// the richer, dedicated highlight layer the UI can prefer for wins.
//
// Usage (from ui.js):
//   import { createPaylineHighlight } from './payline-highlight.js';
//   const hi = createPaylineHighlight(reelsEl, overlayEl);
//   hi.show(result.winningLines);   // draw + animate all winning lines
//   hi.clear();                     // remove all highlights

import { PAYLINES, REELS, ROWS } from './paytable.js';
import { lineColor, getLineCells } from './paylines.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Create a payline-highlight controller bound to a #reels root + overlay SVG.
export function createPaylineHighlight(rootEl, overlayEl) {
  const reels = rootEl || document.getElementById('reels');
  const overlay =
    overlayEl ||
    (reels && reels.querySelector('.paylines-overlay')) ||
    document.getElementById('paylines-overlay');

  const colWidth = 100 / REELS;
  const rowHeight = 100 / ROWS;

  let pulseTimers = [];

  function clearTimers() {
    pulseTimers.forEach((t) => clearTimeout(t));
    pulseTimers = [];
  }

  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    pulseTimers.push(t);
    return t;
  }

  function cellEl(reel, row) {
    if (!reels) return null;
    return reels.querySelector(
      `.cell[data-reel="${reel}"][data-row="${row}"]`
    );
  }

  function pointsFor(pl) {
    return getLineCells(pl).map(
      ([reel, row]) => [
        colWidth * reel + colWidth / 2,
        rowHeight * row + rowHeight / 2,
      ]
    );
  }

  function pointsAttr(pts) {
    return pts.map((p) => `${p[0]},${p[1]}`).join(' ');
  }

  // Remove all payline lines + winning-cell highlights.
  function clear() {
    clearTimers();
    if (overlay) overlay.innerHTML = '';
    if (reels) {
      reels
        .querySelectorAll('.cell.is-win')
        .forEach((c) => c.classList.remove('is-win'));
    }
  }

  // Draw a single payline: a base glow line + a bright dash-drawn line that
  // animates in, then a small traveling glow dot along the path.
  function drawLine(pl, index) {
    if (!overlay) return;
    const color = lineColor(pl.id);
    const pts = pointsFor(pl);
    const attr = pointsAttr(pts);
    const reduce = prefersReducedMotion();

    // Soft under-glow line (wider, blurred via CSS filter).
    const glow = document.createElementNS(SVG_NS, 'polyline');
    glow.setAttribute('points', attr);
    glow.setAttribute('class', 'payline payline--glow is-active');
    glow.setAttribute('stroke', color);
    glow.style.color = color;
    overlay.appendChild(glow);

    // Bright core line that draws itself in via stroke-dash animation.
    const core = document.createElementNS(SVG_NS, 'polyline');
    core.setAttribute('points', attr);
    core.setAttribute('class', 'payline payline--core is-active');
    core.setAttribute('stroke', color);
    core.style.color = color;
    if (!reduce) {
      core.style.setProperty('--draw-delay', `${index * 120}ms`);
      core.classList.add('is-drawing');
    }
    overlay.appendChild(core);

    // Traveling glow dot riding the payline path (motion path via SMIL-free
    // JS is overkill; use CSS offset-path when supported, else skip).
    if (!reduce) {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('r', '1.6');
      dot.setAttribute('cx', String(pts[0][0]));
      dot.setAttribute('cy', String(pts[0][1]));
      dot.setAttribute('class', 'payline__spark');
      dot.setAttribute('fill', color);
      dot.style.color = color;
      overlay.appendChild(dot);
      animateSpark(dot, pts, index);
    }
  }

  // Animate a spark circle traveling along the payline's polyline points.
  function animateSpark(dot, pts, index) {
    const segDuration = 260; // ms per segment
    const startDelay = 260 + index * 120;
    // Precompute cumulative to loop the travel.
    function travel() {
      let seg = 0;
      const start = performance.now();
      function frame(now) {
        const elapsed = now - start;
        const totalSeg = pts.length - 1;
        const overall = elapsed / segDuration;
        if (overall >= totalSeg) {
          // Loop.
          later(travel, 500);
          return;
        }
        seg = Math.floor(overall);
        const localT = overall - seg;
        const a = pts[seg];
        const b = pts[seg + 1];
        const x = a[0] + (b[0] - a[0]) * localT;
        const y = a[1] + (b[1] - a[1]) * localT;
        dot.setAttribute('cx', String(x));
        dot.setAttribute('cy', String(y));
        pulseTimers.push(requestAnimationFrame(frame));
      }
      pulseTimers.push(requestAnimationFrame(frame));
    }
    later(travel, startDelay);
  }

  // Stagger-highlight the winning cells for a line.
  function highlightCells(pl, index) {
    const cells = getLineCells(pl);
    cells.forEach(([reel, row], i) => {
      const cell = cellEl(reel, row);
      if (!cell) return;
      if (prefersReducedMotion()) {
        cell.classList.add('is-win');
        return;
      }
      later(() => cell.classList.add('is-win'), index * 120 + i * 90);
    });
  }

  // Public: show highlights for a list of winning-line detail objects.
  function show(winningLines) {
    clear();
    if (!overlay || !Array.isArray(winningLines) || !winningLines.length) return;
    overlay.setAttribute('viewBox', '0 0 100 100');
    overlay.setAttribute('preserveAspectRatio', 'none');

    winningLines.forEach((line, index) => {
      const pl = PAYLINES.find((p) => p.id === line.lineId);
      if (!pl) return;
      drawLine(pl, index);
      highlightCells(pl, index);
    });
  }

  return {
    reels,
    overlay,
    show,
    clear,
    drawLine,
    highlightCells,
  };
}

export default createPaylineHighlight;
