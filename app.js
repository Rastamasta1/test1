// Tip calculator: reads bill / tip / split inputs and renders live total per person.

const billInput = document.getElementById('bill');
const tipButtons = document.querySelectorAll('.tip-btn');
const peopleOutput = document.getElementById('people');
const decrementBtn = document.getElementById('decrement');
const incrementBtn = document.getElementById('increment');
const perPersonOutput = document.getElementById('perPerson');

const state = {
  bill: 0,
  tipPercent: 0,
  people: 1,
};

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function computePerPerson() {
  if (state.people <= 0) return 0;
  const total = state.bill * (1 + state.tipPercent / 100);
  return total / state.people;
}

function render() {
  peopleOutput.textContent = String(state.people);
  perPersonOutput.textContent = formatCurrency(computePerPerson());
}

billInput.addEventListener('input', () => {
  const value = parseFloat(billInput.value);
  state.bill = Number.isFinite(value) && value > 0 ? value : 0;
  render();
});

tipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tip = parseFloat(button.dataset.tip);
    state.tipPercent = Number.isFinite(tip) ? tip : 0;
    tipButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    render();
  });
});

decrementBtn.addEventListener('click', () => {
  if (state.people > 1) {
    state.people -= 1;
    render();
  }
});

incrementBtn.addEventListener('click', () => {
  state.people += 1;
  render();
});

render();
