# End-to-End CRUD Test Plan

Verifies the full recipe lifecycle across all three pages using the real Supabase backend. Serve the site over HTTP (`python3 -m http.server 8000`) and open in a browser.

## Preconditions
- `schema.sql` has been applied to the Supabase project.
- `config.js` has valid `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
- Open the browser devtools Console to watch for errors.

## 1. CREATE (add.html)
1. Navigate to `add.html`. Heading reads **Add Recipe**.
2. Fill Title = `E2E Test Pancakes`, Category = `Breakfast`, Cook time = `20`, Servings = `4`, Image URL = (leave blank).
3. Click **➕ Add ingredient** twice; enter `2 cups flour`, `1 cup milk`, `2 eggs` across three rows.
4. Click **➕ Add step** once; enter `Mix dry ingredients`, `Whisk in wet ingredients`.
5. Submit. **Expect**: redirect to `recipe.html?id=<uuid>` with no console errors.
   - Negative check: submitting with empty title, no category, no ingredients, or no steps shows an inline error and does NOT navigate.
   - Negative check: the page must NOT do a default GET reload (preventDefault working).

## 2. READ — Detail (recipe.html)
1. After the redirect, confirm title, breakfast badge, cook time `20m`, servings `4 servings`.
2. Confirm all 3 ingredients render in the ingredient list.
3. Confirm 2 numbered instruction steps render.
4. Placeholder hero shows the breakfast emoji (no image URL supplied).

## 3. READ — Browse (index.html)
1. Navigate to `index.html`. The new recipe card appears (newest first).
2. Card shows title, breakfast badge, cook time `20m`.
3. Type `pancakes` in search → card stays; type `zzz` → empty-state message.
4. Category filter = `Dinner` → card hidden; = `All categories` → card returns.
5. Click the card → navigates to its `recipe.html?id=`.

## 4. UPDATE (add.html?id=)
1. From detail page click **✏️ Edit**. Heading reads **Edit Recipe**, form pre-filled.
2. Change Servings to `6`, add ingredient `pinch of salt`, add step `Cook on griddle`.
3. Submit. **Expect**: redirect back to detail page.
4. Confirm servings now `6 servings`, 4 ingredients, 3 steps.

## 5. DELETE (recipe.html)
1. On the detail page click **🗑 Delete**; confirm the dialog.
2. **Expect**: redirect to `index.html`; the deleted card is gone.
3. Manually visiting the old `recipe.html?id=<uuid>` shows **Recipe not found.**

## 6. Automated smoke (optional)
Run the scripted harness in the browser console — see `e2eTest.js`. It performs create → getById → update → getAll → remove and asserts JSONB round-trips.

## Pass Criteria
- No uncaught console errors on any page.
- Data persists across navigations/reloads (backed by Supabase).
- Ingredients/steps survive as JSONB arrays through create and update.
- Validation blocks invalid submits; delete confirmation required.
