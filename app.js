// UI controller for Split the Bill. Handles DOM events and delegates
// all math/validation to the pure functions in calc.js.
import { TIP_OPTIONS, validateInputs, computeSplit } from './calc.js';

const totalInput = document.getElementById('total');
const customTipInput = document.getElementById('custom-tip');
const peopleInput = document.getElementById('people');
const tipButtons = Array.from(document.querySelectorAll('.tip-btn'));
const resetBtn = document.getElementById('reset-btn');
const form = document.getElementById('bill-form');

const totalErrorEl = document.getElementById('total-error');
const tipErrorEl = document.getElementById('tip-error');
const peopleErrorEl = document.getElementById('people-error');

const tipAmountEl = document.getElementById('tip-amount');
const totalWithTipEl = document.getElementById('total-with-tip');
const perPersonEl = document.getElementById('per-person');

let selectedTipButton = null;

function formatCurrency(n) {
  if (!Number.isFinite(n)) n = 0;
  return '$' + n.toFixed(2);
}

function clearErrors() {
  totalErrorEl.textContent = '';
  tipErrorEl.textContent = '';
  peopleErrorEl.textContent = '';
}

function render() {
  clearErrors();

  const totalRaw = totalInput.value;
  const tipRaw = customTipInput.value;
  const peopleRaw = peopleInput.value;

  const { valid, errors, values } = validateInputs({
    totalRaw,
    tipPercentRaw: tipRaw,
    peopleRaw
  });

  totalErrorEl.textContent = errors.total;
  tipErrorEl.textContent = errors.tip;
  peopleErrorEl.textContent = errors.people;

  if (!valid) {
    tipAmountEl.textContent = formatCurrency(0);
    totalWithTipEl.textContent = formatCurrency(0);
    perPersonEl.textContent = formatCurrency(0);
    return;
  }

  const { tipAmount, totalWithTip, perPerson } = computeSplit(values);

  tipAmountEl.textContent = formatCurrency(tipAmount);
  totalWithTipEl.textContent = formatCurrency(totalWithTip);
  perPersonEl.textContent = formatCurrency(perPerson);
}

function setActiveTipButton(btn) {
  tipButtons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  selectedTipButton = btn;
}

// Given the current custom tip field value, find a matching preset button
// (so typing '10' etc. highlights the same button clicking '10%' would).
function findMatchingPresetButton(rawValue) {
  const trimmed = String(rawValue).trim();
  if (trimmed === '') return null;
  return tipButtons.find(b => b.getAttribute('data-tip') === trimmed) || null;
}

tipButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tipValue = btn.getAttribute('data-tip');
    customTipInput.value = tipValue;
    setActiveTipButton(btn);
    render();
  });
});

customTipInput.addEventListener('input', () => {
  // Sync: if the typed value matches a preset (10/15/20), highlight that
  // button; otherwise clear the highlight since it's a genuinely custom value.
  const matched = findMatchingPresetButton(customTipInput.value);
  setActiveTipButton(matched);
  render();
});

totalInput.addEventListener('input', render);
peopleInput.addEventListener('input', render);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  render();
});

// Reset button handler: clears all inputs, error messages, tip-button
// selection state, and result outputs back to their default (empty/$0.00)
// state, then returns focus to the total field for quick re-entry.
resetBtn.addEventListener('click', () => {
  totalInput.value = '';
  customTipInput.value = '';
  peopleInput.value = '';
  setActiveTipButton(null);
  clearErrors();
  tipAmountEl.textContent = formatCurrency(0);
  totalWithTipEl.textContent = formatCurrency(0);
  perPersonEl.textContent = formatCurrency(0);
  totalInput.focus();
});

// initial render (all zeros/errors hidden since fields are empty)
render();
