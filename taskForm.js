// Task creation/edit form component.
// Renders a form card matching styles/main.css and wires submit + reset.

// options:
//   onSubmit(values, editingId): async handler; values = { title, description, priority, due_date }
//   editingId is null in create mode, or the task id in edit mode.
export function renderTaskForm({ onSubmit } = {}) {
  const card = document.createElement('form');
  card.className = 'card task-form';
  card.noValidate = true;

  // Track current editing id via dataset.
  card.dataset.editingId = '';

  card.innerHTML = `
    <h2 class="form-title">Add a task</h2>
    <div class="form-grid mt-4">
      <div class="field full">
        <label for="tf-title">Title</label>
        <input id="tf-title" name="title" type="text" placeholder="What needs doing?" required />
      </div>
      <div class="field full">
        <label for="tf-desc">Description</label>
        <textarea id="tf-desc" name="description" placeholder="Add details (optional)"></textarea>
      </div>
      <div class="field">
        <label for="tf-priority">Priority</label>
        <select id="tf-priority" name="priority">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div class="field">
        <label for="tf-due">Due date</label>
        <input id="tf-due" name="due_date" type="date" />
      </div>
    </div>
    <div class="toolbar mt-4" style="justify-content:flex-end;margin-bottom:0;">
      <button type="button" class="btn btn-ghost tf-cancel hidden">Cancel</button>
      <button type="submit" class="btn btn-primary tf-submit">Add task</button>
    </div>
  `;

  const titleInput = card.querySelector('#tf-title');
  const descInput = card.querySelector('#tf-desc');
  const prioInput = card.querySelector('#tf-priority');
  const dueInput = card.querySelector('#tf-due');
  const submitBtn = card.querySelector('.tf-submit');
  const cancelBtn = card.querySelector('.tf-cancel');
  const formTitle = card.querySelector('.form-title');

  function resetForm() {
    card.dataset.editingId = '';
    titleInput.value = '';
    descInput.value = '';
    prioInput.value = 'medium';
    dueInput.value = '';
    formTitle.textContent = 'Add a task';
    submitBtn.textContent = 'Add task';
    cancelBtn.classList.add('hidden');
  }

  // Populate the form for editing an existing task.
  function setFormForEdit(task) {
    card.dataset.editingId = task.id || '';
    titleInput.value = task.title || '';
    descInput.value = task.description || '';
    prioInput.value = ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium';
    dueInput.value = task.due_date || '';
    formTitle.textContent = 'Edit task';
    submitBtn.textContent = 'Save changes';
    cancelBtn.classList.remove('hidden');
    titleInput.focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cancelBtn.addEventListener('click', () => resetForm());

  card.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    const values = {
      title,
      description: descInput.value.trim(),
      priority: prioInput.value,
      due_date: dueInput.value || null
    };

    const editingId = card.dataset.editingId || null;

    submitBtn.disabled = true;
    const prevLabel = submitBtn.textContent;
    submitBtn.textContent = editingId ? 'Saving\u2026' : 'Adding\u2026';

    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(values, editingId);
      }
      resetForm();
    } catch (err) {
      console.error('Task form submit failed:', err);
      submitBtn.textContent = prevLabel;
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Expose helpers on the element for the controller to use.
  card.resetForm = resetForm;
  card.setFormForEdit = setFormForEdit;

  return card;
}
