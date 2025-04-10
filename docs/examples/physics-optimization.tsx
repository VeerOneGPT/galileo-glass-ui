/**
 * Physics Optimization Example
 * 
 * This example demonstrates best practices to prevent "Maximum update depth exceeded"
 * errors when using physics hooks in React components.
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Card,
  useGesturePhysics
} from '@veerone/galileo-glass-ui';

// Force import the physics hook directly from its location
// eslint-disable-next-line @typescript-eslint/no-var-requires
const useGalileoPhysicsEngine = require('@veerone/galileo-glass-ui').useGalileoPhysicsEngine;

/**
 * Common issues that lead to Maximum Update Depth errors:
 * 
 * 1. Updating state on every frame without throttling
 * 2. Creating circular update patterns between state updates and physics
 * 3. Missing dependencies in useEffect/useCallback leading to stale closures
 * 4. Synchronous state updates triggered by physics callbacks
 */

const PhysicsOptimizationDemo: React.FC = () => {
  // State for body positions
  const [bodies, setBodies] = useState<{[id: string]: {x: number, y: number}}>({});
  
  // References to track update timing and prevent too frequent updates
  const frameCountRef = useRef(0);
  const frameThrottleRef = useRef(5); // Only update state every N frames
  const lastUpdateTimeRef = useRef(0);
  const minUpdateIntervalRef = useRef(1000 / 30); // Cap at 30 state updates/sec
  const isUpdatingRef = useRef(false); // Prevent update loops
  
  // Initialize physics engine
  const physics = useGalileoPhysicsEngine({
    gravity: { x: 0, y: 0.2 },
    bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400, bounce: 0.7 }
  });
  
  // Create some physics bodies
  useEffect(() => {
    if (!physics) return;
    
    // Create some bodies
    const bodyIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const id = physics.addBody({
        id: `ball-${i}`,
        position: { x: 100 + i * 80, y: 100 },
        velocity: { x: 0, y: 0 },
        mass: 1,
        isStatic: false,
        shape: { type: 'circle', radius: 20 }
      });
      bodyIds.push(id);
    }
    
    // Start physics simulation
    physics.start();
    
    return () => {
      // Clean up bodies
      bodyIds.forEach(id => physics.removeBody(id));
      physics.stop();
    };
  }, [physics]);
  
  // GOOD PATTERN: Throttled update function using requestAnimationFrame
  const updateBodyStates = useCallback(() => {
    if (!physics || isUpdatingRef.current) return;
    
    requestAnimationFrame(() => {
      // Skip if component unmounted or already updating
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      
      try {
        // Get current time to throttle updates
        const now = performance.now();
        
        // Skip if updating too frequently
        if (now - lastUpdateTimeRef.current < minUpdateIntervalRef.current) {
          isUpdatingRef.current = false;
          return;
        }
        
        // Increment frame counter
        frameCountRef.current++;
        
        // Only update state every N frames
        if (frameCountRef.current % frameThrottleRef.current !== 0) {
          isUpdatingRef.current = false;
          return;
        }
        
        // Record update time
        lastUpdateTimeRef.current = now;
        
        // Get all body states
        const allBodyStates = physics.getAllBodyStates();
        const updatedBodies: {[id: string]: {x: number, y: number}} = {};
        
        // Extract position data
        allBodyStates.forEach((state, id) => {
          updatedBodies[id] = {
            x: state.position.x,
            y: state.position.y
          };
        });
        
        // Update state (only once per several frames)
        setBodies(updatedBodies);
      } finally {
        isUpdatingRef.current = false;
      }
    });
  }, [physics]);
  
  // Subscribe to physics updates
  useEffect(() => {
    if (!physics) return;
    
    // Setup animation loop for updates
    let animationFrameId: number;
    const loop = () => {
      updateBodyStates();
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [physics, updateBodyStates]);
  
  return (
    <div style={{ width: 600, height: 400, background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
      {/* Render bodies */}
      {Object.entries(bodies).map(([id, position]) => (
        <div 
          key={id}
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'purple',
            left: position.x - 20,
            top: position.y - 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        />
      ))}
      
      {/* Best practices summary */}
      <Card
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          width: 300,
          padding: 10,
        }}
      >
        <h4>Best Practices</h4>
        <ul style={{ fontSize: 12 }}>
          <li>Throttle state updates (only update every N frames)</li>
          <li>Use requestAnimationFrame rather than setTimeout</li>
          <li>Implement min time between updates</li>
          <li>Use refs to prevent update loops</li>
          <li>Batch related state updates together</li>
        </ul>
      </Card>
    </div>
  );
};

export default PhysicsOptimizationDemo; 