/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  passWithNoTests: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/utils/seed.js',
    '!src/utils/seeders/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  maxWorkers: 1,
};
