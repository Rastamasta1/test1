'use strict';

/**
 * Main entry point.
 * Wires the data Store, Render, Interactions, and DnD services together
 * and initializes the Kanban board into #app.
 *
 * On first run (empty Store) it seeds a default board with starter columns
 * so the user has something to interact with immediately.
 */
(function (global) {
  function seedIfEmpty() {
    if (!global.Store) return null;
    var boards = global.Store.listBoards();
    if (boards.length > 0) return boards[0];

    var board = global.Store.createBoard({ title: 'My Board' });
    ['To Do', 'In Progress', 'Done'].forEach(function (title) {
      global.Store.createColumn(board.id, { title: title });
    });
    return board;
  }

  function boot() {
    if (typeof document === 'undefined') return;
    var root = document.getElementById('app');
    if (!root) return;

    if (global.Render && global.Store) {
      var board = seedIfEmpty();
      var boardId = board ? board.id : undefined;

      global.Render.renderApp(root, boardId);

      if (global.Interactions) {
        global.Interactions.init(root, boardId);
      }
      if (global.DnD) {
        global.DnD.init(root);
      }
    } else {
      root.textContent = 'App initialized';
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
