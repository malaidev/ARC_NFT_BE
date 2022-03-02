/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'app'],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory:'reports/results',
      outputName:'test-results.xml',
    } ]
  ]
};