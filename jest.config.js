module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  clearMocks: true,
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  verbose: true,
};
