// app.js — UI controller
// Imports conversions.js for unit data and convert/format helpers,
// and storage.js for localStorage persistence.

import { UNITS, convert, formatResult } from './conversions.js';
import { saveLastPair, loadLastPair } from './storage.js';

// ── DOM references ──────────────────────────────────────────────────────────
const inputValue  = document.getElementById('input-value');
const fromUnit    = document.getElementById('from-unit');
const toUnit      = document.getElementById('to-unit');
const swapBtn     = document.getElementById('swap-btn');
const resultBox   = document.getElementById('result-box');
const resultValue = document.getElementById('result-value');
const resultLabel = document.getElementById('result-label');
const resultFormula = document.getElementById('result-formula');
const errorMsg    = document.getElementById('error-msg');
const tabBtns     = document.querySelectorAll('.tab-btn');

// ── State ────────────────────────────────────────────────────────────────────
let currentType = 'length';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Populate both selects with options for the given unit type. */
function populateSelects(type, fromVal, toVal) {
  const units = UNITS[type];
  [fromUnit, toUnit].forEach((sel, idx) => {
    sel.innerHTML = '';
    units.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.value;
      opt.textContent = u.label;
      sel.appendChild(opt);
    });
  });

  // Set values — fall back to index 0 / 1 if the saved value isn't in this type
  const vals = units.map(u => u.value);
  fromUnit.value = vals.includes(fromVal) ? fromVal : vals[0];
  // Prefer index 1 for "to" so it doesn't default to same-as-from
  const defaultTo = vals.length > 1 ? vals[1] : vals[0];
  toUnit.value   = vals.includes(toVal)  ? toVal  : defaultTo;
}

/** Run the conversion and update the result area. */
function runConversion() {
  clearError();
  const raw = inputValue.value.trim();

  if (raw === '' || raw === '-') {
    showPlaceholder();
    return;
  }

  const value = parseFloat(raw);
  if (!isFinite(value)) {
    showError('Please enter a valid number.');
    return;
  }

  const from = fromUnit.value;
  const to   = toUnit.value;

  try {
    const { result, formula } = convert(currentType, value, from, to);
    const displayResult = formatResult(result);
    const fromLabel = labelFor(currentType, from);
    const toLabel   = labelFor(currentType, to);

    resultValue.textContent  = displayResult;
    resultLabel.textContent  = fromLabel + ' → ' + toLabel;
    resultFormula.textContent = formula;

    // Persist
    saveLastPair({ type: currentType, from, to });
  } catch (err) {
    showError(err.message || 'Conversion error.');
  }
}

/** Get the short label (e.g. "m") for a unit value within a type. */
function labelFor(type, val) {
  const unit = UNITS[type].find(u => u.value === val);
  return unit ? unit.label : val;
}

function showPlaceholder() {
  resultValue.textContent   = '\u2014';
  resultLabel.textContent   = 'Enter a value above';
  resultFormula.textContent = '';
}

function showError(msg) {
  errorMsg.textContent = msg;
  resultValue.textContent   = '\u2014';
  resultLabel.textContent   = '';
  resultFormula.textContent = '';
}

function clearError() {
  errorMsg.textContent = '';
}

/** Switch the active tab and repopulate selects. */
function switchType(type, fromVal, toVal) {
  currentType = type;

  // Update tab active state
  tabBtns.forEach(btn => {
    const isActive = btn.dataset.type === type;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  populateSelects(type, fromVal, toVal);
  runConversion();
}

// ── Event Listeners ──────────────────────────────────────────────────────────

// Tab buttons
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.type === currentType) return; // already active
    switchType(btn.dataset.type);
  });
});

// Input value
inputValue.addEventListener('input', runConversion);

// From / To selects
fromUnit.addEventListener('change', () => {
  saveLastPair({ type: currentType, from: fromUnit.value, to: toUnit.value });
  runConversion();
});
toUnit.addEventListener('change', () => {
  saveLastPair({ type: currentType, from: fromUnit.value, to: toUnit.value });
  runConversion();
});

// Swap button
swapBtn.addEventListener('click', () => {
  const tmp = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value   = tmp;
  saveLastPair({ type: currentType, from: fromUnit.value, to: toUnit.value });
  runConversion();
});

// ── Initialise ───────────────────────────────────────────────────────────────

(function init() {
  const saved = loadLastPair();

  if (saved && UNITS[saved.type]) {
    // Restore tab
    switchType(saved.type, saved.from, saved.to);
  } else {
    // Default: length, m → km
    switchType('length', 'm', 'km');
  }
})();
