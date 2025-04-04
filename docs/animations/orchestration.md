# Animation Orchestration: `useAnimationSequence` & `useSequence`

This document details the hooks provided by Galileo Glass UI for creating and managing coordinated sequences of animations: `useAnimationSequence` (using a declarative configuration object) and `useSequence` (using a builder pattern). These allow for precise control over timing, dependencies, and staggering, enabling complex animation choreography.

## Table of Contents

- [Choosing Between Hooks](#choosing-between-hooks)
- [`useAnimationSequence` (Declarative Config)](#useanimationsequence-declarative-config)
  - [Purpose](#purpose-useanimationsequence)
  - [Core Concepts](#core-concepts-useanimationsequence)
    - [Configuration (`AnimationSequenceConfig`)](#configuration-animationsequenceconfig)
    - [Stages (`AnimationStage`)](#stages-animationstage)
    - [Targets](#targets-useanimationsequence)
    - [Timing & Dependencies](#timing--dependencies-useanimationsequence)
    - [Controls (`SequenceControls`)](#controls-sequencecontrols-useanimationsequence)
    - [Reduced Motion](#reduced-motion-useanimationsequence)
  - [Signature](#signature-useanimationsequence)
  - [Parameters (`AnimationSequenceConfig`)](#parameters-animationsequenceconfig)
  - [Key Stage Types (`AnimationStage`)](#key-stage-types-animationstage)
    - [`StyleAnimationStage`](#styleanimationstage)
    - [`GroupAnimationStage`](#groupanimationstage)
    - [`StaggerAnimationStage`](#staggeranimationstage)
    - [`CallbackAnimationStage`](#callbackanimationstage)
    - [`EventAnimationStage`](#eventanimationstage)
  - [Return Value (`AnimationSequenceResult`)](#return-value-animationsequenceresult)
  - [Example Usage](#example-usage-useanimationsequence)
  - [Best Practices](#best-practices-useanimationsequence)
- [`useSequence` (Builder Pattern)](#usesequence-builder-pattern)
  - [Purpose](#purpose-usesequence)
  - [Core Concepts](#core-concepts-usesequence)
    - [Builder Function (`builderFn`)](#builder-function-builderfn)
    - [Sequence Builder (`SequenceBuilder`)](#sequence-builder-sequencebuilder)
    - [Animation Definitions](#animation-definitions-usesequence)
    - [Controls](#controls-usesequence)
  - [Signature](#signature-usesequence)
  - [Parameters (`UseSequenceParams`)](#parameters-usesequenceparams)
  - [Return Value (`UseSequenceResult`)](#return-value-usesequenceresult)
  - [Example Usage](#example-usage-usesequence)
  - [Best Practices](#best-practices-usesequence)
- [Key Types & Enums (Common)](#key-types--enums-common)
  - [`PlaybackDirection`](#playbackdirection)
  - [`PlaybackState`](#playbackstate)
  - [`AnimationCategory`](#animationcategory)
- [`useAnimationStateMachine` (Finite State Machine)](#useanimationstatemachine-finite-state-machine)
  - [Purpose](#purpose-useanimationstatemachine)
  - [Core Concepts](#core-concepts-useanimationstatemachine)
    - [States (`AnimationState[]`)](#states-animationstate)
    - [Transitions (`StateTransition[]`)](#transitions-statetransition)
    - [Events](#events-useanimationstatemachine)
    - [Context](#context-useanimationstatemachine)
  - [Signature](#signature-useanimationstatemachine)
  - [Parameters (`UseAnimationStateMachineParams`)](#parameters-useanimationstatemachineparams)
  - [Return Value (`UseAnimationStateMachineResult`)](#return-value-useanimationstatemachineresult)
  - [Example Usage](#example-usage-useanimationstatemachine)
  - [Best Practices](#best-practices-useanimationstatemachine)

---

## Choosing Between Hooks

- **`useAnimationSequence`:** Choose this hook if you prefer defining your entire animation sequence upfront using a declarative JavaScript configuration object. This can be easier for complex sequences defined dynamically or loaded from external sources.
- **`useSequence`:** Choose this hook if you prefer a fluent, builder-style API to define your sequence steps programmatically within a function. This can feel more imperative and might be preferable for sequences built up conditionally.

Both hooks provide similar underlying capabilities and controls.

---

## `useAnimationSequence` (Declarative Config)

### Purpose {#purpose-useanimationsequence}

The `useAnimationSequence` hook is designed to:

- Define multi-step animations involving multiple properties or elements using a single configuration object.
- Coordinate animations with precise timing relationships (e.g., one after another, overlapping, dependencies).
- Create entrance/exit animations for lists or groups of elements with controlled staggering.
- Build complex UI transitions involving several distinct animation phases.
- Provide fine-grained playback control (play, pause, stop, seek) over complex animations defined declaratively.

### Core Concepts {#core-concepts-useanimationsequence}

#### Configuration (`AnimationSequenceConfig`)

The primary input is a single configuration object (`AnimationSequenceConfig`) defining the entire sequence, including stages, timing, looping, and callbacks.

#### Stages (`AnimationStage`)

The core is the `stages` array. Each object in the array represents a step (an `AnimationStage`) with a specific `type` (e.g., `'style'`, `'stagger'`, `'callback'`).

#### Targets {#targets-useanimationsequence}

Stages like `StyleAnimationStage` require a `targets` property:
- React ref(s) (`React.RefObject<HTMLElement>` or array).
- CSS selector string(s).
- Direct HTMLElement/NodeList (less common).

#### Timing & Dependencies {#timing--dependencies-useanimationsequence}

Control timing using `duration`, `delay`, explicit `startTime`, or `dependsOn` (an array of stage IDs that must complete first). Easing is specified per stage.

#### Controls (`SequenceControls`) {#controls-sequencecontrols-useanimationsequence}

Returns an object with methods like `play()`, `pause()`, `stop()`, `seek()`, etc., to manage playback.

#### Reduced Motion {#reduced-motion-useanimationsequence}

Respects `useReducedMotion`. Animations may be skipped or run instantly based on category and user preferences.

### Signature {#signature-useanimationsequence}

```typescript
import {
  useAnimationSequence,
  type AnimationSequenceConfig,
  type AnimationSequenceResult
} from '@veerone/galileo-glass-ui/animations'; // Correct path
// or from '@veerone/galileo-glass-ui/hooks';

function useAnimationSequence(
  config: AnimationSequenceConfig
): AnimationSequenceResult;
```

### Parameters (`AnimationSequenceConfig`)

A single object with properties like:

- **`stages`** (`AnimationStage[]`, **Required**): Array defining the animation steps.
- `id` (`string`, optional): Unique sequence identifier.
- `autoplay` (`boolean`, optional): Play on mount. Default: `false`.
- `duration` (`number`, optional): Explicit total duration (ms). Calculated if omitted.
- `repeatCount` (`number`, optional): Repeats (0=none, -1=infinite). Default: 0.
- `yoyo` (`boolean`, optional): Reverse direction on repeat. Default: `false`.
- `direction` (`PlaybackDirection`, optional): Initial direction. Default: `FORWARD`.
- `category` (`AnimationCategory`, optional): Accessibility category.
- `playbackRate` (`number`, optional): Speed multiplier. Default: 1.
- **Lifecycle Callbacks** (optional): `onStart`, `onUpdate`, `onComplete`, etc.

### Key Stage Types (`AnimationStage`) {#key-stage-types-animationstage}

Common types for the `stages` array:

#### `StyleAnimationStage`

Animates CSS properties. **Use the `properties` key for target values, and optionally `from` for starting values.**

```typescript
interface StyleAnimationStage extends BaseAnimationStage { // Base contains id, duration, delay, easing, dependsOn etc.
  type: 'style';
  targets: AnimationTarget | AnimationTarget[];
  // Use 'properties' for target values, 'from' (optional) for start values
  properties: Record<string, unknown | number | string>; // Target CSS properties (camelCase)
  from?: Record<string, unknown | number | string>; // Optional starting CSS properties
  exclude?: string[]; // Properties to exclude from animation
}
```

#### `GroupAnimationStage`

Groups child stages (`children: AnimationStage[]`) with timing relationships (`relationship?: TimingRelationship`).

#### `StaggerAnimationStage`

Applies an animation sequentially across multiple `targets`.

```typescript
interface StaggerAnimationStage extends BaseAnimationStage {
  type: 'stagger';
  targets: AnimationTarget | AnimationTarget[];
  // Use 'properties' for target values, 'from' for start values
  properties: { /* Target CSS properties like in StyleAnimationStage */ };
  from: { /* Starting CSS properties */ };
  duration: number; // Duration for each element
  staggerDelay: number; // Delay (ms) between targets
  staggerPattern?: StaggerPattern;
  // ... other options
}
```
*(Note: The exact structure for `to`/`from` within `StaggerAnimationStage` should be confirmed from implementation if needed.)*

#### `CallbackAnimationStage`

Executes `callback: (progress: number, stageId: string) => void` on each frame.

#### `EventAnimationStage`

Executes `callback: (stageId: string) => void` once. `duration` is 0.

*(Refer to source types `AnimationStage` union in `useAnimationSequence.ts` for full details)*

### Return Value (`AnimationSequenceResult`)

Object containing state and `SequenceControls`:
- `play`, `pause`, `stop`, `seek`, etc.
- `progress` (0 to 1)
- `playbackState` (`PlaybackState` enum)
- `duration` (ms)
- ... and other state values.

### Example Usage {#example-usage-useanimationsequence}

```tsx
import React, { useRef } from 'react';
import {
  useAnimationSequence,
  type AnimationSequenceConfig
} from '@veerone/galileo-glass-ui/animations';
import { GlassBox, GlassButton } from '@veerone/galileo-glass-ui/components';

const SequenceDemo = () => {
  const element1Ref = useRef<HTMLDivElement>(null);
  const element2Ref = useRef<HTMLDivElement>(null);

  const sequenceConfig: AnimationSequenceConfig = {
    id: 'declarative-sequence',
    autoplay: false,
    stages: [
      {
        id: 'el1-fade-move',
        type: 'style',
        targets: element1Ref,
        // Use 'from' and 'properties' keys here
        from: { opacity: 0, transform: 'translateY(20px)' },
        properties: { opacity: 1, transform: 'translateY(0px)' },
        duration: 500,
        easing: 'easeOutCubic'
      },
      {
        id: 'el2-fade-in',
        type: 'style',
        targets: element2Ref,
        from: { opacity: 0 },
        properties: { opacity: 1 },
        duration: 400,
        dependsOn: ['el1-fade-move'],
        delay: 100
      }
    ]
  };

  const { play, stop, playbackState } = useAnimationSequence(sequenceConfig);

  return (
    <GlassBox style={{ padding: '16px' }}>
      {/* ... elements with refs ... */}
      <GlassButton onClick={play} disabled={playbackState === 'playing'}>Play</GlassButton>
      <GlassButton onClick={stop} disabled={playbackState === 'idle'}>Stop</GlassButton>
      {/* ... Element 1 and Element 2 definitions ... */}
    </GlassBox>
  );
};
```

### Best Practices {#best-practices-useanimationsequence}

- Use unique stage IDs.
- Set initial element styles to match the `from` state if provided.
- Use `will-change` CSS property.
- Use `dependsOn` and `delay` for timing control.
- Ensure `properties` (and optionally `from`) keys are used for `StyleAnimationStage`.

---

## `useSequence` (Builder Pattern)

### Purpose {#purpose-usesequence}

The `useSequence` hook allows you to:

- Define animation sequences programmatically using a fluent builder API.
- Build sequences step-by-step within a function.
- Primarily works with predefined animation presets or potentially keyframes objects.

### Core Concepts {#core-concepts-usesequence}

#### Builder Function (`builderFn`)
The hook takes a function (`builderFn`) as its second argument. This function receives a `SequenceBuilder` instance which you use to define the animation steps.

#### Sequence Builder (`SequenceBuilder`)
The `builder` object provides methods like:
- `builder.animate(target, animation, options)`: Animate a target using a preset or keyframes.
- `builder.stagger(target, animation, options)`: Apply staggered animation.
- `builder.wait(duration)`: Add a delay.
- `builder.add(declaration)`: Add a raw animation declaration (structure may vary).

#### Animation Definitions {#animation-definitions-usesequence}
Instead of inline `properties`, `builder.animate` typically takes:
- `target`: CSS selector or ref.
- `animation`: The **name** of an animation preset (string, e.g., `'fadeIn'`) or a `keyframes` object.
- `options`: Optional configuration like `duration`, `delay`, `easing`.

#### Controls {#controls-usesequence}
Returns an object (`UseSequenceResult`) with methods like `start()`, `pause()`, `resume()`, `stop()`, `reset()`.

### Signature {#signature-usesequence}

```typescript
import {
  useSequence,
  type UseSequenceParams,
  type UseSequenceResult,
  type SequenceBuilder // May need to import builder type if used outside
} from '@veerone/galileo-glass-ui/animations'; // Correct path
// Or from '@veerone/galileo-glass-ui/hooks'; // If re-exported

function useSequence(
  params: UseSequenceParams, // Basic config like name, loop, etc.
  builderFn: (builder: SequenceBuilder) => void // Function to build the sequence
): UseSequenceResult;
```

### Parameters (`UseSequenceParams`)

Object with basic sequence configuration:
- `name` (string, Required): Unique sequence name.
- `autoPlay` (boolean, optional): Default: `false`.
- `startDelay` (number, optional): Delay before starting (ms).
- `loop`, `iterations`, `alternate` (optional): Looping behavior.
- `sensitivity`, `relative`, `defaultEase` (optional): Other sequence defaults.
- `deps` (any[], optional): Dependencies to recreate the sequence.

### Return Value (`UseSequenceResult`)

Object containing controls and state:
- `builder`: The builder function passed in.
- `start`, `pause`, `resume`, `stop`, `reset`: Control methods.
- `isPlaying`, `isPaused`, `isComplete`: State booleans.
- `animationTarget`, `staggerTarget`: Utility functions (might be related to builder).

### Example Usage {#example-usage-usesequence}

```tsx
import React, { useRef } from 'react';
import { useSequence, type UseSequenceParams } from '@veerone/galileo-glass-ui/animations';
import { keyframes } from 'styled-components';
import { GlassBox, GlassButton } from '@veerone/galileo-glass-ui/components';

// Define keyframes if not using presets
const fadeAndMoveKf = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0px); }
`;

const BuilderSequenceDemo = () => {
  const element1Ref = useRef<HTMLDivElement>(null);
  const element2Ref = useRef<HTMLDivElement>(null);

  const sequenceParams: UseSequenceParams = {
    name: 'builder-sequence',
    autoPlay: false
  };

  // Use the hook with the builder function
  const { start, stop, isPlaying } = useSequence(sequenceParams, (builder) => {
    // Use builder methods to define steps
    builder.animate(element1Ref, 'fadeIn', { duration: 500 }); // Preset
    builder.animate(element1Ref, 'slideUp', { duration: 300, delay: 500 }); // Preset

    // Use keyframes for the second element, wait until first is done
    builder.animate(element2Ref, fadeAndMoveKf, { duration: 800, delay: 800 });
  });

  return (
    <GlassBox style={{ padding: '16px' }}>
      {/* ... elements with refs ... */}
      <GlassButton onClick={start} disabled={isPlaying}>Play Builder Sequence</GlassButton>
      {/* ... Element 1 and Element 2 definitions ... */}
    </GlassBox>
  );
};
```

### Best Practices {#best-practices-usesequence}

- Define reusable animation presets in your theme/provider.
- Use the builder methods (`animate`, `stagger`, `wait`) as intended.
- Keep the builder function focused on defining the sequence flow.
- Refer to the `AnimationDeclaration` and `StaggerOptions` type definitions (exported from `@veerone/galileo-glass-ui/animations`) for detailed configuration options available within the builder methods.

---

## `useAnimationStateMachine` (Finite State Machine)

### Purpose

The `useAnimationStateMachine` hook allows you to manage complex UI states and orchestrate animations *between* those states using a finite state machine (FSM) model.

- Define distinct UI states (e.g., 'idle', 'loading', 'success', 'error').
- Specify transitions between states triggered by events (e.g., button click, data fetch complete).
- Automatically apply animations (enter/exit/transition) when moving between states.
- Manage complex conditional logic for state changes and associated animations.

### Core Concepts

- **States (`AnimationState[]`):** Define each possible state with an `id`, optional `enterAnimation`/`exitAnimation` presets, and potentially initial `properties` or `styles` for elements in that state.
- **Transitions (`StateTransition[]`):** Define the rules for moving between states. Each transition specifies the `from` state, the `to` state, and the `on` event that triggers it. Transitions can have `conditions`, `actions` (callbacks), and specific `transitionAnimation` presets.
- **Events:** You trigger state changes by `send`ing events (strings) to the machine.
- **Context:** The machine maintains internal context (data) that can be used in conditions or actions.

### Signature

```typescript
import {
  useAnimationStateMachine,
  type UseAnimationStateMachineParams,
  type UseAnimationStateMachineResult,
  type AnimationState, // Import supporting types as needed
  type StateTransition
} from '@veerone/galileo-glass-ui/animations'; // Correct path
// Or from '@veerone/galileo-glass-ui/hooks'; // If re-exported

function useAnimationStateMachine(
  params: UseAnimationStateMachineParams
): UseAnimationStateMachineResult;
```

### Parameters (`UseAnimationStateMachineParams`)

Object containing the machine definition:
- **`states`** (`AnimationState[]`, **Required**): Array of state definitions.
- **`transitions`** (`StateTransition[]`, **Required**): Array of transition definitions.
- `targets` (optional): DOM element(s) to potentially manage/animate.
- `sensitivity`, `debug`, `persist`, `storageKey`, `deps`, `onStateChange` (optional).

### Return Value (`UseAnimationStateMachineResult`)

Object containing state and controls:
- `currentState` (string): The ID of the current state.
- `previousState` (string): The ID of the previous state.
- `send(event, params?)`: Function to trigger a transition event.
- `is(stateId)`: Check if currently in a specific state.
- `can(event)`: Check if an event can be handled.
- `reset()`: Reset to initial state.
- `transitioning` (boolean): Is a transition currently in progress?
- `setData`, `getData`, `getHistory`, `clearHistory`, `on`, `off`, `machine` (raw instance).

### Example Usage

```tsx
import React, { useState } from 'react';
import {
  useAnimationStateMachine,
  type AnimationState,
  type StateTransition
} from '@veerone/galileo-glass-ui/animations';
import { GlassBox, GlassButton, GlassLoader, GlassTypography } from '@veerone/galileo-glass-ui/components';

// Define States
const states: AnimationState[] = [
  { id: 'idle', name: 'Idle' },
  { 
    id: 'loading', 
    name: 'Loading', 
    enterAnimation: 'fadeIn' // Use animation presets
  },
  { 
    id: 'success', 
    name: 'Success', 
    enterAnimation: 'pulse',
    properties: { /* styles for success state */ }
  },
  { id: 'error', name: 'Error', enterAnimation: 'shake' }
];

// Define Transitions
const transitions: StateTransition[] = [
  { from: 'idle', on: 'FETCH', to: 'loading' },
  { from: 'loading', on: 'RESOLVE', to: 'success' },
  { from: 'loading', on: 'REJECT', to: 'error' },
  { from: 'success', on: 'RESET', to: 'idle' },
  { from: 'error', on: 'RESET', to: 'idle' },
];

const StateMachineDemo = () => {
  const machine = useAnimationStateMachine({
    states,
    transitions,
    initialState: 'idle',
    onStateChange: (from, to) => console.log(`Moved from ${from} to ${to}`)
  });

  const handleFetch = () => {
    machine.send('FETCH').then(() => {
      // Simulate API call
      setTimeout(() => {
        const success = Math.random() > 0.3;
        machine.send(success ? 'RESOLVE' : 'REJECT');
      }, 1500);
    });
  };

  const handleReset = () => {
    machine.send('RESET');
  };

  return (
    <GlassBox style={{ padding: '16px', textAlign: 'center' }}>
      <GlassTypography variant="h3">Current State: {machine.currentState}</GlassTypography>
      {machine.is('idle') && (
        <GlassButton variant="contained" onClick={handleFetch}>Fetch Data</GlassButton>
      )}
      {machine.is('loading') && <GlassLoader />}
      {machine.is('success') && (
        <GlassTypography color="success"> 
           Success! <GlassButton onClick={handleReset}>Reset</GlassButton>
        </GlassTypography>
      )}
      {machine.is('error') && (
        <GlassTypography color="error">
          Error! <GlassButton onClick={handleReset}>Reset</GlassButton>
        </GlassTypography>
      )}
    </GlassBox>
  );
};
```

### Best Practices

- Clearly define all possible states and the events that trigger transitions.
- Use animation presets (`enterAnimation`, `exitAnimation`, `transitionAnimation`) for common effects.
- Leverage `conditions` and `