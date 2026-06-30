// Renders the board state into the DOM.
// Reads BoardState via selectors and builds columns + cards using the
// class names defined in styles/base.css, styles/theme.css and styles/modal.css,
// so hover states (.card:hover, .column:hover, .icon-btn:hover, .column__add-card:hover)
// and the [data-action] buttons that interactions.ts delegates to apply for free.

import type { BoardState, Column, Card } from '../types/board';
import { getOrderedColumns, getColumnCards } from '../types/board';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  }
  return node;
}

/** Build an icon-style action button surfaced for interactions delegation. */
function actionBtn(action: string, label: string, text: string): HTMLButtonElement {
  const btn = el('button', 'icon-btn', {
    type: 'button',
    'data-action': action,
    'aria-label': label,
    title: label,
  });
  btn.textContent = text;
  return btn;
}

/** Build the label chips for a card. */
function renderLabels(card: Card): HTMLElement | null {
  if (!card.labels || card.labels.length === 0) return null;
  const wrap = el('div', 'card__labels');
  for (const label of card.labels) {
    const chip = el('span', 'label');
    chip.textContent = label;
    wrap.appendChild(chip);
  }
  return wrap;
}

/** Build a single card element. */
export function renderCard(card: Card): HTMLElement {
  const node = el('article', 'card', {
    role: 'listitem',
    tabindex: '0',
    'data-card-id': card.id,
    'data-column-id': card.columnId,
  });

  const labels = renderLabels(card);
  if (labels) node.appendChild(labels);

  const title = el('div', 'card__title');
  title.textContent = card.title;
  node.appendChild(title);

  if (card.description) {
    const desc = el('div', 'card__desc');
    desc.textContent = card.description;
    node.appendChild(desc);
  }

  // Per-card actions (edit / delete) wired via interactions delegation.
  const actions = el('div', 'card__actions');
  actions.appendChild(actionBtn('edit-card', 'Edit card', 'Edit'));
  actions.appendChild(actionBtn('delete-card', 'Delete card', '\u2715'));
  node.appendChild(actions);

  return node;
}

/** Build a single column element including its cards. */
export function renderColumn(state: BoardState, column: Column): HTMLElement {
  const cards = getColumnCards(state, column.id);

  const colEl = el('section', 'column', {
    role: 'listitem',
    'data-column-id': column.id,
  });

  // Header with title, count badge and column actions.
  const header = el('header', 'column__header');
  const titleEl = el('span', 'column__title');
  titleEl.textContent = column.title;
  header.appendChild(titleEl);

  const over =
    column.wipLimit != null && column.wipLimit > 0 && cards.length > column.wipLimit;
  const count = el('span', over ? 'column__count column__count--over' : 'column__count');
  count.textContent =
    column.wipLimit != null && column.wipLimit > 0
      ? `${cards.length}/${column.wipLimit}`
      : String(cards.length);
  header.appendChild(count);

  const colActions = el('div', 'column__actions');
  colActions.appendChild(actionBtn('rename-column', 'Edit column', '\u270E'));
  colActions.appendChild(actionBtn('delete-column', 'Delete column', '\u2715'));
  header.appendChild(colActions);

  colEl.appendChild(header);

  // Cards container.
  const cardsEl = el('div', 'column__cards', {
    role: 'list',
    'aria-label': `${column.title} cards`,
  });
  for (const card of cards) {
    cardsEl.appendChild(renderCard(card));
  }
  colEl.appendChild(cardsEl);

  // Add-card affordance at the foot of the column.
  const addCard = el('button', 'column__add-card', {
    type: 'button',
    'data-action': 'add-card',
  });
  addCard.textContent = '+ Add a card';
  colEl.appendChild(addCard);

  return colEl;
}

/**
 * Render the full board into the given container (the #board element).
 * Clears and rebuilds the DOM from current state. Idempotent.
 */
export function renderBoard(state: BoardState, container: HTMLElement): void {
  container.replaceChildren();
  const columns = getOrderedColumns(state);
  for (const column of columns) {
    container.appendChild(renderColumn(state, column));
  }

  // Keep the document/board title in sync if present.
  const titleEl = document.getElementById('board-title');
  if (titleEl) titleEl.textContent = state.board.title;
}
