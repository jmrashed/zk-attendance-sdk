/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
  // Keep integration-style tests from hanging forever on network issues.
  testTimeout: 30_000,
  clearMocks: true,
};
