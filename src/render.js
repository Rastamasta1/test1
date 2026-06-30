'use strict';

/**
 * Render functions: build DOM for boards, columns, and cards from Store state.
 * Exposed as global `window.Render`.
 * Depends on window.Store.
 */
(function (global) {
  var Store = global.Store;

  function el(tag, opts) {
    opts = opts || {};
    var node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        node.setAttribute(k, opts.attrs[k]);
      });
    }
    if (opts.children) {
      opts.children.forEach(function (c) { if (c) node.appendChild(c); });
    }
    return node;
  }

  /** Render a single card from a card record. */
  function renderCard(card) {
    var actions = el('div', {
      className: 'kanban-card-actions',
      children: [
        el('button', { className: 'kanban-icon-btn', text: '\u270e', attrs: { type: 'button', 'data-action': 'edit-card', title: 'Edit card' } }),
        el('button', { className: 'kanban-icon-btn', text: '\u00d7', attrs: { type: 'button', 'data-action': 'delete-card', title: 'Delete card' } })
      ]
    });

    var body = el('div', { className: 'kanban-card-body' });
    body.appendChild(el('div', { className: 'kanban-card-title', text: card.title }));
    if (card.description) {
      body.appendChild(el('div', { className: 'kanban-card-desc', text: card.description }));
    }

    return el('div', {
      className: 'kanban-card',
      attrs: { 'data-card-id': card.id, draggable: 'true' },
      children: [body, actions]
    });
  }

  /** Render a column with its cards (read from Store). */
  function renderColumn(column) {
    var cards = Store.listCards(column.id);
    var cardList = el('div', { className: 'kanban-card-list' });
    cards.forEach(function (card) { cardList.appendChild(renderCard(card)); });

    var header = el('div', {
      className: 'kanban-column-header',
      children: [
        el('span', { className: 'kanban-column-title', text: column.title }),
        el('span', { className: 'kanban-column-count', text: String(cards.length) }),
        el('div', {
          className: 'kanban-column-actions',
          children: [
            el('button', { className: 'kanban-icon-btn', text: '\u270e', attrs: { type: 'button', 'data-action': 'rename-column', title: 'Rename column' } }),
            el('button', { className: 'kanban-icon-btn', text: '\u00d7', attrs: { type: 'button', 'data-action': 'delete-column', title: 'Delete column' } })
          ]
        })
      ]
    });

    var addCardBtn = el('button', {
      className: 'btn btn-outline kanban-add-card',
      text: '+ Add card',
      attrs: { type: 'button', 'data-action': 'add-card' }
    });

    return el('div', {
      className: 'kanban-column',
      attrs: { 'data-column-id': column.id },
      children: [header, cardList, addCardBtn]
    });
  }

  /** Render a board: its columns laid out horizontally. */
  function renderBoard(board) {
    var columns = Store.listColumns(board.id);
    var columnsWrap = el('div', { className: 'kanban-columns' });
    columns.forEach(function (col) { columnsWrap.appendChild(renderColumn(col)); });

    if (columns.length === 0) {
      columnsWrap.appendChild(el('div', {
        className: 'kanban-empty',
        text: 'No columns yet.'
      }));
    }

    var addColumnBtn = el('button', {
      className: 'btn btn-primary kanban-add-column',
      text: '+ Add column',
      attrs: { type: 'button', 'data-action': 'add-column' }
    });
    columnsWrap.appendChild(addColumnBtn);

    return el('div', {
      className: 'kanban-board',
      attrs: { 'data-board-id': board.id },
      children: [
        el('h2', { className: 'kanban-board-title', text: board.title }),
        columnsWrap
      ]
    });
  }

  /**
   * Render the whole app into a root element.
   * If boardId given, renders that board; otherwise the first board.
   */
  function renderApp(root, boardId) {
    if (!root) return;
    root.innerHTML = '';
    var boards = Store.listBoards();
    if (boards.length === 0) {
      root.appendChild(el('div', {
        className: 'kanban-empty',
        text: 'No boards yet. Create one to get started.'
      }));
      return;
    }
    var board = boardId ? Store.getBoard(boardId) : boards[0];
    if (!board) {
      root.appendChild(el('div', { className: 'kanban-empty', text: 'Board not found.' }));
      return;
    }
    root.appendChild(renderBoard(board));
  }

  global.Render = {
    el: el,
    renderCard: renderCard,
    renderColumn: renderColumn,
    renderBoard: renderBoard,
    renderApp: renderApp
  };
})(window);
