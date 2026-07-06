// ui.js — DOM controller for Lucky Reels. Wires pure modules to the UI.
import { createRng } from './rng.js';
import { SYMBOLS, SYMBOL_BY_ID, DECLARED_RTP, PAYLINES, REELS, ROWS } from './paytable.js';
import { lineColor, getLineCells } from './paylines.js';
import { spin } from './spin.js';
import { evaluateOutcome } from './evaluate.js';

const START_CREDITS = 1000;
const rng = createRng();

const state = {
  credits: START_CREDITS,
  bet: 10,
  spinning: false,
};

const el = {
  credits: document.getElementById('credits'),
  bet: document.getElementById('bet'),
  win: document.getElementById('win'),
  reels: document.getElementById('reels'),
  overlay: document.getElementById('paylines-overlay'),
  message: document.getElementById('message'),
  spin: document.getElementById('spin'),
  paytableToggle: document.getElementById('paytable-toggle'),
  paytable: document.getElementById('paytable'),
  paytableList: document.getElementById('paytable-list'),
  rtp: document.getElementById('rtp'),
  outOfCredits: document.getElementById('out-of-credits'),
  reset: document.getElementById('reset'),
  betBtns: Array.from(document.querySelectorAll('.bet-btn')),
};

function cellEl(reel, row) {
  return el.reels.querySelector(`.cell[data-reel="${reel}"][data-row="${row}"]`);
}

function setCellSymbol(reel, row, id) {
  const cell = cellEl(reel, row);
  if (!cell) return;
  const sym = SYMBOL_BY_ID[id];
  cell.innerHTML = `<span class="cell__symbol">${sym ? sym.emoji : '?'}</span>`;
}

function renderGrid(grid) {
  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      setCellSymbol(reel, row, grid[reel][row]);
    }
  }
}

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

function updateStats() {
  el.credits.textContent = state.credits;
  el.bet.textContent = state.bet;
}

function clearHighlights() {
  el.reels.querySelectorAll('.cell.is-win').forEach((c) => c.classList.remove('is-win'));
  el.overlay.innerHTML = '';
}

function drawPaylines(winningLines) {
  el.overlay.innerHTML = '';
  el.overlay.setAttribute('viewBox', '0 0 100 100');
  el.overlay.setAttribute('preserveAspectRatio', 'none');
  const colWidth = 100 / REELS;
  const rowHeight = 100 / ROWS;
  winningLines.forEach((line) => {
    const pl = PAYLINES.find((p) => p.id === line.lineId);
    if (!pl) return;
    const pts = getLineCells(pl)
      .map(([reel, row]) => `${colWidth * reel + colWidth / 2},${rowHeight * row + rowHeight / 2}`)
      .join(' ');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', pts);
    poly.setAttribute('class', 'payline is-active');
    poly.setAttribute('stroke', lineColor(pl.id));
    poly.style.color = lineColor(pl.id);
    el.overlay.appendChild(poly);
  });
}

function highlightWins(winningLines) {
  winningLines.forEach((line) => {
    line.cells.forEach(([reel, row]) => {
      const cell = cellEl(reel, row);
      if (cell) cell.classList.add('is-win');
    });
  });
  drawPaylines(winningLines);
}

function countUp(target) {
  const duration = 700;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    el.win.textContent = Math.round(target * t);
    if (t < 1) requestAnimationFrame(frame);
    else el.win.textContent = target;
  }
  requestAnimationFrame(frame);
}

function setSpinDisabled() {
  el.spin.disabled = state.spinning || state.credits < state.bet;
}

function checkOutOfCredits() {
  if (state.credits < 10) {
    el.outOfCredits.hidden = false;
  } else {
    el.outOfCredits.hidden = true;
  }
}

function doSpin() {
  if (state.spinning || state.credits < state.bet) return;
  state.spinning = true;
  state.credits -= state.bet;
  updateStats();
  el.win.textContent = '0';
  el.message.textContent = '';
  el.message.classList.remove('is-win', 'is-lose');
  clearHighlights();
  setSpinDisabled();

  const outcome = spin(rng);
  el.reels.classList.add('is-spinning');
  const reelEls = Array.from(el.reels.querySelectorAll('.reel'));
  reelEls.forEach((r) => r.classList.add('is-spinning'));

  // Tumble filler while spinning.
  const tumble = setInterval(() => renderGrid(randomFillGrid()), 90);

  const stopTimes = [1000, 1400, 1800];
  reelEls.forEach((r, i) => {
    setTimeout(() => {
      r.classList.remove('is-spinning');
      r.classList.add('is-settled');
      for (let row = 0; row < ROWS; row++) setCellSymbol(i, row, outcome.grid[i][row]);
      setTimeout(() => r.classList.remove('is-settled'), 380);
    }, stopTimes[i]);
  });

  setTimeout(() => {
    clearInterval(tumble);
    el.reels.classList.remove('is-spinning');
    renderGrid(outcome.grid);
    finishSpin(outcome.grid);
  }, stopTimes[stopTimes.length - 1] + 100);
}

function finishSpin(grid) {
  const result = evaluateOutcome(grid, state.bet);
  if (result.totalWin > 0) {
    state.credits += result.totalWin;
    highlightWins(result.winningLines);
    countUp(result.totalWin);
    el.message.textContent = `You won ${result.totalWin}!`;
    el.message.classList.add('is-win');
  } else {
    el.win.textContent = '0';
    el.message.textContent = 'No win — spin again!';
    el.message.classList.add('is-lose');
  }
  state.spinning = false;
  updateStats();
  setSpinDisabled();
  checkOutOfCredits();
}

function buildPaytable() {
  el.paytableList.innerHTML = '';
  SYMBOLS.forEach((s) => {
    const li = document.createElement('li');
    li.innerHTML =
      `<span class="paytable__symbol">${s.emoji}</span>` +
      `<span class="paytable__name">${s.name}</span>` +
      `<span class="paytable__mult">x${s.multiplier}</span>`;
    el.paytableList.appendChild(li);
  });
  el.rtp.textContent = (DECLARED_RTP * 100).toFixed(0) + '%';
}

function initEvents() {
  el.spin.addEventListener('click', doSpin);

  el.betBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.spinning) return;
      state.bet = Number(btn.dataset.bet);
      el.betBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      updateStats();
      setSpinDisabled();
    });
  });

  el.paytableToggle.addEventListener('click', () => {
    const open = el.paytable.hidden;
    el.paytable.hidden = !open;
    el.paytableToggle.setAttribute('aria-expanded', String(open));
  });

  el.reset.addEventListener('click', () => {
    state.credits = START_CREDITS;
    updateStats();
    checkOutOfCredits();
    setSpinDisabled();
    el.message.textContent = '';
    el.message.classList.remove('is-win', 'is-lose');
  });
}

function init() {
  renderGrid(randomFillGrid());
  buildPaytable();
  updateStats();
  setSpinDisabled();
  checkOutOfCredits();
  initEvents();
}

init();
