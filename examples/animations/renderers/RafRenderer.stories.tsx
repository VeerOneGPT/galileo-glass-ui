import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Assume library paths
// import {
//     darkTheme, // Does not exist
//     ThemeProvider as GalileoThemeProvider // Does not exist
// } from '../../../src/core/theme';
// import {
//     useRafLoop, // Hook for RAF-based animation loops - DOES NOT EXIST
//     // Assume RafRenderer might be a class/object to manage loops globally, or part of useRafLoop
// } from '../../../src/animations/renderers/RafRenderer'; // Hook not found here
import { Paper } from '../../../src/components/Paper/Paper';
import { Typography } from '../../../src/components/Typography/Typography';
import { Button } from '../../../src/components/Button/Button';
import { Box } from '../../../src/components/Box/Box'; // Corrected path
import { Stack } from '../../../src/components/Stack/Stack'; // Corrected path
// import { CodeBlock } from '../../../src/components/CodeBlock/CodeBlock'; // Component not found

// --- Simple dark theme for demo ---
const demoDarkTheme = {
    colors: {
        background: '#222',
        textPrimary: '#eee',
        // Add other colors as needed by components used
        primary: '#3498db',
        secondary: '#9b59b6',
        paper: '#333',
        border: '#444',
    },
    spacing: (factor: number) => `${factor * 8}px`, // Example spacing function
    // Add other theme properties if needed (shadows, borderRadius, etc.)
};

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
  position: relative; // Needed for absolute positioning of animated element
`;

const AnimatedElement = styled(Box)<{ x: number }>`
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  border-radius: 50%;
  position: absolute;
  left: 0; // Start at left edge
  top: 50%;
  transform: translate(${({ x }) => x}px, -50%);
  will-change: transform;
`;

const InfoPanel = styled(Paper)`
    padding: 1.5rem;
`;

// --- Main Story Component ---
interface RafRendererDemoProps {
    speedMultiplier: number;
};

const RafRendererDemoComponent: React.FC<RafRendererDemoProps> = ({ speedMultiplier }) => {
    const [positionX, setPositionX] = useState(0);
    const demoAreaWidth = useRef(0);
    const direction = useRef(1); // 1 for right, -1 for left
    const demoAreaRef = useRef<HTMLDivElement>(null);

    // Callback for the animation loop
    // *** COMMENTED OUT - useRafLoop hook not found ***
    // const animationCallback = useCallback((timestamp: number, deltaTime: number) => {
    //     if (!demoAreaRef.current || demoAreaWidth.current === 0) return;

    //     const effectiveSpeed = 100 * speedMultiplier; // Base speed * multiplier pixels per second
    //     const deltaMove = (effectiveSpeed * deltaTime) / 1000; // Movement in this frame

    //     setPositionX(prevX => {
    //         let nextX = prevX + deltaMove * direction.current;
    //         const elementWidth = 80; // Width of the AnimatedElement

    //         // Check boundaries
    //         if (nextX + elementWidth > demoAreaWidth.current) {
    //             nextX = demoAreaWidth.current - elementWidth;
    //             direction.current = -1; // Change direction
    //         } else if (nextX < 0) {
    //             nextX = 0;
    //             direction.current = 1; // Change direction
    //         }
    //         return nextX;
    //     });
    // }, [speedMultiplier]);

    // Hook to manage the RAF loop
    // *** COMMENTED OUT - useRafLoop hook not found ***
    // const { start, stop, isActive } = useRafLoop(animationCallback);
    const start = () => console.warn('Animation start ignored - useRafLoop not found');
    const stop = () => console.warn('Animation stop ignored - useRafLoop not found');
    const isActive = false;

    // Get demo area width on mount and resize
    useEffect(() => {
        const updateWidth = () => {
            if (demoAreaRef.current) {
                demoAreaWidth.current = demoAreaRef.current.offsetWidth;
            }
        };

        updateWidth(); // Initial width
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Stop animation on unmount
    // *** COMMENTED OUT - useRafLoop related ***
    // useEffect(() => {
    //     return () => stop();
    // }, [stop]);

    // *** COMMENTED OUT - useRafLoop related code example ***
    // const codeExample = `
    // import { useRafLoop } from 'galileo-glass-ui/animations/renderers';

    // function BouncingBall() {
    //   const [positionX, setPositionX] = useState(0);
    //   const direction = useRef(1);
    //   const containerWidth = 500; // Example width
    //   const ballWidth = 50;

    //   const animate = (timestamp, deltaTime) => {
    //     const speed = 150; // pixels per second
    //     const move = (speed * deltaTime) / 1000;

    //     setPositionX(prevX => {
    //       let nextX = prevX + move * direction.current;
    //       if (nextX + ballWidth > containerWidth || nextX < 0) {
    //         direction.current *= -1;
    //         nextX = Math.max(0, Math.min(nextX, containerWidth - ballWidth));
    //       }
    //       return nextX;
    //     });
    //   };

    //   const { start, stop, isActive } = useRafLoop(animate);

    //   useEffect(() => {
    //       start(); // Start on mount
    //       return () => stop(); // Stop on unmount
    //   }, [start, stop]);

    //   return (
    //       <div style={{ width: containerWidth, height: 100, position: 'relative' }}>
    //           <div style={{ /* ...ball styles... */ transform: \`translateX(\${positionX}px)\` }} />
    //           <button onClick={isActive ? stop : start}>
    //               {isActive ? 'Stop' : 'Start'}
    //           </button>
    //       </div>
    //   );
    // }
    // `;

    return (
        <StoryContainer>
            <Typography variant="h4" gutterBottom>
                {/* RequestAnimationFrame Renderer (`useRafLoop`) - Hook missing */}
                RequestAnimationFrame Renderer Demo
            </Typography>

            <Typography variant="body1" paragraph>
                {/* This hook provides a convenient way to create and manage animation loops
                using \`requestAnimationFrame\`. It automatically handles starting, stopping,
                and passing timestamp/delta time to the callback. */}
                This component demonstrates a potential structure for RAF-based animation.
                (Note: The `useRafLoop` hook was not found and related logic is commented out).
            </Typography>

            <DemoArea ref={demoAreaRef} elevation={1}>
                <AnimatedElement x={positionX} />
            </DemoArea>

            {/* Use Box margin prop directly */}
            <Box mb={3} display="flex" justifyContent="center">
                <Stack direction="row" spacing={2}>
                    <Button onClick={start} variant="contained" disabled={isActive}>
                        Start Animation
                    </Button>
                    <Button onClick={stop} variant="outlined" disabled={!isActive}>
                        Stop Animation
                    </Button>
                </Stack>
            </Box>

            {/* Use Box margin prop directly */}
            <Box mt={1}>
                <InfoPanel elevation={1}>
                    <Typography variant="h6">Status</Typography>
                    <Stack spacing={1}>
                        <Typography variant="body2">
                            Loop Active: <strong>{isActive ? 'Yes' : 'No'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Current Position X: <strong>{positionX.toFixed(2)}px</strong>
                        </Typography>
                        <Typography variant="body2">
                            Speed Multiplier: <strong>{speedMultiplier}x</strong> (Control via Storybook Args)
                        </Typography>
                    </Stack>
                </InfoPanel>
            </Box>

            {/* Usage Example section commented out as CodeBlock and example code are unavailable */}
            {/*\n            <Box sx={{ marginTop: 3 }}> // Keep sx here as it's commented out\n                <Typography variant=\"h6\" gutterBottom>\n                    Usage Example\n                </Typography>\n            </Box>\n            <CodeBlock language=\"typescript\" code={codeExample} />\n            */}\n

        </StoryContainer>
    );
};

// --- Storybook Configuration ---
export default {
    title: 'Examples/Animations/Renderers/RAF Renderer',
    component: RafRendererDemoComponent,
    decorators: [
        (Story) => (
            <ThemeProvider theme={demoDarkTheme}> {/* Use local demo theme and standard ThemeProvider */}
                <Story />
            </ThemeProvider>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                story: 'Demonstrates the structure for a potential RAF animation renderer. (Note: The actual `useRafLoop` hook is missing). Control the speed multiplier via args.',
            },
        },
    },
    argTypes: {
        speedMultiplier: {
            name: 'Animation Speed Multiplier',
            control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            description: 'Adjusts the speed of the animation.'
        },
    },
} as Meta<typeof RafRendererDemoComponent>;

// --- Story ---
export const Default: StoryFn<RafRendererDemoProps> = (args) => <RafRendererDemoComponent {...args} />;
Default.args = {
    speedMultiplier: 1.0,
};
 