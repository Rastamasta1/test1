// localStorage persistence layer for the kanban board.
// Provides load / save / clear / seed operations over BoardState.

import type { BoardState, Board, Column, Card } from '../types/board';

const STORAGE_KEY = 'kanban.board-state.v1';

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122-ish v4 generator.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Basic structural validation of a parsed object. */
function isValidBoardState(value: unknown): value is BoardState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<BoardState>;
  return (
    !!v.board &&
    typeof v.board === 'object' &&
    Array.isArray(v.columns) &&
    Array.isArray(v.cards)
  );
}

/**
 * Load board state from localStorage.
 * Returns null if nothing stored, storage unavailable, or data is invalid/corrupt.
 */
export function loadBoardState(): BoardState | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidBoardState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist the given board state to localStorage.
 * Returns true on success, false if storage unavailable or quota exceeded.
 */
export function saveBoardState(state: BoardState): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Remove the persisted board state. */
export function clearBoardState(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

/** Build a fresh default board with sample columns and cards. */
export function createSeedState(): BoardState {
  const ts = now();
  const boardId = uuid();
  const todo: Column = { id: uuid(), boardId, title: 'To Do', position: 0, wipLimit: null };
  const doing: Column = { id: uuid(), boardId, title: 'In Progress', position: 1, wipLimit: 3 };
  const done: Column = { id: uuid(), boardId, title: 'Done', position: 2, wipLimit: null };

  const board: Board = {
    id: boardId,
    title: 'My First Board',
    description: 'A starter kanban board.',
    createdAt: ts,
    updatedAt: ts,
  };

  const cards: Card[] = [
    {
      id: uuid(),
      columnId: todo.id,
      title: 'Welcome to your board',
      description: 'Drag cards between columns to get started.',
      position: 0,
      labels: ['getting-started'],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uuid(),
      columnId: todo.id,
      title: 'Add a new card',
      position: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uuid(),
      columnId: doing.id,
      title: 'Try editing this card',
      position: 0,
      labels: ['demo'],
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: uuid(),
      columnId: done.id,
      title: 'Set up persistence',
      position: 0,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  return { board, columns: [todo, doing, done], cards, users: [] };
}

/**
 * Ensure a board state exists in storage. If none is present (or it is invalid),
 * a seed state is created and persisted. Returns the resulting state.
 * Pass `force: true` to overwrite any existing state with a fresh seed.
 */
export function seedBoardState(force = false): BoardState {
  if (!force) {
    const existing = loadBoardState();
    if (existing) return existing;
  }
  const seed = createSeedState();
  saveBoardState(seed);
  return seed;
}

export const PERSISTENCE_STORAGE_KEY = STORAGE_KEY;
