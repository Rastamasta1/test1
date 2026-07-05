// Interactive star rating input component for the feedback wall app.
// Renders 5 clickable stars into a container and tracks the selected value.
//
// Usage:
//   import { createStarInput } from './starInput.js';
//   const stars = createStarInput(document.getElementById('star-input'));
//   const rating = stars.getValue(); // 0 when nothing selected
//   stars.reset();

const MAX_STARS = 5;
const FILLED = '\u2605'; // ★
const EMPTY = '\u2606';  // ☆

export function createStarInput(container, options = {}) {
  if (!container) {
    throw new Error('createStarInput requires a container element');
  }

  const initial = clampRating(options.initial ?? 0);
  let selected = initial;

  container.classList.add('star-input');
  container.setAttribute('role', 'radiogroup');
  container.setAttribute('aria-label', 'Star rating');
  container.innerHTML = '';

  const stars = [];

  for (let value = 1; value <= MAX_STARS; value += 1) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'star';
    star.dataset.value = String(value);
    star.textContent = EMPTY;
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-label', `${value} star${value === 1 ? '' : 's'}`);
    star.setAttribute('aria-checked', 'false');
    star.tabIndex = value === 1 ? 0 : -1;

    star.addEventListener('click', () => {
      setValue(value);
    });

    star.addEventListener('mouseenter', () => {
      paint(value);
    });

    star.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setValue(Math.min(MAX_STARS, (selected || 0) + 1));
        focusStar(selected);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setValue(Math.max(1, (selected || 1) - 1));
        focusStar(selected);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setValue(value);
      }
    });

    stars.push(star);
    container.appendChild(star);
  }

  container.addEventListener('mouseleave', () => {
    paint(selected);
  });

  // Paint stars up to `count` as filled/active; rest empty.
  function paint(count) {
    stars.forEach((star, index) => {
      const filled = index < count;
      star.textContent = filled ? FILLED : EMPTY;
      star.classList.toggle('active', filled);
    });
  }

  function focusStar(value) {
    const idx = clampRating(value) - 1;
    stars.forEach((s, i) => {
      s.tabIndex = i === Math.max(0, idx) ? 0 : -1;
    });
    if (stars[Math.max(0, idx)]) stars[Math.max(0, idx)].focus();
  }

  function setValue(value) {
    selected = clampRating(value);
    paint(selected);
    stars.forEach((star, index) => {
      const checked = index + 1 === selected;
      star.setAttribute('aria-checked', checked ? 'true' : 'false');
    });
    if (typeof options.onChange === 'function') {
      options.onChange(selected);
    }
  }

  function getValue() {
    return selected;
  }

  function reset() {
    selected = 0;
    paint(0);
    stars.forEach((star, i) => {
      star.setAttribute('aria-checked', 'false');
      star.tabIndex = i === 0 ? 0 : -1;
    });
  }

  // Initial render
  paint(selected);

  return { getValue, setValue, reset, element: container };
}

function clampRating(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > MAX_STARS) return MAX_STARS;
  return n;
}
