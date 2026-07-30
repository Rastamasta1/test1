// render.js — DOM rendering for habit list and seven-day grid

import { getSevenDayWindow } from './habitModel.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Render all habits into the container element.
 * @param {HTMLElement} container
 * @param {object[]} habits
 * @param {function} onToggle — called with (habitId, dateStr)
 */
export function renderHabits(container, habits, onToggle) {
  container.innerHTML = '';

  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-msg">No habits yet. Add one above!</p>';
    return;
  }

  const window7 = getSevenDayWindow();
  const todayStr = window7[window7.length - 1];

  habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.id = habit.id;

    // Header row
    const header = document.createElement('div');
    header.className = 'habit-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'habit-name';
    nameEl.textContent = habit.name;

    const doneBtn = document.createElement('button');
    doneBtn.className = 'done-btn';
    const doneToday = habit.completedDays.includes(todayStr);
    doneBtn.textContent = doneToday ? '✓ Done today' : 'Mark done';
    doneBtn.classList.toggle('done', doneToday);
    doneBtn.setAttribute('aria-pressed', String(doneToday));
    doneBtn.addEventListener('click', () => onToggle(habit.id, todayStr));

    header.appendChild(nameEl);
    header.appendChild(doneBtn);

    // Seven-day grid
    const grid = document.createElement('div');
    grid.className = 'day-grid';

    window7.forEach(dateStr => {
      const dayEl = document.createElement('div');
      dayEl.className = 'day-cell';

      const d = new Date(dateStr + 'T00:00:00');
      const label = document.createElement('span');
      label.className = 'day-label';
      label.textContent = DAY_LABELS[d.getDay()];

      const dot = document.createElement('button');
      dot.className = 'day-dot';
      const completed = habit.completedDays.includes(dateStr);
      dot.classList.toggle('completed', completed);
      dot.setAttribute('aria-label',
        `${dateStr} — ${completed ? 'completed' : 'not completed'}`);
      dot.setAttribute('aria-pressed', String(completed));
      dot.title = dateStr;

      // Allow toggling any day in the grid
      dot.addEventListener('click', () => onToggle(habit.id, dateStr));

      dayEl.appendChild(label);
      dayEl.appendChild(dot);
      grid.appendChild(dayEl);
    });

    card.appendChild(header);
    card.appendChild(grid);
    container.appendChild(card);
  });
}
