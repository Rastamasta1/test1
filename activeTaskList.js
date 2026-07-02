// Active task list view.
// Renders not-done tasks sorted by due date (soonest first) into a container.
// Reuses taskQueries + taskCard components.

import { getActiveByDueDate } from './taskQueries.js';
import { renderTaskCard, renderEmptyState } from './taskCard.js';

// Create an active task list view controller bound to a container element.
// options:
//   container: DOM element to render into (required)
//   handlers: { onToggle(id, done), onEdit(task), onDelete(id) }
export function createActiveTaskList({ container, handlers = {} } = {}) {
  if (!container) throw new Error('createActiveTaskList: container is required');

  let currentPriority = null;
  let lastTasks = [];

  // Render the given tasks array into the container.
  function paint(tasks) {
    lastTasks = tasks;
    container.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      const msg = currentPriority
        ? 'No active ' + currentPriority + '-priority tasks.'
        : 'No active tasks. Add one above to get started!';
      container.appendChild(renderEmptyState(msg, '\u2705'));
      return;
    }

    const list = document.createElement('div');
    list.className = 'task-list';
    tasks.forEach((task) => {
      list.appendChild(renderTaskCard(task, handlers));
    });
    container.appendChild(list);
  }

  // Show a lightweight loading placeholder.
  function paintLoading() {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    const p = document.createElement('p');
    p.className = 'text-muted';
    p.textContent = 'Loading tasks\u2026';
    wrap.appendChild(p);
    container.appendChild(wrap);
  }

  // Fetch active tasks from Supabase and render.
  async function refresh() {
    paintLoading();
    try {
      const tasks = await getActiveByDueDate({ priority: currentPriority });
      paint(tasks);
    } catch (err) {
      console.error('Failed to load active tasks:', err);
      container.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'empty-state';
      const em = document.createElement('span');
      em.className = 'emoji';
      em.textContent = '\u26A0\uFE0F';
      const p = document.createElement('p');
      p.textContent = 'Could not load tasks. Please try again.';
      wrap.appendChild(em);
      wrap.appendChild(p);
      container.appendChild(wrap);
    }
  }

  // Set the active priority filter (null = all) and refresh.
  function setPriority(priority) {
    currentPriority = priority || null;
    return refresh();
  }

  function getPriority() {
    return currentPriority;
  }

  return {
    container,
    refresh,
    setPriority,
    getPriority,
    render: paint,
    getTasks: () => lastTasks
  };
}
