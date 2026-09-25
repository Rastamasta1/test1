/**
 * gomoku.js — pure board + win-detection logic for Gomoku (five-in-a-row).
 *
 * Plain browser ES module, no build step, no TypeScript.
 *
 * Exports:
 *   createBoard(size = 15)                    → cell[][]  (all null)
 *   placeMove(board, row, col, player)        → cell[][]  (new board, or the
 *                                                same input board when the
 *                                                move is illegal)
 *   checkWinner(board, row, col, player)      → player | null
 */

/**
 * Create a fresh size-by-size board with every cell set to null.
 * @param {number} [size=15]
 * @returns {Array<Array<null>>}
 */
export function createBoard(size = 15) {
  const board = [];
  for (let r = 0; r < size; r++) {
    board.push(new Array(size).fill(null));
  }
  return board;
}

/**
 * Place a move on the board without mutating the input.
 * Returns a NEW board with the move applied when (row, col) is in bounds
 * and currently empty. Returns the SAME input board reference, unchanged,
 * when the target cell is out of bounds or already occupied.
 *
 * @param {Array<Array<*>>} board
 * @param {number} row
 * @param {number} col
 * @param {*} player - a mark such as 'X' or 'O'
 * @returns {Array<Array<*>>}
 */
export function placeMove(board, row, col, player) {
  const size = board.length;
  const inBounds = row >= 0 && row < size && col >= 0 && col < (board[row] ? board[row].length : 0);
  if (!inBounds) return board;
  if (board[row][col] !== null) return board;

  const next = board.map((r) => r.slice());
  next[row][col] = player;
  return next;
}

// The four orientations to scan: each is a pair of opposite step directions.
const DIRECTIONS = [
  [
    [0, 1],
    [0, -1],
  ], // horizontal
  [
    [1, 0],
    [-1, 0],
  ], // vertical
  [
    [1, 1],
    [-1, -1],
  ], // diagonal \
  [
    [1, -1],
    [-1, 1],
  ], // diagonal /
];

/**
 * Determine whether the mark at (row, col) completes a run of five or more
 * consecutive same-player marks, in any of the four orientations
 * (horizontal, vertical, diagonal \, diagonal /).
 *
 * @param {Array<Array<*>>} board
 * @param {number} row
 * @param {number} col
 * @param {*} player
 * @returns {*} player when a winning run passes through (row, col); null otherwise
 */
export function checkWinner(board, row, col, player) {
  const size = board.length;
  if (row < 0 || row >= size || col < 0 || col >= (board[row] ? board[row].length : 0)) return null;
  if (board[row][col] !== player) return null;

  for (const [stepA, stepB] of DIRECTIONS) {
    let count = 1;
    count += countDirection(board, row, col, stepA[0], stepA[1], player);
    count += countDirection(board, row, col, stepB[0], stepB[1], player);
    if (count >= 5) return player;
  }

  return null;
}

function countDirection(board, row, col, dRow, dCol, player) {
  const size = board.length;
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < size && board[r] && c >= 0 && c < board[r].length && board[r][c] === player) {
    count++;
    r += dRow;
    c += dCol;
  }
  return count;
}
