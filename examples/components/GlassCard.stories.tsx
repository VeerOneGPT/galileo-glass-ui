import React from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { Card, CardProps } from '../../src/components/Card';
import { GlassButton } from '../../src/components/Button';
import { Typography as GlassTypography } from '../../src/components/Typography';

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background: linear-gradient(45deg, #2196F3, #21CBF3); /* Add a background to see glass effect */
  min-height: 100vh;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Card/GlassCard',
  component: Card,
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <StoryContainer>
          <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['frosted', 'dimensional', 'heat'], // Available glass variants
      description: 'Selects the glass card variant style.',
    },
    // Hide other Card props irrelevant to this specific glass demo
    elevation: { table: { disable: true } },
    interactive: { table: { disable: true } },
    children: { table: { disable: true } },
    glass: { table: { disable: true } }, // Variant controls glass
    glassOptions: { table: { disable: true } },
  },
} as Meta<typeof Card>;

// --- Template ---
const Template: StoryFn<CardProps> = (args) => (
  <GridContainer>
    <Card {...args} variant="frosted">
      <GlassTypography variant="h5">Frosted Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        This card uses the frosted glass variant with high blur.
      </GlassTypography>
      <GlassButton>Learn More</GlassButton>
    </Card>

    <Card {...args} variant="dimensional">
      <GlassTypography variant="h5">Dimensional Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        An interactive dimensional glass card with enhanced elevation.
      </GlassTypography>
      <GlassButton>View Details</GlassButton>
    </Card>

    <Card {...args} variant="heat">
      <GlassTypography variant="h5">Heat Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        This heat-styled card features a strong glow effect.
      </GlassTypography>
      <GlassButton>Get Started</GlassButton>
    </Card>
  </GridContainer>
);

// --- Stories ---
export const GlassVariants = Template.bind({});
GlassVariants.args = {
  // Default variant selection is handled by Storybook controls
  // variant: 'frosted', // Let Storybook control handle the initial selection
};
GlassVariants.parameters = {
  docs: {
    description: {
      story: 'Demonstrates the different visual styles available for glass cards: `frosted`, `dimensional`, and `heat`. Use the controls to switch between them.',
    },
  },
};

// Individual variant stories if needed for documentation clarity
export const Frosted: StoryFn<CardProps> = (args) => (
     <Card {...args}>
      <GlassTypography variant="h5">Frosted Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        This card uses the frosted glass variant with high blur.
      </GlassTypography>
      <GlassButton>Learn More</GlassButton>
    </Card>
);
Frosted.args = { variant: 'frosted' };
Frosted.parameters = { controls: { include: [] } }; // Hide controls for specific variant story

export const Dimensional: StoryFn<CardProps> = (args) => (
     <Card {...args}>
      <GlassTypography variant="h5">Dimensional Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        An interactive dimensional glass card with enhanced elevation.
      </GlassTypography>
      <GlassButton>View Details</GlassButton>
    </Card>
);
Dimensional.args = { variant: 'dimensional' };
Dimensional.parameters = { controls: { include: [] } };

export const Heat: StoryFn<CardProps> = (args) => (
     <Card {...args}>
      <GlassTypography variant="h5">Heat Glass Card</GlassTypography>
      <GlassTypography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
        This heat-styled card features a strong glow effect.
      </GlassTypography>
      <GlassButton>Get Started</GlassButton>
    </Card>
);
Heat.args = { variant: 'heat' };
Heat.parameters = { controls: { include: [] } }; 