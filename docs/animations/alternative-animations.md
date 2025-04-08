# Alternative Animations

Galileo Glass UI provides a comprehensive system for implementing alternative animations to ensure a good experience for users who prefer reduced motion or have specific motion sensitivity needs.

## Core Concepts

- **Motion Sensitivity Levels**: Different levels of motion reduction based on user preferences and needs.
- **Animation Categories**: Categorization of animations to apply appropriate alternatives based on purpose.
- **Alternative Animation Types**: Simplified animations that can replace complex ones when needed.
- **Automatic Adaptation**: System that automatically adjusts animations based on user preferences.

## Available Tools

Galileo Glass UI provides several tools to implement alternative animations:

1. **`useAlternativeAnimations` Hook**: A React hook that provides animation utilities based on user's motion sensitivity.
2. **`withAlternativeAnimations` HOC**: A higher-order component that enhances components with alternative animation capabilities.
3. **Utility Functions**: Helper functions in `alternativeAnimations.ts` for creating accessible animations.

## `useAlternativeAnimations` Hook

This hook provides utilities for implementing alternative animations based on user's motion sensitivity preferences.

### Purpose

- Determine if animations should be disabled or simplified based on user preferences.
- Provide adjusted durations for animations based on sensitivity levels.
- Create CSS transitions and animations with appropriate timing.
- Simplify implementation of alternative animations in components.

### Signature

```typescript
import { useAlternativeAnimations } from '@veerone/galileo-glass-ui';
import { AnimationCategory } from '@veerone/galileo-glass-ui';

function MyAnimatedComponent() {
  const {
    // Basic flags
    isAnimationDisabled,     // Whether animations should be disabled entirely
    useSimplifiedAnimations, // Whether to use simplified versions of animations
    motionSensitivity,       // Current motion sensitivity level ('low', 'medium', 'high', etc.)
    
    // Duration
    duration,                // Adjusted animation duration based on sensitivity
    
    // Helper utilities
    createTransition,        // Function to create CSS transition strings
    createAnimation,         // Function to create CSS animation strings
    
    // Extra data
    animationCategory        // The animation category specified in options
  } = useAlternativeAnimations({
    motionSensitivity: undefined,         // Optional override of sensitivity level
    category: AnimationCategory.FEEDBACK, // Type of animation for better adaptation
    disableAnimation: false,              // Optional override to disable animations
    baseDuration: 300                     // Base duration in ms before adjustment
  });
  
  return (
    <div
      style={{
        transition: isAnimationDisabled 
          ? 'none' 
          : createTransition(['transform', 'opacity'], { 
              duration: duration,
              easing: 'ease-in-out' 
            }),
        transform: `scale(${isActive ? 1 : 0.9})`,
        opacity: isActive ? 1 : 0
      }}
    >
      {useSimplifiedAnimations ? 'Simple Content' : 'Animated Content'}
    </div>
  );
}
```

### Options

- **`motionSensitivity`**: Optional override for the motion sensitivity level.
- **`category`**: Animation category to help determine appropriate alternatives.
- **`disableAnimation`**: Optional override to disable animations entirely.
- **`baseDuration`**: Base animation duration in milliseconds before adjustment.

### Return Value

- **`isAnimationDisabled`**: Boolean indicating if animations should be disabled.
- **`useSimplifiedAnimations`**: Boolean indicating if simplified animations should be used.
- **`motionSensitivity`**: Current motion sensitivity level.
- **`duration`**: Adjusted animation duration based on sensitivity.
- **`createTransition`**: Function for creating CSS transition strings.
- **`createAnimation`**: Function for creating CSS animation strings.
- **`animationCategory`**: The animation category from options.

## `withAlternativeAnimations` HOC

A higher-order component that enhances any component with alternative animation capabilities.

### Purpose

- Automatically inject motion sensitivity information into components.
- Simplify the implementation of components that need to adapt animations.
- Provide consistent handling of animation preferences across components.

### Signature

```typescript
import { withAlternativeAnimations } from '@veerone/galileo-glass-ui';
import { AnimationCategory } from '@veerone/galileo-glass-ui';

// A component that uses motion sensitivity props
const MyAnimatedComponent = ({ 
  motionSensitivity, 
  useSimplifiedAnimations,
  disableAnimation,
  ...otherProps 
}) => {
  return (
    <div style={{
      transition: disableAnimation 
        ? 'none' 
        : `transform ${motionSensitivity === 'low' ? '600ms' : '300ms'} ease`,
      transform: isActive ? 'translateY(0)' : 'translateY(20px)'
    }}>
      {useSimplifiedAnimations ? 'Simple Content' : 'Animated Content'}
    </div>
  );
};

// Enhance the component with alternative animation capabilities
const EnhancedAnimatedComponent = withAlternativeAnimations(
  MyAnimatedComponent,
  {
    defaultCategory: AnimationCategory.TRANSITION,
    disableOnLowSensitivity: false,
    sensitivityPropName: 'motionSensitivity',
    simplifiedPropName: 'useSimplifiedAnimations',
    disabledPropName: 'disableAnimation'
  }
);

// Usage
function App() {
  return <EnhancedAnimatedComponent someProp="value" />;
}
```

### Options

- **`defaultCategory`**: Default animation category for the component.
- **`disableOnLowSensitivity`**: Whether to completely disable animations for 'low' sensitivity.
- **`sensitivityPropName`**: Name of the prop to pass sensitivity level.
- **`simplifiedPropName`**: Name of the prop to pass simplified flag.
- **`disabledPropName`**: Name of the prop to pass animation disabled flag.

### Behavior

The HOC automatically:
1. Accesses system and user preference information about reduced motion.
2. Determines the appropriate motion sensitivity level.
3. Passes appropriate props to the wrapped component.
4. Prioritizes props from parent components over context/system values.

## Animation Utility Functions

The library provides several utility functions in `alternativeAnimations.ts` for creating accessible animations:

```typescript
import { 
  getAdjustedDuration, 
  getAlternativeAnimation, 
  simpleFade, 
  simpleScale,
  simpleSlideIn,
  createAccessibleTransition,
  createAccessibleAnimation
} from '@veerone/galileo-glass-ui';
```

Key functions include:

- **`getAdjustedDuration`**: Adjusts animation duration based on sensitivity level.
- **`getAlternativeAnimation`**: Selects between original and simplified animations.
- **`simpleFade`, `simpleScale`, `simpleSlideIn`**: Pre-defined simplified keyframe animations.
- **`createAccessibleTransition`**: Creates a CSS transition string with adjusted timing.
- **`createAccessibleAnimation`**: Creates a CSS animation string with adjusted timing.

## Example: Complete Component with Alternative Animations

Here's a more complete example showing how to implement a component with alternative animations:

```typescript
import React, { useState } from 'react';
import { useAlternativeAnimations } from '@veerone/galileo-glass-ui';
import { AnimationCategory } from '@veerone/galileo-glass-ui';
import { GlassBox } from '@veerone/galileo-glass-ui/components';

function AnimatedCard({ title, content }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    isAnimationDisabled,
    useSimplifiedAnimations,
    duration,
    createTransition
  } = useAlternativeAnimations({
    category: AnimationCategory.TRANSITION
  });
  
  // Regular, full animation style
  const fullAnimation = {
    maxHeight: isExpanded ? '300px' : '100px',
    opacity: isExpanded ? 1 : 0.8,
    transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    transition: createTransition(
      ['max-height', 'opacity', 'transform'],
      { duration: duration, easing: 'ease-in-out' }
    )
  };
  
  // Simplified animation alternative
  const simpleAnimation = {
    maxHeight: isExpanded ? '300px' : '100px',
    opacity: isExpanded ? 1 : 0.8,
    // No transform animation in the simplified version
    transition: createTransition(
      ['max-height', 'opacity'],
      { duration: duration * 1.2, easing: 'ease-in-out' }
    )
  };
  
  // Disabled animation style
  const noAnimation = {
    maxHeight: isExpanded ? '300px' : '100px',
    opacity: isExpanded ? 1 : 0.8,
    transition: 'none'
  };
  
  // Choose the appropriate style based on preferences
  const style = isAnimationDisabled
    ? noAnimation
    : useSimplifiedAnimations
      ? simpleAnimation
      : fullAnimation;
  
  return (
    <GlassBox
      style={{
        padding: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        ...style
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h3>{title}</h3>
      <div>{content}</div>
    </GlassBox>
  );
}

export default AnimatedCard;
```

## Best Practices

1. **Always provide alternatives**: For any animation, design a simplified or static alternative.
2. **Consider animation purpose**: Use the `AnimationCategory` to guide how to adapt animations.
3. **Respect user preferences**: Use the hooks and utilities provided rather than hardcoding animation behavior.
4. **Test with reduced motion**: Always test your components with reduced motion preferences enabled.
5. **Keep essential animations**: For animations that convey important information, simplify rather than remove them.
6. **Use consistent transitions**: For related animations, use the same timing and easing functions for consistency.
7. **Avoid complex transforms**: In alternatives, prefer opacity/color changes over complex transforms. 