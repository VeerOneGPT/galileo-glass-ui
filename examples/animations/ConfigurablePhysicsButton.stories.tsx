import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

// Replace package imports with relative paths to source files
import {
    usePhysicsInteraction,
    PhysicsInteractionOptions,
    PhysicsInteractionType
} from '../../src/hooks/usePhysicsInteraction';

// Import Galileo components from source
import {
    GlassBox,
    GlassTypography,
    GlassButton,
} from '../../src/components';

// MagneticButton may need its own import if it's a separate component
import { MagneticButton } from '../../src/components/Button/MagneticButton';

// Define props based on actual PhysicsInteractionOptions
interface ConfigurableButtonStoryProps extends Omit<PhysicsInteractionOptions, 'elementRef'> {
    buttonText: string;
}

// Component to render inside the story
const ConfigurableButton: React.FC<ConfigurableButtonStoryProps> = ({
    buttonText = "Physics Button",
    type = 'spring', // Default type
    stiffness = 180,
    dampingRatio = 0.6,
    mass = 1,
    affectsScale = true,
    scaleAmplitude = 0.05,
    affectsRotation = false,
    rotationAmplitude = 10,
    reducedMotion = false,
    strength = 0.3, // For magnetic/repel
    radius = 80,    // For magnetic/repel
    // Include other relevant direct options from PhysicsInteractionOptions as needed
    ...restOptions // Capture any other options passed by Storybook controls
}) => {
    // Create hook options object explicitly
    const hookOptions: PhysicsInteractionOptions = {
        type,
        stiffness,
        dampingRatio,
        mass,
        affectsScale,
        scaleAmplitude,
        affectsRotation,
        rotationAmplitude,
        reducedMotion,
        strength,
        radius,
        ...restOptions // Spread any remaining options
    };

    const { ref, style } = usePhysicsInteraction<HTMLButtonElement>(hookOptions);
    const isDisabled = type === 'none' || reducedMotion;

    return (
        <GlassBox elevation={2} style={{ padding: '24px', margin: '16px', minWidth: 300, background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <GlassTypography variant="h6" style={{ marginBottom: '16px' }}>
                Configurable Physics Button
            </GlassTypography>
            <GlassBox style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', minHeight: 100 }}>
                <GlassButton
                    ref={ref}
                    style={{ // Apply physics styles and base styles
                        minWidth: 150,
                        minHeight: 40,
                        ...(style as React.CSSProperties) // Spread hook styles
                    }}
                    variant="contained"
                    disabled={isDisabled} // Disable button if type is 'none' or reducedMotion is true
                >
                    {buttonText}
                </GlassButton>
            </GlassBox>
            <GlassTypography variant="body2">
                Interaction Type: {type} {isDisabled ? '(Disabled by type/reducedMotion)' : ''}
            </GlassTypography>
            <GlassTypography variant="caption" component="div">
                Physics: stiffness={stiffness}, dampingRatio={dampingRatio}, mass={mass}
            </GlassTypography>
             <GlassTypography variant="caption" component="div">
                Affects: Scale={affectsScale.toString()}, Rotation={affectsRotation.toString()}
            </GlassTypography>
        </GlassBox>
    );
};

const meta: Meta<ConfigurableButtonStoryProps> = {
    title: 'Examples/Animations/usePhysicsInteraction Button',
    component: ConfigurableButton,
    tags: ['autodocs'],
    argTypes: {
        buttonText: { control: 'text' },
        type: {
            control: 'select',
            options: ['spring', 'magnetic', 'repel', 'follow', 'none'] as PhysicsInteractionType[],
        },
        stiffness: { control: 'number', if: { arg: 'type', eq: 'spring' } },
        dampingRatio: { control: 'number', min: 0, max: 2, step: 0.1, if: { arg: 'type', eq: 'spring' } },
        mass: { control: 'number', min: 0.1, step: 0.1, if: { arg: 'type', eq: 'spring' } },
        affectsScale: { control: 'boolean' },
        scaleAmplitude: { control: 'number', min: 0, step: 0.01, if: { arg: 'affectsScale' } },
        affectsRotation: { control: 'boolean' },
        rotationAmplitude: { control: 'number', step: 1, if: { arg: 'affectsRotation' } },
        strength: { control: 'number', min: 0, max: 1, step: 0.05, if: { arg: 'type', eq: 'magnetic' } }, // Only show for magnetic
        radius: { control: 'number', min: 10, step: 5, if: { arg: 'type', eq: 'magnetic' } }, // Only show for magnetic
        reducedMotion: { control: 'boolean' }, // Allow toggling reduced motion override
    },
    args: { // Default args for the story
        buttonText: "Interact!",
        type: 'spring',
        stiffness: 180,
        dampingRatio: 0.6,
        mass: 1,
        affectsScale: true,
        scaleAmplitude: 0.05,
        affectsRotation: false,
        rotationAmplitude: 10,
        reducedMotion: false,
        strength: 0.3,
        radius: 80,
    },
};

export default meta;

type Story = StoryObj<ConfigurableButtonStoryProps>;

export const DefaultSpring: Story = {};

export const Magnetic: Story = {
  args: {
    buttonText: "Magnetic",
    type: 'magnetic',
    strength: 0.4,
    radius: 100,
    // Spring params less relevant here
    stiffness: undefined,
    dampingRatio: undefined,
    mass: undefined,
    affectsScale: false,
    affectsRotation: false,
  },
};

export const Repel: Story = {
  args: {
    buttonText: "Repel",
    type: 'repel',
    strength: 0.5,
    radius: 90,
    // Spring params less relevant here
    stiffness: undefined,
    dampingRatio: undefined,
    mass: undefined,
    affectsScale: false,
    affectsRotation: false,
  },
};

export const NoInteraction: Story = {
  args: {
    buttonText: "Static",
    type: 'none',
  },
};

export const BouncySpring: Story = {
  args: {
    buttonText: "Bouncy",
    type: 'spring',
    stiffness: 250,
    dampingRatio: 0.3, // Lower damping = more bounce
    mass: 1.2,
    affectsScale: true,
    scaleAmplitude: 0.1,
    affectsRotation: true,
    rotationAmplitude: 15,
  },
};

export const ReducedMotion: Story = {
  args: {
    buttonText: "Reduced Motion",
    type: 'spring',
    reducedMotion: true,
  },
}; 