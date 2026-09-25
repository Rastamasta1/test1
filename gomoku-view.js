/**
 * gomoku-view.js — pure render helpers for the Gomoku board UI.
 *
 * Plain browser ES module, no build step, no TypeScript.
 * Depends on nothing else — takes a board (as produced by gomoku.js's
 * createBoard/placeMove) and returns strings/values only. No DOM access.
 *
 * Exports:
 *   renderBoardHtml(board)  → string — one <button class="cell"> per cell
 *   cellLabel(cell)         → string — display text for a single cell
 *   nextPlayer(current)     → 'X' | 'O' — the opposite mark
 */

/**
 * Return the display text for a single cell value.
 * A set cell ('X' or 'O') displays as itself; an empty (null/undefined)
 * cell displays as an empty string.
 *
 * @param {*} cell
 * @returns {string}
 */
export function cellLabel(cell) {
  return cell === null || cell === undefined ? '' : String(cell);
}

/**
 * Render a board as an HTML string: exactly one
 * <button class="cell" data-row="r" data-col="c">label</button>
 * per cell, in row-major order.
 *
 * @param {Array<Array<*>>} board
 * @returns {string}
 */
export function renderBoardHtml(board) {
  let html = '';
  for (let r = 0; r < board.length; r++) {
    const row = board[r];
    for (let c = 0; c < row.length; c++) {
      const label = cellLabel(row[c]);
      html += `<button class="cell" data-row="${r}" data-col="${c}">${label}</button>`;
    }
  }
  return html;
}

/**
 * Return the opposite player's mark.
 *
 * @param {'X'|'O'} current
 * @returns {'X'|'O'}
 */
export function nextPlayer(current) {
  return current === 'X' ? 'O' : 'X';
}
