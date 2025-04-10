# Animation Sequence Demo

## React Example

```jsx
import React from 'react';
import { useAnimationSequence, AnimationSequenceConfig, PublicAnimationStage, SequenceControls } from '@veerone/galileo-glass-ui/hooks';
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
      delay: 200,
      properties: { opacity: 1, transform: 'translateY(0px)' },
      easing: 'easeOutQuad',
      dependsOn: ['fade-in-box1'],
    },
    {
      id: 'callback-stage',
      type: 'callback',
      duration: 0,
      delay: 700,
      callback: (progress, stageId) => {
        console.log(`Callback stage '${stageId}' fired at progress ${progress}`);
      }
    }
  ];

  const config: AnimationSequenceConfig = {
    id: 'my-demo-sequence',
    stages,
    autoplay: false,
    loop: true,
    yoyo: true,
    onStart: sequenceId => console.log(`Sequence ${sequenceId} started.`),
    onComplete: sequenceId => console.log(`Sequence ${sequenceId} completed cycle.`),
    onStageChange: (activeStageId, sequenceId) => {
      console.log(`Sequence ${sequenceId}: Active stage changed to ${activeStageId || 'none'}`);
    }
  };

  const {
    play, pause, stop, reset, seekProgress,
    progress, playbackState, currentStageId, duration
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
        <button onClick={reset}>Reset</button>
        <button onClick={() => seekProgress(0.5)}>Seek 50%</button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
        State: {playbackState} | Progress: {progress.toFixed(2)} | Duration: {duration}ms | Active Stage: {currentStageId || '-'}
      </div>
    </div>
  );
};

export default SequenceDemo;
```

---

## `useAnimationSequence` Hook Documentation

### Importing the Hook

```typescript
import {
  useAnimationSequence,
  AnimationSequenceConfig,
  PublicAnimationStage,
  SequenceControls,
  AnimationSequenceResult
} from '@veerone/galileo-glass-ui/hooks';
```

### Configuration (`AnimationSequenceConfig`)

| Property          | Type | Default | Description |
|-------------------|------|---------|-------------|
| `id`              | `string` | Optional | Unique identifier for the sequence |
| `stages`          | `PublicAnimationStage[]` | Required | Array defining animation stages |
| `autoplay`        | `boolean` | `false` | Automatically play on mount |
| `loop`            | `boolean` | `false` | Loop indefinitely |
| `repeatCount`     | `number` | `0` | Times to repeat sequence |
| `yoyo`            | `boolean` | `false` | Alternate direction each loop |
| `direction`       | `PlaybackDirection` | `'forward'` | Initial playback direction |
| `playbackRate`    | `number` | `1` | Playback speed |
| Lifecycle callbacks | Functions | Optional | Various callbacks (`onStart`, `onComplete`, etc.) |

### Animation Stages (`PublicAnimationStage`)

| Property     | Type | Description |
|--------------|------|-------------|
| `id`         | `string` | Unique stage ID |
| `type`       | `'style'|'callback'|'event'|'group'|'stagger'` | Stage type |
| `duration`   | `number` | Duration in milliseconds |
| `delay`      | `number` | Delay before starting |
| `targets`    | Selector/Element | Target element(s) |
| `properties` | Object | CSS properties to animate |
| `callback`   | Function | Callback function |

### Returned State and Controls (`AnimationSequenceResult`)

**State Properties:**
- `progress`: Current sequence progress (0-1)
- `playbackState`: Current state (`'idle'`, `'playing'`, `'paused'`, `'finished'`)
- `currentStageId`: Currently active stage ID
- `duration`: Total duration (ms)

**Control Functions:**
- `play()`: Start/resume playback
- `pause()`: Pause playback
- `stop()`: Stop playback and reset progress
- `reset()`: Reset sequence state
- `seekProgress(progress: number)`: Seek to specific progress
- `setPlaybackRate(rate: number)`: Set playback speed

### Recent Updates (v1.0.22)

- Fixed initial state issues (Bug #20)
- Improved robustness of sequence execution logic

