/**
 * app.js — Pomodoro Focus Timer
 * Sprint 1 + Sprint 2: countdown engine, work/break cycle, session persistence,
 * stats view, settings, tab switcher.
 */

// ─── Constants ───────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 628.318; // 2πr where r=100
const STORAGE_KEYS = {
  settings: 'pomo_settings',
  history:  'pomo_history',
  today:    'pomo_today',
};

const DEFAULT_SETTINGS = {
  work:              25,
  shortBreak:        5,
  longBreak:         15,
  longBreakInterval: 4,
  notifications:     false,
  sound:             true,
};

// Phase identifiers
const PHASE = {
  WORK:        'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK:  'longBreak',
};

// ─── State ───────────────────────────────────────────────────────────────────
let settings       = loadSettings();
let phase          = PHASE.WORK;
let totalSeconds   = settings.work * 60;
let remainSeconds  = totalSeconds;
let running        = false;
let intervalId     = null;
let sessionsDone   = 0;   // work sessions completed this cycle (for long-break)
let todaySessions  = loadTodaySessions();

// ─── DOM refs ────────────────────────────────────────────────────────────────
const elModeLabel    = document.getElementById('mode-label');
const elRingProgress = document.getElementById('ring-progress');
const elTimerDisplay = document.getElementById('timer-display');
const elBtnStart     = document.getElementById('btn-start-pause');
const elBtnReset     = document.getElementById('btn-reset');
const elBtnSkip      = document.getElementById('btn-skip');
const elSessionCount = document.getElementById('session-count');
const elPhaseDots    = document.getElementById('phase-dots');

// Stats
const elTotalFocus   = document.getElementById('total-focus-time');
const elStreak       = document.getElementById('streak-display');
const elBarChart     = document.getElementById('bar-chart');
const elBtnClear     = document.getElementById('btn-clear-history');

// Settings form
const elForm         = document.getElementById('settings-form');
const elSettingWork  = document.getElementById('setting-work');
const elSettingShort = document.getElementById('setting-short-break');
const elSettingLong  = document.getElementById('setting-long-break');
const elSettingInterval = document.getElementById('setting-long-break-interval');
const elSettingNotif = document.getElementById('setting-notifications');
const elSettingSound = document.getElementById('setting-sound');
const elSavedMsg     = document.getElementById('settings-saved-msg');

// Tabs
const tabBtns        = document.querySelectorAll('.tab-btn');
const views          = document.querySelectorAll('.view');

// ─── Persistence helpers ─────────────────────────────────────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : Object.assign({}, DEFAULT_SETTINGS);
  } catch { return Object.assign({}, DEFAULT_SETTINGS); }
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
}

/**
 * history shape: { 'YYYY-MM-DD': { sessions: N, minutes: N }, ... }
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed sample data for first load
  return seedSampleData();
}

function saveHistory(h) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h));
}

function seedSampleData() {
  const h = {};
  const today = dateKey(new Date());
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const sessions = Math.floor(Math.random() * 6) + 1;
    h[key] = { sessions, minutes: sessions * 25 };
  }
  saveHistory(h);
  return h;
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function loadTodaySessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.today);
    if (!raw) return { date: dateKey(new Date()), count: 0 };
    const obj = JSON.parse(raw);
    if (obj.date !== dateKey(new Date())) return { date: dateKey(new Date()), count: 0 };
    return obj;
  } catch { return { date: dateKey(new Date()), count: 0 }; }
}

function saveTodaySessions() {
  localStorage.setItem(STORAGE_KEYS.today, JSON.stringify(todaySessions));
}

// ─── Timer core ──────────────────────────────────────────────────────────────
function phaseDuration(p) {
  if (p === PHASE.WORK)        return settings.work * 60;
  if (p === PHASE.SHORT_BREAK) return settings.shortBreak * 60;
  return settings.longBreak * 60;
}

function phaseLabel(p) {
  if (p === PHASE.WORK)        return 'Work';
  if (p === PHASE.SHORT_BREAK) return 'Short Break';
  return 'Long Break';
}

function setPhase(p) {
  phase        = p;
  totalSeconds = phaseDuration(p);
  remainSeconds = totalSeconds;
  updateDisplay();
  updateModeStyle();
}

function tick() {
  if (remainSeconds <= 0) {
    completePhase();
    return;
  }
  remainSeconds--;
  updateDisplay();
}

function completePhase() {
  stopTimer();
  playAlert();
  sendNotification(phaseLabel(phase) + ' finished!');

  if (phase === PHASE.WORK) {
    sessionsDone++;
    todaySessions.count++;
    saveTodaySessions();
    recordSession(settings.work);
    updateSessionCount();
    buildPhaseDots();

    if (sessionsDone % settings.longBreakInterval === 0) {
      setPhase(PHASE.LONG_BREAK);
    } else {
      setPhase(PHASE.SHORT_BREAK);
    }
  } else {
    setPhase(PHASE.WORK);
  }

  // Auto-start next phase
  startTimer();
}

function startTimer() {
  if (running) return;
  running = true;
  elBtnStart.textContent = 'Pause';
  elBtnStart.setAttribute('aria-pressed', 'true');
  intervalId = setInterval(tick, 1000);
}

function stopTimer() {
  running = false;
  elBtnStart.textContent = 'Start';
  elBtnStart.setAttribute('aria-pressed', 'false');
  clearInterval(intervalId);
  intervalId = null;
}

function resetTimer() {
  stopTimer();
  remainSeconds = totalSeconds;
  updateDisplay();
}

function skipPhase() {
  stopTimer();
  // mirror completePhase logic without recording stats
  if (phase === PHASE.WORK) {
    sessionsDone++;
    if (sessionsDone % settings.longBreakInterval === 0) {
      setPhase(PHASE.LONG_BREAK);
    } else {
      setPhase(PHASE.SHORT_BREAK);
    }
  } else {
    setPhase(PHASE.WORK);
  }
  buildPhaseDots();
}

// ─── Display updaters ────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateDisplay() {
  const timeStr = formatTime(remainSeconds);
  elTimerDisplay.textContent = timeStr;
  document.title = `${timeStr} — ${phaseLabel(phase)} | Pomodoro`;

  // Ring progress
  const fraction = totalSeconds > 0 ? remainSeconds / totalSeconds : 1;
  const offset   = CIRCUMFERENCE * (1 - fraction);
  elRingProgress.style.strokeDashoffset = offset;
}

function updateModeStyle() {
  elModeLabel.textContent = phaseLabel(phase);
  document.body.dataset.phase = phase;
}

function updateSessionCount() {
  elSessionCount.textContent = todaySessions.count;
}

function buildPhaseDots() {
  elPhaseDots.innerHTML = '';
  const interval = settings.longBreakInterval;
  for (let i = 0; i < interval; i++) {
    const dot = document.createElement('span');
    dot.className = 'phase-dot' + (i < (sessionsDone % interval) ? ' done' : '');
    elPhaseDots.appendChild(dot);
  }
}

// ─── Sound & Notifications ───────────────────────────────────────────────────
function playAlert() {
  if (!settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.15, 0.30].forEach((delay, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = i === 2 ? 880 : 660;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch (e) { /* AudioContext not available */ }
}

function sendNotification(msg) {
  if (!settings.notifications) return;
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('Pomodoro', { body: msg, icon: '' });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ─── Stats view ──────────────────────────────────────────────────────────────
function recordSession(minutes) {
  const h   = loadHistory();
  const key = dateKey(new Date());
  if (!h[key]) h[key] = { sessions: 0, minutes: 0 };
  h[key].sessions++;
  h[key].minutes += minutes;
  saveHistory(h);
}

function renderStats() {
  const h      = loadHistory();
  const days   = last7Days();
  const maxSes = Math.max(1, ...days.map(d => (h[d] ? h[d].sessions : 0)));

  // Total focus time
  let totalMin = 0;
  Object.values(h).forEach(v => { totalMin += v.minutes || 0; });
  elTotalFocus.textContent = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
    : `${totalMin} min`;

  // Streak
  elStreak.textContent = computeStreak(h) + ' 🔥';

  // Bar chart
  elBarChart.innerHTML = '';
  days.forEach(key => {
    const entry    = h[key] || { sessions: 0, minutes: 0 };
    const fraction = entry.sessions / maxSes;
    const label    = shortDateLabel(key);

    const row = document.createElement('div');
    row.className = 'bar-row';

    const lbl = document.createElement('span');
    lbl.className = 'bar-label';
    lbl.textContent = label;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = (fraction * 100) + '%';
    fill.setAttribute('aria-label', `${entry.sessions} sessions`);

    const count = document.createElement('span');
    count.className = 'bar-count';
    count.textContent = entry.sessions > 0 ? entry.sessions : '';

    track.appendChild(fill);
    row.appendChild(lbl);
    row.appendChild(track);
    row.appendChild(count);
    elBarChart.appendChild(row);
  });
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dateKey(d));
  }
  return days;
}

function shortDateLabel(key) {
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
}

function computeStreak(h) {
  let streak = 0;
  const today = dateKey(new Date());
  let cursor  = new Date();
  // start from yesterday if today has no sessions yet
  if (!h[today] || h[today].sessions === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = dateKey(cursor);
    if (h[key] && h[key].sessions > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  // count today too if it has sessions
  if (h[today] && h[today].sessions > 0 && dateKey(cursor) !== today) {
    // already counted via loop
  }
  return streak;
}

// ─── Settings view ───────────────────────────────────────────────────────────
function populateSettingsForm() {
  elSettingWork.value     = settings.work;
  elSettingShort.value    = settings.shortBreak;
  elSettingLong.value     = settings.longBreak;
  elSettingInterval.value = settings.longBreakInterval;
  elSettingNotif.checked  = settings.notifications;
  elSettingSound.checked  = settings.sound;
}

function applySettingsFromForm() {
  const w  = parseInt(elSettingWork.value,     10);
  const sb = parseInt(elSettingShort.value,    10);
  const lb = parseInt(elSettingLong.value,     10);
  const li = parseInt(elSettingInterval.value, 10);

  if (!w || !sb || !lb || !li) return false;

  settings.work              = Math.min(120, Math.max(1, w));
  settings.shortBreak        = Math.min(60,  Math.max(1, sb));
  settings.longBreak         = Math.min(120, Math.max(1, lb));
  settings.longBreakInterval = Math.min(10,  Math.max(1, li));
  settings.notifications     = elSettingNotif.checked;
  settings.sound             = elSettingSound.checked;

  saveSettings(settings);

  // Re-init current phase duration (reset timer)
  stopTimer();
  totalSeconds  = phaseDuration(phase);
  remainSeconds = totalSeconds;
  updateDisplay();
  buildPhaseDots();

  if (settings.notifications) requestNotificationPermission();
  return true;
}

// ─── Tab switching ───────────────────────────────────────────────────────────
function switchTab(tabId) {
  tabBtns.forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
  views.forEach(view => {
    const active = view.id === 'view-' + tabId;
    view.classList.toggle('active', active);
    view.hidden = !active;
  });
  if (tabId === 'stats')    renderStats();
  if (tabId === 'settings') populateSettingsForm();
}

// ─── Event listeners ─────────────────────────────────────────────────────────
elBtnStart.addEventListener('click', () => {
  if (running) stopTimer(); else startTimer();
});

elBtnReset.addEventListener('click', resetTimer);

elBtnSkip.addEventListener('click', skipPhase);

elForm.addEventListener('submit', e => {
  e.preventDefault();
  const ok = applySettingsFromForm();
  if (ok) {
    elSavedMsg.textContent = '✓ Settings saved';
    setTimeout(() => { elSavedMsg.textContent = ''; }, 2500);
  }
});

elBtnClear.addEventListener('click', () => {
  if (confirm('Clear all session history? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEYS.history);
    todaySessions = { date: dateKey(new Date()), count: 0 };
    saveTodaySessions();
    updateSessionCount();
    renderStats();
  }
});

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
function init() {
  setPhase(PHASE.WORK);
  updateSessionCount();
  buildPhaseDots();
  populateSettingsForm();
  // Ensure seeded history exists
  loadHistory();
}

init();
