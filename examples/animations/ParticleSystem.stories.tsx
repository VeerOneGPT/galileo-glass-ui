import React, { useRef, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ParticleSystemOptions as PSOptions } from '../../src/types/particles';
import { useParticleSystem } from '../../src/hooks/useParticleSystem';
import { GlassBox } from '../../src/components/Box'; // Assuming GlassBox exists
import { particlePresets } from '../../src/animations/particles/presets';

// Define props type for demos
interface ParticleDemoProps {
    options: PSOptions; 
    height?: number;
    width?: number;
    children?: React.ReactNode;
}

// Mock component to use the hook
const ParticleDemo: React.FC<ParticleDemoProps> = ({ options, height = 400, width, children }) => {
  const { containerRef } = useParticleSystem(options, particlePresets);

  return (
    <GlassBox 
      ref={containerRef as React.Ref<HTMLDivElement>}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: `${height}px`, 
        border: '1px solid grey', 
        position: 'relative', 
        overflow: 'hidden', // Important: prevent canvas overflow
        backgroundColor: '#1a1a2e', // Dark background for contrast
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}
    >
      {children}
    </GlassBox>
  );
};

// Mock component for interactive burst
const InteractiveBurstDemo: React.FC<ParticleDemoProps> = ({ options, height = 300 }) => {
    // Ensure options is an object for accessing emitter properties
    const safeOptions = typeof options === 'string' ? { preset: options } : options;
    const { containerRef, emitParticles } = useParticleSystem(safeOptions, particlePresets);
  
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (!containerRef.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // Use the emitParticles control function from the hook
      // Access burst count safely from resolved options within the engine if possible,
      // or fallback to a reasonable default if accessing directly here.
      const burstCount = (typeof safeOptions === 'object' && safeOptions.emitter?.burst?.count) || 50;
      emitParticles(burstCount, { x, y }); 
    };
  
    return (
      <GlassBox 
        ref={containerRef as React.Ref<HTMLDivElement>}
        onClick={handleClick}
        style={{ 
          width: '100%', 
          height: `${height}px`, 
          border: '1px solid grey', 
          position: 'relative', 
          overflow: 'hidden', 
          backgroundColor: '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Click Me for Burst!
      </GlassBox>
    );
  };


const meta: Meta<typeof ParticleDemo> = {
  title: 'Animations/ParticleSystem',
  component: ParticleDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: { 
        control: 'object', 
        description: 'ParticleSystemOptions object or preset name string' 
    },
    height: { control: 'number' },
    width: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultPreset: Story = {
  args: {
    options: 'default', // Use the default preset
    width: 600,
  },
};

export const Snow: Story = {
  args: {
    options: 'snow', // Use the snow preset name
    width: 600,
  },
};

export const FireworksBurst: Story = {
    render: (args) => { 
        // Destructure args before spreading
        const { options, height, width, children } = args;
        return <InteractiveBurstDemo options={options} height={height} width={width}>{children}</InteractiveBurstDemo>; 
    }, 
    args: {
        options: { 
            ...particlePresets.fireworks, 
            emitter: {
                ...(particlePresets.fireworks.emitter || {}), 
                emissionRate: 0, 
            },
            preset: 'fireworks' 
        } as PSOptions, 
        height: 400,
        width: 600 
    }
};

export const CustomConfiguration: Story = {
    args: {
      options: {
        emitter: {
          position: { x: 0.5, y: 0.9 }, // Bottom center (relative)
          shape: 'circle',
          size: 10, // Radius
          emissionRate: 50,
          maxParticles: 800,
        },
        particle: {
          lifespan: { min: 1, max: 2.5 },
          initialVelocity: { x: [-40, 40], y: [-150, -80] }, // Upwards
          initialScale: [0.2, 0.8],
          colorOverLife: [['#ff8800', '#ffcc00'], ['#ff0000', '#550000']], // Orange/Red fade
          opacityOverLife: [1, 0],
        },
        physics: {
          gravity: { x: 0, y: 50 }, // Downwards gravity
          friction: 0.05,
        },
        rendering: {
            blendMode: 'lighter'
        }
      } as PSOptions, // Explicitly type
      width: 600,
    },
  }; 