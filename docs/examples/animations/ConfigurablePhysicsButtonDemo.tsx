import React, { useState } from 'react';
import {
  usePhysicsInteraction,
} from '../../../src/hooks/usePhysicsInteraction'; // Corrected relative path
import {
  useAnimationContext,
  AnimationProvider,
} from '../../../src/contexts/AnimationContext'; // Corrected relative path
import { SpringPresets } from '../../../src/animations/physics/springPhysics'; // Corrected relative path
// Replace MUI imports where possible
import { Paper } from '../../../src/components/Paper';
import { Box } from '../../../src/components/Box';
import { Typography } from '../../../src/components/Typography';
import { Button } from '../../../src/components/Button';
// Import Galileo equivalents from correct paths
import { GlassFormControl } from '../../../src/components/Form/FormControl'; 
import { GlassCheckbox } from '../../../src/components/Checkbox/Checkbox'; 
import { GlassSelect } from '../../../src/components/Select/Select'; 
// MenuItem is not needed for GlassSelect

// Helper to get preset names (assuming SpringPresets is an object)
const presetNames = Object.keys(SpringPresets || {});
// Prepare options for GlassSelect
const selectOptions = presetNames.map(name => ({ value: name, label: name }));

export const ConfigurablePhysicsButtonDemo: React.FC = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  const [configPreset, setConfigPreset] = useState<string>('DEFAULT');
  const [affectsScale, setAffectsScale] = useState(true);
  const [scaleAmplitude, setScaleAmplitude] = useState(0.05);

  // Get base context to show its default
  const baseContext = useAnimationContext();

  // Options for the hook, driven by state
  const physicsOptions = {
    animationConfig: configPreset as keyof typeof SpringPresets,
    affectsScale: affectsScale,
    scaleAmplitude: scaleAmplitude,
    reducedMotion: isDisabled, // Directly control via isDisabled state
  };

  const { ref, style } = usePhysicsInteraction<HTMLButtonElement>(physicsOptions);

  return (
    // Use Galileo Paper, Box, Typography, Button
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Configurable Physics Button
      </Typography>
      <Box style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <Button
          ref={ref}
          style={{ // Apply physics styles and base styles
            minWidth: 150, 
            minHeight: 40, 
            ...(style as React.CSSProperties) // Spread hook styles
          }} 
          variant="contained" // Keep variant if Button supports it
        >
          Physics Button
        </Button>
      </Box>

      <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>Controls:</Typography>
      {/* Use Galileo form controls */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GlassFormControl
          label="Disable Animation (reducedMotion: true)"
          control={<GlassCheckbox checked={isDisabled} onChange={(event, checked) => setIsDisabled(checked)} />}
        />
        <GlassFormControl
          label="Affect Scale"
          control={<GlassCheckbox checked={affectsScale} onChange={(event, checked) => setAffectsScale(checked)} />}
        />
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px'}}>
           <Typography variant="body2">Preset:</Typography>
           {/* Use GlassSelect with options prop */}
           <GlassSelect 
              value={configPreset}
              onChange={(value) => setConfigPreset(value as string)}
              options={selectOptions}
              size="small"
           />
        </Box>
        <Typography variant="caption" style={{ marginTop: '16px'}}>
            Base Context Default Spring: {JSON.stringify(baseContext.defaultSpring)}
        </Typography>
      </Box>
    </Paper>
  );
};

// Example of how this demo might be used within an app that already has AnimationProvider
// If used standalone, it might need its own Provider wrapper.
// const App = () => (
//   <AnimationProvider value={{ defaultSpring: 'GENTLE' }}>
//      <ConfigurablePhysicsButtonDemo />
//   </AnimationProvider>
// ); 