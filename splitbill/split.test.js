import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitBill } from './split.js';

function assertAllIntegers(perPersonCents) {
  for (const c of perPersonCents) {
    assert.equal(Number.isInteger(c), true, `expected integer cent value, got ${c}`);
  }
}

function assertSumsExactly(result) {
  const sum = result.perPersonCents.reduce((a, b) => a + b, 0);
  assert.equal(sum, result.totalWithTipCents,
    `sum of perPersonCents (${sum}) must equal totalWithTipCents (${result.totalWithTipCents})`);
}

function assertMaxSpreadAtMostOneCent(perPersonCents) {
  const max = Math.max(...perPersonCents);
  const min = Math.min(...perPersonCents);
  assert.ok(max - min <= 1, `per-person shares should differ by at most 1 cent, got max=${max} min=${min}`);
}

test('divides evenly when total is an exact multiple of people count', () => {
  const result = splitBill(1000, 4, 0);
  assert.equal(result.tipCents, 0);
  assert.equal(result.totalWithTipCents, 1000);
  assert.equal(result.perPersonCents.length, 4);
  for (const c of result.perPersonCents) {
    assert.equal(c, 250);
  }
  assertSumsExactly(result);
});

test('applies the tip percentage before splitting', () => {
  const result = splitBill(1000, 4, 10);
  assert.equal(result.tipCents, 100);
  assert.equal(result.totalWithTipCents, 1100);
  assert.equal(result.perPersonCents.length, 4);
  for (const c of result.perPersonCents) {
    assert.equal(c, 275);
  }
  assertSumsExactly(result);
});

test('applies a tip percentage that does not divide evenly and rounds tip to whole cents', () => {
  const result = splitBill(999, 3, 15);
  // 999 * 0.15 = 149.85 -> tip must be a whole number of cents
  assert.equal(Number.isInteger(result.tipCents), true);
  assert.equal(Number.isInteger(result.totalWithTipCents), true);
  assert.equal(result.totalWithTipCents, 999 + result.tipCents);
  assertAllIntegers(result.perPersonCents);
  assertSumsExactly(result);
});

test('never returns a fractional cent: remainder distributed so parts sum exactly to totalWithTipCents (3-way split of 1000)', () => {
  const result = splitBill(1000, 3, 0);
  assert.equal(result.perPersonCents.length, 3);
  assertAllIntegers(result.perPersonCents);
  assertSumsExactly(result);
  assertMaxSpreadAtMostOneCent(result.perPersonCents);
  assert.equal(result.totalWithTipCents, 1000);
});

test('never returns a fractional cent across a range of awkward totals, people counts, and tip percentages', () => {
  const cases = [
    [101, 3, 0],
    [101, 3, 18],
    [1, 3, 0],
    [2, 7, 5],
    [12345, 6, 20],
    [9999, 11, 7],
    [500, 2, 33],
    [7, 4, 100],
  ];

  for (const [totalCents, people, tipPct] of cases) {
    const result = splitBill(totalCents, people, tipPct);
    assert.equal(result.perPersonCents.length, people,
      `expected ${people} shares for case (${totalCents}, ${people}, ${tipPct})`);
    assertAllIntegers(result.perPersonCents);
    assert.equal(Number.isInteger(result.tipCents), true);
    assert.equal(Number.isInteger(result.totalWithTipCents), true);
    assertSumsExactly(result);
    assertMaxSpreadAtMostOneCent(result.perPersonCents);
    assert.equal(result.totalWithTipCents, totalCents + result.tipCents);
  }
});

test('handles a single person: all cents (plus tip) go to that one person', () => {
  const result = splitBill(1234, 1, 20);
  assert.equal(result.perPersonCents.length, 1);
  assert.equal(result.tipCents, Math.round(1234 * 0.20));
  assert.equal(result.perPersonCents[0], result.totalWithTipCents);
  assertSumsExactly(result);
});

test('zero tip percentage produces zero tip and totalWithTipCents equal to totalCents', () => {
  const result = splitBill(777, 5, 0);
  assert.equal(result.tipCents, 0);
  assert.equal(result.totalWithTipCents, 777);
  assertSumsExactly(result);
  assertAllIntegers(result.perPersonCents);
});
