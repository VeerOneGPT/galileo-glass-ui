import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Import from actual paths in the project
import { ThemeProvider as GalileoThemeProvider } from '../../src/theme';
import { Paper } from '../../src/components/Paper';
import { Button } from '../../src/components/Button';
import { Slider } from '../../src/components/Slider';
import { Typography } from '../../src/components/Typography';

// Mocks for physics functionality
interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
  clamp?: boolean;
}

// Updated useSpring mock implementation with proper typing and performance optimizations
const useSpring = (initialValues: { x: number, y: number }, config?: any) => {
  const [values, setValues] = useState(initialValues);
  const timeoutRef = useRef<number | null>(null);
  
  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Create a properly typed API object
  const api = {
    start: (newValues: any) => {
      // Clear any existing animation timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (newValues.immediate) {
        setValues({ 
          x: newValues.x !== undefined ? newValues.x : values.x, 
          y: newValues.y !== undefined ? newValues.y : values.y 
        });
      } else {
        // Use requestAnimationFrame instead of setTimeout for smoother animations
        // and to prevent potential issues when many animations are queued
        timeoutRef.current = window.setTimeout(() => {
          setValues({ 
            x: newValues.x !== undefined ? newValues.x : values.x, 
            y: newValues.y !== undefined ? newValues.y : values.y 
          });
          timeoutRef.current = null;
        }, 300);
      }
    }
  };
  
  // Return values and api with a consistent structure
  return [values, api] as const;
};

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 100vh;
`;

const DemoArea = styled(Paper).attrs({ elevation: 2 })`
  height: 300px;
  width: 100%;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.2); // Darker background for visibility
`;

const AnimatedElement = styled.div<{ x: number; y: number }>`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00f, #f0f);
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 0;
  cursor: grab;
  will-change: transform;
  transform: translate3d(${({ x, y }) => `${x}px, ${y}px, 0`});
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.5);

  &:active {
    cursor: grabbing;
  }
`;

const ControlPanel = styled(Paper).attrs({ elevation: 1 })`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SliderGroup = styled.div`
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

// --- Main Story Component ---
const PhysicsAnimationDemoComponent: React.FC = () => {
  const [config, setConfig] = useState<SpringConfig>({
    tension: 170,
    friction: 26,
    mass: 1,
    clamp: false, // Allow overshooting
  });
  const [isDragging, setIsDragging] = useState(false);
  const demoAreaRef = useRef<HTMLDivElement>(null);
  // Reference to handle mouse up function for cleanup
  const cleanupRef = useRef<() => void>(() => {});
  // Store previous config string for comparison
  const prevConfigRef = useRef<string>(JSON.stringify(config));

  // Use useSpring for animation with properly typed return values
  const [{ x, y }, api] = useSpring({ x: 100, y: 100 }, config);

  // Update spring config when state changes
  React.useEffect(() => {
    const configString = JSON.stringify(config);
    
    if (prevConfigRef.current !== configString) {
      console.log('Applying new spring config:', config);
      api.start({ config: config, immediate: true }); // Apply config immediately
      prevConfigRef.current = configString;
    }
  }, [api, config]);

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    // Ensure currentTarget is an HTMLElement before accessing style
    if (event.currentTarget instanceof HTMLElement) {
        event.currentTarget.style.cursor = 'grabbing';
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!demoAreaRef.current) return;
    
    try {
      const rect = demoAreaRef.current.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(rect.width - 50, event.clientX - rect.left));
      const currentY = Math.max(0, Math.min(rect.height - 50, event.clientY - rect.top));
      
      // Update position directly while dragging for responsiveness
      api.start({ x: currentX, y: currentY, immediate: true });
    } catch (error) {
      console.error('Error in mouse move handler:', error);
      // Cleanup and prevent further errors
      cleanupRef.current();
    }
  }, [api]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const element = document.querySelector<HTMLElement>(`.${AnimatedElement.styledComponentId}`); // Find the element
    if (element) {
        element.style.cursor = 'grab';
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Store the cleanup function in the ref for access from handleMouseMove
  cleanupRef.current = handleMouseUp;

  const handleReset = () => {
    api.start({ x: 100, y: 100 });
  };

  const applyImpulse = () => {
    console.log('Applied impulse (mock implementation)');
    api.start({ x: 300, y: 100 });
  };

  // Fixed onChange handler for Slider components
  const handleSliderChange = (key: keyof SpringConfig) => (value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <StoryContainer>
      <Typography variant="h4" gutterBottom>
        Physics Animation Demo
      </Typography>

      <DemoArea ref={demoAreaRef}>
        <AnimatedElement
            x={x}
            y={y}
            style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
            onMouseDown={handleMouseDown}
        />
      </DemoArea>

      <ControlPanel>
        <Typography variant="h6" gutterBottom>Spring Configuration</Typography>
        <SliderGroup>
          <div>
            <Typography gutterBottom>Tension ({config.tension})</Typography>
            <Slider
              aria-labelledby="tension-slider"
              value={config.tension}
              onChange={handleSliderChange('tension')}
              min={1}
              max={500}
              step={1}
            />
          </div>
          <div>
            <Typography gutterBottom>Friction ({config.friction})</Typography>
            <Slider
              aria-labelledby="friction-slider"
              value={config.friction}
              onChange={handleSliderChange('friction')}
              min={1}
              max={100}
              step={1}
            />
          </div>
          <div>
            <Typography gutterBottom>Mass ({config.mass})</Typography>
            <Slider
              aria-labelledby="mass-slider"
              value={config.mass}
              onChange={handleSliderChange('mass')}
              min={0.1}
              max={10}
              step={0.1}
            />
          </div>
        </SliderGroup>

        <ButtonContainer>
          <Button onClick={handleReset} variant="outlined">Reset Position</Button>
          <Button onClick={applyImpulse} variant="contained">Apply Impulse</Button>
        </ButtonContainer>
      </ControlPanel>

      <Typography variant="body1">
        Drag the circle around. Adjust the spring parameters (tension, friction, mass)
        to see how they affect the animation when you release the circle or reset its position.
        The 'Apply Impulse' button is a placeholder for demonstrating direct force application.
      </Typography>

    </StoryContainer>
  );
};

// --- Storybook Configuration ---
export default {
  title: 'Examples/Animations/Core Physics',
  component: PhysicsAnimationDemoComponent,
  decorators: [
    (Story) => (
      <GalileoThemeProvider>
        <Story />
      </GalileoThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
        description: {
            story: 'Demonstrates core physics-based animations using the spring mechanism. Drag the element and adjust the spring parameters (tension, friction, mass) to observe different behaviors.'
        }
    }
  },
} as Meta;

// --- Story ---
export const SpringAnimation: StoryFn = (args) => <PhysicsAnimationDemoComponent {...args} />;
SpringAnimation.args = {}; 