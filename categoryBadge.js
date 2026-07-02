// Category badge component for the recipe collection app.
// Renders a small pill showing a category's emoji and label.
// Reuses the shared category definitions and DOM helpers so the markup
// stays consistent with the badge produced inline by recipeCard.js.
import { el } from './domHelpers.js';
import { getCategory, categoryLabel } from './categories.js';

// Return the plain text form of a category badge, e.g. 'ud83cudf73 Breakfast'.
// Falls back to just the label (or raw value) when no emoji is available.
export function getBadgeText(category) {
  const cat = getCategory(category);
  const label = categoryLabel(category);
  return cat && cat.emoji ? `${cat.emoji} ${label}` : label;
}

// Create a category badge DOM element for a given category value.
// Returns a <span class="badge"> containing the emoji (when known) and label.
// Accepts an optional extra CSS class for contextual styling.
export function createCategoryBadge(category, extraClass) {
  const cat = getCategory(category);
  const emoji = cat ? cat.emoji : '';
  const className = extraClass ? `badge ${extraClass}` : 'badge';
  return el('span', { class: className }, [
    emoji ? el('span', { class: 'badge-emoji', text: emoji, 'aria-hidden': 'true' }) : null,
    el('span', { class: 'badge-label', text: categoryLabel(category) })
  ]);
}

export default createCategoryBadge;
