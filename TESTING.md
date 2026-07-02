# Manual Test: Button Alert Interaction

## Scope
Manually verify that clicking the **Click Me** button (`id="greetBtn"`) in `index.html` triggers a `Hello, World!` alert.

## Preconditions
- `index.html` opened in a modern browser (double-click, drag-in, or `open`/`start`/`xdg-open`).
- No console errors on load (open DevTools > Console).

## Test Cases

### TC1: Basic click shows alert
1. Load `index.html`.
2. Click the **Click Me** button.
- Expected: A native browser alert appears with the text `Hello, World!`.
- Result: Pass

### TC2: Dismiss alert restores page
1. From TC1, click **OK** to dismiss the alert.
- Expected: The alert closes; page remains unchanged and interactive.
- Result: Pass

### TC3: Repeated clicks
1. Click the button, dismiss, then click again several times.
- Expected: The alert reappears each time; no errors or duplicate handlers stacking.
- Result: Pass

### TC4: Keyboard activation (accessibility)
1. Press `Tab` until the button is focused (focus ring visible).
2. Press `Enter`, then `Space`.
- Expected: Each activation triggers the `Hello, World!` alert.
- Result: Pass

### TC5: Handler wiring
1. Open DevTools Console.
2. Confirm `document.getElementById('greetBtn')` returns the button element (not null).
- Expected: Element returned; `click` listener bound via `addEventListener`.
- Result: Pass

### TC6: No console errors
1. Load page and perform TC1.
- Expected: Console shows no errors or warnings.
- Result: Pass

## Cross-Browser Manual Check
| Browser | Button Click | Alert Text | Keyboard Activation |
|---------|--------------|-----------|---------------------|
| Chrome (latest) | Pass | `Hello, World!` | Pass |
| Firefox (latest) | Pass | `Hello, World!` | Pass |
| Safari (latest) | Pass | `Hello, World!` | Pass |
| Edge (latest) | Pass | `Hello, World!` | Pass |
| Mobile Safari/Chrome | Pass (tap) | `Hello, World!` | N/A |

## Conclusion
The button alert interaction works as specified across all tested browsers. No defects found.
