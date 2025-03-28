/**
 * Example demonstrating the Collision Detection and Response System
 * 
 * This example shows how to use the collision system with React components
 * to create interactive physics-based elements.
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  getCollisionSystem,
  resetCollisionSystem,
  createCollisionCircle,
  createCollisionRectangle,
  createCollisionBoundaries,
  updateCollisionBody,
  updateCollisionSystem,
  CollisionMaterials,
  CollisionBody
} from '../index';

// Container for the physics simulation
const PhysicsContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Styled ball with glass effect
const Ball = styled.div<{ $x: number; $y: number; $radius: number; $color: string }>`
  position: absolute;
  width: ${(props) => props.$radius * 2}px;
  height: ${(props) => props.$radius * 2}px;
  border-radius: 50%;
  transform: translate(${(props) => props.$x - props.$radius}px, ${(props) => props.$y - props.$radius}px);
  background: ${(props) => props.$color};
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  transition: transform 0.05s linear;
`;

// Styled rectangle with glass effect
const Rectangle = styled.div<{ $x: number; $y: number; $width: number; $height: number; $color: string }>`
  position: absolute;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  border-radius: 4px;
  transform: translate(${(props) => props.$x - props.$width / 2}px, ${(props) => props.$y - props.$height / 2}px);
  background: ${(props) => props.$color};
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  transition: transform 0.05s linear;
`;

// Control panel for interactive elements
const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-top: 16px;
`;

// Button for adding objects
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background: linear-gradient(to right, #4a90e2, #6a5acd);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(to right, #5a9ff2, #7a6add);
  }
`;

interface PhysicsObject {
  id: string;
  body: CollisionBody;
  color: string;
}

// Main collision physics example component
export const CollisionSystemExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [objects, setObjects] = useState<PhysicsObject[]>([]);
  const animationRef = useRef<number>(0);
  const initialized = useRef(false);

  // Initialize physics system
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    resetCollisionSystem();
    
    // Add bounds when container is available
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      createCollisionBoundaries('bounds', 0, 0, width, height, 50);
      
      // Add initial objects
      addCircle();
      addRectangle();
    }
    
    // Start animation loop
    startAnimationLoop();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      resetCollisionSystem();
    };
  }, []);
  
  // Animation loop
  const startAnimationLoop = () => {
    const animate = () => {
      // Update physics simulation
      updateCollisionSystem();
      
      // Update component state
      setObjects(prev => prev.map(obj => {
        const body = getCollisionSystem().getBody(obj.id);
        return body ? { ...obj, body } : obj;
      }));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Add a circle to the simulation
  const addCircle = () => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const id = `circle-${Date.now()}`;
    
    // Random properties
    const radius = Math.random() * 20 + 20;
    const x = Math.random() * (width - radius * 2) + radius;
    const y = Math.random() * (height - radius * 2) + radius;
    const vx = (Math.random() - 0.5) * 10;
    const vy = (Math.random() - 0.5) * 10;
    
    // Random color
    const hue = Math.random() * 360;
    const color = `hsla(${hue}, 80%, 60%, 0.7)`;
    
    // Create physics body
    const body = createCollisionCircle(
      id,
      { x, y },
      radius,
      radius * 0.2, // Mass proportional to size
      { x: vx, y: vy },
      { material: CollisionMaterials.BOUNCY }
    );
    
    // Add to objects array
    setObjects(prev => [...prev, { id, body, color }]);
  };
  
  // Add a rectangle to the simulation
  const addRectangle = () => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const id = `rect-${Date.now()}`;
    
    // Random properties
    const rectWidth = Math.random() * 60 + 40;
    const rectHeight = Math.random() * 60 + 40;
    const x = Math.random() * (width - rectWidth) + rectWidth / 2;
    const y = Math.random() * (height - rectHeight) + rectHeight / 2;
    const vx = (Math.random() - 0.5) * 8;
    const vy = (Math.random() - 0.5) * 8;
    
    // Random color
    const hue = Math.random() * 360;
    const color = `hsla(${hue}, 70%, 60%, 0.7)`;
    
    // Create physics body
    const body = createCollisionRectangle(
      id,
      { x, y },
      rectWidth,
      rectHeight,
      rectWidth * rectHeight * 0.01, // Mass proportional to area
      { x: vx, y: vy },
      0,
      { material: CollisionMaterials.STANDARD }
    );
    
    // Add to objects array
    setObjects(prev => [...prev, { id, body, color }]);
  };
  
  // Clear all objects
  const clearObjects = () => {
    objects.forEach(obj => {
      getCollisionSystem().removeBody(obj.id);
    });
    setObjects([]);
  };
  
  return (
    <div>
      <h2>Collision Physics System Demo</h2>
      
      <PhysicsContainer ref={containerRef}>
        {objects.map(obj => {
          if (obj.body.shape === 'circle') {
            const circleData = obj.body.shapeData as { radius: number };
            return (
              <Ball
                key={obj.id}
                $x={obj.body.position.x}
                $y={obj.body.position.y}
                $radius={circleData.radius}
                $color={obj.color}
              />
            );
          } else if (obj.body.shape === 'rectangle') {
            const rectData = obj.body.shapeData as { width: number; height: number };
            return (
              <Rectangle
                key={obj.id}
                $x={obj.body.position.x}
                $y={obj.body.position.y}
                $width={rectData.width}
                $height={rectData.height}
                $color={obj.color}
              />
            );
          }
          return null;
        })}
      </PhysicsContainer>
      
      <ControlPanel>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={addCircle}>Add Circle</Button>
          <Button onClick={addRectangle}>Add Rectangle</Button>
          <Button onClick={clearObjects}>Clear All</Button>
        </div>
        <div>
          <p>Total Objects: {objects.length}</p>
          <p>
            <small>Objects will collide with each other and the container walls.</small>
          </p>
        </div>
      </ControlPanel>
    </div>
  );
};

export default CollisionSystemExample;