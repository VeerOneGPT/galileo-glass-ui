import React, { useState, useEffect } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider as GalileoThemeProvider, colors, typography } from '../../src/theme';
import {
    AccessibilityProvider,
    useAccessibility,
} from '../../src/components/AccessibilityProvider';
import { Typography } from '../../src/components/Typography';
import { GlassButton } from '../../src/components/Button';
import { Select } from '../../src/components/Select';
import { Checkbox } from '../../src/components/Checkbox';
import { Slider } from '../../src/components/Slider';

// Create a simple theme object to use instead of darkTheme
const theme = {
  colors: {
    text: '#FFFFFF',
    background: '#121212',
    backgroundVariant: '#1E1E1E',
    border: '#444444',
    primary: '#BB86FC'
  }
};

// --- Styled Components ---
const DemoContainer = styled.div`
  padding: 24px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
`;

const ControlsGroup = styled.div`
  margin-bottom: 30px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem; // Increased gap
  margin-bottom: 1rem;
  align-items: center;
`;

const ControlItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlLabel = styled(Typography).attrs({ variant: 'body1' })`
  margin-bottom: 0; // Remove default margin
`;

const ExampleArea = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

// --- Accessibility Controls Component (Ported from Demo) ---
const AccessibilityControls: React.FC = () => {
  const {
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    reduceTransparency,
    setReduceTransparency,
    disableAnimations,
    setDisableAnimations,
    fontScale,
    setFontScale,
    enhancedFocus,
    setEnhancedFocus,
    // Assume keyboardNavigation & screenReaderSupport exist in context if needed
  } = useAccessibility();

  // Options for Font Scale Select - convert numbers to strings for Select
  const fontScaleOptions = [
    { value: '0.75', label: 'Very Small (75%)' },
    { value: '0.9', label: 'Small (90%)' },
    { value: '1', label: 'Normal (100%)' },
    { value: '1.15', label: 'Large (115%)' },
    { value: '1.3', label: 'Very Large (130%)' },
    { value: '1.5', label: 'Extra Large (150%)' },
  ];

  // Handle onChange for the Select component
  const handleFontScaleChange = (value: string) => {
    setFontScale(parseFloat(value));
  };

  return (
    <ControlsGroup>
      <Typography variant="h4" gutterBottom>Accessibility Settings (via Context)</Typography>

      <ControlRow>
        <ControlItem>
          <Checkbox
            id="reduced-motion"
            checked={reducedMotion}
            onChange={e => setReducedMotion(e.target.checked)}
            label="Reduced Motion"
          />
        </ControlItem>
        <ControlItem>
          <Checkbox
            id="disable-animations"
            checked={disableAnimations}
            onChange={e => setDisableAnimations(e.target.checked)}
            label="Disable Animations"
          />
        </ControlItem>
      </ControlRow>

       <ControlRow>
        <ControlItem>
          <Checkbox
            id="high-contrast"
            checked={highContrast}
            onChange={e => setHighContrast(e.target.checked)}
            label="High Contrast"
          />
        </ControlItem>
         <ControlItem>
          <Checkbox
            id="reduce-transparency"
            checked={reduceTransparency}
            onChange={e => setReduceTransparency(e.target.checked)}
            label="Reduce Transparency"
          />
        </ControlItem>
         <ControlItem>
          <Checkbox
            id="enhanced-focus"
            checked={enhancedFocus}
            onChange={e => setEnhancedFocus(e.target.checked)}
            label="Enhanced Focus"
          />
        </ControlItem>
      </ControlRow>

      <ControlRow>
        <ControlItem style={{ flexGrow: 1 }}>
          <ControlLabel as="label" htmlFor="font-scale-select">Font Scale:</ControlLabel>
          <Select
            value={fontScale.toString()}
            onChange={handleFontScaleChange}
            options={fontScaleOptions}
          />
          <ControlLabel>({Math.round(fontScale * 100)}%)</ControlLabel>
        </ControlItem>
      </ControlRow>
        {/* Add sliders or other controls if needed, e.g.: */}
       {/*
       <ControlRow>
           <ControlItem style={{ flexGrow: 1 }}>
             <ControlLabel>Font Scale (Slider):</ControlLabel>
             <Slider
               min={0.75}
               max={1.5}
               step={0.05}
               value={fontScale}
               onChange={e => setFontScale(parseFloat(e.target.value))}
             />
              <ControlLabel style={{ minWidth: '50px', textAlign: 'right' }}>{Math.round(fontScale * 100)}%</ControlLabel>
            </ControlItem>
       </ControlRow>
       */}
    </ControlsGroup>
  );
};

// --- Example Component Using Context ---
const ExampleConsumer: React.FC = () => {
    const { fontScale, reducedMotion, highContrast, reduceTransparency, disableAnimations } = useAccessibility();

    const textStyle: React.CSSProperties = {
        fontSize: `${fontScale * 1}rem`,
        transition: disableAnimations || reducedMotion ? 'none' : 'font-size 0.3s ease',
    };

    const boxStyle: React.CSSProperties = {
        padding: '1rem',
        marginTop: '1rem',
        border: `2px solid ${highContrast ? '#BB86FC' : '#444444'}`,
        borderRadius: '4px',
        backgroundColor: reduceTransparency ? '#121212' : '#1E1E1Eaa',
        transition: disableAnimations || reducedMotion ? 'none' : 'all 0.3s ease',
    };

    return (
        <ExampleArea>
            <Typography variant="h5">Example Consumer</Typography>
            <Typography variant="body1" style={textStyle}>
                This text size adjusts based on the Font Scale setting ({Math.round(fontScale * 100)}%).
            </Typography>
            <div style={boxStyle}>
                <Typography variant="body2">
                   This box styling changes based on High Contrast ({highContrast ? 'On' : 'Off'}) 
                   and Reduce Transparency ({reduceTransparency ? 'On' : 'Off'}).
                   Animations are {disableAnimations ? 'Disabled' : reducedMotion ? 'Reduced' : 'Enabled'}.
                </Typography>
            </div>
        </ExampleArea>
    );
}

// --- Storybook Configuration ---
export default {
  title: 'Accessibility/AccessibilityProvider',
  component: AccessibilityProvider,
  decorators: [
    (Story) => (
      // Use GalileoThemeProvider with initialTheme prop
      <GalileoThemeProvider initialTheme="standard" initialColorMode="dark">
          <AccessibilityProvider>
            <DemoContainer>
                <Story />
            </DemoContainer>
          </AccessibilityProvider>
      </GalileoThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    notes: 'Demonstrates the AccessibilityProvider and useAccessibility hook. Controls modify the context values.',
  },
} as Meta;

// --- Story ---
export const ProviderDemo: StoryFn = () => {
  return (
    <div>
        <Typography variant="h2" gutterBottom>Accessibility Provider Demo</Typography>
        <Typography variant="body1" gutterBottom>
            Use the controls below to modify the accessibility settings provided by the `AccessibilityProvider` context.
            The \"Example Consumer\" section uses the `useAccessibility` hook to react to these changes.
        </Typography>
        <AccessibilityControls />
        <ExampleConsumer />
    </div>
  );
};
ProviderDemo.storyName = 'Provider and Hook Demo'; 