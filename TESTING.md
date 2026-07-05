# End-to-End Integration Test — Submit & Display Flow

Manual + scripted verification that the feedback wall works end-to-end: a
visitor submits feedback via the form, it persists to Supabase, and it appears
newest-first in the list with the average rating header updated.

## Preconditions
- `schema.sql` has been applied to the Supabase project (feedback table + RLS
  policies for public read/insert).
- The site is served over HTTP (ES modules require a server, not file://).
  Run any static server from the project root, e.g. `python3 -m http.server`.
- Open `http://localhost:8000/` in a browser.

## Manual Test Steps

### 1. Initial load
- [ ] Page loads without console errors.
- [ ] Summary header (`#summary-mount`) shows `—` / `No ratings yet` when the
      table is empty, OR the correct average + count when rows exist.
- [ ] List (`#list-mount`) shows the empty state message or existing cards
      newest-first.

### 2. Validation guards (no network call expected)
- [ ] Submit with empty name → status shows "Please enter your name."
- [ ] Fill name, leave rating 0 → status shows "Please select a star rating."
- [ ] Fill name + rating, empty comment → "Please enter a comment."

### 3. Happy path submit
- [ ] Enter name `Test User`, click 4 stars, enter comment `Great app!`.
- [ ] Click Submit feedback.
- [ ] Button disables and status shows "Submitting..." then success.
- [ ] A success toast appears (`Thanks for your feedback!`).
- [ ] Form resets (name + comment cleared, stars back to empty).
- [ ] The new card appears at the TOP of the list with name, 4 filled stars,
      relative date (`just now`), and the comment text.
- [ ] The average header updates to include the new rating and count.

### 4. Persistence
- [ ] Reload the page. The submitted feedback is still present (persisted in
      Supabase), confirming insert + select column names match `schema.sql`
      (`name`, `rating`, `comment`, `created_at`).

### 5. No default form submit
- [ ] After submit, the URL does NOT gain a `?name=...` query string
      (confirms `e.preventDefault()` runs first — JS/Supabase path used).

### 6. Error handling
- [ ] Temporarily go offline (devtools) and submit → error status + error
      toast; form is NOT reset; button re-enables.

## Scripted Smoke Test
Load `e2e-smoke.js` from the browser console on the running site:
```js
import('./e2e-smoke.js').then(m => m.runSmokeTest());
```
It exercises the pure utilities and a Supabase insert+read round-trip and logs
PASS/FAIL for each assertion.
