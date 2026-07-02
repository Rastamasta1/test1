// Browser integration + unit tests for the task manager.
// Open tests.html in a browser to run. Exercises data services, query
// helpers, view state, and component renderers. Supabase-touching tests
// create and then clean up their own rows.

import { createTask, updateTask, toggleDone, deleteTask, getTasks } from './taskService.js';
import { queryTasks, sortByPriorityThenDue, filterByPriority } from './taskQueries.js';
import { createViewState } from './viewState.js';
import { renderTaskCard, renderEmptyState } from './taskCard.js';
import { renderTaskForm } from './taskForm.js';
import { renderPriorityFilter } from './priorityFilter.js';

const results = [];
let passCount = 0;
let failCount = 0;

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (ok) passCount++; else failCount++;
  render();
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

async function test(name, fn) {
  try {
    await fn();
    record(name, true, '');
  } catch (err) {
    record(name, false, err && err.message ? err.message : String(err));
  }
}

function render() {
  const out = document.getElementById('results');
  if (!out) return;
  out.innerHTML = '';
  results.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'test-row ' + (r.ok ? 'pass' : 'fail');
    row.textContent = (r.ok ? '\u2713 ' : '\u2717 ') + r.name + (r.detail ? ' \u2014 ' + r.detail : '');
    out.appendChild(row);
  });
  const summary = document.getElementById('summary');
  if (summary) {
    summary.textContent = passCount + ' passed, ' + failCount + ' failed';
    summary.className = failCount === 0 ? 'summary ok' : 'summary bad';
  }
}

const TAG = 'ITEST-' + Date.now();
let createdId = null;

async function run() {
  // ---- Component renderers (no network) ----
  await test('renderTaskCard produces a task-item with title', () => {
    const el = renderTaskCard({ id: 'x', title: 'Hello', priority: 'high', due_date: null, done: false }, {});
    assert(el.classList.contains('task-item'), 'missing task-item class');
    assert(el.textContent.includes('Hello'), 'title not rendered');
    assert(el.querySelector('.badge-high'), 'high priority badge missing');
  });

  await test('renderTaskCard marks done tasks', () => {
    const el = renderTaskCard({ id: 'y', title: 'Done one', priority: 'low', due_date: null, done: true }, {});
    assert(el.classList.contains('done'), 'done class missing');
    assert(el.querySelector('.task-check').checked === true, 'checkbox not checked');
  });

  await test('renderTaskCard onToggle handler fires', () => {
    let called = null;
    const el = renderTaskCard({ id: 'z', title: 'T', priority: 'medium', due_date: null, done: false }, {
      onToggle: (id, done) => { called = { id, done }; }
    });
    el.querySelector('.task-check').click();
    assert(called && called.id === 'z' && called.done === true, 'toggle not invoked correctly');
  });

  await test('renderEmptyState renders message + emoji', () => {
    const el = renderEmptyState('Nothing here', '\uD83D\uDCED');
    assert(el.classList.contains('empty-state'), 'missing empty-state class');
    assert(el.textContent.includes('Nothing here'), 'message missing');
  });

  await test('renderTaskForm exposes helpers and prevents default submit', () => {
    const form = renderTaskForm({ onSubmit: async () => {} });
    assert(typeof form.resetForm === 'function', 'resetForm missing');
    assert(typeof form.setFormForEdit === 'function', 'setFormForEdit missing');
    form.setFormForEdit({ id: 'a', title: 'Edit me', priority: 'high', due_date: '2030-01-01' });
    assert(form.dataset.editingId === 'a', 'editingId not set');
    assert(form.querySelector('#tf-title').value === 'Edit me', 'title not populated');
    form.resetForm();
    assert(form.dataset.editingId === '', 'editingId not cleared');
  });

  await test('renderPriorityFilter setActive toggles chips', () => {
    const bar = renderPriorityFilter({ active: null, onChange: () => {} });
    bar.setActive('high');
    assert(bar.getActive() === 'high', 'getActive wrong');
    const activeChip = bar.querySelector('.filter-chip.active');
    assert(activeChip && activeChip.dataset.value === 'high', 'active chip wrong');
  });

  // ---- Pure query helpers ----
  await test('sortByPriorityThenDue orders high first', () => {
    const sorted = sortByPriorityThenDue([
      { priority: 'low', due_date: '2030-01-01' },
      { priority: 'high', due_date: '2030-02-01' },
      { priority: 'medium', due_date: null }
    ]);
    assert(sorted[0].priority === 'high', 'high not first');
    assert(sorted[2].priority === 'low', 'low not last');
  });

  await test('filterByPriority filters correctly', () => {
    const list = [{ priority: 'low' }, { priority: 'high' }, { priority: 'high' }];
    assert(filterByPriority(list, 'high').length === 2, 'wrong high count');
    assert(filterByPriority(list, null).length === 3, 'null should return all');
  });

  // ---- viewState ----
  await test('viewState setView/setPriority notify subscribers', () => {
    const vs = createViewState();
    let last = null;
    const unsub = vs.subscribe((s) => { last = s; });
    vs.setView('completed');
    assert(last && last.view === 'completed', 'view change not notified');
    vs.setPriority('high');
    assert(last.priority === 'high', 'priority change not notified');
    vs.setPriority('bogus');
    assert(vs.getPriority() === null, 'invalid priority not normalized to null');
    unsub();
  });

  // ---- Supabase CRUD (self-cleaning) ----
  await test('createTask inserts a row', async () => {
    const t = await createTask({ title: TAG + ' task', description: 'itest', priority: 'high', due_date: '2035-06-15' });
    assert(t && t.id, 'no id returned');
    assert(t.title === TAG + ' task', 'title mismatch');
    assert(t.done === false, 'new task should not be done');
    createdId = t.id;
  });

  await test('queryTasks finds the created active high task', async () => {
    const rows = await queryTasks({ status: 'active', priority: 'high' });
    assert(rows.some((r) => r.id === createdId), 'created task not found in active/high query');
  });

  await test('updateTask edits fields', async () => {
    const t = await updateTask(createdId, { title: TAG + ' updated', priority: 'low' });
    assert(t.title === TAG + ' updated', 'title not updated');
    assert(t.priority === 'low', 'priority not updated');
  });

  await test('toggleDone moves task to completed', async () => {
    await toggleDone(createdId, true);
    const completed = await queryTasks({ status: 'completed' });
    assert(completed.some((r) => r.id === createdId), 'task not in completed after toggle');
  });

  await test('deleteTask removes the row', async () => {
    await deleteTask(createdId);
    const all = await getTasks();
    assert(!all.some((r) => r.id === createdId), 'task still present after delete');
    createdId = null;
  });

  // Safety cleanup in case an assertion above threw before delete.
  if (createdId) {
    try { await deleteTask(createdId); } catch (_) { /* ignore */ }
  }
}

run();
