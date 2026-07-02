// Task card component renderer.
// Produces a DOM element for a single task, matching classes in styles/main.css.

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr, done) {
  if (!dateStr || done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return d < today;
}

// Render a single task card.
// task: row from Supabase { id, title, description, priority, due_date, done }
// handlers: { onToggle(id, done), onEdit(task), onDelete(id) }
export function renderTaskCard(task, handlers = {}) {
  const { onToggle, onEdit, onDelete } = handlers;

  const item = document.createElement('div');
  item.className = 'task-item' + (task.done ? ' done' : '');
  item.dataset.id = task.id;

  // Checkbox
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'task-check';
  check.checked = !!task.done;
  check.setAttribute('aria-label', task.done ? 'Mark as active' : 'Mark as done');
  check.addEventListener('change', () => {
    if (typeof onToggle === 'function') onToggle(task.id, check.checked);
  });

  // Main content
  const main = document.createElement('div');
  main.className = 'task-main';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title || '(Untitled task)';
  main.appendChild(title);

  if (task.description) {
    const desc = document.createElement('div');
    desc.className = 'task-desc';
    desc.textContent = task.description;
    main.appendChild(desc);
  }

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const prio = document.createElement('span');
  const prioKey = ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium';
  prio.className = 'badge badge-' + prioKey;
  prio.textContent = PRIORITY_LABEL[prioKey];
  meta.appendChild(prio);

  if (task.due_date) {
    const date = document.createElement('span');
    const overdue = isOverdue(task.due_date, task.done);
    date.className = 'badge badge-date' + (overdue ? ' overdue' : '');
    date.textContent = (overdue ? 'Overdue \u00b7 ' : 'Due ') + formatDate(task.due_date);
    meta.appendChild(date);
  }

  if (meta.childElementCount > 0) main.appendChild(meta);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn btn-ghost btn-sm';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => {
    if (typeof onEdit === 'function') onEdit(task);
  });
  actions.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'btn btn-danger btn-sm';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => {
    if (typeof onDelete === 'function') onDelete(task.id);
  });
  actions.appendChild(delBtn);

  item.appendChild(check);
  item.appendChild(main);
  item.appendChild(actions);

  return item;
}

// Render an empty-state block. Returns a DOM element.
export function renderEmptyState(message = 'No tasks yet', emoji = '\uD83D\uDCDD') {
  const wrap = document.createElement('div');
  wrap.className = 'empty-state';
  const em = document.createElement('span');
  em.className = 'emoji';
  em.textContent = emoji;
  const p = document.createElement('p');
  p.textContent = message;
  wrap.appendChild(em);
  wrap.appendChild(p);
  return wrap;
}
