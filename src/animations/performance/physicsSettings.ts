/**
 * Physics settings and presets for different quality tiers
 * 
 * Provides optimized physics parameters for each quality level,
 * ensuring consistent feel while scaling performance.
 */

import { useMemo } from 'react';
import { SpringConfig, SpringPresets } from '../physics/springPhysics';
import { QualityTier } from './types';
import { Vector2D } from '../physics/physicsCalculations';

/**
 * Physics simulation settings for animations
 */
export interface PhysicsSettings {
  /** Simulation update frequency in Hz */
  updateFrequency: number;
  
  /** Maximum physics steps per frame to prevent spiral of death */
  maxStepsPerFrame: number;
  
  /** Global gravity force vector */
  gravity: Vector2D;
  
  /** Global environment friction coefficient */
  friction: number;
  
  /** Restitution (bounciness) coefficient for collisions */
  restitution: number;
  
  /** Velocity threshold below which objects are considered at rest */
  restVelocityThreshold: number;
  
  /** Angular velocity threshold below which objects are considered at rest */
  restAngularVelocityThreshold: number;
  
  /** Whether to enable object sleeping for performance */
  enableSleeping: boolean;
  
  /** Number of frames an object must be below threshold to sleep */
  sleepFrameThreshold: number;
  
  /** Solver iterations for constraint resolution */
  solverIterations: number;
  
  /** Position correction strength (0-1) for preventing sinking */
  positionCorrectionStrength: number;
  
  /** Whether to use continuous collision detection for fast objects */
  useContinuousCollisionDetection: boolean;
  
  /** Distance threshold for spatial grid cell size */
  spatialGridCellSize: number;
  
  /** Whether to use spatial grid for broad-phase collision detection */
  useSpatialPartitioning: boolean;
  
  /** Resolution factor for physics simulation (1 = normal, 0.5 = half) */
  simulationResolution: number;
  
  /** Maximum simultaneous dynamic bodies in the simulation */
  maxDynamicBodies: number;
  
  /** Whether to use high-precision floating point for calculations */
  highPrecisionCalculations: boolean;
  
  /** Air resistance coefficient for physics objects */
  airResistance: number;
  
  /** Whether to use SIMD acceleration where available */
  useSIMD: boolean;
  
  /** Limit for spatial subdivision depth in complex scenes */
  maxSpatialDepth: number;
  
  /** Whether to use background Web Workers for physics calculations */
  useWebWorkers: boolean;
  
  /** Maximum allowed penetration before collision resolution */
  maxPenetrationDepth: number;
  
  /** Pre-solve collision warm starting strength */
  warmStartingStrength: number;
}

/**
 * Default physics settings for fallback
 */
export const DEFAULT_PHYSICS_SETTINGS: PhysicsSettings = {
  updateFrequency: 60,
  maxStepsPerFrame: 5,
  gravity: { x: 0, y: 9.8 },
  friction: 0.3,
  restitution: 0.2,
  restVelocityThreshold: 0.01,
  restAngularVelocityThreshold: 0.01,
  enableSleeping: true,
  sleepFrameThreshold: 60,
  solverIterations: 10,
  positionCorrectionStrength: 0.2,
  useContinuousCollisionDetection: false,
  spatialGridCellSize: 100,
  useSpatialPartitioning: true,
  simulationResolution: 1.0,
  maxDynamicBodies: 100,
  highPrecisionCalculations: false,
  airResistance: 0.02,
  useSIMD: true,
  maxSpatialDepth: 8,
  useWebWorkers: false,
  maxPenetrationDepth: 0.5,
  warmStartingStrength: 0.8
};

/**
 * Physics settings presets for each quality tier
 */
export const PHYSICS_SETTINGS_PRESETS: Record<QualityTier, PhysicsSettings> = {
  [QualityTier.MINIMAL]: {
    updateFrequency: 30,
    maxStepsPerFrame: 3,
    gravity: { x: 0, y: 9.8 },
    friction: 0.3,
    restitution: 0.2,
    restVelocityThreshold: 0.05,
    restAngularVelocityThreshold: 0.05,
    enableSleeping: true,
    sleepFrameThreshold: 30,
    solverIterations: 4,
    positionCorrectionStrength: 0.2,
    useContinuousCollisionDetection: false,
    spatialGridCellSize: 200,
    useSpatialPartitioning: true,
    simulationResolution: 0.5,
    maxDynamicBodies: 20,
    highPrecisionCalculations: false,
    airResistance: 0.05,
    useSIMD: false,
    maxSpatialDepth: 3,
    useWebWorkers: false,
    maxPenetrationDepth: 1.0,
    warmStartingStrength: 0.5
  },
  
  [QualityTier.LOW]: {
    updateFrequency: 45,
    maxStepsPerFrame: 4,
    gravity: { x: 0, y: 9.8 },
    friction: 0.3,
    restitution: 0.2,
    restVelocityThreshold: 0.03,
    restAngularVelocityThreshold: 0.03,
    enableSleeping: true,
    sleepFrameThreshold: 45,
    solverIterations: 6,
    positionCorrectionStrength: 0.2,
    useContinuousCollisionDetection: false,
    spatialGridCellSize: 150,
    useSpatialPartitioning: true,
    simulationResolution: 0.75,
    maxDynamicBodies: 50,
    highPrecisionCalculations: false,
    airResistance: 0.03,
    useSIMD: false,
    maxSpatialDepth: 5,
    useWebWorkers: false,
    maxPenetrationDepth: 0.8,
    warmStartingStrength: 0.6
  },
  
  [QualityTier.MEDIUM]: {
    updateFrequency: 60,
    maxStepsPerFrame: 5,
    gravity: { x: 0, y: 9.8 },
    friction: 0.3,
    restitution: 0.2,
    restVelocityThreshold: 0.01,
    restAngularVelocityThreshold: 0.01,
    enableSleeping: true,
    sleepFrameThreshold: 60,
    solverIterations: 10,
    positionCorrectionStrength: 0.2,
    useContinuousCollisionDetection: false,
    spatialGridCellSize: 100,
    useSpatialPartitioning: true,
    simulationResolution: 1.0,
    maxDynamicBodies: 100,
    highPrecisionCalculations: false,
    airResistance: 0.02,
    useSIMD: true,
    maxSpatialDepth: 8,
    useWebWorkers: false,
    maxPenetrationDepth: 0.5,
    warmStartingStrength: 0.8
  },
  
  [QualityTier.HIGH]: {
    updateFrequency: 90,
    maxStepsPerFrame: 6,
    gravity: { x: 0, y: 9.8 },
    friction: 0.3,
    restitution: 0.2,
    restVelocityThreshold: 0.005,
    restAngularVelocityThreshold: 0.005,
    enableSleeping: true,
    sleepFrameThreshold: 90,
    solverIterations: 15,
    positionCorrectionStrength: 0.2,
    useContinuousCollisionDetection: true,
    spatialGridCellSize: 75,
    useSpatialPartitioning: true,
    simulationResolution: 1.0,
    maxDynamicBodies: 200,
    highPrecisionCalculations: true,
    airResistance: 0.01,
    useSIMD: true,
    maxSpatialDepth: 10,
    useWebWorkers: true,
    maxPenetrationDepth: 0.3,
    warmStartingStrength: 0.9
  },
  
  [QualityTier.ULTRA]: {
    updateFrequency: 120,
    maxStepsPerFrame: 8,
    gravity: { x: 0, y: 9.8 },
    friction: 0.3,
    restitution: 0.2,
    restVelocityThreshold: 0.001,
    restAngularVelocityThreshold: 0.001,
    enableSleeping: true,
    sleepFrameThreshold: 120,
    solverIterations: 20,
    positionCorrectionStrength: 0.2,
    useContinuousCollisionDetection: true,
    spatialGridCellSize: 50,
    useSpatialPartitioning: true,
    simulationResolution: 1.25,
    maxDynamicBodies: 500,
    highPrecisionCalculations: true,
    airResistance: 0.01,
    useSIMD: true,
    maxSpatialDepth: 12,
    useWebWorkers: true,
    maxPenetrationDepth: 0.2,
    warmStartingStrength: 1.0
  }
};

/**
 * Specialized presets for common physics effects
 */
export const SPECIALIZED_PHYSICS_PRESETS = {
  /** Floaty, space-like physics (low gravity, low friction) */
  SPACE: {
    gravity: { x: 0, y: 0.5 },
    friction: 0.01,
    airResistance: 0.001,
    restitution: 0.5
  },
  
  /** Water-like physics (higher drag, medium gravity) */
  WATER: {
    gravity: { x: 0, y: 4.0 },
    friction: 0.4,
    airResistance: 0.1,
    restitution: 0.3
  },
  
  /** Bouncy physics (high restitution) */
  BOUNCY: {
    gravity: { x: 0, y: 9.8 },
    friction: 0.1,
    airResistance: 0.01,
    restitution: 0.9
  },
  
  /** Sticky physics (high friction, low restitution) */
  STICKY: {
    gravity: { x: 0, y: 9.8 },
    friction: 0.9,
    airResistance: 0.02,
    restitution: 0.1
  },
  
  /** Magnetic effect physics */
  MAGNETIC: {
    gravity: { x: 0, y: 0 },
    friction: 0.3,
    airResistance: 0.03,
    restitution: 0.2
  }
};

/**
 * Gets physics settings for a specific quality tier
 * @param qualityTier The target quality tier
 * @returns Physics settings for the specified tier
 */
export function getPhysicsSettings(qualityTier: QualityTier): PhysicsSettings {
  return PHYSICS_SETTINGS_PRESETS[qualityTier] || DEFAULT_PHYSICS_SETTINGS;
}

/**
 * Applies a specialized preset over base settings
 * @param baseSettings Base physics settings
 * @param specializedPreset Name of specialized preset to apply
 * @returns Modified physics settings
 */
export function applySpecializedPreset(
  baseSettings: PhysicsSettings,
  specializedPreset: keyof typeof SPECIALIZED_PHYSICS_PRESETS
): PhysicsSettings {
  const preset = SPECIALIZED_PHYSICS_PRESETS[specializedPreset];
  
  if (!preset) {
    return baseSettings;
  }
  
  return {
    ...baseSettings,
    ...preset
  };
}

/**
 * Creates custom physics settings by overriding base settings
 * @param baseSettings Base physics settings
 * @param overrides Custom overrides to apply
 * @returns Customized physics settings
 */
export function createCustomPhysicsSettings(
  baseSettings: PhysicsSettings,
  overrides: Partial<PhysicsSettings>
): PhysicsSettings {
  return {
    ...baseSettings,
    ...overrides
  };
}

/**
 * Hook that integrates with useQualityTier to provide physics settings
 */
export function usePhysicsSettings(
  qualityTier: QualityTier,
  specializedPreset?: keyof typeof SPECIALIZED_PHYSICS_PRESETS,
  customOverrides?: Partial<PhysicsSettings>
): PhysicsSettings {
  // Get base settings for the quality tier
  let settings = getPhysicsSettings(qualityTier);
  
  // Apply specialized preset if specified
  if (specializedPreset) {
    settings = applySpecializedPreset(settings, specializedPreset);
  }
  
  // Apply custom overrides if provided
  if (customOverrides) {
    settings = createCustomPhysicsSettings(settings, customOverrides);
  }
  
  return settings;
}

export default usePhysicsSettings; 