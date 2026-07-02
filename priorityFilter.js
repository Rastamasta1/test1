// Priority filter bar component.
// Renders a row of filter chips matching .filter-bar / .filter-chip in styles/main.css.
// Chips: All, High, Medium, Low. Selecting one calls onChange with the priority
// value ('high'|'medium'|'low') or null for "All".

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

// options:
//   active: current active priority (null for All)
//   onChange(priority|null): called when a chip is selected
export function renderPriorityFilter({ active = null, onChange } = {}) {
  const bar = document.createElement('div');
  bar.className = 'filter-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter tasks by priority');

  // Track current active value on the element.
  bar.dataset.active = active == null ? '' : active;

  FILTERS.forEach(({ value, label }) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'filter-chip';
    chip.textContent = label;
    chip.dataset.value = value == null ? '' : value;
    if ((value == null && active == null) || value === active) {
      chip.classList.add('active');
    }
    chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');

    chip.addEventListener('click', () => {
      const next = value;
      setActive(next);
      if (typeof onChange === 'function') onChange(next);
    });

    bar.appendChild(chip);
  });

  // Update which chip appears active without re-rendering.
  function setActive(priority) {
    const norm = priority == null ? '' : priority;
    bar.dataset.active = norm;
    bar.querySelectorAll('.filter-chip').forEach((c) => {
      const on = c.dataset.value === norm;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // Expose helpers for the controller.
  bar.setActive = setActive;
  bar.getActive = () => (bar.dataset.active === '' ? null : bar.dataset.active);

  return bar;
}
