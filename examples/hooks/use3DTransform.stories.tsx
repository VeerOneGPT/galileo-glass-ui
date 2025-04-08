import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { use3DTransform } from '../../src/hooks/use3DTransform';
import { GlassBox } from '../../src/components/Box';
import type { Transform3DState, Transform3DOptions } from '../../src/types/hooks';

interface TransformDemoProps {
    initialTransform?: Partial<Transform3DState>;
    options?: Transform3DOptions;
    width?: number;
    height?: number;
}

const TransformDemo: React.FC<TransformDemoProps> = ({
    initialTransform = {},
    options = {},
    width = 150,
    height = 100,
}) => {
    // Apply the hook to the wrapper div
    const { ref: transformRef, style: transformStyle, setTransform, currentTransform } = use3DTransform<HTMLDivElement>(initialTransform, options);
    const [hover, setHover] = useState(false);

    const handleMouseEnter = () => {
        setHover(true);
        setTransform({ rotateY: 30, scale: 1.1 });
    };
    const handleMouseLeave = () => {
        setHover(false);
        setTransform({ rotateY: 0, scale: 1 });
    };

    const parentStyle: React.CSSProperties = {
        perspective: '800px',
        perspectiveOrigin: 'center',
        padding: '50px',
        border: '1px dashed grey',
    };

    // Wrapper div handles interactions and transform
    return (
        <div style={parentStyle}>
            <div
                ref={transformRef} // Ref from hook on the wrapper
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    ...transformStyle, // Apply transform style to the wrapper
                    display: 'inline-block', // Make wrapper fit content
                    transition: 'transform 0.3s ease-out', // Add transition here
                    cursor: 'pointer',
                }}
            >
                {/* GlassBox is now inside, gets its own styles */}
                <GlassBox
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundColor: hover ? 'rgba(165, 180, 252, 0.7)' : 'rgba(99, 102, 241, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        borderRadius: '8px', // Example static style
                    }}
                >
                    Hover Me!
                </GlassBox>
            </div>
        </div>
    );
};

const meta: Meta<typeof TransformDemo> = {
    title: 'Hooks/use3DTransform',
    component: TransformDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        initialTransform: { control: 'object' },
        options: { control: 'object' },
        width: { control: 'number' },
        height: { control: 'number' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const InitialRotation: Story = {
    args: {
        initialTransform: { rotateY: 45, rotateX: -15, translateZ: 20 },
    },
};

export const InitialScale: Story = {
    args: {
        initialTransform: { scale: 1.2, translateZ: -30 },
    },
};

export const Disabled: Story = {
    args: {
        initialTransform: { rotateY: 45 },
        options: { disabled: true },
    },
}; 