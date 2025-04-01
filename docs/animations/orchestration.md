# Animation Orchestration: `useSequence`

This document details the `useSequence` hook, a powerful tool within the Galileo Glass UI library for creating and managing coordinated sequences of animations. It allows for precise control over timing, dependencies, and staggering, enabling complex and expressive animation choreography.

## Table of Contents

- [Purpose](#purpose)
- [Core Concepts](#core-concepts)
  - [Stages](#stages)
  - [Dependencies & Timing](#dependencies--timing)
  - [Targets](#targets)
  - [Controls](#controls)
  - [Reduced Motion](#reduced-motion)
- [Signature](#signature)
- [Parameters (`UseSequenceParams`)](#parameters-usesequenceparams)
- [Return Value (`UseSequenceResult`)](#return-value-usesequenceresult)
- [Key Types & Enums](#key-types--enums)
  - [`AnimationStep`](#animationstep)
  - [`PlaybackDirection`](#playbackdirection)
  - [`StaggerPattern`](#staggerpattern)
  - [`PlaybackState`](#playbackstate)
- [Example Usage](#example-usage)
  - [Basic Style Sequence](#basic-style-sequence)
  - [Sequence with Dependencies](#sequence-with-dependencies)
  - [Staggered Animation](#staggered-animation)
- [Best Practices](#best-practices)

---

## Purpose

The `useSequence` hook is designed to:

- Define multi-step animations involving multiple properties or elements.
- Coordinate animations with precise timing relationships (e.g., one after another, overlapping).
- Create entrance/exit animations for lists or groups of elements with controlled staggering.
- Build complex UI transitions involving several distinct animation phases.
- Provide fine-grained playback control (play, pause, seek, reverse) over complex animations.

---

## Core Concepts

### Stages

A sequence is composed of one or more `AnimationStep` objects. Each step represents a distinct part of the animation. Key types include:

- **`StyleAnimationStep`:** Animates CSS properties of target elements from a `from` state to a `to` state over a `duration`.
- **`StaggerAnimationStep`:** Applies a style animation sequentially across multiple `targets` with a defined `staggerDelay` and `staggerPattern`.
- **`CallbackAnimationStep`:** Executes a provided JavaScript function on each frame of its duration, passing the current progress.
- **`EventAnimationStep`:** Executes a callback function once at its designated start time (duration is 0).
- **`GroupAnimationStep`:** Groups multiple child steps, allowing them to be treated as a unit with specific timing relationships (`CHAIN`, `START_TOGETHER`, etc.).

### Dependencies & Timing

- **Dependencies:** Steps can specify `dependsOn` (an array of step IDs) that must complete before they begin.
- **Start Time:** Steps can have an explicit `startTime` (in ms from sequence start) or have their start time calculated based on dependencies and the flow of the sequence.
- **Duration:** Each step has a `duration`.
- **Easing:** Each step can have its own `easing` function.
- **Repetition:** Sequences and steps can `repeatCount` with optional `yoyo` (reverse direction on repeat) and `repeatDelay`.
- **Timeline Calculation:** The hook automatically calculates the start and end times for each step based on durations, dependencies, and group relationships, determining the total sequence duration.

### Targets

`StyleAnimationStep` and `StaggerAnimationStep` require `targets`. These can be:
- A CSS selector string (e.g., `'.my-class'`).
- A direct reference to an HTMLElement.
- An array of selectors or HTMLElements.
- A NodeList.

### Controls

The hook returns a `SequenceControls` object, providing imperative methods to manage playback:

- `play()`, `pause()`, `stop()` (resets to start)
- `reverse()`
- `restart()`
- `seek(timeMs)`, `seekProgress(progressPercent)`, `seekLabel(labelName)`
- `setPlaybackRate(rate)`
- Dynamic step management: `addStep()`, `removeStep()`, `updateStep()`

### Reduced Motion

- The hook respects the user's preference detected via `useReducedMotion`.
- Individual steps can define a `reducedMotionAlternative` step to run instead.
- If reduced motion is active, animations typically complete instantly unless an alternative is defined.

---

## Signature

```typescript
import { useSequence, type UseSequenceParams, type UseSequenceResult } from '@veerone/galileo-glass-ui/hooks';

function useSequence(
  config?: UseSequenceParams
): UseSequenceResult;
```

---

## Parameters (`UseSequenceParams`)

An object containing the sequence definition:

- **`steps`** (`AnimationStep[]`, **Required**): An array defining the animation steps/stages.
- `id` (`string`, optional): A unique identifier for the sequence.
- `autoplay` (`boolean`, optional): If `true`, the sequence plays automatically on mount/config update. Default: `false`.
- `duration` (`number`, optional): Total duration in ms. If omitted, it's calculated based on stages and dependencies.
- `repeatCount` (`number`, optional): Number of times to repeat the entire sequence (0 = no repeat, -1 = infinite).
- `yoyo` (`boolean`, optional): If `true`, reverses direction on each sequence repeat. Default: `false`.
- `direction` (`PlaybackDirection`, optional): Initial playback direction. Default: `FORWARD`.
- `category` (`AnimationCategory`, optional): Accessibility category.
- `useWebAnimations` (`boolean`, optional): Hint to use the Web Animations API (WAAPI) if available (may offer performance benefits but has limitations). Default often depends on internal implementation (likely RAF-based).
- **Lifecycle Callbacks** (optional): `onStart`, `onUpdate`, `onComplete`, `onPause`, `onResume`, `onCancel`, `onAnimationStart`, `onAnimationComplete`.

---

## Return Value (`UseSequenceResult`)

An object containing the sequence state and controls:

- **`progress`** (`number`): Current overall progress of the sequence (0 to 1).
- **`playbackState`** (`PlaybackState`): Current state (e.g., `IDLE`, `PLAYING`, `PAUSED`, `FINISHED`).
- **`duration`** (`number`): Calculated total duration of the sequence in ms.
- **`direction`** (`PlaybackDirection`): Current playback direction.
- **`playbackRate`** (`number`): Current playback speed multiplier (1 is normal).
- **`reducedMotion`** (`boolean`): Indicates if reduced motion mode is active for this sequence.
- **`steps`** (`AnimationStep[]`): The array of step configurations.
- **`id`** (`string`): The sequence ID.
- **`SequenceControls`**: All the control methods (`play`, `pause`, `seek`, etc. - see [Controls](#controls)).

---

## Key Types & Enums

### `AnimationStep`

Union type for different step kinds. Common properties include:
- `id` (string, Required)
- `duration` (number, ms, Required, except for `event` type)
- `type` (string, e.g., 'style', 'stagger', 'group', 'callback', 'event', Required)
- `startTime` (number, ms, optional)
- `dependsOn` (string[], optional)
- `easing` (string | function, optional)
- `repeatCount`, `repeatDelay`, `yoyo` (optional)
- Specific properties based on `type` (e.g., `targets`, `from`, `to` for `style`).

### `PlaybackDirection`

Enum: `FORWARD`, `BACKWARD`, `ALTERNATE`, `ALTERNATE_REVERSE`.

### `StaggerPattern`

Enum: `SEQUENTIAL`, `FROM_CENTER`, `FROM_EDGES`, `RANDOM`, `WAVE`, `CASCADE`, `RIPPLE`, `CUSTOM`.

### `PlaybackState`

Enum: `IDLE`, `PLAYING`, `PAUSED`, `FINISHED`, `CANCELLING`.

*(Refer to the source code or type definitions for exhaustive details on all interfaces and options.)*

---

## Example Usage

### Basic Style Sequence

```tsx
import React from 'react';
import { useSequence, type UseSequenceParams } from '@veerone/galileo-glass-ui/hooks';
import { Box } from '@mui/material';

const SimpleSequence = () => {
  const { play } = useSequence();

  const runSequence = () => {
    const sequenceConfig: UseSequenceParams = {
      id: 'fade-and-move',
      steps: [
        {
          id: 'fade-in',
          type: 'style',
          targets: '#my-box',
          duration: 500,
          from: { opacity: 0 },
          to: { opacity: 1 },
          easing: 'easeOutQuad',
        },
        {
          id: 'move-right',
          type: 'style',
          targets: '#my-box',
          dependsOn: ['fade-in'],
          duration: 800,
          from: { transform: 'translateX(0px)' },
          to: { transform: 'translateX(200px)' },
          easing: 'easeInOutCubic',
        },
      ],
    };
    play(sequenceConfig);
  };

  return (
    <Box 
      id="my-box"
      sx={{ 
        width: 50, 
        height: 50, 
        backgroundColor: 'primary.main', 
        opacity: 0,
        willChange: 'opacity, transform'
      }}
    />
  );
};
```

### Sequence with Dependencies

(See example above - `move-right` uses `dependsOn: ['fade-in']`)

### Staggered Animation

```tsx
import React, { useEffect } from 'react';
import { useSequence, type UseSequenceParams } from '@veerone/galileo-glass-ui/hooks';
import { Box } from '@mui/material';

const StaggeredList = () => {
  const { play } = useSequence();

  useEffect(() => {
    const sequenceConfig: UseSequenceParams = {
      id: 'list-entrance',
      steps: [
        {
          id: 'stagger-fade-in',
          type: 'stagger',
          targets: '.list-item',
          duration: 400,
          staggerDelay: 100,
          staggerPattern: 'SEQUENTIAL',
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0px)' },
          easing: 'easeOutCubic',
        },
      ],
    };
    play(sequenceConfig);
  }, [play]);

  return (
    <Box>
      {[1, 2, 3, 4, 5].map(i => (
        <Box
          key={i}
          className="list-item"
          sx={{ 
            padding: 1, 
            margin: 0.5, 
            backgroundColor: 'grey.200', 
            opacity: 0,
            willChange: 'opacity, transform'
          }}
        >
          Item {i}
        </Box>
      ))}
    </Box>
  );
};
```

---

## Best Practices

- **Start Simple:** Begin with basic sequences and gradually add complexity.
- **Unique IDs:** Ensure all step IDs within a sequence are unique.
- **Initial State:** Set the initial CSS styles of your elements to match the `from` state of the first relevant animation step to avoid jumps.
- **Performance:**
    - Use `will-change` CSS property on elements being animated, especially for `transform` and `opacity`.
    - Consider the `useWebAnimations` flag for potentially smoother animations on supported browsers, but test thoroughly.
    - Be mindful of the number of elements targeted, especially in complex stagger animations.
- **Dependencies:** Clearly define dependencies to control the flow. Avoid circular dependencies.
- **Accessibility:** Use `reducedMotionAlternative` where appropriate and consider the `category` property.
- **Readability:** Break down very complex animations into logical groups using `GroupAnimationStep`.
- **Controls:** Provide user interface elements (buttons, etc.) to interact with the sequence controls (`play`, `pause`, `seek`) if manual control is desired.
- **Check `useSequence` API:** Always refer to the specific documentation or type definitions for `useSequence` as parameter names, config structure, and control methods might differ slightly from the older internal hook. 