import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionSummary, AccordionDetails } from '../../src/components/Accordion';
import { Typography } from '../../src/components/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    // Add relevant props if needed, e.g., defaultExpanded
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Basic Render Check Story
export const BasicRenderCheck: Story = {
  name: 'Basic Render Check',
  render: (args) => (
    <Accordion {...args}>
      <AccordionSummary>
        <Typography>Accordion Title</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          This is the content of the accordion. It should be visible when expanded.
        </Typography>
      </AccordionDetails>
    </Accordion>
  ),
  args: {
    // Add any necessary default args here
    // defaultExpanded: false, // Example
  },
};

export const DefaultExpanded: Story = {
  name: 'Default Expanded',
  render: (args) => (
    <Accordion {...args}>
      <AccordionSummary>
        <Typography>Accordion Title (Expanded)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          This is the content of the accordion. It should be visible initially.
        </Typography>
      </AccordionDetails>
    </Accordion>
  ),
  args: {
    defaultExpanded: true,
  },
}; 