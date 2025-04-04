/**
 * Fixed tests for the GameParticleSystem
 */

import { 
  GameParticleSystem, 
  createGameParticleSystem,
  GameEventType, 
  EmitterShape, 
  ParticleShape,
  Particle
} from '../GameParticleSystem';

// Save original implementations to restore later
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;
const originalCreateElement = document.createElement;
const originalNow = Date.now;

// Mock DOM elements with proper implementation
class MockElement {
  style: Record<string, any> = {};
  className = '';
  id = '';
  children: MockElement[] = [];
  parentElement: MockElement | null = null;
  
  getBoundingClientRect = jest.fn().mockReturnValue({
    left: 0,
    top: 0, 
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => ({
      left: 0, top: 0, right: 100, bottom: 100,
      width: 100, height: 100, x: 0, y: 0
    })
  });
  
  remove = jest.fn(() => {
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index !== -1) {
        this.parentElement.children.splice(index, 1);
      }
      this.parentElement = null;
    }
  });
  
  appendChild = jest.fn((child: MockElement) => {
    this.children.push(child);
    child.parentElement = this;
    return child;
  });
  
  querySelector = jest.fn().mockReturnValue(null);
}

// Mock canvas elements
class MockCanvasContext {
  canvas: MockCanvas;
  fillStyle = '';
  globalAlpha = 1;
  
  constructor(canvas: MockCanvas) {
    this.canvas = canvas;
  }
  
  clearRect = jest.fn();
  save = jest.fn();
  restore = jest.fn();
  beginPath = jest.fn();
  arc = jest.fn();
  fill = jest.fn();
  fillRect = jest.fn();
  translate = jest.fn();
  rotate = jest.fn();
  moveTo = jest.fn();
  lineTo = jest.fn();
  closePath = jest.fn();
}

class MockCanvas extends MockElement {
  width = 100;
  height = 100;
  getContext = jest.fn((type: string) => {
    return new MockCanvasContext(this);
  });
}

describe('GameParticleSystem (Fixed)', () => {
  // Mock time tracking for controlled animations
  let mockTime = 0;
  
  // Store animation frame callbacks for manual control
  const rafCallbacks = new Map<number, FrameRequestCallback>();
  let rafCounter = 1;
  
  beforeAll(() => {
    // Mock the Date.now function
    Date.now = jest.fn(() => mockTime);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const id = rafCounter++;
      rafCallbacks.set(id, callback);
      return id;
    });
    
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = jest.fn((id: number) => {
      rafCallbacks.delete(id);
    });
    
    // Mock createElement to use our MockElement implementation
    (document as any).createElement = jest.fn((tag: string) => {
      if (tag.toLowerCase() === 'canvas') {
        return new MockCanvas();
      }
      return new MockElement();
    });
    
    // Set up fake timers for better control
    jest.useFakeTimers();
  });
  
  afterAll(() => {
    // Restore original implementations
    global.requestAnimationFrame = originalRAF;
    global.cancelAnimationFrame = originalCAF;
    document.createElement = originalCreateElement;
    Date.now = originalNow;
    
    // Use real timers again
    jest.useRealTimers();
  });
  
  beforeEach(() => {
    // Reset mocks and state
    jest.clearAllMocks();
    rafCallbacks.clear();
    rafCounter = 1;
    mockTime = 0;
  });
  
  // Helper function to advance animation frames with precise time control
  const advanceAnimationFrame = (deltaTime: number = 16) => {
    mockTime += deltaTime;
    
    // Execute all pending animation frame callbacks with the new time
    const callbacks = Array.from(rafCallbacks.entries());
    for (const [id, callback] of callbacks) {
      callback(mockTime);
    }
  };
  
  // Helper to advance multiple frames
  const advanceAnimationFrames = (count: number, deltaTime: number = 16) => {
    for (let i = 0; i < count; i++) {
      advanceAnimationFrame(deltaTime);
    }
  };
  
  describe('Initialization', () => {
    test('creates a new particle system with default options', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      expect(system).toBeDefined();
      expect(system.config.eventType).toBe(GameEventType.SPARKLE);
      expect(system.config.maxParticles).toBe(200);
      expect(system.config.performanceLevel).toBe(0.2);
      expect(system.config.renderer).toBe('dom');
      expect(system.config.gpuAccelerated).toBe(true);
    });
    
    test('creates a container element when none is provided', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(system.container).toBeDefined();
    });
    
    test('uses a provided container element', () => {
      const container = document.createElement('div');
      container.id = 'test-container';
      
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        container: container
      });
      
      expect(system.container).toBe(container);
    });
  });
  
  describe('Emitter Management', () => {
    test('adds emitters from configuration', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        emitters: [
          {
            position: { x: 50, y: 50, z: 0 },
            shape: EmitterShape.POINT,
            burstCount: 10
          },
          {
            position: { x: 100, y: 100, z: 0 },
            shape: EmitterShape.CIRCLE,
            rate: 5
          }
        ]
      });
      
      expect(system.emitters.size).toBe(2);
    });
    
    test('adds emitters dynamically', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      expect(system.emitters.size).toBe(0);
      
      const emitterId = system.addEmitter({
        position: { x: 50, y: 50, z: 0 },
        shape: EmitterShape.POINT,
        burstCount: 10
      });
      
      expect(emitterId).toBeDefined();
      expect(system.emitters.size).toBe(1);
      expect(system.emitters.has(emitterId)).toBe(true);
    });
    
    test('removes emitters', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      const emitterId = system.addEmitter({
        position: { x: 50, y: 50, z: 0 },
        burstCount: 10
      });
      
      expect(system.emitters.size).toBe(1);
      
      const result = system.removeEmitter(emitterId);
      
      expect(result).toBe(true);
      expect(system.emitters.size).toBe(0);
    });
    
    test('updates emitters', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      const emitterId = system.addEmitter({
        position: { x: 50, y: 50, z: 0 },
        rate: 10
      });
      
      const result = system.updateEmitter(emitterId, {
        position: { x: 100, y: 100, z: 0 },
        rate: 20
      });
      
      expect(result).toBe(true);
      
      const emitter = system.emitters.get(emitterId);
      expect(emitter).toBeDefined();
      expect(emitter?.position).toEqual({ x: 100, y: 100, z: 0 });
      expect(emitter?.rate).toBe(20);
    });
  });
  
  describe('Particle Creation', () => {
    test('creates particles from emitters', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      // Add emitter with burst
      system.addEmitter({
        position: { x: 50, y: 50, z: 0 },
        burstCount: 5,
        particleConfig: {
          size: 10,
          life: 1
        }
      });
      
      // Start the system
      system.start();
      
      // Run the first animation frame to process burst
      advanceAnimationFrame();
      
      expect(system.particles.length).toBe(5);
    });
    
    test('respects maxParticles limit', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        maxParticles: 3
      });
      
      // Add emitter with burst count larger than max particles
      system.addEmitter({
        position: { x: 50, y: 50, z: 0 },
        burstCount: 10,
        particleConfig: {
          size: 10,
          life: 1
        }
      });
      
      // Start the system
      system.start();
      
      // Run an animation frame to process burst
      advanceAnimationFrame();
      
      // Should respect the max particle limit
      expect(system.particles.length).toBeLessThanOrEqual(3);
    });
    
    test('removes particles when they expire', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      // Create a particle with a short lifespan
      const particle: Particle = {
        id: 'test-particle',
        position: { x: 50, y: 50, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        rotation: 0,
        rotationVelocity: 0,
        size: 10,
        sizeVelocity: 0,
        opacity: 1,
        opacityVelocity: 0,
        color: '#ffffff',
        life: 0.1, // 100ms life
        totalLife: 0.1,
        alive: true,
        shape: ParticleShape.CIRCLE,
        mass: 1
      };
      
      // Add the particle directly
      system.particles.push(particle);
      
      // Start the system
      system.start();
      
      // Verify particle was added
      expect(system.particles.length).toBe(1);
      
      // Advance time beyond the particle's life
      advanceAnimationFrame(200); // 200ms, more than the 100ms life
      
      // Particle should have been removed
      expect(system.particles.length).toBe(0);
    });
  });
  
  describe('Event Presets', () => {
    test('creates a particle system from an event preset', () => {
      const system = createGameParticleSystem(GameEventType.SUCCESS);
      
      expect(system.config.eventType).toBe(GameEventType.SUCCESS);
      expect(system.config.emitters).toBeDefined();
      expect(system.config.emitters?.length).toBeGreaterThan(0);
    });
    
    test('overrides preset values with custom config', () => {
      const system = createGameParticleSystem(GameEventType.SUCCESS, {
        maxParticles: 50,
        performanceLevel: 0.5,
        emitters: [{
          position: { x: 100, y: 100, z: 0 },
          burstCount: 15
        }]
      });
      
      expect(system.config.eventType).toBe(GameEventType.SUCCESS);
      expect(system.config.maxParticles).toBe(50);
      expect(system.config.performanceLevel).toBe(0.5);
      expect(system.config.emitters?.[0].burstCount).toBe(15);
    });
  });
  
  describe('Particle System Actions', () => {
    test('starts and stops the animation loop', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      expect(system.isActive).toBe(false);
      
      system.start();
      
      expect(system.isActive).toBe(true);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
      
      // Get the animation frame ID (should be 1 in our mock)
      const frameId = 1;
      
      system.stop();
      
      expect(system.isActive).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalledWith(frameId);
    });
    
    test('pauses and resumes the animation loop', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      // Add an active emitter
      system.addEmitter({ position: { x: 0, y: 0, z: 0 }, rate: 1 });
      
      system.start();
      
      expect(system.isActive).toBe(true);
      expect(system.isPaused).toBe(false);
      
      // Clear mocks to check for later calls
      jest.clearAllMocks();
      
      system.pause();
      
      expect(system.isActive).toBe(true); // Still active, just paused
      expect(system.isPaused).toBe(true);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      
      // Clear mocks again
      jest.clearAllMocks();
      
      system.resume();
      
      expect(system.isActive).toBe(true);
      expect(system.isPaused).toBe(false);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });
    
    test('triggers a burst of particles', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      system.burst({ x: 50, y: 50, z: 0 });
      
      expect(system.isActive).toBe(true);
      expect(system.emitters.size).toBe(1);
      
      // Run an animation frame to create particles
      advanceAnimationFrame();
      
      // Should create some particles
      expect(system.particles.length).toBeGreaterThan(0);
    });
    
    test('creates a trail effect', () => {
      const element = document.createElement('div');
      element.id = 'trail-element';
      
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      const emitterId = system.createTrail(element as any);
      
      expect(emitterId).toBeDefined();
      expect(system.isActive).toBe(true);
      expect(system.emitters.size).toBe(1);
      
      const emitter = system.emitters.get(emitterId);
      expect(emitter).toBeDefined();
      expect(emitter?.followElement).toBe(true);
      expect(emitter?.element).toBe(element);
    });
    
    test('triggers a preset event effect', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      system.triggerEvent(GameEventType.SUCCESS, { x: 50, y: 50, z: 0 });
      
      expect(system.isActive).toBe(true);
      expect(system.emitters.size).toBe(1);
      
      // Run an animation frame to create particles
      advanceAnimationFrame();
      
      // Should create particles based on the preset
      expect(system.particles.length).toBeGreaterThan(0);
    });
  });
  
  describe('Cleanup', () => {
    test('disposes resources properly', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      // Create a sample emitter
      system.addEmitter({
        position: { x: 50, y: 50, z: 0 }
      });
      
      // Track the container
      const container = system.container;
      const styleElement = system.styleElement;
      
      // Dispose the system
      system.dispose();
      
      expect(system.isActive).toBe(false);
      expect(system.particles.length).toBe(0);
      expect(system.emitters.size).toBe(0);
      
      // Elements should have been removed
      expect(container?.parentElement).toBeNull();
      expect(styleElement?.parentElement).toBeNull();
    });
  });
  
  describe('Performance Optimizations', () => {
    test('applies performance level to particle creation', () => {
      // System with low performance level (fewer particles)
      const lowPerfSystem = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        performanceLevel: 0.1,
        maxParticles: 100
      });
      
      // System with high performance level (more particles)
      const highPerfSystem = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        performanceLevel: 1.0,
        maxParticles: 100
      });
      
      // Add identical emitters to both
      lowPerfSystem.addEmitter({
        position: { x: 0, y: 0, z: 0 },
        burstCount: 50
      });
      
      highPerfSystem.addEmitter({
        position: { x: 0, y: 0, z: 0 },
        burstCount: 50
      });
      
      // Start both systems
      lowPerfSystem.start();
      highPerfSystem.start();
      
      // Advance animation frame to create particles
      advanceAnimationFrame();
      
      // Low performance system should create fewer particles
      expect(lowPerfSystem.particles.length).toBeLessThan(highPerfSystem.particles.length);
    });
  });
}); 