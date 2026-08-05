// index.js — entry point

// Mock browser globals for Node.js environment
if (typeof document === 'undefined') {
  global.document = {
    getElementById: () => ({
      value: '',
      innerHTML: '',
      addEventListener: () => {}
    }),
    createElement: (tag) => ({
      className: '',
      textContent: '',
      innerHTML: ''
    }),
    addEventListener: () => {}
  };
}

if (typeof window === 'undefined') {
  global.window = {};
}

try {
  require('./src/diff.js');
  console.log('App modules loaded successfully.');
} catch (err) {
  console.error('Failed to load app modules:', err);
  process.exit(1);
}
