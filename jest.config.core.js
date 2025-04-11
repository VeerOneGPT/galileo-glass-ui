import baseConfig from './jest.config.js';

/**
 * Jest configuration for core/non-component tests
 * Inherits from base config but uses a setup file that removes styled-components init.
 */
const coreConfig = {
  ...baseConfig,
  // Use the core-specific setup file (without jest-styled-components)
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.core.js'],
};

export default coreConfig; 