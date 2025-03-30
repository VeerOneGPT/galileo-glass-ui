import React, { useState } from 'react';
import {
  usePhysicsInteraction,
} from '../../../src/hooks/usePhysicsInteraction'; // Corrected relative path
import {
  useAnimationContext,
  AnimationProvider,
} from '../../../src/contexts/AnimationContext'; // Corrected relative path
import { SpringPresets } from '../../../src/animations/physics/springPhysics'; // Corrected relative path
import { Button, Box, FormControlLabel, Checkbox, Select, MenuItem, Typography, Paper } from '@mui/material'; // Using MUI for UI controls

// Helper to get preset names (assuming SpringPresets is an object)
const presetNames = Object.keys(SpringPresets || {});

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

  const { ref, style, eventHandlers } = usePhysicsInteraction<HTMLButtonElement>(physicsOptions);

  return (
    <Paper elevation={2} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configurable Physics Button
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
        <Button
          ref={ref}
          style={style} // Apply physics styles
          {...eventHandlers} // Apply interaction handlers
          variant="contained"
          sx={{ minWidth: 150, minHeight: 40 }} // Ensure size
        >
          Physics Button
        </Button>
      </Box>

      <Typography variant="subtitle1" gutterBottom>Controls:</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={isDisabled} onChange={(e) => setIsDisabled(e.target.checked)} />}
          label="Disable Animation (reducedMotion: true)"
        />
        <FormControlLabel
          control={<Checkbox checked={affectsScale} onChange={(e) => setAffectsScale(e.target.checked)} />}
          label="Affect Scale"
        />
        {/* Add controls for scaleAmplitude, preset selection etc. */} 
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1}}>
           <Typography variant="body2">Preset:</Typography>
           <Select 
              value={configPreset}
              onChange={(e) => setConfigPreset(e.target.value as string)}
              size="small"
              sx={{ minWidth: 120 }}
           >
             {presetNames.map((name) => (
               <MenuItem key={name} value={name}>{name}</MenuItem>
             ))}
           </Select>
        </Box>
        {/* Example showing context default */} 
        <Typography variant="caption" sx={{ marginTop: 2}}>
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