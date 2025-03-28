/**
 * Animation Performance Optimizations
 *
 * Utilities for optimizing animation performance.
 */

// Export GPU acceleration utilities
export * from './GPUAcceleration';

// Export DOM batcher for batching DOM operations
export { 
  domBatcher,
  DomBatcher,
  DomOperationType,
  BatchPriority,
  type DomTask,
  type DomBatch,
  type DomBatcherOptions
} from './DomBatcher';

// Export Transform Consolidator for optimizing transforms
export {
  transformConsolidator,
  TransformConsolidator,
  TransformType,
  type TransformOptions,
  type TransformOperation,
  type ElementTransformState
} from './TransformConsolidator';

// Export example components
export { default as DomBatcherExample } from './examples/DomBatcherExample';
export { default as TransformConsolidatorExample } from './examples/TransformConsolidatorExample';
export { default as GPUAccelerationExample } from './examples/GPUAccelerationExample';
