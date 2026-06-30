'use strict';

/**
 * localStorage-backed data model & CRUD service for a Kanban-style app.
 * Entities: boards -> columns -> cards.
 * Exposed as global `window.Store`.
 */
(function (global) {
  var STORAGE_KEY = 'kanban.data.v1';

  function uid() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function now() { return Date.now(); }

  function defaultData() {
    return { boards: [], columns: [], cards: [] };
  }

  function read() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      var parsed = JSON.parse(raw);
      return {
        boards: Array.isArray(parsed.boards) ? parsed.boards : [],
        columns: Array.isArray(parsed.columns) ? parsed.columns : [],
        cards: Array.isArray(parsed.cards) ? parsed.cards : []
      };
    } catch (e) {
      return defaultData();
    }
  }

  function write(data) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function byId(arr, id) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr[i];
    }
    return null;
  }

  function nextPosition(arr, predicate) {
    var max = -1;
    for (var i = 0; i < arr.length; i++) {
      if (predicate(arr[i]) && arr[i].position > max) max = arr[i].position;
    }
    return max + 1;
  }

  function sortByPosition(arr) {
    return arr.slice().sort(function (a, b) { return a.position - b.position; });
  }

  /* ===== Boards ===== */
  function listBoards() {
    return sortByPosition(read().boards);
  }

  function getBoard(id) {
    return byId(read().boards, id);
  }

  function createBoard(attrs) {
    attrs = attrs || {};
    var data = read();
    var board = {
      id: uid(),
      title: attrs.title || 'Untitled Board',
      position: nextPosition(data.boards, function () { return true; }),
      createdAt: now(),
      updatedAt: now()
    };
    data.boards.push(board);
    write(data);
    return board;
  }

  function updateBoard(id, attrs) {
    var data = read();
    var board = byId(data.boards, id);
    if (!board) return null;
    if (attrs.title !== undefined) board.title = attrs.title;
    if (attrs.position !== undefined) board.position = attrs.position;
    board.updatedAt = now();
    write(data);
    return board;
  }

  function deleteBoard(id) {
    var data = read();
    var colIds = data.columns.filter(function (c) { return c.boardId === id; }).map(function (c) { return c.id; });
    data.cards = data.cards.filter(function (c) { return colIds.indexOf(c.columnId) === -1; });
    data.columns = data.columns.filter(function (c) { return c.boardId !== id; });
    data.boards = data.boards.filter(function (b) { return b.id !== id; });
    write(data);
    return true;
  }

  /* ===== Columns ===== */
  function listColumns(boardId) {
    return sortByPosition(read().columns.filter(function (c) { return c.boardId === boardId; }));
  }

  function getColumn(id) {
    return byId(read().columns, id);
  }

  function createColumn(boardId, attrs) {
    attrs = attrs || {};
    var data = read();
    if (!byId(data.boards, boardId)) return null;
    var column = {
      id: uid(),
      boardId: boardId,
      title: attrs.title || 'New Column',
      position: nextPosition(data.columns, function (c) { return c.boardId === boardId; }),
      createdAt: now(),
      updatedAt: now()
    };
    data.columns.push(column);
    write(data);
    return column;
  }

  function updateColumn(id, attrs) {
    var data = read();
    var column = byId(data.columns, id);
    if (!column) return null;
    if (attrs.title !== undefined) column.title = attrs.title;
    if (attrs.position !== undefined) column.position = attrs.position;
    column.updatedAt = now();
    write(data);
    return column;
  }

  function deleteColumn(id) {
    var data = read();
    data.cards = data.cards.filter(function (c) { return c.columnId !== id; });
    data.columns = data.columns.filter(function (c) { return c.id !== id; });
    write(data);
    return true;
  }

  /* ===== Cards ===== */
  function listCards(columnId) {
    return sortByPosition(read().cards.filter(function (c) { return c.columnId === columnId; }));
  }

  function getCard(id) {
    return byId(read().cards, id);
  }

  function createCard(columnId, attrs) {
    attrs = attrs || {};
    var data = read();
    if (!byId(data.columns, columnId)) return null;
    var card = {
      id: uid(),
      columnId: columnId,
      title: attrs.title || 'New Card',
      description: attrs.description || '',
      position: nextPosition(data.cards, function (c) { return c.columnId === columnId; }),
      createdAt: now(),
      updatedAt: now()
    };
    data.cards.push(card);
    write(data);
    return card;
  }

  function updateCard(id, attrs) {
    var data = read();
    var card = byId(data.cards, id);
    if (!card) return null;
    if (attrs.title !== undefined) card.title = attrs.title;
    if (attrs.description !== undefined) card.description = attrs.description;
    if (attrs.position !== undefined) card.position = attrs.position;
    card.updatedAt = now();
    write(data);
    return card;
  }

  function deleteCard(id) {
    var data = read();
    data.cards = data.cards.filter(function (c) { return c.id !== id; });
    write(data);
    return true;
  }

  /**
   * Move a card to a target column at a target index, re-normalizing positions.
   */
  function moveCard(cardId, targetColumnId, targetIndex) {
    var data = read();
    var card = byId(data.cards, cardId);
    if (!card) return null;
    var targetCol = byId(data.columns, targetColumnId);
    if (!targetCol) return null;

    card.columnId = targetColumnId;
    card.updatedAt = now();

    var siblings = sortByPosition(data.cards.filter(function (c) {
      return c.columnId === targetColumnId && c.id !== cardId;
    }));
    var idx = (typeof targetIndex === 'number') ? targetIndex : siblings.length;
    if (idx < 0) idx = 0;
    if (idx > siblings.length) idx = siblings.length;
    siblings.splice(idx, 0, card);
    for (var i = 0; i < siblings.length; i++) {
      siblings[i].position = i;
    }
    write(data);
    return card;
  }

  /**
   * Reorder an array of ids within their collection.
   * type: 'boards' | 'columns' | 'cards'
   */
  function reorder(type, orderedIds) {
    var data = read();
    var arr = data[type];
    if (!arr) return false;
    for (var i = 0; i < orderedIds.length; i++) {
      var item = byId(arr, orderedIds[i]);
      if (item) {
        item.position = i;
        item.updatedAt = now();
      }
    }
    write(data);
    return true;
  }

  /* ===== Bulk / utility ===== */
  function exportData() { return read(); }
  function importData(obj) {
    return write({
      boards: Array.isArray(obj.boards) ? obj.boards : [],
      columns: Array.isArray(obj.columns) ? obj.columns : [],
      cards: Array.isArray(obj.cards) ? obj.cards : []
    });
  }
  function clear() { return write(defaultData()); }

  global.Store = {
    STORAGE_KEY: STORAGE_KEY,
    uid: uid,
    listBoards: listBoards,
    getBoard: getBoard,
    createBoard: createBoard,
    updateBoard: updateBoard,
    deleteBoard: deleteBoard,
    listColumns: listColumns,
    getColumn: getColumn,
    createColumn: createColumn,
    updateColumn: updateColumn,
    deleteColumn: deleteColumn,
    listCards: listCards,
    getCard: getCard,
    createCard: createCard,
    updateCard: updateCard,
    deleteCard: deleteCard,
    moveCard: moveCard,
    reorder: reorder,
    exportData: exportData,
    importData: importData,
    clear: clear
  };
})(window);
