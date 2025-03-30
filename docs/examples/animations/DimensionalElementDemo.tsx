import React, { CSSProperties } from 'react';
import {
  use3DTransform,
  Transform3DOptions,
  Transform3DState,
} from '../../../src/animations/physics/use3DTransform';
import { Box, Paper, Typography, Button } from '@mui/material';

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
    <Paper elevation={2} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Dimensional Element Demo (use3DTransform)
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        Click the button to animate the element between two 3D states
        using spring physics.
      </Typography>
      <Button onClick={toggleState} sx={{ marginBottom: 3 }}>
        Toggle 3D State
      </Button>
      <Box
        // Container for perspective
        sx={{
          width: '100%',
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed grey',
          borderRadius: '4px',
          position: 'relative',
          perspective: '800px', // Apply perspective CSS here
        }}
      >
        <Box
          ref={elementRef} // Assign ref from the hook
          sx={{
            width: 120,
            height: 120,
            backgroundColor: 'secondary.main',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.1rem',
            position: 'relative',
            // Apply the style object directly from the hook
            ...(style as CSSProperties), // Cast needed if type inference is loose
          }}
        >
          Transform Me
        </Box>
      </Box>
    </Paper>
  );
}; 