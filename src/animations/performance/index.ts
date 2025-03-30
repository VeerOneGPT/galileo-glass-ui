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

// Device capabilities detection hooks
export { 
  default as useDeviceCapabilities, 
  useRefreshRate,
  useBatterySavingMode,
  useIsMobileDevice,
  useSupportsHighQualityAnimations,
  DeviceTier,
  DeviceType,
  type DeviceCapabilities
} from './useDeviceCapabilities';

// Quality tier management hook
export {
  default as useQualityTier,
  type QualityTierOptions
} from './useQualityTier';

// Export QualityTier enum and QualityFeatureFlags type from types.ts
export { 
  QualityTier, 
  type QualityFeatureFlags 
} from './types';

// Physics settings presets
export {
  default as usePhysicsSettings,
  getPhysicsSettings,
  applySpecializedPreset,
  createCustomPhysicsSettings,
  DEFAULT_PHYSICS_SETTINGS,
  PHYSICS_SETTINGS_PRESETS,
  SPECIALIZED_PHYSICS_PRESETS,
  type PhysicsSettings
} from './physicsSettings';

// Dynamic resolution scaling
export {
  default as useDynamicResolutionScaling,
  type ResolutionScalingConfig
} from './dynamicResolutionScaling';

// Performance monitoring and quality adjustment
export {
  default as usePerformanceMonitor,
  PerformanceMetricType,
  type PerformanceSample,
  type QualityAdjustmentOptions
} from './performanceMonitor';

// Export shared types
export * from './types';

// User animation preferences
export {
  default as useAnimationPreferences,
  PreferenceMode,
  type AnimationPreferences,
  type AnimationPreferencesOptions
} from './useAnimationPreferences';
