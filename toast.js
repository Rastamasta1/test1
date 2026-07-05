// Toast / notification component for the feedback wall app.
// Shows transient messages (success, error, info) in a fixed stack.
//
// Usage:
//   import { showToast } from './toast.js';
//   showToast('Thanks for your feedback!', { type: 'success' });
//   showToast('Something went wrong.', { type: 'error', duration: 6000 });

const DEFAULT_DURATION = 4000;
let containerEl = null;

function ensureContainer() {
  if (containerEl && document.body.contains(containerEl)) {
    return containerEl;
  }
  containerEl = document.createElement('div');
  containerEl.className = 'toast-container';
  containerEl.setAttribute('role', 'region');
  containerEl.setAttribute('aria-label', 'Notifications');
  containerEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(containerEl);
  return containerEl;
}

// Show a toast message.
// options.type: 'success' | 'error' | 'info' (default 'info')
// options.duration: ms before auto-dismiss (default 4000; <= 0 stays until dismissed)
// Returns a dismiss() function to remove it early.
export function showToast(message, options = {}) {
  const type = options.type || 'info';
  const duration = typeof options.duration === 'number' ? options.duration : DEFAULT_DURATION;

  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'success' ? '\u2714' : type === 'error' ? '\u2716' : '\u2139';

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message || '';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.textContent = '\u00d7';

  toast.append(icon, text, closeBtn);
  container.appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  let timer = null;

  function dismiss() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-leaving');
    const remove = () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (container.childElementCount === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
        containerEl = null;
      }
    };
    toast.addEventListener('transitionend', remove, { once: true });
    // Fallback removal in case transitionend doesn't fire
    setTimeout(remove, 400);
  }

  closeBtn.addEventListener('click', dismiss);

  if (duration > 0) {
    timer = setTimeout(dismiss, duration);
  }

  return dismiss;
}
