/**
 * test/gomoku.test.mjs — proves gomoku.js's createBoard, placeMove and
 * checkWinner behave as pure board + win-detection logic.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createBoard, placeMove, checkWinner } from '../gomoku.js';

test('createBoard() returns a grid with every cell null', () => {
  const board = createBoard();
  assert.strictEqual(board.length, 15);
  for (const row of board) {
    assert.strictEqual(row.length, 15);
    for (const cell of row) {
      assert.strictEqual(cell, null);
    }
  }
});

test('createBoard(size) honors a custom size', () => {
  const board = createBoard(5);
  assert.strictEqual(board.length, 5);
  assert.strictEqual(board[0].length, 5);
});

test('placeMove does not mutate its input board', () => {
  const board = createBoard(5);
  const originalRow0 = board[0];
  placeMove(board, 2, 2, 'X');
  assert.strictEqual(board[2][2], null);
  assert.strictEqual(board[0], originalRow0);
});

test('placeMove returns a new board with the mark placed on an empty cell', () => {
  const board = createBoard(5);
  const next = placeMove(board, 1, 1, 'X');
  assert.notStrictEqual(next, board);
  assert.strictEqual(next[1][1], 'X');
});

test('placeMove returns the same input board unchanged when the cell is occupied', () => {
  const board = createBoard(5);
  const afterFirst = placeMove(board, 0, 0, 'X');
  const afterSecond = placeMove(afterFirst, 0, 0, 'O');
  assert.strictEqual(afterSecond, afterFirst);
  assert.strictEqual(afterSecond[0][0], 'X');
});

test('placeMove returns the same input board unchanged when out of bounds', () => {
  const board = createBoard(5);
  const result = placeMove(board, -1, 0, 'X');
  assert.strictEqual(result, board);
  const result2 = placeMove(board, 0, 10, 'X');
  assert.strictEqual(result2, board);
});

test('checkWinner returns the player for five consecutive marks horizontally', () => {
  let board = createBoard(15);
  for (let c = 0; c < 5; c++) {
    board = placeMove(board, 7, c, 'X');
  }
  assert.strictEqual(checkWinner(board, 7, 4, 'X'), 'X');
});

test('checkWinner returns the player for five consecutive marks vertically', () => {
  let board = createBoard(15);
  for (let r = 0; r < 5; r++) {
    board = placeMove(board, r, 3, 'O');
  }
  assert.strictEqual(checkWinner(board, 4, 3, 'O'), 'O');
});

test('checkWinner returns the player for five consecutive marks diagonally (\\)', () => {
  let board = createBoard(15);
  for (let i = 0; i < 5; i++) {
    board = placeMove(board, i, i, 'X');
  }
  assert.strictEqual(checkWinner(board, 4, 4, 'X'), 'X');
});

test('checkWinner returns the player for five consecutive marks diagonally (/)', () => {
  let board = createBoard(15);
  for (let i = 0; i < 5; i++) {
    board = placeMove(board, i, 4 - i, 'O');
  }
  assert.strictEqual(checkWinner(board, 4, 0, 'O'), 'O');
});

test('checkWinner returns null for only four consecutive marks', () => {
  let board = createBoard(15);
  for (let c = 0; c < 4; c++) {
    board = placeMove(board, 2, c, 'X');
  }
  assert.strictEqual(checkWinner(board, 2, 3, 'X'), null);
});
