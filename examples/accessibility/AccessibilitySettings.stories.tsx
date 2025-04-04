import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
// Use local imports instead of galileo-glass-ui
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { AccessibilitySettings, AccessibilitySettingsProps } from '../../src/components/AccessibilitySettings';
import { AccessibilityProvider } from '../../src/components/AccessibilityProvider';
import { GlassButton } from '../../src/components/Button';
import { Typography } from '../../src/components/Typography';

// --- Styled Components (Optional Wrapper) ---
const StoryContainer = styled.div`
  padding: 2rem;
  min-height: 300px; // Ensure space for the button
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const InfoText = styled(Typography).attrs({ variant: 'body1' })`
  margin-bottom: 1.5rem;
`;

// --- Storybook Configuration ---
export default {
  title: 'Accessibility/AccessibilitySettings',
  component: AccessibilitySettings,
  decorators: [
    (Story) => (
      // Use ThemeProvider with proper props
      <ThemeProvider initialColorMode="dark" initialTheme="standard">
        <AccessibilityProvider>
            <StoryContainer>
                <Story />
            </StoryContainer>
        </AccessibilityProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'onClose' }, // Actions are logged without control type
    onChange: { action: 'onChange' }, // Actions are logged without control type
    // Add other relevant argTypes from AccessibilitySettingsProps if needed
  },
} as Meta<typeof AccessibilitySettings>;

// --- Template ---
// Use the imported props type
interface SettingsArgs extends AccessibilitySettingsProps {}

const Template: StoryFn<SettingsArgs> = (args) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleOpen = () => {
      console.log('Opening Settings Panel');
      setShowSettings(true);
  };

  const handleClose = () => {
      console.log('Closing Settings Panel');
      setShowSettings(false);
      args.onClose?.(); // Log action
  };

  const handleChange = (settings: any) => {
      // Log action with settings data
      action('onChange')(settings);
      args.onChange?.(settings);
  };

  return (
    <div>
        <Typography variant="h3" gutterBottom>Accessibility Settings Component</Typography>
        <InfoText>
            Click the button below to open the accessibility settings panel.
            The panel relies on the `AccessibilityProvider` context (included in decorators).
            Check the Storybook Actions tab for `onChange` events.
        </InfoText>

        {!showSettings && (
            <GlassButton
                variant="contained"
                onClick={handleOpen}
                aria-label="Open Accessibility Settings"
            >
                Open Accessibility Settings
            </GlassButton>
        )}

        {showSettings && (
            <div style={{
                // Basic modal-like presentation for the story
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px', // Padding around the settings component
            }}>
                 {/* Render the actual component */} 
                 <AccessibilitySettings
                    {...args} // Pass any args from Storybook controls
                    onClose={handleClose}
                    onChange={handleChange}
                 />
            </div>
        )}
    </div>
  );
};

// --- Stories ---
export const Default = Template.bind({});
Default.args = {
  // Default props for AccessibilitySettings can be set here if needed
  // e.g., initialSettings: { motionSensitivity: 'reduced' }
}; 