// Mode preset definitions — single source of truth for all durations and labels
export const MODES = {
  pomodoro: {
    label: 'Focus',
    duration: 25 * 60,   // seconds
    tabId: 'tab-pomodoro',
  },
  'short-break': {
    label: 'Short Break',
    duration: 5 * 60,
    tabId: 'tab-short-break',
  },
  'long-break': {
    label: 'Long Break',
    duration: 15 * 60,
    tabId: 'tab-long-break',
  },
};

// After this many pomodoros, take a long break
export const LONG_BREAK_INTERVAL = 4;

// Total pomodoro slots shown in the dot tracker
export const TOTAL_SLOTS = 4;
