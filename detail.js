// Recipe detail page logic for the recipe collection app (recipe.html).
// Loads a single recipe by the ?id= URL param, renders its full details,
// and wires up the Edit (link to add.html?id=) and Delete actions.
// Mounts into #recipe-mount.
import { qs, clearChildren, el } from './domHelpers.js';
import { getById, remove } from './recipeService.js';
import { formatCookTime, formatServings } from './formatUtils.js';
import { createCategoryBadge } from './categoryBadge.js';
import { getCategory } from './categories.js';

// Read the recipe id from the current URL query string.
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Render a centered state message (loading / error / empty).
function renderState(mountEl, kind, message, emoji) {
  clearChildren(mountEl);
  const cls = kind === 'error' ? 'error-state' : kind === 'loading' ? 'loading-state' : 'empty-state';
  mountEl.appendChild(el('div', { class: cls }, [
    emoji ? el('span', { class: 'emoji', text: emoji }) : null,
    el('p', { text: message })
  ]));
}

// Build the hero image / placeholder area for a recipe.
function buildHero(recipe) {
  const cat = getCategory(recipe && recipe.category);
  const placeholder = cat ? cat.emoji : '\uD83C\uDF7D\uFE0F';
  const inner = recipe && recipe.image_url
    ? el('img', { src: recipe.image_url, alt: recipe.title || 'Recipe image' })
    : el('span', { text: placeholder });
  return el('div', { class: 'detail-hero' }, inner);
}

// Build the ingredients column.
function buildIngredients(recipe) {
  const list = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const items = list.length
    ? list.map((ing) => el('li', { text: String(ing) }))
    : [el('li', { text: 'No ingredients listed.' })];
  return el('div', { class: 'detail-ingredients' }, [
    el('h2', { text: 'Ingredients' }),
    el('ul', { class: 'ingredient-list' }, items)
  ]);
}

// Build the instructions column.
function buildInstructions(recipe) {
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const items = steps.length
    ? steps.map((s) => el('li', { text: String(s) }))
    : [el('li', { text: 'No instructions listed.' })];
  return el('div', { class: 'detail-instructions' }, [
    el('h2', { text: 'Instructions' }),
    el('ol', { class: 'step-list' }, items)
  ]);
}

// Wire the delete flow: confirm, call service, redirect to browse.
async function handleDelete(recipe, deleteBtn) {
  const title = recipe.title || 'this recipe';
  if (!window.confirm(`Delete \u201C${title}\u201D? This cannot be undone.`)) return;
  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Deleting\u2026';
  try {
    await remove(recipe.id);
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Failed to delete recipe:', err);
    deleteBtn.disabled = false;
    deleteBtn.textContent = '\uD83D\uDDD1 Delete';
    window.alert('Could not delete recipe. Please try again.');
  }
}

// Render the full recipe detail view.
function renderRecipe(mountEl, recipe) {
  clearChildren(mountEl);

  const editLink = el('a', {
    class: 'btn btn-ghost',
    href: `add.html?id=${encodeURIComponent(recipe.id)}`,
    text: '\u270F\uFE0F Edit'
  });

  const deleteBtn = el('button', {
    type: 'button',
    class: 'btn btn-danger',
    text: '\uD83D\uDDD1 Delete'
  });
  deleteBtn.addEventListener('click', () => handleDelete(recipe, deleteBtn));

  const header = el('div', { class: 'detail-header' }, [
    el('div', {}, [
      el('h1', { text: recipe.title || 'Untitled Recipe' }),
      createCategoryBadge(recipe.category)
    ]),
    el('div', { class: 'detail-actions' }, [editLink, deleteBtn])
  ]);

  const stats = el('div', { class: 'detail-stats' }, [
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat-label', text: 'Cook time' }),
      el('span', { class: 'stat-value', text: formatCookTime(recipe.cook_time) })
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat-label', text: 'Servings' }),
      el('span', { class: 'stat-value', text: formatServings(recipe.servings) })
    ])
  ]);

  const columns = el('div', { class: 'detail-columns' }, [
    buildIngredients(recipe),
    buildInstructions(recipe)
  ]);

  const body = el('div', { class: 'detail-body' }, [header, stats, columns]);

  mountEl.appendChild(el('article', { class: 'recipe-detail' }, [
    buildHero(recipe),
    body
  ]));
}

// Load the recipe and render, handling missing id / not found / errors.
async function loadRecipe(mountEl) {
  const id = getIdFromUrl();
  if (!id) {
    renderState(mountEl, 'error', 'No recipe specified.', '\u26A0\uFE0F');
    return;
  }
  renderState(mountEl, 'loading', 'Loading recipe\u2026');
  try {
    const recipe = await getById(id);
    if (!recipe) {
      renderState(mountEl, 'empty', 'Recipe not found.', '\uD83D\uDD0D');
      return;
    }
    renderRecipe(mountEl, recipe);
  } catch (err) {
    console.error('Failed to load recipe:', err);
    renderState(mountEl, 'error', 'Could not load recipe. Please try again.', '\u26A0\uFE0F');
  }
}

function init() {
  const mountEl = qs('#recipe-mount');
  if (!mountEl) return;
  loadRecipe(mountEl);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
