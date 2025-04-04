import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct import paths
import { GlassStepper } from '../../src/components/GlassStepper/GlassStepper';
// Removed GlassStep import as it's likely handled internally by GlassStepper
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { GlassTypography as Typography } from '../../src';

// Use GlassStepper in Meta
const meta: Meta<typeof GlassStepper> = {
  title: 'Components/Navigation/Stepper',
  component: GlassStepper,
  tags: ['autodocs'],
  argTypes: {
    activeStep: { control: 'number' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    // Removed alternativeLabel
    steps: { control: 'object' }, // Add steps prop control
    // Add other GlassStepper props
  },
};

export default meta;
// Use GlassStepper in Story type
type Story = StoryObj<typeof GlassStepper>;

// Define steps as an array of objects with labels and IDs
const stepsData = [
  { id: 'step1', label: 'Select campaign settings' }, 
  { id: 'step2', label: 'Create an ad group' }, 
  { id: 'step3', label: 'Create an ad' }
];

// Basic Horizontal Stepper Example
const HorizontalStepper = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <ThemeProvider>
      <Box style={{ width: '100%', padding: '20px' }}>
        {/* Pass steps data directly to GlassStepper */}
        <GlassStepper activeStep={activeStep} steps={stepsData} />
        {/* Remove manual mapping of GlassStep */}
        
        {activeStep === stepsData.length ? (
          <React.Fragment>
            <Typography style={{ marginTop: 2, marginBottom: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box style={{ display: 'flex', flexDirection: 'row', paddingTop: 2 }}>
              <Box style={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography style={{ marginTop: 2, marginBottom: 1 }}>Step {activeStep + 1}</Typography>
            <Box style={{ display: 'flex', flexDirection: 'row', paddingTop: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                style={{ marginRight: 1 }}
              >
                Back
              </Button>
              <Box style={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext}>
                {activeStep === stepsData.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </ThemeProvider>
  );
};

export const Horizontal: Story = {
  render: () => <HorizontalStepper />,
};

// Example showing vertical orientation
export const Vertical: Story = {
    args: {
        orientation: 'vertical',
        activeStep: 1, 
        steps: stepsData, // Pass steps data via prop
    },
    decorators: [(Story) => <ThemeProvider><Box style={{ padding: '20px'}}><Story /></Box></ThemeProvider>],
};

