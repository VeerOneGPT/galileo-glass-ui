import React, { useRef, useCallback } from 'react';
import {
  useGameParticles,
  GameParticlesHookConfig,
  GameEventType, // Import event types
} from '../../../src/animations/physics/useGameParticles'; // Corrected path and hook name
import { Box, Paper, Typography, Button } from '@mui/material';

// Hook configuration - primarily setting the container and event type
const hookConfig: GameParticlesHookConfig = {
  // containerRef: containerRef, // We can associate it with a container if needed
  defaultEventType: GameEventType.REWARD, // Use the REWARD preset (likely confetti-like)
  // systemConfig can be used for deeper customization if presets aren't enough
  // systemConfig: { ... }
};

export const ParticleEffectDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the general area
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize the particle hook
  const { actions } = useGameParticles({
    ...hookConfig,
    containerRef: containerRef, // Assign container ref here
  });

  // Callback for the button click
  const handleEmit = useCallback(
    (event: React.MouseEvent) => {
      if (actions) {
        // Trigger the REWARD preset event at the mouse click location
        actions.triggerEvent(GameEventType.REWARD, event);
      }
    },
    [actions]
  );

  return (
    <Paper elevation={2} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Particle Effect Demo (useGameParticles)
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 3 }}>
        Click the button to trigger a particle effect using the REWARD preset.
      </Typography>
      <Box
        ref={containerRef} // Assign ref to the container Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '150px',
          position: 'relative', // Needed for particle positioning relative to container
          border: '1px dashed lightgrey', // Optional: visualize container
          borderRadius: '4px',
        }}
      >
        <Button ref={buttonRef} variant="contained" onClick={handleEmit}>
          Emit Reward Particles!
        </Button>
        {/* The useGameParticles hook manages rendering within the containerRef */}
      </Box>
    </Paper>
  );
}; 