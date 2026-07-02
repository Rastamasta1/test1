// Predefined transaction categories with color coding.
// Column value used in schema.sql `category` check: salary, food, rent, transport, entertainment, other.
// All other modules should import from here to keep labels/colors consistent.

export const CATEGORIES = [
  { key: 'salary',        label: 'Salary',        type: 'income',  color: '#22c55e', icon: '\uD83D\uDCB0' },
  { key: 'food',          label: 'Food',          type: 'expense', color: '#f97316', icon: '\uD83C\uDF7D\uFE0F' },
  { key: 'rent',          label: 'Rent',          type: 'expense', color: '#6366f1', icon: '\uD83C\uDFE0' },
  { key: 'transport',     label: 'Transport',     type: 'expense', color: '#0ea5e9', icon: '\uD83D\uDE97' },
  { key: 'entertainment', label: 'Entertainment', type: 'expense', color: '#ec4899', icon: '\uD83C\uDFAC' },
  { key: 'other',         label: 'Other',         type: 'expense', color: '#94a3b8', icon: '\uD83D\uDCE6' }
];

// Fast lookup by key.
export const CATEGORY_MAP = CATEGORIES.reduce((map, cat) => {
  map[cat.key] = cat;
  return map;
}, {});

// Convenience groupings.
export const INCOME_CATEGORIES = CATEGORIES.filter(c => c.type === 'income');
export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense');

// Safe getter — returns the 'other' category as a fallback for unknown keys.
export function getCategory(key) {
  return CATEGORY_MAP[key] || CATEGORY_MAP['other'];
}

// Helpers used by UI rendering.
export function getCategoryColor(key) {
  return getCategory(key).color;
}

export function getCategoryLabel(key) {
  return getCategory(key).label;
}

export function getCategoryIcon(key) {
  return getCategory(key).icon;
}
