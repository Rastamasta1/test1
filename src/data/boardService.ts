// Core board services: CRUD for columns and cards.
// Operates on BoardState immutably and persists via the persistence layer.

import type { BoardState, Column, Card, UUID } from '../types/board';
import { getColumnCards, getOrderedColumns } from '../types/board';
import { saveBoardState } from './persistence';

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Touch the board's updatedAt timestamp. */
function touchBoard(state: BoardState): BoardState {
  return { ...state, board: { ...state.board, updatedAt: now() } };
}

/** Re-pack column positions to be contiguous 0..n-1 preserving order. */
function normalizeColumnPositions(columns: Column[]): Column[] {
  return [...columns]
    .sort((a, b) => a.position - b.position)
    .map((col, i) => (col.position === i ? col : { ...col, position: i }));
}

/** Re-pack card positions within a single column. */
function normalizeCardPositions(cards: Card[], columnId: UUID): Card[] {
  const inCol = cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.position - b.position);
  const posMap = new Map<UUID, number>();
  inCol.forEach((c, i) => posMap.set(c.id, i));
  return cards.map((c) =>
    posMap.has(c.id) && c.position !== posMap.get(c.id)
      ? { ...c, position: posMap.get(c.id)! }
      : c
  );
}

// ---------------------------------------------------------------------------
// Column CRUD
// ---------------------------------------------------------------------------

export interface AddColumnInput {
  title: string;
  position?: number;
  wipLimit?: number | null;
}

export function addColumn(state: BoardState, input: AddColumnInput): BoardState {
  const ordered = getOrderedColumns(state);
  const position =
    input.position == null
      ? ordered.length
      : Math.max(0, Math.min(input.position, ordered.length));

  const newColumn: Column = {
    id: uuid(),
    boardId: state.board.id,
    title: input.title,
    position,
    wipLimit: input.wipLimit ?? null,
  };

  // Shift existing columns at or after the insert position.
  const shifted = state.columns.map((c) =>
    c.position >= position ? { ...c, position: c.position + 1 } : c
  );

  return touchBoard({
    ...state,
    columns: normalizeColumnPositions([...shifted, newColumn]),
  });
}

export interface UpdateColumnInput {
  title?: string;
  wipLimit?: number | null;
}

export function updateColumn(
  state: BoardState,
  columnId: UUID,
  input: UpdateColumnInput
): BoardState {
  const columns = state.columns.map((c) =>
    c.id === columnId
      ? {
          ...c,
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.wipLimit !== undefined ? { wipLimit: input.wipLimit } : {}),
        }
      : c
  );
  return touchBoard({ ...state, columns });
}

/** Delete a column and all its cards. */
export function deleteColumn(state: BoardState, columnId: UUID): BoardState {
  const columns = normalizeColumnPositions(
    state.columns.filter((c) => c.id !== columnId)
  );
  const cards = state.cards.filter((c) => c.columnId !== columnId);
  return touchBoard({ ...state, columns, cards });
}

/** Move a column to a new index. */
export function moveColumn(
  state: BoardState,
  columnId: UUID,
  toIndex: number
): BoardState {
  const ordered = getOrderedColumns(state);
  const from = ordered.findIndex((c) => c.id === columnId);
  if (from === -1) return state;
  const target = Math.max(0, Math.min(toIndex, ordered.length - 1));
  const [moved] = ordered.splice(from, 1);
  ordered.splice(target, 0, moved);
  const columns = ordered.map((c, i) => ({ ...c, position: i }));
  return touchBoard({ ...state, columns });
}

// ---------------------------------------------------------------------------
// Card CRUD
// ---------------------------------------------------------------------------

export interface AddCardInput {
  columnId: UUID;
  title: string;
  description?: string;
  position?: number;
  assigneeIds?: UUID[];
  labels?: string[];
  dueDate?: string | null;
}

export function addCard(state: BoardState, input: AddCardInput): BoardState {
  const colCards = getColumnCards(state, input.columnId);
  const position =
    input.position == null
      ? colCards.length
      : Math.max(0, Math.min(input.position, colCards.length));
  const ts = now();

  const newCard: Card = {
    id: uuid(),
    columnId: input.columnId,
    title: input.title,
    description: input.description,
    position,
    assigneeIds: input.assigneeIds,
    labels: input.labels,
    dueDate: input.dueDate ?? null,
    createdAt: ts,
    updatedAt: ts,
  };

  const shifted = state.cards.map((c) =>
    c.columnId === input.columnId && c.position >= position
      ? { ...c, position: c.position + 1 }
      : c
  );

  return touchBoard({
    ...state,
    cards: normalizeCardPositions([...shifted, newCard], input.columnId),
  });
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  assigneeIds?: UUID[];
  labels?: string[];
  dueDate?: string | null;
}

export function updateCard(
  state: BoardState,
  cardId: UUID,
  input: UpdateCardInput
): BoardState {
  const cards = state.cards.map((c) =>
    c.id === cardId ? { ...c, ...input, updatedAt: now() } : c
  );
  return touchBoard({ ...state, cards });
}

export function deleteCard(state: BoardState, cardId: UUID): BoardState {
  const target = state.cards.find((c) => c.id === cardId);
  if (!target) return state;
  const remaining = state.cards.filter((c) => c.id !== cardId);
  const cards = normalizeCardPositions(remaining, target.columnId);
  return touchBoard({ ...state, cards });
}

/**
 * Move a card to a target column at a target index.
 * Handles both intra-column reordering and cross-column moves.
 */
export function moveCard(
  state: BoardState,
  cardId: UUID,
  toColumnId: UUID,
  toIndex: number
): BoardState {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return state;

  const fromColumnId = card.columnId;

  // Remove from current column ordering.
  let cards = state.cards.filter((c) => c.id !== cardId);

  // Determine clamped insert index in target column.
  const targetCards = cards
    .filter((c) => c.columnId === toColumnId)
    .sort((a, b) => a.position - b.position);
  const insertAt = Math.max(0, Math.min(toIndex, targetCards.length));

  // Shift target column cards at or after insert position.
  cards = cards.map((c) =>
    c.columnId === toColumnId && c.position >= insertAt
      ? { ...c, position: c.position + 1 }
      : c
  );

  const movedCard: Card = {
    ...card,
    columnId: toColumnId,
    position: insertAt,
    updatedAt: now(),
  };
  cards = [...cards, movedCard];

  // Normalize both affected columns.
  cards = normalizeCardPositions(cards, toColumnId);
  if (fromColumnId !== toColumnId) {
    cards = normalizeCardPositions(cards, fromColumnId);
  }

  return touchBoard({ ...state, cards });
}

// ---------------------------------------------------------------------------
// Persisting wrappers
// ---------------------------------------------------------------------------

/**
 * Apply a service mutation and persist the result.
 * Returns the new state regardless of persistence success.
 */
export function commit(state: BoardState): BoardState {
  saveBoardState(state);
  return state;
}
