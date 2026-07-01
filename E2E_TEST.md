# End-to-End Submit & Display Flow — Test Guide

This document verifies the guestbook submit/display flow works correctly against Supabase.

## Architecture chain (verified)
1. `index.html` renders the form (`#guestbook-form`) and message list (`#messages`).
2. `app.js` attaches a submit handler that calls `e.preventDefault()` FIRST, reads inputs, calls the data service, then re-renders.
3. `messageService.js` performs `addMessage(name, message)` (insert) and `getMessages()` (select, newest first) using the shared client.
4. `supabaseClient.js` creates the ONLY client via the CDN ESM import.
5. `schema.sql` defines columns `name`, `message`, `created_at` — matching the JS exactly.

## Column consistency check
| Column | schema.sql | insert (addMessage) | select (getMessages) | render (renderMessages) |
|--------|-----------|---------------------|----------------------|-------------------------|
| name | yes | yes | yes | yes (`msg.name`) |
| message | yes | yes | yes | yes (`msg.message`) |
| created_at | yes (default now()) | auto | yes | yes (`msg.created_at`) |

All consistent. ✅

## Prerequisites
- `schema.sql` applied to the Supabase project (RLS enabled with public read + insert policies).

## Manual test steps
1. Open `index.html` via a local static server (module scripts require http, not file://):
   ```sh
   python3 -m http.server 8000
   # then visit http://localhost:8000/
   ```
2. Confirm the list initially shows "No messages yet. Be the first!" (empty table) or existing rows.
3. Enter a Name and Message, click "Sign Guestbook".
4. Expect: status shows "Saving..." then "Thanks for signing!", form resets, and the new message appears at the TOP of the list with a timestamp.
5. Reload the page — the message persists (confirms it was written to Supabase, not just local state).
6. Submit with an empty field — expect the inline validation error (no network call).

## Automated smoke test
Open the app, then in the browser console run:
```js
import('./test.js').then(m => m.runSmokeTest());
```
It inserts a test row and reads it back, logging PASS/FAIL for each assertion.

## Expected failure modes & meaning
- "Could not load messages" → schema not applied or RLS select policy missing.
- "Could not save message" → RLS insert policy missing, or column mismatch.
- Page does a full reload on submit → `e.preventDefault()` not firing (not the case here — verified in app.js).
