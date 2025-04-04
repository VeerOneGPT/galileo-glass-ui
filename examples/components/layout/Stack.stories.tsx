import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider as GalileoThemeProvider } from '../../../src/theme'; // Corrected Path
import { Stack, StackProps } from '../../../src/components/Stack'; // Corrected Path
import { Paper } from '../../../src/components/Paper'; // Corrected Path
import { Typography } from '../../../src/components/Typography'; // Corrected Path
import { Box } from '../../../src/components/Box'; // Import Box

// Styled component for demonstration items
const Item = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(1, 2)};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.backgroundPaper};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// Storybook Meta Configuration
export default {
  title: 'Components/Layout/Stack',
  component: Stack,
  decorators: [
    (Story) => (
      <GalileoThemeProvider>
        <Story />
      </GalileoThemeProvider>
    ),
  ],
  argTypes: {
    direction: {
      control: { type: 'radio', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
      description: 'Defines the direction of items along the main axis.',
    },
    spacing: {
      control: { type: 'number', min: 0, max: 10, step: 0.5 },
      description: 'Defines the space between items. Uses theme spacing units.',
    },
    alignItems: {
      control: { type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
      description: 'Defines the alignment of items along the cross axis.',
    },
    justifyContent: {
      control: { type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
      description: 'Defines the alignment of items along the main axis.',
    },
    divider: {
      control: { type: 'boolean' },
      description: 'If true, displays a divider between items.',
    },
  },
} as Meta<StackProps>;

// Base Template
const Template: StoryFn<StackProps> = (args) => (
  <Stack {...args}>
    <Item>Item 1</Item>
    <Item>Item 2</Item>
    <Item>Item 3</Item>
  </Stack>
);

// Default Story
export const Default = Template.bind({});
Default.args = {
  direction: 'row',
  spacing: 2,
  alignItems: 'center',
  justifyContent: 'center',
};

// Vertical Stack Story
export const Vertical = Template.bind({});
Vertical.args = {
  direction: 'column',
  spacing: 1,
  alignItems: 'stretch',
};

// Row Reverse Story
export const RowReverse = Template.bind({});
RowReverse.args = {
  direction: 'row-reverse',
  spacing: 2,
  justifyContent: 'center',
};

// With Dividers Story
export const WithDividers = Template.bind({});
WithDividers.args = {
  direction: 'column',
  spacing: 2,
  divider: <Box style={{ borderBottom: '1px dashed grey', width: '100%' }} />,
};

// Responsive Direction Story
export const ResponsiveDirection = Template.bind({});
ResponsiveDirection.args = {
  direction: { xs: 'column', sm: 'row' }, // Example responsive prop
  spacing: { xs: 1, sm: 2 },
  alignItems: 'center',
};

// Zero Spacing Story
export const ZeroSpacing = Template.bind({});
ZeroSpacing.args = {
  direction: 'row',
  spacing: 0,
};

// Nested Stacks Story
export const NestedStacks: StoryFn<StackProps> = (args) => (
  <Stack direction="column" spacing={2} alignItems="center">
    <Typography variant="h6">Outer Stack (Column)</Typography>
    <Stack direction="row" spacing={1} >
      <Item>Nested 1</Item>
      <Item>Nested 2</Item>
    </Stack>
    <Stack direction="row" spacing={3} >
      <Item>Nested 3</Item>
      <Item>Nested 4</Item>
    </Stack>
  </Stack>
);
NestedStacks.args = {}; 