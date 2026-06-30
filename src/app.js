(function () {
  'use strict';

  if (typeof document === 'undefined') {
    return;
  }

  function init() {
    var billInput = document.getElementById('bill');
    var tipInput = document.getElementById('tip');
    var splitInput = document.getElementById('split');

    var tipAmountEl = document.getElementById('tip-amount');
    var totalAmountEl = document.getElementById('total-amount');
    var perPersonEl = document.getElementById('per-person');

    var currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    function parseNonNegative(value) {
      var n = parseFloat(value);
      if (isNaN(n) || n < 0) {
        return 0;
      }
      return n;
    }

    function parseSplit(value) {
      var n = parseInt(value, 10);
      if (isNaN(n) || n < 1) {
        return 1;
      }
      return n;
    }

    function calculate() {
      var bill = parseNonNegative(billInput.value);
      var tipPercent = parseNonNegative(tipInput.value);
      var split = parseSplit(splitInput.value);

      var tipAmount = bill * (tipPercent / 100);
      var total = bill + tipAmount;
      var perPerson = total / split;

      tipAmountEl.textContent = currencyFormatter.format(tipAmount);
      totalAmountEl.textContent = currencyFormatter.format(total);
      perPersonEl.textContent = currencyFormatter.format(perPerson);
    }

    [billInput, tipInput, splitInput].forEach(function (el) {
      if (el) {
        el.addEventListener('input', calculate);
      }
    });

    // Initial render
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
