// Recipe card component for the recipe collection app.
// Renders a single recipe as a clickable card linking to the detail page.
import { el } from './domHelpers.js';
import { getCategory, categoryLabel } from './categories.js';
import { formatCookTime } from './formatUtils.js';

// Build a category badge node for a given recipe category value.
function categoryBadge(category) {
  const cat = getCategory(category);
  const emoji = cat ? cat.emoji : '';
  return el('span', { class: 'badge' }, [
    emoji ? el('span', { text: emoji }) : null,
    el('span', { text: categoryLabel(category) })
  ]);
}

// Build the thumbnail node: an image when image_url is present, else an emoji placeholder.
function thumb(recipe) {
  const cat = getCategory(recipe && recipe.category);
  const placeholderEmoji = cat ? cat.emoji : '\uD83C\uDF7D\uFE0F';
  const img = recipe && recipe.image_url
    ? el('img', { src: recipe.image_url, alt: recipe.title || 'Recipe image', loading: 'lazy' })
    : el('span', { text: placeholderEmoji });
  return el('div', { class: 'recipe-thumb' }, img);
}

// Create a recipe card DOM element for the given recipe object.
// Returns an <article class="recipe-card"> containing an anchor to recipe.html?id=<id>.
export function createRecipeCard(recipe) {
  const r = recipe || {};
  const href = r.id ? `recipe.html?id=${encodeURIComponent(r.id)}` : 'recipe.html';

  const link = el('a', { href }, [
    thumb(r),
    el('div', { class: 'recipe-body' }, [
      el('h3', { class: 'recipe-title', text: r.title || 'Untitled Recipe' }),
      el('div', { class: 'recipe-meta' }, [
        categoryBadge(r.category),
        el('span', { class: 'cook-time', text: `\u23F1 ${formatCookTime(r.cook_time)}` })
      ])
    ])
  ]);

  return el('article', { class: 'recipe-card' }, link);
}

export default createRecipeCard;
