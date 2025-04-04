import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'; // Needed for navigation/transitions
import { PageTransition } from '../../src/components/Navigation';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Simple placeholder pages
const Page1 = () => <Box style={{ padding: 20, backgroundColor: 'lightblue' }}>Page 1 <Link to="/page2">Go to Page 2</Link></Box>;
const Page2 = () => <Box style={{ padding: 20, backgroundColor: 'lightcoral' }}>Page 2 <Link to="/">Go to Page 1</Link></Box>;

const meta: Meta<typeof PageTransition> = {
  title: 'Components/Navigation/PageTransition',
  component: PageTransition,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <Box style={{ height: '300px', width: '400px', border: '1px solid grey', overflow: 'hidden' }}>
            <Story />
          </Box>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    transitionKey: { control: 'text' }, // Example prop
    // Define other argTypes for props like animation variants, duration, etc.
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story showing page transition between routes
export const Default: Story = {
    render: (args) => (
        <PageTransition {...args}>
            <Routes>
                <Route path="/" element={<Page1 />} />
                <Route path="/page2" element={<Page2 />} />
            </Routes>
        </PageTransition>
    ),
    args: {
        transitionKey: '/', // Should ideally change based on location.pathname
        // other props...
    },
};

// Add more stories for different animation types, etc. 