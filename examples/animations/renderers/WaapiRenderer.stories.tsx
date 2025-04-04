import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Import from project paths
import { ThemeProvider as GalileoThemeProvider } from '../../../src/theme';
import { Paper } from '../../../src/components/Paper';
import { Typography } from '../../../src/components/Typography';
import { Button } from '../../../src/components/Button';

// --- Styled Components ---
const StoryContainer = styled.div`
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

const AnimatedElement = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  will-change: transform, opacity;
`;

const InfoPanel = styled(Paper)`
  padding: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const CodeExample = styled.pre`
  margin-top: 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-family: monospace;
  font-size: 0.9rem;
`;

// --- Main Story Component ---
interface WaapiRendererDemoProps {
    duration: number;
    easing: string;
    iterations: number;
}

const WaapiRendererDemoComponent: React.FC<WaapiRendererDemoProps> = ({ duration, easing, iterations }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<Animation | null>(null);
    const [waapiSupported, setWaapiSupported] = useState<boolean | null>(null);
    const [animationState, setAnimationState] = useState('idle'); // idle, running, paused, finished

    // Check WAAPI support on mount
    useEffect(() => {
        // Basic check for WAAPI support
        const checkSupport = async () => {
            const supported = typeof HTMLElement.prototype.animate === 'function';
            setWaapiSupported(supported);
        };
        checkSupport();
    }, []);

    const playAnimation = () => {
        if (!elementRef.current || !waapiSupported) return;

        // Cancel previous animation if running
        if (animationRef.current) {
            animationRef.current.cancel();
        }

        const keyframes = [
            { transform: 'translateX(0px) rotate(0deg) scale(1)', opacity: 1 },
            { transform: 'translateX(150px) rotate(180deg) scale(1.2)', opacity: 0.7 },
            { transform: 'translateX(0px) rotate(360deg) scale(1)', opacity: 1 },
        ];

        const options: KeyframeAnimationOptions = {
            duration: duration * 1000, // Convert seconds to ms
            easing: easing,
            iterations: iterations === 0 ? Infinity : iterations,
            fill: 'forwards',
        };

        try {
            // Use native WAAPI
            animationRef.current = elementRef.current.animate(keyframes, options);
            setAnimationState('running');

            animationRef.current.onfinish = () => setAnimationState('finished');
            animationRef.current.oncancel = () => setAnimationState('idle');

        } catch (error) {
            console.error("WAAPI animation failed:", error);
            setAnimationState('idle');
        }
    };

    const pauseAnimation = () => {
        if (animationRef.current && animationRef.current.playState === 'running') {
            animationRef.current.pause();
            setAnimationState('paused');
        }
    };

    const resumeAnimation = () => {
        if (animationRef.current && animationRef.current.playState === 'paused') {
            animationRef.current.play();
            setAnimationState('running');
        }
    };

    const cancelAnimation = () => {
        if (animationRef.current) {
            animationRef.current.cancel();
            animationRef.current = null;
            setAnimationState('idle');
        }
    };

    const codeExample = `
// Basic Web Animations API (WAAPI) usage
const element = document.querySelector('.animated-element');

// Define keyframes
const keyframes = [
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.5)', opacity: 0.5 },
  { transform: 'scale(1)', opacity: 1 },
];

// Define animation options
const options = {
  duration: 1000, // 1 second
  easing: 'ease-in-out',
  iterations: Infinity,
};

// Start the animation
try {
  const animation = element.animate(keyframes, options);
  
  // Control the animation
  // animation.play();
  // animation.pause();
  // animation.cancel();
  
  // Events
  animation.onfinish = () => console.log('Animation finished');
} catch (error) {
  // Fallback for browsers that don't support WAAPI
  console.error('WAAPI not supported');
}
`;

    return (
        <StoryContainer>
            <Typography variant="h4" gutterBottom>
                Web Animations API (WAAPI) Renderer
            </Typography>

            <Typography variant="body1" paragraph>
                Demonstrates using the browser's native Web Animations API for performant animations.
                WAAPI allows declarative animation definitions that can often run off the main thread.
                Check browser support and control the animation below.
            </Typography>

            {waapiSupported === null && <Typography>Checking WAAPI support...</Typography>}
            {waapiSupported === false && <Typography color="error">Web Animations API is not fully supported in this browser.</Typography>}

            {waapiSupported && (
                <>
                    <DemoArea elevation={1}>
                        <AnimatedElement ref={elementRef} />
                    </DemoArea>

                    <ButtonGroup>
                        <Button onClick={playAnimation} variant="contained" disabled={animationState === 'running'}>
                            Play
                        </Button>
                        <Button onClick={pauseAnimation} variant="outlined" disabled={animationState !== 'running'}>
                            Pause
                        </Button>
                        <Button onClick={resumeAnimation} variant="outlined" disabled={animationState !== 'paused'}>
                            Resume
                        </Button>
                        <Button onClick={cancelAnimation} variant="outlined" disabled={animationState === 'idle'}>
                            Cancel
                        </Button>
                    </ButtonGroup>

                    <InfoPanel elevation={1}>
                        <Typography variant="h6">Status</Typography>
                        <div style={{ marginTop: '1rem' }}>
                            <Typography variant="body2">
                                WAAPI Supported: <strong>Yes</strong>
                            </Typography>
                            <Typography variant="body2">
                                Animation State: <strong>{animationState}</strong>
                            </Typography>
                        </div>
                    </InfoPanel>

                    <Typography variant="h6" gutterBottom style={{ marginTop: '1.5rem' }}>Usage Example</Typography>
                    <CodeExample>
                        {codeExample.trim()}
                    </CodeExample>
                </>
            )}
        </StoryContainer>
    );
};

// --- Storybook Configuration ---
export default {
    title: 'Examples/Animations/Renderers/WAAPI Renderer',
    component: WaapiRendererDemoComponent,
    decorators: [
        (Story) => (
            <GalileoThemeProvider>
                <Story />
            </GalileoThemeProvider>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                story: 'Demonstrates using the Web Animations API (WAAPI) via native browser methods. Adjust duration, easing, and iterations using the args panel.',
            },
        },
    },
    argTypes: {
        duration: {
            name: 'Duration (seconds)',
            control: { type: 'number', min: 0.1, max: 10, step: 0.1 },
            description: 'Animation duration in seconds.',
        },
        easing: {
            name: 'Easing Function',
            control: 'select',
            options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'],
            description: 'CSS easing function string.',
        },
        iterations: {
            name: 'Iterations (0 for Infinite)',
            control: { type: 'number', min: 0, max: 10, step: 1 },
            description: 'Number of times the animation should repeat (0 means infinite).',
        },
    },
} as Meta<typeof WaapiRendererDemoComponent>;

// --- Story ---
export const Default: StoryFn<WaapiRendererDemoProps> = (args) => <WaapiRendererDemoComponent {...args} />;
Default.args = {
    duration: 2,
    easing: 'ease-in-out',
    iterations: 0, // Infinite
}; 