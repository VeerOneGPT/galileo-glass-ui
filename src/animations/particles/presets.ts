import { ParticleSystemOptions, ParticlePresetCollection, Range, ParticlePreset } from '../../types/particles';

/**
 * Standard presets for particle systems
 */
export const particlePresets: ParticlePresetCollection = {
  /**
   * Default preset - simple white particles
   */
  default: {
    emitter: {
      shape: 'point',
      position: 'center',
      emissionRate: 10,
      burst: null,
      maxParticles: 100
    },
    particle: {
      lifespan: { min: 2000, max: 4000 },
      initialVelocity: { 
        x: [0.5, 2], 
        y: [0.5, 2]
      },
      initialRotation: [0, 0],
      initialScale: [1, 1],
      sizeOverLife: [1, 0.5],
      opacityOverLife: [0.8, 0],
      colorOverLife: [['#ffffff'], ['#ffffff']]
    },
    physics: {
      gravity: { x: 0, y: 0 },
      friction: 0.02,
      wind: { x: 0, y: 0 }
    }
  },

  /**
   * Fireworks preset - bursting colorful particles
   */
  fireworks: {
    emitter: {
      shape: 'point',
      position: 'center',
      emissionRate: 0, // No continuous emission
      burst: { count: 100 }, // Emit in a burst
      maxParticles: 100
    },
    particle: {
      lifespan: { min: 1000, max: 2000 },
      initialVelocity: { 
        x: [3, 7], 
        y: [3, 7]
      },
      initialRotation: [0, 0],
      initialScale: [1, 1],
      sizeOverLife: [1, 0.2],
      colorOverLife: [
        ['#ff3214', '#ffff14', '#14a6ff', '#ff32dc'], 
        ['#ff3214', '#ffff14', '#14a6ff', '#ff32dc']
      ],
      opacityOverLife: [1, 0]
    },
    physics: {
      gravity: { x: 0, y: 0.05 }, // Light gravity
      friction: 0.01
    }
  },

  /**
   * Snow preset - falling snow particles
   */
  snow: {
    emitter: {
      shape: 'rectangle',
      position: { x: 0.5, y: 0 }, // Top of container
      size: { width: 1, height: 0.1 },
      emissionRate: 20,
      maxParticles: 200
    },
    particle: {
      lifespan: { min: 3000, max: 6000 },
      initialVelocity: { 
        x: [0.2, 1.5], 
        y: [0.2, 1.5]
      },
      initialRotation: [0, 360],
      rotationSpeed: [-1, 1],
      initialScale: [0.8, 1.2],
      sizeOverLife: [1, 0.8],
      colorOverLife: [['#ffffff'], ['#ffffff']],
      opacityOverLife: [0.8, 0.3]
    },
    physics: {
      gravity: { x: 0, y: 0.02 }, // Light gravity
      friction: 0.01,
      wind: { x: 0.1, y: 0 } // Light wind to the right
    }
  },

  /**
   * Rain preset - falling rain particles
   */
  rain: {
    emitter: {
      shape: 'rectangle',
      position: { x: 0.5, y: 0 }, // Top of container
      size: { width: 1, height: 0.1 },
      emissionRate: 50,
      maxParticles: 500
    },
    particle: {
      lifespan: { min: 700, max: 1500 },
      initialVelocity: { 
        x: [10, 20], 
        y: [10, 20]
      },
      initialRotation: [0, 0],
      initialScale: [1, 1.2],
      sizeOverLife: [1, 0.8],
      colorOverLife: [['#96aade'], ['#96aade']],
      opacityOverLife: [0.5, 0.2]
    },
    physics: {
      gravity: { x: 0, y: 0.1 }, // Strong gravity
      friction: 0.001,
      wind: { x: -0.2, y: 0 } // Wind to the left
    }
  },

  /**
   * Magic dust preset - sparkling particles
   */
  magicDust: {
    emitter: {
      shape: 'point',
      position: { x: 0.5, y: 0.5 }, // Center by default, but will follow mouse
      emissionRate: 15,
      maxParticles: 100
    },
    particle: {
      lifespan: { min: 1000, max: 2000 },
      initialVelocity: { 
        x: [1, 3], 
        y: [1, 3]
      },
      initialRotation: [0, 360],
      rotationSpeed: [-2, 2],
      initialScale: [0.5, 1.5],
      sizeOverLife: [0.1, 1],
      colorOverLife: [
        ['#ffdc64', '#c864ff', '#64c8ff'], 
        ['#ffdc64', '#c864ff', '#64c8ff']
      ],
      opacityOverLife: [0, 0.8]
    },
    physics: {
      gravity: { x: 0, y: -0.03 }, // Float upward
      friction: 0.05
    }
  },

  /**
   * Confetti preset - colorful confetti particles
   */
  confetti: {
    emitter: {
      shape: 'point',
      position: { x: 0.5, y: 0.3 }, // Slightly above center
      emissionRate: 0, // No continuous emission
      burst: { count: 100 }, // Emit in a burst
      maxParticles: 100
    },
    particle: {
      lifespan: { min: 2000, max: 5000 },
      initialVelocity: { 
        x: [3, 8], 
        y: [3, 8]
      },
      initialRotation: [0, 360],
      rotationSpeed: [-3, 3],
      initialScale: [0.7, 1.3],
      sizeOverLife: [1, 0.5],
      colorOverLife: [
        ['#ff3232', '#32ff32', '#3232ff', '#ffff32', '#ff32ff', '#32ffff'], 
        ['#ff3232', '#32ff32', '#3232ff', '#ffff32', '#ff32ff', '#32ffff']
      ],
      opacityOverLife: [1, 0.5]
    },
    physics: {
      gravity: { x: 0, y: 0.1 }, // Gravity
      friction: 0.03,            // Air resistance
      wind: { x: 0.05, y: 0 }    // Light wind
    }
  },

  /**
   * Fire preset - flame-like particles
   */
  fire: {
    emitter: {
      shape: 'line',
      position: { x: 0.5, y: 1 }, // Bottom-center
      size: { width: 0.3, height: 0 },
      emissionRate: 30,
      maxParticles: 100
    },
    particle: {
      lifespan: { min: 600, max: 1200 },
      initialVelocity: { 
        x: [1, 3], 
        y: [1, 3]
      },
      initialRotation: [0, 360],
      rotationSpeed: [-1, 1],
      initialScale: [0.8, 1.2],
      sizeOverLife: [0.3, 1],
      colorOverLife: [
        ['#ff9632'], // Orange
        ['#641e14']  // Dark red
      ],
      opacityOverLife: [0.7, 0]
    },
    physics: {
      gravity: { x: 0, y: -0.2 }, // Strong updraft
      friction: 0.01
    },
    rendering: {
      blendMode: 'screen' // Add glow effect
    }
  },

  /**
   * Smoke preset - rising smoke particles
   */
  smoke: {
    emitter: {
      shape: 'circle',
      position: { x: 0.5, y: 0.9 }, // Near bottom
      size: 0.1, // Radius
      emissionRate: 15,
      maxParticles: 50
    },
    particle: {
      lifespan: { min: 2000, max: 4000 },
      initialVelocity: { 
        x: [0.5, 1.5], 
        y: [0.5, 1.5]
      },
      initialRotation: [0, 360],
      rotationSpeed: [-0.5, 0.5],
      initialScale: [1, 1.5],
      sizeOverLife: [0.5, 1],
      colorOverLife: [
        ['#323232'], // Dark gray
        ['#c8c8c8']  // Light gray
      ],
      opacityOverLife: [0, 0.3]
    },
    physics: {
      gravity: { x: 0, y: -0.05 }, // Gentle updraft
      friction: 0.02,
      wind: { x: 0.02, y: 0 } // Light breeze
    }
  }
}; 