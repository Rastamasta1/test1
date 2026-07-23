// recipeCard.js — returns HTML string for a single recipe card
export function renderRecipeCard(recipe) {
  const ingredients = (recipe.ingredients || [])
    .map((i) => `<li class="card-ingredient">${escapeHtml(i)}</li>`)
    .join('');

  return `
    <div class="recipe-card">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(recipe.name)}</h3>
        ${recipe.description ? `<p class="card-description">${escapeHtml(recipe.description)}</p>` : ''}
        ${ingredients ? `<ul class="card-ingredients">${ingredients}</ul>` : ''}
        ${recipe.steps ? `<p class="card-steps">${escapeHtml(recipe.steps)}</p>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary btn-sm" data-action="edit" aria-label="Edit ${escapeHtml(recipe.name)}">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete" aria-label="Delete ${escapeHtml(recipe.name)}">Delete</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
