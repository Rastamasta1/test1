import { calculatePerPerson } from './calc.js';

// ── Element references ───────────────────────────────────────────────────────
const billInput    = document.getElementById('bill-amount');
const customTip    = document.getElementById('custom-tip');
const peopleInput  = document.getElementById('people-count');
const tipBtns      = document.querySelectorAll('.tip-btn');
const resetBtn     = document.getElementById('reset-btn');

const tipPerPersonEl  = document.getElementById('tip-per-person');
const perPersonTotalEl = document.getElementById('per-person-total');
const grandTotalEl    = document.getElementById('grand-total');

const billError   = document.getElementById('bill-error');
const tipError    = document.getElementById('tip-error');
const peopleError = document.getElementById('people-error');

// ── State ────────────────────────────────────────────────────────────────────
let selectedTipPct = null; // set by preset buttons

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return '$' + n.toFixed(2);
}

function clearErrors() {
  billError.textContent   = '';
  tipError.textContent    = '';
  peopleError.textContent = '';
}

function setActiveBtn(btn) {
  tipBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  }
}

function resetDisplay() {
  tipPerPersonEl.textContent  = '$0.00';
  perPersonTotalEl.textContent = '$0.00';
  grandTotalEl.textContent    = '$0.00';
}

// ── Core render ──────────────────────────────────────────────────────────────
function render() {
  clearErrors();

  const billRaw   = billInput.value.trim();
  const peopleRaw = peopleInput.value.trim();

  // Determine active tip %
  const customVal  = customTip.value.trim();
  let tipPct;
  if (customVal !== '') {
    tipPct = parseFloat(customVal);
  } else {
    tipPct = selectedTipPct;
  }

  // Validate bill
  const bill = parseFloat(billRaw);
  let valid = true;

  if (billRaw === '' || isNaN(bill) || bill < 0) {
    if (billRaw !== '') {
      billError.textContent = 'Enter a valid bill amount';
      valid = false;
    }
  }

  // Validate tip
  if (tipPct === null || tipPct === undefined || isNaN(tipPct)) {
    // No tip selected yet — not an error, just incomplete
    if (customVal !== '') {
      tipError.textContent = 'Enter a valid tip %';
      valid = false;
    } else {
      valid = false; // incomplete, no error shown
    }
  } else if (tipPct < 0 || tipPct > 100) {
    tipError.textContent = 'Tip must be between 0 and 100';
    valid = false;
  }

  // Validate people
  const people = parseInt(peopleRaw, 10);
  if (peopleRaw === '' || isNaN(people) || people < 1 || !Number.isInteger(people)) {
    if (peopleRaw !== '' && (isNaN(people) || people < 1)) {
      peopleError.textContent = people === 0 ? "Can't be zero" : 'Enter a valid number of people';
      valid = false;
    } else {
      valid = false; // incomplete
    }
  }

  if (!valid) {
    // Show zeros if any field is simply incomplete (no error text set)
    if (!billError.textContent && !tipError.textContent && !peopleError.textContent) {
      resetDisplay();
    }
    return;
  }

  try {
    const { tipPerPerson, totalPerPerson, grandTotal } = calculatePerPerson(bill, tipPct, people);
    tipPerPersonEl.textContent   = fmt(tipPerPerson);
    perPersonTotalEl.textContent = fmt(totalPerPerson);
    grandTotalEl.textContent     = fmt(grandTotal);
  } catch (e) {
    resetDisplay();
  }
}

// ── Event listeners ──────────────────────────────────────────────────────────

// Bill input
billInput.addEventListener('input', render);

// Tip preset buttons
tipBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTipPct = parseFloat(btn.dataset.tip);
    customTip.value = ''; // clear custom when preset chosen
    setActiveBtn(btn);
    render();
  });
});

// Custom tip input
customTip.addEventListener('input', () => {
  // Deactivate preset buttons when user types a custom value
  if (customTip.value.trim() !== '') {
    selectedTipPct = null;
    setActiveBtn(null);
  }
  render();
});

// People input
peopleInput.addEventListener('input', render);

// Reset button
resetBtn.addEventListener('click', () => {
  billInput.value    = '';
  customTip.value    = '';
  peopleInput.value  = '';
  selectedTipPct     = null;
  setActiveBtn(null);
  clearErrors();
  resetDisplay();
});

// Initial render
render();
