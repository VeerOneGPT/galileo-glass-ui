import React, { CSSProperties } from 'react';
import {
  use3DTransform,
  Transform3DOptions,
  Transform3DState,
} from '../../../src/animations/physics/use3DTransform';
import { Box } from '../../../src/components/Box';
import { Paper } from '../../../src/components/Paper';
import { Typography } from '../../../src/components/Typography';
import { Button } from '../../../src/components/Button';

// Initial state
const initialState: Partial<Transform3DState> = {
  translate: { x: 0, y: 0, z: 0 },
  rotate: { x: -10, y: 15, z: 0 }, // Start slightly rotated
  scale: { x: 1, y: 1, z: 1 },
};

// Target state for animation
const targetState: Partial<Transform3DState> = {
  translate: { x: 0, y: 0, z: 50 }, // Move forward
  rotate: { x: 0, y: -25, z: 10 }, // Rotate differently
  scale: { x: 1.1, y: 1.1, z: 1.1 }, // Scale up slightly
};

// Hook options
const transformOptions: Transform3DOptions = {
  initialTranslate: initialState.translate,
  initialRotate: initialState.rotate,
  initialScale: initialState.scale,
  transformOrigin: 'center center',
  enablePhysics: true, // Use spring physics
  physicsConfig: { tension: 180, friction: 18 }, // Wobbly preset values
};

export const DimensionalElementDemo: React.FC = () => {
  // Use the hook with physics enabled
  const { elementRef, style, setTransform, transformState } = use3DTransform<HTMLDivElement>(transformOptions);

  // Function to toggle between states
  const toggleState = () => {
    // Check if we are closer to the target state or initial state
    const isAtTarget = Math.abs(transformState.rotate.y - (targetState.rotate?.y ?? 0)) < 1;
    setTransform(isAtTarget ? initialState : targetState);
  };

  return (
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Dimensional Element Demo (use3DTransform)
      </Typography>
      <Typography variant="body2" style={{ marginBottom: '16px' }}>
        Click the button to animate the element between two 3D states
        using spring physics.
      </Typography>
      <Button onClick={toggleState} style={{ marginBottom: '24px' }}>
        Toggle 3D State
      </Button>
      <Box
        // Container with style prop
        style={{ 
          width: '100%',
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed grey',
          borderRadius: '4px',
          position: 'relative',
          perspective: '800px', 
        }}
      >
        <Box
          ref={elementRef} 
          // Apply style from hook and base styles
          style={{ 
            width: 120,
            height: 120,
            // Use basic colors or theme variables
            backgroundColor: '#9c27b0', // Example: secondary purple
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.1rem',
            position: 'relative',
            // Spread the style object from the hook
            ...(style as CSSProperties), 
          }}
        >
          Transform Me
        </Box>
      </Box>
    </Paper>
  );
}; 