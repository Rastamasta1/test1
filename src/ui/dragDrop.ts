// Native HTML5 drag-and-drop for moving and reordering cards.
// Wires up draggable cards and column drop targets, computes the target
// index from the pointer location, mutates state via moveCard, persists
// via commit, and re-renders the board.

import type { BoardState } from '../types/board';
import { moveCard, commit } from '../data/boardService';
import { renderBoard } from './render';

export interface DragDropContext {
  /** Returns the current board state. */
  getState: () => BoardState;
  /** Replaces the current board state (after a mutation). */
  setState: (next: BoardState) => void;
  /** The #board container element. */
  container: HTMLElement;
}

const DRAG_MIME = 'application/x-kanban-card-id';

let draggingCardId: string | null = null;

/** Find the card element under the given Y within a cards container. */
function getDropIndex(cardsEl: HTMLElement, clientY: number): number {
  const cards = Array.from(
    cardsEl.querySelectorAll<HTMLElement>('.card:not(.dragging)')
  );
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) return i;
  }
  return cards.length;
}

function clearIndicators(container: HTMLElement): void {
  container
    .querySelectorAll('.column--drag-over')
    .forEach((n) => n.classList.remove('column--drag-over'));
}

/**
 * Attach drag-and-drop event listeners to the board container.
 * Uses event delegation so it survives re-renders as long as it is
 * re-invoked after each renderBoard (or attached once to the stable
 * #board element, which is what we do here).
 */
export function attachDragAndDrop(ctx: DragDropContext): void {
  const { container } = ctx;

  // Make existing and future cards draggable via delegation.
  container.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement | null;
    const card = target?.closest<HTMLElement>('.card');
    if (!card || !e.dataTransfer) return;
    draggingCardId = card.dataset.cardId ?? null;
    if (!draggingCardId) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(DRAG_MIME, draggingCardId);
    // Some browsers require text/plain to initiate drag.
    e.dataTransfer.setData('text/plain', draggingCardId);
    card.classList.add('dragging');
  });

  container.addEventListener('dragend', (e) => {
    const target = e.target as HTMLElement | null;
    target?.closest('.card')?.classList.remove('dragging');
    clearIndicators(container);
    draggingCardId = null;
  });

  container.addEventListener('dragover', (e) => {
    if (!draggingCardId) return;
    const target = e.target as HTMLElement | null;
    const column = target?.closest<HTMLElement>('.column');
    if (!column) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    clearIndicators(container);
    column.classList.add('column--drag-over');
  });

  container.addEventListener('dragleave', (e) => {
    const target = e.target as HTMLElement | null;
    const column = target?.closest<HTMLElement>('.column');
    // Only clear when actually leaving the column subtree.
    if (column && !column.contains(e.relatedTarget as Node | null)) {
      column.classList.remove('column--drag-over');
    }
  });

  container.addEventListener('drop', (e) => {
    if (!draggingCardId) return;
    const target = e.target as HTMLElement | null;
    const column = target?.closest<HTMLElement>('.column');
    if (!column) return;
    e.preventDefault();

    const toColumnId = column.dataset.columnId;
    if (!toColumnId) return;

    const cardsEl =
      column.querySelector<HTMLElement>('.column__cards') ?? column;
    const toIndex = getDropIndex(cardsEl, e.clientY);

    const cardId = draggingCardId;
    clearIndicators(container);
    draggingCardId = null;

    const state = ctx.getState();
    const next = commit(moveCard(state, cardId, toColumnId, toIndex));
    ctx.setState(next);
    renderBoard(next, container);
  });
}

/**
 * Ensure rendered cards are draggable. Call after each renderBoard,
 * since renderBoard rebuilds the DOM. Cheap idempotent pass.
 */
export function markCardsDraggable(container: HTMLElement): void {
  container
    .querySelectorAll<HTMLElement>('.card')
    .forEach((card) => card.setAttribute('draggable', 'true'));
}
