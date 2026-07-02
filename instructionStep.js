// Dynamic instruction step component for the recipe collection app.
// Renders editable numbered rows of instruction text with add/remove controls.
// Matches the .dynamic-list / .dynamic-row styles in styles.css.
import { el, on, remove, qsa } from './domHelpers.js';

// Create a single instruction step row.
// value: initial text; onRemove: callback invoked when the remove button is clicked.
// Returns { element, getValue, setValue, focus, setNumber }.
export function createInstructionStep(value = '', onRemove, number = 1) {
  const numEl = el('div', { class: 'row-num', text: String(number) });

  const textarea = el('textarea', {
    class: 'step-input',
    rows: '2',
    placeholder: 'Describe this step\u2026',
    'aria-label': 'Instruction step'
  });
  textarea.value = value || '';

  const removeBtn = el('button', {
    type: 'button',
    class: 'btn btn-ghost btn-sm remove-row',
    'aria-label': 'Remove step',
    title: 'Remove step',
    text: '\u2715'
  });

  const element = el('div', { class: 'dynamic-row' }, [numEl, textarea, removeBtn]);

  on(removeBtn, 'click', () => {
    if (typeof onRemove === 'function') onRemove(api);
    else remove(element);
  });

  const api = {
    element,
    getValue() { return textarea.value.trim(); },
    setValue(v) { textarea.value = v == null ? '' : String(v); return api; },
    focus() { textarea.focus(); return api; },
    setNumber(n) { numEl.textContent = String(n); return api; }
  };

  return api;
}

// Create a managed list of instruction step rows with an 'Add step' button.
// initial: array of step strings.
// Returns { element, addRow, getValues, setValues, clear }.
export function createInstructionList(initial = []) {
  const rows = [];

  const listEl = el('div', { class: 'dynamic-list', 'aria-label': 'Instruction steps list' });

  const addBtn = el('button', {
    type: 'button',
    class: 'btn btn-ghost btn-sm add-row',
    text: '\u2795 Add step'
  });

  function renumber() {
    rows.forEach((r, i) => r.setNumber(i + 1));
  }

  function removeRow(row) {
    const idx = rows.indexOf(row);
    if (idx === -1) return;
    rows.splice(idx, 1);
    remove(row.element);
    // Always keep at least one empty row for usability.
    if (rows.length === 0) addRow('');
    renumber();
  }

  function addRow(value = '', focusIt = false) {
    const row = createInstructionStep(value, removeRow, rows.length + 1);
    rows.push(row);
    listEl.appendChild(row.element);
    renumber();
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
    renumber();
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

export default createInstructionStep;
