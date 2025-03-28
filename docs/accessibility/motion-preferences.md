# Motion Preferences in Galileo Glass UI

This guide explains the motion preference system in Galileo Glass UI and how to implement it in your applications.

## Introduction

The motion preference system allows users to customize how animations and transitions behave based on their personal needs and preferences. This is especially important for users with motion sensitivity or vestibular disorders who may experience discomfort with certain types of animations.

## Motion Sensitivity Levels

Galileo Glass UI provides a granular motion sensitivity system with multiple levels:

```typescript
enum MotionSensitivityLevel {
  /** No motion limitations */
  NONE = 'none',
  
  /** Very low sensitivity - limit only the most extreme animations */
  VERY_LOW = 'very_low',
  
  /** Low sensitivity - only limit the most intense animations */
  LOW = 'low',
  
  /** Low-medium sensitivity - moderate reduction of complex animations */
  LOW_MEDIUM = 'low_medium',
  
  /** Medium sensitivity - reduce most animations */
  MEDIUM = 'medium',
  
  /** Medium-high sensitivity - allow only simple animations */
  MEDIUM_HIGH = 'medium_high',
  
  /** High sensitivity - minimal animations */
  HIGH = 'high',
  
  /** Very high sensitivity - nearly all animations disabled */
  VERY_HIGH = 'very_high',
  
  /** No animations at all */
  MAXIMUM = 'maximum',
}
```

Each level corresponds to a specific configuration that affects:

- Maximum animation complexity allowed
- Maximum animation duration
- Animation distance scale
- Animation speed multiplier
- Category-specific settings
- And many other parameters

## Animation Categories

Animations are organized into categories to allow for more fine-grained control:

```typescript
enum AnimationCategory {
  /** Essential UI feedback animations */
  ESSENTIAL = 'essential',
  
  /** Entrance animations (elements appearing) */
  ENTRANCE = 'entrance',
  
  /** Exit animations (elements disappearing) */
  EXIT = 'exit',
  
  /** Hover state animations */
  HOVER = 'hover',
  
  /** Focus state animations */
  FOCUS = 'focus',
  
  /** Active/pressed state animations */
  ACTIVE = 'active',
  
  /** Loading/progress animations */
  LOADING = 'loading',
  
  /** Background/decorative animations */
  BACKGROUND = 'background',
  
  /** Scrolling effects and parallax */
  SCROLL = 'scroll',
  
  /** Attention-grabbing animations */
  ATTENTION = 'attention'
}
```

Each category can have its own settings for:

- Whether the animation category is enabled
- Maximum complexity allowed for this category
- Maximum duration for this category
- Distance scale for this category
- Speed multiplier for this category

## Animation Speed Preferences

Users can control animation speed with the following options:

```typescript
enum AnimationSpeedPreference {
  /** Slower animations (1.5x duration) */
  SLOWER = 'slower',
  
  /** Slightly slower animations (1.25x duration) */
  SLIGHTLY_SLOWER = 'slightly_slower',
  
  /** Default animation speed (1x duration) */
  NORMAL = 'normal',
  
  /** Slightly faster animations (0.75x duration) */
  SLIGHTLY_FASTER = 'slightly_faster',
  
  /** Faster animations (0.5x duration) */
  FASTER = 'faster',
  
  /** Very fast animations (0.25x duration) */
  VERY_FAST = 'very_fast',
}
```

## Using the Motion Preference System

### AccessibilitySettings Component

The easiest way to give users control over motion preferences is with the `AccessibilitySettings` component:

```tsx
import { AccessibilitySettings } from 'galileo-glass-ui';

function MyApp() {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        Open Accessibility Settings
      </button>
      
      {showSettings && (
        <AccessibilitySettings 
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
```

This provides a complete UI for configuring:

- Motion sensitivity level
- Animation speed preferences
- Category-specific settings
- General accessibility options

### AccessibilityProvider

The `AccessibilityProvider` should wrap your application to provide accessibility features:

```tsx
import { AccessibilityProvider } from 'galileo-glass-ui';

function App() {
  return (
    <AccessibilityProvider>
      <YourApplication />
    </AccessibilityProvider>
  );
}
```

### Using Hooks

You can access and modify motion preferences through hooks:

```tsx
import { 
  useAccessibility, 
  useAnimationSpeed,
  useMotionSettings
} from 'galileo-glass-ui';

function MotionControls() {
  const accessibility = useAccessibility();
  const { setGlobalSpeed, setCategorySpeed } = useAnimationSpeed();
  const motionSettings = useMotionSettings();
  
  return (
    <div>
      <h2>Motion Controls</h2>
      
      <label>
        <input 
          type="checkbox"
          checked={accessibility.reducedMotion}
          onChange={(e) => accessibility.setReducedMotion(e.target.checked)}
        />
        Reduce Motion
      </label>
      
      {/* More controls... */}
    </div>
  );
}
```

### Creating Accessible Animations

Use the `useAccessibleAnimation` hook to create animations that respect user preferences:

```tsx
import { useAccessibleAnimation, AnimationCategory } from 'galileo-glass-ui';
import { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const animation = css`
  animation: ${fadeIn} 300ms ease-out forwards;
`;

function MyComponent() {
  const { animation: accessibleAnimation } = useAccessibleAnimation(animation, {
    category: AnimationCategory.ENTRANCE,
    duration: 300,
  });

  return <div css={accessibleAnimation}>My animated content</div>;
}
```

## Configuration System Details

### Motion Sensitivity Configuration

The motion sensitivity system provides detailed configuration through the `MotionSensitivityConfig` interface:

```typescript
interface MotionSensitivityConfig {
  /** The user's motion sensitivity level */
  level: MotionSensitivityLevel;

  /** Whether to respect the prefers-reduced-motion setting */
  respectPrefersReducedMotion: boolean;

  /** Maximum allowed animation complexity */
  maxAllowedComplexity: AnimationComplexity;

  /** Maximum allowed animation duration in ms */
  maxAllowedDuration: number;

  /** Animation distance scale factor to limit motion range */
  distanceScale: AnimationDistanceScale;

  /** Animation speed multiplier (1.0 = normal speed, <1 = slower, >1 = faster) */
  speedMultiplier: number;
  
  /** Category-specific settings to enable fine-grained control */
  categorySettings: {
    [key in AnimationCategory]?: {
      /** Whether this category is enabled */
      enabled: boolean;
      /** Maximum complexity for this specific category */
      maxComplexity?: AnimationComplexity;
      /** Duration limit override for this category */
      maxDuration?: number;
      /** Distance scale override for this category */
      distanceScale?: AnimationDistanceScale;
      /** Speed multiplier override for this category */
      speedMultiplier?: number;
    };
  };

  /** Legacy options kept for backward compatibility */
  disableParallax: boolean;
  disableAutoPlay: boolean;
  disableBackgroundAnimations: boolean;
  disableHoverAnimations: boolean;
  
  /** Frequency limit for animations (max number of animations per second) */
  maxAnimationsPerSecond?: number;
  
  /** Whether to use alternative animations for this sensitivity level */
  useAlternativeAnimations: boolean;
  
  /** Whether to disable 3D perspective effects */
  disable3DEffects: boolean;
  
  /** Whether to reduce or eliminate flashing effects */
  reduceFlashing: boolean;
}
```

### Animation Speed Control Configuration

Animation speed is controlled through the `AnimationSpeedControlConfig` interface:

```typescript
interface AnimationSpeedControlConfig {
  /** Global animation speed preference */
  globalSpeedPreference: AnimationSpeedPreference;
  
  /** Category-specific speed preferences */
  categoryPreferences?: Partial<Record<AnimationCategory, AnimationSpeedPreference>>;
  
  /** Mode for adjusting animation durations */
  adjustmentMode?: DurationAdjustmentMode;
  
  /** Base factor or value for duration adjustment */
  adjustmentValue?: number;
  
  /** Whether to apply speed adjustments to hover animations */
  adjustHoverAnimations?: boolean;
  
  /** Whether to apply speed adjustments to focus animations */
  adjustFocusAnimations?: boolean;
  
  /** Whether to apply speed adjustments to loading animations */
  adjustLoadingAnimations?: boolean;
  
  /** Whether to apply different speed scaling to short vs long animations */
  smartDurationScaling?: boolean;
  
  /** Custom duration thresholds for different animation types */
  durationThresholds?: {
    /** Threshold between short and medium animations (ms) */
    shortMedium?: number;
    
    /** Threshold between medium and long animations (ms) */
    mediumLong?: number;
  };
}
```

## Persisting User Preferences

User preferences are automatically persisted to localStorage by both the `AccessibilityProvider` and the `AnimationSpeedController`. This ensures that user settings are remembered between sessions.

## Advanced Usage

### Creating Custom Motion Sensitivity Configurations

You can create custom motion sensitivity configurations:

```typescript
import { 
  getMotionSensitivity, 
  MotionSensitivityLevel,
  AnimationCategory,
  AnimationComplexity,
  AnimationDistanceScale
} from 'galileo-glass-ui';

// Create a custom configuration
const customConfig = getMotionSensitivity({
  level: MotionSensitivityLevel.LOW,
  maxAllowedComplexity: AnimationComplexity.ENHANCED,
  distanceScale: AnimationDistanceScale.MEDIUM,
  categorySettings: {
    [AnimationCategory.HOVER]: {
      enabled: false
    },
    [AnimationCategory.BACKGROUND]: {
      enabled: true,
      maxComplexity: AnimationComplexity.BASIC
    }
  }
});
```

### Adjusting Animations Programmatically

You can adjust animations based on sensitivity settings:

```typescript
import { 
  getAdjustedAnimation, 
  getMotionSensitivity,
  MotionSensitivityLevel
} from 'galileo-glass-ui';

// Get current sensitivity configuration
const sensitivity = getMotionSensitivity(MotionSensitivityLevel.MEDIUM);

// Adjust an animation
const adjustedAnimation = getAdjustedAnimation({
  duration: 500,
  category: AnimationCategory.ENTRANCE,
  complexity: AnimationComplexity.ENHANCED,
  autoPlay: false
}, sensitivity);

if (adjustedAnimation.shouldAnimate) {
  // Apply animation with adjusted parameters
  console.log(`Adjusted duration: ${adjustedAnimation.duration}ms`);
  console.log(`Distance scale: ${adjustedAnimation.distanceScale}`);
} else {
  // Skip animation
}
```

## Conclusion

The motion preference system in Galileo Glass UI provides a comprehensive solution for creating accessible animations that respect user preferences. By using these tools, you can ensure that your application is usable and comfortable for all users, including those with motion sensitivity or vestibular disorders.