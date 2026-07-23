// app.js — UI controller: wires storage, model, search, list, card, and form modules

// ── storage (was ./storage.js) ───────────────────────────────────────────────
function loadRecipes() {
  try {
    const data = localStorage.getItem('recipes');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecipes(recipes) {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

// ── recipeModel (was ./recipeModel.js) ───────────────────────────────────────
function createRecipe({ name, description, ingredients, steps }) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name,
    description,
    ingredients,
    steps,
    createdAt: new Date().toISOString(),
  };
}

function updateRecipe(recipe, { name, description, ingredients, steps }) {
  return { ...recipe, name, description, ingredients, steps, updatedAt: new Date().toISOString() };
}

// ── search (was ./search.js) ─────────────────────────────────────────────────
function filterRecipes(recipes, query) {
  if (!query) return recipes;
  const q = query.toLowerCase();
  return recipes.filter((r) => r.name && r.name.toLowerCase().includes(q));
}

// ── recipeCard (was ./recipeCard.js) ─────────────────────────────────────────
function renderRecipeCard(recipe, { onEdit, onDelete }) {
  const card = document.createElement('article');
  card.className = 'recipe-card';
  card.dataset.id = recipe.id;

  const title = document.createElement('h2');
  title.className = 'recipe-card__title';
  title.textContent = recipe.name;

  card.appendChild(title);

  if (recipe.description) {
    const desc = document.createElement('p');
    desc.className = 'recipe-card__desc';
    desc.textContent = recipe.description;
    card.appendChild(desc);
  }

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const ingTitle = document.createElement('h3');
    ingTitle.textContent = 'Ingredients';
    card.appendChild(ingTitle);

    const ul = document.createElement('ul');
    ul.className = 'recipe-card__ingredients';
    recipe.ingredients.forEach((ing) => {
      const li = document.createElement('li');
      li.textContent = ing;
      ul.appendChild(li);
    });
    card.appendChild(ul);
  }

  if (recipe.steps) {
    const stepsTitle = document.createElement('h3');
    stepsTitle.textContent = 'Steps';
    card.appendChild(stepsTitle);

    const steps = document.createElement('p');
    steps.className = 'recipe-card__steps';
    steps.textContent = recipe.steps;
    card.appendChild(steps);
  }

  const actions = document.createElement('div');
  actions.className = 'recipe-card__actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-secondary';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => onEdit(recipe.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-danger';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => onDelete(recipe.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  card.appendChild(actions);

  return card;
}

// ── recipeList (was ./recipeList.js) ─────────────────────────────────────────
function renderRecipeList(container, recipes, cardRenderer, handlers) {
  container.innerHTML = '';
  recipes.forEach((recipe) => {
    const card = cardRenderer(recipe, handlers);
    container.appendChild(card);
  });
}

// ── recipeForm (was ./recipeForm.js) ─────────────────────────────────────────
function openRecipeForm({
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
  modalTitle.textContent = recipe ? 'Edit Recipe' : 'New Recipe';
  recipeIdInput.value = recipe ? recipe.id : '';
  recipeNameInput.value = recipe ? recipe.name : '';
  recipeDescInput.value = recipe ? recipe.description : '';
  recipeStepsInput.value = recipe ? recipe.steps : '';
  ingredientsList.innerHTML = '';
  errorName.hidden = true;
  errorIngredients.hidden = true;
  modalOverlay.hidden = false;
}

function closeRecipeForm({ modalOverlay, errorName, errorIngredients }) {
  modalOverlay.hidden = true;
  errorName.hidden = true;
  errorIngredients.hidden = true;
}

// ── State ────────────────────────────────────────────────────────────────────
let recipes = [];
let searchQuery = '';
let pendingDeleteId = null;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const btnNewRecipe    = document.getElementById('btn-new-recipe');
const searchInput     = document.getElementById('search-input');
const emptyState      = document.getElementById('empty-state');
const recipeListEl    = document.getElementById('recipe-list');
const modalOverlay    = document.getElementById('modal-overlay');
const btnCloseModal   = document.getElementById('btn-close-modal');
const btnCancel       = document.getElementById('btn-cancel');
const recipeForm      = document.getElementById('recipe-form');
const recipeIdInput   = document.getElementById('recipe-id');
const recipeNameInput = document.getElementById('recipe-name');
const recipeDescInput = document.getElementById('recipe-description');
const ingredientsList = document.getElementById('ingredients-list');
const btnAddIngredient= document.getElementById('btn-add-ingredient');
const recipeStepsInput= document.getElementById('recipe-steps');
const errorName       = document.getElementById('error-name');
const errorIngredients= document.getElementById('error-ingredients');
const modalTitle      = document.getElementById('modal-title');
const confirmOverlay  = document.getElementById('confirm-overlay');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete= document.getElementById('btn-confirm-delete');

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const visible = filterRecipes(recipes, searchQuery);
  emptyState.hidden = visible.length > 0;
  renderRecipeList(recipeListEl, visible, renderRecipeCard, {
    onEdit:   handleEdit,
    onDelete: handleDeleteRequest,
  });
}

// ── Search ───────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  render();
});

// ── New recipe ───────────────────────────────────────────────────────────────
btnNewRecipe.addEventListener('click', () => {
  openRecipeForm({
    modalOverlay,
    modalTitle,
    recipeIdInput,
    recipeNameInput,
    recipeDescInput,
    ingredientsList,
    recipeStepsInput,
    errorName,
    errorIngredients,
    recipe: null,
  });
});

// ── Close / cancel modal ─────────────────────────────────────────────────────
function closeModal() {
  closeRecipeForm({ modalOverlay, errorName, errorIngredients });
}

btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ── Form submit (save / update) ───────────────────────────────────────────────
recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Gather ingredient rows
  const ingredientInputs = ingredientsList.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs)
    .map((i) => i.value.trim())
    .filter(Boolean);

  // Validate
  let valid = true;
  const name = recipeNameInput.value.trim();
  if (!name) {
    errorName.hidden = false;
    valid = false;
  } else {
    errorName.hidden = true;
  }
  if (ingredients.length === 0) {
    errorIngredients.hidden = false;
    valid = false;
  } else {
    errorIngredients.hidden = true;
  }
  if (!valid) return;

  const existingId = recipeIdInput.value;
  if (existingId) {
    // Edit existing
    recipes = recipes.map((r) =>
      r.id === existingId
        ? updateRecipe(r, {
            name,
            description: recipeDescInput.value.trim(),
            ingredients,
            steps: recipeStepsInput.value.trim(),
          })
        : r
    );
  } else {
    // Create new
    const recipe = createRecipe({
      name,
      description: recipeDescInput.value.trim(),
      ingredients,
      steps: recipeStepsInput.value.trim(),
    });
    recipes = [recipe, ...recipes];
  }

  saveRecipes(recipes);
  closeModal();
  render();
});

// ── Add ingredient row ────────────────────────────────────────────────────────
btnAddIngredient.addEventListener('click', () => {
  addIngredientRow(ingredientsList, '');
});

function addIngredientRow(container, value) {
  const row = document.createElement('div');
  row.className = 'ingredient-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input ingredient-input';
  input.placeholder = 'e.g. 200g pasta';
  input.maxLength = 200;
  input.value = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-icon btn-remove-ingredient';
  removeBtn.setAttribute('aria-label', 'Remove ingredient');
  removeBtn.textContent = '\u00d7';
  removeBtn.addEventListener('click', () => row.remove());

  row.appendChild(input);
  row.appendChild(removeBtn);
  container.appendChild(row);
  input.focus();
}

// ── Edit ─────────────────────────────────────────────────────────────────────
function handleEdit(id) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return;

  openRecipeForm({
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
  });

  // Populate ingredient rows after form opens
  ingredientsList.innerHTML = '';
  (recipe.ingredients || []).forEach((ing) =>
    addIngredientRow(ingredientsList, ing)
  );
}

// ── Delete (request + confirm) ────────────────────────────────────────────────
function handleDeleteRequest(id) {
  pendingDeleteId = id;
  confirmOverlay.hidden = false;
}

btnCancelDelete.addEventListener('click', () => {
  pendingDeleteId = null;
  confirmOverlay.hidden = true;
});

btnConfirmDelete.addEventListener('click', () => {
  if (pendingDeleteId) {
    recipes = recipes.filter((r) => r.id !== pendingDeleteId);
    saveRecipes(recipes);
    pendingDeleteId = null;
  }
  confirmOverlay.hidden = true;
  render();
});

confirmOverlay.addEventListener('click', (e) => {
  if (e.target === confirmOverlay) {
    pendingDeleteId = null;
    confirmOverlay.hidden = true;
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  recipes = loadRecipes();
  render();
}

init();
