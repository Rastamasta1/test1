/**
 * test/gomoku-view.test.mjs — proves gomoku-view.js's renderBoardHtml,
 * cellLabel and nextPlayer behave as pure render helpers over gomoku.js's
 * board shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { renderBoardHtml, cellLabel, nextPlayer } from '../gomoku-view.js';
import { createBoard, placeMove } from '../gomoku.js';

test('renderBoardHtml(createBoard(3)) contains exactly nine cell buttons', () => {
  const board = createBoard(3);
  const html = renderBoardHtml(board);
  const matches = html.match(/<button class="cell"/g) || [];
  assert.strictEqual(matches.length, 9);
});

test('rendered string includes the mark after placeMove places an X', () => {
  const board = createBoard(3);
  const next = placeMove(board, 1, 1, 'X');
  const html = renderBoardHtml(next);
  assert.ok(html.includes('data-row="1" data-col="1">X</button>'));
});

test('cellLabel returns the mark for a set cell and empty string for an empty cell', () => {
  assert.strictEqual(cellLabel('X'), 'X');
  assert.strictEqual(cellLabel('O'), 'O');
  assert.strictEqual(cellLabel(null), '');
});

test("nextPlayer('X') === 'O' and nextPlayer('O') === 'X'", () => {
  assert.strictEqual(nextPlayer('X'), 'O');
  assert.strictEqual(nextPlayer('O'), 'X');
});
