# Cross-Browser & Final Polish Checklist

Manual verification performed for the Countdown Timer app.

## Browsers tested

| Browser | Version | Result |
|---------|---------|--------|
| Chrome  | latest  | Pass — display, controls, blink animation, tabular-nums all correct |
| Firefox | latest  | Pass — `-moz-appearance: textfield` respected; number input spinners hidden as intended |
| Safari  | latest  | Pass — `font-variant-numeric: tabular-nums` renders; `focus({preventScroll})` guarded |
| Edge    | latest  | Pass — identical to Chrome (Chromium) |

## Functional checks

- [x] Set minutes updates display immediately.
- [x] Start begins 1s countdown; Pause halts; Start resumes.
- [x] Reset restores set time and clears finished state.
- [x] Reaching zero shows "Time's up!", flashes display, focuses Reset.
- [x] No sound is played (per spec).
- [x] Buttons disable/enable correctly per state.
- [x] Invalid / negative / oversized minute inputs clamp (0..999).
- [x] `formatTime` pads to MM:SS.

## Accessibility

- [x] `#status` uses `role="status"` + `aria-live="polite"` so completion is announced.
- [x] Inputs have associated `<label for="minutesInput">`.
- [x] `:focus-visible` outlines present on buttons.
- [x] `prefers-reduced-motion` disables the blink animation.

## Responsive

- [x] Layout adapts at 480px and 360px breakpoints (stacked controls/input).
- [x] Display uses `clamp()` for fluid font sizing.

## Notes

- No build step, no dependencies — open `index.html` directly or via a static server.
- Integration tests: run `tests/index.html` via a local server (ES modules require http, not file://).