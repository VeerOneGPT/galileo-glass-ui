/**
 * Performance Monitoring System - Main Entry
 * 
 * Exports all performance monitoring components and utilities
 */

// Export types
export * from './types';

// Export metrics collection
export * from './metrics';

// Export analysis
export * from './analysis';

// Export main monitor
export * from './monitor';

// Export React hooks
export * from './hooks';

// Export examples
import PerformanceMonitorDemo from './examples/PerformanceMonitorDemo';
export { PerformanceMonitorDemo };

// Export singleton instance for convenience
import { performanceMonitor } from './monitor';
export { performanceMonitor };
export default performanceMonitor;