# 🍳 Recipe Collection

A multi-page recipe collection web app built with plain HTML, CSS, and vanilla JavaScript (ES modules). Recipes are stored in Supabase (Postgres) with ingredients and steps as JSONB.

## Features

- **Browse** (`index.html`) — all recipes as cards with image placeholder, title, category badge, and cook time; live search box and category filter (breakfast / lunch / dinner / dessert / snack).
- **Detail** (`recipe.html?id=…`) — full recipe view: ingredients list, numbered step-by-step instructions, servings, cook time, plus Edit and Delete buttons.
- **Add / Edit** (`add.html` or `add.html?id=…`) — form with title, category, cook time, servings, image URL, and dynamic add/remove rows for ingredients and instruction steps.

## Tech Stack

- Plain HTML / CSS / vanilla JavaScript, ES modules — **no build step, no package.json**.
- [Supabase](https://supabase.com) for data persistence via `@supabase/supabase-js` loaded from a CDN.

## Project Structure

```
schema.sql          # Postgres schema for the `recipes` table (JSONB ingredients/steps)
config.js           # Supabase URL + anon key constants
supabaseClient.js   # Single Supabase client (import { supabase } from here)
categories.js       # Category definitions + helpers
formatUtils.js      # Cook time / servings / text formatting helpers
domHelpers.js       # DOM creation & query utilities
recipeService.js    # CRUD operations against Supabase
styles.css          # Shared cohesive stylesheet for all pages

recipeCard.js       # Recipe card component (browse grid)
searchFilter.js     # Search box + category filter component
categoryBadge.js    # Category badge component (detail view)
ingredientRow.js    # Dynamic ingredient row list component
instructionStep.js  # Dynamic instruction step list component

index.html  + browse.js   # Browse page
recipe.html + detail.js   # Detail page
add.html    + form.js     # Add / Edit page
main.js                   # Optional shared dispatcher entry point
```

## Supabase Setup

1. **Create a project** at [supabase.com](https://supabase.com) (or use the one already configured in `config.js`).

2. **Apply the schema.** In the Supabase Dashboard, open **SQL Editor**, paste the contents of `schema.sql`, and run it. This creates the `recipes` table:

   | column      | type          | notes                                                        |
   |-------------|---------------|--------------------------------------------------------------|
   | id          | uuid          | primary key, default `gen_random_uuid()`                     |
   | title       | text          | not null                                                     |
   | category    | text          | one of breakfast/lunch/dinner/dessert/snack                  |
   | cook_time   | integer       | minutes, default 0                                           |
   | servings    | integer       | default 1                                                    |
   | image_url   | text          | optional                                                     |
   | ingredients | jsonb         | array of strings, default `[]`                               |
   | steps       | jsonb         | array of strings, default `[]`                               |
   | created_at  | timestamptz   | default `now()`                                              |
   | updated_at  | timestamptz   | default `now()`                                              |

   The schema also enables Row Level Security with open public read/insert/update/delete policies (suitable for this demo — tighten these for production).

3. **Configure credentials.** Open `config.js` and set your project's values:

   ```js
   export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   export const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
   ```

   Find these under **Project Settings → API** in the Supabase Dashboard (use the **anon / public** key, never the service_role key in a static site).

## Running Locally

Because the app uses ES modules (`<script type="module">`), it must be served over HTTP — opening the files directly with `file://` will fail due to CORS/module restrictions. Any static file server works:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx, no install)
npx serve .

# VS Code: use the "Live Server" extension
```

Then open <http://localhost:8000/index.html> in your browser.

## Usage

- Click **➕ Add Recipe** to create a recipe. Use **➕ Add ingredient** / **➕ Add step** to add rows, and **✕** to remove them.
- Click any card on the browse page to open its detail view.
- On a detail page, use **✏️ Edit** to open the form pre-filled, or **🗑 Delete** to remove the recipe.
- Use the search box and category dropdown on the browse page to filter recipes.

## Notes

- The Supabase client is created in exactly one place (`supabaseClient.js`). All other modules import `{ supabase }` from it — never call `createClient` again.
- Column names in `schema.sql` match those used throughout the JavaScript exactly.
- No dependencies are installed locally; `@supabase/supabase-js` is loaded from the jsDelivr CDN at runtime.
