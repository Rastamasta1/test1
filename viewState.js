// Central view + filter state management for the task manager.
// Holds which tab is active ('active'|'completed') and the current
// priority filter (null|'low'|'medium'|'high'), persists to localStorage,
// and notifies subscribers on change.

const STORAGE_KEY = 'taskmgr:viewState';
const VALID_VIEWS = ['active', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function loadInitial() {
  const base = { view: 'active', priority: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      view: VALID_VIEWS.includes(saved.view) ? saved.view : 'active',
      priority: VALID_PRIORITIES.includes(saved.priority) ? saved.priority : null
    };
  } catch (_) {
    return base;
  }
}

export function createViewState() {
  let state = loadInitial();
  const subscribers = new Set();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      /* ignore storage failures (private mode, quota) */
    }
  }

  function notify() {
    subscribers.forEach((fn) => {
      try {
        fn({ ...state });
      } catch (err) {
        console.error('viewState subscriber error:', err);
      }
    });
  }

  function getState() {
    return { ...state };
  }

  function getView() {
    return state.view;
  }

  function getPriority() {
    return state.priority;
  }

  // Set the active view/tab. Returns true if it changed.
  function setView(view) {
    const next = VALID_VIEWS.includes(view) ? view : 'active';
    if (next === state.view) return false;
    state = { ...state, view: next };
    persist();
    notify();
    return true;
  }

  // Set the priority filter (null clears it). Returns true if it changed.
  function setPriority(priority) {
    const next = VALID_PRIORITIES.includes(priority) ? priority : null;
    if (next === state.priority) return false;
    state = { ...state, priority: next };
    persist();
    notify();
    return true;
  }

  // Subscribe to state changes. Returns an unsubscribe function.
  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  return {
    getState,
    getView,
    getPriority,
    setView,
    setPriority,
    subscribe
  };
}
