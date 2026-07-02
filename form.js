// Add / Edit recipe page logic for the recipe collection app (add.html).
// If a ?id= param is present, loads that recipe and switches to edit mode.
// Builds the form (including dynamic ingredient and step lists), validates,
// and on submit calls create() or update() then redirects to the detail page.
// Mounts into #form-mount.
import { qs, el, on, clearChildren } from './domHelpers.js';
import { getById, create, update } from './recipeService.js';
import { CATEGORIES } from './categories.js';
import { createIngredientList } from './ingredientRow.js';
import { createInstructionList } from './instructionStep.js';

let ingredientList = null;
let instructionList = null;

// Read the recipe id from the current URL query string.
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Build the category <select>.
function buildCategorySelect(selected) {
  const options = [el('option', { value: '', text: 'Select a category\u2026', disabled: true, selected: !selected })];
  for (const c of CATEGORIES) {
    options.push(el('option', { value: c.value, text: `${c.emoji} ${c.label}`, selected: selected === c.value }));
  }
  return el('select', { id: 'field-category', name: 'category', required: true }, options);
}

// Render a top-of-form error message.
function showError(mountEl, message) {
  let box = qs('#form-error', mountEl);
  if (!box) {
    box = el('div', { id: 'form-error', class: 'error-state', role: 'alert' });
    mountEl.insertBefore(box, mountEl.firstChild);
  }
  box.textContent = message;
}

function clearError(mountEl) {
  const box = qs('#form-error', mountEl);
  if (box) box.remove();
}

// Build the whole form for a given recipe (null for create mode).
function buildForm(mountEl, recipe) {
  clearChildren(mountEl);

  const r = recipe || {};

  const titleField = el('div', { class: 'field' }, [
    el('label', { for: 'field-title', text: 'Title' }),
    el('input', { id: 'field-title', name: 'title', type: 'text', required: true,
      placeholder: 'e.g. Fluffy Pancakes', value: r.title || '' })
  ]);

  const categoryField = el('div', { class: 'field' }, [
    el('label', { for: 'field-category', text: 'Category' }),
    buildCategorySelect(r.category)
  ]);

  const cookField = el('div', { class: 'field' }, [
    el('label', { for: 'field-cook', text: 'Cook time (minutes)' }),
    el('input', { id: 'field-cook', name: 'cook_time', type: 'number', min: '0', step: '1',
      placeholder: '30', value: r.cook_time != null ? String(r.cook_time) : '' })
  ]);

  const servingsField = el('div', { class: 'field' }, [
    el('label', { for: 'field-servings', text: 'Servings' }),
    el('input', { id: 'field-servings', name: 'servings', type: 'number', min: '1', step: '1',
      placeholder: '4', value: r.servings != null ? String(r.servings) : '' })
  ]);

  const numberRow = el('div', { class: 'field-row' }, [cookField, servingsField]);

  const imageField = el('div', { class: 'field' }, [
    el('label', { for: 'field-image', text: 'Image URL (optional)' }),
    el('input', { id: 'field-image', name: 'image_url', type: 'url',
      placeholder: 'https://\u2026', value: r.image_url || '' })
  ]);

  ingredientList = createIngredientList(Array.isArray(r.ingredients) ? r.ingredients : []);
  const ingredientField = el('div', { class: 'field' }, [
    el('label', { text: 'Ingredients' }),
    ingredientList.element
  ]);

  instructionList = createInstructionList(Array.isArray(r.steps) ? r.steps : []);
  const stepsField = el('div', { class: 'field' }, [
    el('label', { text: 'Instructions' }),
    instructionList.element
  ]);

  const isEdit = !!r.id;
  const submitBtn = el('button', { type: 'submit', class: 'btn btn-primary btn-block',
    text: isEdit ? '\uD83D\uDCBE Save Changes' : '\u2795 Create Recipe' });

  const form = el('form', { class: 'card-form', novalidate: true }, [
    titleField,
    categoryField,
    numberRow,
    imageField,
    ingredientField,
    stepsField,
    submitBtn
  ]);

  on(form, 'submit', (e) => handleSubmit(e, mountEl, r.id, submitBtn));

  mountEl.appendChild(form);

  const heading = qs('#form-title');
  if (heading) heading.textContent = isEdit ? 'Edit Recipe' : 'Add Recipe';
  document.title = isEdit ? 'Recipe Collection — Edit' : 'Recipe Collection — Add';
}

// Gather form values into a recipe payload object.
function collectValues(form) {
  return {
    title: qs('#field-title', form).value.trim(),
    category: qs('#field-category', form).value,
    cook_time: qs('#field-cook', form).value,
    servings: qs('#field-servings', form).value,
    image_url: qs('#field-image', form).value.trim(),
    ingredients: ingredientList ? ingredientList.getValues() : [],
    steps: instructionList ? instructionList.getValues() : []
  };
}

// Handle form submission for both create and edit modes.
async function handleSubmit(e, mountEl, id, submitBtn) {
  e.preventDefault();
  clearError(mountEl);

  const form = e.currentTarget;
  const data = collectValues(form);

  if (!data.title) { showError(mountEl, 'Title is required.'); return; }
  if (!data.category) { showError(mountEl, 'Please choose a category.'); return; }
  if (data.ingredients.length === 0) { showError(mountEl, 'Add at least one ingredient.'); return; }
  if (data.steps.length === 0) { showError(mountEl, 'Add at least one instruction step.'); return; }

  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving\u2026';

  try {
    const saved = id ? await update(id, data) : await create(data);
    const savedId = (saved && saved.id) || id;
    window.location.href = savedId ? `recipe.html?id=${encodeURIComponent(savedId)}` : 'index.html';
  } catch (err) {
    console.error('Failed to save recipe:', err);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    showError(mountEl, err && err.message ? err.message : 'Could not save recipe. Please try again.');
  }
}

// Render a centered state message.
function renderState(mountEl, kind, message, emoji) {
  clearChildren(mountEl);
  const cls = kind === 'error' ? 'error-state' : 'loading-state';
  mountEl.appendChild(el('div', { class: cls }, [
    emoji ? el('span', { class: 'emoji', text: emoji }) : null,
    el('p', { text: message })
  ]));
}

// Initialize: in edit mode load the recipe first, else build an empty form.
async function init() {
  const mountEl = qs('#form-mount');
  if (!mountEl) return;

  const id = getIdFromUrl();
  if (!id) {
    buildForm(mountEl, null);
    return;
  }

  renderState(mountEl, 'loading', 'Loading recipe\u2026');
  try {
    const recipe = await getById(id);
    if (!recipe) {
      renderState(mountEl, 'error', 'Recipe not found.', '\uD83D\uDD0D');
      return;
    }
    buildForm(mountEl, recipe);
  } catch (err) {
    console.error('Failed to load recipe for editing:', err);
    renderState(mountEl, 'error', 'Could not load recipe. Please try again.', '\u26A0\uFE0F');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
