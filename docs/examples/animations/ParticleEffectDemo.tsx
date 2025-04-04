import React, { useRef, useCallback } from 'react';
import {
  useGameParticles,
  GameParticlesHookConfig,
  GameEventType, // Import event types
} from '../../../src/animations/physics/useGameParticles'; // Corrected path and hook name
import { Box } from '../../../src/components/Box';
import { Paper } from '../../../src/components/Paper';
import { Typography } from '../../../src/components/Typography';
import { Button } from '../../../src/components/Button';

// Hook configuration - primarily setting the container and event type
const hookConfig: GameParticlesHookConfig = {
  // containerRef: containerRef, // We can associate it with a container if needed
  defaultEventType: GameEventType.REWARD, // Use the REWARD preset (likely confetti-like)
  // systemConfig can be used for deeper customization if presets aren't enough
  // systemConfig: { ... }
};

export const ParticleEffectDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize the particle hook
  const { actions } = useGameParticles({
    ...hookConfig,
    // Keep the type assertion for the hook
    containerRef: containerRef as React.RefObject<HTMLElement>, 
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
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Particle Effect Demo (useGameParticles)
      </Typography>
      <Typography variant="body2" style={{ marginBottom: '24px' }}>
        Click the button to trigger a particle effect using the REWARD preset.
      </Typography>
      <Box
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '150px',
          position: 'relative',
          border: '1px dashed lightgrey',
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