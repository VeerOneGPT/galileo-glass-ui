import React from 'react';
import { GlassCard } from '../Glass';

/**
 * GlassCardExample
 * 
 * A demo component showing different variants of the GlassCard component
 */
const GlassCardExample: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', padding: '24px' }}>
      {/* Standard Glass Card */}
      <GlassCard 
        title="Standard Glass Card" 
        variant="standard"
        elevation={1}
      >
        <p>This is a standard glass card with medium blur and opacity.</p>
        <button>Action Button</button>
      </GlassCard>
      
      {/* Frosted Glass Card */}
      <GlassCard 
        title="Frosted Glass Card" 
        variant="frosted"
        blurStrength="strong"
        backgroundOpacity="light"
      >
        <p>This card uses the frosted glass variant with high blur.</p>
        <button>Learn More</button>
      </GlassCard>
      
      {/* Dimensional Glass Card */}
      <GlassCard 
        title="Dimensional Glass Card" 
        variant="dimensional"
        elevation={2}
        interactive
      >
        <p>An interactive dimensional glass card with enhanced elevation.</p>
        <button>View Details</button>
      </GlassCard>
      
      {/* Heat Glass Card */}
      <GlassCard 
        title="Heat Glass Card" 
        variant="heat"
        glowIntensity="strong"
        padding="large"
      >
        <p>This heat-styled card features a strong glow effect.</p>
        <button>Get Started</button>
      </GlassCard>
    </div>
  );
};

export default GlassCardExample; 