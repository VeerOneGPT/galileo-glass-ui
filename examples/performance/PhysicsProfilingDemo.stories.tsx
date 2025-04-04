import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';
import { Link } from '../../src/components/Link';

const meta: Meta = {
  title: 'Performance/Physics Profiling',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Guidance on profiling physics performance. No interactive demo, see linked guide.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// --- Story Template ---
const ProfilingInfoComponent: React.FC = () => {

  return (
    <Box style={{ padding: '24px', maxWidth: '600px', textAlign: 'center' }}>
      <Typography variant="h5" style={{ marginBottom: '16px' }}>
        Physics Performance Profiling
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '8px' }}>
        This story serves as a placeholder linking to the performance profiling guide.
        There is no interactive demo component here.
      </Typography>
      <Typography variant="body1" style={{ marginTop: '16px' }}>
        Please refer to the documentation for detailed instructions on using browser developer tools
        and React DevTools to analyze the performance of Galileo physics animations.
      </Typography>
      <Link 
        href="?path=/docs/performance-physics-profiling--docs"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: '16px', display: 'inline-block' }}
      >
        View Performance Profiling Guide
      </Link>
       {/* Optional: Could add a link directly to the MD file if hosted 
       <Link href="/path/to/docs/performance/physics-profiling.md">View Raw Guide</Link> 
       */}
    </Box>
  );
};

export const ProfilingGuideLink: Story = {
  render: () => <ProfilingInfoComponent />,
}; 