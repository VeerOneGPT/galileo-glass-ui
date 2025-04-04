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

---

## Purpose {#purpose}

The `useOrchestration` hook is designed to:

- Manage the timing and execution order of multiple independent animation triggers or stages.
- Apply predefined timing patterns (sequential, parallel, staggered, wave, etc.) to a list of animation stages.
- Optionally calculate stage timing based on Gestalt principles (proximity, similarity, continuity) using stage metadata like position or type.
- Control the playback of the entire orchestration (start, stop, pause - implied, though not explicitly returned).
- Respect user preferences for reduced motion.

**Note:** This hook primarily focuses on calculating *when* each stage should start (`delay`) based on the chosen pattern. It does not directly perform the animations themselves; it assumes other mechanisms (like CSS transitions triggered by state changes, or other animation hooks) are responsible for the actual visual changes associated with each stage.

---

## Core Concepts {#core-concepts}

#### Configuration (`OrchestrationOptions`)
The hook takes a single configuration object (`OrchestrationOptions`) that defines the stages, the desired timing pattern, and other control parameters.

#### Stages (`AnimationStage`)
The core input is the `stages` array. Each object in the array represents an `AnimationStage` to be timed by the orchestrator. Importantly, this is a generic definition; the hook uses properties like `id`, `delay`, `duration`, `dependencies`, `position`, and `elementType` from these stage objects to calculate the final timing, but it doesn't interpret other properties specific to how the animation might be implemented.

#### Patterns (`OrchestrationPattern`)
You specify how the timing between stages should be calculated using the `pattern` option (e.g., `'sequential'`, `'parallel'`, `'staggered'`, `'wave'`, `'gestalt'`). The hook calculates the final `delay` for each stage based on the chosen pattern and potentially other stage properties or options (`staggerDelay`, `gestaltOptions`).

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
  processedStages: AnimationStage[];
  isPlaying: boolean;
  progress: number;
  totalDuration: number;
  // Controls like play, pause, stop are managed internally or via active prop
  // And might not be directly exposed in the return value.
  // Refer to the hook's implementation for the exact return structure.
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

The hook returns an object containing the state of the orchestration. Key values include:

- `processedStages` (`AnimationStage[]`): The input stages array with calculated `delay` values based on the chosen pattern and options.
- `isPlaying` (`boolean`): Whether the orchestration is currently active and playing.
- `activeStages` (`string[]`): Array of IDs of stages currently considered active (started but not ended).
- `completedStages` (`string[]`): Array of IDs of stages that have completed.
- `iteration` (`number`): Current repetition count.
- `sequenceComplete` (`boolean`): True if the entire sequence (including repeats) is finished.
- `progress` (`number`): Overall progress of the current iteration (0 to 1, based on time elapsed relative to `totalDuration`).
- `totalDuration` (`number`): The calculated maximum duration of a single iteration of the sequence based on stage delays and durations.

*(Note: Direct playback controls like `play()`, `pause()`, `stop()` are not explicitly returned. Control is primarily managed via the `active` prop and the hook's internal state based on timers.)*

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