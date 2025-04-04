import baseConfig from './jest.config.js';

/**
 * Physics-specific Jest configuration
 * This extends the base config with settings optimized for physics tests
 */
export default {
  ...baseConfig,
  // Increase memory limits
  workerIdleMemoryLimit: '2GB',
  maxWorkers: 4,
  
  // Add additional setup files specific to physics tests
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv || []
  ],
  
  // Only test physics files
  testMatch: [
    "<rootDir>/src/animations/physics/__tests__/**/*.test.ts",
    "<rootDir>/src/animations/physics/__tests__/**/*.test.tsx"
  ],
  
  // Use 10 second timeout for physics tests
  testTimeout: 10000,
  
  // Ensure transformIgnorePatterns doesn't exclude our test files
  transformIgnorePatterns: [
    "/node_modules/(?!.*\\.mjs$)"
  ],
  
  // Log more verbose output
  verbose: true
};