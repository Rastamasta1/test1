// Application entry point.
// Connects persistence, rendering, drag-and-drop, and UI interactions
// around a single in-memory BoardState that is the source of truth.

import type { BoardState } from './types/board';
import { seedBoardState, createSeedState } from './data/persistence';
import { commit } from './data/boardService';
import { renderBoard } from './ui/render';
import { attachDragAndDrop, markCardsDraggable } from './ui/dragDrop';
import { attachInteractions } from './ui/interactions';

function bootstrap(): void {
  const container = document.getElementById('board');
  if (!container) {
    console.error('[kanban] #board container not found');
    return;
  }

  // Single source of truth for the board state.
  let state: BoardState = seedBoardState();

  const getState = (): BoardState => state;
  const setState = (next: BoardState): void => {
    state = next;
  };

  // Initial render.
  renderBoard(state, container);
  markCardsDraggable(container);

  // Drag-and-drop (attached once to the stable #board element).
  attachDragAndDrop({ getState, setState, container });

  // Card/column add/edit/delete interactions + header buttons.
  attachInteractions({ getState, setState, container });

  // Reset button: wipe to a fresh seed and re-render.
  const resetBtn = document.getElementById('reset-board-btn');
  resetBtn?.addEventListener('click', () => {
    const ok = window.confirm(
      'Reset the board to its default state? This cannot be undone.'
    );
    if (!ok) return;
    const fresh = commit(createSeedState());
    setState(fresh);
    renderBoard(fresh, container);
    markCardsDraggable(container);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
