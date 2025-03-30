/**
 * Shared types for Animation Performance module
 */

import { DeviceTier } from './useDeviceCapabilities'; // Keep DeviceTier if needed by QualityTierOptions?

/**
 * Animation quality tier
 */
export enum QualityTier {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * Animation feature flags for different quality tiers
 */
export interface QualityFeatureFlags {
  maxParticles: number;
  blurEffects: boolean;
  reflectionEffects: boolean;
  shadowEffects: boolean;
  highPrecisionPhysics: boolean;
  depthEffects: boolean;
  maxPhysicsObjects: number;
  antiAliasing: boolean;
  textureScale: number;
  maxConcurrentAnimations: number;
  physicsHz: number;
  useSIMD: boolean;
  useWebGL: boolean;
}

// Add other shared types if identified later 