// recipeList.js — renders the recipe list into a <ul> element
export function renderRecipeList(listEl, recipes, renderCard, handlers) {
  listEl.innerHTML = '';
  recipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.className = 'recipe-item';
    li.innerHTML = renderCard(recipe);

    const editBtn = li.querySelector('[data-action="edit"]');
    const deleteBtn = li.querySelector('[data-action="delete"]');

    if (editBtn) editBtn.addEventListener('click', () => handlers.onEdit(recipe.id));
    if (deleteBtn) deleteBtn.addEventListener('click', () => handlers.onDelete(recipe.id));

    listEl.appendChild(li);
  });
}
