/**
 * GameParticleSystem.ts
 * 
 * A specialized particle system for game-like events in Galileo Glass UI.
 * Provides dynamic particle effects for feedback and emphasis on user interactions.
 */

import { Vector } from './galileoPhysicsSystem';
import { AnimationCategory } from '../accessibility/MotionSensitivity';

/**
 * Game event types for particle effects
 */
export enum GameEventType {
  /** Success/achievement effect */
  SUCCESS = 'success',
  
  /** Error/failure effect */
  ERROR = 'error',
  
  /** Reward/celebration effect */
  REWARD = 'reward',
  
  /** Explosion effect */
  EXPLOSION = 'explosion',
  
  /** Sparkle/highlight effect */
  SPARKLE = 'sparkle',
  
  /** Trail effect behind moving objects */
  TRAIL = 'trail',
  
  /** Impact effect for collisions */
  IMPACT = 'impact',
  
  /** Collection effect for item pickup */
  COLLECT = 'collect',
  
  /** Energy/power effect */
  ENERGY = 'energy',
  
  /** Custom effect */
  CUSTOM = 'custom'
}

/**
 * Particle shape options
 */
export enum ParticleShape {
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  STAR = 'star',
  CUSTOM = 'custom',
  IMAGE = 'image'
}

/**
 * Particle animation type
 */
export enum ParticleAnimationType {
  FADE = 'fade',
  SCALE = 'scale',
  ROTATE = 'rotate',
  COLOR = 'color',
  COMBINED = 'combined'
}

/**
 * Emitter shape options
 */
export enum EmitterShape {
  POINT = 'point',
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  LINE = 'line'
}

/**
 * Individual particle properties
 */
export interface Particle {
  /** Unique ID */
  id: string;
  
  /** Position */
  position: Vector;
  
  /** Velocity */
  velocity: Vector;
  
  /** Acceleration */
  acceleration: Vector;
  
  /** Current rotation in degrees */
  rotation: number;
  
  /** Rotation velocity in degrees per second */
  rotationVelocity: number;
  
  /** Current size in pixels */
  size: number;
  
  /** Size change rate (pixels per second) */
  sizeVelocity: number;
  
  /** Current opacity (0-1) */
  opacity: number;
  
  /** Opacity change rate per second */
  opacityVelocity: number;
  
  /** Current color (RGB, HSL, etc) */
  color: string;
  
  /** Life (seconds remaining) */
  life: number;
  
  /** Total life span (seconds) */
  totalLife: number;
  
  /** Is this particle alive */
  alive: boolean;
  
  /** Shape of the particle */
  shape: ParticleShape;
  
  /** Custom CSS for rendering */
  customCSS?: string;
  
  /** For image shape, the image URL */
  imageUrl?: string;
  
  /** For custom shape, SVG path */
  svgPath?: string;
  
  /** Weight/mass for physics calculations */
  mass: number;
  
  /** Custom user data */
  userData?: any;
}

/**
 * Particle emitter configuration
 */
export interface ParticleEmitterConfig {
  /** Unique emitter ID */
  id?: string;
  
  /** Position of the emitter */
  position: Vector;
  
  /** Direction of emission (or range [min, max] in degrees) */
  direction?: number | [number, number];
  
  /** Speed of emitted particles (or range [min, max]) */
  speed?: number | [number, number];
  
  /** Shape of the emitter */
  shape?: EmitterShape;
  
  /** Size of emitter area */
  size?: number | { width: number, height: number };
  
  /** Emission rate (particles per second) */
  rate?: number;
  
  /** Burst count (for one-time bursts) */
  burstCount?: number;
  
  /** Minimum time between emissions (seconds) */
  minEmissionInterval?: number;
  
  /** Duration of emission (seconds, 0 = forever) */
  duration?: number;
  
  /** If true, emitter moves with its parent element */
  followElement?: boolean;
  
  /** Reference to a DOM element for positioning */
  element?: HTMLElement | string;
  
  /** Configuration for emitted particles */
  particleConfig?: Partial<ParticleConfig>;
  
  /** If true, emitter is active */
  active?: boolean;
  
  /** Forces that apply within this emitter's area */
  localForces?: Array<{
    type: 'gravity' | 'wind' | 'vortex' | 'attraction' | 'custom';
    strength: number;
    position?: Vector;
    direction?: Vector;
    radius?: number;
    /** For custom forces, a function that calculates the force */
    calculate?: (particle: Particle, emitter: ParticleEmitter) => Vector;
  }>;
}

/**
 * Individual particle configuration
 */
export interface ParticleConfig {
  /** Initial size (pixels) or range [min, max] */
  size: number | [number, number];
  
  /** Size change over time (pixels/second) */
  sizeVelocity?: number;
  
  /** Final size (if using size animation) */
  finalSize?: number;
  
  /** Initial rotation (degrees) */
  rotation?: number | [number, number];
  
  /** Rotation speed (degrees/second) */
  rotationVelocity?: number | [number, number];
  
  /** Life span in seconds or range [min, max] */
  life: number | [number, number];
  
  /** Initial opacity (0-1) */
  opacity?: number;
  
  /** Opacity change per second */
  opacityVelocity?: number;
  
  /** Final opacity (if using fade animation) */
  finalOpacity?: number;
  
  /** Shape of particles */
  shape?: ParticleShape;
  
  /** For custom shape, SVG path */
  svgPath?: string;
  
  /** For image shape, the image URL */
  imageUrl?: string;
  
  /** Mass for physics calculations */
  mass?: number;
  
  /** Affected by gravity */
  gravityScale?: number;
  
  /** Drag coefficient */
  drag?: number;
  
  /** Damping (velocity reduction per second) */
  damping?: number;
  
  /** Bounce coefficient when hitting boundaries */
  bounce?: number;
  
  /** Colors to use (for single color use array of length 1) */
  colors?: string[];
  
  /** For color animation, an array of colors to transition through */
  colorAnimation?: string[];
  
  /** Animation types to apply */
  animations?: ParticleAnimationType[];
  
  /** Custom CSS for rendering */
  customCSS?: string;
  
  /** If true, particle is rendered with blending */
  blending?: boolean;
  
  /** Z-index for rendering order */
  zIndex?: number;
  
  /** If true, particle scales with element */
  scaleWithElement?: boolean;
  
  /** Collision behavior */
  collision?: {
    /** If true, particles collide with boundaries */
    withBounds?: boolean;
    /** If true, particles collide with each other */
    withParticles?: boolean;
    /** Collision elasticity (0-1) */
    elasticity?: number;
  };
}

/**
 * Particle emitter class
 */
export class ParticleEmitter {
  /** Unique ID */
  id: string;
  
  /** Position */
  position: Vector;
  
  /** Direction range in radians */
  directionRange: [number, number];
  
  /** Speed range */
  speedRange: [number, number];
  
  /** Emitter shape */
  shape: EmitterShape;
  
  /** Emitter size */
  size: { width: number, height: number };
  
  /** Emission rate */
  rate: number;
  
  /** Burst count */
  burstCount: number;
  
  /** Min time between emissions */
  minEmissionInterval: number;
  
  /** Duration of emission */
  duration: number;
  
  /** Time the emitter has been active */
  activeTime = 0;
  
  /** Time since last emission */
  timeSinceLastEmission = 0;
  
  /** Particles emitted so far */
  particlesEmitted = 0;
  
  /** DOM element for positioning */
  element: HTMLElement | null = null;
  
  /** Follow element position */
  followElement: boolean;
  
  /** Particle configuration */
  particleConfig: Partial<ParticleConfig>;
  
  /** Is the emitter active */
  active: boolean;
  
  /** Local forces */
  localForces: Array<{
    type: 'gravity' | 'wind' | 'vortex' | 'attraction' | 'custom';
    strength: number;
    position?: Vector;
    direction?: Vector;
    radius?: number;
    calculate?: (particle: Particle, emitter: ParticleEmitter) => Vector;
  }>;
  
  /**
   * Create a new particle emitter
   */
  constructor(config: ParticleEmitterConfig) {
    // Set defaults and configuration
    this.id = config.id || `emitter_${Math.floor(Math.random() * 10000000)}`;
    this.position = { ...config.position };
    
    // Convert direction to range in radians
    if (config.direction === undefined) {
      this.directionRange = [0, Math.PI * 2]; // All directions
    } else if (Array.isArray(config.direction)) {
      this.directionRange = [
        config.direction[0] * Math.PI / 180, 
        config.direction[1] * Math.PI / 180
      ];
    } else {
      // Single direction with small variance
      const dir = config.direction * Math.PI / 180;
      this.directionRange = [dir - 0.1, dir + 0.1];
    }
    
    // Speed range
    if (config.speed === undefined) {
      this.speedRange = [50, 200]; // Default speed range
    } else if (Array.isArray(config.speed)) {
      this.speedRange = config.speed;
    } else {
      this.speedRange = [config.speed * 0.8, config.speed * 1.2];
    }
    
    // Emitter shape and size
    this.shape = config.shape || EmitterShape.POINT;
    
    if (typeof config.size === 'object') {
      this.size = config.size;
    } else if (typeof config.size === 'number') {
      this.size = { width: config.size, height: config.size };
    } else {
      this.size = { width: 0, height: 0 }; // Point emitter
    }
    
    // Emission properties
    this.rate = config.rate || 10; // Default 10 particles per second
    this.burstCount = config.burstCount || 0;
    this.minEmissionInterval = config.minEmissionInterval || 0;
    this.duration = config.duration || 0; // 0 = forever
    
    // Element following
    this.followElement = config.followElement || false;
    if (config.element) {
      if (typeof config.element === 'string') {
        this.element = document.querySelector(config.element);
      } else {
        this.element = config.element;
      }
    }
    
    // Particle configuration
    this.particleConfig = config.particleConfig || {};
    
    // Active state
    this.active = config.active !== undefined ? config.active : true;
    
    // Local forces
    this.localForces = config.localForces || [];
  }
  
  /**
   * Update emitter state
   * 
   * @param dt Time step in seconds
   * @returns Array of new particles or null if none
   */
  update(dt: number): Particle[] | null {
    if (!this.active) return null;
    
    // Update timers
    this.activeTime += dt;
    this.timeSinceLastEmission += dt;
    
    // Check if we've reached duration
    if (this.duration > 0 && this.activeTime >= this.duration) {
      this.active = false;
      return null;
    }
    
    // Update position if following an element
    if (this.followElement && this.element) {
      const rect = this.element.getBoundingClientRect();
      this.position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        z: 0
      };
    }
    
    // Check if we should emit new particles
    const newParticles: Particle[] = [];
    
    // Burst emission (one-time)
    if (this.burstCount > 0 && this.particlesEmitted === 0) {
      for (let i = 0; i < this.burstCount; i++) {
        newParticles.push(this.createParticle());
      }
      this.particlesEmitted += this.burstCount;
    }
    
    // Continuous emission based on rate
    if (this.rate > 0) {
      const particlesToEmit = Math.floor(this.rate * dt);
      const emissionProbability = this.rate * dt - particlesToEmit;
      
      // Ensure minimum interval between emissions
      if (this.timeSinceLastEmission >= this.minEmissionInterval) {
        // Emit whole particles
        for (let i = 0; i < particlesToEmit; i++) {
          newParticles.push(this.createParticle());
          this.particlesEmitted++;
        }
        
        // Probabilistic emission for partial particles
        if (Math.random() < emissionProbability) {
          newParticles.push(this.createParticle());
          this.particlesEmitted++;
        }
        
        if (newParticles.length > 0) {
          this.timeSinceLastEmission = 0;
        }
      }
    }
    
    return newParticles.length > 0 ? newParticles : null;
  }
  
  /**
   * Create a single particle based on emitter configuration
   */
  private createParticle(): Particle {
    const config = this.particleConfig;
    
    // Generate random direction based on range
    const direction = this.directionRange[0] + 
      Math.random() * (this.directionRange[1] - this.directionRange[0]);
    
    // Generate random speed based on range
    const speed = this.speedRange[0] + 
      Math.random() * (this.speedRange[1] - this.speedRange[0]);
    
    // Calculate velocity vector
    const velocity = {
      x: Math.cos(direction) * speed,
      y: Math.sin(direction) * speed,
      z: 0
    };
    
    // Generate position based on emitter shape
    let position: Vector;
    
    switch (this.shape) {
      case EmitterShape.CIRCLE:
        const radius = Math.random() * Math.min(this.size.width, this.size.height) / 2;
        const angle = Math.random() * Math.PI * 2;
        position = {
          x: this.position.x + Math.cos(angle) * radius,
          y: this.position.y + Math.sin(angle) * radius,
          z: 0
        };
        break;
        
      case EmitterShape.RECTANGLE:
        position = {
          x: this.position.x + (Math.random() - 0.5) * this.size.width,
          y: this.position.y + (Math.random() - 0.5) * this.size.height,
          z: 0
        };
        break;
        
      case EmitterShape.LINE:
        const t = Math.random();
        position = {
          x: this.position.x + (t - 0.5) * this.size.width,
          y: this.position.y + (t - 0.5) * this.size.height,
          z: 0
        };
        break;
        
      case EmitterShape.POINT:
      default:
        position = { ...this.position };
        break;
    }
    
    // Generate size
    let size: number;
    if (Array.isArray(config.size)) {
      size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
    } else if (typeof config.size === 'number') {
      size = config.size;
    } else {
      size = 10; // Default size
    }
    
    // Generate life span
    let life: number;
    if (Array.isArray(config.life)) {
      life = config.life[0] + Math.random() * (config.life[1] - config.life[0]);
    } else if (typeof config.life === 'number') {
      life = config.life;
    } else {
      life = 1; // Default 1 second
    }
    
    // Generate rotation
    let rotation: number;
    if (Array.isArray(config.rotation)) {
      rotation = config.rotation[0] + Math.random() * (config.rotation[1] - config.rotation[0]);
    } else if (typeof config.rotation === 'number') {
      rotation = config.rotation;
    } else {
      rotation = 0;
    }
    
    // Generate rotation velocity
    let rotationVelocity: number;
    if (Array.isArray(config.rotationVelocity)) {
      rotationVelocity = config.rotationVelocity[0] + 
        Math.random() * (config.rotationVelocity[1] - config.rotationVelocity[0]);
    } else if (typeof config.rotationVelocity === 'number') {
      rotationVelocity = config.rotationVelocity;
    } else {
      rotationVelocity = 0;
    }
    
    // Calculate size velocity if final size is specified
    let sizeVelocity = config.sizeVelocity || 0;
    if (config.finalSize !== undefined && life > 0) {
      sizeVelocity = (config.finalSize - size) / life;
    }
    
    // Calculate opacity velocity if final opacity is specified
    let opacityVelocity = config.opacityVelocity || 0;
    const initialOpacity = config.opacity !== undefined ? config.opacity : 1;
    if (config.finalOpacity !== undefined && life > 0) {
      opacityVelocity = (config.finalOpacity - initialOpacity) / life;
    }
    
    // Select random color from available colors
    let color = '#ffffff'; // Default white
    if (config.colors && config.colors.length > 0) {
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      color = config.colors[colorIndex];
    }
    
    // Generate unique ID
    const id = `particle_${Math.floor(Math.random() * 10000000)}`;
    
    // Create particle object
    return {
      id,
      position,
      velocity,
      acceleration: { x: 0, y: 0, z: 0 },
      rotation,
      rotationVelocity,
      size,
      sizeVelocity,
      opacity: initialOpacity,
      opacityVelocity,
      color,
      life,
      totalLife: life,
      alive: true,
      shape: config.shape || ParticleShape.CIRCLE,
      customCSS: config.customCSS,
      imageUrl: config.imageUrl,
      svgPath: config.svgPath,
      mass: config.mass || 1
    };
  }
}

/**
 * Game Particle System Configuration
 */
export interface GameParticleSystemConfig {
  /** Game event type */
  eventType?: GameEventType;
  
  /** Custom event name (for custom events) */
  customEventName?: string;
  
  /** Emitter configurations */
  emitters?: ParticleEmitterConfig[];
  
  /** Simulation boundaries */
  boundaries?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  
  /** Global forces */
  globalForces?: Array<{
    type: 'gravity' | 'wind' | 'vortex' | 'attraction' | 'custom';
    strength: number;
    position?: Vector;
    direction?: Vector;
    radius?: number;
    calculate?: (particle: Particle) => Vector;
  }>;
  
  /** Maximum particles to render */
  maxParticles?: number;
  
  /** Performance optimization level (0-1, higher = better performance but less quality) */
  performanceLevel?: number;
  
  /** Canvas element for rendering (if using canvas renderer) */
  canvas?: HTMLCanvasElement;
  
  /** Container element for DOM-based particles */
  container?: HTMLElement;
  
  /** Renderer type ('dom', 'canvas', 'webgl') */
  renderer?: 'dom' | 'canvas' | 'webgl';
  
  /** If true, uses hardware acceleration */
  gpuAccelerated?: boolean;
  
  /** If true, resizes with parent element */
  responsive?: boolean;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** If true, reduces particle count and effects for motion sensitivity */
  reducedMotion?: boolean;
  
  /** Callback when system is ready */
  onReady?: () => void;
  
  /** Callback when all particles have died and system is inactive */
  onComplete?: () => void;
  
  /** Callback every time a new particle is created */
  onParticleCreated?: (particle: Particle) => void;
  
  /** Callback when a particle dies */
  onParticleDeath?: (particle: Particle) => void;
}

/**
 * Predefined event configurations
 * (Configurations for different types of game events)
 */
export const EVENT_PRESETS: Record<GameEventType, GameParticleSystemConfig> = {
  [GameEventType.SUCCESS]: {
    eventType: GameEventType.SUCCESS,
    emitters: [
      {
        id: 'success-burst',
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.POINT,
        burstCount: 30,
        speed: [100, 300],
        particleConfig: {
          size: [4, 10],
          life: [0.6, 1.2],
          colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.9,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE, ParticleAnimationType.SCALE],
          finalSize: 0,
          damping: 0.8,
          gravityScale: 0.5
        }
      }
    ],
    maxParticles: 100,
    performanceLevel: 0.2,
    globalForces: [
      {
        type: 'gravity',
        strength: 300
      }
    ],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ATTENTION
  },
  
  [GameEventType.ERROR]: {
    eventType: GameEventType.ERROR,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.CIRCLE,
        size: 20,
        burstCount: 20,
        speed: [50, 150],
        particleConfig: {
          size: [5, 8],
          life: [0.5, 0.8],
          colors: ['#F44336', '#E91E63', '#FF5722'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.9,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE]
        }
      }
    ],
    maxParticles: 60,
    performanceLevel: 0.2,
    globalForces: [
      {
        type: 'gravity',
        strength: 200
      }
    ],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ESSENTIAL
  },
  
  [GameEventType.REWARD]: {
    eventType: GameEventType.REWARD,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.POINT,
        burstCount: 40,
        speed: [200, 400],
        particleConfig: {
          size: [8, 15],
          life: [1, 3],
          colors: ['#FFD700', '#FFC107', '#FFEB3B', '#FFFFFF'],
          shape: ParticleShape.STAR,
          opacity: 1,
          finalOpacity: 0,
          animations: [
            ParticleAnimationType.FADE, 
            ParticleAnimationType.ROTATE, 
            ParticleAnimationType.SCALE
          ],
          rotationVelocity: [30, 120],
          finalSize: 3
        }
      }
    ],
    maxParticles: 150,
    performanceLevel: 0.1,
    globalForces: [
      {
        type: 'gravity',
        strength: 150
      },
      {
        type: 'wind',
        strength: 50,
        direction: { x: 1, y: 0, z: 0 }
      }
    ],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ATTENTION
  },
  
  [GameEventType.EXPLOSION]: {
    eventType: GameEventType.EXPLOSION,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.POINT,
        burstCount: 50,
        speed: [200, 500],
        particleConfig: {
          size: [5, 20],
          life: [0.5, 1.5],
          colors: ['#FF5722', '#FF9800', '#FFEB3B', '#FFFFFF'],
          shape: ParticleShape.CIRCLE,
          opacity: 1,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE, ParticleAnimationType.SCALE],
          finalSize: 0,
          damping: 0.3
        }
      }
    ],
    maxParticles: 200,
    performanceLevel: 0.2,
    globalForces: [],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ATTENTION
  },
  
  [GameEventType.SPARKLE]: {
    eventType: GameEventType.SPARKLE,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.CIRCLE,
        size: 30,
        rate: 20,
        duration: 1,
        particleConfig: {
          size: [2, 6],
          life: [0.5, 1.5],
          colors: ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9'],
          shape: ParticleShape.STAR,
          opacity: 0.9,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE, ParticleAnimationType.SCALE],
          finalSize: 1,
          rotationVelocity: [60, 180]
        }
      }
    ],
    maxParticles: 100,
    performanceLevel: 0.1,
    globalForces: [],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.BACKGROUND
  },
  
  [GameEventType.TRAIL]: {
    eventType: GameEventType.TRAIL,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.POINT,
        rate: 30,
        followElement: true,
        particleConfig: {
          size: 6,
          finalSize: 0,
          life: [0.3, 0.8],
          colors: ['#2196F3', '#03A9F4', '#00BCD4'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.7,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE, ParticleAnimationType.SCALE],
          damping: 0.9
        }
      }
    ],
    maxParticles: 150,
    performanceLevel: 0.2,
    globalForces: [],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ACTIVE
  },
  
  [GameEventType.IMPACT]: {
    eventType: GameEventType.IMPACT,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.CIRCLE,
        size: 10,
        burstCount: 15,
        speed: [100, 300],
        direction: [0, 360],
        particleConfig: {
          size: [3, 8],
          life: [0.2, 0.6],
          colors: ['#9C27B0', '#673AB7', '#3F51B5', '#FFFFFF'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.8,
          finalOpacity: 0,
          animations: [ParticleAnimationType.FADE]
        }
      }
    ],
    maxParticles: 60,
    performanceLevel: 0.3,
    globalForces: [],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ACTIVE
  },
  
  [GameEventType.COLLECT]: {
    eventType: GameEventType.COLLECT,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.CIRCLE,
        size: 10,
        burstCount: 12,
        speed: [80, 150],
        particleConfig: {
          size: [5, 10],
          life: [0.5, 1],
          colors: ['#4CAF50', '#8BC34A', '#CDDC39'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.9,
          finalOpacity: 0,
          animations: [
            ParticleAnimationType.FADE, 
            ParticleAnimationType.SCALE
          ],
          finalSize: 0,
          damping: 0.5,
          rotationVelocity: 180
        }
      }
    ],
    maxParticles: 50,
    performanceLevel: 0.2,
    globalForces: [
      {
        type: 'gravity',
        strength: -100 // Negative for upward movement
      }
    ],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ACTIVE
  },
  
  [GameEventType.ENERGY]: {
    eventType: GameEventType.ENERGY,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        shape: EmitterShape.CIRCLE,
        size: 20,
        rate: 30,
        duration: 1.5,
        particleConfig: {
          size: [3, 8],
          life: [0.5, 1],
          colors: ['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'],
          shape: ParticleShape.CIRCLE,
          opacity: 0.7,
          finalOpacity: 0,
          animations: [
            ParticleAnimationType.FADE, 
            ParticleAnimationType.COLOR
          ],
          colorAnimation: ['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#3F51B5'],
          blending: true
        }
      }
    ],
    maxParticles: 150,
    performanceLevel: 0.2,
    globalForces: [
      {
        type: 'vortex',
        strength: 200,
        radius: 100
      }
    ],
    gpuAccelerated: true,
    reducedMotion: false,
    category: AnimationCategory.ATTENTION
  },
  
  [GameEventType.CUSTOM]: {
    eventType: GameEventType.CUSTOM,
    emitters: [
      {
        position: { x: 0, y: 0, z: 0 },
        particleConfig: {
          size: 5,
          life: 1,
          colors: ['#FFFFFF'],
          shape: ParticleShape.CIRCLE
        }
      }
    ]
  }
};

/**
 * Game particle system for interactive UI feedback and effects
 */
export class GameParticleSystem {
  /** System configuration */
  config: GameParticleSystemConfig;
  
  /** Particle emitters */
  emitters: Map<string, ParticleEmitter> = new Map();
  
  /** Active particles */
  particles: Particle[] = [];
  
  /** Is the system active */
  isActive = false;
  
  /** Is the system paused */
  isPaused = false;
  
  /** DOM container for particles */
  container: HTMLElement | null = null;
  
  /** Canvas element for rendering */
  canvas: HTMLCanvasElement | null = null;
  
  /** Canvas context for rendering */
  context: CanvasRenderingContext2D | null = null;
  
  /** Animation frame ID */
  animationFrameId: number | null = null;
  
  /** Last timestamp */
  lastTimestamp: number | null = null;
  
  /** Elements representing particles (for DOM renderer) */
  particleElements: Map<string, HTMLElement> = new Map();
  
  /** CSS styles element */
  styleElement: HTMLStyleElement | null = null;
  
  /** Callbacks */
  onReady: (() => void) | null = null;
  onComplete: (() => void) | null = null;
  onParticleCreated: ((particle: Particle) => void) | null = null;
  onParticleDeath: ((particle: Particle) => void) | null = null;
  
  /**
   * Create a new game particle system
   */
  constructor(config: GameParticleSystemConfig) {
    // Apply defaults to config
    this.config = {
      maxParticles: 200,
      performanceLevel: 0.2,
      renderer: 'dom',
      gpuAccelerated: true,
      responsive: true,
      reducedMotion: false,
      ...config
    };
    
    // Set callbacks
    this.onReady = config.onReady || null;
    this.onComplete = config.onComplete || null;
    this.onParticleCreated = config.onParticleCreated || null;
    this.onParticleDeath = config.onParticleDeath || null;
    
    // Initialize container element
    this.initializeContainer();
    
    // Initialize emitters
    this.initializeEmitters();
    
    // Initialize style element for CSS animations
    if (this.config.renderer === 'dom') {
      this.initializeStyles();
    }
    
    // Initialize canvas if using canvas renderer
    if (this.config.renderer === 'canvas' || this.config.renderer === 'webgl') {
      this.initializeCanvas();
    }
    
    // Ready callback
    if (this.onReady) {
      this.onReady();
    }
  }
  
  /**
   * Start the particle system animation
   */
  start(): void {
    if (this.isActive && !this.isPaused) return;
    
    this.isActive = true;
    this.isPaused = false;
    this.lastTimestamp = null;
    
    // Start animation loop
    this.update = this.update.bind(this);
    this.animationFrameId = requestAnimationFrame(this.update);
  }
  
  /**
   * Stop the particle system animation
   */
  stop(): void {
    this.isActive = false;
    this.isPaused = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clear all particles
    this.particles = [];
    
    // Clear DOM elements if using DOM renderer
    if (this.config.renderer === 'dom') {
      this.particleElements.forEach(element => {
        element.remove();
      });
      this.particleElements.clear();
    }
    
    // Clear canvas if using canvas renderer
    if (this.context && this.canvas) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  /**
   * Pause the particle system animation
   */
  pause(): void {
    if (!this.isActive || this.isPaused) return;
    
    this.isPaused = true;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Resume the particle system animation
   */
  resume(): void {
    if (!this.isActive || !this.isPaused) return;
    
    this.isPaused = false;
    this.lastTimestamp = null;
    
    this.animationFrameId = requestAnimationFrame(this.update);
  }
  
  /**
   * Update the particle system
   */
  private update(timestamp: number): void {
    if (!this.isActive || this.isPaused) return;
    
    // Calculate delta time
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // Cap at 100ms
    this.lastTimestamp = timestamp;
    
    // Update emitters and create new particles
    let anyEmitterActive = false;
    this.emitters.forEach(emitter => {
      const newParticles = emitter.update(dt);
      if (newParticles) {
        // Add new particles
        for (const particle of newParticles) {
          // Check if we can add more particles
          if (this.particles.length < (this.config.maxParticles || 200)) {
            this.particles.push(particle);
            
            // Create DOM element if using DOM renderer
            if (this.config.renderer === 'dom') {
              this.createParticleElement(particle);
            }
            
            // Particle created callback
            if (this.onParticleCreated) {
              this.onParticleCreated(particle);
            }
          }
        }
      }
      
      if (emitter.active) {
        anyEmitterActive = true;
      }
    });
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update life
      particle.life -= dt;
      if (particle.life <= 0) {
        particle.alive = false;
        
        // Remove DOM element if using DOM renderer
        if (this.config.renderer === 'dom') {
          const element = this.particleElements.get(particle.id);
          if (element) {
            element.remove();
            this.particleElements.delete(particle.id);
          }
        }
        
        // Particle death callback
        if (this.onParticleDeath) {
          this.onParticleDeath(particle);
        }
        
        // Remove particle
        this.particles.splice(i, 1);
        continue;
      }
      
      // Calculate forces
      this.applyForces(particle, dt);
      
      // Update position
      particle.position.x += particle.velocity.x * dt;
      particle.position.y += particle.velocity.y * dt;
      
      // Update rotation
      particle.rotation += particle.rotationVelocity * dt;
      
      // Update size
      particle.size += particle.sizeVelocity * dt;
      if (particle.size < 0) particle.size = 0;
      
      // Update opacity
      particle.opacity += particle.opacityVelocity * dt;
      if (particle.opacity < 0) particle.opacity = 0;
      if (particle.opacity > 1) particle.opacity = 1;
      
      // Check boundaries
      this.checkBoundaries(particle);
      
      // Update DOM element if using DOM renderer
      if (this.config.renderer === 'dom') {
        this.updateParticleElement(particle);
      }
    }
    
    // Render if using canvas renderer
    if (this.config.renderer === 'canvas' && this.context && this.canvas) {
      this.renderCanvas();
    }
    
    // Check if system is complete
    if (this.particles.length === 0 && !anyEmitterActive) {
      this.isActive = false;
      
      if (this.onComplete) {
        this.onComplete();
      }
      
      return;
    }
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.update);
  }
  
  /**
   * Apply forces to a particle
   */
  private applyForces(particle: Particle, dt: number): void {
    // Reset acceleration
    particle.acceleration = { x: 0, y: 0, z: 0 };
    
    // Apply global forces
    if (this.config.globalForces) {
      for (const force of this.config.globalForces) {
        switch (force.type) {
          case 'gravity':
            // Apply gravity
            particle.acceleration.y += force.strength;
            break;
            
          case 'wind':
            // Apply wind force
            if (force.direction) {
              particle.acceleration.x += force.direction.x * force.strength;
              particle.acceleration.y += force.direction.y * force.strength;
            } else {
              particle.acceleration.x += force.strength;
            }
            break;
            
          case 'vortex':
            if (force.position) {
              // Vector from center to particle
              const dx = particle.position.x - force.position.x;
              const dy = particle.position.y - force.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Only apply within radius
              if (!force.radius || distance < force.radius) {
                // Calculate strength based on distance
                const strength = force.radius 
                  ? force.strength * (1 - distance / force.radius) 
                  : force.strength;
                
                // Calculate tangential direction (perpendicular to radial)
                const tx = -dy;
                const ty = dx;
                
                // Normalize and scale by strength
                const mag = Math.sqrt(tx * tx + ty * ty);
                if (mag > 0) {
                  particle.acceleration.x += (tx / mag) * strength;
                  particle.acceleration.y += (ty / mag) * strength;
                }
              }
            }
            break;
            
          case 'attraction':
            if (force.position) {
              // Vector from particle to center
              const dx = force.position.x - particle.position.x;
              const dy = force.position.y - particle.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Only apply within radius if specified
              if (!force.radius || distance < force.radius) {
                // Inverse square law
                const strength = force.radius 
                  ? force.strength * (1 - distance / force.radius) 
                  : force.strength / (distance + 0.1);
                
                // Normalize and scale by strength
                if (distance > 0) {
                  particle.acceleration.x += (dx / distance) * strength;
                  particle.acceleration.y += (dy / distance) * strength;
                }
              }
            }
            break;
            
          case 'custom':
            if (force.calculate) {
              const customForce = force.calculate(particle);
              particle.acceleration.x += customForce.x;
              particle.acceleration.y += customForce.y;
              particle.acceleration.z += customForce.z;
            }
            break;
        }
      }
    }
    
    // Apply emitter local forces
    this.emitters.forEach(emitter => {
      if (emitter.localForces.length > 0) {
        const dx = particle.position.x - emitter.position.x;
        const dy = particle.position.y - emitter.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        for (const force of emitter.localForces) {
          // Only apply force within radius if specified
          if (force.radius && distance > force.radius) continue;
          
          switch (force.type) {
            case 'gravity':
              // Local gravity
              particle.acceleration.y += force.strength;
              break;
              
            case 'wind':
              // Local wind
              if (force.direction) {
                particle.acceleration.x += force.direction.x * force.strength;
                particle.acceleration.y += force.direction.y * force.strength;
              } else {
                particle.acceleration.x += force.strength;
              }
              break;
              
            case 'vortex':
              // Vector from center to particle
              const vx = dx;
              const vy = dy;
              
              // Calculate strength based on distance
              const vStrength = force.radius 
                ? force.strength * (1 - distance / force.radius) 
                : force.strength;
              
              // Calculate tangential direction (perpendicular to radial)
              const tx = -vy;
              const ty = vx;
              
              // Normalize and scale by strength
              const mag = distance;
              if (mag > 0) {
                particle.acceleration.x += (tx / mag) * vStrength;
                particle.acceleration.y += (ty / mag) * vStrength;
              }
              break;
              
            case 'attraction':
              // Vector from particle to center
              const ax = -dx;
              const ay = -dy;
              
              // Inverse square law
              const aStrength = force.radius 
                ? force.strength * (1 - distance / force.radius) 
                : force.strength / (distance + 0.1);
              
              // Apply force
              if (distance > 0) {
                particle.acceleration.x += (ax / distance) * aStrength;
                particle.acceleration.y += (ay / distance) * aStrength;
              }
              break;
              
            case 'custom':
              if (force.calculate) {
                const customForce = force.calculate(particle, emitter);
                particle.acceleration.x += customForce.x;
                particle.acceleration.y += customForce.y;
                particle.acceleration.z += customForce.z;
              }
              break;
          }
        }
      }
    });
    
    // Apply drag (air resistance)
    const drag = 0.01; // Default drag coefficient
    particle.acceleration.x -= particle.velocity.x * drag;
    particle.acceleration.y -= particle.velocity.y * drag;
    
    // Update velocity
    particle.velocity.x += particle.acceleration.x * dt;
    particle.velocity.y += particle.acceleration.y * dt;
    particle.velocity.z += particle.acceleration.z * dt;
  }
  
  /**
   * Check and handle boundary collisions
   */
  private checkBoundaries(particle: Particle): void {
    if (!this.config.boundaries) return;
    
    const bounce = 0.6; // Bounce coefficient
    
    // Left boundary
    if (this.config.boundaries.left !== undefined && 
        particle.position.x < this.config.boundaries.left) {
      particle.position.x = this.config.boundaries.left;
      particle.velocity.x = -particle.velocity.x * bounce;
    }
    
    // Right boundary
    if (this.config.boundaries.right !== undefined && 
        particle.position.x > this.config.boundaries.right) {
      particle.position.x = this.config.boundaries.right;
      particle.velocity.x = -particle.velocity.x * bounce;
    }
    
    // Top boundary
    if (this.config.boundaries.top !== undefined && 
        particle.position.y < this.config.boundaries.top) {
      particle.position.y = this.config.boundaries.top;
      particle.velocity.y = -particle.velocity.y * bounce;
    }
    
    // Bottom boundary
    if (this.config.boundaries.bottom !== undefined && 
        particle.position.y > this.config.boundaries.bottom) {
      particle.position.y = this.config.boundaries.bottom;
      particle.velocity.y = -particle.velocity.y * bounce;
    }
  }
  
  /**
   * Initialize the container element
   */
  private initializeContainer(): void {
    if (this.config.container) {
      // Use provided container
      this.container = this.config.container;
    } else {
      // Create a new container
      this.container = document.createElement('div');
      this.container.className = 'game-particle-container';
      this.container.style.position = 'absolute';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.style.pointerEvents = 'none';
      this.container.style.overflow = 'hidden';
      this.container.style.zIndex = '9999';
      
      document.body.appendChild(this.container);
    }
  }
  
  /**
   * Initialize the canvas element
   */
  private initializeCanvas(): void {
    if (this.config.canvas) {
      // Use provided canvas
      this.canvas = this.config.canvas;
    } else {
      // Create a new canvas
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-particle-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      
      if (this.container) {
        this.container.appendChild(this.canvas);
      } else {
        document.body.appendChild(this.canvas);
      }
    }
    
    // Set canvas size
    this.resizeCanvas();
    
    // Get context
    this.context = this.canvas.getContext('2d');
    
    // Add resize listener if responsive
    if (this.config.responsive) {
      window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
  }
  
  /**
   * Resize the canvas to match container
   */
  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    const parent = this.canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }
  
  /**
   * Initialize emitters
   */
  private initializeEmitters(): void {
    if (this.config.emitters) {
      for (const emitterConfig of this.config.emitters) {
        const emitter = new ParticleEmitter(emitterConfig);
        this.emitters.set(emitter.id, emitter);
      }
    }
  }
  
  /**
   * Initialize style element for CSS animations
   */
  private initializeStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.type = 'text/css';
    document.head.appendChild(this.styleElement);
    
    // Add basic particle styles
    this.styleElement.textContent = `
      .game-particle {
        position: absolute;
        pointer-events: none;
        will-change: transform, opacity;
        backface-visibility: hidden;
      }
    `;
  }
  
  /**
   * Create a DOM element for a particle
   */
  private createParticleElement(particle: Particle): void {
    if (!this.container) return;
    
    const element = document.createElement('div');
    element.className = 'game-particle';
    element.id = particle.id;
    
    // Initial positioning
    element.style.transform = `translate(${particle.position.x}px, ${particle.position.y}px) rotate(${particle.rotation}deg)`;
    element.style.opacity = particle.opacity.toString();
    element.style.width = `${particle.size}px`;
    element.style.height = `${particle.size}px`;
    
    // Set shape and color
    switch (particle.shape) {
      case ParticleShape.CIRCLE:
        element.style.borderRadius = '50%';
        element.style.backgroundColor = particle.color;
        break;
        
      case ParticleShape.SQUARE:
        element.style.backgroundColor = particle.color;
        break;
        
      case ParticleShape.TRIANGLE:
        element.style.width = '0';
        element.style.height = '0';
        element.style.borderLeft = `${particle.size / 2}px solid transparent`;
        element.style.borderRight = `${particle.size / 2}px solid transparent`;
        element.style.borderBottom = `${particle.size}px solid ${particle.color}`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case ParticleShape.STAR:
        element.style.backgroundColor = 'transparent';
        element.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        element.style.backgroundColor = particle.color;
        break;
        
      case ParticleShape.IMAGE:
        if (particle.imageUrl) {
          element.style.backgroundImage = `url(${particle.imageUrl})`;
          element.style.backgroundSize = 'contain';
          element.style.backgroundRepeat = 'no-repeat';
          element.style.backgroundPosition = 'center';
          element.style.backgroundColor = 'transparent';
        }
        break;
        
      case ParticleShape.CUSTOM:
        if (particle.customCSS) {
          element.style.cssText += particle.customCSS;
        }
        if (particle.svgPath) {
          element.style.backgroundColor = 'transparent';
          element.style.maskImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${particle.svgPath}" fill="black"/></svg>')`;
          element.style.webkitMaskImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${particle.svgPath}" fill="black"/></svg>')`;
          element.style.backgroundColor = particle.color;
        }
        break;
    }
    
    this.container.appendChild(element);
    this.particleElements.set(particle.id, element);
  }
  
  /**
   * Update a particle's DOM element
   */
  private updateParticleElement(particle: Particle): void {
    const element = this.particleElements.get(particle.id);
    if (!element) return;
    
    // Update position, rotation, size and opacity
    element.style.transform = `translate(${particle.position.x}px, ${particle.position.y}px) rotate(${particle.rotation}deg)`;
    element.style.opacity = particle.opacity.toString();
    
    // Update size if not a triangle (which uses borders for size)
    if (particle.shape !== ParticleShape.TRIANGLE) {
      element.style.width = `${particle.size}px`;
      element.style.height = `${particle.size}px`;
    } else {
      element.style.borderLeft = `${particle.size / 2}px solid transparent`;
      element.style.borderRight = `${particle.size / 2}px solid transparent`;
      element.style.borderBottom = `${particle.size}px solid ${particle.color}`;
    }
  }
  
  /**
   * Render particles to canvas
   */
  private renderCanvas(): void {
    if (!this.context || !this.canvas) return;
    
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw each particle
    for (const particle of this.particles) {
      this.context.save();
      
      // Set opacity
      this.context.globalAlpha = particle.opacity;
      
      // Set transform
      this.context.translate(particle.position.x, particle.position.y);
      this.context.rotate(particle.rotation * Math.PI / 180);
      
      // Draw based on shape
      switch (particle.shape) {
        case ParticleShape.CIRCLE:
          this.context.beginPath();
          this.context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          this.context.fillStyle = particle.color;
          this.context.fill();
          break;
          
        case ParticleShape.SQUARE:
          this.context.fillStyle = particle.color;
          this.context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          break;
          
        case ParticleShape.TRIANGLE:
          this.context.beginPath();
          this.context.moveTo(0, -particle.size / 2);
          this.context.lineTo(particle.size / 2, particle.size / 2);
          this.context.lineTo(-particle.size / 2, particle.size / 2);
          this.context.closePath();
          this.context.fillStyle = particle.color;
          this.context.fill();
          break;
          
        case ParticleShape.STAR:
          this.drawStar(this.context, 0, 0, 5, particle.size / 2, particle.size / 4);
          this.context.fillStyle = particle.color;
          this.context.fill();
          break;
          
        case ParticleShape.IMAGE:
          if (particle.imageUrl) {
            const img = new Image();
            img.src = particle.imageUrl;
            if (img.complete) {
              this.context.drawImage(img, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
            }
          }
          break;
          
        case ParticleShape.CUSTOM:
          if (particle.svgPath) {
            // Not easily supported in Canvas - would need SVG path parsing
            // Fallback to circle
            this.context.beginPath();
            this.context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            this.context.fillStyle = particle.color;
            this.context.fill();
          }
          break;
      }
      
      this.context.restore();
    }
  }
  
  /**
   * Draw a star shape on canvas
   */
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
  
  /**
   * Add a new emitter
   */
  addEmitter(config: ParticleEmitterConfig): string {
    const emitter = new ParticleEmitter(config);
    this.emitters.set(emitter.id, emitter);
    
    // Start the system if it's not already running
    if (!this.isActive) {
      this.start();
    }
    
    return emitter.id;
  }
  
  /**
   * Remove an emitter
   */
  removeEmitter(id: string): boolean {
    return this.emitters.delete(id);
  }
  
  /**
   * Update an emitter
   */
  updateEmitter(id: string, updates: Partial<ParticleEmitterConfig>): boolean {
    const emitter = this.emitters.get(id);
    if (!emitter) return false;
    
    // Update emitter properties
    if (updates.position) {
      emitter.position = { ...updates.position };
    }
    
    if (updates.direction !== undefined) {
      if (Array.isArray(updates.direction)) {
        emitter.directionRange = [
          updates.direction[0] * Math.PI / 180, 
          updates.direction[1] * Math.PI / 180
        ];
      } else {
        const dir = updates.direction * Math.PI / 180;
        emitter.directionRange = [dir - 0.1, dir + 0.1];
      }
    }
    
    if (updates.speed !== undefined) {
      if (Array.isArray(updates.speed)) {
        emitter.speedRange = updates.speed;
      } else {
        emitter.speedRange = [updates.speed * 0.8, updates.speed * 1.2];
      }
    }
    
    if (updates.rate !== undefined) {
      emitter.rate = updates.rate;
    }
    
    if (updates.burstCount !== undefined) {
      emitter.burstCount = updates.burstCount;
    }
    
    if (updates.duration !== undefined) {
      emitter.duration = updates.duration;
    }
    
    if (updates.active !== undefined) {
      emitter.active = updates.active;
    }
    
    if (updates.shape !== undefined) {
      emitter.shape = updates.shape;
    }
    
    if (updates.size !== undefined) {
      if (typeof updates.size === 'object') {
        emitter.size = updates.size;
      } else {
        emitter.size = { width: updates.size, height: updates.size };
      }
    }
    
    if (updates.followElement !== undefined) {
      emitter.followElement = updates.followElement;
    }
    
    if (updates.element !== undefined) {
      if (typeof updates.element === 'string') {
        emitter.element = document.querySelector(updates.element);
      } else {
        emitter.element = updates.element;
      }
    }
    
    if (updates.particleConfig !== undefined) {
      emitter.particleConfig = {
        ...emitter.particleConfig,
        ...updates.particleConfig
      };
    }
    
    return true;
  }
  
  /**
   * Trigger a one-time burst of particles
   */
  burst(position: Vector, config: Partial<GameParticleSystemConfig> = {}): void {
    // Configure a single burst
    const burstConfig: GameParticleSystemConfig = {
      ...this.config,
      ...config,
      emitters: [{
        position,
        burstCount: config.emitters && config.emitters[0] && config.emitters[0].burstCount 
          ? config.emitters[0].burstCount 
          : 20,
        particleConfig: config.emitters && config.emitters[0] && config.emitters[0].particleConfig 
          ? config.emitters[0].particleConfig 
          : this.config.emitters && this.config.emitters[0] && this.config.emitters[0].particleConfig
            ? this.config.emitters[0].particleConfig 
            : undefined
      }]
    };
    
    // Add the emitter
    this.addEmitter(burstConfig.emitters![0]);
    
    // Start if not already running
    if (!this.isActive) {
      this.start();
    }
  }
  
  /**
   * Create a trail effect following an element
   */
  createTrail(element: HTMLElement | string, config: Partial<GameParticleSystemConfig> = {}): string {
    // Configure trail emitter
    const trailConfig: ParticleEmitterConfig = {
      position: { x: 0, y: 0, z: 0 },
      followElement: true,
      element,
      rate: config.emitters && config.emitters[0] && config.emitters[0].rate 
        ? config.emitters[0].rate 
        : 15,
      particleConfig: config.emitters && config.emitters[0] && config.emitters[0].particleConfig 
        ? config.emitters[0].particleConfig 
        : EVENT_PRESETS[GameEventType.TRAIL].emitters![0].particleConfig
    };
    
    // Add the emitter
    const emitterId = this.addEmitter(trailConfig);
    
    // Start if not already running
    if (!this.isActive) {
      this.start();
    }
    
    return emitterId;
  }
  
  /**
   * Trigger a preset event effect
   */
  triggerEvent(eventType: GameEventType, position: Vector): void {
    // Get preset config
    const presetConfig = EVENT_PRESETS[eventType];
    
    if (!presetConfig || !presetConfig.emitters || presetConfig.emitters.length === 0) {
      console.warn(`No preset configuration found for event type: ${eventType}`);
      return;
    }
    
    // Copy emitter config and update position
    const emitterConfig: ParticleEmitterConfig = {
      ...presetConfig.emitters[0],
      position
    };
    
    // Add emitter
    this.addEmitter(emitterConfig);
    
    // Start if not already running
    if (!this.isActive) {
      this.start();
    }
  }
  
  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();
    
    // Remove event listeners
    if (this.config.responsive && this.canvas) {
      window.removeEventListener('resize', this.resizeCanvas);
    }
    
    // Remove DOM elements
    if (this.config.renderer === 'dom') {
      this.particleElements.forEach(element => {
        element.remove();
      });
      this.particleElements.clear();
    }
    
    // Remove style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Remove container if we created it
    if (this.container && !this.config.container) {
      this.container.remove();
      this.container = null;
    }
    
    // Remove canvas if we created it
    if (this.canvas && !this.config.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    
    // Clear references
    this.context = null;
    this.particles = [];
    this.emitters.clear();
  }
}

/**
 * Create a game particle system for a given event type
 * 
 * @param eventType The type of game event
 * @param config Additional configuration options
 */
export function createGameParticleSystem(
  eventType: GameEventType, 
  config: Partial<GameParticleSystemConfig> = {}
): GameParticleSystem {
  const presetConfig = EVENT_PRESETS[eventType] || {};
  
  // Merge preset config with provided config
  const finalConfig: GameParticleSystemConfig = {
    ...presetConfig,
    ...config,
    eventType // Ensure eventType is correctly set
  };
  
  return new GameParticleSystem(finalConfig);
}

/**
 * Helper function to get a predefined particle system configuration preset by event type.
 * This allows easy access to standard effect configurations.
 * 
 * @param eventType The type of game event preset to retrieve.
 * @returns The GameParticleSystemConfig for the specified event type, or an empty object if not found.
 */
export function getParticlePreset(eventType: GameEventType): Partial<GameParticleSystemConfig> {
  return EVENT_PRESETS[eventType] || {};
}

export default GameParticleSystem;