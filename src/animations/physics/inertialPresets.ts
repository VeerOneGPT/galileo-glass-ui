/**
 * Inertial Movement Presets
 * 
 * This file defines preset configurations for inertial movement physics.
 * These presets can be used with usePointerFollow, useInertialMovement, and related hooks.
 */

import { InertialMovement } from './inertialMovement';

/**
 * Configuration interface for InertialPresets
 */
export interface InertialMovementConfig {
  friction: number;
  mass: number;
  restThreshold: number;
  integration: 'verlet' | 'euler';
  preset: string;
  springConstant?: number; // Optional for elastic preset
}

/**
 * Standard presets for inertial movement physics
 */
export const InertialPresets: Record<string, InertialMovementConfig> = {
  // A balanced, smooth movement with moderate friction
  SMOOTH: {
    friction: 0.92,
    mass: 1,
    restThreshold: 0.05,
    integration: 'verlet',
    preset: 'SMOOTH'
  },

  // Bouncy motion with less friction
  BOUNCY: {
    friction: 0.85,
    mass: 1.2,
    restThreshold: 0.1, 
    integration: 'verlet',
    preset: 'BOUNCY'
  },

  // Slower, more deliberate motion with high friction
  SLOW: {
    friction: 0.95,
    mass: 1.5,
    restThreshold: 0.05,
    integration: 'euler',
    preset: 'SLOW'
  },

  // No easing, immediate positioning
  INSTANT: {
    friction: 1,
    mass: 0.5,
    restThreshold: 0.001,
    integration: 'euler',
    preset: 'INSTANT'
  },

  // Quick, responsive movement
  RESPONSIVE: {
    friction: 0.8,
    mass: 0.7,
    restThreshold: 0.1,
    integration: 'verlet',
    preset: 'RESPONSIVE'
  },

  // Heavy momentum with continued motion
  MOMENTUM: {
    friction: 0.97,
    mass: 2,
    restThreshold: 0.03,
    integration: 'verlet',
    preset: 'MOMENTUM'
  },

  // Elastic, springy motion
  ELASTIC: {
    friction: 0.88,
    mass: 1,
    restThreshold: 0.05,
    springConstant: 0.3,
    integration: 'verlet',
    preset: 'ELASTIC'
  },

  // Strong, forceful movement
  HEAVY: {
    friction: 0.93,
    mass: 3,
    restThreshold: 0.05,
    integration: 'euler',
    preset: 'HEAVY'
  }
};

/**
 * Create a custom inertial preset with your own parameters
 * 
 * @param config Base configuration to extend
 * @param overrides Properties to override in the base config
 * @returns A new InertialMovementConfig object
 */
export function createCustomInertialPreset(
  basePreset: string | InertialMovementConfig,
  overrides: Partial<InertialMovementConfig>
): InertialMovementConfig {
  const baseConfig = typeof basePreset === 'string' 
    ? { ...InertialPresets[basePreset] }
    : { ...basePreset };
    
  return {
    ...baseConfig,
    ...overrides,
    preset: overrides.preset || baseConfig.preset
  };
}