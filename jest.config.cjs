/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  collectCoverageFrom: ['src/**/*.js'],
};
