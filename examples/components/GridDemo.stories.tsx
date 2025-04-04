import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../../src/components/Grid';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Paper } from '../../src/components/Paper';

const meta: Meta<typeof Grid> = {
  title: 'Components/Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  argTypes: {
    container: { control: 'boolean' },
    spacing: { control: 'number' },
    columns: { control: 'number' },
    direction: { control: 'select', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
    justifyContent: { control: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
    alignItems: { control: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
  },
  parameters: {
    layout: 'fullscreen', // Grid often takes full width
  },
};

export default meta;
type Story = StoryObj<typeof Grid>;

// Helper to create basic visual item
const VisualItem = ({ children }: { children: React.ReactNode }) => (
    <Paper elevation={1} style={{ padding: '8px', textAlign: 'center', border: '1px dashed grey' }}>
        {children}
    </Paper>
);

// Basic Grid Layout using Grid.Item
export const Basic: Story = {
  render: (args) => (
    <ThemeProvider>
        <Box style={{ flexGrow: 1, padding: 2 }}> 
            <Grid container spacing={2} {...args}> 
                <Grid.Item xs={8}> <VisualItem>xs=8</VisualItem> </Grid.Item>
                <Grid.Item xs={4}> <VisualItem>xs=4</VisualItem> </Grid.Item>
                <Grid.Item xs={4}> <VisualItem>xs=4</VisualItem> </Grid.Item>
                <Grid.Item xs={8}> <VisualItem>xs=8</VisualItem> </Grid.Item>
            </Grid>
        </Box>
    </ThemeProvider>
  ),
  args: {
    container: true,
    spacing: 2,
  }
};

// Responsive Grid Layout using Grid.Item
export const Responsive: Story = {
    render: (args) => (
      <ThemeProvider>
          <Box style={{ flexGrow: 1, padding: 2 }}> 
              <Grid container spacing={2} {...args}> 
                  <Grid.Item xs={12} sm={6} md={4} lg={3}> <VisualItem>Responsive Item 1</VisualItem> </Grid.Item>
                  <Grid.Item xs={12} sm={6} md={4} lg={3}> <VisualItem>Responsive Item 2</VisualItem> </Grid.Item>
                  <Grid.Item xs={12} sm={6} md={4} lg={3}> <VisualItem>Responsive Item 3</VisualItem> </Grid.Item>
                  <Grid.Item xs={12} sm={6} md={4} lg={3}> <VisualItem>Responsive Item 4</VisualItem> </Grid.Item>
              </Grid>
          </Box>
      </ThemeProvider>
    ),
    args: {
        container: true,
        spacing: 2,
      }
  };

// Grid with Spacing using Grid.Item
export const Spacing: Story = {
    args: {
        container: true,
        spacing: 4, 
        children: (
            <>
                <Grid.Item xs={6}> <VisualItem>Item 1 (spacing 4)</VisualItem> </Grid.Item>
                <Grid.Item xs={6}> <VisualItem>Item 2 (spacing 4)</VisualItem> </Grid.Item>
                <Grid.Item xs={6}> <VisualItem>Item 3 (spacing 4)</VisualItem> </Grid.Item>
                <Grid.Item xs={6}> <VisualItem>Item 4 (spacing 4)</VisualItem> </Grid.Item>
            </>
        )
    },
    decorators: [(Story) => <ThemeProvider><Box style={{ flexGrow: 1, padding: 2 }}><Story /></Box></ThemeProvider>]
}; 