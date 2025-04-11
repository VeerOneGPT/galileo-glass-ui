# Animation Orchestration: `useOrchestration`

This document details the `useOrchestration` hook provided by Galileo Glass UI for creating and managing coordinated sequences of animations based on various timing patterns and optional Gestalt principles.

## Table of Contents

- [Purpose](#purpose)
- [Core Concepts](#core-concepts)
  - [Configuration (`OrchestrationOptions`)](#configuration-orchestrationoptions)
    - [Stages (`AnimationStage`)](#stages-animationstage)
  - [Patterns (`OrchestrationPattern`)](#patterns-orchestrationpattern)
  - [Gestalt Patterns (`GestaltPatternOptions`)](#gestalt-patterns-gestaltpatternoptions)
  - [Reduced Motion](#reduced-motion)
- [Signature](#signature)
- [Parameters (`OrchestrationOptions`)](#parameters-orchestrationoptions)
- [Stage Configuration (`AnimationStage`)](#stage-configuration-animationstage)
- [Return Value](#return-value)
- [Example Usage](#example-usage)
- [Best Practices](#best-practices)
- [Known Issues and Workarounds](#known-issues-and-workarounds)
- [Integration with Event-Based Animation System (v1.0.28+)](#integration-with-event-based-animation-system-v1028)

---

## Purpose {#purpose}

The `useOrchestration` hook is designed to:

- Manage the timing and execution order of multiple independent animation triggers or stages.
- Apply predefined timing patterns (sequential, parallel, staggered, wave, etc.) to a list of animation stages.
- Optionally calculate stage timing based on Gestalt principles (proximity, similarity, continuity) using stage metadata like position or type.
- Control the playback of the entire orchestration (start, stop, pause - implied, though not explicitly returned).
- Respect user preferences for reduced motion.

**Note:** This hook primarily focuses on calculating *when* each stage should start (`delay`) based on the chosen pattern. It does not directly perform the animations themselves; it assumes other mechanisms (like CSS transitions triggered by state changes, or other animation hooks) are responsible for the actual visual changes associated with each stage.

**Known Issue:** There might be a type discrepancy where the hook internally expects a slightly different `AnimationStage` type than the one exported, potentially requiring workarounds like adding a default `delay: 0` to stage definitions even when using patterns that calculate delay automatically.

---

## Core Concepts {#core-concepts}

#### Configuration (`OrchestrationOptions`)
The hook takes a single configuration object (`OrchestrationOptions`) that defines the stages, the desired timing pattern, and other control parameters.

#### Stages (`AnimationStage`)
The core input is the `stages` array. Each object in the array represents an `AnimationStage` to be timed by the orchestrator. 
- **Definition:** Stages should conform to the base `AnimationStage` interface (defined in the hook's source), including properties like `id`, `duration`, and `delay`. 
- **`delay` Property:** Even if using a `pattern` like `'staggered'` that calculates delays, you might need to include a default `delay: 0` in your stage definitions to satisfy the current type requirements (see Known Issue above). The hook's pattern logic will override this default value.
- **`animation` Property:** Optional property `animation: { easing?: TimingFunction; keyframes?: string; }` can be defined directly on the stage object. Avoid nesting animation details within other properties when using standard patterns.

#### Patterns (`OrchestrationPattern`)
You specify how the timing between stages should be calculated using the `pattern` option (e.g., `'sequential'`, `'parallel'`, `'staggered'`, `'wave'`, `'gestalt'`). 
- **How it Works:** The hook calculates the final `delay` for each stage based on the chosen pattern and potentially other stage properties or options (`staggerDelay`, `gestaltOptions`). 
- **Example (`staggered`):** When using `pattern: 'staggered'`, provide a `staggerDelay` in the main options. Define your stages with just `id`, `duration`, and potentially a default `delay: 0`. Do *not* manually set incremental delays on the stages themselves.

#### Gestalt Patterns (`GestaltPatternOptions`)
If `pattern` is set to `'gestalt'`, you can provide `gestaltOptions` to influence timing based on perceptual principles. This requires stages to have relevant properties like `position` (for proximity, continuity, converge/diverge) or `elementType` (for similarity).

#### Reduced Motion {#reduced-motion}
If `respectReducedMotion` is true (default), the hook checks the user's system preference. If reduced motion is preferred, stage delays and durations might be modified (potentially set to 0) to minimize motion.

---

## Signature {#signature}

```typescript
import {
  useOrchestration,
  type OrchestrationOptions,
  type AnimationStage, // Defined within useOrchestration.ts
  // ... other related types like OrchestrationPattern
} from '../hooks/useOrchestration'; // Adjust path as necessary

// Simplified return type - actual return includes more internal state
interface OrchestrationResult {
  activeStages: string[];
  completedStages: string[];
  isPlaying: boolean;
  sequenceComplete: boolean;
  iteration: number;
  progress: number;
  totalDuration: number;

  // Control functions
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  restart: () => void;
  skipToStage: (stageId: string) => void;

  // Status helpers
  isStageActive: (stageId: string) => boolean;
  isStageCompleted: (stageId: string) => boolean;
  getStagesByStatus: () => { pending: string[]; active: string[]; completed: string[] };
  getStageInfo: (stageId: string) => AnimationStage & { /* status info */ } | null;
}

function useOrchestration(
  options: OrchestrationOptions
): OrchestrationResult;
```
*(Note: The exact return type should be confirmed from the hook's implementation as it includes state values like `activeStages`, `completedStages`, etc., which might be primarily for internal use.)*

---

## Parameters (`OrchestrationOptions`)

A single object with the following key properties:

- **`stages`** (`AnimationStage[]`, **Required**): Array defining the animation stages to be orchestrated.
- `autoStart` (`boolean`, optional): Start the orchestration automatically on mount if `active`. Default: `true`.
- `startDelay` (`number`, optional): Initial delay (ms) before the first stage begins. Default: `0`.
- `repeat` (`boolean`, optional): Whether the sequence should repeat. Default: `false`.
- `repeatCount` (`number`, optional): Number of repetitions (Infinity for endless). Default: `1`.
- `repeatDelay` (`number`, optional): Delay (ms) between repetitions. Default: `0`.
- `active` (`boolean`, optional): Controls whether the orchestration is currently running or paused. Default: `true`.
- `onComplete` (`() => void`, optional): Callback when the entire sequence (including repeats) finishes.
- `onStart` (`() => void`, optional): Callback when the orchestration first starts.
- `pattern` (`OrchestrationPattern`, optional): The timing pattern to apply. Default: `'sequential'`.
- `staggerDelay` (`number`, optional): Base delay (ms) used for `'staggered'` pattern and potentially others. Default: `100`.
- `gestaltOptions` (`GestaltPatternOptions`, optional): Configuration for the `'gestalt'` pattern (see details below).
- `respectReducedMotion` (`boolean`, optional): Apply reduced motion adjustments. Default: `true`.
- `optimizeForPerformance` (`boolean`, optional): Apply performance optimizations (may adjust timing slightly). Default: `true`.
- `customTimingFunction` (`(stage: AnimationStage, index: number, total: number) => number`, optional): Provide a custom function to calculate stage delays if `pattern` is `'custom'`.
- `analyzeRelationships` (`boolean`, optional): If true, attempts to analyze `dependencies` for `'connectedness'` gestalt pattern. Default: `false`.

### Gestalt Pattern Options (`GestaltPatternOptions`)

Used when `pattern` is `'gestalt'`:

- `primaryRelationship` (`GestaltRelationship`, **Required**): The main principle to use (e.g., `'proximity'`, `'similarity'`, `'continuity'`).
- `secondaryRelationship` (`GestaltRelationship`, optional): A secondary principle.
- `baseDelay` (`number`, optional): Base delay used in calculations. Default: `50`.
- `maxDelay` (`number`, optional): Maximum delay constraint. Default: `1000`.
- `focalPoint` (`Point { x: number; y: number; z?: number }`, optional): Target point for `'converge'` / `'diverge'` patterns.
- `proximityThreshold` (`number`, optional): Distance threshold for `'proximity'`. Default: `100`.
- `waveEffect` (`boolean`, optional): Apply wave effect (likely relevant to `'continuity'`).
- `similarityAttribute` (`string`, optional): Attribute to use for `'similarity'` (likely `elementType` on the stage).
- `continuityPath` (`Point[]`, optional): Explicit path for `'continuity'` pattern.

---

## Stage Configuration (`AnimationStage`)

Each object in the `stages` array should conform to this interface (defined within `useOrchestration.ts`):

```typescript
interface AnimationStage {
  id: string; // Required: Unique identifier for the stage
  delay: number; // Required: Base delay before this stage starts (can be modified by the pattern)
  duration: number; // Required: Duration of this stage's animation
  onStart?: () => void; // Optional: Callback when this specific stage starts
  onEnd?: () => void; // Optional: Callback when this specific stage ends
  completed?: boolean; // Optional: Initial completed state (managed internally)
  order?: number; // Optional: Explicit order for sorting stages before pattern application
  animation?: { // Optional: Metadata about the animation (not directly used by orchestrator)
    easing?: TimingFunction;
    keyframes?: string;
  };
  group?: string; // Optional: Group identifier for gestalt 'closure' pattern
  position?: { x: number; y: number; z?: number }; // Optional: Spatial position for gestalt patterns
  dependencies?: string[]; // Optional: Array of stage IDs that must complete first
  elementType?: string; // Optional: Type/category for gestalt 'similarity' pattern
  priority?: number; // Optional: Priority level for potential future use
  relationship?: GestaltRelationship; // Optional: Metadata for potential future use
}
```

**Key Points:**

- The `delay` you provide is the *base* delay. The final calculated delay used by the hook depends on the `pattern` and other options.
- Properties like `position`, `elementType`, `group`, and `dependencies` are only used if the corresponding `pattern` (e.g., `'gestalt'`) or `analyzeRelationships` option is active.
- The hook focuses on calculating timing. The actual animation logic tied to `onStart`/`onEnd` or triggered by state changes based on `isPlaying` or `activeStages` is external to this hook.

---

## Return Value

The hook returns an object containing state information and control functions:

*   **State:**
    *   `activeStages` (`string[]`): IDs of stages currently in progress.
    *   `completedStages` (`string[]`): IDs of stages that have finished.
    *   `isPlaying` (`boolean`): Is the orchestration currently playing (not paused or stopped)?
    *   `sequenceComplete` (`boolean`): Has the entire sequence (including repeats) finished?
    *   `iteration` (`number`): Current repetition number (starts at 1).
    *   `progress` (`number`): Overall progress of the current sequence iteration (0 to 1).
    *   `totalDuration` (`number`): Calculated total duration of one sequence iteration (ms).
*   **Controls:**
    *   `start()`: Begins the orchestration (or resumes if paused).
    *   `stop()`: Stops execution immediately and clears timers.
    *   `pause()`: Pauses execution, retaining progress.
    *   `resume()`: Resumes execution from the paused state.
    *   `reset()`: Stops execution, clears timers, and resets all stage progress and iteration count.
    *   `restart()`: Equivalent to `reset()` followed by `start()`.
    *   `skipToStage(stageId)`: Jumps execution to the beginning of the specified stage.
*   **Status Helpers:**
    *   `isStageActive(stageId)`: Checks if a specific stage is running.
    *   `isStageCompleted(stageId)`: Checks if a specific stage has finished.
    *   `getStagesByStatus()`: Returns an object categorizing all stage IDs by status (pending, active, completed).
    *   `getStageInfo(stageId)`: Returns detailed information (including progress) about a specific stage.

---

## Example Usage

```tsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  useOrchestration,
  type OrchestrationOptions,
  type AnimationStage
} from './hooks/useOrchestration'; // Adjust path
import { GlassBox, GlassButton } from './components'; // Example components

// Example animation
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const moveUp = keyframes`from { transform: translateY(20px); } to { transform: translateY(0); }`;

const AnimatedItem = styled(GlassBox)<{ $isActive?: boolean }>`
  opacity: 0; // Start hidden
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  ${({ $isActive }) =>
    $isActive &&
    `
    opacity: 1;
    transform: translateY(0);
  `}
  // For more complex animations directly tied to stage start/end,
  // you might use different keyframes or inline styles triggered by callbacks.
`;

const OrchestrationDemo = () => {
  const [runSequence, setRunSequence] = useState(false);

  // Define stages with IDs, base delays, and durations
  // These delays will be recalculated based on the pattern
  const stages: AnimationStage[] = [
    {
      id: 'item1',
      delay: 0, // Base delay
      duration: 500, // How long the animation for item1 takes
      position: { x: 10, y: 10 },
      elementType: 'card',
      onStart: () => console.log('Item 1 Start'),
      onEnd: () => console.log('Item 1 End'),
    },
    {
      id: 'item2',
      delay: 100, // Base delay
      duration: 500,
      position: { x: 120, y: 10 },
      elementType: 'card',
      dependencies: ['item1'], // Example dependency
      onStart: () => console.log('Item 2 Start'),
    },
    {
      id: 'item3',
      delay: 200, // Base delay
      duration: 500,
      position: { x: 10, y: 120 },
      elementType: 'icon',
      onStart: () => console.log('Item 3 Start'),
    },
  ];

  const orchestrationOptions: OrchestrationOptions = {
    stages,
    pattern: 'staggered', // Use staggered timing
    staggerDelay: 150, // Delay between each item start
    autoStart: false, // Don't start immediately
    active: runSequence, // Control playback with state
    onStart: () => console.log('Orchestration Started'),
    onComplete: () => {
      console.log('Orchestration Complete');
      setRunSequence(false); // Reset control state
    },
  };

  const { activeStages, isPlaying, processedStages } = useOrchestration(orchestrationOptions);

  // Log calculated delays
  useEffect(() => {
    console.log('Processed Stage Delays:', processedStages.map(s => ({ id: s.id, delay: s.delay })));
  }, [processedStages]);

  return (
    <GlassBox style={{ padding: '16px' }}>
      <GlassButton onClick={() => setRunSequence(true)} disabled={runSequence}>
        {isPlaying ? 'Playing...' : 'Start Staggered Sequence'}
      </GlassButton>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        {stages.map(stage => (
          <AnimatedItem
            key={stage.id}
            $isActive={activeStages.includes(stage.id)} // Trigger animation based on active state
            style={{ width: '100px', height: '100px' }} // Example styling
          >
            {stage.id}
          </AnimatedItem>
        ))}
      </div>
    </GlassBox>
  );
};

export default OrchestrationDemo;
```

---

## Best Practices {#best-practices}

- **Provide Required Stage Properties:** Ensure all stages have `id`, `delay`, and `duration`.
- **Match Patterns and Stage Data:** If using `'gestalt'` patterns, ensure stages have the necessary `position`, `elementType`, or `group` properties.
- **Use `active` Prop for Control:** Since `play`/`pause`/`stop` aren't returned, manage playback primarily by toggling the `active` prop in your component's state.
- **Coordinate with Actual Animations:** Remember this hook calculates timing. You need a separate mechanism (CSS transitions based on `activeStages`, other animation libraries triggered by `onStart`/`onEnd`, etc.) to perform the visual animations.
- **Unique Stage IDs:** Use unique and descriptive `id` values for stages, especially if using `dependencies`.
- **Consider Performance:** For very large numbers of stages, be mindful of the complexity of pattern calculations, especially complex gestalt patterns.
- **Prefer `useAnimationSequence`:** For most complex sequence needs, the [`useAnimationSequence`](#useanimationsequence-hook-primary-orchestration-hook) hook offers more direct control over animation properties and targets and is generally preferred.

---

## Known Issues and Workarounds {#known-issues-and-workarounds}

When working with `useAnimationSequence` and animation orchestration hooks, you may encounter several common issues. This section documents these problems and provides practical solutions based on real-world implementation experience.

### Element Visibility Issues

**Issue:** Elements defined in animation stages may not appear at all, even though they are correctly added to the DOM.

**Solution:** 
1. Make elements initially visible in your component rather than relying on the hook to set initial styles:

```jsx
// PROBLEM: Starting with invisible elements can cause animation failures
const element = document.createElement('div');
element.style.opacity = '0'; 
element.style.transform = 'scale(0)';

// SOLUTION: Make elements visible initially, then let animation handle transitions
const element = document.createElement('div');
element.style.opacity = '1'; 
element.style.transform = 'scale(1)';
```

2. Ensure container elements have explicit dimensions:

```jsx
// Add explicit dimensions to your container
const AnimationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px; // Explicit height ensures proper layout
  min-height: 400px;
  border: 1px solid rgba(0, 0, 0, 0.1); // Border helps visualize the container
  display: flex; 
  align-items: center;
  justify-content: center;
`;
```

### Animation Control Issues

**Issue:** Play, Restart, and other control buttons might not trigger animations, particularly when the hook's implementation has limitations.

**Solution:** Implement direct animation controls that don't depend entirely on the hook's functionality:

```jsx
const handleDirectPlay = useCallback(() => {
  if (!containerRef.current) return;
  
  // Get all animation elements
  const animElements = containerRef.current.querySelectorAll('.animation-element');
  
  // Reset to initial state first
  animElements.forEach((el, i) => {
    if (!(el instanceof HTMLElement)) return;
    
    // Apply CSS transition with no duration
    el.style.transition = 'all 0s';
    el.style.opacity = '0';
    el.style.transform = 'scale(0) translateY(20px)';
    
    // Force reflow to ensure styles are applied before animation
    void el.offsetWidth;
    
    // Apply animation with staggered delay
    setTimeout(() => {
      el.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Elastic-like easing
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    }, i * 100); // Stagger timing
  });
}, []);

// Override the hook's controls for more reliable operation
const originalPlay = sequence.play;
sequence.play = useCallback(() => {
  originalPlay();
  handleDirectPlay(); // Add direct animation as a fallback
}, [originalPlay, handleDirectPlay]);
```

### Timing and Rendering Issues

**Issue:** Animations may not work because elements haven't finished rendering before animation attempts to start.

**Solution:** Use timeouts to ensure DOM elements are fully rendered:

```jsx
useEffect(() => {
  // Use a timeout to ensure container has rendered
  const timeoutId = setTimeout(() => {
    if (containerRef.current) {
      // Create and position elements here
      // ...
      
      // Then trigger animation or make elements visible
    }
  }, 300); // Short delay to ensure DOM is ready
  
  return () => clearTimeout(timeoutId);
}, []);
```

### Infinite Update Loops

**Issue:** Using the animation hooks can sometimes cause "Maximum update depth exceeded" errors, especially when state is updated in useEffect hooks.

**Solution:** Carefully manage dependency arrays and add guards against unnecessary updates:

```jsx
// PROBLEM: This can cause infinite updates
useEffect(() => {
  setAppReducedMotionState(reducedMotionInfo);
}, [reducedMotionInfo]);

// SOLUTION: Only update state when values actually change
useEffect(() => {
  if (reducedMotionInfo.prefersReducedMotion !== appReducedMotionState.prefersReducedMotion) {
    setAppReducedMotionState(reducedMotionInfo);
  }
}, [reducedMotionInfo, appReducedMotionState.prefersReducedMotion]);
```

### Example: Reliable Animation Sequence Implementation

Here's a pattern for creating reliable animation sequences that work even when the hook has limitations:

```jsx
const AnimationSequenceExample = () => {
  const containerRef = useRef(null);
  const [elements, setElements] = useState([]);
  
  // 1. Create elements with a delay to ensure container is rendered
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (containerRef.current) {
        // Create elements with initial visibility
        const newElements = Array.from({ length: 10 }, (_, i) => ({
          id: `element-${i}`,
          x: i * 50,
          y: 100,
          visible: true // Start visible initially
        }));
        setElements(newElements);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // 2. Define animation sequence with the hook
  const sequence = useAnimationSequence({
    id: 'reliable-sequence',
    stages: [
      {
        id: 'reveal',
        type: 'stagger',
        targets: '.animation-element',
        properties: { opacity: 1, transform: 'scale(1) translateY(0)' },
        from: { opacity: 0, transform: 'scale(0) translateY(20px)' },
        duration: 600,
        staggerDelay: 100
      },
      // More stages as needed...
    ],
    autoplay: true
  });
  
  // 3. Add direct animation controls as backup
  const handleManualPlay = useCallback(() => {
    // Direct DOM animation implementation
    // (Similar to the example above)
  }, []);
  
  // 4. Override hook controls for reliability
  useEffect(() => {
    const originalPlay = sequence.play;
    sequence.play = () => {
      originalPlay();
      handleManualPlay(); // Fallback
    };
  }, [sequence, handleManualPlay]);
  
  return (
    <div>
      <div className="controls">
        <button onClick={() => sequence.play()}>Play</button>
        <button onClick={() => sequence.restart()}>Restart</button>
      </div>
      
      <div ref={containerRef} className="animation-container">
        {elements.map(el => (
          <div 
            key={el.id}
            className="animation-element"
            style={{
              position: 'absolute',
              left: `${el.x}px`,
              top: `${el.y}px`,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'blue',
              opacity: el.visible ? 1 : 0,
              transform: el.visible ? 'scale(1)' : 'scale(0)'
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### Implementing Feature Detection

If you're unsure whether certain hook functions are fully implemented, you can add feature detection:

```jsx
// Check if a method is properly implemented
const isMethodImplemented = (method) => {
  try {
    const methodStr = method.toString();
    // Check if it contains "not fully implemented" or is a stub
    return !(
      methodStr.includes('not fully implemented') ||
      methodStr.includes('not implemented') ||
      methodStr.match(/\{\s*\}/) // Empty function body
    );
  } catch (e) {
    return false;
  }
};

// Use in your component
useEffect(() => {
  if (sequence) {
    // Check which methods are fully implemented
    const implementationStatus = {
      play: isMethodImplemented(sequence.play),
      seek: isMethodImplemented(sequence.seek),
      seekProgress: isMethodImplemented(sequence.seekProgress)
    };
    
    console.log('Implementation status:', implementationStatus);
    
    // Implement fallbacks for non-implemented methods
    if (!implementationStatus.seekProgress) {
      // Add custom implementation for seekProgress
    }
  }
}, [sequence]);
```

## Recent Fixes (v1.0.23)

In version 1.0.23, we addressed several issues with the animation sequence hook:

1. Fixed the core rendering failure where elements defined in stages didn't appear
2. Improved initial styles application with better timing and error handling
3. Enhanced the hook to properly apply transforms without conflicts
4. Fixed infinite update loops with proper dependency management
5. Added more detailed logging to help debug animation issues

Despite these improvements, you may still encounter edge cases where the workarounds in this section are helpful.

---

## `useAnimationSequence` Hook (Primary Orchestration Hook)

**Note:** While `useOrchestration` exists for timing pattern calculation, **`useAnimationSequence` is the primary hook** intended for creating complex, multi-stage animations with fine-grained control over properties, timing, and targets. It is generally the recommended hook for most sequence animation tasks. Its reliability, particularly regarding initial state application (`from` properties) and `autoplay`, was improved in v1.0.22.

### Purpose

The `useAnimationSequence` hook allows you to define a sequence of animations (stages) targeting specific elements and control the overall playback.

### Signature

```typescript
import { 
  useAnimationSequence, 
  type AnimationSequenceConfig, 
  type PublicAnimationStage, // Updated to use public types
  type SequenceControls,
  type AnimationSequenceResult // Updated - now returned by the hook
} from '@veerone/galileo-glass-ui'; // Or specific path if needed

function useAnimationSequence(
  config: AnimationSequenceConfig
): AnimationSequenceResult; // Returns more than just controls
```

### Configuration (`AnimationSequenceConfig`)

- `stages` (`PublicAnimationStage[]`, **Required**): An array defining the animation stages (see below).
- `id?` (`string`, optional): Unique identifier for the sequence.
- `duration?` (`number`, optional): Override total duration.
- `autoplay?` (`boolean`, optional): Start playing immediately. Default: `false`.
- `repeatCount?` (`number`, optional): Number of repetitions. Default: `0` (no repeats).
- `yoyo?` (`boolean`, optional): Alternate direction on repeat. Default: `false`.
- `direction?` (`PlaybackDirection`, optional): Direction of playback.
- `category?` (`AnimationCategory`, optional): For accessibility.
- `playbackRate?` (`number`, optional): Speed multiplier. Default: `1`.
- Additional lifecycle callbacks: `onStart`, `onUpdate`, `onComplete`, etc.

### Stage Definition (`PublicAnimationStage`) - v1.0.19+

Starting with v1.0.19, Galileo Glass provides a simplified public API for animation stages. This is a discriminated union based on the `type` property. All stages require at minimum `id: string`, `type: string`, and `duration: number`.

**Previous Issue (SOLVED in v1.0.19):** The generated `.d.ts` files for v1.0.18 had issues correctly representing the stage types, which led to TypeScript errors. This has been fixed in v1.0.19 with the introduction of separate public and internal type structures.

**Common Stage Properties (Inherited from `PublicBaseAnimationStage`):**

*   `id: string` (**Required**)
*   `type: string` (**Required** - e.g., 'style', 'stagger', etc.)
*   `duration: number` (**Required** - milliseconds)
*   `delay?: number` (milliseconds)
*   `easing?: EasingDefinitionType` (e.g., 'easeOutQuad', custom function)
*   `easingArgs?: unknown[]` (Arguments for custom easing functions)
*   `startTime?: number` (Absolute start time, alternative to delay)
*   `direction?: PlaybackDirection`
*   `repeatCount?: number`
*   `repeatDelay?: number`
*   `yoyo?: boolean`
*   `dependsOn?: string[]` (Stage IDs that must complete first)
*   `reducedMotionAlternative?: Partial<PublicBaseAnimationStage>` (Simplified animation for reduced motion)
*   `category?: AnimationCategory` (For accessibility)
*   `onStart?: (id: string) => void` (Callback when stage starts)
*   `onUpdate?: (progress: number, id: string) => void` (Callback during stage)
*   `onComplete?: (id: string) => void` (Callback when stage completes)

**Stage Types:**

1.  **`PublicStyleAnimationStage` (`type: 'style'`)**
    *   Animates CSS properties.
    *   `targets: AnimationTarget` (**Required**): Elements to animate.
    *   `properties: Record<string, unknown>` (**Required**): Target CSS property values (e.g., `{ opacity: 1, transform: 'translateY(0)' }`).
    *   `from?: Record<string, unknown>` (Optional): Starting CSS property values.
    *   `exclude?: string[]` (Optional): Properties to exclude if using defaults.

2.  **`PublicStaggerAnimationStage` (`type: 'stagger'`)**
    *   Animates CSS properties across multiple targets with a delay between each.
    *   `targets: AnimationTarget` (**Required**)
    *   `properties: Record<string, unknown>` (**Required**)
    *   `staggerDelay: number` (**Required** - ms delay between each target animation start).
    *   `from?: Record<string, unknown>` (Optional)
    *   `staggerPattern?: StaggerPattern` (Optional: `'sequential'`, `'from-center'`, etc.)
    *   `staggerPatternFn?: (index: number, total: number, targets: unknown[]) => number` (Optional custom function)
    *   `staggerOverlap?: number` (Optional: ms)

3.  **`PublicPhysicsAnimationStage` (`type: 'physics'`)**
    *   Animates CSS properties using physics-based spring animations.
    *   `targets: AnimationTarget` (**Required**)
    *   `properties: Record<string, unknown>` (**Required** - Target CSS property values)
    *   `from?: Record<string, unknown>` (Optional - Starting CSS property values)
    *   `physics?: Partial<SpringConfig>` (Optional - Physics configuration)
        *   `mass?: number` (Default: 1)
        *   `tension?: number` (Default: 170 - Higher = more snappy)
        *   `friction?: number` (Default: 26 - Higher = less oscillation)
        *   `restDelta?: number` (Default: 0.01 - Precision for stopping animation)
        *   `restSpeed?: number` (Default: 2 - Speed threshold for stopping animation)

4.  **`PublicGroupAnimationStage` (`type: 'group'`)**
    *   Groups multiple child stages to run relative to each other.
    *   `children: PublicAnimationStage[]` (**Required**)
    *   `relationship?: TimingRelationship` (Optional: `'start-together'`, `'end-together'`, `'chain'`, etc.)
    *   `relationshipValue?: number` (Optional: Overlap/gap in ms for relationship)

5.  **`PublicCallbackAnimationStage` (`type: 'callback'`)**
    *   Calls a function repeatedly during its duration.
    *   `callback: (progress: number, id: string) => void` (**Required**)

6.  **`PublicEventAnimationStage` (`type: 'event'`)**
    *   Calls a function once at its scheduled time.
    *   `callback: (id: string) => void` (**Required**)
    *   `duration: 0` (**Required**)

### Benefits of Using Public Types (v1.0.19+)

The new public API types offer several advantages:

1. **Simplified Interface**: Only exposes properties relevant to users, removing internal implementation details
2. **Better TypeScript Support**: Eliminates previous type errors when defining animation stages
3. **Improved Documentation**: Clearer structure makes it easier to understand what's required
4. **Future-Proof**: Internal implementation can change without breaking user code

### Defining Targets (`AnimationTarget` - Fixed in v1.0.19)

The `targets` property (for `style` and `stagger` stages) accepts various formats:

*   **CSS Selector String:** e.g., `'.my-class'`, `'#my-id'`
*   **Direct Element:** `elementRef.current`
*   **NodeList:** `document.querySelectorAll('.items')`
*   **React Ref Object:** `elementRef` (where `elementRef = useRef<Element>(null)`) 
*   **Function Returning Element:** `() => document.getElementById('dynamic-id')`
*   **Array of Elements/Refs/Functions:** Mix and match the above, including `null` values in arrays, e.g., `[ref1, ref2.current, () => el, null]`

### Return Value (`AnimationSequenceResult`)

The hook returns an object with both controls and state information:

*   **State:**
    *   `progress: number`: Current playback progress (0-1)
    *   `playbackState: PlaybackState`: Current state ('idle', 'playing', 'paused', 'finished')
    *   `duration: number`: Calculated total duration
    *   `direction: PlaybackDirection`: Current playback direction
    *   `playbackRate: number`: Current playback speed
    *   `reducedMotion: boolean`: Whether reduced motion is active
    *   `stages: PublicAnimationStage[]`: The current stage configurations
    *   `id: string`: Sequence identifier

*   **Controls:**
    *   `play(): void`: Start/resume playback
    *   `pause(): void`: Pause playback
    *   `stop(): void`: Stop and reset to beginning
    *   `reverse(): void`: Toggle playback direction
    *   `restart(): void`: Stop then start from beginning
    *   `seek(time: number): void`: Jump to specific time (ms)
    *   `seekProgress(progress: number): void`: Jump to specific progress (0-1)
    *   `seekLabel(label: string): void`: Jump to labeled position
    *   `getProgress(): number`: Get current progress (0-1)
    *   `getPlaybackState(): PlaybackState`: Get current state
    *   `addStage(stage: PublicAnimationStage): void`: Add a stage dynamically
    *   `removeStage(stageId: string): void`: Remove a stage
    *   `updateStage(stageId: string, updates: Partial<PublicAnimationStage>): void`: Modify a stage
    *   `setPlaybackRate(rate: number): void`: Change playback speed
    *   `addCallback(type: keyof SequenceLifecycle, callback: Function): void`: Add a callback
    *   `removeCallback(type: keyof SequenceLifecycle, callback: Function): void`: Remove a callback

### Usage Example

```tsx
import React, { useRef } from 'react';
import { 
  useAnimationSequence, 
  PublicAnimationStage,
  StaggerPattern,
  PlaybackDirection,
  AnimationCategory
} from '@veerone/galileo-glass-ui';

const AnimationDemo = () => {
  const containerRef = useRef(null);
  
  // Define stages using PublicAnimationStage types
  const stages: PublicAnimationStage[] = [
    {
      id: 'fade-in',
      type: 'style',
      targets: '.element', // Or could use refs
      from: { opacity: 0 },
      properties: { opacity: 1 },
      duration: 500,
      easing: 'easeOutQuad'
    },
    {
      id: 'slide-in',
      type: 'stagger',
      targets: '.element',
      from: { transform: 'translateY(20px)' },
      properties: { transform: 'translateY(0)' },
      duration: 600,
      staggerDelay: 100,
      staggerPattern: StaggerPattern.FROM_CENTER,
      dependsOn: ['fade-in'] // Wait for fade-in to complete
    }
  ];
  
  // Use the hook with defined stages
  const sequence = useAnimationSequence({
    id: 'demo-sequence',
    stages,
    direction: PlaybackDirection.FORWARD,
    repeatCount: 0, // Don't repeat
    category: AnimationCategory.ENTRANCE,
    onComplete: () => console.log('Animation complete!')
  });
  
  return (
    <div>
      <div ref={containerRef} className="container">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="element">Item {i}</div>
        ))}
      </div>
      
      <div className="controls">
        <button onClick={sequence.play} disabled={sequence.playbackState === 'playing'}>
          Play
        </button>
        <button onClick={sequence.pause} disabled={sequence.playbackState !== 'playing'}>
          Pause
        </button>
        <button onClick={sequence.stop}>
          Reset
        </button>
        <button onClick={sequence.restart}>
          Restart
        </button>
        <div>Progress: {Math.round(sequence.progress * 100)}%</div>
      </div>
    </div>
  );
};

export default AnimationDemo;
```

## Recent Fixes (v1.0.22)

### Fixed: PhysicsAnimationStage Support

In version 1.0.22, we enhanced `useAnimationSequence` to properly support physics-based animation stages. The improvements include:

1. Added proper type support for `PublicPhysicsAnimationStage`
2. Implemented proper conversion between public and internal physics animation stage types
3. Added type safety for physics configuration parameters
4. Fixed issues with initial state application for physics-based transitions

```tsx
// Example of using physics animation stages
const stages = [
  {
    id: 'physics-animation',
    type: 'physics',
    targets: '.element',
    from: { 
      opacity: 0,
      scale: 0.8
    },
    properties: { 
      opacity: 1,
      scale: 1
    },
    physics: {
      mass: 1,
      tension: 170, // Higher tension = more snappy animation
      friction: 26,  // Higher friction = less wobble
      restDelta: 0.01 // Precision for stopping
    },
    duration: 800
  }
];

const sequence = useAnimationSequence({
  stages,
  autoplay: true
});
```

Physics-based animations provide a more natural feel compared to traditional easing functions, especially for interactive elements and smooth transitions. 

## Integration with Event-Based Animation System (v1.0.28+)

The animation orchestration hooks can work alongside the new event-based animation system introduced in v1.0.28:

### Using Orchestration with GameAnimationController

You can combine the `useAnimationSequence` hook with the refactored `useGameAnimation` hook for complex, coordinated animations:

```typescript
import React, { useEffect } from 'react';
import { 
  useAnimationSequence, 
  useGameAnimation, 
  GameAnimationEventType 
} from '@veerone/galileo-glass-ui';

function CoordinatedAnimationExample() {
  // Set up game animation for state management
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: [/* ... */],
    transitions: [/* ... */]
  });
  
  // Set up animation sequence for complex element animations
  const sequence = useAnimationSequence({
    id: 'menu-elements',
    stages: [/* ... */],
    autoplay: false
  });
  
  // Get the event emitter
  const emitter = gameAnimation.getEventEmitter();
  
  // Connect the systems by listening for events
  useEffect(() => {
    // Play the sequence when transitioning to a specific state
    const unsubscribe = emitter.on(GameAnimationEventType.STATE_CHANGE, (event) => {
      if (event.data.newStateId === 'game') {
        // Start a specific sequence when entering game state
        sequence.play();
      } else if (event.data.newStateId === 'menu') {
        // Reverse animation when going back to menu
        sequence.reverse();
        sequence.play();
      }
    });
    
    return unsubscribe;
  }, [emitter, sequence]);
  
  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### Coordinating Multiple Animation Systems

For advanced applications, you can create a higher-level coordination system:

```typescript
// AnimationCoordinator.js
class AnimationCoordinator {
  constructor() {
    this.gameControllers = new Map();
    this.sequences = new Map();
  }
  
  registerGameController(id, controller) {
    this.gameControllers.set(id, controller);
    // Subscribe to events from this controller
    const emitter = controller.getEventEmitter();
    emitter.on(GameAnimationEventType.STATE_CHANGE, (event) => {
      this.handleStateChange(id, event);
    });
  }
  
  registerSequence(id, sequence) {
    this.sequences.set(id, sequence);
  }
  
  handleStateChange(controllerId, event) {
    // Implement coordination logic based on state changes
    // E.g., start/stop sequences, trigger transitions in other controllers
  }
  
  // Additional coordination methods...
}

// Export a singleton instance
export const coordinator = new AnimationCoordinator();
```

In your components:

```tsx
function AnimatedComponent() {
  const gameAnimation = useGameAnimation({ /* ... */ });
  const sequence = useAnimationSequence({ /* ... */ });
  
  useEffect(() => {
    // Register with coordinator
    coordinator.registerGameController('main', gameAnimation);
    coordinator.registerSequence('elements', sequence);
    
    return () => {
      // Cleanup if needed
    };
  }, [gameAnimation, sequence]);
  
  // Rest of component
}
```

### Benefits of Combined Approach

Using both orchestration hooks and the event-based system offers several advantages:

1. **Separation of Concerns**: Use game animation for high-level state management and orchestration hooks for detailed element animations.
2. **Event-Driven Coordination**: Leverage the event system to trigger sequences at the right moment.
3. **Error Handling**: Benefit from the error recovery middleware for more robust animations.
4. **Performance Monitoring**: Use the performance middleware to identify bottlenecks in complex animations.

This approach is particularly useful for complex UIs with multi-step transitions between major application states. 