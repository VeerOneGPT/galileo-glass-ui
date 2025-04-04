import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../src/components/Card'; // Corrected path
import { Button } from '../../src/components/Button'; // Corrected path
import { Typography } from '../../src/components/Typography'; // Corrected path
import { ThemeProvider } from '../../src'; // Assuming ThemeProvider is exported from src index

// Metadata for the Storybook entry
const meta: Meta<typeof Card> = {
  title: 'Components/Card', // Path in Storybook sidebar
  component: Card,
  tags: ['autodocs'], // Enable automatic documentation generation
  argTypes: {
    variant: {
      control: 'select',
      options: ['frosted', 'dimensional', 'heat', 'clear', 'tinted'], // Add other variants if they exist
      description: 'The visual style variant of the card.',
    },
    children: {
      control: 'text', // Allow basic text input in Storybook controls for simplicity
      description: 'Content inside the card',
    },
    // Add other relevant props as needed
    // elevation: { control: 'number', min: 1, max: 5 },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// --- Stories based on GlassCardExample.tsx ---

// Helper component to render card content consistently
const CardContent = ({ title, body, buttonText }: { title: string; body: string; buttonText: string }) => (
  <>
    <Typography variant="h5">{title}</Typography>
    <Typography variant="body1" style={{ marginTop: '10px', marginBottom: '20px' }}>
      {body}
    </Typography>
    <Button>{buttonText}</Button>
  </>
);

// Story 1: Standard/Frosted Card
export const Frosted: Story = {
  args: {
    variant: 'frosted',
    children: <CardContent title="Frosted Glass Card" body="This is a standard frosted glass card." buttonText="Action Button" />,
  },
};

// Story 2: Dimensional Card
export const Dimensional: Story = {
  args: {
    variant: 'dimensional',
    children: <CardContent title="Dimensional Glass Card" body="An interactive dimensional glass card." buttonText="View Details" />,
  },
};

// Story 3: Heat Card
export const Heat: Story = {
  args: {
    variant: 'heat',
    children: <CardContent title="Heat Glass Card" body="This heat-styled card features a strong glow." buttonText="Get Started" />,
  },
};

// Story 4: Clear Card (Example, add if variant exists)
// export const Clear: Story = {
//   args: {
//     variant: 'clear',
//     children: <CardContent title="Clear Glass Card" body="A clear card with minimal styling." buttonText="Action" />,
//   },
// };

// Story 5: Tinted Card (Example, add if variant exists)
// export const Tinted: Story = {
//   args: {
//     variant: 'tinted',
//     color: 'primary', // Example: Requires color prop for tinted
//     children: <CardContent title="Tinted Glass Card" body="A tinted card using the primary color." buttonText="Action" />,
//   },
// }; 