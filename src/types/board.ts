// Data model & board state types

export type UUID = string;
export type ISODateTime = string;

export interface User {
  id: UUID;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Board {
  id: UUID;
  title: string;
  description?: string;
  ownerId?: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Column {
  id: UUID;
  boardId: UUID;
  title: string;
  /** Ordering of column within the board, 0-based. */
  position: number;
  /** Optional work-in-progress limit. */
  wipLimit?: number | null;
}

export interface Card {
  id: UUID;
  columnId: UUID;
  title: string;
  description?: string;
  /** Ordering of card within its column, 0-based. */
  position: number;
  assigneeIds?: UUID[];
  labels?: string[];
  dueDate?: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Normalized full board state. */
export interface BoardState {
  board: Board;
  columns: Column[];
  cards: Card[];
  users?: User[];
}

/** Convenience selectors / helpers. */
export function getColumnCards(state: BoardState, columnId: UUID): Card[] {
  return state.cards
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.position - b.position);
}

export function getOrderedColumns(state: BoardState): Column[] {
  return [...state.columns].sort((a, b) => a.position - b.position);
}
