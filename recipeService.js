// Recipe data service for the recipe collection app.
// All Supabase CRUD operations live here. Import { supabase } from the
// single client module; NEVER call createClient again.
import { supabase } from './supabaseClient.js';
import { isValidCategory } from './categories.js';

const TABLE = 'recipes';

// Normalize a raw form/object into a clean recipe payload matching schema.sql.
function toPayload(data = {}) {
  const payload = {
    title: String(data.title ?? '').trim(),
    category: String(data.category ?? '').trim(),
    cook_time: Number.isFinite(Number(data.cook_time)) ? Math.round(Number(data.cook_time)) : 0,
    servings: Number.isFinite(Number(data.servings)) ? Math.round(Number(data.servings)) : 1,
    image_url: data.image_url ? String(data.image_url).trim() : null,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    steps: Array.isArray(data.steps) ? data.steps : []
  };
  return payload;
}

// Validate a payload; throws Error with a friendly message when invalid.
function validate(payload) {
  if (!payload.title) throw new Error('Title is required.');
  if (!isValidCategory(payload.category)) throw new Error('A valid category is required.');
  if (payload.cook_time < 0) throw new Error('Cook time cannot be negative.');
  if (payload.servings < 1) throw new Error('Servings must be at least 1.');
}

// Fetch all recipes, newest first.
export async function getAll() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Fetch a single recipe by id. Returns null when not found.
export async function getById(id) {
  if (!id) throw new Error('Recipe id is required.');
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// Create a new recipe. Returns the inserted row.
export async function create(recipe) {
  const payload = toPayload(recipe);
  validate(payload);
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update an existing recipe by id. Returns the updated row.
export async function update(id, recipe) {
  if (!id) throw new Error('Recipe id is required.');
  const payload = toPayload(recipe);
  validate(payload);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete a recipe by id. Returns true on success.
export async function remove(id) {
  if (!id) throw new Error('Recipe id is required.');
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// Convenient aliases matching common naming.
export const getAllRecipes = getAll;
export const getRecipeById = getById;
export const createRecipe = create;
export const updateRecipe = update;
export const deleteRecipe = remove;
