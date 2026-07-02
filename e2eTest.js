// Browser console E2E smoke harness for the recipe CRUD flow.
// Usage: serve the site, open any page, then in the devtools console run:
//   import('./e2eTest.js').then(m => m.runE2E());
// It exercises the real recipeService against Supabase and cleans up after itself.
import { create, getById, update, getAll, remove } from './recipeService.js';

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
  console.log('  \u2713 ' + msg);
}

export async function runE2E() {
  console.log('%cE2E CRUD smoke test starting\u2026', 'font-weight:bold');
  let createdId = null;
  try {
    // CREATE
    const draft = {
      title: 'E2E Smoke ' + Date.now(),
      category: 'breakfast',
      cook_time: 20,
      servings: 4,
      image_url: '',
      ingredients: ['2 cups flour', '1 cup milk', '2 eggs'],
      steps: ['Mix dry', 'Whisk wet', 'Cook']
    };
    const created = await create(draft);
    assert(created && created.id, 'create returns a row with id');
    createdId = created.id;
    assert(created.title === draft.title, 'title persisted');
    assert(Array.isArray(created.ingredients) && created.ingredients.length === 3, 'ingredients round-trip as array');
    assert(Array.isArray(created.steps) && created.steps.length === 3, 'steps round-trip as array');
    assert(created.category === 'breakfast', 'category persisted');

    // READ by id
    const fetched = await getById(createdId);
    assert(fetched && fetched.id === createdId, 'getById returns the created recipe');
    assert(fetched.servings === 4, 'servings persisted');

    // UPDATE
    const updated = await update(createdId, {
      ...draft,
      servings: 6,
      ingredients: [...draft.ingredients, 'pinch of salt']
    });
    assert(updated.servings === 6, 'update changed servings');
    assert(updated.ingredients.length === 4, 'update appended ingredient');

    // READ all (should contain our recipe)
    const all = await getAll();
    assert(Array.isArray(all) && all.some(r => r.id === createdId), 'getAll includes the recipe');

    // DELETE
    const ok = await remove(createdId);
    assert(ok === true, 'remove returns true');
    const gone = await getById(createdId);
    assert(gone === null, 'getById returns null after delete');
    createdId = null;

    console.log('%cE2E CRUD smoke test PASSED', 'color:green;font-weight:bold');
    return true;
  } catch (err) {
    console.error('%cE2E CRUD smoke test FAILED', 'color:red;font-weight:bold', err);
    // Best-effort cleanup
    if (createdId) {
      try { await remove(createdId); console.log('cleaned up test recipe', createdId); } catch (_) {}
    }
    return false;
  }
}

export default runE2E;
