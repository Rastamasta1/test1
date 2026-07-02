// Search + category filter component for the recipe collection app.
// Renders a toolbar containing a text search input and a category <select>.
// Calls onChange({ search, category }) whenever either control changes.
import { el, on } from './domHelpers.js';
import { CATEGORIES } from './categories.js';

// Build the category filter <select> with an 'All categories' default option.
function buildCategorySelect() {
  const options = [el('option', { value: '', text: 'All categories' })];
  for (const c of CATEGORIES) {
    options.push(el('option', { value: c.value, text: `${c.emoji} ${c.label}` }));
  }
  return el('select', { class: 'filter', 'aria-label': 'Filter by category' }, options);
}

// Create the search + filter toolbar.
// onChange: function receiving { search, category } on every update.
// Returns { element, getState, setState }.
export function createSearchFilter(onChange) {
  const emit = typeof onChange === 'function' ? onChange : () => {};

  const searchInput = el('input', {
    class: 'search',
    type: 'search',
    placeholder: 'Search recipes\u2026',
    'aria-label': 'Search recipes'
  });

  const categorySelect = buildCategorySelect();

  function getState() {
    return {
      search: searchInput.value.trim(),
      category: categorySelect.value
    };
  }

  function setState(state = {}) {
    if ('search' in state) searchInput.value = state.search || '';
    if ('category' in state) categorySelect.value = state.category || '';
  }

  const notify = () => emit(getState());

  on(searchInput, 'input', notify);
  on(categorySelect, 'change', notify);

  const element = el('div', { class: 'toolbar' }, [searchInput, categorySelect]);

  return { element, getState, setState };
}

// Filter a list of recipes by a { search, category } state.
// Case-insensitive title match; empty category means all.
export function filterRecipes(recipes, state = {}) {
  const list = Array.isArray(recipes) ? recipes : [];
  const term = String(state.search || '').trim().toLowerCase();
  const category = String(state.category || '').trim();

  return list.filter((r) => {
    if (category && r.category !== category) return false;
    if (term) {
      const title = String(r.title || '').toLowerCase();
      if (!title.includes(term)) return false;
    }
    return true;
  });
}

export default createSearchFilter;
