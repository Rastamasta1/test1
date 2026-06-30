# Static Deployment & Reload Persistence Verification

This project deploys to Vercel as a static site built with Vite. `vercel.json`
configures the build, SPA fallback rewrites, and long-lived caching for hashed
assets.

## Deployment config (`vercel.json`)
- `framework: vite` + `buildCommand: vite build` -> outputs to `dist/`.
- `outputDirectory: dist` -> Vercel serves the built static files.
- `rewrites` -> any non-asset path falls back to `/index.html` (single-page app).
- `headers` -> hashed `/assets/*` are cached immutably; `index.html` is always
  revalidated so new deploys are picked up immediately.

## Verifying static deployment
1. `npm install`
2. `npm run build` (runs `vite build`) -> confirm a `dist/` folder is produced
   containing `index.html` and `assets/`.
3. `npm run preview` (or `vercel dev`) -> open the served URL.
4. Confirm the Kanban board renders columns and cards (seed state from
   `src/data/persistence.ts`).
5. Confirm static asset paths resolve (no 404s in the network panel).

## Verifying reload persistence
Persistence is handled by `src/data/persistence.ts` using `localStorage`
(key `kanban.board-state.v1`).

1. Open the deployed app.
2. Add a column and a card, drag a card to another column, edit a card.
3. Reload the page (hard refresh).
4. Confirm all changes persist exactly as left -> state is reloaded via
   `loadBoardState()` in `seedBoardState()` on bootstrap (`src/main.ts`).
5. Click **Reset** -> confirm board returns to the default seed and that the
   reset also persists across reload.

## Notes
- No server/database is required; all state lives client-side in `localStorage`.
- Because state is per-browser, clearing site data or using a different browser
  yields a fresh seed board (expected behaviour).
