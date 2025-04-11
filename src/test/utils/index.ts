/**
 * Test Utilities Index
 * 
 * Central export point for all test utilities
 */

// Import the modules with default exports
import animationTestUtils from './animationTestUtils';
import styleProcessingTestUtils from './styleProcessingTestUtils';
import timingProviderTestUtils from './timingProviderTestUtils';

// Import other modules without default exports
import * as componentTestUtils from './component-test-utils';
import * as hookTestUtils from './hook-test-utils';
import * as physicsTestUtils from './physics-test-utils';
import * as testUtils from './test-utils';

// Re-export with namespace to avoid name conflicts
export * as animationUtils from './animationTestUtils';
export * as styleProcessingUtils from './styleProcessingTestUtils';
export * as timingProviderUtils from './timingProviderTestUtils';
export * as componentUtils from './component-test-utils';
export * as hookUtils from './hook-test-utils';
export * as physicsUtils from './physics-test-utils';
export * as baseUtils from './test-utils';

// Export direct functions from modules with default exports for convenience
export {
  testWithAnimationControl,
  setupAnimationTestEnvironment,
  waitSafelyFor,
  createMockAnimationController,
} from './animationTestUtils';

export {
  createMockStyleProcessor,
  createMockStyleAdapter,
  testWithStyleProcessing,
  createStyleSnapshot,
} from './styleProcessingTestUtils';

export {
  createMockTimingProvider,
  testWithControlledTiming,
} from './timingProviderTestUtils';

/**
 * One-stop import for all test utilities
 * 
 * @example
 * ```ts
 * import { testWithAnimationControl, testWithStyleProcessing } from 'src/test/utils';
 * 
 * test('my component animates correctly', async () => {
 *   await testWithAnimationControl(async (animationControl) => {
 *     // Test code here
 *   });
 * });
 * ```
 */
export default {
  // From modules with default exports
  ...animationTestUtils,
  ...styleProcessingTestUtils,
  ...timingProviderTestUtils,
  
  // From modules without default exports
  componentUtils: componentTestUtils,
  hookUtils: hookTestUtils,
  physicsUtils: physicsTestUtils,
  baseUtils: testUtils,
}; 