# Manual Test Plan — Color Palette Generator

Run by opening `index.html` in a modern browser (Chrome, Firefox, Safari).

## 1. Initial Load
- [ ] Page loads with title "Color Palette Generator".
- [ ] Exactly 5 color swatches render automatically on load.
- [ ] Each swatch shows an uppercase hex code (e.g. `#A3F2C1`).
- [ ] Focus is NOT stolen on load (page top has focus, not a swatch).

## 2. Generate Palette
- [ ] Click "Generate Palette" button.
- [ ] A new set of 5 swatches replaces the previous ones.
- [ ] Colors differ from the previous set (random each time).
- [ ] After clicking, keyboard focus moves to the first swatch.
- [ ] Repeated clicks keep producing valid 6-digit hex codes.

## 3. Copy on Click
- [ ] Click any swatch.
- [ ] Toast appears reading "Copied #XXXXXX!".
- [ ] Paste into a text field — clipboard contains the exact hex shown.
- [ ] Toast auto-dismisses after ~1.2 seconds.

## 4. Keyboard Accessibility
- [ ] Tab reaches the Generate button and swatches.
- [ ] Focused swatch shows a visible focus ring.
- [ ] Press Enter on a focused swatch — copies hex + shows toast.
- [ ] Press Space on a focused swatch — copies hex + shows toast (no page scroll).
- [ ] ArrowRight/ArrowDown moves focus to the next swatch.
- [ ] ArrowLeft/ArrowUp moves focus to the previous swatch.
- [ ] Arrow keys at the ends do not error (no wrap, stays put).

## 5. Contrast / Readability
- [ ] On very light swatches, hex text is dark and legible.
- [ ] On very dark swatches, hex text is light and legible.
- [ ] Text shadow keeps the label readable on mid-tone colors.

## 6. Responsive Layout
- [ ] Resize to <480px width — swatches shrink, layout stays in grid.
- [ ] Header text scales down and remains readable.
- [ ] No horizontal scrollbar appears.

## 7. Clipboard Fallback
- [ ] In a context without `navigator.clipboard` (older/insecure origin),
      copy still works via the textarea/execCommand fallback.

## 8. ARIA / Semantics
- [ ] `#palette` has role="list".
- [ ] Each swatch has role="button", tabindex="0", and aria-label "Copy color #XXXXXX".
- [ ] Toast has role="status" aria-live="polite" and is announced on copy.

## Result
- [ ] All cases pass — sign off and record browser/version tested.
