/**
 * Unified Physics API Example
 * 
 * This example demonstrates how to use the unified physics API to create
 * various physics-based interactions in a cohesive system.
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { GalileoPhysics } from '../unifiedPhysicsAPI';
import { useGalileoStateSpring } from '../../../hooks/useGalileoStateSpring';
import { Vector2D } from '../../physics/types';

// Import specific hooks and use them directly with their own interfaces
import { useInertialMovement2D } from '../useInertialMovement2D';

// Import SpringPresets from GalileoPhysics
const { SpringPresets } = GalileoPhysics;

// Styled components for the demo
const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 600px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
`;

const PhysicsObject = styled.div<{ $background: string }>`
  position: absolute;
  background: ${props => props.$background};
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  user-select: none;
  backdrop-filter: blur(4px);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 24px auto;
  max-width: 800px;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 16px;
  border-radius: 8px;
  max-width: 800px;
  margin: 24px auto;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
`;

/**
 * Main example component for the unified physics API
 */
export const UnifiedPhysicsAPIExample: React.FC = () => {
  // Container reference for boundaries
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse position for attractions
  const [mousePosition, setMousePosition] = useState<Vector2D>({ x: 0, y: 0 });
  
  // Demo state
  const [showCollisions, setShowCollisions] = useState(false);
  const [showSprings, setShowSprings] = useState(true);
  const [showInertial, setShowInertial] = useState(false);
  
  // Collision objects
  const [collisionBodies, setCollisionBodies] = useState<Array<{
    id: string;
    body: any;
    color: string;
    size: number;
  }>>([]);
  
  // Initialize physics systems
  useEffect(() => {
    // Reset all physics systems
    GalileoPhysics.resetCollisionSystem();
    
    // Create boundaries if container exists
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Create boundary walls
      GalileoPhysics.createBoundaries(
        'container-bounds',
        0,
        0,
        rect.width,
        rect.height,
        50 // thickness
      );
    }
    
    // Cleanup
    return () => {
      GalileoPhysics.resetCollisionSystem();
    };
  }, []);
  
  // Spring animation example
  const [isToggled, setIsToggled] = useState(false);
  const targetValue = isToggled ? 100 : 0;
  const springProps = useGalileoStateSpring(targetValue, {
    tension: 180, 
    friction: 12, 
    mass: 1,
  });
  
  // Mouse tracking for physics objects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Add a collision object
  const addCollisionObject = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const id = `body-${Date.now()}`;
    const size = 20 + Math.random() * 30;
    const x = size + Math.random() * (rect.width - size * 2);
    const y = size + Math.random() * (rect.height - size * 2);
    const hue = Math.floor(Math.random() * 360);
    const color = `hsla(${hue}, 80%, 60%, 0.8)`;
    
    // Create a circle collision body
    const body = GalileoPhysics.createCircle(
      id,
      { x, y },
      size / 2,
      size * 0.2, // mass proportional to size
      {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5
      },
      {
        material: GalileoPhysics.Materials.BOUNCY
      }
    );
    
    setCollisionBodies(prev => [...prev, { id, body, color, size }]);
  };
  
  // Remove all collision objects
  const clearCollisionObjects = () => {
    collisionBodies.forEach(obj => {
      GalileoPhysics.removeBody(obj.id);
    });
    setCollisionBodies([]);
  };
  
  // Update physics simulation
  useEffect(() => {
    if (!showCollisions) return;
    
    let animationId: number;
    
    const updatePhysics = () => {
      // Update collision detection
      GalileoPhysics.update();
      
      // Request next frame
      animationId = requestAnimationFrame(updatePhysics);
    };
    
    // Start animation loop
    animationId = requestAnimationFrame(updatePhysics);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [showCollisions, collisionBodies]);
  
  // Use the inertialMovement2D hook instead as it has position, ref and other needed props
  const inertial = useInertialMovement2D({
    initialPosition: { x: 0, y: 0 },
    config: 'DEFAULT',
    autoStart: false
  });
  
  // Create a ref for the draggable element
  const dragRef = useRef<HTMLDivElement>(null);

  // Spring animation object
  const renderSpringObject = () => {
    if (!showSprings) return null;
    
    return (
      <PhysicsObject
        $background="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
        style={{
          width: '80px',
          height: '80px',
          left: `${springProps.value}%`,
          top: '25%',
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => setIsToggled(!isToggled)}
      >
        Spring
      </PhysicsObject>
    );
  };
  
  // Inertial movement object - use the ref and position from the hook
  const renderInertialObject = () => {
    if (!showInertial) return null;
    
    // Access position directly from the hook result
    const { x, y } = inertial.position;
    
    return (
      <PhysicsObject
        ref={dragRef}
        $background="linear-gradient(135deg, #f97316 0%, #eab308 100%)"
        style={{
          width: '100px',
          height: '100px',
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%)',
          cursor: 'grab'
        }}
        // Add handlers for dragging
        onMouseDown={() => inertial.setPosition({ x, y }, true)}
      >
        Drag Me
      </PhysicsObject>
    );
  };
  
  // Render collision objects
  const renderCollisionObjects = () => {
    if (!showCollisions) return null;
    
    return collisionBodies.map(obj => {
      // Get the updated position from the physics body
      const body = GalileoPhysics.getCollisionSystem().getBody(obj.id);
      if (!body) return null;
      
      return (
        <PhysicsObject
          key={obj.id}
          $background={obj.color}
          style={{
            width: `${obj.size}px`,
            height: `${obj.size}px`,
            transform: `translate(-50%, -50%)`,
            left: `${body.position.x}px`,
            top: `${body.position.y}px`
          }}
        />
      );
    });
  };
  
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Unified Physics API Demo
      </h2>
      
      <Container ref={containerRef} onMouseMove={handleMouseMove}>
        {renderSpringObject()}
        {renderInertialObject()}
        {renderCollisionObjects()}
      </Container>
      
      <Controls>
        <div style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <ControlButton
            onClick={() => setShowSprings(!showSprings)}
          >
            {showSprings ? 'Hide' : 'Show'} Spring Example
          </ControlButton>
          <ControlButton
            onClick={() => setShowInertial(!showInertial)}
          >
            {showInertial ? 'Hide' : 'Show'} Inertial Example
          </ControlButton>
          <ControlButton
            onClick={() => setShowCollisions(!showCollisions)}
          >
            {showCollisions ? 'Hide' : 'Show'} Collision Example
          </ControlButton>
        </div>
        
        {showSprings && (
          <div style={{ width: '100%', display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <ControlButton
              onClick={() => setIsToggled(!isToggled)}
            >
              Toggle Spring
            </ControlButton>
          </div>
        )}
        
        {showCollisions && (
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <ControlButton onClick={addCollisionObject}>
              Add Collision Object
            </ControlButton>
            <ControlButton onClick={() => {
              // Add 10 objects at once
              for (let i = 0; i < 10; i++) {
                addCollisionObject();
              }
            }}>
              Add 10 Objects
            </ControlButton>
            <ControlButton onClick={clearCollisionObjects}>
              Clear Objects
            </ControlButton>
          </div>
        )}
      </Controls>
      
      <CodeBlock>
{`// Import the unified physics API
import GalileoPhysics, { 
  useGalileoStateSpring, 
  useMomentum, 
  useInertialMovement 
} from 'galileo-glass-ui/animations/physics';

// Spring animation
const springProps = useGalileoStateSpring({
  from: 0,
  to: 100,
  config: GalileoPhysics.SpringPresets.BOUNCY,
  autoStart: true
});

// Inertial movement for draggable elements
const inertial = useInertialMovement({
  friction: 0.95,
  boundaries: { left: 0, top: 0, right: width, bottom: height }
});

// Collision physics example
useEffect(() => {
  // Create physics world boundaries
  GalileoPhysics.createBoundaries('container', 0, 0, width, height);
  
  // Create a physics object
  const body = GalileoPhysics.createCircle(
    'circle1',
    { x: 100, y: 100 },  // position
    25,                  // radius
    1,                   // mass
    { x: 5, y: 2 },      // initial velocity
    {
      material: GalileoPhysics.Materials.BOUNCY
    }
  );
  
  // Update the physics simulation
  const update = () => {
    GalileoPhysics.update();
    requestAnimationFrame(update);
  };
  
  requestAnimationFrame(update);
}, []);`}
      </CodeBlock>
    </div>
  );
};

export default UnifiedPhysicsAPIExample;