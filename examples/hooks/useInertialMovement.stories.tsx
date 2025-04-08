import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useInertialMovement } from '../../src/hooks/useInertialMovement';
import { GlassBox } from '../../src/components/Box';
import type { InertialMovementOptions } from '../../src/types/hooks';

interface InertiaDemoProps {
    options?: Partial<InertialMovementOptions>;
    containerWidth?: number;
    containerHeight?: number;
    contentWidth?: number;
    contentHeight?: number;
}

const InertiaDemo: React.FC<InertiaDemoProps> = ({
    options = {},
    containerWidth = 300,
    containerHeight = 300,
    contentWidth = 600,
    contentHeight = 600,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const { style, state } = useInertialMovement({
        contentRef: contentRef as React.RefObject<HTMLElement>, // Cast needed
        containerRef: containerRef as React.RefObject<HTMLElement>,
        ...options,
    });

    return (
        <GlassBox
            ref={containerRef}
            style={{
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                border: '1px dashed grey',
                overflow: 'hidden', // Crucial for bounds
                position: 'relative', // Needed?
            }}
        >
            <GlassBox
                ref={contentRef}
                style={{
                    ...style, // Apply transform from hook
                    width: `${contentWidth}px`,
                    height: `${contentHeight}px`,
                    backgroundColor: state.isDragging ? 'rgba(139, 195, 74, 0.7)' : 'rgba(76, 175, 80, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'white',
                    // Add touchAction styling via hook if not included
                    // touchAction: options.axis === 'x' ? 'pan-y' : options.axis === 'y' ? 'pan-x' : 'none',
                    cursor: state.isDragging ? 'grabbing' : 'grab',
                }}
            >
                Drag Me!
            </GlassBox>
        </GlassBox>
    );
};

const meta: Meta<typeof InertiaDemo> = {
    title: 'Hooks/useInertialMovement',
    component: InertiaDemo,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        options: { control: 'object' },
        containerWidth: { control: 'number' },
        containerHeight: { control: 'number' },
        contentWidth: { control: 'number' },
        contentHeight: { control: 'number' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        options: { axis: 'both' },
    },
};

export const VerticalOnly: Story = {
    args: {
        options: { axis: 'y' },
        containerWidth: 200,
        contentWidth: 200,
    },
};

export const HorizontalOnly: Story = {
    args: {
        options: { axis: 'x' },
        containerHeight: 200,
        contentHeight: 200,
    },
};

export const HighFriction: Story = {
    args: {
        options: { axis: 'both', friction: 0.2 },
        contentWidth: 400,
        contentHeight: 400,
    },
};

export const LowBounce: Story = {
    args: {
        options: { axis: 'both', bounceFactor: 0.05 },
    },
}; 