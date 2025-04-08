import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useParallaxScroll } from '../../src/hooks/useParallaxScroll';
import { GlassBox } from '../../src/components/Box';
import type { ParallaxScrollOptions } from '../../src/types/hooks';

interface ParallaxDemoProps {
    options?: ParallaxScrollOptions;
    height?: number;
    childHeight?: number;
}

const ParallaxLayer: React.FC<{ 
    factor: number; 
    children: React.ReactNode; 
    scrollContainer?: HTMLElement | null;
}> = ({ factor, children, scrollContainer }) => {
    // Create a ref locally if a container element is provided
    const containerRef = React.useMemo(() => {
        if (!scrollContainer) return undefined;
        const ref = { current: scrollContainer };
        return ref as React.RefObject<HTMLElement>;
    }, [scrollContainer]);
    
    const { style } = useParallaxScroll({ factor, scrollContainerRef: containerRef });
    
    return (
        <div style={{
            ...style,
            position: 'absolute',
            top: '50px', // Example positioning
            left: '50%',
            transform: `${style.transform || ''} translateX(-50%)`, // Combine transforms
            width: '80%',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'white',
            fontSize: '1.5rem',
        }}>
            {children}
        </div>
    );
};

const ParallaxDemo: React.FC<ParallaxDemoProps> = ({
    options = {},
    height = 500,
    childHeight = 1500, // Make content taller than container
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Define factors for different layers
    const factors = [-0.2, 0.2, 0.5, 1.0];
    const colors = ['rgba(255, 100, 100, 0.5)', 'rgba(100, 255, 100, 0.5)', 'rgba(100, 100, 255, 0.5)', 'rgba(200, 200, 200, 0.7)'];

    return (
        <GlassBox
            ref={scrollContainerRef}
            style={{
                height: `${height}px`,
                width: '400px',
                overflowY: 'scroll',
                overflowX: 'hidden',
                border: '1px solid grey',
                position: 'relative', // Needed for absolute positioning of layers
                backgroundColor: '#1a1a2e',
            }}
        >
            {/* Static content to create scroll height */}
            <div style={{ height: `${childHeight}px`, position: 'relative', width: '100%' }}>
                {factors.map((factor, index) => (
                    <ParallaxLayer 
                        key={index} 
                        factor={factor} 
                        scrollContainer={scrollContainerRef.current} // Pass the element instead of the ref
                    >
                        <GlassBox style={{backgroundColor: colors[index], padding: '10px'}}>
                            Factor: {factor}
                        </GlassBox>
                    </ParallaxLayer>
                ))}
                 {/* Add some text at the bottom to ensure full scroll */}
                 <div style={{position: 'absolute', bottom: '20px', color: 'white', width: '100%', textAlign: 'center'}}>
                     Scroll down...
                 </div>
            </div>
        </GlassBox>
    );
};

const meta: Meta<typeof ParallaxDemo> = {
    title: 'Hooks/useParallaxScroll',
    component: ParallaxDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        // Options are applied per-layer in this demo
        options: { control: false },
        height: { control: 'number' },
        childHeight: { control: 'number' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        // Container/child sizes control scrollability
    },
}; 