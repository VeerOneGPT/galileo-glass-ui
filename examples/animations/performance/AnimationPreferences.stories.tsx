import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, css } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Correct library paths
import {
    ThemeProvider as GalileoThemeProvider
} from '../../../src/theme'; // Corrected Path
import {
    accessibleAnimation, // Core function for accessible animations
} from '../../../src/animations/accessibility'; // Corrected Path
import {
    useReducedMotion,    // Hook to detect reduced motion preference
} from '../../../src/hooks'; // Corrected Path
import { Paper } from '../../../src/components/Paper'; // Corrected Path
import { Typography } from '../../../src/components/Typography'; // Corrected Path
import { Button } from '../../../src/components/Button'; // Corrected Path
import { Box, Stack } from '../../../src/components'; // Corrected Path (assuming Layout is in index)

// --- Styled Components ---
const StoryContainer = styled(Box)`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 100vh;
`;

const DemoArea = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

// Define Props interface before use
interface AnimationPreferencesDemoProps {
    simulateReducedMotion: boolean;
}

interface AnimatedBoxProps {
    $animate: boolean;
    $isReducedMotion: boolean;
}

// Simplify AnimatedBox - remove accessibleAnimation
const AnimatedBox = styled(Box)<AnimatedBoxProps>`
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, #ff6ec4, #7873f5);
    border-radius: 8px;

    /* Apply transition based on reduced motion */
    transition: ${({ $isReducedMotion }) => 
        $isReducedMotion 
            ? 'transform 0.3s ease, opacity 0.3s ease' 
            : 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'};

    /* Apply styles directly based on props */
    ${({ $animate, $isReducedMotion }) => {
      if (!$animate) {
        // Initial/Reset state
        return css`
          transform: translateX(0px) rotate(0deg);
          opacity: 1;
        `;
      }
      if ($isReducedMotion) {
        // Reduced motion animation state
        return css`
          transform: translateX(50px); /* Simpler transform */
          opacity: 0.7;
        `;
      }
      // Full animation state
      return css`
        transform: translateX(100px) rotate(180deg);
        opacity: 0.5;
      `;
    }}
`;

const InfoPanel = styled(Paper)`
    padding: 1.5rem;
`;

// --- Main Story Component ---
const AnimationPreferencesDemoComponent: React.FC<AnimationPreferencesDemoProps> = ({ simulateReducedMotion }) => {
    const [animate, setAnimate] = useState(false);
    const prefersReducedMotion = useReducedMotion(); // Actual browser setting
    const isReducedMotionActive = simulateReducedMotion || prefersReducedMotion;

    const toggleAnimation = () => {
        setAnimate(prev => !prev);
    };


    return (
        <StoryContainer>
            <Typography variant="h4" gutterBottom>
                Animation Preferences (Reduced Motion)
            </Typography>

            <Typography variant="body1" paragraph>
                This demo shows how `accessibleAnimation` and `useReducedMotion` work together
                to respect the user's operating system preference for reduced motion.
                The animation behaviour changes if reduced motion is enabled (either via OS setting or the simulation toggle below).
            </Typography>


            <DemoArea elevation={1}>
                <AnimatedBox $animate={animate} $isReducedMotion={isReducedMotionActive} />
            </DemoArea>

            <Stack 
                direction="row" 
                spacing={2} 
                justifyContent="center" 
                style={{ marginBottom: '1.5rem' }} // Use style prop
            >
                <Button onClick={toggleAnimation} variant="contained">
                    {animate ? 'Reset Animation' : 'Start Animation'}
                </Button>
            </Stack>

            <InfoPanel elevation={1}>
                <Typography variant="h6">Status</Typography>
                <Stack 
                    spacing={1} 
                    style={{ marginTop: '1rem' }} // Use style prop
                >
                    <Typography variant="body2">
                        OS Prefers Reduced Motion: <strong>{prefersReducedMotion ? 'Yes' : 'No'}</strong>
                    </Typography>
                     <Typography variant="body2">
                        Simulating Reduced Motion: <strong>{simulateReducedMotion ? 'Yes' : 'No'}</strong> (Control via Storybook Args)
                    </Typography>
                    <Typography variant="body2">
                        Effective Reduced Motion: <strong>{isReducedMotionActive ? 'Active' : 'Inactive'}</strong>
                    </Typography>
                    <Typography variant="body2">
                        Current Animation State: <strong>{animate ? 'Running' : 'Idle'}</strong>
                    </Typography>
                </Stack>
            </InfoPanel>
        </StoryContainer>
    );
};

// ... (Storybook config - ensure GalileoThemeProvider has no theme prop)
export default {
    title: 'Examples/Animations/Performance/Animation Preferences',
    component: AnimationPreferencesDemoComponent,
    decorators: [
        (Story) => (
            <GalileoThemeProvider> 
                <Story />
            </GalileoThemeProvider>
        ),
    ],
    // ...
} as Meta<typeof AnimationPreferencesDemoComponent>;
