# GlassStepper

The `GlassStepper` component displays a sequence of steps with physics-based animations, helping users track their progress through a multi-step process or workflow. It supports both horizontal and vertical orientations with smooth, physics-driven transitions between active steps.

## Import

```tsx
import { GlassStepper } from '@veerone/galileo-glass-ui';
import type { Step } from '@veerone/galileo-glass-ui'; // If you need the type
```

## Usage

```tsx
import React, { useState } from 'react';
import { GlassStepper } from '@veerone/galileo-glass-ui';
import { Icon } from '@veerone/galileo-glass-ui';
import { Button } from '@veerone/galileo-glass-ui';
import { Box } from '@veerone/galileo-glass-ui';

// Define your steps
const steps = [
  { id: '1', label: 'Step 1: Details', icon: <Icon>description</Icon> },
  { id: '2', label: 'Step 2: Address', icon: <Icon>location_on</Icon> },
  { id: '3', label: 'Step 3: Review', icon: <Icon>check_circle</Icon> },
];

function StepperExample() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  // Render different content based on the active step
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return <div>Step 1 Content: Enter your details</div>;
      case 1:
        return <div>Step 2 Content: Enter your address</div>;
      case 2:
        return <div>Step 3 Content: Review your information</div>;
      default:
        return <div>All steps completed!</div>;
    }
  };

  return (
    <div>
      <GlassStepper 
        steps={steps} 
        activeStep={activeStep} 
        onStepClick={handleStepClick}
      />

      <Box mt={4} p={3} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        {getStepContent()}
      </Box>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button 
          variant="outlined" 
          onClick={handleBack} 
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button 
          variant="contained" 
          onClick={handleNext}
          disabled={activeStep === steps.length}
        >
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | required | Array of step objects to display. |
| `activeStep` | `number` | `0` | Index of the currently active step (zero-based). |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the stepper layout. |
| `className` | `string` | `undefined` | Optional CSS class name. |
| `style` | `React.CSSProperties` | `undefined` | Optional inline styles. |
| `onStepClick` | `(index: number) => void` | `undefined` | Callback triggered when a step is clicked. |

## Step Interface

```tsx
interface Step {
  /** Unique identifier for the step. */
  id: string | number;
  /** Text label for the step. */
  label?: string;
  /** Optional icon element or name for the step. */
  icon?: React.ReactNode | string; 
  /** Optional flag indicating if the step is disabled. */
  disabled?: boolean;
}
```

## Physics-Based Animation

The `GlassStepper` component features a physics-based active step indicator that smoothly animates between steps. This animation leverages the Galileo physics engine, specifically the `useVectorSpring` hook, to create natural-feeling transitions.

Key animation features:

- Smooth spring animation for the active step indicator
- Responsive to both programmatic changes and user interactions
- Automatically adjusts to horizontal and vertical orientations
- Physics configuration with appropriate tension and friction for a natural feel

The physics animation parameters used:
```tsx
// Spring configuration used internally
const positionSpring = useVectorSpring({
  config: { tension: 210, friction: 20 },
});
```

### Accessibility

The `GlassStepper` component is fully accessible, featuring:

- Keyboard navigation with arrow keys, Home, and End
- Proper ARIA attributes including `role="tablist"` and `aria-orientation`
- Tab indexing for keyboard focus
- Visual indication of the active and completed steps
- Dimmed styling for disabled steps

## Examples

### Horizontal Stepper (Default)

```tsx
<GlassStepper
  steps={steps}
  activeStep={1}
  onStepClick={handleStepClick}
/>
```

### Vertical Stepper

```tsx
<GlassStepper
  steps={steps}
  activeStep={1}
  orientation="vertical"
  onStepClick={handleStepClick}
/>
```

### Completed State

When `activeStep` is set to an index beyond the last step (e.g., `steps.length`), all steps are marked as completed.

```tsx
<GlassStepper
  steps={steps}
  activeStep={steps.length} // All steps completed
  onStepClick={handleStepClick}
/>
```

## Best Practices

- Use clear, concise labels for each step
- Include icons for better visual recognition
- For complex multi-step processes, provide context about the current step
- Use the `onStepClick` handler to allow users to revisit completed steps
- Consider disabling steps that cannot be accessed yet
- Pair the stepper with appropriate content for each step
- Maintain consistency in step content height to avoid jarring layout shifts
- Add navigation buttons (Next/Back) when steps require sequential completion

## Related Components

- `Button` - For navigation between steps
- `Icon` - For step icons 
- `Box` - For layout and spacing around the stepper
- `Card` or `GlassCard` - For containing step content

## Customizing Appearance

The `GlassStepper` component inherits its styling from the current theme. The primary color is used for the active and completed steps, while disabled steps and connectors use neutral colors with reduced opacity.

You can customize the appearance using:

- The `className` and `style` props for container styling
- Custom icons for each step using the `icon` property
- Creating themed variants by adjusting the theme's primary color
