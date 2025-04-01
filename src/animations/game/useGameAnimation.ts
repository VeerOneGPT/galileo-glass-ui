/**
 * useGameAnimation.ts
 * 
 * A hook for managing animations based on application/game state transitions,
 * creating cohesive animation experiences when navigating between different 
 * states or scenes in an interactive application.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { useAnimationSequence, StaggerPattern, PlaybackDirection } from '../orchestration/useAnimationSequence';
import { Easings } from '../physics/interpolation';

/**
 * Game or application state transition types
 */
export enum TransitionType {
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
  
  /** Custom transition */
  CUSTOM = 'custom'
}

/**
 * Direction for transitions that have a spatial component
 */
export enum TransitionDirection {
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

/**
 * Game animation state
 */
export interface GameAnimationState {
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

/**
 * State transition configuration
 */
export interface StateTransition {
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
}

/**
 * Stateful game animation configuration
 */
export interface GameAnimationConfig {
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

/**
 * Game animation controller returned by useGameAnimation
 */
export interface GameAnimationController {
  /** Current active state(s) */
  activeStates: GameAnimationState[];
  
  /** Current transition in progress, if any */
  currentTransition: StateTransition | null;
  
  /** Whether a transition is currently in progress */
  isTransitioning: boolean;
  
  /** Progress of the current transition (0-1) */
  transitionProgress: number;
  
  /** Go to a specific state */
  goToState: (stateId: string) => void;
  
  /** Transition from current state to target state */
  transitionTo: (targetStateId: string, customTransition?: Partial<StateTransition>) => void;
  
  /** Play a specific transition without changing state */
  playTransition: (transition: StateTransition) => void;
  
  /** Play animation for entering a state */
  playEnterAnimation: (stateId: string) => void;
  
  /** Play animation for exiting a state */
  playExitAnimation: (stateId: string) => void;
  
  /** Add a new state */
  addState: (state: GameAnimationState) => void;
  
  /** Remove a state */
  removeState: (stateId: string) => void;
  
  /** Add a new transition */
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

/**
 * Hook for managing game/application state transitions with animations
 * 
 * @param config Game animation configuration
 * @returns Game animation controller
 */
export function useGameAnimation(config: GameAnimationConfig): GameAnimationController {
  const {
    initialState,
    states,
    transitions,
    defaultTransitionType = TransitionType.FADE,
    defaultDuration = 400,
    defaultEasing = 'easeInOutCubic',
    autoTransition = true,
    allowMultipleActiveStates = false,
    rootElement,
    useWebAnimations = true,
    onStateChange,
    category = AnimationCategory.INTERACTION
  } = config;
  
  // Reduced motion detection
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  
  // Track active states
  const [activeStateIds, setActiveStateIds] = useState<string[]>(
    initialState ? [initialState] : []
  );
  
  // Transition state
  const [currentTransition, setCurrentTransition] = useState<StateTransition | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  // Maps for efficient lookups
  const statesMap = useRef(new Map<string, GameAnimationState>());
  const transitionsMap = useRef(new Map<string, StateTransition>());
  
  // Create animation sequence for coordinated transitions
  const animationSequence = useAnimationSequence({
    id: 'game-animation-sequence',
    stages: [],
    autoplay: false,
    category
  });
  
  // Update maps when config changes
  useEffect(() => {
    // Update states map
    const newStatesMap = new Map<string, GameAnimationState>();
    states.forEach(state => {
      newStatesMap.set(state.id, state);
    });
    statesMap.current = newStatesMap;
    
    // Update transitions map
    const newTransitionsMap = new Map<string, StateTransition>();
    transitions.forEach(transition => {
      const key = `${transition.from}:${transition.to}`;
      newTransitionsMap.set(key, transition);
    });
    transitionsMap.current = newTransitionsMap;
  }, [states, transitions]);
  
  // Get active state objects
  const activeStates = useMemo(() => {
    return activeStateIds
      .map(id => statesMap.current.get(id))
      .filter(Boolean) as GameAnimationState[];
  }, [activeStateIds]);
  
  /**
   * Find transition between two states
   */
  const findTransition = useCallback((fromId: string, toId: string): StateTransition | null => {
    const key = `${fromId}:${toId}`;
    return transitionsMap.current.get(key) || null;
  }, []);
  
  /**
   * Create default transition between states
   */
  const createDefaultTransition = useCallback((fromId: string, toId: string): StateTransition => {
    return {
      from: fromId,
      to: toId,
      type: defaultTransitionType,
      duration: defaultDuration,
      easing: defaultEasing,
      category
    };
  }, [defaultTransitionType, defaultDuration, defaultEasing, category]);
  
  /**
   * Get DOM elements from selector or reference
   */
  const getElements = useCallback((
    elementRef: string | string[] | HTMLElement | HTMLElement[] | undefined
  ): HTMLElement[] => {
    if (!elementRef) return [];
    
    const rootEl = typeof rootElement === 'string'
      ? document.querySelector(rootElement) as HTMLElement
      : rootElement || document;
    
    // Handle array of elements/selectors
    if (Array.isArray(elementRef)) {
      return elementRef.flatMap(item => getElements(item));
    }
    
    // Handle single element
    if (elementRef instanceof HTMLElement) {
      return [elementRef];
    }
    
    // Handle selector string
    if (typeof elementRef === 'string') {
      return Array.from(rootEl.querySelectorAll(elementRef)) as HTMLElement[];
    }
    
    return [];
  }, [rootElement]);
  
  /**
   * Create a transition animation sequence
   */
  const createTransitionAnimation = useCallback((
    transition: StateTransition
  ) => {
    // Use reduced motion alternative if available and preferred
    let effectiveTransition = transition;
    
    if (
      prefersReducedMotion && 
      transition.reducedMotionAlternative && 
      transition.category && 
      !isAnimationAllowed(transition.category)
    ) {
      effectiveTransition = {
        ...transition,
        ...transition.reducedMotionAlternative
      };
    }
    
    const {
      from,
      to,
      type,
      direction = TransitionDirection.LEFT_TO_RIGHT,
      duration = defaultDuration,
      easing = defaultEasing,
      stagger = false,
      staggerPattern = StaggerPattern.SEQUENTIAL,
      staggerDelay = 50,
      elements: transitionElements,
      customSettings = {}
    } = effectiveTransition;
    
    // Get elements to animate
    const fromState = statesMap.current.get(from);
    const toState = statesMap.current.get(to);
    
    if (!fromState || !toState) {
      console.warn(`Invalid transition: ${from} -> ${to}`);
      return;
    }
    
    // Determine which elements to animate
    let animationTargets: HTMLElement[] = [];
    
    if (transitionElements) {
      // Use explicitly specified elements
      animationTargets = getElements(transitionElements);
    } else {
      // Combine exit elements from source state and enter elements from target state
      const exitElements = getElements(fromState.exitElements);
      const enterElements = getElements(toState.enterElements);
      animationTargets = [...new Set([...exitElements, ...enterElements])];
    }
    
    if (animationTargets.length === 0) {
      console.warn(`No elements to animate in transition: ${from} -> ${to}`);
      return;
    }
    
    // Set transition state
    setCurrentTransition(effectiveTransition);
    setIsTransitioning(true);
    setTransitionProgress(0);
    
    // Call onStart callback
    if (effectiveTransition.onStart) {
      effectiveTransition.onStart();
    }
    
    // Build animation stages based on transition type
    const stages = [];
    
    // Add exit animation for previous state
    if (fromState) {
      const exitElements = getElements(fromState.exitElements);
      
      if (exitElements.length > 0) {
        const exitTransform = getTransformForType(type, direction, 'exit');
        const exitDuration = fromState.exitDuration || duration;
        
        if (stagger && exitElements.length > 1) {
          // Staggered exit animation
          stages.push({
            id: `exit-${fromState.id}`,
            type: 'stagger',
            targets: exitElements,
            from: { opacity: 1, transform: 'none' },
            to: { 
              opacity: 0, 
              transform: exitTransform
            },
            duration: exitDuration,
            easing,
            staggerDelay,
            staggerPattern,
            category
          });
        } else {
          // Synchronized exit animation
          stages.push({
            id: `exit-${fromState.id}`,
            type: 'style',
            targets: exitElements,
            from: { opacity: 1, transform: 'none' },
            to: { 
              opacity: 0, 
              transform: exitTransform
            },
            duration: exitDuration,
            easing,
            category
          });
        }
      }
    }
    
    // Add enter animation for new state
    if (toState) {
      const enterElements = getElements(toState.enterElements);
      
      if (enterElements.length > 0) {
        const enterTransform = getTransformForType(type, direction, 'enter');
        const enterDuration = toState.enterDuration || duration;
        
        if (stagger && enterElements.length > 1) {
          // Staggered enter animation
          stages.push({
            id: `enter-${toState.id}`,
            type: 'stagger',
            targets: enterElements,
            from: { 
              opacity: 0, 
              transform: enterTransform
            },
            to: { opacity: 1, transform: 'none' },
            duration: enterDuration,
            easing,
            staggerDelay,
            staggerPattern,
            dependsOn: [`exit-${fromState.id}`], // wait for exit animation
            category
          });
        } else {
          // Synchronized enter animation
          stages.push({
            id: `enter-${toState.id}`,
            type: 'style',
            targets: enterElements,
            from: { 
              opacity: 0, 
              transform: enterTransform
            },
            to: { opacity: 1, transform: 'none' },
            duration: enterDuration,
            easing,
            dependsOn: [`exit-${fromState.id}`], // wait for exit animation
            category
          });
        }
      }
    }
    
    // Add background animations if configured
    if (fromState.backgroundElements || toState.backgroundElements) {
      const backgroundElements = [
        ...getElements(fromState.backgroundElements || []),
        ...getElements(toState.backgroundElements || [])
      ];
      
      if (backgroundElements.length > 0) {
        stages.push({
          id: 'background-transition',
          type: 'style',
          targets: backgroundElements,
          from: { 
            filter: 'brightness(1)'
          },
          to: { 
            filter: 'brightness(1.2)'
          },
          duration: duration / 2,
          easing,
          category: AnimationCategory.BACKGROUND
        });
        
        stages.push({
          id: 'background-reset',
          type: 'style',
          targets: backgroundElements,
          from: { 
            filter: 'brightness(1.2)'
          },
          to: { 
            filter: 'brightness(1)'
          },
          duration: duration / 2,
          easing,
          dependsOn: ['background-transition'],
          category: AnimationCategory.BACKGROUND
        });
      }
    }
    
    // Add completion event
    stages.push({
      id: 'transition-complete',
      type: 'event',
      duration: 0,
      callback: () => {
        setIsTransitioning(false);
        setTransitionProgress(1);
        
        // Call onComplete callback
        if (effectiveTransition.onComplete) {
          effectiveTransition.onComplete();
        }
        
        // Set active state
        if (toState) {
          if (allowMultipleActiveStates) {
            // Add to active states, removing exclusive states if needed
            setActiveStateIds(current => {
              let newActiveStates = [...current];
              
              // If the target state is exclusive, remove all other states
              if (toState.exclusive) {
                newActiveStates = [toState.id];
              } else {
                // Remove exclusive states
                newActiveStates = newActiveStates.filter(id => {
                  const state = statesMap.current.get(id);
                  return state && !state.exclusive;
                });
                
                // Add the target state if not already present
                if (!newActiveStates.includes(toState.id)) {
                  newActiveStates.push(toState.id);
                }
              }
              
              return newActiveStates;
            });
          } else {
            // Single active state mode
            setActiveStateIds([toState.id]);
          }
        }
        
        // Reset current transition
        setCurrentTransition(null);
      }
    });
    
    // Add child transitions if any
    if (effectiveTransition.children?.length) {
      effectiveTransition.children.forEach((childTransition, index) => {
        // Clone the child transition with proper dependencies
        const childWithDeps = {
          ...childTransition,
          dependsOn: childTransition.parallel 
            ? [] // Parallel with parent
            : ['transition-complete'] // Sequential after parent
        };
        
        // Add child stages recursively
        // This is simplified - in a real implementation you'd handle this more thoroughly
        stages.push({
          id: `child-transition-${index}`,
          type: 'callback',
          duration: childTransition.duration || defaultDuration,
          dependsOn: childWithDeps.dependsOn,
          callback: (progress) => {
            // Simplified - in practice you'd build proper animation for the child
            if (progress === 0) {
              // Start child transition
              console.log(`Starting child transition ${index}`);
            }
          }
        });
      });
    }
    
    // Prepare and play the animation sequence
    animationSequence.updateStage = () => {}; // Clear existing stages
    stages.forEach(stage => {
      animationSequence.addStage(stage);
    });
    
    // Start the sequence
    animationSequence.play();
    
    // Listen to progress updates
    animationSequence.addCallback('onUpdate', (progress) => {
      setTransitionProgress(progress);
    });
    
  }, [
    animationSequence, 
    getElements, 
    defaultDuration, 
    defaultEasing, 
    allowMultipleActiveStates,
    prefersReducedMotion,
    isAnimationAllowed,
    category
  ]);
  
  /**
   * Get transform value based on transition type and direction
   */
  const getTransformForType = useCallback((
    type: TransitionType,
    direction: TransitionDirection,
    stage: 'enter' | 'exit'
  ): string => {
    const isEnter = stage === 'enter';
    const isExit = stage === 'exit';
    
    // Determine transform based on transition type and direction
    switch (type) {
      case TransitionType.SLIDE:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'translateX(-100%)' : 'translateX(100%)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'translateX(100%)' : 'translateX(-100%)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'translateY(-100%)' : 'translateY(100%)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'translateY(100%)' : 'translateY(-100%)';
          default:
            return isEnter ? 'translateX(-100%)' : 'translateX(100%)';
        }
        
      case TransitionType.ZOOM:
        if (direction === TransitionDirection.FROM_CENTER) {
          return isEnter ? 'scale(0.5)' : 'scale(1.5)';
        } else if (direction === TransitionDirection.TO_CENTER) {
          return isEnter ? 'scale(1.5)' : 'scale(0.5)';
        }
        return isEnter ? 'scale(0.5)' : 'scale(1.5)';
        
      case TransitionType.FLIP:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'rotateY(-90deg)' : 'rotateY(90deg)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'rotateY(90deg)' : 'rotateY(-90deg)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'rotateX(-90deg)' : 'rotateX(90deg)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'rotateX(90deg)' : 'rotateX(-90deg)';
          default:
            return isEnter ? 'rotateY(90deg)' : 'rotateY(-90deg)';
        }
        
      case TransitionType.FADE:
        return 'none'; // No transform, just opacity
        
      case TransitionType.DISSOLVE:
        return 'none'; // No transform, just opacity
      
      case TransitionType.SWIPE:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'translateX(-100%) rotate(-5deg)' : 'translateX(100%) rotate(5deg)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'translateX(100%) rotate(5deg)' : 'translateX(-100%) rotate(-5deg)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'translateY(-100%) rotate(-5deg)' : 'translateY(100%) rotate(5deg)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'translateY(100%) rotate(5deg)' : 'translateY(-100%) rotate(-5deg)';
          default:
            return isEnter ? 'translateX(-100%)' : 'translateX(100%)';
        }
        
      case TransitionType.FOLD:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'translateX(-100%) rotateY(90deg)' : 'translateX(100%) rotateY(90deg)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'translateX(100%) rotateY(-90deg)' : 'translateX(-100%) rotateY(-90deg)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'translateY(-100%) rotateX(90deg)' : 'translateY(100%) rotateX(90deg)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'translateY(100%) rotateX(-90deg)' : 'translateY(-100%) rotateX(-90deg)';
          default:
            return isEnter ? 'translateX(-100%) rotateY(90deg)' : 'translateX(100%) rotateY(90deg)';
        }
        
      case TransitionType.PUSH:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'translateX(-100%)' : 'translateX(100%)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'translateX(100%)' : 'translateX(-100%)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'translateY(-100%)' : 'translateY(100%)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'translateY(100%)' : 'translateY(-100%)';
          default:
            return isEnter ? 'translateX(-100%)' : 'translateX(100%)';
        }
        
      case TransitionType.COVER:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isExit ? 'none' : 'translateX(-100%)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isExit ? 'none' : 'translateX(100%)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isExit ? 'none' : 'translateY(-100%)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isExit ? 'none' : 'translateY(100%)';
          default:
            return isExit ? 'none' : 'translateX(-100%)';
        }
        
      default:
        return 'none';
    }
  }, []);
  
  /**
   * Transition to a new state
   */
  const transitionTo = useCallback((
    targetStateId: string,
    customTransition?: Partial<StateTransition>
  ) => {
    // Don't transition if already transitioning
    if (isTransitioning) {
      console.warn('Cannot transition while another transition is in progress');
      return;
    }
    
    // Get the target state
    const targetState = statesMap.current.get(targetStateId);
    if (!targetState) {
      console.warn(`State not found: ${targetStateId}`);
      return;
    }
    
    // Get current state ID (for now, use the first active state)
    const currentStateId = activeStateIds.length > 0 ? activeStateIds[0] : '';
    
    // Call state change callback
    if (onStateChange) {
      onStateChange(currentStateId, targetStateId);
    }
    
    // If no current state, just set the new state without animation
    if (!currentStateId) {
      setActiveStateIds([targetStateId]);
      return;
    }
    
    // Find the appropriate transition
    let transition = findTransition(currentStateId, targetStateId);
    
    // Use default transition if none found
    if (!transition) {
      if (!autoTransition) {
        // Skip animation if autoTransition is false
        setActiveStateIds([targetStateId]);
        return;
      }
      
      transition = createDefaultTransition(currentStateId, targetStateId);
    }
    
    // Apply custom transition properties if provided
    if (customTransition) {
      transition = { ...transition, ...customTransition };
    }
    
    // Create and play the transition animation
    createTransitionAnimation(transition);
  }, [
    isTransitioning, 
    activeStateIds, 
    findTransition, 
    createDefaultTransition, 
    createTransitionAnimation, 
    autoTransition,
    onStateChange
  ]);
  
  /**
   * Go to a state without animation
   */
  const goToState = useCallback((stateId: string) => {
    const state = statesMap.current.get(stateId);
    if (!state) {
      console.warn(`State not found: ${stateId}`);
      return;
    }
    
    // Get current state for callback
    const currentStateId = activeStateIds.length > 0 ? activeStateIds[0] : null;
    
    // Update active states
    if (allowMultipleActiveStates) {
      setActiveStateIds(current => {
        let newActiveStates = [...current];
        
        // If the state is exclusive, remove all other states
        if (state.exclusive) {
          newActiveStates = [stateId];
        } else {
          // Remove exclusive states
          newActiveStates = newActiveStates.filter(id => {
            const s = statesMap.current.get(id);
            return s && !s.exclusive;
          });
          
          // Add the state if not already present
          if (!newActiveStates.includes(stateId)) {
            newActiveStates.push(stateId);
          }
        }
        
        return newActiveStates;
      });
    } else {
      setActiveStateIds([stateId]);
    }
    
    // Call state change callback
    if (onStateChange) {
      onStateChange(currentStateId, stateId);
    }
  }, [activeStateIds, allowMultipleActiveStates, onStateChange]);
  
  /**
   * Play a transition without changing state
   */
  const playTransition = useCallback((transition: StateTransition) => {
    if (isTransitioning) {
      console.warn('Cannot play transition while another transition is in progress');
      return;
    }
    
    createTransitionAnimation(transition);
  }, [isTransitioning, createTransitionAnimation]);
  
  /**
   * Play animation for entering a state
   */
  const playEnterAnimation = useCallback((stateId: string) => {
    const state = statesMap.current.get(stateId);
    if (!state || !state.enterElements) {
      return;
    }
    
    const elements = getElements(state.enterElements);
    if (elements.length === 0) {
      return;
    }
    
    // Create a simple enter animation
    animationSequence.updateStage = () => {}; // Clear existing stages
    animationSequence.addStage({
      id: `enter-${stateId}`,
      type: 'style',
      targets: elements,
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'none' },
      duration: state.enterDuration || defaultDuration,
      easing: defaultEasing,
      category
    });
    
    animationSequence.play();
  }, [animationSequence, getElements, defaultDuration, defaultEasing, category]);
  
  /**
   * Play animation for exiting a state
   */
  const playExitAnimation = useCallback((stateId: string) => {
    const state = statesMap.current.get(stateId);
    if (!state || !state.exitElements) {
      return;
    }
    
    const elements = getElements(state.exitElements);
    if (elements.length === 0) {
      return;
    }
    
    // Create a simple exit animation
    animationSequence.updateStage = () => {}; // Clear existing stages
    animationSequence.addStage({
      id: `exit-${stateId}`,
      type: 'style',
      targets: elements,
      from: { opacity: 1, transform: 'none' },
      to: { opacity: 0, transform: 'translateY(20px)' },
      duration: state.exitDuration || defaultDuration,
      easing: defaultEasing,
      category
    });
    
    animationSequence.play();
  }, [animationSequence, getElements, defaultDuration, defaultEasing, category]);
  
  /**
   * Add a new state
   */
  const addState = useCallback((state: GameAnimationState) => {
    statesMap.current.set(state.id, state);
  }, []);
  
  /**
   * Remove a state
   */
  const removeState = useCallback((stateId: string) => {
    // Remove the state from active states if needed
    setActiveStateIds(current => current.filter(id => id !== stateId));
    
    // Remove the state from the map
    statesMap.current.delete(stateId);
    
    // Remove any transitions using this state
    const transitionsToRemove: string[] = [];
    
    transitionsMap.current.forEach((_, key) => {
      const [fromId, toId] = key.split(':');
      if (fromId === stateId || toId === stateId) {
        transitionsToRemove.push(key);
      }
    });
    
    transitionsToRemove.forEach(key => {
      transitionsMap.current.delete(key);
    });
  }, []);
  
  /**
   * Add a new transition
   */
  const addTransition = useCallback((transition: StateTransition) => {
    const key = `${transition.from}:${transition.to}`;
    transitionsMap.current.set(key, transition);
  }, []);
  
  /**
   * Remove a transition
   */
  const removeTransition = useCallback((fromId: string, toId: string) => {
    const key = `${fromId}:${toId}`;
    transitionsMap.current.delete(key);
  }, []);
  
  /**
   * Pause current transition
   */
  const pauseTransition = useCallback(() => {
    if (isTransitioning) {
      animationSequence.pause();
    }
  }, [isTransitioning, animationSequence]);
  
  /**
   * Resume current transition
   */
  const resumeTransition = useCallback(() => {
    if (isTransitioning) {
      animationSequence.play();
    }
  }, [isTransitioning, animationSequence]);
  
  /**
   * Complete current transition immediately
   */
  const completeTransition = useCallback(() => {
    if (isTransitioning) {
      animationSequence.seekProgress(1);
    }
  }, [isTransitioning, animationSequence]);
  
  /**
   * Cancel current transition
   */
  const cancelTransition = useCallback(() => {
    if (isTransitioning) {
      animationSequence.stop();
      setIsTransitioning(false);
      setCurrentTransition(null);
    }
  }, [isTransitioning, animationSequence]);
  
  /**
   * Get a state by ID
   */
  const getState = useCallback((stateId: string): GameAnimationState | undefined => {
    return statesMap.current.get(stateId);
  }, []);
  
  /**
   * Check if a state is active
   */
  const isStateActive = useCallback((stateId: string): boolean => {
    return activeStateIds.includes(stateId);
  }, [activeStateIds]);
  
  return {
    activeStates,
    currentTransition,
    isTransitioning,
    transitionProgress,
    goToState,
    transitionTo,
    playTransition,
    playEnterAnimation,
    playExitAnimation,
    addState,
    removeState,
    addTransition,
    removeTransition,
    pauseTransition,
    resumeTransition,
    completeTransition,
    cancelTransition,
    getState,
    isStateActive,
    reducedMotion: prefersReducedMotion
  };
}

export default useGameAnimation;