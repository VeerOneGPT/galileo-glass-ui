/**
 * Shooting Demo with Gesture Physics
 * 
 * This example demonstrates how to properly use the useGesturePhysics hook
 * in conjunction with useGalileoPhysicsEngine for shooting mechanics.
 */
import React, { useRef, useState, useEffect } from 'react';
import { 
  Card,
  // Use dynamic imports from main package with type assertions
  useGesturePhysics,
  GesturePhysicsPreset
} from '@veerone/galileo-glass-ui';

// Force import the physics hook directly from its location
// eslint-disable-next-line @typescript-eslint/no-var-requires
const useGalileoPhysicsEngine = require('@veerone/galileo-glass-ui').useGalileoPhysicsEngine;

// Types
import type { 
  PhysicsBodyOptions, 
  PhysicsBodyState, 
  Vector2D, 
  GestureTransform 
} from '@veerone/galileo-glass-ui';

// Define the correct event type expected by the hook
interface GestureEvent {
  position: Vector2D;
  velocity?: Vector2D;
  distance?: number;
  direction?: Vector2D;
  // Add other properties as needed
}

const ShootingDemo: React.FC = () => {
  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  
  // State for ball position
  const [ballPosition, setBallPosition] = useState<Vector2D>({ x: 150, y: 150 });
  const [ballRotation, setBallRotation] = useState<number>(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState<Vector2D[]>([]);
  
  // Initialize physics engine
  const physicsApi = useGalileoPhysicsEngine({
    gravity: { x: 0, y: 0.2 }, // Light gravity
    friction: 0.05,
    bounds: {
      minX: 0,
      minY: 0,
      maxX: 600,
      maxY: 400,
      bounce: 0.7
    }
  });
  
  // Setup ball physics body
  useEffect(() => {
    if (!physicsApi) return;
    
    // Create ball physics body
    const ballOptions: PhysicsBodyOptions = {
      id: 'ball',
      position: { x: 150, y: 150 },
      velocity: { x: 0, y: 0 },
      mass: 1,
      friction: 0.02,
      restitution: 0.8,
      isStatic: false,
      shape: {
        type: 'circle',
        radius: 20
      }
    };
    
    physicsApi.createBody(ballOptions);
    
    // Subscribe to position updates
    const unsubscribe = physicsApi.subscribeToBody('ball', (state: PhysicsBodyState) => {
      setBallPosition(state.position);
      setBallRotation(state.angle || 0);
    });
    
    // Start the physics simulation
    physicsApi.start();
    
    return () => {
      unsubscribe();
      physicsApi.removeBody('ball');
      physicsApi.stop();
    };
  }, [physicsApi]);
  
  // Track gesture state for drag and release
  const isDraggingRef = useRef(false);
  const gestureStartPosRef = useRef<Vector2D>({ x: 0, y: 0 });
  
  // Setup gesture physics for dragging and shooting
  const { style: gestureStyle } = useGesturePhysics({
    elementRef: containerRef as React.RefObject<HTMLElement>,
    preset: GesturePhysicsPreset.RESPONSIVE,
    disableScroll: true,
    
    // Pan gesture config (for aiming)
    pan: {
      enabled: true,
      // Override default gesture behavior to implement custom shooting
      onStart: (event: any) => {
        // Record gesture start position
        gestureStartPosRef.current = { 
          x: event.position?.x || event.xy?.[0] || 0, 
          y: event.position?.y || event.xy?.[1] || 0 
        };
        isDraggingRef.current = true;
        
        // Optionally pause physics while aiming
        physicsApi.pause();
        
        // Reset the ball to initial position while aiming
        physicsApi.setBodyState('ball', {
          position: { x: 150, y: 150 },
          velocity: { x: 0, y: 0 },
          angle: 0
        });
      },
      
      onChange: (event: any, state: any) => {
        if (!isDraggingRef.current) return;
        
        // Calculate aim direction from gesture movement
        const currentPos = { 
          x: event.position?.x || event.xy?.[0] || 0, 
          y: event.position?.y || event.xy?.[1] || 0 
        };
        
        // Update trajectory for visual feedback (reverse direction to "pull back and shoot")
        const deltaX = gestureStartPosRef.current.x - currentPos.x;
        const deltaY = gestureStartPosRef.current.y - currentPos.y;
        
        // Scale for better visualization
        const aimTarget = {
          x: 150 + deltaX * 0.5, 
          y: 150 + deltaY * 0.5
        };
        
        // Update trajectory line
        setTrajectoryPoints([ballPosition, aimTarget]);
      },
      
      onEnd: (event: any) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        
        // Calculate velocity from gesture movement
        const endPos = { 
          x: event.position?.x || event.xy?.[0] || 0, 
          y: event.position?.y || event.xy?.[1] || 0 
        };
        const startPos = gestureStartPosRef.current;
        
        // Calculate delta (reverse direction for "pull back and shoot")
        const deltaX = startPos.x - endPos.x;
        const deltaY = startPos.y - endPos.y;
        
        // Calculate velocity vector, scale based on gesture length
        // The multiplier controls shooting power
        const velocityMultiplier = 0.1;
        const velocity = {
          x: deltaX * velocityMultiplier,
          y: deltaY * velocityMultiplier
        };
        
        // Apply impulse to the ball
        physicsApi.applyImpulse('ball', velocity);
        physicsApi.resume();
        
        // Clear trajectory
        setTrajectoryPoints([]);
      }
    }
  });
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '600px', 
        height: '400px', 
        background: 'rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        ...gestureStyle 
      }}
    >
      {/* Ball */}
      <div
        ref={ballRef}
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #4338CA)',
          left: ballPosition.x - 20,
          top: ballPosition.y - 20,
          transform: `rotate(${ballRotation}rad)`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      />
      
      {/* Trajectory line */}
      {trajectoryPoints.length === 2 && (
        <svg 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none' 
          }}
        >
          <line
            x1={trajectoryPoints[0].x}
            y1={trajectoryPoints[0].y}
            x2={trajectoryPoints[1].x}
            y2={trajectoryPoints[1].y}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )}
      
      {/* Instructions */}
      <Card
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '200px',
          pointerEvents: 'none'
        }}
      >
        <p>Drag to aim and release to shoot</p>
      </Card>
    </div>
  );
};

export default ShootingDemo; 