import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../src/components/Card';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Surfaces/Card',
  component: Card,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: '20px', maxWidth: '400px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: { 
      control: 'select', 
      options: ['elevation', 'outlined'] 
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 }
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: (
      <Box style={{ padding: '16px' }}>
        <Typography variant="h6">Basic Card</Typography>
        <Typography style={{ marginTop: '10px' }}>
          This is the content area of a basic card.
        </Typography>
        <Box style={{ marginTop: '15px', textAlign: 'right' }}>
          <Button size="small">Learn More</Button>
        </Box>
      </Box>
    ),
  },
};

export const Outlined: Story = {
  args: {
    ...Basic.args,
    variant: 'outlined',
  },
};

// Remove Glass Card example for now as component path is uncertain
// export const Glass: Story = {
//   render: (args) => (
//     <ThemeProvider>
//        <Box style={{
//          padding: '40px', 
//          maxWidth: '400px',
//          backgroundImage: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1121&q=80")', // Example background
//          backgroundSize: 'cover',
//          borderRadius: '8px',
//        }}>
//         <GlassCard {...args}>
//           <Box style={{ padding: '16px', color: 'white' }}> {/* Adjust text color for Glass */}
//             <Typography variant="h6">Glass Card</Typography>
//             <Typography style={{ marginTop: '10px' }}>
//               This content is inside a GlassCard, showing background blur.
//             </Typography>
//             <Box style={{ marginTop: '15px', textAlign: 'right' }}>
//               <Button size="small" variant="contained" color="primary">Action</Button>
//             </Box>
//           </Box>
//         </GlassCard>
//       </Box>
//     </ThemeProvider>
//   ),
//   args: {
//     // Props specific to GlassCard might go here
//   },
// }; 