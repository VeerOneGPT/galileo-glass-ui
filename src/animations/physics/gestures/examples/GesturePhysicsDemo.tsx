/**
 * Gesture Physics Demo
 * 
 * Demonstrates the gesture physics system with various interactive examples
 * showing inertia, momentum, elastic boundaries, and multi-touch gestures.
 */

import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useGesturePhysics, GesturePhysicsPreset } from '../useGesturePhysics';
import { useGestureWithInertia } from '../useGestureWithInertia';
import { GestureType } from '../GestureDetector';
import { Vector2D } from '../../types';
import { accessibleAnimation } from '../../../accessibility/accessibleAnimation';

// Styled components for demo
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DemoTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #333;
`;

const DemoDescription = styled.p`
  margin-top: 0;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
`;

const InteractionArea = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background-color: #f0f5ff;
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
`;

const DraggableElement = styled.div<{ $color: string }>`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: ${props => props.$color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const GlassElement = styled.div`
  position: absolute;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const ControlPanel = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 12px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #3451d1;
  }
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Grid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(to right, rgba(74, 108, 247, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(74, 108, 247, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
  }
`;

const SnapPoint = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(74, 108, 247, 0.5);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

/**
 * Basic inertia demo component using useGestureWithInertia
 */
const InertiaDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragData, setDragData] = useState({ distance: 0, velocity: { x: 0, y: 0 } });
  
  // Calculate snap points in a grid
  const snapPoints: Vector2D[] = [];
  for (let x = 80; x <= 720; x += 80) {
    for (let y = 80; y <= 220; y += 80) {
      snapPoints.push({ x, y });
    }
  }
  
  // Use the gesture with inertia hook
  const {
    position,
    isGestureActive,
    isInertiaActive,
    moveTo,
    snapToPoint
  } = useGestureWithInertia({
    elementRef: containerRef,
    initialPosition: { x: 200, y: 150 },
    enablePan: true,
    enableSwipe: true,
    inertiaStrength: 1.2,
    decelerationRate: 0.95,
    boundaries: {
      x: { min: 40, max: 760 },
      y: { min: 40, max: 260 }
    },
    snapPoints,
    snapThreshold: 30,
    onMove: (pos, source) => {
      // For demo purposes, we'll calculate and display some data
      if (source === 'gesture') {
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        setDragData({
          distance,
          velocity: {
            x: dx * 60, // rough approximation of velocity
            y: dy * 60
          }
        });
      }
    }
  });
  
  return (
    <Card>
      <DemoTitle>Inertia & Snap Points</DemoTitle>
      <DemoDescription>
        Drag and release to see inertial motion. The element will snap to grid points when released nearby.
        Flick quickly for more momentum.
      </DemoDescription>
      
      <InteractionArea ref={containerRef}>
        <Grid />
        
        {/* Show snap points */}
        {snapPoints.map((point, i) => (
          <SnapPoint key={i} style={{ left: point.x, top: point.y }} />
        ))}
        
        <DraggableElement
          $color="#4a6cf7"
          style={{
            transform: `translate(${position.x - 40}px, ${position.y - 40}px)`,
            transition: !isGestureActive && !isInertiaActive ? 'transform 0.3s' : 'none'
          }}
        >
          {isInertiaActive ? 'Sliding...' : isGestureActive ? 'Dragging...' : 'Drag Me'}
        </DraggableElement>
      </InteractionArea>
      
      <ControlPanel>
        <Button onClick={() => moveTo({ x: 200, y: 150 }, true)}>
          Reset Position
        </Button>
        <Button onClick={() => snapToPoint({ x: 400, y: 150 })}>
          Snap to Center
        </Button>
      </ControlPanel>
      
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
        {isGestureActive ? (
          <span>Distance: {dragData.distance.toFixed(1)}px, Velocity: {Math.sqrt(dragData.velocity.x ** 2 + dragData.velocity.y ** 2).toFixed(1)}px/s</span>
        ) : isInertiaActive ? (
          <span>Inertial movement active</span>
        ) : (
          <span>At rest</span>
        )}
      </div>
    </Card>
  );
};

/**
 * Multi-gesture demo using useGesturePhysics for pan, scale, rotate
 */
const MultiGestureDemo: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<GesturePhysicsPreset>(GesturePhysicsPreset.NATURAL);
  
  // Use the gesture physics hook
  const {
    transform,
    cssTransform,
    reset,
    style
  } = useGesturePhysics({
    elementRef,
    preset,
    mass: 1,
    tension: 200,
    friction: 20,
    
    // Enable gesture types
    pan: {
      enabled: true,
      multiplier: 1,
      inertia: true
    },
    pinch: {
      enabled: true,
      multiplier: 1,
      constraints: { min: 0.5, max: 2.5 }
    },
    rotate: {
      enabled: true,
      multiplier: 1
    },
    
    // Boundaries for movement
    boundaries: {
      x: { min: -120, max: 120 },
      y: { min: -80, max: 80 }
    }
  });
  
  return (
    <Card>
      <DemoTitle>Multi-Gesture Physics</DemoTitle>
      <DemoDescription>
        Use pan, pinch and rotate gestures on this element. Different physics presets
        affect how the element responds to your gestures.
      </DemoDescription>
      
      <InteractionArea style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <GlassElement
          ref={elementRef}
          style={{
            width: '120px',
            height: '120px',
            transform: cssTransform,
            ...(style as React.CSSProperties)
          }}
        >
          Drag, Pinch & Rotate
        </GlassElement>
      </InteractionArea>
      
      <ControlPanel>
        <Select value={preset} onChange={e => setPreset(e.target.value as GesturePhysicsPreset)}>
          <option value={GesturePhysicsPreset.RESPONSIVE}>Responsive</option>
          <option value={GesturePhysicsPreset.NATURAL}>Natural</option>
          <option value={GesturePhysicsPreset.SMOOTH}>Smooth</option>
          <option value={GesturePhysicsPreset.BOUNCY}>Bouncy</option>
          <option value={GesturePhysicsPreset.PRECISE}>Precise</option>
          <option value={GesturePhysicsPreset.ELASTIC}>Elastic</option>
          <option value={GesturePhysicsPreset.MOMENTUM}>Momentum</option>
          <option value={GesturePhysicsPreset.SNAPPY}>Snappy</option>
        </Select>
        
        <Button onClick={() => reset(true)}>
          Reset Transform
        </Button>
      </ControlPanel>
      
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
        <span>X: {transform.x.toFixed(0)}px, Y: {transform.y.toFixed(0)}px, Scale: {transform.scale.toFixed(2)}, Rotation: {transform.rotation.toFixed(0)}°</span>
      </div>
    </Card>
  );
};

/**
 * Main demo component
 */
export const GesturePhysicsDemo: React.FC = () => {
  return (
    <DemoContainer>
      <h2>Gesture Physics System</h2>
      <p>
        This demo showcases the physics-based gesture system, which provides natural-feeling
        interactions with inertia, momentum, and elastic responses.
      </p>
      
      <InertiaDemo />
      <MultiGestureDemo />
      
      <Card>
        <DemoTitle>Key Features</DemoTitle>
        <ul>
          <li><strong>Inertial Motion:</strong> Elements continue moving naturally after flicking</li>
          <li><strong>Physics Presets:</strong> Configure different motion feels with presets</li>
          <li><strong>Multi-touch Support:</strong> Pan, pinch, rotate with natural physics</li>
          <li><strong>Snap Points:</strong> Magnetic snap to grid and key positions</li>
          <li><strong>Elastic Boundaries:</strong> Soft constraints with natural bounce</li>
          <li><strong>Accessibility:</strong> Respects reduced motion preferences</li>
          <li><strong>Haptic Feedback:</strong> Optional physical feedback on devices that support it</li>
        </ul>
      </Card>
    </DemoContainer>
  );
};