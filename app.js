// Tip Splitter UI controller
// Handles form submission, custom tip toggle, and result rendering

const form = document.getElementById('tip-form');
const billInput = document.getElementById('bill');
const tipSelect = document.getElementById('tip');
const tipCustom = document.getElementById('tip-custom');
const peopleInput = document.getElementById('people');
const resultDiv = document.getElementById('result');
const tipPerPersonEl = document.getElementById('tip-per-person');
const totalPerPersonEl = document.getElementById('total-per-person');
const grandTotalEl = document.getElementById('grand-total');

// --- Pure computation logic ---

/**
 * Compute tip split results.
 * @param {number} bill - Total bill amount
 * @param {number} tipPct - Tip percentage (0-100)
 * @param {number} people - Number of people
 * @returns {{ tipPerPerson: number, totalPerPerson: number, grandTotal: number }}
 */
export function compute(bill, tipPct, people) {
  if (people < 1) people = 1;
  const tipAmount = bill * (tipPct / 100);
  const grandTotal = bill + tipAmount;
  const tipPerPerson = tipAmount / people;
  const totalPerPerson = grandTotal / people;
  return { tipPerPerson, totalPerPerson, grandTotal };
}

// --- Helpers ---

function fmt(n) {
  return '$' + n.toFixed(2);
}

function getActiveTipPct() {
  if (tipSelect.value === 'custom') {
    const v = parseFloat(tipCustom.value);
    return isNaN(v) ? 0 : v;
  }
  return parseFloat(tipSelect.value) || 0;
}

function renderResults() {
  const bill = parseFloat(billInput.value);
  const people = parseInt(peopleInput.value, 10);

  if (isNaN(bill) || bill < 0 || isNaN(people) || people < 1) {
    resultDiv.classList.add('hidden');
    return;
  }

  const tipPct = getActiveTipPct();
  const { tipPerPerson, totalPerPerson, grandTotal } = compute(bill, tipPct, people);

  tipPerPersonEl.textContent = fmt(tipPerPerson);
  totalPerPersonEl.textContent = fmt(totalPerPerson);
  grandTotalEl.textContent = fmt(grandTotal);
  resultDiv.classList.remove('hidden');
}

// --- Event wiring ---

// Toggle custom tip input visibility
tipSelect.addEventListener('change', () => {
  if (tipSelect.value === 'custom') {
    tipCustom.classList.remove('hidden');
    tipCustom.focus();
  } else {
    tipCustom.classList.add('hidden');
    tipCustom.value = '';
  }
  renderResults();
});

tipCustom.addEventListener('input', renderResults);
billInput.addEventListener('input', renderResults);
peopleInput.addEventListener('input', renderResults);

// Form submit for explicit Calculate button press
form.addEventListener('submit', (e) => {
  e.preventDefault(); // FIRST: prevent default browser GET submission
  renderResults();
});
