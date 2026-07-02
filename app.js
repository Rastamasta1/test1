// Main UI controller. Wires the task form, priority filter, tab views, and the
// mark-done / edit / delete actions to the data services. View + filter state
// is centralized in viewState.js so tabs, filter chips, and lists stay in sync
// and survive reloads.

import { renderTaskForm } from './taskForm.js';
import { renderPriorityFilter } from './priorityFilter.js';
import { createActiveTaskList } from './activeTaskList.js';
import { createCompletedTaskList } from './completedTaskList.js';
import { createTask, updateTask, toggleDone, deleteTask } from './taskService.js';
import { createViewState } from './viewState.js';

const formMount = document.getElementById('form-mount');
const filterMount = document.getElementById('filter-mount');
const activeContainer = document.getElementById('active-list');
const completedContainer = document.getElementById('completed-list');
const tabsEl = document.getElementById('tabs');

// ---- Centralized view + filter state ----
const viewState = createViewState();

// ---- Task form (create + edit) ----
const form = renderTaskForm({
  onSubmit: async (values, editingId) => {
    if (editingId) {
      await updateTask(editingId, values);
    } else {
      await createTask(values);
    }
    await refreshAll();
  }
});
formMount.appendChild(form);

// ---- Shared action handlers wired to both list views ----
const handlers = {
  onToggle: async (id, done) => {
    try {
      await toggleDone(id, done);
      await refreshAll();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      await refreshAll();
    }
  },
  onEdit: (task) => {
    form.setFormForEdit(task);
  },
  onDelete: async (id) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(id);
      if (form.dataset.editingId === id) form.resetForm();
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }
};

// ---- List views ----
const activeList = createActiveTaskList({ container: activeContainer, handlers });
const completedList = createCompletedTaskList({ container: completedContainer, handlers });

// ---- Priority filter (initialized from persisted state) ----
const filter = renderPriorityFilter({
  active: viewState.getPriority(),
  onChange: (priority) => viewState.setPriority(priority)
});
filterMount.appendChild(filter);

// ---- Tab switching drives state, not the DOM directly ----
tabsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  viewState.setView(btn.dataset.view);
});

// Reflect the current view state onto the tab buttons + list visibility.
function applyView(view) {
  tabsEl.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.view === view);
  });
  const showActive = view === 'active';
  activeContainer.classList.toggle('hidden', !showActive);
  completedContainer.classList.toggle('hidden', showActive);
}

// React to any state change: update view chrome + push filter to lists + chips.
let lastPriority = viewState.getPriority();
viewState.subscribe(({ view, priority }) => {
  applyView(view);
  if (filter.getActive() !== priority) filter.setActive(priority);
  if (priority !== lastPriority) {
    lastPriority = priority;
    activeList.setPriority(priority);
    completedList.setPriority(priority);
  }
});

// Refresh both list views so counts/state stay consistent across tabs.
async function refreshAll() {
  await Promise.all([activeList.refresh(), completedList.refresh()]);
}

// ---- Initial render from persisted state ----
applyView(viewState.getView());
filter.setActive(viewState.getPriority());
activeList.setPriority(viewState.getPriority());
completedList.setPriority(viewState.getPriority());
refreshAll();
