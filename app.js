// app.js — UI controller
// Imports storage, habitModel, and render; wires form submit, toggle clicks, initial render

import { loadHabits, saveHabits } from './storage.js';
import { createHabit, toggleDay } from './habitModel.js';
import { renderHabits } from './render.js';

const form = document.getElementById('add-habit-form');
const input = document.getElementById('habit-name-input');
const container = document.getElementById('habits-container');

function getHabits() {
  return loadHabits();
}

function refresh() {
  const habits = getHabits();
  renderHabits(container, habits, handleToggle);
}

function handleToggle(habitId, dateStr) {
  const habits = getHabits();
  const updated = habits.map(h =>
    h.id === habitId ? toggleDay(h, dateStr) : h
  );
  saveHabits(updated);
  refresh();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;
  const habits = getHabits();
  const newHabit = createHabit(name);
  saveHabits([...habits, newHabit]);
  input.value = '';
  refresh();
});

// Initial render on page load
refresh();
