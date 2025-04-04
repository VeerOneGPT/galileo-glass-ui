import React, { useRef, CSSProperties } from 'react';
import {
  useGesturePhysics,
  GesturePhysicsOptions,
  // GestureTransform, // Unused?
} from '../../../src/animations/physics/gestures/useGesturePhysics';
// Replace MUI imports
import { Box } from '../../../src/components/Box'; 
import { Paper } from '../../../src/components/Paper'; 
import { Typography } from '../../../src/components/Typography'; 

export const GesturePhysicsDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  // Define options for the hook
  const gestureOptions: GesturePhysicsOptions = {
    elementRef: draggableRef as React.RefObject<HTMLElement>,
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
    // Use basic colors or theme variables
    backgroundColor: '#1976d2', // Example: primary blue
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
    // Use Galileo components with style prop
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Gesture Physics Demo
      </Typography>
      <Typography variant="body2" style={{ marginBottom: '24px' }}>
        Click and drag the blue circle. Flick it to see momentum.
        It should stay within the dashed container bounds.
      </Typography>
      <Box
        ref={containerRef}
        style={{ // Use style prop
          width: '100%',
          height: '300px',
          border: '1px dashed grey',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box ref={draggableRef} style={draggableStyle}> {/* Use style prop */}
          Drag Me
        </Box>
      </Box>
    </Paper>
  );
}; 