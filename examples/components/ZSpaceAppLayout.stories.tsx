import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { ZSpaceAppLayout } from '../../src/components/Navigation';
import type { ZSpaceAppLayoutProps } from '../../src/components/Navigation/types';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';

// --- Placeholder Content Components ---
const PlaceholderBox = styled(Box)<{ bgColor?: string; minHeight?: string }>`
  background-color: ${props => props.bgColor || 'rgba(255, 255, 255, 0.1)'};
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  min-height: ${props => props.minHeight || 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
`;

const HeaderContent: React.FC = () => <PlaceholderBox bgColor="rgba(0, 100, 255, 0.2)">Header</PlaceholderBox>;
const SidebarContent: React.FC = () => <PlaceholderBox bgColor="rgba(0, 255, 100, 0.2)" minHeight="400px">Sidebar</PlaceholderBox>;
const FooterContent: React.FC = () => <PlaceholderBox bgColor="rgba(100, 0, 255, 0.2)">Footer</PlaceholderBox>;
const MainContent: React.FC = () => (
    <PlaceholderBox bgColor="rgba(255, 255, 255, 0.05)" minHeight="600px">
        <Typography variant="h4">Main Content Area</Typography>
        {/* Add more content here to test scrolling */}
        <Box mt={4} width="100%">
            {Array.from({ length: 20 }).map((_, i) => (
                <p key={i}>Scrollable content line {i + 1}...</p>
            ))}
        </Box>
    </PlaceholderBox>
);

// --- Storybook Meta ---

const meta: Meta<typeof ZSpaceAppLayout> = {
  title: 'Components/Navigation/ZSpaceAppLayout',
  component: ZSpaceAppLayout,
  decorators: [
      (Story) => (
          <ThemeProvider> 
              <Story />
          </ThemeProvider>
      )
  ],
  parameters: {
    layout: 'fullscreen',
     docs: {
      description: {
        component: 'Demonstrates the ZSpaceAppLayout for creating 3D-like application structures with fixed/static sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
      // Add controls for key props
      fixedHeader: { control: 'boolean' },
      fixedSidebar: { control: 'boolean' },
      fixedFooter: { control: 'boolean' },
      sidebarWidth: { control: 'number' },
      headerHeight: { control: 'text' }, // Use text for px or other units
      footerHeight: { control: 'text' },
      initialSidebarCollapsed: { control: 'boolean' },
      sidebarBreakpoint: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', 600, 960] },
      enableZSpaceAnimations: { control: 'boolean' },
      // Hide children/slot props from controls
      children: { table: { disable: true } },
      header: { table: { disable: true } },
      sidebar: { table: { disable: true } },
      footer: { table: { disable: true } },
      navigation: { table: { disable: true } },
      backgroundComponent: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<ZSpaceAppLayoutProps>;

// --- Stories ---

export const Default: Story = {
  args: {
      header: <HeaderContent />,
      sidebar: <SidebarContent />,
      footer: <FooterContent />,
      children: <MainContent />,
      // Default props from component used for fixed*, dimensions, etc.
  },
};

export const FixedHeaderSidebar: Story = {
  args: {
      ...Default.args, // Reuse content
      fixedHeader: true,
      fixedSidebar: true,
  },
  parameters: {
      docs: { description: { story: 'Layout with fixed header and sidebar.' } }
  }
};

export const CollapsedSidebar: Story = {
  args: {
      ...FixedHeaderSidebar.args, // Reuse content and fixed state
      initialSidebarCollapsed: true,
  },
    parameters: {
      docs: { description: { story: 'Layout with initially collapsed sidebar.' } }
  }
};

export const CustomDimensions: Story = {
  args: {
      ...Default.args,
      fixedHeader: true,
      fixedSidebar: true,
      fixedFooter: true,
      sidebarWidth: 300,
      headerHeight: '80px',
      footerHeight: 40,
  },
   parameters: {
      docs: { description: { story: 'Layout with fixed sections and custom dimensions.' } }
  }
}; 