# Game Animation Framework

The Game Animation Framework provides robust state-based animation capabilities inspired by game development techniques. At its core is the `useGameAnimation` hook, which manages cohesive animation sequences when transitioning between different application or "game" states.

## Core Concepts

- **State-Based Animation:** Define distinct visual states for your application and animate transitions between them
- **Transition Types:** Choose from multiple built-in transition styles including fade, slide, zoom, flip, and more
- **Choreographed Sequences:** Coordinate multiple elements with precise timing and dependencies
- **Accessibility:** Built-in reduced motion support
- **Staggered Effects:** Apply animations to multiple elements with configurable timing patterns

## API Reference

### `useGameAnimation(config)`

```typescript
function useGameAnimation(config: GameAnimationConfig): GameAnimationController
```

#### Configuration

```typescript
interface GameAnimationConfig {
  /** Initial state ID */
  initialState?: string;
  
  /** State definitions */
  states: GameAnimationState[];
  
  /** Transition definitions */
  transitions: StateTransition[];
  
  /** Default transition type for transitions without explicit configuration */
  defaultTransitionType?: TransitionType;
  
  /** Default transition duration in ms */
  defaultDuration?: number;
  
  /** Default easing function */
  defaultEasing?: keyof typeof Easings | ((t: number) => number);
  
  /** Whether to auto-apply transitions when changing states */
  autoTransition?: boolean;
  
  /** Whether to allow multiple active states */
  allowMultipleActiveStates?: boolean;
  
  /** Root element selector for scoping animations */
  rootElement?: string | HTMLElement;
  
  /** Whether to use Web Animations API when available */
  useWebAnimations?: boolean;
  
  /** Function to call when any state changes */
  onStateChange?: (prevState: string | null, newState: string | null) => void;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
}
```

#### Game States

```typescript
interface GameAnimationState {
  /** State identifier */
  id: string;
  
  /** State name or label */
  name: string;
  
  /** Elements to animate when entering this state */
  enterElements?: string | string[] | HTMLElement | HTMLElement[];
  
  /** Elements to animate when exiting this state */
  exitElements?: string | string[] | HTMLElement | HTMLElement[];
  
  /** CSS class to apply when this state is active */
  activeClass?: string;
  
  /** Priority level for this state (higher wins if multiple are active) */
  priority?: number;
  
  /** Whether this state can be active simultaneously with other states */
  exclusive?: boolean;
  
  /** Duration for enter animation in ms */
  enterDuration?: number;
  
  /** Duration for exit animation in ms */
  exitDuration?: number;
  
  /** Whether to auto-animate when entering this state */
  autoAnimate?: boolean;
  
  /** Background elements to animate during state changes */
  backgroundElements?: string | string[] | HTMLElement | HTMLElement[];
  
  /** Additional metadata for this state */
  meta?: Record<string, any>;
}
```

#### Transitions

```typescript
interface StateTransition {
  /** Source state ID */
  from: string;
  
  /** Target state ID */
  to: string;
  
  /** Transition type */
  type: TransitionType;
  
  /** Direction for directional transitions */
  direction?: TransitionDirection;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Easing function */
  easing?: keyof typeof Easings | ((t: number) => number);
  
  /** Whether to stagger elements */
  stagger?: boolean;
  
  /** Stagger pattern to use */
  staggerPattern?: StaggerPattern;
  
  /** Delay between elements for staggered animations */
  staggerDelay?: number;
  
  /** Custom transition settings */
  customSettings?: Record<string, any>;
  
  /** Elements to animate during transition (if different from state elements) */
  elements?: string | string[] | HTMLElement | HTMLElement[];
  
  /** Function to call when transition starts */
  onStart?: () => void;
  
  /** Function to call when transition completes */
  onComplete?: () => void;
  
  /** Children or sub-transitions to trigger after this transition */
  children?: StateTransition[];
  
  /** Whether this transition happens in parallel with parent */
  parallel?: boolean;
  
  /** Alternative transition for reduced motion */
  reducedMotionAlternative?: Omit<StateTransition, 'from' | 'to'>;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Physics configuration for physics-based transitions */
  physicsConfig?: Partial<SpringConfig>;
  
  /** Component state synchronization configuration */
  componentSync?: {
    /** Target components to sync with the transition */
    targets?: string | string[] | HTMLElement | HTMLElement[];
    
    /** Map of properties to sync between state and components */
    propsMap?: Record<string, string>;
    
    /** Initial state for synchronization */
    fromState?: Record<string, any>;
    
    /** Target state for synchronization */
    toState?: Record<string, any>;
    
    /** Custom function to apply state updates to components */
    applyStateUpdate?: (element: HTMLElement, state: Record<string, any>) => void;
  };
  
  /** Gesture physics integration for interactive transitions */
  gesturePhysics?: {
    /** Whether gesture physics is enabled */
    enabled: boolean;
    
    /** Type of interaction (drag, swipe, pinch, rotate) */
    interactionType?: 'drag' | 'swipe' | 'pinch' | 'rotate';
    
    /** Whether element should spring back to original position after interaction */
    springBack?: boolean;
    
    /** Whether to enforce boundaries for the interaction */
    boundsCheck?: boolean;
    
    /** Custom bounds for the interaction */
    bounds?: { minX?: number; maxX?: number; minY?: number; maxY?: number };
    
    /** Physics parameters for the gesture interaction */
    physicsParams?: Partial<SpringConfig>;
  };
}
```

#### Transition Types

```typescript
enum TransitionType {
  /** Fade between states */
  FADE = 'fade',
  
  /** Slide between states */
  SLIDE = 'slide',
  
  /** Zoom between states */
  ZOOM = 'zoom',
  
  /** Flip between states */
  FLIP = 'flip',
  
  /** Dissolve between states with particles */
  DISSOLVE = 'dissolve',
  
  /** Morph between states */
  MORPH = 'morph',
  
  /** Crossfade between states */
  CROSSFADE = 'crossfade',
  
  /** Swipe between states */
  SWIPE = 'swipe',
  
  /** Fold between states */
  FOLD = 'fold',
  
  /** Push one state to reveal another */
  PUSH = 'push',
  
  /** Cover one state with another */
  COVER = 'cover',
  
  /** Reveal state with an iris effect */
  IRIS = 'iris',
  
  /** Physics-based slide between states */
  PHYSICS_SLIDE = 'physics-slide',
  
  /** Physics-based bounce between states */
  PHYSICS_BOUNCE = 'physics-bounce',
  
  /** 3D push transition between states */
  PUSH_3D = 'push-3d',
  
  /** 3D rotation transition between states */
  ROTATE_3D = 'rotate-3d',
  
  /** Glass effect transition between states */
  GLASS_TRANSITION = 'glass-transition',
  
  /** Custom transition */
  CUSTOM = 'custom'
}
```

#### Direction (for directional transitions)

```typescript
enum TransitionDirection {
  /** Left to right */
  LEFT_TO_RIGHT = 'left-to-right',
  
  /** Right to left */
  RIGHT_TO_LEFT = 'right-to-left',
  
  /** Top to bottom */
  TOP_TO_BOTTOM = 'top-to-bottom',
  
  /** Bottom to top */
  BOTTOM_TO_TOP = 'bottom-to-top',
  
  /** Expand from center */
  FROM_CENTER = 'from-center',
  
  /** Contract to center */
  TO_CENTER = 'to-center',
  
  /** Custom direction function */
  CUSTOM = 'custom'
}
```

#### Return Value

```typescript
interface GameAnimationController {
  /** Current active state(s) */
  activeStates: GameAnimationState[];
  
  /** Current transition in progress, if any */
  currentTransition: StateTransition | null;
  
  /** Whether a transition is currently in progress */
  isTransitioning: boolean;
  
  /** Progress of the current transition (0-1) */
  transitionProgress: number;
  
  /** Go to a specific state without animation */
  goToState: (stateId: string) => void;
  
  /** Transition from current state to target state */
  transitionTo: (targetStateId: string, customTransition?: Partial<StateTransition>) => void;
  
  /** Play a specific transition without changing state */
  playTransition: (transition: StateTransition) => void;
  
  /** Play animation for entering a state */
  playEnterAnimation: (stateId: string) => void;
  
  /** Play animation for exiting a state */
  playExitAnimation: (stateId: string) => void;
  
  /** Add a new state dynamically */
  addState: (state: GameAnimationState) => void;
  
  /** Remove a state */
  removeState: (stateId: string) => void;
  
  /** Add a new transition dynamically */
  addTransition: (transition: StateTransition) => void;
  
  /** Remove a transition */
  removeTransition: (fromId: string, toId: string) => void;
  
  /** Pause current transition */
  pauseTransition: () => void;
  
  /** Resume current transition */
  resumeTransition: () => void;
  
  /** Immediately complete current transition */
  completeTransition: () => void;
  
  /** Cancel current transition */
  cancelTransition: () => void;
  
  /** Get a state by ID */
  getState: (stateId: string) => GameAnimationState | undefined;
  
  /** Check if a state is active */
  isStateActive: (stateId: string) => boolean;
  
  /** Whether reduced motion is active */
  reducedMotion: boolean;
}
```

## Examples

### Basic Usage

```tsx
import React from 'react';
import { useGameAnimation, TransitionType } from '@veerone/galileo-glass-ui';

const GameDemo = () => {
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: [
      {
        id: 'menu',
        name: 'Main Menu',
        enterElements: '.menu-items',
        exitElements: '.menu-items',
        backgroundElements: '.menu-background'
      },
      {
        id: 'playing',
        name: 'Playing Game',
        enterElements: '.game-container',
        exitElements: '.game-container',
        backgroundElements: '.game-background'
      },
      {
        id: 'gameOver',
        name: 'Game Over',
        enterElements: '.game-over-screen',
        exitElements: '.game-over-screen',
        backgroundElements: '.game-over-background'
      }
    ],
    transitions: [
      {
        from: 'menu',
        to: 'playing',
        type: TransitionType.FADE,
        duration: 800
      },
      {
        from: 'playing',
        to: 'gameOver',
        type: TransitionType.ZOOM,
        duration: 1000
      },
      {
        from: 'gameOver',
        to: 'menu',
        type: TransitionType.SLIDE,
        duration: 600
      }
    ],
    defaultDuration: 500,
    autoTransition: true
  });

  // Get current state
  const isPlaying = gameAnimation.isStateActive('playing');
  
  return (
    <div className="game-container">
      {/* Menu section */}
      <div className={`menu-section ${isPlaying ? 'hidden' : ''}`}>
        <div className="menu-background"></div>
        <div className="menu-items">
          <h1>My Game</h1>
          <button onClick={() => gameAnimation.transitionTo('playing')}>
            Start Game
          </button>
        </div>
      </div>
      
      {/* Main game UI would go here */}
      
      {/* Controls */}
      <div className="controls">
        <button onClick={() => gameAnimation.transitionTo('menu')}>
          Back to Menu
        </button>
        <button onClick={() => gameAnimation.transitionTo('gameOver')}>
          End Game
        </button>
      </div>
    </div>
  );
};
```

### Advanced: Multiple States and Staggered Animations

```tsx
import React from 'react';
import { 
  useGameAnimation, 
  TransitionType, 
  TransitionDirection,
  StaggerPattern
} from '@veerone/galileo-glass-ui';

const AdvancedDemo = () => {
  const gameAnimation = useGameAnimation({
    initialState: 'idle',
    states: [
      {
        id: 'idle',
        name: 'Idle State',
        enterElements: '.idle-elements',
        exitElements: '.idle-elements'
      },
      {
        id: 'active',
        name: 'Active State',
        enterElements: '.active-elements',
        exitElements: '.active-elements',
        exclusive: false // Can be active with other states
      },
      {
        id: 'highlight',
        name: 'Highlight State',
        enterElements: '.highlight-elements',
        exitElements: '.highlight-elements',
        exclusive: false // Can be active with other states
      }
    ],
    transitions: [
      {
        from: 'idle',
        to: 'active',
        type: TransitionType.SLIDE,
        direction: TransitionDirection.LEFT_TO_RIGHT,
        duration: 600,
        stagger: true,
        staggerPattern: StaggerPattern.SEQUENTIAL,
        staggerDelay: 50
      }
    ],
    allowMultipleActiveStates: true // Allow multiple states to be active
  });
  
  // Get current states info
  const { activeStates, isTransitioning } = gameAnimation;
  
  return (
    <div className="advanced-container">
      {/* UI elements here */}
      
      <div className="state-info">
        <div>Active States: {activeStates.map(s => s.name).join(', ')}</div>
        <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
      </div>
      
      <div className="controls">
        <button 
          onClick={() => gameAnimation.transitionTo('active')}
          disabled={gameAnimation.isStateActive('active')}
        >
          Activate
        </button>
        
        <button 
          onClick={() => gameAnimation.transitionTo('highlight')}
          disabled={gameAnimation.isStateActive('highlight')}
        >
          Highlight
        </button>
        
        <button 
          onClick={() => gameAnimation.transitionTo('idle')}
          disabled={gameAnimation.isStateActive('idle') && activeStates.length === 1}
        >
          Reset to Idle
        </button>
      </div>
    </div>
  );
};
```

### Advanced: Physics-Based and Interactive Transitions

```tsx
import React, { useState } from 'react';
import { 
  useGameAnimation, 
  TransitionType, 
  TransitionDirection
} from '@veerone/galileo-glass-ui';

const PhysicsTransitionDemo = () => {
  const [isDraggable, setIsDraggable] = useState(false);

  const gameAnimation = useGameAnimation({
    initialState: 'default',
    states: [
      {
        id: 'default',
        name: 'Default State',
        enterElements: '.card-container',
      },
      {
        id: 'expanded',
        name: 'Expanded State',
        enterElements: '.card-container',
      },
      {
        id: 'interactive',
        name: 'Interactive State',
        enterElements: '.card-container',
      }
    ],
    transitions: [
      // Physics-based transition
      {
        from: 'default',
        to: 'expanded',
        type: TransitionType.PHYSICS_BOUNCE,
        duration: 800,
        physicsConfig: {
          mass: 1,
          tension: 170, // Higher tension = more snappy
          friction: 26,  // Higher friction = less oscillation
        },
        // Sync component props with the animation state
        componentSync: {
          targets: '.card-container',
          fromState: { elevation: 1, blur: 'minimal' },
          toState: { elevation: 4, blur: 'medium' }
        }
      },
      // Interactive gesture-based transition
      {
        from: 'expanded',
        to: 'interactive',
        type: TransitionType.SLIDE,
        duration: 500,
        // Enable gesture physics for interactive transitions
        gesturePhysics: {
          enabled: true,
          interactionType: 'drag',
          springBack: true,
          boundsCheck: true,
          bounds: { minX: -100, maxX: 100, minY: -50, maxY: 50 },
          physicsParams: {
            tension: 200,
            friction: 20
          }
        },
        onComplete: () => setIsDraggable(true)
      },
      // Back to default
      {
        from: ['expanded', 'interactive'],
        to: 'default',
        type: TransitionType.PHYSICS_SLIDE,
        duration: 600,
        direction: TransitionDirection.TO_CENTER,
        physicsConfig: {
          tension: 120,
          friction: 14
        },
        onStart: () => setIsDraggable(false)
      }
    ],
    defaultDuration: 500
  });

  // Get current state
  const isDefault = gameAnimation.isStateActive('default');
  const isExpanded = gameAnimation.isStateActive('expanded');
  const isInteractive = gameAnimation.isStateActive('interactive');
  
  // Calculate dynamic styles based on animation state
  const cardStyle = {
    cursor: isDraggable ? 'grab' : 'pointer',
    userSelect: 'none' as const,
  };
  
  return (
    <div className="physics-demo-container">
      <div 
        className="card-container" 
        style={cardStyle}
        onClick={() => {
          if (isDefault) {
            gameAnimation.transitionTo('expanded');
          } else if (isExpanded) {
            gameAnimation.transitionTo('interactive');
          } else {
            gameAnimation.transitionTo('default');
          }
        }}
      >
        <h3>Physics Animation Demo</h3>
        <p>Current State: {
          isDefault ? 'Default' : 
          isExpanded ? 'Expanded' : 
          'Interactive (Try Dragging)'
        }</p>
        {isInteractive && (
          <div className="instructions">
            Drag this card - it uses physics-based spring animations
          </div>
        )}
      </div>
      
      <div className="controls">
        <button 
          onClick={() => gameAnimation.transitionTo('default')}
          disabled={isDefault}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
```

### Glass Transition Effects

The `useGameAnimation` hook now integrates with the Glass effect system, allowing for transitions that animate glass properties:

```tsx
// Transition with glass effects
{
  from: 'default',
  to: 'frosted',
  type: TransitionType.GLASS_TRANSITION,
  duration: 800,
  // Animate glass properties
  componentSync: {
    targets: '.glass-card',
    fromState: { 
      blur: 'minimal', 
      opacity: 0.7,
      refraction: 0.1
    },
    toState: { 
      blur: 'heavy', 
      opacity: 0.9, 
      refraction: 0.3
    }
  }
}
```

## Accessibility

The Game Animation Framework automatically respects user preferences for reduced motion through the `useReducedMotion` hook. You can also provide alternative transitions for users with motion sensitivity:

```tsx
{
  from: 'menu',
  to: 'playing',
  type: TransitionType.ZOOM,
  duration: 800,
  // Alternative for reduced motion preference
  reducedMotionAlternative: {
    type: TransitionType.FADE,
    duration: 400
  },
  category: AnimationCategory.INTERACTION
}
```

### Enhanced Motion Sensitivity Integration

The framework now includes finer control over animations based on user motion sensitivity preferences using the `MotionSensitivityLevel` enum:

```tsx
enum MotionSensitivityLevel {
  NONE = 'none',       // No sensitivity, full animations
  LOW = 'low',         // Slight reduction in animation intensity
  MEDIUM = 'medium',   // Moderate reduction in animations
  HIGH = 'high',       // Significant reduction (similar to prefers-reduced-motion)
  VERY_HIGH = 'veryhigh' // Maximum reduction, minimal animations only
}
```

You can adapt your transitions based on the user's motion sensitivity level:

```tsx
// In your component
const { motionSensitivityLevel } = useAccessibilitySettings();

// Configure your gameAnimation hook
const gameAnimation = useGameAnimation({
  // ...other config
  motionSensitivity: motionSensitivityLevel,
  // Transitions will automatically adapt based on sensitivity level
});

// Or manually adjust transitions based on sensitivity
const getTransitionDuration = (baseDuration: number) => {
  switch (motionSensitivityLevel) {
    case MotionSensitivityLevel.NONE: 
      return baseDuration;
    case MotionSensitivityLevel.LOW: 
      return baseDuration * 0.8;
    case MotionSensitivityLevel.MEDIUM: 
      return baseDuration * 0.6;
    case MotionSensitivityLevel.HIGH: 
      return baseDuration * 0.4;
    case MotionSensitivityLevel.VERY_HIGH: 
      return baseDuration * 0.2;
  }
};
```

The framework will automatically adjust physics parameters (tension, friction, mass) and transition types based on the user's sensitivity level, providing a more comfortable experience for all users.

## Use Cases

The Game Animation framework is ideal for:

- Single-page applications with distinct view states
- Interactive tutorials and onboarding flows
- Game-like interfaces and gamified applications
- Data visualizations with state-dependent animations
- Complex multi-step forms with animated transitions
- Interactive storytelling experiences 
- Complex onboarding sequences.
- Highly interactive data visualizations.
- Gamified elements or tutorials.
- Elaborate state transition animations.

**Recommendation:** Due to the specialized nature, check for explicit examples or specific component implementations (`GlassTimeline`, `GlassCarousel`, etc., might use parts of this internally) before attempting to use these conceptual hooks directly. They might not be exposed as part of the general public API. 
- Complex onboarding sequences.
- Highly interactive data visualizations.
- Gamified elements or tutorials.
- Elaborate state transition animations.

**Recommendation:** Due to the specialized nature, check for explicit examples or specific component implementations (`GlassTimeline`, `GlassCarousel`, etc., might use parts of this internally) before attempting to use these conceptual hooks directly. They might not be exposed as part of the general public API. 