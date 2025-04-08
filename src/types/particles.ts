/**
 * Types for the Galileo Glass UI Particle System
 */

/**
 * Represents a 2D vector or point.
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Represents a range with minimum and maximum values.
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * Represents a range for a 2D vector property.
 */
export interface VectorRange {
  x: [number, number]; // [min, max]
  y: [number, number]; // [min, max]
}

/**
 * Configuration options for the Particle System emitter.
 */
export interface EmitterOptions {
  /** Position of the emitter. Can be coordinates, or a predefined location string. */
  position?: Vector2D | 'center' | 'top' | 'bottom' | 'left' | 'right' | 'random';
  /** Shape of the emitter area. */
  shape?: 'point' | 'circle' | 'rectangle' | 'line';
  /** Size of the emitter shape (e.g., radius for circle, width/height for rectangle). */
  size?: number | { width: number; height: number };
  /** Rate of particle emission per second. */
  emissionRate?: number;
  /** Emit a burst of particles at a specific time or instantly. */
  burst?: { count: number; time?: number; spread?: number };
  /** Maximum number of particles allowed in the system. */
  maxParticles?: number;
}

/**
 * Configuration options for individual particle properties.
 */
export interface ParticleProperties {
  /** Lifespan of particles in seconds (range). */
  lifespan?: Range;
  /** Initial velocity range for particles. */
  initialVelocity?: VectorRange;
  /** Initial rotation range in degrees. */
  initialRotation?: [number, number]; // [min, max]
  /** Initial scale range. */
  initialScale?: [number, number]; // [min, max]
  /** Scale factor change over particle lifetime [startScale, endScale]. */
  sizeOverLife?: [number, number];
  /** Color transition over particle lifetime [[startColors], [endColors]]. */
  colorOverLife?: [string[], string[]];
  /** Opacity transition over particle lifetime [startOpacity, endOpacity]. */
  opacityOverLife?: [number, number];
  /** Angular velocity range (degrees per second). */
  rotationSpeed?: [number, number]; // [min, max]
}

/** Configuration for an attractor or repulsor force point. */
export interface ParticleForcePoint {
    /** Position of the force point. */
    position: Vector2D;
    /** Strength of the force. Positive attracts, negative repels. */
    strength: number; 
    /** Radius within which the force is active. */
    radius: number;
    /** Optional: How strength decays with distance (e.g., 'linear', 'inverse', 'none'). Default: 'linear' */
    decay?: 'linear' | 'inverse' | 'none' | ((distance: number, radius: number) => number);
}

/**
 * Configuration options for physics forces acting on particles.
 */
export interface ParticlePhysics {
  /** Gravitational force applied to particles. Default: { x: 0, y: 0 } */
  gravity?: Vector2D;
  /** Friction/damping factor applied to velocity (0-1). Default: 0.01 */
  friction?: number;
  /** Constant wind force applied to particles. Default: { x: 0, y: 0 } */
  wind?: Vector2D;
  /** Maximum velocity a particle can reach. Default: 1000 */
  maxVelocity?: number;
  /** Array of attractor/repulsor points. */
  attractors?: ParticleForcePoint[];
  /** Array of repulsor points (alternative to using negative strength in attractors). */
  repulsors?: ParticleForcePoint[];
  /** Bounce factor when colliding with boundaries (0-1). */
  bounce?: number;
  /** Boundaries for particle movement. */
  bounds?: { top?: number; right?: number; bottom?: number; left?: number; behavior?: 'bounce' | 'destroy' | 'loop' };
}

/**
 * Configuration options for rendering particles.
 */
export interface ParticleRendering {
  /** URL for a custom particle texture/image. */
  particleImage?: string;
  /** CSS blend mode for particle rendering. */
  blendMode?: GlobalCompositeOperation; // Use standard Canvas blend modes
  /** Preferred rendering engine. */
  renderer?: 'canvas' | 'webgl';
  /** Z-index for the particle canvas. */
  zIndex?: number;
  /** Color tint to apply to particleImage */
  imageColorTint?: string;
}

/**
 * Main configuration object for the useParticleSystem hook.
 * Can also accept a preset name string.
 */
export type ParticleSystemOptions =
  | string // Preset name
  | ({
      /** Optional preset name to base the configuration on. */
      preset?: string;
      /** Emitter configuration. */
      emitter?: EmitterOptions;
      /** Particle property configuration. */
      particle?: ParticleProperties;
      /** Physics and forces configuration. */
      physics?: ParticlePhysics;
      /** Rendering configuration. */
      rendering?: ParticleRendering;
      /** Should the system start automatically? */
      autoStart?: boolean;
    } & Omit<EmitterOptions, 'position' | 'shape' | 'size' | 'emissionRate' | 'burst' | 'maxParticles'> // Allow top-level overrides for common emitter props
      & Partial<Pick<EmitterOptions, 'position' | 'shape' | 'size' | 'emissionRate' | 'burst' | 'maxParticles'>>);

/**
 * Represents the state and properties of a single particle.
 * Internal to the particle engine.
 */
export interface Particle {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  angularVelocity: number;
  scale: number;
  opacity: number;
  color: string; // Current interpolated color
  initialLifespan: number; // Total lifespan
  age: number; // Current age in seconds
  isAlive: boolean;

  // Properties for "over life" calculations
  initialScale: number;
  endScale: number;
  initialOpacity: number;
  endOpacity: number;
  initialColorSet: string[];
  endColorSet: string[];
}

/**
 * Controls returned by the useParticleSystem hook.
 */
export interface ParticleSystemControls {
  /** Starts or resumes the particle system animation. */
  start: () => void;
  /** Stops the particle system and clears all particles. */
  stop: () => void;
  /** Pauses the particle system animation. */
  pause: () => void;
  /** Updates the particle system options dynamically. */
  updateOptions: (newOptions: Partial<Exclude<ParticleSystemOptions, string>>) => void;
  /** Manually emits a burst of particles. */
  emitParticles: (count: number, position?: Vector2D | 'center' | 'random') => void;
  /** Clears all currently active particles without stopping the emitter. */
  clearParticles: () => void;
}

/**
 * State returned by the useParticleSystem hook.
 */
export interface ParticleSystemState {
  /** Whether the particle system's animation loop is currently active. */
  isActive: boolean;
  /** The current number of active particles. */
  particleCount: number;
}

/**
 * The complete return value of the useParticleSystem hook.
 */
export interface ParticleSystemResult extends ParticleSystemControls, ParticleSystemState {
  /** Ref to be attached to the container element where particles should be rendered. */
  containerRef: React.RefObject<HTMLElement>;
}

/**
 * Interface for Particle Presets
 */
export interface ParticlePreset {
  emitter?: EmitterOptions;
  particle?: ParticleProperties;
  physics?: ParticlePhysics;
  rendering?: ParticleRendering;
}

/**
 * Collection of available particle presets.
 */
export type ParticlePresetCollection = Record<string, ParticlePreset>; 