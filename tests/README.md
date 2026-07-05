# Timer Integration Tests

Browser-runnable, zero-dependency integration tests for the countdown timer flow.

## Run

Because the tests use ES module imports, open them via a local server (not `file://`):

```
# from the project root
python3 -m http.server 8000
# then visit http://localhost:8000/tests/index.html
```

Or use any static server. Results are shown on the page and logged to the browser console.

## What is covered

- `createTimerState` — minutes-to-seconds conversion, clamping of invalid and oversized input.
- `setMinutes` — updates duration, resets remaining, stops the timer.
- Full flow — start, tick down, pause, resume, finish.
- `tick` — no decrement when paused, never goes below zero, marks finished at zero.
- `start` with zero remaining — finishes immediately.
- `reset` — restores remaining and clears the finished flag.
- `formatTime` — MM:SS padding and negative clamping.
