import React from 'react';
import { Card } from '../Card';
import { GlassButton } from '../Button';
import { GlassTypography } from '../Typography';

/**
 * GlassCardExample
 * 
 * A demo component showing different variants of the GlassCard component
 */
const GlassCardExample: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', padding: '24px' }}>
      {/* Standard Glass Card - Use frosted as default */}
      <Card variant="frosted">
        <GlassTypography variant="h5">Standard Glass Card</GlassTypography>
        <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
          This is a standard glass card with medium blur and opacity.
        </GlassTypography>
        <GlassButton>Action Button</GlassButton>
      </Card>
      
      {/* Frosted Glass Card */}
      <Card variant="frosted">
        <GlassTypography variant="h5">Frosted Glass Card</GlassTypography>
        <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
          This card uses the frosted glass variant with high blur.
        </GlassTypography>
        <GlassButton>Learn More</GlassButton>
      </Card>
      
      {/* Dimensional Glass Card */}
      <Card variant="dimensional">
        <GlassTypography variant="h5">Dimensional Glass Card</GlassTypography>
        <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
          An interactive dimensional glass card with enhanced elevation.
        </GlassTypography>
        <GlassButton>View Details</GlassButton>
      </Card>
      
      {/* Heat Glass Card */}
      <Card variant="heat">
        <GlassTypography variant="h5">Heat Glass Card</GlassTypography>
        <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
          This heat-styled card features a strong glow effect.
        </GlassTypography>
        <GlassButton>Get Started</GlassButton>
      </Card>
    </div>
  );
};

export default GlassCardExample; 