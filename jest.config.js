module.exports = {
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/config/**',
    '!src/public/**',
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
