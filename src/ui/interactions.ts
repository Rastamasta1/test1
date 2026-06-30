// Card/column UI interactions: add, edit, delete cards; add, rename,
// delete columns. Uses event delegation on the #board container plus
// header buttons, drives boardService mutations, persists via commit,
// and re-renders. Designed to be attached once to stable elements.

import type { BoardState } from '../types/board';
import {
  addColumn,
  updateColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
  commit,
} from '../data/boardService';
import { renderBoard } from './render';
import { markCardsDraggable } from './dragDrop';
import { openModal, confirmModal } from './modal';

export interface InteractionsContext {
  getState: () => BoardState;
  setState: (next: BoardState) => void;
  container: HTMLElement;
}

function rerender(ctx: InteractionsContext, next: BoardState): void {
  ctx.setState(next);
  renderBoard(next, ctx.container);
  markCardsDraggable(ctx.container);
}

async function handleAddColumn(ctx: InteractionsContext): Promise<void> {
  const result = await openModal({
    title: 'Add Column',
    confirmText: 'Add',
    fields: [
      { name: 'title', label: 'Column title', required: true, placeholder: 'e.g. Backlog' },
      { name: 'wipLimit', label: 'WIP limit (optional)', type: 'number', placeholder: 'No limit' },
    ],
  });
  if (!result) return;
  const wip = result.wipLimit ? Number(result.wipLimit) : null;
  const next = commit(
    addColumn(ctx.getState(), {
      title: result.title,
      wipLimit: Number.isFinite(wip as number) ? wip : null,
    })
  );
  rerender(ctx, next);
}

async function handleRenameColumn(ctx: InteractionsContext, columnId: string): Promise<void> {
  const state = ctx.getState();
  const column = state.columns.find((c) => c.id === columnId);
  if (!column) return;
  const result = await openModal({
    title: 'Edit Column',
    fields: [
      { name: 'title', label: 'Column title', required: true, value: column.title },
      {
        name: 'wipLimit',
        label: 'WIP limit (optional)',
        type: 'number',
        value: column.wipLimit != null ? String(column.wipLimit) : '',
        placeholder: 'No limit',
      },
    ],
  });
  if (!result) return;
  const wip = result.wipLimit ? Number(result.wipLimit) : null;
  const next = commit(
    updateColumn(ctx.getState(), columnId, {
      title: result.title,
      wipLimit: Number.isFinite(wip as number) ? wip : null,
    })
  );
  rerender(ctx, next);
}

async function handleDeleteColumn(ctx: InteractionsContext, columnId: string): Promise<void> {
  const column = ctx.getState().columns.find((c) => c.id === columnId);
  if (!column) return;
  const ok = await confirmModal(
    'Delete Column',
    `Delete "${column.title}" and all its cards? This cannot be undone.`
  );
  if (!ok) return;
  const next = commit(deleteColumn(ctx.getState(), columnId));
  rerender(ctx, next);
}

async function handleAddCard(ctx: InteractionsContext, columnId: string): Promise<void> {
  const result = await openModal({
    title: 'Add Card',
    confirmText: 'Add',
    fields: [
      { name: 'title', label: 'Title', required: true, placeholder: 'Card title' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'labels', label: 'Labels (comma separated)', placeholder: 'bug, urgent' },
    ],
  });
  if (!result) return;
  const labels = result.labels
    ? result.labels.split(',').map((l) => l.trim()).filter(Boolean)
    : undefined;
  const next = commit(
    addCard(ctx.getState(), {
      columnId,
      title: result.title,
      description: result.description || undefined,
      labels,
    })
  );
  rerender(ctx, next);
}

async function handleEditCard(ctx: InteractionsContext, cardId: string): Promise<void> {
  const card = ctx.getState().cards.find((c) => c.id === cardId);
  if (!card) return;
  const result = await openModal({
    title: 'Edit Card',
    fields: [
      { name: 'title', label: 'Title', required: true, value: card.title },
      { name: 'description', label: 'Description', type: 'textarea', value: card.description ?? '' },
      {
        name: 'labels',
        label: 'Labels (comma separated)',
        value: (card.labels ?? []).join(', '),
      },
    ],
  });
  if (!result) return;
  const labels = result.labels
    ? result.labels.split(',').map((l) => l.trim()).filter(Boolean)
    : [];
  const next = commit(
    updateCard(ctx.getState(), cardId, {
      title: result.title,
      description: result.description || undefined,
      labels,
    })
  );
  rerender(ctx, next);
}

async function handleDeleteCard(ctx: InteractionsContext, cardId: string): Promise<void> {
  const card = ctx.getState().cards.find((c) => c.id === cardId);
  if (!card) return;
  const ok = await confirmModal('Delete Card', `Delete "${card.title}"?`);
  if (!ok) return;
  const next = commit(deleteCard(ctx.getState(), cardId));
  rerender(ctx, next);
}

/**
 * Attach all interaction handlers. Call once after the initial render.
 * Header buttons (#add-column-btn) and per-column/card action buttons
 * are handled via delegation on the #board container.
 */
export function attachInteractions(ctx: InteractionsContext): void {
  const addColumnBtn = document.getElementById('add-column-btn');
  addColumnBtn?.addEventListener('click', () => void handleAddColumn(ctx));

  ctx.container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const action = target.closest<HTMLElement>('[data-action]');
    if (action) {
      const kind = action.dataset.action;
      const columnEl = action.closest<HTMLElement>('.column');
      const columnId = columnEl?.dataset.columnId ?? '';
      const cardEl = action.closest<HTMLElement>('.card');
      const cardId = cardEl?.dataset.cardId ?? '';
      e.stopPropagation();
      switch (kind) {
        case 'add-card':
          void handleAddCard(ctx, columnId);
          return;
        case 'rename-column':
          void handleRenameColumn(ctx, columnId);
          return;
        case 'delete-column':
          void handleDeleteColumn(ctx, columnId);
          return;
        case 'edit-card':
          void handleEditCard(ctx, cardId);
          return;
        case 'delete-card':
          void handleDeleteCard(ctx, cardId);
          return;
        default:
          return;
      }
    }

    // Clicking the body of a card opens the edit modal.
    const card = target.closest<HTMLElement>('.card');
    if (card?.dataset.cardId) {
      void handleEditCard(ctx, card.dataset.cardId);
    }
  });

  // Keyboard: Enter/Space on a focused card opens edit.
  ctx.container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target as HTMLElement | null;
    const card = target?.closest<HTMLElement>('.card');
    if (card?.dataset.cardId) {
      e.preventDefault();
      void handleEditCard(ctx, card.dataset.cardId);
    }
  });
}
