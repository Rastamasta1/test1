import { addMessage, getMessages } from './messageService.js';

const form = document.getElementById('guestbook-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const status = document.getElementById('form-status');
const list = document.getElementById('messages-list');
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(text, type) {
  status.textContent = text || '';
  status.className = 'status' + (type ? ' ' + type : '');
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
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (e) {
    return d.toLocaleString();
  }
}

function renderMessages(messages) {
  if (!messages || messages.length === 0) {
    list.innerHTML = '<li class="empty">No messages yet. Be the first to sign!</li>';
    return;
  }
  list.innerHTML = messages
    .map(function (m) {
      return (
        '<li class="message-card">' +
        '<div class="meta">' +
        '<span class="name">' + escapeHtml(m.name) + '</span>' +
        '<span class="time">' + escapeHtml(formatTime(m.created_at)) + '</span>' +
        '</div>' +
        '<p class="text">' + escapeHtml(m.message) + '</p>' +
        '</li>'
      );
    })
    .join('');
}

async function loadMessages() {
  try {
    const messages = await getMessages();
    renderMessages(messages);
  } catch (err) {
    list.innerHTML = '<li class="empty">Could not load messages.</li>';
    console.error(err);
  }
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    setStatus('Please fill in both your name and a message.', 'error');
    return;
  }

  submitBtn.disabled = true;
  setStatus('Signing...', '');

  try {
    await addMessage(name, message);
    setStatus('Thanks for signing the guestbook!', 'success');
    form.reset();
    await loadMessages();
  } catch (err) {
    setStatus('Something went wrong. Please try again.', 'error');
    console.error(err);
  } finally {
    submitBtn.disabled = false;
  }
});

loadMessages();
