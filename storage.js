/**
 * storage.js — localStorage helpers for session count.
 */

const SESSION_KEY = 'pomodoro_session_count';

export function getSessionCount() {
  return parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
}

export function incrementSessionCount() {
  const current = getSessionCount();
  localStorage.setItem(SESSION_KEY, String(current + 1));
  return current + 1;
}

export function resetSessionCount() {
  localStorage.setItem(SESSION_KEY, '0');
}
