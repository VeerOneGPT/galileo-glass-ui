/**
 * Utility Functions
 *
 * Common utility functions for the Galileo Glass UI library.
 */

// Re-export from submodules
export * from './time';
// export * from './device'; // Not created yet
// export * from './math';   // Not created yet
// export * from './optimization'; // Ambiguous with performance
export * from './deviceCapabilities';
export * from './performance';
export * from './elementTypes';
export * from './themeHelpers';
export * from './fallback/strategies';
export { default as withFallbackStrategies } from './fallback/withFallbackStrategies';
