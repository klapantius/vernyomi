module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // If your TypeScript files are in a specific directory, you can specify the path(s) here
    roots: ['<rootDir>/test'],
    // Transform settings tell Jest how to process different file types
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    // If you have tests in TypeScript files, you might want to include .ts and .tsx in moduleFileExtensions
    moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  };