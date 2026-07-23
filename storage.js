// storage.js — localStorage persistence for recipes
const STORAGE_KEY = 'recipe_collection_v1';

export function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}
