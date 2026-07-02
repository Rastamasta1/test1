// Shared category definitions for the recipe collection app.
// The `value` fields MUST match the check constraint in schema.sql:
//   category in ('breakfast','lunch','dinner','dessert','snack')

export const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '\uD83C\uDF73' },
  { value: 'lunch',     label: 'Lunch',     emoji: '\uD83E\uDD57' },
  { value: 'dinner',    label: 'Dinner',    emoji: '\uD83C\uDF7D\uFE0F' },
  { value: 'dessert',   label: 'Dessert',   emoji: '\uD83C\uDF70' },
  { value: 'snack',     label: 'Snack',     emoji: '\uD83C\uDF7F' }
];

// Quick lookup map keyed by category value.
export const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.value] = c;
  return acc;
}, {});

// Return the full category object for a given value, or null if unknown.
export function getCategory(value) {
  return CATEGORY_MAP[value] || null;
}

// Human-friendly label for a category value (falls back to the raw value).
export function categoryLabel(value) {
  const c = CATEGORY_MAP[value];
  return c ? c.label : (value || '');
}

// True if the given value is one of the allowed categories.
export function isValidCategory(value) {
  return Object.prototype.hasOwnProperty.call(CATEGORY_MAP, value);
}
