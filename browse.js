// Browse page logic for the recipe collection app (index.html).
// Fetches all recipes, renders them as cards, and wires up the
// search + category filter toolbar. Mounts into:
//   #toolbar-mount  -> search/filter toolbar
//   #recipe-grid    -> recipe cards / state messages
import { qs, clearChildren, el, frag } from './domHelpers.js';
import { getAll } from './recipeService.js';
import { createRecipeCard } from './recipeCard.js';
import { createSearchFilter, filterRecipes } from './searchFilter.js';

let allRecipes = [];
let filterState = { search: '', category: '' };

// Render a centered state message (loading / error / empty) into the grid.
function renderState(gridEl, kind, message, emoji) {
  clearChildren(gridEl);
  const cls = kind === 'error' ? 'error-state' : kind === 'loading' ? 'loading-state' : 'empty-state';
  gridEl.appendChild(el('div', { class: cls }, [
    emoji ? el('span', { class: 'emoji', text: emoji }) : null,
    el('p', { text: message })
  ]));
}

// Render the current filtered set of recipes into the grid.
function renderRecipes(gridEl) {
  const matches = filterRecipes(allRecipes, filterState);

  if (allRecipes.length === 0) {
    renderState(gridEl, 'empty', 'No recipes yet. Add your first recipe!', '\uD83C\uDF73');
    return;
  }
  if (matches.length === 0) {
    renderState(gridEl, 'empty', 'No recipes match your search.', '\uD83D\uDD0D');
    return;
  }

  clearChildren(gridEl);
  gridEl.appendChild(frag(matches.map((r) => createRecipeCard(r))));
}

// Load recipes from the service and render them.
async function loadRecipes(gridEl) {
  renderState(gridEl, 'loading', 'Loading recipes\u2026');
  try {
    allRecipes = await getAll();
    renderRecipes(gridEl);
  } catch (err) {
    console.error('Failed to load recipes:', err);
    renderState(gridEl, 'error', 'Could not load recipes. Please try again.', '\u26A0\uFE0F');
  }
}

// Initialize the browse page: mount toolbar, wire changes, load data.
function init() {
  const gridEl = qs('#recipe-grid');
  const toolbarMount = qs('#toolbar-mount');
  if (!gridEl) return;

  if (toolbarMount) {
    const toolbar = createSearchFilter((state) => {
      filterState = state;
      renderRecipes(gridEl);
    });
    clearChildren(toolbarMount);
    toolbarMount.appendChild(toolbar.element);
    filterState = toolbar.getState();
  }

  loadRecipes(gridEl);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
