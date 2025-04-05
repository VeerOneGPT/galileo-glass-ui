import React from 'react';
import { useAnimationSequence, AnimationSequenceConfig, PublicAnimationStage, SequenceControls } from '@veerone/galileo-glass-ui';
import styled from 'styled-components';

const Box = styled.div`
  width: 50px;
  height: 50px;
  background-color: blue;
  margin: 5px;
  opacity: 0;
  transform: translateY(20px);
`;

const SequenceDemo = () => {
  // Define the animation stages using PublicAnimationStage type
  const stages: PublicAnimationStage[] = [
    {
      id: 'fade-in-box1',
      type: 'style',
      targets: '#box1', 
      duration: 500,
      properties: { opacity: 1, transform: 'translateY(0px)' },
      easing: 'easeOutQuad',
    },
    {
      id: 'fade-in-box2',
      type: 'style',
      targets: '#box2',
      duration: 500,
      delay: 200, // Start slightly after box1
      properties: { opacity: 1, transform: 'translateY(0px)' },
      easing: 'easeOutQuad',
      dependsOn: ['fade-in-box1'], // Example dependency
    },
    {
      id: 'callback-stage',
      type: 'callback',
      duration: 0, // Callbacks usually have 0 duration
      delay: 700, // After animations likely finish
      callback: (progress, stageId) => {
        console.log(`Callback stage '${stageId}' fired at progress ${progress}`);
      }
    }
  ];

  // Configure the sequence
  const config: AnimationSequenceConfig = {
    id: 'my-demo-sequence',
    stages: stages,
    autoplay: false,
    loop: true, // Set loop to true
    yoyo: true, // Alternate direction on loops
    onStart: (sequenceId) => console.log(`Sequence ${sequenceId} started.`),
    onComplete: (sequenceId) => console.log(`Sequence ${sequenceId} completed cycle.`), 
    onStageChange: (activeStageId, sequenceId) => {
      console.log(`Sequence ${sequenceId}: Active stage changed to ${activeStageId || 'none'}`);
    }
  };

  // Use the hook
  const {
    play,
    pause,
    stop,
    reset, // New reset control
    seekProgress,
    progress, // Current progress (0-1)
    playbackState, // 'idle', 'playing', 'paused', 'finished'
    currentStageId, // ID of the most recently started stage
    duration, // Calculated total duration
    // ... other controls
  }: SequenceControls & { progress: number; playbackState: string; currentStageId: string | null; duration: number } = useAnimationSequence(config);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Box id="box1" />
        <Box id="box2" />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button> { /* Use reset button */ }
        <button onClick={() => seekProgress(0.5)}>Seek 50%</button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        State: {playbackState} | Progress: {progress.toFixed(2)} | Duration: {duration}ms | Active Stage: {currentStageId || '-'}
      </div>
    </div>
  );
};

export default SequenceDemo;

---

## `useAnimationSequence` Hook

This hook provides powerful control over sequences of animations, allowing for complex choreography, dependencies, and timing.

```typescript
import { 
  useAnimationSequence, 
  AnimationSequenceConfig, 
  PublicAnimationStage, 
  SequenceControls, 
  AnimationSequenceResult 
} from '@veerone/galileo-glass-ui';

const { 
  // Controls
  play, pause, stop, reset, reverse, restart, 
  seek, seekProgress, seekLabel, getProgress,
  addStage, removeStage, updateStage, 
  setPlaybackRate, getPlaybackState,
  addCallback, removeCallback,
  // State
  progress, playbackState, currentStageId,
  duration, direction, playbackRate, 
  reducedMotion, stages, id 
} = useAnimationSequence(config);
```

### Configuration (`AnimationSequenceConfig`)

*   `id?`: `string` - Optional unique identifier for the sequence.
*   `stages`: `PublicAnimationStage[]` - An array defining the animation stages (see below).
*   `duration?`: `number` (ms) - Optional total duration. If not provided, calculated from stages.
*   `autoplay?`: `boolean` - Start playing immediately on mount. Default: `false`.
*   `loop?`: `boolean` - If true, the sequence will loop indefinitely. Overrides `repeatCount`. Default: `false`.
*   `repeatCount?`: `number` - Number of times to repeat the sequence (-1 for infinite, similar to `loop: true`). Default: `0`.
*   `yoyo?`: `boolean` - If true, alternates direction on each repetition/loop. Default: `false`.
*   `direction?`: `PlaybackDirection` (`'forward'`, `'backward'`, etc.) - Initial playback direction. Default: `'forward'`.
*   `category?`: `AnimationCategory` - For accessibility categorization.
*   `useWebAnimations?`: `boolean` - Experimental: Use Web Animations API if available.
*   `playbackRate?`: `number` - Initial playback speed (1 = normal). Default: `1`.
*   `onStart?`, `onUpdate?`, `onComplete?`, `onPause?`, `onResume?`, `onCancel?`, `onAnimationStart?`, `onAnimationComplete?`: Lifecycle callbacks (see `SequenceLifecycle` type).
*   `onStageChange?`: `(activeStageId: string | null, sequenceId: string) => void` - **New:** Callback fired when the currently active stage changes (based on the stage that started most recently). `activeStageId` is `null` if no stage is currently running.

### Animation Stages (`PublicAnimationStage`)

Each stage in the `stages` array is an object defining a part of the animation. Key properties include:

*   `id`: `string` (required) - Unique ID for the stage.
*   `type`: `'style' | 'callback' | 'event' | 'group' | 'stagger'` (required) - Type of stage.
*   `duration`: `number` (ms, required for most types) - How long the stage lasts.
*   `delay?`: `number` (ms) - Delay before the stage starts.
*   `targets?`: `AnimationTarget` (string selector, Element, Ref, etc.) - Element(s) to animate (for `style`, `stagger`).
*   `properties?`: `Record<string, unknown>` - CSS properties to animate to (for `style`, `stagger`).
*   `callback?`: Function - Callback function for `callback` or `event` stages.
*   `children?`: `PublicAnimationStage[]` - Nested stages for `group` type.
*   `easing?`, `repeatCount?`, `yoyo?`, `dependsOn?`, etc. - See `PublicBaseAnimationStage` and specific stage types for all options.

### Return Value (`AnimationSequenceResult`)

The hook returns an object containing state and controls:

*   **State Properties:**
    *   `progress`: `number` - Current progress of the entire sequence (0 to 1).
    *   `playbackState`: `PlaybackState` - Current state (`'idle'`, `'playing'`, `'paused'`, `'finished'`).
    *   `currentStageId`: `string | null` - **New:** The ID of the stage that most recently started playing. `null` if idle or finished.
    *   `duration`: `number` - Total calculated duration of the sequence in milliseconds.
    *   `direction`: `PlaybackDirection` - Current playback direction.
    *   `playbackRate`: `number` - Current playback speed.
    *   `reducedMotion`: `boolean` - Whether reduced motion mode is effectively active.
    *   `stages`: `PublicAnimationStage[]` - The array of stage configurations currently managed by the sequence.
    *   `id`: `string` - The unique ID of the sequence instance.
*   **Control Functions (`SequenceControls`):**
    *   `play()`: Start or resume playback.
    *   `pause()`: Pause playback.
    *   `stop()`: Stop playback and reset progress to 0.
    *   `reset()`: **New:** Stops playback, resets progress to 0, and clears internal stage states (useful for ensuring a clean restart, especially after complex interactions).
    *   `reverse()`: Reverse playback direction (implementation may be limited).
    *   `restart()`: Stop and immediately play from the beginning.
    *   `seek(time: number)`: Jump to a specific time (ms) (implementation may be limited).
    *   `seekProgress(progress: number)`: Jump to a specific progress (0 to 1).
    *   `seekLabel(label: string)`: Jump to a named label/stage (implementation may be limited).
    *   `getProgress()`: Get the current progress value.
    *   `addStage()`, `removeStage()`, `updateStage()`: Dynamically modify stages (implementation may be limited).
    *   `setPlaybackRate(rate: number)`: Change playback speed.
    *   `getPlaybackState()`: Get the current playback state.
    *   `addCallback()`, `removeCallback()`: Dynamically add/remove lifecycle callbacks.
</rewritten_file> 