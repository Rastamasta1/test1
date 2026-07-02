// Shared entry point for the recipe collection app.
// Provides a single place that wires shared modules together and dispatches
// to the correct page controller based on the current page. Each HTML page
// may either load its dedicated script directly (browse.js, detail.js, form.js)
// OR load this main.js which will dynamically import the right controller.
//
// Page resolution order:
//   1. document.body.dataset.page  (e.g. <body data-page="browse">)
//   2. #recipe-grid   present -> browse
//      #recipe-mount  present -> detail
//      #form-mount    present -> form
//   3. filename heuristic (index/recipe/add)
//
// This module intentionally performs dynamic imports so a page only pulls in
// the code it actually needs.

// Re-export shared modules so consumers can import everything from one place.
export { supabase } from './supabaseClient.js';
export * as recipeService from './recipeService.js';
export * as categories from './categories.js';
export * as formatUtils from './formatUtils.js';
export * as domHelpers from './domHelpers.js';

// Determine which page controller to load.
function resolvePage() {
  const body = document.body;
  const explicit = body && body.dataset ? body.dataset.page : '';
  if (explicit) return explicit;

  if (document.getElementById('recipe-grid')) return 'browse';
  if (document.getElementById('recipe-mount')) return 'detail';
  if (document.getElementById('form-mount')) return 'form';

  const path = (window.location.pathname || '').toLowerCase();
  if (path.includes('recipe.html')) return 'detail';
  if (path.includes('add.html')) return 'form';
  return 'browse';
}

// Map of page keys to their controller modules.
const PAGE_MODULES = {
  browse: './browse.js',
  detail: './detail.js',
  form: './form.js'
};

// Dispatch: dynamically import the matching page controller.
// The controllers self-initialize on import (they attach DOMContentLoaded
// handlers or run immediately), so importing is sufficient.
async function dispatch() {
  const page = resolvePage();
  const modulePath = PAGE_MODULES[page];
  if (!modulePath) {
    console.warn(`main.js: no controller for page "${page}"`);
    return;
  }
  try {
    await import(modulePath);
  } catch (err) {
    console.error(`main.js: failed to load controller for "${page}":`, err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', dispatch);
} else {
  dispatch();
}
