import React, { useRef } from 'react';
import {
  useMagneticElement,
  MagneticElementOptions,
  // MagneticElementResult, // Unused?
} from '../../../src/animations/physics/useMagneticElement';
// Replace MUI imports
import { Box } from '../../../src/components/Box'; 
import { Paper } from '../../../src/components/Paper'; 
import { Typography } from '../../../src/components/Typography'; 

// Configuration for the magnetic effect
const magneticOptions: MagneticElementOptions = {
  strength: 0.3, // How strongly it attracts (0 to 1)
  radius: 80, // Correct property name for distance
  mass: 1, // Mass factor for physics calculations (higher = more inertia)
  // debug: false, // Removed - Not a valid option
  // Add other valid options from MagneticEffectOptions/MagneticElementOptions as needed
  // e.g., type: 'attract', easeFactor: 0.15, maxDisplacement: 50
};

export const MagneticElementDemo: React.FC = () => {
  // const containerRef = useRef<HTMLDivElement>(null); // No longer needed here

  // Call the hook with the options object
  const { elementRef, isActive, transform } = useMagneticElement<HTMLDivElement>(magneticOptions);

  return (
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Magnetic Element Demo
      </Typography>
      <Typography variant="body2" style={{ marginBottom: '24px' }}>
        Move your mouse pointer near the blue square. It will be attracted
        towards the pointer. Current active state: {isActive ? 'Active' : 'Inactive'}
      </Typography>
      <Box
        // ref={containerRef} // Container ref might not be needed for basic use
        style={{
          width: '100%',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed grey',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={elementRef} // Assign the ref returned by the hook
          style={{
            width: 50,
            height: 50,
            backgroundColor: isActive ? '#6366F1' : '#1976d2', // Change color when active
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            position: 'relative',
            willChange: 'transform',
            // Apply transform directly if not handled by the hook internally
            // transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
          }}
        >
          Magnet
        </Box>
      </Box>
    </Paper>
  );
}; 