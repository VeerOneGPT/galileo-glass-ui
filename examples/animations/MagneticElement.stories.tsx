import React, { useState, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, GlassBox } from '../../src/components/Box';
import { useMagneticElement } from '../../src/hooks/useMagneticElement';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

const Label = styled.label`
  font-size: 12px;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.7);
`;

const RangeInput = styled.input`
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
  }
`;

const DebugInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 4px;
  z-index: 10;
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: white;
  opacity: 0.7;
`;

function MagneticElementExample() {
  // Config state
  const [strength, setStrength] = useState(1.0);
  const [radius, setRadius] = useState(150);
  const [maxDisplacement, setMaxDisplacement] = useState(50);
  const [mode, setMode] = useState<'attract' | 'repel'>('attract');
  
  // Debug state
  const [activationCount, setActivationCount] = useState(0);
  const [currentTransform, setCurrentTransform] = useState('none');
  
  // Direct implementation for improved debugging
  const boxRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isNear, setIsNear] = useState(false);

  // For the actual hook
  const { ref, style, isActive } = useMagneticElement<HTMLDivElement>({
    strength: mode === 'attract' ? strength : -strength, // Negative strength for repel
    radius,
    maxDisplacement,
  });
  
  // Log the style and isActive status for debugging
  useEffect(() => {
    console.log('Style from magnetic hook:', style);
    console.log('Is active:', isActive);
    
    if (isActive) {
      setActivationCount(prev => prev + 1);
    }
    
    if (style.transform) {
      setCurrentTransform(style.transform);
    }
  }, [isActive, style]);

  // Direct pointer tracking for debugging and visualization
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!boxRef.current) return;
      
      // Get element bounds
      const rect = boxRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from pointer to center
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if pointer is within radius
      const withinRadius = distance < radius;
      setIsNear(withinRadius);
      
      // If within radius, calculate displacement
      if (withinRadius) {
        // Calculate force factor (1 at center, 0 at radius)
        const forceFactor = strength * (1 - Math.min(distance, radius) / radius);
        
        // Direction based on mode
        const direction = mode === 'attract' ? 1 : -1;
        
        // Calculate displacement
        let targetX = dx * forceFactor * direction;
        let targetY = dy * forceFactor * direction;
        
        // Clamp displacement
        const displacement = Math.sqrt(targetX * targetX + targetY * targetY);
        if (displacement > maxDisplacement) {
          const scale = maxDisplacement / displacement;
          targetX *= scale;
          targetY *= scale;
        }
        
        // Update position
        setPosition({ x: targetX, y: targetY });
        
        console.log('Manual calculation:', {
          distance,
          forceFactor,
          targetX,
          targetY,
          dx,
          dy
        });
      } else {
        // Reset position
        setPosition({ x: 0, y: 0 });
      }
    };
    
    // Add global mouse move handler
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [radius, strength, maxDisplacement, mode]);

  return (
    <div>
      <h2>Magnetic Element Hook Example</h2>
      <p>
        This example demonstrates the <code>useMagneticElement</code> hook, which creates a magnetic effect 
        where elements attract or repel from the cursor.
      </p>
      
      <Container>
        {/* The magnetic element with the hook */}
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '40%', 
          transform: 'translate(-50%, -50%)'
        }}>
          <GlassBox
            ref={ref}
            style={{
              ...style,
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(99, 102, 241, 0.1)',
              color: 'white',
              fontSize: '14px',
              userSelect: 'none',
              boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
            }}
          >
            {mode === 'attract' ? 'Attract' : 'Repel'}
            <br />
            {isActive ? 'ACTIVE' : 'inactive'}
          </GlassBox>
        </div>

        {/* Manual implementation for testing */}
        <div style={{ 
          position: 'absolute', 
          left: 'calc(50% + 150px)', 
          top: '40%', 
          transform: 'translate(-50%, -50%)'
        }}>
          <GlassBox
            ref={boxRef}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isNear ? 'rgba(246, 59, 130, 0.3)' : 'rgba(241, 99, 102, 0.1)',
              color: 'white',
              fontSize: '14px',
              userSelect: 'none',
              boxShadow: isNear ? '0 0 20px rgba(246, 59, 130, 0.5)' : 'none',
              transition: 'background-color 0.3s ease',
              willChange: 'transform',
            }}
          >
            Manual
            <br />
            {isNear ? 'NEAR' : 'far'}
          </GlassBox>
        </div>
        
        {/* Debug information overlay */}
        <DebugInfo>
          <div>Mode: {mode}</div>
          <div>Strength: {strength.toFixed(1)}</div>
          <div>Radius: {radius}px</div>
          <div>Max Displacement: {maxDisplacement}px</div>
          <div>Active State Changes: {activationCount}</div>
          <div>Current Transform: {currentTransform}</div>
          <div>Manual Position: {position.x.toFixed(2)}px, {position.y.toFixed(2)}px</div>
        </DebugInfo>
        
        <Instructions>
          Move cursor near the box
        </Instructions>
      </Container>
      
      {/* Controls */}
      <ControlsContainer>
        <ControlGroup>
          <Label>Mode</Label>
          <ButtonGroup>
            <Button 
              $active={mode === 'attract'} 
              onClick={() => setMode('attract')}
            >
              Attract
            </Button>
            <Button 
              $active={mode === 'repel'} 
              onClick={() => setMode('repel')}
            >
              Repel
            </Button>
          </ButtonGroup>
        </ControlGroup>
        
        <ControlGroup>
          <Label>Strength: {strength.toFixed(1)}</Label>
          <RangeInput 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1" 
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <Label>Radius: {radius}px</Label>
          <RangeInput 
            type="range" 
            min="50" 
            max="300" 
            step="10" 
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
        </ControlGroup>
        
        <ControlGroup>
          <Label>Max Displacement: {maxDisplacement}px</Label>
          <RangeInput 
            type="range" 
            min="10" 
            max="100" 
            step="5" 
            value={maxDisplacement}
            onChange={(e) => setMaxDisplacement(parseInt(e.target.value))}
          />
        </ControlGroup>
      </ControlsContainer>
      
      <h3>Usage Example</h3>
      <pre>
        {`
import React from 'react';
import { useMagneticElement } from '@veerone/galileo-glass-ui';

function MagneticComponent() {
  const { ref, style, isActive } = useMagneticElement<HTMLDivElement>({
    strength: 0.5,    // 0.1 to 1.0 (or negative for repel)
    radius: 150,      // Activation distance in pixels
    maxDisplacement: 30  // Max movement distance
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,   // Apply the style returned by the hook
        // Your other styles...
        backgroundColor: isActive ? 'blue' : 'gray'
      }}
    >
      {isActive ? 'Active!' : 'Hover near me'}
    </div>
  );
}
        `}
      </pre>
    </div>
  );
}

// Storybook Meta to define the component
const meta: Meta = {
  title: 'Animations/MagneticElement',
  component: MagneticElementExample,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An interactive demonstration of the useMagneticElement hook which creates elements that respond to cursor proximity.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// Define the story
type Story = StoryObj<typeof meta>;

export const Default: Story = {}; 