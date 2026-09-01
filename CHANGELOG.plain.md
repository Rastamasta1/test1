# What changed, in plain words

This file is written for the person who owns the app — not for a developer.
Every entry is built from the factory's own ledger; the newest account of a
change replaces the older one. Generated — do not edit by hand; the next
update rebuilds the whole file.

## 2026-09-01

### Repeatable Card Shuffle with Optional Seed

The card shuffle now accepts an optional starting value so the same value always produces the same order. Without that value, the shuffle stays random as before. New tests confirm both behaviours, and the notes at the top of the file were updated to match.

**Why:** This delivers the promised behaviour where you can get a predictable, repeatable order when you want it, while keeping randomness the rest of the time.

**What you'll notice:** The full test set passed with 29 passed and 0 failed. These results were reported by the worker's checker and confirmed to be about the right requirement, but they were not independently re-checked here.
