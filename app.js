import { fetchMessages, insertMessage } from './dataService.js';

const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('name-input');
const messageInput = document.getElementById('message-input');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('form-status');
const listEl = document.getElementById('messages-list');

function setStatus(text, type) {
  statusEl.textContent = text || '';
  statusEl.className = 'status' + (type ? ' ' + type : '');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
}

function renderMessages(messages) {
  listEl.innerHTML = '';

  if (!messages || messages.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No messages yet. Be the first to sign the guestbook!';
    listEl.appendChild(li);
    return;
  }

  for (const msg of messages) {
    const li = document.createElement('li');
    li.className = 'message';
    li.innerHTML =
      '<div class="message-head">' +
        '<span class="message-name">' + escapeHtml(msg.name) + '</span>' +
        '<span class="message-time">' + escapeHtml(formatTime(msg.created_at)) + '</span>' +
      '</div>' +
      '<p class="message-body">' + escapeHtml(msg.message) + '</p>';
    listEl.appendChild(li);
  }
}

async function loadMessages() {
  try {
    const messages = await fetchMessages();
    renderMessages(messages);
  } catch (err) {
    listEl.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Could not load messages. Please try again later.';
    listEl.appendChild(li);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    setStatus('Please enter both your name and a message.', 'error');
    return;
  }

  submitBtn.disabled = true;
  setStatus('Posting your message...', '');

  try {
    await insertMessage(name, message);
    messageInput.value = '';
    setStatus('Thanks for signing the guestbook!', 'success');
    await loadMessages();
  } catch (err) {
    setStatus('Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

loadMessages();
