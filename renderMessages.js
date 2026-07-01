// Message rendering helpers (UI track)
// Provides newest-first list rendering utilities reused by app.js.

/** Escape text for safe HTML insertion. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Human-friendly relative time, falling back to a short date. */
export function relativeTime(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Build a single message list item element. */
export function createMessageItem(msg) {
  const li = document.createElement('li');
  li.className = 'message-item';
  li.dataset.id = msg.id;
  li.innerHTML = `
    <div class="message-meta">
      <span class="message-author">${escapeHtml(msg.author || 'anonymous')}</span>
      <span class="message-time" title="${escapeHtml(msg.created_at || '')}">${escapeHtml(relativeTime(msg.created_at))}</span>
    </div>
    <p class="message-content">${escapeHtml(msg.content)}</p>
  `;
  return li;
}

/**
 * Render a full list of messages newest-first into the target list.
 * Assumes `messages` is already ordered newest-first by the service.
 * Preserves a persistent empty-state node if present.
 */
export function renderMessageList(listEl, messages) {
  listEl.querySelectorAll('.message-item').forEach((n) => n.remove());
  messages.forEach((msg) => listEl.appendChild(createMessageItem(msg)));
}

/** Insert a newly posted message at the top (newest-first). */
export function prependMessage(listEl, msg) {
  const item = createMessageItem(msg);
  const firstItem = listEl.querySelector('.message-item');
  if (firstItem) {
    listEl.insertBefore(item, firstItem);
  } else {
    listEl.appendChild(item);
  }
  return item;
}

export default { escapeHtml, relativeTime, createMessageItem, renderMessageList, prependMessage };
