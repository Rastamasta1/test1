# Would You Rather?

This repository is the Conductor factory's drill ground — a small, self-contained browser app used to exercise the factory's build, test, and governance loop end to end.

## Modules

### `escapeHtml.js`

- `escHtml(str)` — a shared HTML-escaping helper. Coerces input via `String(str)` and escapes the five characters unsafe to interpolate into HTML: `& < > " '`. Imported by `stats.js`, `addQuestion.js`, and `game.js` instead of each file defining its own copy.

### `deck.js`

- `shuffle(arr, seed?)` — a pure Fisher-Yates shuffle. It returns a new array and never mutates the input `arr`. When a numeric `seed` is supplied, the result is deterministic: calling `shuffle(arr, seed?)` again with the same array contents and the same seed always yields an identical order. When `seed` is omitted, ordering comes from `Math.random()` and is non-deterministic, exactly as before seeding was added.
- `buildDeck()` — returns all questions (built-in questions plus any user-added custom questions) combined into a single array, in randomized order.

### `storage.js`

All localStorage persistence for the app. Exports, as implemented:

- `getQuestions()` — returns all questions (built-ins merged with custom questions from localStorage).
- `addQuestion(optionA, optionB)` — persists a new custom question and returns the created question object.
- `updateQuestion(id, optionA, optionB)` — updates an existing custom question in place by id.
- `deleteQuestion(id)` — removes a custom question by id.
- `getVotes(questionId)` — returns accumulated vote counts `{ a, b }` for a question, combining seeded built-in baselines with any extra votes recorded in localStorage.
- `recordVote(questionId, choice)` — persists one vote (`'a'` or `'b'`) for a question and updates aggregate stats.
- `getSessionVotes()` — returns the in-memory map of questions already voted on this session.
- `recordSessionVote(questionId, choice)` — records a vote in the in-memory session map (cleared on page reload).
- `clearSessionVotes()` — clears the in-memory session vote map.
- `getStats()` — returns `{ answered, agreedWithMajority }` stats accumulated across votes.
- `resetStats()` — resets stats and votes back to zero and clears session votes.
- `BUILTIN_QUESTIONS` — the exported constant array of 15 built-in question objects, each with seeded baseline vote counts.

## Running the tests

The full test suite is run with `node --test test/`. This runs every `*.test.js`/`*.test.mjs` file under the `test/` directory using Node's built-in test runner.
