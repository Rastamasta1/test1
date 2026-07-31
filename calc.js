// Pure calculation module — no DOM dependencies

/** Declared RTP-equivalent target: 100% (calculator, not a game) */
export const VERSION = '1.0.0';

/**
 * Calculate per-person tip and total.
 * @param {number} bill       - Total bill amount (>=0)
 * @param {number} tipPercent - Tip percentage (0-100)
 * @param {number} people     - Number of people (>=1, integer)
 * @returns {{ tipPerPerson: number, totalPerPerson: number, grandTotal: number }}
 */
export function calculatePerPerson(bill, tipPercent, people) {
  if (!isFinite(bill) || bill < 0) throw new RangeError('Invalid bill amount');
  if (!isFinite(tipPercent) || tipPercent < 0) throw new RangeError('Invalid tip percentage');
  if (!Number.isInteger(people) || people < 1) throw new RangeError('People must be a positive integer');

  const tipTotal = bill * (tipPercent / 100);
  const grandTotal = bill + tipTotal;
  const tipPerPerson = Math.round((tipTotal / people) * 100) / 100;
  const totalPerPerson = Math.round((grandTotal / people) * 100) / 100;

  return { tipPerPerson, totalPerPerson, grandTotal: Math.round(grandTotal * 100) / 100 };
}
