import React, { useRef, CSSProperties } from 'react';
import {
  useGesturePhysics,
  GesturePhysicsOptions,
  GestureTransform,
} from '../../../src/animations/physics/gestures/useGesturePhysics';
import { Box, Paper, Typography } from '@mui/material';

export const GesturePhysicsDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  // Define options for the hook
  const gestureOptions: GesturePhysicsOptions = {
    elementRef: draggableRef,
    pan: {
      enabled: true,
      momentum: 0.8,
      friction: 0.92,
    },
    swipe: {
      enabled: true,
      momentum: 1,
      friction: 0.9,
    },
  };

  // Initialize the hook
  useGesturePhysics(gestureOptions);

  // Style for the draggable element - Initial position and base styles
  const draggableStyle: CSSProperties = {
    width: 80,
    height: 80,
    backgroundColor: 'primary.main',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
    position: 'absolute',
    top: 'calc(50% - 40px)',
    left: 'calc(50% - 40px)',
    willChange: 'transform',
  };

  return (
    <Paper elevation={2} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Gesture Physics Demo
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 3 }}>
        Click and drag the blue circle. Flick it to see momentum.
        It should stay within the dashed container bounds.
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '300px',
          border: '1px dashed grey',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box ref={draggableRef} sx={draggableStyle}>
          Drag Me
        </Box>
      </Box>
    </Paper>
  );
}; 