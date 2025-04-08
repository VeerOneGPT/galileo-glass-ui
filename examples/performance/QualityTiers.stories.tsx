import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AnimationProvider } from '../../src/contexts/AnimationContext';
import { useParticleSystem } from '../../src/hooks/useParticleSystem';
import { GlassBox } from '../../src/components/Box';
import { particlePresets } from '../../src/animations/particles/presets';
import { QualityTier } from '../../src/types/accessibility';

// Demo component using particle system
const ParticleTierDemo: React.FC<{ options?: any; width?: number; height?: number }> = ({ options = 'snow', width = 500, height = 300 }) => {
    const { containerRef, particleCount, isActive } = useParticleSystem(options, particlePresets);
    return (
        <GlassBox
            ref={containerRef as React.Ref<HTMLDivElement>}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                border: '1px solid grey',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#1a1a2e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
            }}
        >
            <div>Particles: {particleCount}</div>
            <div>Active: {isActive.toString()}</div>
        </GlassBox>
    );
};

const meta: Meta<typeof AnimationProvider> = {
    title: 'Performance/Quality Tiers',
    component: AnimationProvider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        forceQualityTier: {
            options: [null, ...Object.values(QualityTier)], // Allow null for auto
            control: { type: 'select' },
            description: 'Force a specific quality tier (null = auto-detect)',
        },
        children: { control: false },
        value: { control: false }, // We control quality via direct prop
    },
    // Render the demo inside the provider
    render: (args) => (
        <AnimationProvider forceQualityTier={args.forceQualityTier}>
            <ParticleTierDemo options="snow" />
        </AnimationProvider>
    ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AutoDetect: Story = {
    args: {
        forceQualityTier: null, // Let the hook detect
    },
};

export const ForceLow: Story = {
    args: {
        forceQualityTier: QualityTier.LOW,
    },
};

export const ForceMedium: Story = {
    args: {
        forceQualityTier: QualityTier.MEDIUM,
    },
};

export const ForceHigh: Story = {
    args: {
        forceQualityTier: QualityTier.HIGH,
    },
};

export const ForceUltra: Story = {
    args: {
        forceQualityTier: QualityTier.ULTRA,
    },
}; 