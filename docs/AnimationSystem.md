# **Galileo Glass UI Animation System**

This comprehensive manual documents the Galileo Glass UI Animation System, a sophisticated animation framework designed specifically for glass morphism interfaces. It provides everything you need to implement beautiful, accessible, and performant animations in your Galileo Glass UI components.

## What's Inside

1. **Galileo Glass UI Animation System Core Concepts**  
2. **Physics Animation System for Modern Glass UI**  
3. **Glass UI Animation System Documentation**  
   - Introduction, Key Features, Getting Started, API Reference, Best Practices, and more  
4. **Animation Accessibility Checklist**  
5. **Glass UI Animation Best Practices**  
6. **Animation System Browser Compatibility Matrix**  
7. **Known Issues**  
8. **Reduced Motion Alternatives**  
9. **Accessibility Guidelines**

Please refer to the table of contents below for a detailed breakdown of each section.

---

## **Table of Contents**

1. [Galileo Glass UI Animation System](#galileo-glass-ui-animation-system)  
   1. [Key Features](#key-features)  
   2. [Directory Structure](#directory-structure)  
   3. [Accessibility Features](#accessibility-features)  
       1. [Reduced Motion Support](#reduced-motion-support)  
       2. [React Hooks](#react-hooks)  
   4. [Usage Examples](#usage-examples)  
       1. [Basic Accessible Animation](#basic-accessible-animation)  
       2. [Using Animation Presets](#using-animation-presets)  
       3. [Using UI-Specific Presets](#using-ui-specific-presets)  
       4. [Accessible Transitions](#accessible-transitions)  
   5. [Reduced Motion Alternatives](#reduced-motion-alternatives)  
   6. [Best Practices](#best-practices)  

2. [Physics Animation System for Modern Glass UI](#physics-animation-system-for-modern-glass-ui)  
   1. [Overview](#overview)  
   2. [Key Components](#key-components)  
       1. [Physics Animation Engine (`physicsAnimations.ts`)](#1-physics-animation-engine-physicsanimationsts)  
       2. [Scroll Scene System (`useScrollScene.ts`)](#2-scroll-scene-system-usescrollscenets)  
       3. [Mouse Physics Effects (`useMousePhysics.ts`)](#3-mouse-physics-effects-usemousephysicsts)  
   3. [Enhanced UI Components](#enhanced-ui-components)  
       1. [PhysicsButton](#1-physicsbutton)  
       2. [PhysicsInsightCard](#2-physicsinsightcard)  
       3. [PhysicsTabs](#3-physicstabs)  
       4. [PhysicsDashboardLayout](#4-physicsdashboardlayout)  
   4. [Physics Presets](#physics-presets)  
   5. [Z-Space Integration](#z-space-integration)  
   6. [Performance Considerations](#performance-considerations)  
   7. [Accessibility](#accessibility)  
   8. [Implementation Examples](#implementation-examples)

3. [Glass UI Animation System Documentation (Extended Content)](#glass-ui-animation-system-documentation-extended-content)  
   1. [Introduction](#introduction)  
   2. [Key Features](#key-features-1)  
   3. [Getting Started](#getting-started)  
       1. [Basic Usage](#basic-usage)  
       2. [Animation Options](#animation-options)  
   4. [Animation Categories](#animation-categories)  
   5. [Accessibility](#accessibility-1)  
       1. [Reduced Motion Support](#reduced-motion-support-1)  
       2. [Reduced Motion Alternatives](#reduced-motion-alternatives-1)  
       3. [Motion Sensitivity Levels](#motion-sensitivity-levels)  
   6. [Performance](#performance)  
       1. [Quality Tiers](#quality-tiers)  
       2. [Performance Optimizations](#performance-optimizations)  
   7. [Browser Compatibility](#browser-compatibility)  
       1. [Known Issues](#known-issues)  
   8. [Animation Creation Guides](#animation-creation-guides)  
   9. [Migrating Legacy Animations](#migrating-legacy-animations)  
   10. [Best Practices (Extended)](#best-practices-extended)  
   11. [API Reference](#api-reference)

4. [Animation Accessibility Checklist](#animation-accessibility-checklist)

5. [Glass UI Animation Best Practices](#glass-ui-animation-best-practices)

6. [Animation System Browser Compatibility Matrix](#animation-system-browser-compatibility-matrix)

7. [Glass UI Animation System - Known Issues](#glass-ui-animation-system---known-issues)

8. [Reduced Motion Alternatives (Detailed)](#reduced-motion-alternatives-detailed)

9. [Animation System Documentation (Detailed Sections)](#animation-system-documentation-detailed-sections)

10. [Accessibility Guidelines for Galileo](#accessibility-guidelines-for-galileo)

---

# **Galileo Glass UI Animation System**

This module provides a comprehensive animation system for the Galileo Glass UI framework with accessibility as a core principle. The animation system is designed to respect user preferences, including reduced motion settings, and provides appropriate alternatives for users with vestibular disorders.

## **Key Features**

- **Accessibility-First Approach**: All animations respect the `prefers-reduced-motion` media query  
- **Reduced Motion Alternatives**: Dedicated non-motion alternatives for all animations  
- **Theme Integration**: Animations adapt to theme context and device capabilities  
- **Performance Optimization**: Animations are optimized for performance and battery life  
- **Reusable Presets**: Common animation patterns for UI elements

---

## **Directory Structure**

```
animations/
  keyframes/
    basic.ts         // Basic animations (fade, scale, etc.)
    motion.ts        // Motion-intensive animations (slides, etc.)
    glass.ts         // Glass-specific effects
    reducedMotion.ts // Accessible alternatives
  utils/
    animationHelpers.ts   // Core animation creation helpers
    accessibilityUtils.ts // Accessibility-focused utilities
    types.ts              // Type definitions for animations
  presets/
    accessibleAnimations.ts // Accessible animation presets
  index.ts                 // Main entry point
```

---

## **Accessibility Features**

### **Reduced Motion Support**

The animation system automatically adapts to the user's reduced motion preference:

- Detects `prefers-reduced-motion: reduce` media query  
- Provides non-motion alternatives (color/opacity changes instead of movement)  
- Adjusts animation durations for reduced motion users  
- Supports device capability detection for optimal performance  

### **React Hooks**

- **`useReducedMotion()`**: Detects reduced motion preference  
- **`useMotionSettings()`**: Provides comprehensive motion settings  
- **`useAccessibleAnimationOptions()`**: Transforms animation options based on preferences

---

## **Usage Examples**

### **Basic Accessible Animation**

```tsx
import { 
  accessibleAnimation, 
  fadeIn
} from '../../design/animationUtils';
import { createThemeContext } from '../../design/core/themeUtils';

const MyAnimatedComponent = styled.div`
  ${props => accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease'
  })}
`;
```

### **Using Animation Presets**

```tsx
import { useAccessiblePreset } from '../../design/animations';
import { createThemeContext } from '../../design/core/themeUtils';

const MyComponent = styled.div`
  ${props => useAccessiblePreset('slideInBottom', {
    duration: 0.4
  })}
`;
```

### **Using UI-Specific Presets**

```tsx
import { accessibleUIAnimations } from '../../design/animations';
import { createThemeContext } from '../../design/core/themeUtils';

const ModalDialog = styled.div`
  ${props => accessibleUIAnimations.modalEnter({
    duration: 0.3,
    easing: 'ease-out'
  })}
`;
```

### **Accessible Transitions**

```tsx
import { createAccessibleTransition } from '../../design/animations';
import { createThemeContext } from '../../design/core/themeUtils';

const InteractiveElement = styled.div`
  ${props => createAccessibleTransition({
    properties: ['transform', 'background-color', 'box-shadow'],
    duration: 0.2,
    easing: 'ease-out'
  })}
  
  &:hover {
    background-color: rgba(97, 218, 251, 0.15);
    transform: translateY(-2px);
  }
`;
```

---

## **Animation API Patterns**

The animation system supports two API patterns:

### **Options-Based API (Modern/Recommended)**

```tsx
// ✅ CORRECT: Use options-based API for all new code
${accessibleAnimation({
  animation: fadeIn,
  duration: 0.3,
  easing: 'ease-out'
})}
```

### **Parameter-Based API (Legacy/Deprecated)**

```tsx
// ❌ DEPRECATED: Don't use parameter-based API in new code
${accessibleAnimation(fadeIn, null, 0.3, 'ease-out')}
```

### **Common Mistakes to Avoid**

```tsx
// ❌ INCORRECT: Don't pass themeContext to animation functions
${accessibleAnimation({
  animation: fadeIn,
  duration: 0.3,
  themeContext: createThemeContext(props.theme) // WRONG!
})}

// ✅ CORRECT: Use themeContext only with Glass mixins
${glassSurface({
  elevation: 2,
  blurStrength: 'standard',
  themeContext: createThemeContext(props.theme) // CORRECT!
})}

// ❌ INCORRECT: Don't use unsupported parameters
${accessibleAnimation({
  animation: fadeIn,
  reducedMotionAlternative: reducedFadeIn // WRONG!
})}

// ❌ INCORRECT: Don't import from wrong path
import { createThemeContext } from '../../design/core/themeContext'; // WRONG!

// ✅ CORRECT: Import from correct path
import { createThemeContext } from '../../design/core/themeUtils'; // CORRECT!
```

---

## **Reduced Motion Alternatives**

The system provides these alternatives for users who prefer reduced motion:

- `reducedFadeIn` / `reducedFadeOut`  
  - Simple opacity changes  
- `reducedEmphasis`  
  - Subtle opacity pulsing without movement  
- `reducedBorderHighlight`  
  - Border color changes for focus states  
- `reducedShadowEmphasis`  
  - Shadow changes for elevation feedback  
- `reducedColorShift`  
  - Color transitions without motion  
- `reducedMinimalScale`  
  - Very subtle scaling (nearly imperceptible)  
- `reducedStaticGlow`  
  - Pulsing opacity on glow effects  
- `reducedFocusRing`  
  - Animated focus indicators without motion  
- `reducedLoading`  
  - Loading indicators using opacity instead of spinning  
- `reducedNotification`  
  - Subtle attention-getting for notifications

---

## **Best Practices**

1. **Always Use Accessibility-Aware Utilities**  
   - Prefer `accessibleAnimation` over direct animations  
   - Use `createAccessibleTransition` for hover/focus effects  
   - Use the options-based API pattern for all new code

2. **Provide Meaningful Alternatives**  
   - Don't disable animations completely unless necessary  
   - Use appropriate reduced motion alternatives for essential UI feedback  
   - Use opacity or color changes instead of movement when possible  

3. **Test with Reduced Motion Setting**  
   - Enable "`prefers-reduced-motion: reduce`" in your browser's dev tools  
   - Verify that all UI elements remain functional without motion  
   - Ensure critical feedback is still communicated without animation  

4. **Respect API Boundaries**
   - Only use `themeContext` with Glass mixins, not with animation functions
   - Always import `createThemeContext` from '../../design/core/themeUtils'
   - Don't use unsupported parameters in animation functions

---

# **Physics Animation System for Modern Glass UI**

## **Overview**

The **Physics Animation System** brings realistic motion to the Glass UI component system, creating organic interactions that mimic the behavior of physical objects in the real world. This system introduces:

1. **Spring Physics Animations**  
2. **Scroll-Triggered Physics**  
3. **Mouse Physics Interactions**

---

## **Key Components**

### **1. Physics Animation Engine (`physicsAnimations.ts`)**

Calculates and applies spring equations, converting them to CSS animations via styled-components. Features:

- Precise spring calculations (mass, stiffness, damping)  
- Directional animations (slide, zoom, flip)  
- Motion presets for interaction patterns  
- Helper functions for composing animations

```tsx
import { 
  springAnimation, 
  bounceAnimation, 
  physicsPresets,
  glassAppear 
} from '../../design/physicsAnimations';

const AnimatedElement = styled.div`
  ${springAnimation({
    animation: slideInAnimation,
    mass: 1,
    stiffness: 170,
    dampingRatio: 0.7,
    initialVelocity: 0
  })}
`;
```

---

### **2. Scroll Scene System (`useScrollScene.ts`)**

Coordinates physics-based scroll animations:

- Tracks scroll progress with physics interpolation  
- Trigger points for element visibility  
- Momentum & smoothing for scroll transitions  
- Scene orchestration for multiple elements

```tsx
const { ref, styles } = useScrollElement(
  'element-id',
  {
    type: 'custom',
    customAnimation: parallaxReveal,
    physics: {
      enabled: true,
      mass: 1,
      stiffness: 120,
      dampingRatio: 0.7
    },
    trigger: {
      start: 0.1,
      end: 0.3,
      reverse: false
    },
    delay: 0.2
  }
);
```

---

### **3. Mouse Physics Effects (`useMousePhysics.ts`)**

Hooks for physics-based mouse interactions:

- `useMouseMagneticEffect`: Attraction/repulsion  
- `useMagneticButton`: Physics-based hover/press states  
- `useMouseCursorEffect`: Global cursor influence across elements

```tsx
const { 
  elementRef, 
  style, 
  onMouseEnter, 
  onMouseLeave, 
  onMouseDown, 
  onMouseUp 
} = useMagneticButton({
  strength: 0.4,
  radius: 150,
  pressScale: 0.95,
  hoverScale: 1.05,
  ...physicsPresets.responsive
});
```

---

## **Enhanced UI Components**

### **1. PhysicsButton**

Magnetic attraction, spring-based press animation, customizable physics.

```tsx
<PhysicsButton 
  variant="solid"
  intensity="bouncy"
  magneticStrength={0.5}
  magneticRadius={150}
  glowOnHover={true}
>
  Interactive Button
</PhysicsButton>
```

---

### **2. PhysicsInsightCard**

Magnetic hover, spring interaction, scroll-triggered reveal. Great for data visualization.

```tsx
<PhysicsInsightCard
  insight={insightData}
  physicsIntensity="responsive"
  scrollReveal={true}
  index={0}
/>
```

---

### **3. PhysicsTabs**

Physics-enhanced tab navigation with a spring indicator and magnetic tab buttons.

```tsx
<PhysicsTabs
  activeTab={activeTabIndex}
  onChange={handleTabChange}
  intensity="responsive"
  variant="underline"
  tabs={[
    { label: 'Tab One', content: <div>Content</div> },
    { label: 'Tab Two', content: <div>Content</div> }
  ]}
/>
```

---

### **4. PhysicsDashboardLayout**

Layout wrapper enabling cursor influence, parallax motion, and scroll-scene orchestration.

```tsx
<PhysicsDashboardLayout 
  enableParallax={true}
  enableCursorEffects={true}
  cursorInfluenceSelectors={['.GlassButton', '.GlassCard']}
>
  {/* Dashboard content */}
</PhysicsDashboardLayout>
```

---

## **Physics Presets**

Easily configure motion characteristics:

- **subtle**: Gentle, minimal motion  
- **responsive**: Balanced for general UI  
- **bouncy**: Playful, noticeable oscillation  
- **elastic**: Stretchy, flexible emphasis  
- **smooth**: Dampened, gradual slowdown

```tsx
import { physicsPresets } from '../../design/physicsAnimations';

const animationConfig = {
  ...physicsPresets.responsive,
  dampingRatio: 0.6
};
```

---

## **Z-Space Integration**

Depth-based effects:

- Parallax responding to mouse movement  
- Z-depth-based timing & intensities  
- 3D space stacking context

```tsx
<ZSpaceElement
  id="element-id"
  layer="content"
  parallaxDepth={2}
  parallaxIntensity="subtle"
>
  <PhysicsInsightCard insight={data} />
</ZSpaceElement>
```

---

## **Performance Considerations**

- `will-change` for GPU acceleration  
- Throttled physics calculations  
- Respects reduced motion for accessibility  
- Uses `requestAnimationFrame` for smooth loops  

---

## **Accessibility**

- Disables/reduces physics under `prefers-reduced-motion`  
- Fallback transitions for motion sensitivity  
- UI remains functional with animations off  

---

## **Implementation Examples**

- **`/src/components/ReflectionInsights/PhysicsDemo.tsx`**  
- **`/src/components/ReflectionInsights/PhysicsDashboardView.tsx`**  
- **`/src/design/PhysicsAnimationsDemo.tsx`**  

---

# **Glass UI Animation System Documentation (Extended Content)**

Below is **additional** animation documentation specifically titled *"Glass UI Animation System Documentation"* and its various sections.

---

## **Introduction**

The Glass UI Animation System provides a comprehensive framework for creating consistent, performant, and accessible animations throughout the Galileo application. This system is built on the foundation of standard CSS animations and keyframes, with enhancements for accessibility, performance, and browser compatibility.

---

## **Key Features**

- **Options-Based API**: A consistent, type-safe animation API  
- **Dimensional Depth**: Z-space animations for creating true depth perception  
- **Accessibility**: Comprehensive support for reduced motion preferences  
- **Performance**: Automatic adaptation based on device capabilities  
- **Browser Compatibility**: Support across all major browsers
- **Animation Orchestration**: Gestalt-based patterns for coordinated animations
- **Motion Sensitivity Levels**: Customizable animation intensity based on preferences
- **Advanced Physics Animations**: Spring physics, particle systems, and magnetic effects
- **Animation Mapping**: Intelligent mapping of animations to reduced motion alternatives

---

## **Getting Started**

### **Basic Usage**

```tsx
import { animate } from '../../design/animations/presets/accessibleAnimations';
import { fadeIn } from '../../design/animations/keyframes/basic';
import { createThemeContext } from '../../design/core/themeUtils';

const MyAnimatedComponent = styled.div`
  ${props => animate({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;
```

### **Animation Options**

The `animate` function accepts an options object with the following properties:

| Option                | Type                          | Default      | Description                                              |
|-----------------------|-------------------------------|--------------|----------------------------------------------------------|
| `animation`           | `Keyframes`                   | (required)   | The keyframe animation to use                            |
| `duration`            | `number`                      | `0.3`        | Duration in seconds                                      |
| `easing`              | `string`                      | `'ease'`     | CSS easing function                                      |
| `delay`               | `number`                      | `0`          | Delay in seconds                                         |
| `iterationCount`      | `number \| 'infinite'`        | `1`          | Number of times to play the animation                   |
| `direction`           | `string`                      | `'normal'`   | Animation direction                                      |
| `fillMode`            | `string`                      | `'none'`     | How to apply styles before/after animation              |
| `playState`           | `string`                      | `'running'`  | Whether to play or pause the animation                  |

---

## **Animation Categories**

### **Basic Animations**

- **Fade**: `fadeIn`, `fadeOut`, `fadeInUp`, `fadeOutDown`, etc.  
- **Slide**: `slideIn`, `slideOut`, `slideUp`, `slideDown`, etc.  
- **Scale**: `scaleIn`, `scaleOut`, `zoomIn`, `zoomOut`, etc.  
- **Rotate**: `rotateIn`, `rotateOut`, `flip`, etc.

### **Dimensional Animations**

- **Z-Space**: `zSpaceForward`, `zSpaceBackward`, `dimensionalReveal`, etc.  
- **Parallax**: `parallaxScroll`, `parallaxReveal`, etc.  
- **Depth**: `depthFade`, `depthScale`, `depthRotate`, etc.

### **Interactive Animations**

- **Hover**: `hoverGlow`, `hoverScale`, `hoverLift`, etc.  
- **Press**: `pressDown`, `pressScale`, `pressHighlight`, etc.  
- **Focus**: `focusRing`, `focusGlow`, `focusOutline`, etc.

### **Specialized Animations**

- **Glass**: `glassShimmer`, `glassReflection`, `glassFrost`, etc.  
- **Atmospheric**: `atmosphericGlow`, `atmosphericParticles`, etc.  
- **Physics**: `spring`, `bounce`, `wobble`, etc.

### **Advanced Physics Animations**

- **Spring System**: `springMotion`, `dampedOscillation`, `springToPosition`, etc.
- **Particle Effects**: `particleEmission`, `particleField`, `particleAttraction`, etc.
- **Magnetic Interactions**: `magneticAttraction`, `magneticRepulsion`, `magneticSnap`, etc.
- **Path Physics**: `naturalPathFollowing`, `springPathMotion`, `physicsBasedPath`, etc.

### **Orchestration Patterns**

- **Sequenced**: `staggeredReveal`, `cascadeAnimation`, `sequentialFade`, etc.
- **Gestalt-Based**: `hierarchicalReveal`, `relatedItemsAnimation`, `contextualHighlight`, etc.
- **Narrative**: `storySequence`, `narrativeJourney`, `guidedAttention`, etc.
- **Spatial**: `spatialRelationshipReveal`, `spatialGrouping`, `contextualSpacing`, etc.

---

## **Accessibility**

### **Reduced Motion Support**

```tsx
import { animate } from '../../design/animations/presets/accessibleAnimations';
import { fadeIn } from '../../design/animations/keyframes/basic';

const MyAccessibleComponent = styled.div`
  ${props => animate({
    animation: fadeIn,
    duration: 0.3
  })}
`;
```

### **Reduced Motion Alternatives**

| Standard Animation | Reduced Motion Alternative    |
|--------------------|-------------------------------|
| `fadeIn`           | `reducedFadeIn` (opacity only)|
| `slideIn`          | `reducedFadeIn` (no movement) |
| `zoomIn`           | `reducedMinimalScale`         |
| `rotateIn`         | `reducedEmphasis`            |

### **Motion Sensitivity Levels**

- **None**: No animations  
- **Minimal**: Essential opacity animations only  
- **Reduced**: Gentle animations without motion  
- **Standard**: Normal animations  
- **Enhanced**: Extra animations for users who enjoy them

---

## **Performance**

The animation system automatically adapts to device capabilities:

### **Quality Tiers**

- **Ultra**: Full effects on high-end devices  
- **High**: Slightly reduced effects on good devices  
- **Medium**: Moderately reduced effects on average devices  
- **Low**: Minimized effects on lower-end devices  
- **Minimal**: Essential animations only on very low-end devices

### **Performance Optimizations**

- Automatic GPU acceleration with `will-change`  
- Frame limiting on low-end devices  
- Reduced particle counts on lower tiers  
- CSS property substitutions for better performance  
- Animation batching for multiple elements

---

## **Browser Compatibility**

The animation system is tested across all major browsers:

- Chrome 76+  
- Firefox 70+  
- Safari 9+  
- Edge 79+

### **Known Issues**

See the [Known Issues section](#glass-ui-animation-system---known-issues) for details on browser-specific compatibility issues and workarounds.

---

## **Animation Creation Guides**

### **Creating Basic Animations**

```tsx
// In /frontend/src/design/animations/keyframes/custom.ts
import { keyframes } from 'styled-components';

export const myCustomAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const reducedMyCustomAnimation = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
```

### **Creating Animation Presets**

```tsx
// In /frontend/src/design/animations/presets/custom.ts
import { animate } from './accessibleAnimations';
import { myCustomAnimation, reducedMyCustomAnimation } from '../keyframes/custom';

export const customEntrance = (props) => animate({
  animation: myCustomAnimation,
  duration: 0.4,
  easing: 'ease-out'
});
```

## **Advanced Animation Systems**

### **Animation Orchestration**

The orchestration system enables coordinated, purposeful animations across multiple components to create cohesive user experiences.

```tsx
import { useOrchestration } from '../../hooks/useOrchestration';
import { gestaltPatterns } from '../../design/animations/orchestration/GestaltPatterns';

function DashboardReveal() {
  // Create refs for all elements that will be animated
  const elements = {
    header: useRef(null),
    sidebar: useRef(null),
    metrics: [useRef(null), useRef(null), useRef(null)],
    cards: [useRef(null), useRef(null), useRef(null), useRef(null)]
  };
  
  // Use the gestalt pattern for hierarchical reveal
  const { playSequence, reset } = useOrchestration(
    gestaltPatterns.hierarchicalReveal(elements, {
      continuity: 'smooth',       // How smoothly animations overlap
      pacing: 'natural',          // Timing distribution
      direction: 'top-to-bottom', // Overall direction
      stagger: 0.05               // Delay between consecutive items
    })
  );
  
  useEffect(() => {
    // Play the animation sequence on mount
    playSequence();
    
    // Reset animation when data changes
    return () => reset();
  }, [data]);
  
  return (
    <div>
      <Header ref={elements.header}>Dashboard</Header>
      <Sidebar ref={elements.sidebar}>
        {/* Sidebar content */}
      </Sidebar>
      <main>
        <MetricsRow>
          {metrics.map((metric, i) => (
            <MetricCard key={metric.id} ref={elements.metrics[i]} />
          ))}
        </MetricsRow>
        <CardGrid>
          {cards.map((card, i) => (
            <DashboardCard key={card.id} ref={elements.cards[i]} />
          ))}
        </CardGrid>
      </main>
    </div>
  );
}
```

### **Physics-Based Animation System**

The physics animation system provides realistic, natural motion that mimics real-world physics.

```tsx
import { 
  usePhysicsInteraction, 
  physicsPresets 
} from '../../hooks/usePhysicsInteraction';
import { springAnimation } from '../../design/animations/physics/springAnimation';
import { magneticEffect } from '../../design/animations/physics/magneticEffect';

// Create a magnetic button with spring-based physics
function MagneticPhysicsButton({ children, onClick }) {
  const { 
    ref, 
    style, 
    handlers 
  } = usePhysicsInteraction({
    // Physics type
    type: 'magnetic',
    
    // Spring properties
    mass: 1,              // Object mass (higher = more inertia)
    stiffness: 170,       // Spring stiffness (higher = faster movement)
    dampingRatio: 0.7,    // Damping (higher = less oscillation)
    
    // Magnetic properties
    attractionRadius: 150,    // Distance at which attraction begins
    attractionStrength: 0.4,  // Strength of magnetic pull
    repulsionEnabled: false,  // Whether to enable repulsion mode
    
    // Interactive properties
    hoverScale: 1.05,         // Scale factor on hover
    pressScale: 0.95,         // Scale factor when pressed
    
    // Preset (optional - overrides individual settings)
    ...physicsPresets.responsive
  });
  
  return (
    <button 
      ref={ref}
      style={style}
      onClick={onClick}
      {...handlers}
    >
      {children}
    </button>
  );
}

// Use the particle system for ambient effects
function ParticleBackgroundEffect() {
  const { containerRef } = useParticleSystem({
    count: 50,                // Number of particles
    speedFactor: 0.5,         // Overall speed multiplier
    sizeRange: [2, 8],        // Min/max particle size
    colorPalette: ['#4B66EA', '#2CA2F6', '#C084FC'],  // Colors
    opacityRange: [0.3, 0.7], // Min/max opacity
    physics: {
      friction: 0.02,         // Slowing force
      turbulence: 0.1,        // Random movement factor
      attraction: {
        enabled: true,        // Mouse attraction
        strength: 0.5,        // Attraction strength
        radius: 200           // Attraction radius
      }
    }
  });
  
  return <div ref={containerRef} className="particle-container" />;
}
```

### **Motion Sensitivity System**

The motion sensitivity system provides granular control over animation intensity based on user preferences.

```tsx
import { MotionSensitivity } from '../../design/animations/accessibility/MotionSensitivity';
import { AnimationMapper } from '../../design/animations/accessibility/AnimationMapper';
import { useMotionSettings } from '../../hooks/useMotionSettings';

function AccessibleAnimatedComponent() {
  // Get the user's motion sensitivity preference
  const { 
    motionSensitivity,
    motionReduced,
    userPreferences
  } = useMotionSettings();
  
  // Create animation map with alternatives for each sensitivity level
  const animationMap = {
    [MotionSensitivity.STANDARD]: fullAnimation,
    [MotionSensitivity.REDUCED]: subtleAnimation,
    [MotionSensitivity.MINIMAL]: opacityOnlyAnimation,
    [MotionSensitivity.NONE]: null
  };
  
  // Get the appropriate animation based on user preference
  const animation = animationMap[motionSensitivity] || animationMap[MotionSensitivity.NONE];
  
  // Adjust duration based on sensitivity
  const getDuration = () => {
    switch(motionSensitivity) {
      case MotionSensitivity.STANDARD: return 0.4;
      case MotionSensitivity.REDUCED: return 0.3;
      case MotionSensitivity.MINIMAL: return 0.2;
      default: return 0;
    }
  };
  
  return (
    <div style={{ 
      animation: animation ? `${animation} ${getDuration()}s ease-out forwards` : 'none'
    }}>
      Content with motion sensitivity adaptations
    </div>
  );
}
```

---

## **Migrating Legacy Animations**

```tsx
// Before (parameter-based)
${animate(fadeIn, 0.3, 'ease')}

// After (options-based)
${props => animate({
  animation: fadeIn,
  duration: 0.3,
  easing: 'ease'
})}
```

---

## **Best Practices (Extended)**

1. **Always use options-based API for new code**  
2. **Always provide reduced motion alternatives**  
3. **Use appropriate durations**  
4. **Consider performance implications**  
5. **Test across browsers and devices**
6. **Never pass themeContext to animation functions**
7. **Always import createThemeContext from the correct path**

---

## **API Reference**

- Animation Functions  
- Keyframes  
- Presets  
- Performance Utilities  
- Accessibility Utilities

Refer to the API documentation in the codebase for detailed information on each function and component.

---

# **Animation Accessibility Checklist**

This checklist helps ensure that all animations in the Glass UI system meet accessibility requirements, particularly for users with vestibular disorders, motion sensitivity, or those using assistive technologies.

## **Reduced Motion Support**

### **Essential Requirements**

- [ ] Respects user's `prefers-reduced-motion`  
- [ ] Provides a reduced motion alternative  
- [ ] No critical info lost when motion is removed  
- [ ] Functionality remains with animations off  

### **Implementation Checklist**

- [ ] Use the options-based API  
- [ ] Substitute motion with opacity/color changes  
- [ ] Full disable supported if necessary  
- [ ] Content remains accessible

---

## **Animation Timing**

### **Essential Requirements**

- [ ] Durations are appropriate (200-500ms typical)  
- [ ] No flashing >3 times/second  
- [ ] Allows user to pause if >5 seconds  

---

## **Animation Content**

### **Essential Requirements**

- [ ] Avoid large-scale parallax for reduced motion  
- [ ] Text remains legible during animation  
- [ ] Concurrent animations don't overwhelm the user  

---

## **Screen Reader Support**

### **Essential Requirements**

- [ ] Screen readers announce new content  
- [ ] Live regions used for dynamic changes  
- [ ] Focus is managed properly  

---

## **Keyboard Navigation**

### **Essential Requirements**

- [ ] Keyboard users see the same feedback  
- [ ] Focus states remain visible  
- [ ] No focus loss during animations  

---

## **Testing Checklist**

1. Automated tests for reduced motion  
2. Manual tests with OS `prefers-reduced-motion` enabled  
3. Screen reader tests  
4. Keyboard navigation tests  
5. Motion sensitivity across levels  

---

# **Glass UI Animation Best Practices**

A comprehensive guide for creating and implementing animations in the Glass UI system.

## **Animation Principles**

1. **Purpose First**  
2. **Natural and Fluid Motion**  
3. **Subtlety and Restraint**  
4. **Consistency Across the System**

---

## **Technical Implementation**

- **Transform and Opacity** for GPU acceleration  
- **Avoid Reflow** by not animating layout properties  
- **Reduced Motion** for accessibility  
- **Test Across Browsers**

---

## **Component-Specific Guidelines**

### **Page Transitions**

- Maintain context  
- Directional cues  
- 200-500ms duration  

### **Modal Dialogs**

- Z-space entry  
- Focus management  
- Background dim/blur  

### **Interactive Elements**

- Immediate feedback  
- State transitions  
- Hover/active/focus states  

### **Lists and Collections**

- Staggered entrances  
- Sorting/filtering feedback  
- Clear addition/removal  

### **Progress Indicators**

- Ongoing feedback  
- Distinguish determinate vs. indeterminate  
- Clear completion states  

---

# **Animation System Browser Compatibility Matrix**

Defines the compatibility testing framework for the Glass UI animation system.

## **Browser Testing Targets**

| Browser  | Version  | OS              | Priority | Support Level |
|----------|----------|-----------------|----------|--------------|
| Chrome   | 114+     | Win, macOS, Android | P0       | Full          |
| Chrome   | 76-113   | Win, macOS, Android | P1       | Full          |
| Edge     | 110+     | Windows         | P0       | Full          |
| Edge     | 79-109   | Windows         | P1       | Full          |
| Safari   | 16.4+    | macOS, iOS      | P0       | Full          |
| Safari   | 15.4-16.3| macOS, iOS      | P1       | Full          |
| Safari   | 9-15.3   | macOS, iOS      | P2       | Partial       |
| Firefox  | 110+     | Win, macOS      | P0       | Full          |
| Firefox  | 103-109  | Win, macOS      | P1       | Full          |
| Firefox  | 70-102   | Win, macOS      | P2       | Partial       |
| Opera    | 100+     | Win, macOS      | P1       | Full          |
| Opera    | 63-99    | Win, macOS      | P2       | Full          |
| Samsung Internet | 20+ | Android      | P1       | Full          |
| Samsung Internet | 12-19 | Android   | P2       | Full          |

---

## **Device Testing Targets**

- **Desktop**: High-end, mid-range, low-end, older  
- **Mobile**: Flagship, mid-range, budget, older  
- **Tablet**: iPad Pro, standard iPad, Android tablets  

---

## **Animation Test Scenarios**

1. Basic Animation Tests (fade, slide, scale, etc.)  
2. Interactive Animation Tests (hover, menu expansion)  
3. Z-Space Animation Tests (modal, parallax)  
4. Performance Tests (FPS, CPU usage)  
5. Accessibility Tests (prefers-reduced-motion, screen reader)  
6. Complex Animation Tests (page transitions, physics)

---

# **Glass UI Animation System - Known Issues**

## **Browser Compatibility Issues**

### 1. Modal Z-Space Entrance Animation
- **Affected**: Chrome 76-113, Safari 16.4+, Firefox 103-109  
- **Issue**: Depth effects may not render correctly  
- **Workaround**: Falls back to fade  
- **Planned Fix**: Alternative depth rendering for older Chrome

### 2. Card Detail Expansion
- **Affected**: Firefox 110+, Safari 9-15.3  
- **Issue**: Backdrop-filter limitations  
- **Workaround**: Simpler surface effect  
- **Planned Fix**: CSS-only fallback

### 3. Button Hover Animations
- **Affected**: Firefox 103-109, Safari 16.4+  
- **Issue**: Timing glitches  
- **Workaround**: Basic hover effects  
- **Planned Fix**: Minor update in 2 weeks

---

## **Reduced Motion Support Issues**

### 1. Automatic Detection
- **Affected**: Firefox 70-102, Safari 15.4+  
- **Issue**: Prefers-reduced-motion not always consistent  
- **Workaround**: Manual toggle in settings  
- **Planned Fix**: Enhanced detection fallback

### 2. Animation Alternatives Quality
- **Issue**: Some reduced motion still too high for severe vestibular disorders  
- **Workaround**: Option to disable all animations  
- **Planned Fix**: Q2 review

---

## **Performance Issues**

### 1. High CPU Usage
- **Issue**: Many animated components cause spikes  
- **Workaround**: Quality tier adaptation  
- **Planned Fix**: Further optimization in next minor update

### 2. Memory Management
- **Issue**: Minor memory leaks on repeated mount/unmount  
- **Workaround**: Cleanup on unmount  
- **Planned Fix**: Q2 memory profiling

---

# **Reduced Motion Alternatives (Detailed)**

This section expands on the reduced motion alternatives within the system.

- Replaces slides/zooms/rotations with opacity or subtle color changes  
- Minimizes large-scale movement in parallax or dimensional reveals  
- Provides user override for motion sensitivity levels  
- Includes automated tests (`mockReducedMotion`)  

---

# **Animation System Documentation (Detailed Sections)**

Contains further examples, longer explanations, and deeper technical details about how animations are structured, used, and tested. (See the main docs above for the high-level overview.)

---

# **Accessibility Guidelines for Galileo**

**Core Principles**: Perceivable, Operable, Understandable, Robust

**Implementation**:  
- **Keyboard Navigation**: Full keyboard control, visible focus  
- **Screen Reader Support**: Proper ARIA, semantic HTML  
- **Motion and Animation**: Respect reduced-motion, test for vestibular triggers  
- **Color and Contrast**: 4.5:1 or higher for text, no color-only cues  
- **Form Inputs**: Explicit labels, clear errors, validated states

**Modules**: `KeyboardNavigation`, `ScreenReaderSupport`, `ReducedMotion`, `AccessibilityProvider`

**Testing**:  
- Manual + automated (axe-core)  
- Reduced motion OS settings  
- Screen readers (NVDA, JAWS, VoiceOver)

---

**End of Unified Manual**