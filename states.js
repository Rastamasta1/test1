// Reusable UI state components for the feedback wall app.
// Provides loading, empty, and error placeholders that match the
// .empty-state styles in styles/layout.css. Other components (e.g.
// feedbackList.js) can reuse these instead of building markup inline.
//
// Usage:
//   import { createLoadingState, createEmptyState, createErrorState } from './states.js';
//   container.appendChild(createLoadingState('Loading feedback...'));

// Build a generic state element with an optional icon and message.
function createStateElement(message, { className = 'empty-state', icon = '' } = {}) {
  const el = document.createElement('div');
  el.className = className;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');

  if (icon) {
    const iconEl = document.createElement('span');
    iconEl.className = 'state-icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = icon;
    el.appendChild(iconEl);
  }

  const text = document.createElement('p');
  text.className = 'state-message';
  text.textContent = message || '';
  el.appendChild(text);

  return el;
}

// Loading placeholder shown while data is being fetched.
export function createLoadingState(message = 'Loading feedback...') {
  const el = createStateElement(message, {
    className: 'empty-state state-loading',
    icon: '\u23F3', // ⏳
  });
  return el;
}

// Empty placeholder shown when there is no feedback yet.
export function createEmptyState(message = 'No feedback yet. Be the first to leave some!') {
  return createStateElement(message, {
    className: 'empty-state state-empty',
    icon: '\u2728', // ✨
  });
}

// Error placeholder shown when data fails to load.
export function createErrorState(message = 'Could not load feedback. Please try again.') {
  return createStateElement(message, {
    className: 'empty-state state-error',
    icon: '\u26A0', // ⚠
  });
}
