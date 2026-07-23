// search.js — pure filter function (recipe names only, per spec)

/**
 * Returns recipes whose name contains query (case-insensitive).
 * @param {Array} recipes
 * @param {string} query
 * @returns {Array}
 */
export function filterRecipes(recipes, query) {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((r) => r.name.toLowerCase().includes(q));
}

// Alias exported under the name the DATA task specifies
export const filterRecipesByName = filterRecipes;
