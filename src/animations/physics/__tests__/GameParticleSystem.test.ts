/**
 * Tests for the GameParticleSystem
 */

import { 
  GameParticleSystem, 
  createGameParticleSystem,
  GameEventType, 
  EmitterShape, 
  ParticleShape,
  ParticleAnimationType,
  Particle,
  EVENT_PRESETS
} from '../GameParticleSystem';

// Mock DOM elements
class MockElement {
  style: any = {};
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
    height: 100
  });
  
  remove = jest.fn();
  appendChild = jest.fn((child: MockElement) => {
    this.children.push(child);
    child.parentElement = this;
    return child;
  });
  querySelector = jest.fn().mockReturnValue(null);
}

// Mock document and window objects
const mockDocument = {
  createElement: jest.fn((tag: string) => {
    const element = new MockElement();
    element.id = `mock-${tag}-${Math.random()}`;
    return element;
  }),
  head: new MockElement(),
  body: new MockElement(),
  querySelector: jest.fn().mockReturnValue(null)
};

const mockWindow = {
  requestAnimationFrame: jest.fn((callback: any) => {
    setTimeout(() => callback(Date.now()), 0);
    return Math.floor(Math.random() * 1000);
  }),
  cancelAnimationFrame: jest.fn(),
  innerWidth: 1024,
  innerHeight: 768
};

// Mock canvas context
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

// Mock canvas element
class MockCanvas extends MockElement {
  width = 100;
  height = 100;
  getContext = jest.fn((type: string) => {
    return new MockCanvasContext(this);
  });
}

// Setup global mocks
global.document = mockDocument as any;
global.window = mockWindow as any;
global.HTMLElement = MockElement as any;
global.HTMLCanvasElement = MockCanvas as any;
global.requestAnimationFrame = mockWindow.requestAnimationFrame;
global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;

describe('GameParticleSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
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
      expect(system.container?.className).toBe('game-particle-container');
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
    
    test('initializes style element for DOM renderer', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        renderer: 'dom'
      });
      
      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(system.styleElement).toBeDefined();
      expect(document.head.appendChild).toHaveBeenCalledWith(system.styleElement);
    });
    
    test('initializes canvas for canvas renderer', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        renderer: 'canvas'
      });
      
      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(system.canvas).toBeDefined();
      expect(system.context).toBeDefined();
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
      
      // Let the animation frame execute
      jest.runAllTimers();
      
      expect(system.particles.length).toBe(5);
    });
    
    test('respects maxParticles limit', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE,
        maxParticles: 3
      });
      
      // Add emitter with burst
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
      
      // Let the animation frame execute
      jest.runAllTimers();
      
      expect(system.particles.length).toBeLessThanOrEqual(3);
    });
    
    test('removes particles when they expire', () => {
      jest.useFakeTimers();
      
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      // Manual particle creation for testing
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
        life: 0.1, // Very short life
        totalLife: 0.1,
        alive: true,
        shape: ParticleShape.CIRCLE,
        mass: 1
      };
      
      system.particles.push(particle);
      system.start();
      
      expect(system.particles.length).toBe(1);
      
      // Advance time
      jest.advanceTimersByTime(200);
      
      // Manually trigger update (since we're using fake timers)
      const timestamp = Date.now();
      // @ts-ignore - private method access for testing
      system.update(timestamp);
      
      expect(system.particles.length).toBe(0);
    });
  });
  
  describe('Event Presets', () => {
    test('each event type has a preset configuration', () => {
      Object.values(GameEventType).forEach(eventType => {
        expect(EVENT_PRESETS[eventType]).toBeDefined();
      });
    });
    
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
      
      system.stop();
      expect(system.isActive).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });
    
    test('pauses and resumes the animation loop', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      system.start();
      expect(system.isActive).toBe(true);
      expect(system.isPaused).toBe(false);
      
      system.pause();
      expect(system.isActive).toBe(true);
      expect(system.isPaused).toBe(true);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      
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
    });
  });
  
  describe('Cleanup', () => {
    test('disposes resources properly', () => {
      const system = new GameParticleSystem({
        eventType: GameEventType.SPARKLE
      });
      
      const container = system.container as unknown as MockElement;
      const styleElement = system.styleElement as unknown as MockElement;
      
      system.dispose();
      
      expect(system.isActive).toBe(false);
      expect(container.remove).toHaveBeenCalled();
      expect(styleElement.remove).toHaveBeenCalled();
      expect(system.particles.length).toBe(0);
      expect(system.emitters.size).toBe(0);
    });
  });
});