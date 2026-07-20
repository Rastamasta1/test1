// Pure calculation module for Split the Bill.
// No DOM access here — only pure functions and data, so it is independently testable.

export const TIP_OPTIONS = [10, 15, 20];

// Parses a raw string input into a finite number, or returns null if invalid.
// Uses a strict regex so things like '1e5', 'Infinity', 'NaN', or stray
// characters are rejected as non-numeric rather than silently coerced.
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return n;
}

// Validates the three raw inputs and returns a structured result.
// Input: { totalRaw, tipPercentRaw, peopleRaw }
// Output: { valid: boolean, errors: {total, tip, people}, values: {total, tipPercent, people} }
export function validateInputs({ totalRaw, tipPercentRaw, peopleRaw }) {
  const errors = { total: '', tip: '', people: '' };

  const total = parseNumber(totalRaw);
  if (totalRaw === null || totalRaw === undefined || String(totalRaw).trim() === '') {
    errors.total = 'Enter a bill amount.';
  } else if (total === null) {
    errors.total = 'Please enter a valid number.';
  } else if (total < 0) {
    errors.total = 'Amount cannot be negative.';
  }

  let tipPercent = parseNumber(tipPercentRaw);
  if (tipPercentRaw !== null && tipPercentRaw !== undefined && String(tipPercentRaw).trim() !== '') {
    if (tipPercent === null) {
      errors.tip = 'Please enter a valid tip percentage.';
    } else if (tipPercent < 0) {
      errors.tip = 'Tip cannot be negative.';
    }
  } else {
    tipPercent = 0;
  }

  const people = parseNumber(peopleRaw);
  if (peopleRaw === null || peopleRaw === undefined || String(peopleRaw).trim() === '') {
    errors.people = 'Enter number of people.';
  } else if (people === null) {
    errors.people = 'Please enter a valid whole number.';
  } else if (people <= 0) {
    errors.people = 'Must be at least 1 person.';
  } else if (!Number.isInteger(people)) {
    errors.people = 'Must be a whole number.';
  }

  const valid = !errors.total && !errors.tip && !errors.people &&
    total !== null && people !== null && people > 0 && Number.isInteger(people);

  return {
    valid,
    errors,
    values: {
      total: total === null ? 0 : total,
      tipPercent: tipPercent === null ? 0 : tipPercent,
      people: people === null ? 0 : people
    }
  };
}

// Pure outcome function: state in -> result out.
// Input: { total, tipPercent, people } (already validated numbers)
// Output: { tipAmount, totalWithTip, perPerson }
export function computeSplit({ total, tipPercent, people }) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeTip = Number.isFinite(tipPercent) && tipPercent > 0 ? tipPercent : 0;
  const safePeople = Number.isInteger(people) && people > 0 ? people : 1;

  const tipAmount = safeTotal * (safeTip / 100);
  const totalWithTip = safeTotal + tipAmount;
  const perPerson = totalWithTip / safePeople;

  return { tipAmount, totalWithTip, perPerson };
}
