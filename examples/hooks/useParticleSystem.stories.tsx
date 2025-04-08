import React, { useRef } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useParticleSystem } from '../../src/hooks/useParticleSystem'; 
import { ParticleSystemOptions, ParticleSystemResult } from '../../src/types/particles';
import { GlassBox } from '../../src/components/Box';

export default {
  title: 'Hooks/useParticleSystem',
  component: () => null, // Component is not directly rendered, hook is used
  parameters: {
    docs: {
      description: {
        component: 'Demonstrates the importability and basic usage of the `useParticleSystem` hook.',
      },
    },
  },
  argTypes: {
    numParticles: { control: 'number', defaultValue: 50 },
    particleColor: { control: 'color', defaultValue: '#ffffff' },
    // Add more relevant controls
  },
} as Meta;

const DemoComponent: React.FC<{ options?: Record<string, any> }> = ({ options = {} }) => {
  // Create a div ref to act as the container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Call the hook with properly structured options
  const particleSystem = useParticleSystem({
    // Proper structure according to ParticleSystemOptions
    emitter: {
      position: 'center',
      shape: 'circle',
      size: 0,
      emissionRate: options.numParticles || 50,
      maxParticles: options.maxParticles || 200
    },
    particle: {
      lifespan: { min: 1, max: 3 },
      initialVelocity: { 
        x: [-0.5, 0.5], 
        y: [-0.5, 0.5] 
      },
      colorOverLife: [
        [options.particleColor || '#ffffff'],
        ['rgba(255, 255, 255, 0.1)']
      ],
      sizeOverLife: [1, 0],
      opacityOverLife: [1, 0]
    },
    physics: {
      friction: 0.05
    },
    rendering: {
      blendMode: 'screen'
    },
    autoStart: true
  });

  return (
    <GlassBox 
      ref={containerRef} 
      style={{ position: 'relative', width: '500px', height: '300px', border: '1px solid grey', background: '#222' }}
    >
      <GlassBox style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 1 }}>
        Particles Initialized ({particleSystem.particleCount} particles)
      </GlassBox>
    </GlassBox>
  );
};

const Template: StoryFn<{ options?: Record<string, any> }> = (args) => (
    <DemoComponent {...args} />
);

export const Default = Template.bind({});
Default.args = {
  options: {
    numParticles: 50,
    particleColor: '#ffffff'
  }
};

// Different variants
export const DenseParticles = Template.bind({});
DenseParticles.args = {
    options: {
      numParticles: 200,
      particleColor: '#88ccff'
    }
}; 