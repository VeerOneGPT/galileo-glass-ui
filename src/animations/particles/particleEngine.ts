import { 
  Vector2D, 
  Particle as ParticleType, 
  ParticleSystemOptions, 
  ParticlePresetCollection,
  EmitterOptions,
  ParticleProperties,
  ParticlePhysics,
  ParticleRendering,
  Range,
  VectorRange,
  ParticlePreset,
  ParticleForcePoint
} from '../../types/particles';
import { QualityTier } from '../../types/accessibility'; // Add import for QualityTier
// import { interpolateColor, getRandomColor } from '../../utils/colorUtils'; // Assuming color utils exist
// import { lerp, randomInRange, getRandomColor, interpolateColor } from 'src/utils/mathUtils'; 

// Re-export the Particle type for renderers
export type Particle = ParticleType;

// --- TEMPORARY Math Utils (Define before use) --- 
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};
const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
};
const getRandomColor = (colors: string[]): string => {
    if (!colors || colors.length === 0) return '#ffffff';
    return colors[Math.floor(Math.random() * colors.length)];
};
const interpolateColor = (startColors: string[], endColors: string[], progress: number): string => {
    const t = Math.max(0, Math.min(1, progress));
    const startHex = getRandomColor(startColors);
    const endHex = getRandomColor(endColors) || startHex;
    const startRgb = hexToRgb(startHex);
    const endRgb = hexToRgb(endHex);
    if (!startRgb || !endRgb) return startHex;
    const r = Math.round(lerp(startRgb.r, endRgb.r, t));
    const g = Math.round(lerp(startRgb.g, endRgb.g, t));
    const b = Math.round(lerp(startRgb.b, endRgb.b, t));
    return rgbToHex(r, g, b);
};
// --- END TEMPORARY --- 

// Helper for vector length
const vectorLength = (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y);
// Helper to normalize a vector
const normalizeVector = (v: Vector2D): Vector2D => {
    const len = vectorLength(v);
    return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
};

// Define defaults for nested structures explicitly
const DEFAULT_PHYSICS_OPTIONS: Required<ParticlePhysics> = {
    gravity: { x: 0, y: 0 },
    friction: 0.01,
    wind: { x: 0, y: 0 },
    maxVelocity: 1000,
    attractors: [],
    repulsors: [],
    bounce: 0.5,
    bounds: null,
};
const DEFAULT_EMITTER_OPTIONS: Required<EmitterOptions> = {
    position: { x: 0.5, y: 0.5 }, 
    shape: 'point',
    size: 0,
    emissionRate: 10,
    burst: null,
    maxParticles: 500,
    // initialRotation: [0, 0], // Removed based on potential type issues
    // rotationSpeed: [0, 0], // Removed based on potential type issues
};
const DEFAULT_PARTICLE_PROPERTIES: Required<ParticleProperties> = {
    lifespan: { min: 1, max: 3 },
    initialVelocity: { x: [-50, 50], y: [-50, 50] },
    initialRotation: [0, 0],
    rotationSpeed: [0, 0],
    initialScale: [1, 1],
    sizeOverLife: [1, 1],
    opacityOverLife: [1, 0],
    colorOverLife: [ ['#ffffff'], ['#000000'] ], 
    // Removed endScale, endOpacity, endColorSet, initialColorSet, initialOpacity based on errors
};
const DEFAULT_RENDERING_OPTIONS: Required<ParticleRendering> = {
    particleImage: '',
    blendMode: 'source-over',
    renderer: 'canvas',
    zIndex: 0, 
    imageColorTint: '#ffffff',
};

// Define top-level defaults
const DEFAULT_SYSTEM_OPTIONS: Exclude<ParticleSystemOptions, string> = {
   emitter: DEFAULT_EMITTER_OPTIONS as EmitterOptions, 
   particle: DEFAULT_PARTICLE_PROPERTIES as ParticleProperties,
   physics: DEFAULT_PHYSICS_OPTIONS as ParticlePhysics, 
   rendering: DEFAULT_RENDERING_OPTIONS as ParticleRendering,
   autoStart: true,
   preset: undefined,
};

// Remove temporary math functions if import works

export class ParticleEngine {
    // Use the non-Required type for options internally
    private options: Exclude<ParticleSystemOptions, string>; 
    private particles: Particle[] = [];
    private particlePool: Particle[] = [];
    private nextParticleId = 0;
    private presets: ParticlePresetCollection; // Assuming presets are passed in
    private containerSize: { width: number; height: number } = { width: 0, height: 0 };
    private emitAccumulator = 0;
    private lastUpdateTime: number = 0;
    private isRunning = false;
    private qualityTier: QualityTier = QualityTier.MEDIUM; // Add quality tier property

    constructor(options: ParticleSystemOptions | string, presets: ParticlePresetCollection = {}, qualityTier?: QualityTier) {
       this.presets = presets; // Store presets
       this.qualityTier = qualityTier ?? QualityTier.MEDIUM; // Store quality tier
       this.options = this.resolveOptions(options);
       
       // Apply quality-based adjustments
       this.applyQualityTierAdjustments();
       
       if (this.options.autoStart) {
           this.start();
       }
    }
    
    /** Public getter for resolved options */
    public getResolvedOptions(): Readonly<Exclude<ParticleSystemOptions, string>> {
        return this.options;
    }

    /** Apply quality tier adjustments to the current options */
    private applyQualityTierAdjustments(): void {
        if (!this.options.emitter || !this.options.physics) return;
        
        const emitter = this.options.emitter;
        const physics = this.options.physics;
        
        switch (this.qualityTier) {
            case QualityTier.LOW:
                // Reduce particle count and effects for low-end devices
                emitter.maxParticles = Math.min(emitter.maxParticles ?? 500, 150);
                emitter.emissionRate = Math.min(emitter.emissionRate ?? 10, 5);
                physics.maxVelocity = Math.min(physics.maxVelocity ?? 1000, 500);
                // Simplify physics
                physics.friction = Math.max(physics.friction ?? 0.01, 0.05);
                break;
                
            case QualityTier.MEDIUM:
                // Balanced settings for average devices
                emitter.maxParticles = Math.min(emitter.maxParticles ?? 500, 300);
                emitter.emissionRate = Math.min(emitter.emissionRate ?? 10, 8);
                // Keep other physics parameters as-is
                break;
                
            case QualityTier.HIGH:
                // Default settings, no adjustments needed
                break;
                
            case QualityTier.ULTRA:
                // Allow more particles and effects for high-end devices
                if (emitter.emissionRate) emitter.emissionRate *= 1.2;
                break;
        }
    }

    /** Resolves options (simplistic merge for now). */
    private resolveOptions(options: ParticleSystemOptions | string): Exclude<ParticleSystemOptions, string> {
        let userOptions: Partial<Exclude<ParticleSystemOptions, string>> = {};
        let preset: ParticlePreset | undefined;
        let presetName: string | undefined;

        if (typeof options === 'string' && this.presets[options]) {
            presetName = options;
            preset = this.presets[options];
        } else if (typeof options === 'object') {
             userOptions = options;
             if (userOptions.preset && this.presets[userOptions.preset]) {
                 presetName = userOptions.preset;
                 preset = this.presets[userOptions.preset];
             }
        }

        // Simplified merge logic: Start with defaults, apply preset, then apply user options.
        const resolvedEmitter = { ...DEFAULT_SYSTEM_OPTIONS.emitter, ...(preset?.emitter ?? {}), ...(userOptions.emitter ?? {}) };
        const resolvedParticle = { ...DEFAULT_SYSTEM_OPTIONS.particle, ...(preset?.particle ?? {}), ...(userOptions.particle ?? {}) };
        const resolvedRendering = { ...DEFAULT_SYSTEM_OPTIONS.rendering, ...(preset?.rendering ?? {}), ...(userOptions.rendering ?? {}) };
        const resolvedPhysics: ParticlePhysics = {
            ...DEFAULT_SYSTEM_OPTIONS.physics,
            ...(preset?.physics ?? {}),
            ...(userOptions.physics ?? {}),
            attractors: [...(preset?.physics?.attractors ?? []), ...(userOptions.physics?.attractors ?? [])],
            repulsors: [...(preset?.physics?.repulsors ?? []), ...(userOptions.physics?.repulsors ?? [])],
        };

        const resolved: Exclude<ParticleSystemOptions, string> = {
            emitter: resolvedEmitter,
            particle: resolvedParticle,
            physics: resolvedPhysics,
            rendering: resolvedRendering,
            autoStart: userOptions.autoStart ?? DEFAULT_SYSTEM_OPTIONS.autoStart,
            preset: presetName,
        };
        
        return resolved;
    }
    
    /** Update options dynamically. */
    public setOptions(newOptions: ParticleSystemOptions | string, qualityTier?: QualityTier): void {
        // Update quality tier if provided
        if (qualityTier !== undefined) {
            this.qualityTier = qualityTier;
        }
        
        // Re-resolve options fully, incorporating the new ones
        this.options = this.resolveOptions(newOptions);
        
        // Apply quality tier adjustments
        this.applyQualityTierAdjustments();
    }

    /** Sets the container size, used for relative positioning. */
    public setContainerSize(width: number, height: number): void {
        this.containerSize = { width, height };
    }

    /** Creates a new particle with initial properties based on options. */
    private createParticle(overridePosition?: Vector2D | 'center' | 'random'): Particle | null {
         // Basic structure, needs fleshing out based on resolved options
         const emitterOptions = this.options.emitter;
         const particleOptions = this.options.particle;

         if (!emitterOptions || !particleOptions || this.particles.length >= (emitterOptions.maxParticles ?? 500)) {
             return null; 
         }
         
         const lifespan = randomInRange(particleOptions.lifespan?.min ?? 1, particleOptions.lifespan?.max ?? 3);
         
         // Placeholder for position calculation (needs full logic from previous attempts)
         const spawnPos: Vector2D = { x: this.containerSize.width / 2, y: this.containerSize.height / 2 }; 

         let particle = this.particlePool.pop() || ({} as Particle);

         particle.id = this.nextParticleId++;
         particle.position = { ...spawnPos };
         particle.velocity = {
             x: randomInRange(particleOptions.initialVelocity?.x?.[0] ?? -50, particleOptions.initialVelocity?.x?.[1] ?? 50),
             y: randomInRange(particleOptions.initialVelocity?.y?.[0] ?? -50, particleOptions.initialVelocity?.y?.[1] ?? 50),
         };
         particle.acceleration = { x: 0, y: 0 };
         particle.rotation = randomInRange(particleOptions.initialRotation?.[0] ?? 0, particleOptions.initialRotation?.[1] ?? 0);
         particle.angularVelocity = randomInRange(particleOptions.rotationSpeed?.[0] ?? 0, particleOptions.rotationSpeed?.[1] ?? 0);
         particle.initialScale = randomInRange(particleOptions.initialScale?.[0] ?? 1, particleOptions.initialScale?.[1] ?? 1);
         particle.scale = particle.initialScale;
         particle.initialOpacity = particleOptions.opacityOverLife?.[0] ?? 1;
         particle.opacity = particle.initialOpacity;
         particle.initialColorSet = particleOptions.colorOverLife?.[0] ?? ['#ffffff'];
         particle.color = getRandomColor(particle.initialColorSet);
         particle.endScale = particleOptions.sizeOverLife?.[1] ?? 0;
         particle.endOpacity = particleOptions.opacityOverLife?.[1] ?? 0;
         particle.endColorSet = particleOptions.colorOverLife?.[1] ?? [particle.color];
         particle.initialLifespan = lifespan;
         particle.age = 0;
         particle.isAlive = true;

         return particle;
    }

    /** Updates the state of all active particles. */
    public update(): void {
        if (!this.isRunning) return;

        const now = performance.now();
        const elapsed = (now - this.lastUpdateTime) / 1000.0;
        const deltaTime = elapsed === 0 ? (1/60) : Math.max(0.001, Math.min(elapsed, 0.1)); 
        this.lastUpdateTime = now;

        const physicsOptions = this.options.physics;
        const emitterOptions = this.options.emitter;
        
        // Combine attractors and repulsors
        const allForcePoints = [
            ...(physicsOptions?.attractors ?? []),
            ...(physicsOptions?.repulsors ?? []).map(r => ({ ...r, strength: -(r.strength ?? 0) }))
        ];

        // --- Emission --- 
        if (emitterOptions?.emissionRate) {
            this.emitAccumulator += emitterOptions.emissionRate * deltaTime;
            const particlesToEmit = Math.floor(this.emitAccumulator);
            if (particlesToEmit > 0) {
              this.emitAccumulator -= particlesToEmit;
              for (let i = 0; i < particlesToEmit; i++) {
                const newParticle = this.createParticle();
                if (newParticle) this.particles.push(newParticle);
              }
            }
        }
        // Handle burst (simplified - needs proper timing later)
        if (emitterOptions?.burst && emitterOptions.burst.count > 0 && (emitterOptions.burst.time ?? 0) <= 0) {
             this.emitBurst(emitterOptions.burst.count);
             // Need logic to prevent re-bursting
        }

        // --- Update existing particles --- 
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          if (!p.isAlive) continue;

          p.age += deltaTime;
          if (p.age >= p.initialLifespan) {
            p.isAlive = false;
            this.particlePool.push(p);
            this.particles.splice(i, 1);
            continue;
          }

          const lifeProgress = Math.min(p.age / p.initialLifespan, 1.0);

          // --- Apply Forces --- 
          p.acceleration = { x: 0, y: 0 }; 
          if (physicsOptions?.gravity) {
            p.acceleration.x += physicsOptions.gravity.x;
            p.acceleration.y += physicsOptions.gravity.y;
          }
          if (physicsOptions?.wind) {
              p.acceleration.x += physicsOptions.wind.x;
              p.acceleration.y += physicsOptions.wind.y;
          }
          if (allForcePoints.length > 0) {
              for (const forcePoint of allForcePoints) {
                  if (!forcePoint.position) continue; // Skip if position is missing
                  const dx = forcePoint.position.x - p.position.x;
                  const dy = forcePoint.position.y - p.position.y;
                  let distanceSq = dx * dx + dy * dy;
                  if (distanceSq === 0) continue; 
                  const distance = Math.sqrt(distanceSq);
                  if (distance < (forcePoint.radius ?? 0)) {
                      const forceMagnitude = this.calculateForceMagnitude(distance, forcePoint);
                      const forceX = (dx / distance) * forceMagnitude;
                      const forceY = (dy / distance) * forceMagnitude;
                      p.acceleration.x += forceX;
                      p.acceleration.y += forceY;
                  }
              }
          }

          // --- Update Physics --- 
          p.velocity.x += p.acceleration.x * deltaTime;
          p.velocity.y += p.acceleration.y * deltaTime;
          const frictionFactor = Math.max(0, 1.0 - (physicsOptions?.friction ?? 0)); 
          p.velocity.x *= frictionFactor;
          p.velocity.y *= frictionFactor;
          if (physicsOptions?.maxVelocity) {
              const speedSq = p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y;
              if (speedSq > physicsOptions.maxVelocity * physicsOptions.maxVelocity) {
                  const speed = Math.sqrt(speedSq);
                  const scale = physicsOptions.maxVelocity / speed;
                  p.velocity.x *= scale;
                  p.velocity.y *= scale;
              }
          }
          p.position.x += p.velocity.x * deltaTime;
          p.position.y += p.velocity.y * deltaTime;

          // --- Update Properties Over Life --- 
          const pOptions = this.options.particle;
          if (pOptions) {
              p.scale = lerp(p.initialScale, p.endScale ?? p.initialScale, lifeProgress);
              p.opacity = lerp(p.initialOpacity, p.endOpacity ?? p.initialOpacity, lifeProgress);
              p.color = interpolateColor(p.initialColorSet, p.endColorSet ?? p.initialColorSet, lifeProgress);
              p.rotation += p.angularVelocity * deltaTime;
          }

          // --- Handle Boundaries --- 
           const bounds = physicsOptions?.bounds;
           if (bounds) { /* ... boundary logic ... */ }
        }
    }

    /** Calculates force magnitude based on distance and decay function. */
    private calculateForceMagnitude(distance: number, forcePoint: ParticleForcePoint): number {
      const { strength = 0, radius = 0, decay = 'linear' } = forcePoint;
      if (distance >= radius) return 0;
      if (typeof decay === 'function') { /* ... */ }
      switch (decay) {
          case 'inverse': /* ... */
          case 'none': /* ... */
          case 'linear':
          default: return strength * (1 - distance / radius); 
      }
      return 0; // Added default return
    }

    /** Manually emit a burst of particles. */
    public emitBurst(count: number, position?: Vector2D | 'center' | 'random'): void {
       const maxEmit = this.options.emitter?.maxParticles ?? 500;
       const numToEmit = Math.min(count, maxEmit - this.particles.length);
       for (let i = 0; i < numToEmit; i++) {
           const newParticle = this.createParticle(position);
           if (newParticle) this.particles.push(newParticle);
       }
    }

    /** Returns the current list of active particles. */
    public getParticles(): ReadonlyArray<Particle> {
        return this.particles;
    }

    /** Returns the number of active particles. */
    public getParticleCount(): number {
        return this.particles.length;
    }
    
    /** Clears all active particles and returns them to the pool. */
    public clear(): void {
       this.particles.forEach(p => { p.isAlive = false; this.particlePool.push(p); });
       this.particles = [];
       this.emitAccumulator = 0; 
    }

    /** Starts/Resumes the simulation loop. */
    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastUpdateTime = performance.now(); 
        }
    }

    /** Pauses the simulation loop. */
    public pause(): void {
        this.isRunning = false;
    }

    /** Stops the simulation and clears all particles. */
    public stop(): void {
        this.isRunning = false;
        this.clear();
    }

    /** Returns whether the engine simulation is active. */
    public isEngineRunning(): boolean {
        return this.isRunning;
    }
} 