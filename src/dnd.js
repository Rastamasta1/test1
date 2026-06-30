'use strict';

/**
 * Native HTML5 drag-and-drop for moving and reordering Kanban cards.
 * Computes target column + index, persists via Store.moveCard, and re-renders.
 * Exposed as window.DnD. Depends on window.Store and window.Interactions.
 */
(function (global) {
  var Store = global.Store;
  var currentRoot = null;
  var dragCardId = null;
  var dragEl = null;
  var placeholder = null;

  function closest(node, selector) {
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function makePlaceholder() {
    var ph = document.createElement('div');
    ph.className = 'kanban-card-placeholder';
    return ph;
  }

  function removePlaceholder() {
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  function clearColumnHighlight() {
    var cols = currentRoot.querySelectorAll('.kanban-column.kanban-column-dragover');
    for (var i = 0; i < cols.length; i++) {
      cols[i].classList.remove('kanban-column-dragover');
    }
  }

  function onDragStart(e) {
    var card = closest(e.target, '[data-card-id]');
    if (!card) return;
    dragCardId = card.getAttribute('data-card-id');
    dragEl = card;
    placeholder = makePlaceholder();
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragCardId); } catch (err) {}
    }
    // defer so the drag image is captured before hiding
    global.setTimeout(function () {
      if (dragEl) dragEl.classList.add('kanban-card-dragging');
    }, 0);
  }

  function afterElement(list, y) {
    var cards = list.querySelectorAll('.kanban-card:not(.kanban-card-dragging)');
    var closestEl = null;
    var closestOffset = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < cards.length; i++) {
      var box = cards[i].getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closestEl = cards[i];
      }
    }
    return closestEl;
  }

  function onDragOver(e) {
    if (!dragCardId) return;
    var column = closest(e.target, '[data-column-id]');
    if (!column) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

    clearColumnHighlight();
    column.classList.add('kanban-column-dragover');

    var list = column.querySelector('.kanban-card-list');
    if (!list) return;
    var ref = afterElement(list, e.clientY);
    if (ref) {
      list.insertBefore(placeholder, ref);
    } else {
      list.appendChild(placeholder);
    }
  }

  function computeIndex(list) {
    var index = 0;
    var children = list.children;
    for (var i = 0; i < children.length; i++) {
      if (children[i] === placeholder) return index;
      if (children[i].classList && children[i].classList.contains('kanban-card') &&
          children[i] !== dragEl) {
        index++;
      }
    }
    return index;
  }

  function onDrop(e) {
    if (!dragCardId) return;
    var column = closest(e.target, '[data-column-id]');
    if (!column) { cleanup(); return; }
    e.preventDefault();
    var list = column.querySelector('.kanban-card-list');
    var targetColumnId = column.getAttribute('data-column-id');
    var index = list ? computeIndex(list) : undefined;

    var movedId = dragCardId;
    Store.moveCard(movedId, targetColumnId, index);
    cleanup();

    if (global.Interactions && global.Interactions.rerender) {
      global.Interactions.rerender();
    }

    // animate the dropped card in its new place
    if (currentRoot) {
      var droppedEl = currentRoot.querySelector('[data-card-id="' + movedId + '"]');
      if (droppedEl) {
        droppedEl.classList.add('kanban-card-dropped');
        global.setTimeout(function () {
          droppedEl.classList.remove('kanban-card-dropped');
        }, 300);
      }
    }
  }

  function cleanup() {
    removePlaceholder();
    clearColumnHighlight();
    if (dragEl) dragEl.classList.remove('kanban-card-dragging');
    dragCardId = null;
    dragEl = null;
    placeholder = null;
  }

  function onDragEnd() {
    cleanup();
  }

  function init(root) {
    currentRoot = root;
    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('dragend', onDragEnd);
  }

  global.DnD = { init: init };
})(window);
