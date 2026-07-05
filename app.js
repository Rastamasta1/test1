// Random hex color generator utilities.

// Returns a random hex color string, e.g. "#a3f2c1".
function randomHex() {
  const n = Math.floor(Math.random() * 0x1000000);
  return '#' + n.toString(16).padStart(6, '0');
}

// Returns an array of `count` random hex color strings.
function randomPalette(count = 5) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(randomHex());
  }
  return colors;
}

// Parses a hex color string into {r, g, b} (0-255).
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

// Returns the relative luminance (0-1) of a hex color using the WCAG formula.
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// Returns a readable text color (dark or light) for the given background hex.
function contrastColor(hex) {
  return luminance(hex) > 0.5 ? '#18181b' : '#ffffff';
}

// Copies the given text to the clipboard.
// Returns a Promise that resolves to true on success, false on failure.
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

// Legacy fallback using a temporary textarea + execCommand.
function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

// Shows the "Copied!" toast briefly.
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (message) toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 1200);
}

// Builds a swatch DOM element for a given hex color.
// The swatch shows the hex code and copies it to the clipboard on click.
function createSwatch(hex) {
  const swatch = document.createElement('div');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = hex;
  swatch.setAttribute('role', 'button');
  swatch.setAttribute('tabindex', '0');
  swatch.setAttribute('aria-label', 'Copy color ' + hex);

  const label = document.createElement('span');
  label.textContent = hex;
  // Contrast-aware label: transparent background, adaptive text color.
  const textColor = contrastColor(hex);
  label.style.color = textColor;
  label.style.background = 'transparent';
  label.style.boxShadow = 'none';
  // Subtle shadow to keep text legible against similar-tone areas.
  label.style.textShadow = textColor === '#ffffff'
    ? '0 1px 2px rgba(0,0,0,0.55)'
    : '0 1px 2px rgba(255,255,255,0.55)';
  swatch.appendChild(label);

  const copy = () => {
    copyToClipboard(hex).then((ok) => {
      if (ok) showToast('Copied ' + hex + '!');
    });
  };

  swatch.addEventListener('click', copy);
  swatch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copy();
      return;
    }
    // Arrow-key navigation between swatches for keyboard users.
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = swatch.nextElementSibling;
      if (next) next.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = swatch.previousElementSibling;
      if (prev) prev.focus();
    }
  });

  return swatch;
}

// Renders an array of hex colors as swatches into the #palette container.
// Clears any existing swatches first. If `focusFirst` is true, moves keyboard
// focus to the first swatch (used after user-initiated generation).
function renderPalette(colors, focusFirst) {
  const container = document.getElementById('palette');
  if (!container) return;
  container.innerHTML = '';
  colors.forEach((hex) => {
    container.appendChild(createSwatch(hex));
  });
  if (focusFirst && container.firstElementChild) {
    container.firstElementChild.focus();
  }
}

// Generates a new palette and renders it.
function generateAndRender(focusFirst) {
  renderPalette(randomPalette(5), focusFirst);
}

// Wire up the generate button and show an initial palette on load.
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-btn');
  if (btn) {
    // Focus the first swatch after a user-triggered generation for keyboard flow.
    btn.addEventListener('click', () => generateAndRender(true));
  }
  // Initial render on load should not steal focus.
  generateAndRender(false);
});

// Expose for use by UI logic (added in a later task).
window.randomHex = randomHex;
window.randomPalette = randomPalette;
window.hexToRgb = hexToRgb;
window.luminance = luminance;
window.contrastColor = contrastColor;
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.createSwatch = createSwatch;
window.renderPalette = renderPalette;
