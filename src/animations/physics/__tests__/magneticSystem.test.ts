/**
 * Tests for the magnetic system
 */

import { 
  MagneticSystemManager, 
  createMagneticSystem, 
  getMagneticSystem 
} from '../magneticSystem';

// Mock DOM elements
class MockElement {
  style: any = {};
  classList = {
    add: jest.fn(),
    remove: jest.fn()
  };
  offsetWidth = 100;
  offsetHeight = 100;
  getBoundingClientRect = jest.fn(() => ({
    left: 100,
    top: 100,
    right: 200,
    bottom: 200,
    width: 100,
    height: 100,
    x: 100,
    y: 100
  }));
}

describe('MagneticSystemManager', () => {
  let system: MagneticSystemManager;
  
  beforeEach(() => {
    // Reset for each test
    system = new MagneticSystemManager({
      id: 'test-system',
      usePhysicsSystem: false // Disable physics system for tests
    });
    
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setTimeout(() => cb(performance.now()), 0);
      return 0;
    });
    
    // Mock cancelAnimationFrame
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });
  
  afterEach(() => {
    system.destroy();
    jest.clearAllMocks();
  });
  
  test('should create a magnetic system', () => {
    expect(system).toBeInstanceOf(MagneticSystemManager);
  });
  
  test('should register and unregister elements', () => {
    const element = new MockElement() as unknown as HTMLElement;
    const id = system.registerElement({ element });
    
    expect(id).toBeDefined();
    expect(system.getElement(id)).toBeDefined();
    
    const result = system.unregisterElement(id);
    expect(result).toBe(true);
    expect(system.getElement(id)).toBeUndefined();
  });
  
  test('should update element properties', () => {
    const element = new MockElement() as unknown as HTMLElement;
    const id = system.registerElement({ element });
    
    const result = system.updateElement(id, {
      mass: 2,
      strength: 0.8,
      isAttractor: true
    });
    
    expect(result).toBe(true);
    
    const updatedElement = system.getElement(id);
    expect(updatedElement?.mass).toBe(2);
    expect(updatedElement?.strength).toBe(0.8);
    expect(updatedElement?.isAttractor).toBe(true);
  });
  
  test('should apply force to elements', () => {
    const element = new MockElement() as unknown as HTMLElement;
    const id = system.registerElement({ element });
    
    const result = system.applyForce(id, { x: 10, y: 5 });
    expect(result).toBe(true);
    
    // Force application happens internally, can't easily test directly
    // but we can ensure the method completes successfully
  });
  
  test('should start and stop the system', () => {
    system.start();
    expect(window.requestAnimationFrame).toHaveBeenCalled();
    
    system.stop();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
  
  test('createMagneticSystem should return a new system', () => {
    const newSystem = createMagneticSystem({
      id: 'created-system'
    });
    
    expect(newSystem).toBeInstanceOf(MagneticSystemManager);
    expect(newSystem.getConfig().id).toBe('created-system');
    
    // Clean up
    newSystem.destroy();
  });
  
  test('getMagneticSystem should return the same system for the same ID', () => {
    const system1 = getMagneticSystem('shared-system');
    const system2 = getMagneticSystem('shared-system');
    
    expect(system1).toBe(system2);
    
    // Clean up
    system1.destroy();
  });
  
  test('getMagneticSystem should create a new system for new ID', () => {
    const system1 = getMagneticSystem('system-a');
    const system2 = getMagneticSystem('system-b');
    
    expect(system1).not.toBe(system2);
    
    // Clean up
    system1.destroy();
    system2.destroy();
  });
});

describe('Element interactions', () => {
  let system: MagneticSystemManager;
  
  beforeEach(() => {
    // Reset for each test
    system = new MagneticSystemManager({
      id: 'interaction-test-system',
      usePhysicsSystem: false, // Disable physics system for tests
      enableElementInteraction: true,
      interactionStrength: 1
    });
    
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      setTimeout(() => cb(performance.now()), 0);
      return 0;
    });
  });
  
  afterEach(() => {
    system.destroy();
    jest.clearAllMocks();
  });
  
  test('should register multiple elements', () => {
    const element1 = new MockElement() as unknown as HTMLElement;
    const element2 = new MockElement() as unknown as HTMLElement;
    
    const id1 = system.registerElement({ element: element1 });
    const id2 = system.registerElement({ element: element2 });
    
    expect(system.getAllElements().length).toBe(2);
    expect(system.getElement(id1)).toBeDefined();
    expect(system.getElement(id2)).toBeDefined();
  });
  
  test('should update config', () => {
    system.updateConfig({
      interactionStrength: 0.5,
      interactionRadius: 300
    });
    
    const config = system.getConfig();
    expect(config.interactionStrength).toBe(0.5);
    expect(config.interactionRadius).toBe(300);
  });
  
  // Since we can't easily test the magnetic calculations directly,
  // we verify the API structure and behavior
});