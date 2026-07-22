/**
 * addQuestion.js — renders the "Add Your Own Question" form.
 *
 * Exports:
 *   renderAddQuestion(containerEl, { onSave })  — populate the add-question view
 */

import { saveCustomQuestion } from './customQuestions.js';

// ── Utility: escape HTML ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render the Add Your Own Question form into the given container element.
 *
 * @param {HTMLElement} el         - The #view-add container
 * @param {object}      callbacks
 * @param {Function}    callbacks.onSave  - Called after a question is successfully saved
 */
export function renderAddQuestion(el, { onSave = () => {} } = {}) {
  el.innerHTML = `
    <div class="add-wrap">
      <h2 class="add-title">Add Your Own Question</h2>

      <form id="add-question-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="input-option-a">Option A <span aria-hidden="true">*</span></label>
          <textarea
            id="input-option-a"
            name="optionA"
            class="form-input"
            rows="2"
            placeholder="e.g. Be able to fly"
            autocomplete="off"
            required
          ></textarea>
          <span class="form-error" id="error-option-a" role="alert" hidden></span>
        </div>

        <div class="form-divider">or</div>

        <div class="form-group">
          <label class="form-label" for="input-option-b">Option B <span aria-hidden="true">*</span></label>
          <textarea
            id="input-option-b"
            name="optionB"
            class="form-input"
            rows="2"
            placeholder="e.g. Be able to turn invisible"
            autocomplete="off"
            required
          ></textarea>
          <span class="form-error" id="error-option-b" role="alert" hidden></span>
        </div>

        <button type="submit" class="btn btn--primary" style="width:100%;margin-top:8px;">Add Question</button>
      </form>

      <div id="add-success" hidden></div>
    </div>
  `;

  const form       = el.querySelector('#add-question-form');
  const inputA     = el.querySelector('#input-option-a');
  const inputB     = el.querySelector('#input-option-b');
  const errorA     = el.querySelector('#error-option-a');
  const errorB     = el.querySelector('#error-option-b');
  const successBox = el.querySelector('#add-success');

  function clearError(input, errorEl) {
    input.classList.remove('form-input--error');
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function showError(input, errorEl, msg) {
    input.classList.add('form-input--error');
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  inputA.addEventListener('input', () => clearError(inputA, errorA));
  inputB.addEventListener('input', () => clearError(inputB, errorB));

  form.addEventListener('submit', e => {
    e.preventDefault();

    const valA = inputA.value.trim();
    const valB = inputB.value.trim();
    let valid = true;

    clearError(inputA, errorA);
    clearError(inputB, errorB);
    successBox.hidden = true;

    if (!valA) {
      showError(inputA, errorA, 'Option A is required.');
      valid = false;
    }
    if (!valB) {
      showError(inputB, errorB, 'Option B is required.');
      valid = false;
    }
    if (!valid) return;

    saveCustomQuestion(valA, valB);
    onSave();

    form.reset();
    successBox.hidden = false;
    successBox.innerHTML = `
      <div class="form-success">\u2713 Question added! It'll appear in the deck next round.</div>
    `;
    inputA.focus();
  });
}
