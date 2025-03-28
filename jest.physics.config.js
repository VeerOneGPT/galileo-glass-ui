/**
 * Jest configuration file specifically for physics tests
 * 
 * This configuration is optimized for testing physics calculations with higher performance expectations
 */
export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/animations/physics'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  testTimeout: 10000, // Longer timeout for performance tests
  collectCoverageFrom: [
    'src/animations/physics/**/*.{ts,tsx}',
    '!src/animations/physics/**/*.d.ts',
    '!src/animations/physics/examples/**/*',
    '!src/animations/physics/benchmarks/PhysicsEngineBenchmark.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  // Only run physics tests
  testMatch: [
    "<rootDir>/src/animations/physics/__tests__/**/*.test.ts",
    "<rootDir>/src/animations/physics/__tests__/**/*.test.tsx"
  ],
  verbose: true,
};