import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, GlassButton, ThemeProvider } from '../../src';
import { PhysicsInteractionType } from '../../src/hooks/usePhysicsInteraction';
import { SpringPresets } from '../../src/animations/physics/springPhysics';

const meta: Meta<typeof Button> = {
  title: 'Components/ButtonPhysicsOptions',
  component: Button,
  decorators: [(Story) => (
    <ThemeProvider>
      <div style={{ padding: '50px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }}>
        <Story />
      </div>
    </ThemeProvider>
  )],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Demonstration of the Button component with various physicsOptions and animationConfig combinations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'outlined', 'contained', 'glass'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'] },
    animationConfig: { 
      control: 'select', 
      options: Object.keys(SpringPresets),
      description: 'Preset animation configuration (maps to SpringPresets)'
    },
    physicsOptions: { 
      control: 'object',
      description: 'Advanced physics interaction configuration'
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Helper component to show details about the configuration
const ButtonWithPhysicsDemo = (props) => {
  const { animationConfig, physicsOptions, ...buttonProps } = props;
  
  return (
    <div>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button {...buttonProps} animationConfig={animationConfig} physicsOptions={physicsOptions} />
      </div>
      <div style={{ fontSize: '14px', color: '#666', maxWidth: '350px' }}>
        <div><strong>animationConfig:</strong> {typeof animationConfig === 'string' ? animationConfig : JSON.stringify(animationConfig)}</div>
        <div><strong>physicsOptions:</strong> {JSON.stringify(physicsOptions, null, 2)}</div>
      </div>
    </div>
  );
};

export const AnimationConfigOnly: Story = {
  render: (args) => (
    <ButtonWithPhysicsDemo 
      {...args}
      children="Animation Config Only" 
      animationConfig="WOBBLY"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button using only animationConfig preset "WOBBLY" which maps to spring tension/friction/mass values.',
      },
    },
  },
};

export const PhysicsOptionsOnly: Story = {
  render: (args) => (
    <ButtonWithPhysicsDemo 
      {...args}
      children="Physics Options Only" 
      physicsOptions={{
        type: 'spring',
        stiffness: 250,
        dampingRatio: 0.3,
        affectsScale: true,
        scaleAmplitude: 0.08,
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button using only physicsOptions to define the interaction, without an animationConfig preset.',
      },
    },
  },
};

export const AnimationConfigWithPhysicsOverride: Story = {
  render: (args) => (
    <ButtonWithPhysicsDemo 
      {...args}
      children="Config + Override" 
      animationConfig="STIFF"
      physicsOptions={{
        type: 'spring', // Keep the type as spring
        affectsScale: true, // Keep scale effect
        scaleAmplitude: 0.15, // Override with larger scale
        affectsRotation: true, // Add rotation effect
        rotationAmplitude: 10, // Set rotation amount
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button with animationConfig "STIFF" for base spring values, but overriding with custom options like adding rotation.',
      },
    },
  },
};

export const AnimationConfigWithTypeChange: Story = {
  render: (args) => (
    <ButtonWithPhysicsDemo 
      {...args}
      children="Magnetic Override" 
      animationConfig="GENTLE"
      physicsOptions={{
        type: 'magnetic', // Change interaction type completely
        strength: 0.5,
        radius: 100,
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button with animationConfig "GENTLE" but completely overridden to use magnetic interaction instead of spring.',
      },
    },
  },
};

export const GlassButtonWithPhysics: Story = {
  render: (args) => (
    <div style={{ 
        padding: '40px',
        background: 'linear-gradient(135deg, rgba(80,60,200,0.4) 0%, rgba(60,140,220,0.3) 100%)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
    }}>
      <GlassButton
        variant="contained"
        color="primary"
        size="large"
        animationConfig="WOBBLY"
        physicsOptions={{
          type: 'spring',
          affectsScale: true,
          scaleAmplitude: 0.08,
          affectsRotation: true,
          rotationAmplitude: 5,
        }}
      >
        Glass Button with Physics
      </GlassButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Glass variant of button with combined animationConfig and physicsOptions.',
      },
    },
  },
};

export const ComparisonGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', maxWidth: '800px' }}>
      <div>
        <h4>Spring Preset</h4>
        <Button
          variant="contained" 
          color="primary"
          animationConfig="DEFAULT"
        >
          DEFAULT
        </Button>
      </div>
      
      <div>
        <h4>Magnetic</h4>
        <Button
          variant="contained" 
          color="secondary"
          physicsOptions={{
            type: 'magnetic',
            strength: 0.4,
            radius: 80,
          }}
        >
          Magnetic
        </Button>
      </div>
      
      <div>
        <h4>Repel</h4>
        <Button
          variant="contained" 
          color="error"
          physicsOptions={{
            type: 'repel',
            strength: 0.5,
            radius: 80,
          }}
        >
          Repel
        </Button>
      </div>
      
      <div>
        <h4>Bouncy + Scale</h4>
        <Button
          variant="contained" 
          color="success"
          animationConfig="WOBBLY"
          physicsOptions={{
            affectsScale: true,
            scaleAmplitude: 0.1,
          }}
        >
          Bounce + Scale
        </Button>
      </div>
      
      <div>
        <h4>Stiff + Rotate</h4>
        <Button
          variant="contained" 
          color="warning"
          animationConfig="STIFF"
          physicsOptions={{
            affectsRotation: true,
            rotationAmplitude: 15,
          }}
        >
          Stiff + Rotate
        </Button>
      </div>
      
      <div>
        <h4>Combined</h4>
        <Button
          variant="contained" 
          color="info"
          animationConfig="SLOW"
          physicsOptions={{
            affectsScale: true,
            scaleAmplitude: 0.07,
            affectsRotation: true,
            rotationAmplitude: 8,
          }}
        >
          Combined
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of different physics interactions for buttons.',
      },
    },
  },
}; 