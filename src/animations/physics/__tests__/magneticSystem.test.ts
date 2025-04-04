/**
 * Tests for the magnetic system
 */

import { act } from '@testing-library/react'; // Import act for async operations
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
    // Enable Jest fake timers
    jest.useFakeTimers(); 

    // Reset system
    system = new MagneticSystemManager({
      id: 'test-system',
      usePhysicsSystem: false // Disable physics system for tests
    });
    
    jest.clearAllMocks(); // Clear other mocks if any
  });
  
  afterEach(() => {
    system.destroy();
    // Disable Jest fake timers
    jest.useRealTimers(); 
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
  
  test('should apply force to elements (API check)', () => {
    // Keep this as an API check, actual force tested in update loop test
    const element = new MockElement() as unknown as HTMLElement;
    const id = system.registerElement({ element });
    const result = system.applyForce(id, { x: 10, y: 5 });
    expect(result).toBe(true);
  });
  
  test('should start and stop the system using rAF', () => {
    // Use Jest's mock functions for rAF/cAF
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
    const cafSpy = jest.spyOn(window, 'cancelAnimationFrame');

    system.start();
    expect(rafSpy).toHaveBeenCalledTimes(1);
    const rafId = rafSpy.mock.results[0].value; 

    system.stop();
    expect(cafSpy).toHaveBeenCalledWith(rafId);

    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });
  
  test('update loop should modify element state over time and move towards attractor', () => {
    const element = new MockElement() as unknown as HTMLElement;
    // Place element away from origin initially
    const elementRect = {
        left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100, x: 100, y: 100,
        toJSON: function() { return this; } // Add toJSON method
    };
    element.getBoundingClientRect = jest.fn(() => elementRect);
    const id = system.registerElement({ 
        element, 
        strength: 1, 
        isAttractor: false
    });
    
    // Add an attractor at the origin
    const attractorElement = new MockElement() as unknown as HTMLElement;
    const attractorRect = {
        left: -50, top: -50, right: 50, bottom: 50, width: 100, height: 100, x: -50, y: -50,
        toJSON: function() { return this; } // Add toJSON method
    };
    attractorElement.getBoundingClientRect = jest.fn(() => attractorRect);
    const attractorId = system.registerElement({ 
        element: attractorElement, 
        strength: 1, 
        isAttractor: true 
    });

    system.start();

    const initialState = system.getElement(id)!;
    const initialPos = { x: initialState.position.x, y: initialState.position.y };
    const initialDistanceSq = initialPos.x ** 2 + initialPos.y ** 2;

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    system.stop();

    const finalState = system.getElement(id)!;
    const finalPos = { x: finalState.position.x, y: finalState.position.y };
    const finalDistanceSq = finalPos.x ** 2 + finalPos.y ** 2;

    expect(finalState).toBeDefined();
    expect(finalPos.x).not.toBeCloseTo(initialPos.x);
    expect(finalPos.y).not.toBeCloseTo(initialPos.y);
    expect(finalState.velocity.x !== 0 || finalState.velocity.y !== 0).toBe(true);
    expect(finalDistanceSq).toBeLessThan(initialDistanceSq);
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
    jest.useFakeTimers(); // Enable fake timers here too
    system = new MagneticSystemManager({
      id: 'interaction-test-system',
      usePhysicsSystem: false,
      enableElementInteraction: true,
      interactionStrength: 1
    });
  });
  
  afterEach(() => {
    system.destroy();
    jest.useRealTimers(); // Disable fake timers
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
  
  test('should cause interacting elements to move when enabled', () => {
    const element1 = new MockElement() as unknown as HTMLElement;
    const element2 = new MockElement() as unknown as HTMLElement;

    // Position elements apart initially
    element1.getBoundingClientRect = jest.fn(() => ({ 
      left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100, x: 50, y: 50, 
      toJSON: function() { return this; } // Add toJSON method
    }));
    element2.getBoundingClientRect = jest.fn(() => ({ 
      left: 250, top: 250, right: 350, bottom: 350, width: 100, height: 100, x: 250, y: 250, 
      toJSON: function() { return this; } // Add toJSON method
    }));

    const id1 = system.registerElement({ element: element1, strength: 0.1, isAttractor: false });
    const id2 = system.registerElement({ element: element2, strength: 0.1, isAttractor: false });

    const initialState1 = system.getElement(id1)!;
    const initialState2 = system.getElement(id2)!;
    const initialPos1 = { ...initialState1.position };
    const initialPos2 = { ...initialState2.position };

    system.start();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    system.stop();

    const finalState1 = system.getElement(id1)!;
    const finalState2 = system.getElement(id2)!;

    expect(finalState1.position.x).not.toBeCloseTo(initialPos1.x);
    expect(finalState1.position.y).not.toBeCloseTo(initialPos1.y);
    expect(finalState2.position.x).not.toBeCloseTo(initialPos2.x);
    expect(finalState2.position.y).not.toBeCloseTo(initialPos2.y);
  });
});