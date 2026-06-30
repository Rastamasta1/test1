'use strict';

/**
 * Wires UI interactions for cards and columns to the Store and re-renders.
 * Exposed as window.Interactions. Depends on window.Store and window.Render.
 */
(function (global) {
  var Store = global.Store;
  var Render = global.Render;
  var currentRoot = null;
  var currentBoardId = null;

  function rerender() {
    if (currentRoot) Render.renderApp(currentRoot, currentBoardId);
  }

  function closest(node, selector) {
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function onClick(e) {
    var t = e.target;
    var action = t.getAttribute && t.getAttribute('data-action');
    if (!action) {
      var btn = closest(t, '[data-action]');
      if (!btn) return;
      t = btn;
      action = t.getAttribute('data-action');
    }

    if (action === 'add-card') {
      var colEl = closest(t, '[data-column-id]');
      if (!colEl) return;
      var title = global.prompt('Card title:');
      if (title && title.trim()) {
        Store.createCard(colEl.getAttribute('data-column-id'), { title: title.trim() });
        rerender();
      }
      return;
    }

    if (action === 'edit-card') {
      var cardEl = closest(t, '[data-card-id]');
      if (!cardEl) return;
      var id = cardEl.getAttribute('data-card-id');
      var card = Store.getCard(id);
      if (!card) return;
      var newTitle = global.prompt('Edit card title:', card.title);
      if (newTitle === null) return;
      var newDesc = global.prompt('Edit description:', card.description || '');
      Store.updateCard(id, {
        title: newTitle.trim() || card.title,
        description: newDesc === null ? card.description : newDesc
      });
      rerender();
      return;
    }

    if (action === 'delete-card') {
      var delEl = closest(t, '[data-card-id]');
      if (!delEl) return;
      if (global.confirm('Delete this card?')) {
        Store.deleteCard(delEl.getAttribute('data-card-id'));
        rerender();
      }
      return;
    }

    if (action === 'add-column') {
      var boardEl = closest(t, '[data-board-id]');
      if (!boardEl) return;
      var colTitle = global.prompt('Column title:');
      if (colTitle && colTitle.trim()) {
        Store.createColumn(boardEl.getAttribute('data-board-id'), { title: colTitle.trim() });
        rerender();
      }
      return;
    }

    if (action === 'rename-column') {
      var rcEl = closest(t, '[data-column-id]');
      if (!rcEl) return;
      var cid = rcEl.getAttribute('data-column-id');
      var col = Store.getColumn(cid);
      if (!col) return;
      var rename = global.prompt('Rename column:', col.title);
      if (rename && rename.trim()) {
        Store.updateColumn(cid, { title: rename.trim() });
        rerender();
      }
      return;
    }

    if (action === 'delete-column') {
      var dcEl = closest(t, '[data-column-id]');
      if (!dcEl) return;
      if (global.confirm('Delete this column and its cards?')) {
        Store.deleteColumn(dcEl.getAttribute('data-column-id'));
        rerender();
      }
      return;
    }
  }

  function init(root, boardId) {
    currentRoot = root;
    currentBoardId = boardId || null;
    root.addEventListener('click', onClick);
  }

  global.Interactions = {
    init: init,
    rerender: rerender
  };
})(window);
