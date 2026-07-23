// recipeModel.js — in-memory recipe store with CRUD operations

/** The shared in-memory recipe array. */
let recipes = [];

/**
 * Returns the current in-memory recipe array (by reference).
 * @returns {Array}
 */
export function getRecipes() {
  return recipes;
}

/**
 * Replaces the in-memory array (used during hydration from storage).
 * @param {Array} loaded
 */
export function setRecipes(loaded) {
  recipes = loaded;
}

/**
 * Creates a new recipe object without adding it to the store.
 * @param {{ name: string, description?: string, ingredients?: string[], steps?: string }} fields
 * @returns {object}
 */
export function createRecipe({ name, description = '', ingredients = [], steps = '' }) {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    ingredients,
    steps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates a recipe object and prepends it to the in-memory store.
 * @param {{ name: string, description?: string, ingredients?: string[], steps?: string }} fields
 * @returns {object} The newly created recipe.
 */
export function addRecipe(fields) {
  const recipe = createRecipe(fields);
  recipes = [recipe, ...recipes];
  return recipe;
}

/**
 * Replaces a recipe in the store by id with updated fields.
 * @param {string} id
 * @param {{ name: string, description?: string, ingredients?: string[], steps?: string }} fields
 * @returns {object|null} The updated recipe, or null if not found.
 */
export function updateRecipe(id, { name, description = '', ingredients = [], steps = '' }) {
  let updated = null;
  recipes = recipes.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, name, description, ingredients, steps, updatedAt: new Date().toISOString() };
    return updated;
  });
  return updated;
}

/**
 * Removes a recipe from the store by id.
 * @param {string} id
 * @returns {boolean} True if a recipe was removed, false if not found.
 */
export function deleteRecipe(id) {
  const before = recipes.length;
  recipes = recipes.filter((r) => r.id !== id);
  return recipes.length < before;
}
