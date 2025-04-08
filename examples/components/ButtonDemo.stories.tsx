import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, ThemeProvider } from '../../src';
import { PhysicsInteractionType } from '../../src/hooks/usePhysicsInteraction';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with various styles, colors, and physics interaction options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'outlined', 'contained'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    animationConfig: { control: 'object' },
    physicsOptions: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click Me',
    variant: 'contained',
    color: 'primary',
  },
};

export const SpringPhysics: Story = {
  args: {
    children: 'Spring Physics',
    variant: 'contained',
    color: 'primary',
    physicsOptions: {
      type: 'spring',
      stiffness: 180,
      dampingRatio: 0.6,
      mass: 1,
      affectsScale: true,
      scaleAmplitude: 0.05,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with standard spring physics interaction - scales slightly when pressed.',
      },
    },
  },
};

export const BouncySpringPhysics: Story = {
  args: {
    children: 'Bouncy Spring',
    variant: 'contained',
    color: 'secondary',
    physicsOptions: {
      type: 'spring',
      stiffness: 250,
      dampingRatio: 0.3, // Lower damping = more bounce
      mass: 1.2,
      affectsScale: true,
      scaleAmplitude: 0.1,
      affectsRotation: true,
      rotationAmplitude: 15,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with bouncy spring physics that scales and rotates when interacted with.',
      },
    },
  },
};

export const MagneticButton: Story = {
  args: {
    children: 'Magnetic Button',
    variant: 'contained',
    color: 'primary',
    physicsOptions: {
      type: 'magnetic',
      strength: 0.4,
      radius: 100,
      affectsScale: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with magnetic physics interaction - attracted to cursor when nearby.',
      },
    },
  },
};

export const RepelButton: Story = {
  args: {
    children: 'Repel Button',
    variant: 'contained',
    color: 'error',
    physicsOptions: {
      type: 'repel',
      strength: 0.5,
      radius: 90,
      affectsScale: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with repel physics interaction - moves away from cursor when nearby.',
      },
    },
  },
};

export const ScalingButton: Story = {
  args: {
    children: 'Scale on Hover',
    variant: 'contained',
    color: 'success',
    physicsOptions: {
      type: 'spring',
      stiffness: 200,
      dampingRatio: 0.7,
      affectsScale: true,
      scaleAmplitude: 0.15, // Larger scale effect
      affectsRotation: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button that scales significantly when interacted with.',
      },
    },
  },
};

export const RotatingButton: Story = {
  args: {
    children: 'Rotate on Hover',
    variant: 'contained',
    color: 'warning',
    physicsOptions: {
      type: 'spring',
      stiffness: 180,
      dampingRatio: 0.6,
      affectsScale: false,
      affectsRotation: true,
      rotationAmplitude: 20, // Larger rotation effect
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button that rotates when interacted with.',
      },
    },
  },
};

export const CombinedEffectsButton: Story = {
  args: {
    children: 'Complex Physics',
    variant: 'contained',
    color: 'info',
    physicsOptions: {
      type: 'spring',
      stiffness: 220,
      dampingRatio: 0.5,
      mass: 1.1,
      affectsScale: true,
      scaleAmplitude: 0.08,
      affectsRotation: true,
      rotationAmplitude: 12,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with combined scale and rotation physics effects.',
      },
    },
  },
};

export const OutlinedWithPhysics: Story = {
  args: {
    children: 'Outlined Physics',
    variant: 'outlined',
    color: 'primary',
    physicsOptions: {
      type: 'spring',
      stiffness: 200,
      dampingRatio: 0.6,
      affectsScale: true,
      scaleAmplitude: 0.05,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Outlined button with physics interaction.',
      },
    },
  },
};

export const TextWithPhysics: Story = {
  args: {
    children: 'Text Physics',
    variant: 'text',
    color: 'primary',
    physicsOptions: {
      type: 'spring',
      stiffness: 200,
      dampingRatio: 0.6,
      affectsScale: true,
      scaleAmplitude: 0.05,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Text button with physics interaction.',
      },
    },
  },
}; 