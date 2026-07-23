// recipeForm.js — open/close helpers for the recipe form modal
export function openRecipeForm({
  modalOverlay,
  modalTitle,
  recipeIdInput,
  recipeNameInput,
  recipeDescInput,
  ingredientsList,
  recipeStepsInput,
  errorName,
  errorIngredients,
  recipe,
}) {
  // Reset errors
  errorName.hidden = true;
  errorIngredients.hidden = true;

  if (recipe) {
    modalTitle.textContent = 'Edit Recipe';
    recipeIdInput.value       = recipe.id;
    recipeNameInput.value     = recipe.name;
    recipeDescInput.value     = recipe.description || '';
    recipeStepsInput.value    = recipe.steps || '';
    // Ingredient rows are populated by app.js after this call
    ingredientsList.innerHTML = '';
  } else {
    modalTitle.textContent = 'New Recipe';
    recipeIdInput.value       = '';
    recipeNameInput.value     = '';
    recipeDescInput.value     = '';
    recipeStepsInput.value    = '';
    ingredientsList.innerHTML = '';
  }

  modalOverlay.hidden = false;
  recipeNameInput.focus();
}

export function closeRecipeForm({ modalOverlay, errorName, errorIngredients }) {
  modalOverlay.hidden = true;
  errorName.hidden = true;
  errorIngredients.hidden = true;
}
