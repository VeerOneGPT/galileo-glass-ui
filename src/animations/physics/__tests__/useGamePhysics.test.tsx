/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useGamePhysics, GamePhysicsBehavior, GameGravityPreset } from '../useGamePhysics';

// Mock the requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  setTimeout(() => callback(Date.now()), 16);
  return 1; // Return a number
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

describe('useGamePhysics', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('initializes with default values', () => {
    const { result } = renderHook(() => useGamePhysics());
    
    expect(result.current).toBeDefined();
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(typeof result.current.addObject).toBe('function');
    expect(typeof result.current.getObject).toBe('function');
    expect(typeof result.current.applyForce).toBe('function');
    expect(typeof result.current.createProjectile).toBe('function');
  });

  test('can add and remove objects', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    let objectId: string;
    
    act(() => {
      objectId = result.current.addObject({
        shape: 'circle',
        position: { x: 100, y: 100, z: 0 },
        radius: 20,
        mass: 1
      });
    });
    
    let allObjects = result.current.getAllObjects();
    expect(allObjects.length).toBe(1);
    
    act(() => {
      result.current.removeObject(objectId);
    });
    
    allObjects = result.current.getAllObjects();
    expect(allObjects.length).toBe(0);
  });

  test('can start and stop simulation', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    expect(result.current.isRunning).toBe(false);
    
    act(() => {
      result.current.start();
    });
    
    expect(result.current.isRunning).toBe(true);
    
    act(() => {
      result.current.stop();
    });
    
    expect(result.current.isRunning).toBe(false);
  });

  test('can pause and resume simulation', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: true,
      useRAF: false
    }));
    
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
    
    act(() => {
      result.current.pause();
    });
    
    expect(result.current.isPaused).toBe(true);
    
    act(() => {
      result.current.resume();
    });
    
    expect(result.current.isPaused).toBe(false);
  });

  test('can update environment settings', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    const initialEnvironment = result.current.getEnvironment();
    expect(initialEnvironment.gravity).toBeDefined();
    
    act(() => {
      result.current.updateEnvironment({
        gravity: GameGravityPreset.MOON,
        enableSleeping: false
      });
    });
    
    const updatedEnvironment = result.current.getEnvironment();
    expect(updatedEnvironment.enableSleeping).toBe(false);
  });

  test('can create objects with different behaviors', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    let projectileId: string, orbitalId: string, pathFollowerId: string;
    
    act(() => {
      projectileId = result.current.createProjectile(
        { x: 100, y: 100, z: 0 },
        45,  // angle in degrees
        100, // power
        1    // mass
      );
      
      orbitalId = result.current.createOrbital(
        { x: 200, y: 200, z: 0 }, // center
        50,  // radius
        1,   // speed
      );
      
      pathFollowerId = result.current.createPathFollower(
        [
          { x: 100, y: 100, z: 0 },
          { x: 200, y: 100, z: 0 },
          { x: 200, y: 200, z: 0 },
          { x: 100, y: 200, z: 0 }
        ],
        2,   // speed
        true // loop
      );
    });
    
    const projectile = result.current.getObject(projectileId);
    const orbital = result.current.getObject(orbitalId);
    const pathFollower = result.current.getObject(pathFollowerId);
    
    expect(projectile).toBeDefined();
    expect(orbital).toBeDefined();
    expect(pathFollower).toBeDefined();
    
    // For orbital object behavior test
    if (orbital && orbital.userData) {
      expect(orbital.userData.behaviorType).toBe('orbital');
      expect(orbital.userData.orbitRadius).toBe(50);
    }
    
    // For path follower behavior test
    if (pathFollower && pathFollower.userData) {
      expect(pathFollower.userData.behaviorType).toBe('path-following');
      expect(pathFollower.userData.pathPoints.length).toBe(4);
      expect(pathFollower.userData.pathLoop).toBe(true);
    }
    
    // Run some physics steps to ensure behaviors are applied
    act(() => {
      result.current.step(16/1000); // 16ms in seconds
      result.current.step(16/1000);
    });
  });

  test('force generators create expected vectors', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    // Test gravity force
    const gravityForce = result.current.forces.gravity(10);
    expect(gravityForce.y).toBeGreaterThan(0); // Gravity pulls down
    
    // Test wind force
    const windForce = result.current.forces.wind(5, { x: 1, y: 0, z: 0 });
    expect(windForce.x).toBeGreaterThan(0);
    expect(windForce.y).toBe(0);
    
    // Test drag force
    const dragForce = result.current.forces.drag({ x: 10, y: 0, z: 0 }, 0.1);
    expect(dragForce.x).toBeLessThan(0); // Drag opposes velocity
    
    // Test attraction force
    const attractionForce = result.current.forces.attraction(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      100
    );
    expect(attractionForce.x).toBeGreaterThan(0);
    
    // Test explosion force
    const explosionForce = result.current.forces.explosion(
      { x: 10, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      100,
      20
    );
    expect(explosionForce.x).toBeGreaterThan(0);
  });

  test('can apply forces and impulses to objects', () => {
    const { result } = renderHook(() => useGamePhysics({
      autoStart: false,
      useRAF: false
    }));
    
    let objectId: string;
    
    act(() => {
      objectId = result.current.addObject({
        shape: 'circle',
        position: { x: 100, y: 100, z: 0 },
        radius: 20,
        mass: 1,
        velocity: { x: 0, y: 0, z: 0 }
      });
    });
    
    // Apply force
    act(() => {
      result.current.applyForce(objectId, { x: 100, y: 0, z: 0 });
      result.current.step(16/1000); // Run a physics step
    });
    
    let object = result.current.getObject(objectId);
    expect(object?.velocity.x).toBeGreaterThan(0);
    
    // Reset velocity
    act(() => {
      result.current.setVelocity(objectId, { x: 0, y: 0, z: 0 });
    });
    
    object = result.current.getObject(objectId);
    expect(object?.velocity.x).toBe(0);
    
    // Apply impulse
    act(() => {
      result.current.applyImpulse(objectId, { x: 0, y: -100, z: 0 });
    });
    
    object = result.current.getObject(objectId);
    expect(object?.velocity.y).toBeLessThan(0);
  });
});