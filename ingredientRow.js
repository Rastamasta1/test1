// Dynamic ingredient row component for the recipe collection app.
// Renders editable rows of ingredient text with add/remove controls.
// Matches the .dynamic-list / .dynamic-row styles in styles.css.
import { el, on, remove } from './domHelpers.js';

// Create a single ingredient input row.
// value: initial text; onRemove: callback invoked when the remove button is clicked.
// Returns { element, getValue, setValue, focus }.
export function createIngredientRow(value = '', onRemove) {
  const input = el('input', {
    type: 'text',
    class: 'ingredient-input',
    placeholder: 'e.g. 2 cups flour',
    'aria-label': 'Ingredient',
    value: value || ''
  });

  const removeBtn = el('button', {
    type: 'button',
    class: 'btn btn-ghost btn-sm remove-row',
    'aria-label': 'Remove ingredient',
    title: 'Remove ingredient',
    text: '\u2715'
  });

  const element = el('div', { class: 'dynamic-row' }, [input, removeBtn]);

  on(removeBtn, 'click', () => {
    if (typeof onRemove === 'function') onRemove(api);
    else remove(element);
  });

  const api = {
    element,
    getValue() { return input.value.trim(); },
    setValue(v) { input.value = v == null ? '' : String(v); return api; },
    focus() { input.focus(); return api; }
  };

  return api;
}

// Create a managed list of ingredient rows with an 'Add ingredient' button.
// initial: array of ingredient strings.
// Returns { element, addRow, getValues, setValues, clear }.
export function createIngredientList(initial = []) {
  const rows = [];

  const listEl = el('div', { class: 'dynamic-list', 'aria-label': 'Ingredients list' });

  const addBtn = el('button', {
    type: 'button',
    class: 'btn btn-ghost btn-sm add-row',
    text: '\u2795 Add ingredient'
  });

  function removeRow(row) {
    const idx = rows.indexOf(row);
    if (idx === -1) return;
    rows.splice(idx, 1);
    remove(row.element);
    // Always keep at least one empty row for usability.
    if (rows.length === 0) addRow('');
  }

  function addRow(value = '', focusIt = false) {
    const row = createIngredientRow(value, removeRow);
    rows.push(row);
    listEl.appendChild(row.element);
    if (focusIt) row.focus();
    return row;
  }

  function getValues() {
    return rows.map((r) => r.getValue()).filter((v) => v.length > 0);
  }

  function setValues(values = []) {
    const list = Array.isArray(values) ? values : [];
    clear();
    if (list.length === 0) {
      addRow('');
    } else {
      for (const v of list) addRow(String(v));
    }
  }

  function clear() {
    rows.splice(0, rows.length);
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
  }

  on(addBtn, 'click', () => addRow('', true));

  // Seed initial rows (or one empty row).
  setValues(initial);

  const element = el('div', { class: 'dynamic-field' }, [listEl, addBtn]);

  return { element, addRow, getValues, setValues, clear };
}

export default createIngredientRow;
