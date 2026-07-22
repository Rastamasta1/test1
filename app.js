// app.js — Coin Flip Decider UI controller
// Pure ES module; no framework, no backend

// ── Coin logic (inlined) ──────────────────────────────────────────────────────
const HEADS = 'heads';
const TAILS = 'tails';

function flipCoin() {
  return Math.random() < 0.5 ? HEADS : TAILS;
}

// ── Element refs ──────────────────────────────────────────────────────────────
const coin          = document.getElementById('coin');
const outcomeLabel  = document.getElementById('outcome-label');
const btnFlip       = document.getElementById('btn-flip');
const headsInput    = document.getElementById('heads-label');
const tailsInput    = document.getElementById('tails-label');
const tallyHeadsName  = document.getElementById('tally-heads-name');
const tallyTailsName  = document.getElementById('tally-tails-name');
const tallyHeadsCount = document.getElementById('tally-heads-count');
const tallyTailsCount = document.getElementById('tally-tails-count');
const tallyTotal      = document.getElementById('tally-total');
const btnReset        = document.getElementById('btn-reset');

// ── Session tally (never persisted) ──────────────────────────────────────────
let tally = { [HEADS]: 0, [TAILS]: 0 };

// ── Label helpers ─────────────────────────────────────────────────────────────
const LS_HEADS = 'coinflip_heads_label';
const LS_TAILS = 'coinflip_tails_label';

function getHeadsLabel() {
  return headsInput.value.trim() || 'Heads';
}
function getTailsLabel() {
  return tailsInput.value.trim() || 'Tails';
}

function loadLabels() {
  const savedHeads = localStorage.getItem(LS_HEADS);
  const savedTails = localStorage.getItem(LS_TAILS);
  if (savedHeads !== null) headsInput.value = savedHeads;
  if (savedTails !== null) tailsInput.value = savedTails;
  syncTallyNames();
}

function saveLabels() {
  localStorage.setItem(LS_HEADS, headsInput.value.trim());
  localStorage.setItem(LS_TAILS, tailsInput.value.trim());
}

function syncTallyNames() {
  tallyHeadsName.textContent = getHeadsLabel();
  tallyTailsName.textContent = getTailsLabel();
}

// ── Tally rendering ───────────────────────────────────────────────────────────
function renderTally() {
  tallyHeadsCount.textContent = tally[HEADS];
  tallyTailsCount.textContent = tally[TAILS];
  tallyTotal.textContent = tally[HEADS] + tally[TAILS];
}

// ── Animation ─────────────────────────────────────────────────────────────────
const ANIM_CLASS_HEADS = 'flipping-heads';
const ANIM_CLASS_TAILS = 'flipping-tails';
const RESULT_CLASS_HEADS = 'show-heads';
const RESULT_CLASS_TAILS = 'show-tails';
const ANIM_DURATION_MS = 700; // must match CSS animation duration

function triggerFlipAnimation(result) {
  return new Promise(resolve => {
    // Remove any prior result / animation classes
    coin.classList.remove(
      ANIM_CLASS_HEADS, ANIM_CLASS_TAILS,
      RESULT_CLASS_HEADS, RESULT_CLASS_TAILS
    );

    // Force reflow so removing and re-adding the class restarts the animation
    void coin.offsetWidth;

    const animClass  = result === HEADS ? ANIM_CLASS_HEADS  : ANIM_CLASS_TAILS;
    const restClass  = result === HEADS ? RESULT_CLASS_HEADS : RESULT_CLASS_TAILS;

    coin.classList.add(animClass);

    coin.addEventListener('animationend', function handler() {
      coin.removeEventListener('animationend', handler);
      coin.classList.remove(animClass);
      coin.classList.add(restClass);
      resolve();
    }, { once: true });
  });
}

// ── Flip handler ──────────────────────────────────────────────────────────────
async function handleFlip() {
  btnFlip.disabled = true;
  outcomeLabel.textContent = '';
  outcomeLabel.className = 'outcome-label';

  const result = flipCoin();

  await triggerFlipAnimation(result);

  // Update outcome display
  const label = result === HEADS ? getHeadsLabel() : getTailsLabel();
  outcomeLabel.textContent = label;
  outcomeLabel.classList.add(result === HEADS ? 'outcome-heads' : 'outcome-tails');

  // Update tally
  tally[result]++;
  renderTally();

  btnFlip.disabled = false;
}

// ── Reset handler ─────────────────────────────────────────────────────────────
function handleReset() {
  tally[HEADS] = 0;
  tally[TAILS] = 0;
  renderTally();

  outcomeLabel.textContent = '';
  outcomeLabel.className = 'outcome-label';

  coin.classList.remove(
    ANIM_CLASS_HEADS, ANIM_CLASS_TAILS,
    RESULT_CLASS_HEADS, RESULT_CLASS_TAILS
  );
}

// ── Label input listeners ─────────────────────────────────────────────────────
headsInput.addEventListener('input', () => {
  saveLabels();
  syncTallyNames();
  // If the last outcome was heads, update the live outcome label too
  if (outcomeLabel.classList.contains('outcome-heads')) {
    outcomeLabel.textContent = getHeadsLabel();
  }
});

tailsInput.addEventListener('input', () => {
  saveLabels();
  syncTallyNames();
  if (outcomeLabel.classList.contains('outcome-tails')) {
    outcomeLabel.textContent = getTailsLabel();
  }
});

// ── Wire buttons ──────────────────────────────────────────────────────────────
btnFlip.addEventListener('click', handleFlip);
btnReset.addEventListener('click', handleReset);

// ── Boot ──────────────────────────────────────────────────────────────────────
loadLabels();
renderTally();
