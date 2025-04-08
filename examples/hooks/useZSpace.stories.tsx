import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useZSpace } from '../../src/hooks/useZSpace';
import { GlassBox } from '../../src/components/Box';
import type { ZSpaceOptions } from '../../src/types/hooks';

interface ZSpaceDemoProps {
    options?: ZSpaceOptions;
    width?: number;
    height?: number;
    label?: string;
}

const ZSpaceDemo: React.FC<ZSpaceDemoProps> = ({
    options = {},
    width = 150,
    height = 100,
    label = 'Z-Space Element'
}) => {
    const { ref, style } = useZSpace<HTMLDivElement>(options);

    // Need a parent with perspective for the effect to be visible
    const parentStyle: React.CSSProperties = {
        perspective: options.applyPerspectiveToParent ? 'none' : '800px', // Don't apply here if hook applies to parent
        perspectiveOrigin: 'center',
        padding: '50px', // Add padding to see movement
        border: '1px dashed grey',
        position: 'relative', // Needed if hook applies perspective
    };

    return (
        <div style={parentStyle}>
            <GlassBox
                ref={ref}
                style={{
                    ...style, // Apply transform from hook
                    width: `${width}px`,
                    height: `${height}px`,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: 'auto', // Center within parent padding
                    transition: 'transform 0.3s ease-out', // Add transition for visual feedback
                }}
            >
                {label}
            </GlassBox>
        </div>
    );
};

const meta: Meta<typeof ZSpaceDemo> = {
    title: 'Hooks/useZSpace',
    component: ZSpaceDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        options: { control: 'object' },
        width: { control: 'number' },
        height: { control: 'number' },
        label: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        options: { depth: 0 },
    },
};

export const Closer: Story = {
    args: {
        options: { depth: 50 },
        label: 'Closer (depth: 50)',
    },
};

export const Further: Story = {
    args: {
        options: { depth: -80 },
        label: 'Further (depth: -80)',
    },
};

export const PerspectiveOnParent: Story = {
    args: {
        options: {
            depth: -60,
            applyPerspectiveToParent: 1000, // Apply 1000px perspective
        },
        label: 'Parent Perspective',
    },
};

export const Disabled: Story = {
    args: {
        options: {
            depth: -80,
            disabled: true,
        },
        label: 'Disabled',
    },
}; 