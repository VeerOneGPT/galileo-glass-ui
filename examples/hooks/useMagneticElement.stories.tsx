import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useMagneticElement } from '../../src/hooks/useMagneticElement';
import { GlassBox } from '../../src/components/Box'; // Assuming GlassBox
import type { MagneticElementOptions } from '../../src/types/hooks';

interface MagneticDemoProps {
    options?: MagneticElementOptions;
    width?: number;
    height?: number;
    label?: string;
}

// Mock component using the hook
const MagneticDemo: React.FC<MagneticDemoProps> = ({
    options = {},
    width = 100,
    height = 100,
    label = 'Magnetic'
}) => {
    const { ref, style, isActive } = useMagneticElement<HTMLDivElement>(options);

    return (
        <GlassBox
            ref={ref} // Directly use the ref from the hook
            style={{
                ...style, // Apply transform/transition styles from hook
                width: `${width}px`,
                height: `${height}px`,
                borderRadius: '50%',
                border: '2px solid transparent',
                // Change background based on isActive state
                backgroundColor: isActive ? 'rgba(165, 180, 252, 0.6)' : 'rgba(99, 102, 241, 0.6)', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                userSelect: 'none',
                // Add transition here if not handled by the hook's style object yet
                // transition: style.transition || 'transform 0.1s ease-out',
            }}
        >
            {label}
        </GlassBox>
    );
};

const meta: Meta<typeof MagneticDemo> = {
    title: 'Hooks/useMagneticElement',
    component: MagneticDemo,
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

export const AttractDefault: Story = {
    args: {
        options: {
            mode: 'attract',
            strength: 0.5,
            radius: 180,
            maxDisplacement: 30,
        },
        label: 'Attract',
        width: 120,
        height: 120,
    },
};

export const RepelStrong: Story = {
    args: {
        options: {
            mode: 'repel',
            strength: 0.8, // Stronger repulsion
            radius: 150,
            maxDisplacement: 50,
        },
        label: 'Repel',
        width: 100,
        height: 100,
    },
};

export const LargerRadius: Story = {
    args: {
        options: {
            mode: 'attract',
            strength: 0.3,
            radius: 300, // Larger activation radius
            maxDisplacement: 25,
        },
        label: 'Wide Radius',
        width: 150,
        height: 150,
    },
};

export const Disabled: Story = {
    args: {
        options: {
            mode: 'attract',
            strength: 0.5,
            radius: 180,
            maxDisplacement: 30,
            disabled: true, // Effect disabled
        },
        label: 'Disabled',
        width: 120,
        height: 120,
    },
}; 