import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../../src/theme/ThemeProvider';
import { Grid } from '../../../src/components/Grid';
import { Paper } from '../../../src/components/Paper';
import { Stack } from '../../../src/components/Stack';
import { Typography } from '../../../src/components/Typography';
import { Button as GlassButton } from '../../../src/components/Button';

// --- Styled Components (Migrated) ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
`;

const DemoItem = styled.div`
  padding: 16px;
  background-color: ${props => props.theme.colors.secondary + '26'}; // Use secondary color
  border: 1px solid ${props => props.theme.colors.secondary + '40'};
  color: ${props => props.theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-weight: 500;
  min-height: 50px; // Slightly taller items for grid
  border-radius: 4px;
  width: 100%; // Make items fill grid cell
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Layout/Grid',
  component: Grid,
  subcomponents: { 'Item': Grid.Item },
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
    layout: 'fullscreen', // Use fullscreen to better see responsiveness
  },
  argTypes: {
    // Grid Container props
    container: { control: 'boolean', table: { category: 'Container' } },
    spacing: { control: { type: 'range', min: 0, max: 10, step: 0.5 }, table: { category: 'Container' } },
    direction: { control: 'radio', options: ['row', 'column', 'row-reverse', 'column-reverse'], table: { category: 'Container' } },
    alignItems: { control: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'], table: { category: 'Container' } },
    justifyContent: { control: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], table: { category: 'Container' } },
    // Grid Item props (controlled via args in stories)
    xs: { control: 'number', table: { category: 'Item' } },
    sm: { control: 'number', table: { category: 'Item' } },
    md: { control: 'number', table: { category: 'Item' } },
    lg: { control: 'number', table: { category: 'Item' } },
    xl: { control: 'number', table: { category: 'Item' } },
  },
} as Meta<typeof Grid>;

// --- Templates ---
// Template for basic responsive grid
const ResponsiveTemplate: StoryFn<React.ComponentProps<typeof Grid>> = (args) => (
    <Paper style={{ padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Responsive Grid Example</Typography>
        <Grid container spacing={args.spacing ?? 2} {...args}>
            {/* Example items with different breakpoint settings */}
            <Grid.Item xs={12} sm={6} md={4} lg={3}>
                <DemoItem>1 (xs=12, sm=6, md=4, lg=3)</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={4} lg={3}>
                <DemoItem>2 (xs=12, sm=6, md=4, lg=3)</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={4} lg={3}>
                <DemoItem>3 (xs=12, sm=6, md=4, lg=3)</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={12} lg={3}> { /* Takes full width on md */}
                <DemoItem>4 (xs=12, sm=6, md=12, lg=3)</DemoItem>
            </Grid.Item>
            <Grid.Item xs={6} sm={3} md={2} lg={1}>
                <DemoItem>5</DemoItem>
            </Grid.Item>
             <Grid.Item xs={6} sm={3} md={2} lg={1}>
                <DemoItem>6</DemoItem>
            </Grid.Item>
             <Grid.Item xs={6} sm={3} md={4} lg={5}>
                <DemoItem>7</DemoItem>
            </Grid.Item>
             <Grid.Item xs={6} sm={3} md={4} lg={5}>
                <DemoItem>8</DemoItem>
            </Grid.Item>
        </Grid>
    </Paper>
);

// Template for nested layout
const NestedLayoutTemplate: StoryFn<React.ComponentProps<typeof Grid>> = (args) => (
     <Paper style={{ padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Nested Grid and Stack</Typography>
        <Grid container spacing={args.spacing ?? 3} {...args}>
            <Grid.Item xs={12} md={7}>
                 <Typography variant="h6">Left Column (Stack)</Typography>
                 <Stack spacing={2} style={{ marginTop: '1rem' }}>
                    <DemoItem>Stacked Item A</DemoItem>
                    <DemoItem>Stacked Item B</DemoItem>
                    <DemoItem>Stacked Item C</DemoItem>
                </Stack>
            </Grid.Item>
            <Grid.Item xs={12} md={5}>
                 <Typography variant="h6">Right Column (Stack)</Typography>
                 <Stack spacing={1.5} style={{ marginTop: '1rem' }}>
                    <DemoItem>Content Area</DemoItem>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <GlassButton variant="outlined" size="small">Cancel</GlassButton>
                        <GlassButton variant="contained" size="small" color="primary">Submit</GlassButton>
                    </Stack>
                </Stack>
            </Grid.Item>
        </Grid>
     </Paper>
);

// --- Stories ---
export const ResponsiveGrid = ResponsiveTemplate.bind({});
ResponsiveGrid.args = {
    container: true,
    spacing: 3,
    alignItems: 'stretch', // Default
};

export const NestedLayout = NestedLayoutTemplate.bind({});
NestedLayout.args = {
    container: true,
    spacing: 4,
    alignItems: 'flex-start',
}; 