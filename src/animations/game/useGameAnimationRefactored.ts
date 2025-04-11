/**
 * Refactored Game Animation Hook
 * 
 * This is the refactored implementation of useGameAnimation that implements:
 * 1. Event emitter pattern for state transitions
 * 2. Middleware layer for transformation and logging
 * 3. Better error recovery for interrupted animations
 * 4. AbortController pattern for cleaner cancellation
 */

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { TransitionType, TransitionDirection, GameAnimationState, StateTransition, GameAnimationConfig, GameAnimationController as GameAnimationControllerInterface, AnimationSequenceResult, PlaybackState } from '../types';
import { useAnimationSequence } from '../orchestration';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory, MotionSensitivityLevel } from '../accessibility/MotionSensitivity';
import { GameAnimationController, GameAnimationOperation, GameAnimationOperationType } from './GameAnimationController';
import { GameAnimationEventEmitter, GameAnimationEventType } from './GameAnimationEventEmitter';

// Unique ID counter for animation operations
let operationIdCounter = 0;
function generateOperationId(): string {
  return `gameanimop-${++operationIdCounter}`;
}

// Unique ID counter for controllers
let controllerIdCounter = 0;
function generateControllerId(prefix: string = 'ga'): string {
  return `${prefix}-${++controllerIdCounter}`;
}

/**
 * Refactored hook for managing game/application state transitions with animations
 * 
 * @param config Game animation configuration
 * @returns Game animation controller interface
 */
export function useGameAnimation(config: GameAnimationConfig): GameAnimationControllerInterface {
  const {
    initialState,
    states,
    transitions,
    defaultTransitionType = TransitionType.FADE,
    defaultDuration = 400,
    defaultEasing = 'easeInOutCubic',
    defaultPhysicsConfig,
    autoTransition = true,
    allowMultipleActiveStates = false,
    rootElement,
    useWebAnimations = true,
    onStateChange,
    category = AnimationCategory.INTERACTION,
    motionSensitivity = MotionSensitivityLevel.MEDIUM,
    debug = false
  } = config;
  
  // Reduced motion detection
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  
  // Create a stable animation controller instance
  const controllerRef = useRef<GameAnimationController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new GameAnimationController(
      generateControllerId(initialState || 'gameanimation'),
      debug
    );
  }
  
  // Ensure debug flag is synced
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setDebug(debug);
    }
  }, [debug]);
  
  // Debug logging helper
  const logDebug = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[useGameAnimation] ${message}`, ...args);
    }
  }, [debug]);
  
  // --- Initialize statesMap synchronously --- 
  const statesMap = useRef(new Map<string, GameAnimationState>());
  // Populate map immediately based on initial config
  if (statesMap.current.size === 0 && states.length > 0) { // Only on first setup
     states.forEach(state => {
       statesMap.current.set(state.id, state);
     });
  }
  // --- End Sync Init ---

  // Track active states
  const [activeStateIds, setActiveStateIds] = useState<string[]>(
    // Ensure initial state exists in the map before setting
    initialState && statesMap.current.has(initialState) ? [initialState] : []
  );
  
  // Transition state
  const [currentTransition, setCurrentTransition] = useState<StateTransition | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  // Maps for efficient lookups
  const transitionsMap = useRef(new Map<string, StateTransition[]>());
  
  // Create animation sequence for coordinated transitions
  const animationSequence: AnimationSequenceResult = useAnimationSequence({
    id: 'game-animation-sequence',
    stages: [],
    autoplay: false,
    category: config.category ?? AnimationCategory.INTERACTION
  });
  
  // Event emitter reference
  const eventEmitterRef = useRef<GameAnimationEventEmitter | null>(null);
  
  // Initialize event emitter
  useEffect(() => {
    if (controllerRef.current) {
      eventEmitterRef.current = controllerRef.current.getEventEmitter();
      
      // Set up event listeners
      const stateChangeListener = (event: any) => {
        const data = event.data;
        if (data.newStateId && statesMap.current.has(data.newStateId)) {
          // Update active states based on the new state
          setActiveStateIds(currentStates => {
            if (allowMultipleActiveStates) {
              const newState = statesMap.current.get(data.newStateId);
              if (newState?.exclusive) {
                return [data.newStateId];
              } else {
                return [...currentStates.filter(id => {
                  const state = statesMap.current.get(id);
                  return state && !state.exclusive;
                }), data.newStateId];
              }
            } else {
              return [data.newStateId];
            }
          });
        }
      };
      
      const transitionStartListener = (event: any) => {
        setIsTransitioning(true);
        setTransitionProgress(0);
      };
      
      const transitionProgressListener = (event: any) => {
        setTransitionProgress(event.data.progress || 0);
      };
      
      const transitionCompleteListener = (event: any) => {
        setIsTransitioning(false);
        setTransitionProgress(1);
      };
      
      const transitionCancelListener = (event: any) => {
        setIsTransitioning(false);
        setTransitionProgress(0);
      };
      
      // Add event listeners
      eventEmitterRef.current.on(GameAnimationEventType.STATE_CHANGE, stateChangeListener);
      eventEmitterRef.current.on(GameAnimationEventType.TRANSITION_START, transitionStartListener);
      eventEmitterRef.current.on(GameAnimationEventType.TRANSITION_PROGRESS, transitionProgressListener);
      eventEmitterRef.current.on(GameAnimationEventType.TRANSITION_COMPLETE, transitionCompleteListener);
      eventEmitterRef.current.on(GameAnimationEventType.TRANSITION_CANCEL, transitionCancelListener);
      
      // Return cleanup function
      return () => {
        if (eventEmitterRef.current) {
          eventEmitterRef.current.removeEventListener(GameAnimationEventType.STATE_CHANGE, stateChangeListener);
          eventEmitterRef.current.removeEventListener(GameAnimationEventType.TRANSITION_START, transitionStartListener);
          eventEmitterRef.current.removeEventListener(GameAnimationEventType.TRANSITION_PROGRESS, transitionProgressListener);
          eventEmitterRef.current.removeEventListener(GameAnimationEventType.TRANSITION_COMPLETE, transitionCompleteListener);
          eventEmitterRef.current.removeEventListener(GameAnimationEventType.TRANSITION_CANCEL, transitionCancelListener);
        }
      };
    }
    
    return undefined;
  }, [allowMultipleActiveStates]);
  
  // Update maps when config changes (Keep effect for updates)
  useEffect(() => {
    const newStatesMap = new Map<string, GameAnimationState>();
    states.forEach(state => {
      newStatesMap.set(state.id, state);
    });
    statesMap.current = newStatesMap;
    
    const newTransitionsMap = new Map<string, StateTransition[]>();
    transitions.forEach(transition => {
      const fromIds = Array.isArray(transition.from) ? transition.from : [transition.from];
      fromIds.forEach(fromId => {
        const existing = newTransitionsMap.get(fromId) || [];
        newTransitionsMap.set(fromId, [...existing, transition]);
      });
    });
    transitionsMap.current = newTransitionsMap;

    // Re-validate initial state if states change
    if (initialState && !newStatesMap.has(initialState)) {
        console.warn(`useGameAnimation: Initial state "${initialState}" not found in provided states.`);
        setActiveStateIds([]);
    } else if (initialState && activeStateIds.length === 0) {
        // If initial state is now valid and active states were empty, set it.
        setActiveStateIds([initialState]);
    }

  }, [states, transitions, initialState]);
  
  // Get active state objects
  const activeStates = useMemo(() => {
    return activeStateIds
      .map(id => statesMap.current.get(id))
      .filter(Boolean) as GameAnimationState[];
  }, [activeStateIds]);
  
  /**
   * Find elements based on an element reference
   * @param elements Element reference to query
   * @returns Array of elements
   */
  const getElements = useCallback((elements: any): Element[] => {
    // Default to empty array
    if (!elements) {
      return [];
    }
    
    // Handle different types of element references
    if (typeof elements === 'string') {
      // Try to find elements relative to root element first
      const root = rootElement 
        ? (typeof rootElement === 'string' 
            ? document.querySelector(rootElement) 
            : rootElement) 
        : document;
        
      if (!root) {
        logDebug(`Root element not found: ${rootElement}`);
        return [];
      }
      
      // Query for elements
      const results = root.querySelectorAll(elements);
      // Filter NodeList to only include Element types
      return Array.from(results).filter((node): node is Element => node instanceof Element);
    } else if (elements instanceof Element) {
      return [elements];
    } else if (elements instanceof NodeList) {
      // Filter NodeList to only include Element types
      return Array.from(elements).filter((node): node is Element => node instanceof Element);
    } else if (Array.isArray(elements)) {
      return elements.filter(el => el instanceof Element) as Element[];
    } else if (typeof elements === 'function') {
      const result = elements();
      return result ? getElements(result) : [];
    } else if (elements && typeof elements === 'object' && 'current' in elements) {
      // React ref
      return elements.current ? [elements.current] : [];
    } else {
      logDebug(`Invalid element reference: ${elements}`);
      return [];
    }
  }, [rootElement, logDebug]);
  
  /**
   * Find a transition between two states
   * @param fromId Source state ID
   * @param toId Target state ID
   * @returns Transition object or null if not found
   */
  const findTransition = useCallback((fromId: string, toId: string): StateTransition | null => {
    const transitions = transitionsMap.current.get(fromId) || [];
    return transitions.find(t => t.to === toId) || null;
  }, []);
  
  /**
   * Create a default transition between two states
   * @param fromId Source state ID
   * @param toId Target state ID
   * @returns Default transition object
   */
  const createDefaultTransition = useCallback((fromId: string, toId: string): StateTransition => {
    return {
      from: fromId,
      to: toId,
      type: defaultTransitionType,
      duration: defaultDuration,
      easing: defaultEasing,
      category: category
    };
  }, [defaultTransitionType, defaultDuration, defaultEasing, category]);
  
  /**
   * Apply an animation class to elements
   * @param elements Elements to apply class to
   * @param className Class name to apply
   * @returns Function to remove the class
   */
  const applyClass = useCallback((elements: Element[], className: string): () => void => {
    // Apply class to all elements
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.classList.add(className);
      }
    });
    
    // Return cleanup function
    return () => {
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.classList.remove(className);
        }
      });
    };
  }, []);
  
  /**
   * Get all elements for a transition
   * @param fromState Source state
   * @param toState Target state
   * @param transition Transition configuration
   * @returns Object containing element arrays
   */
  const getTransitionElements = useCallback((
    fromState: GameAnimationState | undefined,
    toState: GameAnimationState | undefined,
    transition: StateTransition
  ) => {
    // Elements from transition
    const transitionElements = transition.elements 
      ? getElements(transition.elements)
      : [];
    
    // From state elements
    const fromElements = fromState?.exitElements
      ? getElements(fromState.exitElements)
      : fromState?.elements
        ? getElements(fromState.elements)
        : [];
    
    // To state elements
    const toElements = toState?.enterElements
      ? getElements(toState.enterElements)
      : toState?.elements
        ? getElements(toState.elements)
        : [];
    
    // Background elements
    const fromBgElements = fromState?.backgroundElements
      ? getElements(fromState.backgroundElements)
      : [];
    
    const toBgElements = toState?.backgroundElements
      ? getElements(toState.backgroundElements)
      : [];
    
    return {
      transitionElements,
      fromElements,
      toElements,
      fromBgElements,
      toBgElements
    };
  }, [getElements]);
  
  /**
   * Check if an element is interactable
   * @param element Element to check
   * @returns True if element is interactable
   */
  const isInteractable = useCallback((element: Element): boolean => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    
    const tagName = element.tagName.toLowerCase();
    return tagName === 'button' || 
           tagName === 'a' || 
           tagName === 'input' || 
           tagName === 'select' || 
           tagName === 'textarea' || 
           element.getAttribute('role') === 'button' ||
           element.hasAttribute('data-interactive');
  }, []);
  
  /**
   * Create a transition animation between states
   * Refactored to use the new event-based approach
   */
  const createTransitionAnimation = useCallback((
    transition: StateTransition
  ): AbortController | void => {
    // Extract from/to states from transition
    const from = Array.isArray(transition.from) ? transition.from[0] : transition.from;
    const to = transition.to;
    
    // Get state objects
    const fromState = statesMap.current.get(from);
    const toState = statesMap.current.get(to);
    
    if (!toState) {
      console.warn(`Target state not found: ${to}`);
      return;
    }
    
    // Get effective transition properties
    const effectiveTransition = {
      ...transition,
      duration: transition.duration || defaultDuration,
      easing: transition.easing || defaultEasing,
      direction: transition.direction || TransitionDirection.LEFT_TO_RIGHT,
      physicsConfig: transition.physicsConfig || defaultPhysicsConfig,
      category: transition.category || category
    };
    
    // Extract type and direction
    const { type, direction } = effectiveTransition;
    
    // Get all elements for the transition
    const { 
      transitionElements, 
      fromElements, 
      toElements, 
      fromBgElements, 
      toBgElements 
    } = getTransitionElements(fromState, toState, effectiveTransition);
    
    // All elements to animate
    const animationTargets = [
      ...transitionElements,
      ...fromElements,
      ...toElements
    ];
    
    // Check for interactive elements and make them unclickable during transition
    const interactionElements = animationTargets.filter(isInteractable);
    
    // Store original element properties for potential spring back
    interactionElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.dataset.originalPosition = element.style.transform || 'none';
        element.dataset.originalOpacity = element.style.opacity || '1';
        element.dataset.originalZIndex = element.style.zIndex || 'auto';
        element.style.pointerEvents = 'none';
      }
    });
    
    if (animationTargets.length === 0) {
      console.warn(`No elements to animate in transition: ${from} -> ${to}`);
      return;
    }
    
    // Register the operation with the controller
    const operationId = generateOperationId();
    const abortController = controllerRef.current!.registerOperation({
      id: operationId,
      type: GameAnimationOperationType.TRANSITION,
      fromStateId: from,
      toStateId: to,
      timeout: effectiveTransition.duration ? effectiveTransition.duration * 1.5 : undefined,
      metadata: {
        transition: effectiveTransition,
        fromState,
        toState
      },
      onComplete: () => {
        // Set active state
        if (controllerRef.current && eventEmitterRef.current) {
          eventEmitterRef.current.emitAfterStateChange({
            previousStateId: from,
            newStateId: to,
            previousState: fromState,
            newState: toState,
            transition: effectiveTransition,
            timestamp: performance.now()
          });
          
          // Call onStateChange callback
          if (onStateChange) {
            onStateChange(from, to);
          }
          
          // Restore element interaction
          interactionElements.forEach(element => {
            if (element instanceof HTMLElement) {
              element.style.pointerEvents = '';
            }
          });
        }
      },
      onError: (error) => {
        console.error(`Transition error: ${from} -> ${to}`, error);
        
        // Restore elements to their original state
        interactionElements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = '';
            
            // Restore original properties
            if (element.dataset.originalPosition) {
              element.style.transition = 'transform 0.3s ease-out';
              element.style.transform = element.dataset.originalPosition;
            }
            
            if (element.dataset.originalOpacity) {
              element.style.transition = 'opacity 0.3s ease-out';
              element.style.opacity = element.dataset.originalOpacity;
            }
            
            if (element.dataset.originalZIndex) {
              element.style.zIndex = element.dataset.originalZIndex;
            }
          }
        });
      }
    });
    
    // Set current transition
    setCurrentTransition(effectiveTransition);
    
    // Add class to root element to indicate transition
    const rootEl = rootElement 
      ? (typeof rootElement === 'string' 
          ? document.querySelector(rootElement) 
          : rootElement) 
      : document.body;
          
    if (rootEl instanceof HTMLElement) {
      rootEl.classList.add('game-animating');
      rootEl.dataset.transitionFrom = from;
      rootEl.dataset.transitionTo = to;
    }
    
    // Emit state before change event
    if (eventEmitterRef.current) {
      eventEmitterRef.current.emitBeforeStateChange({
        previousStateId: from,
        newStateId: to,
        previousState: fromState,
        newState: toState,
        transition: effectiveTransition,
        timestamp: performance.now()
      });
    }
    
    // Call onStart callback
    if (effectiveTransition.onStart) {
      effectiveTransition.onStart();
    }
    
    // Build animation stages based on transition type
    const stages = [];
    
    // Check if we're using a physics-based transition
    const isPhysicsTransition = type === TransitionType.PHYSICS_FADE || 
                              type === TransitionType.PHYSICS_SLIDE || 
                              type === TransitionType.PHYSICS_ZOOM || 
                              type === TransitionType.PHYSICS_FLIP;
                              
    // Check if we're using a glass effect transition
    const isGlassTransition = type === TransitionType.GLASS_BLUR || 
                            type === TransitionType.GLASS_OPACITY || 
                            type === TransitionType.GLASS_GLOW;
                            
    // Check if we're using a 3D transition
    const is3DTransition = type === TransitionType.ROTATE_3D || 
                          type === TransitionType.PUSH_3D || 
                          type === TransitionType.FLIP_3D;
    
    // Use reduced motion alternative if preferred
    if (prefersReducedMotion && !isAnimationAllowed(effectiveTransition.category)) {
      // Simple fade for reduced motion
      stages.push({
        id: `exit-${from}`,
        type: 'style',
        targets: fromElements,
        properties: { opacity: 0 },
        duration: effectiveTransition.duration / 2,
        easing: 'easeInOutQuad',
        category
      });
      
      stages.push({
        id: `enter-${to}`,
        type: 'style',
        targets: toElements,
        from: { opacity: 0 },
        properties: { opacity: 1 },
        duration: effectiveTransition.duration / 2,
        easing: 'easeInOutQuad',
        category,
        onComplete: () => {
          // Emit state change event
          if (eventEmitterRef.current) {
            eventEmitterRef.current.emitStateChange({
              previousStateId: from,
              newStateId: to,
              previousState: fromState,
              newState: toState,
              transition: effectiveTransition,
              timestamp: performance.now()
            });
          }
          
          // Update active state
          setActiveStateIds(allowMultipleActiveStates ? 
            [...activeStateIds.filter(id => id !== from), to] : 
            [to]
          );
        }
      });
    } else {
      // Full animation based on transition type
      let exitProps: Record<string, any> = {};
      let enterProps: Record<string, any> = {};
      let exitFrom: Record<string, any> = {};
      let enterFrom: Record<string, any> = {};
      
      // Determine properties based on transition type
      switch (type) {
        case TransitionType.FADE:
          exitProps = { opacity: 0 };
          enterFrom = { opacity: 0 };
          enterProps = { opacity: 1 };
          break;
          
        case TransitionType.SLIDE:
          // Determine slide direction
          let slideOut = '';
          let slideIn = '';
          
          switch (direction) {
            case TransitionDirection.LEFT_TO_RIGHT:
              slideOut = 'translateX(100%)';
              slideIn = 'translateX(-100%)';
              break;
            case TransitionDirection.RIGHT_TO_LEFT:
              slideOut = 'translateX(-100%)';
              slideIn = 'translateX(100%)';
              break;
            case TransitionDirection.TOP_TO_BOTTOM:
              slideOut = 'translateY(100%)';
              slideIn = 'translateY(-100%)';
              break;
            case TransitionDirection.BOTTOM_TO_TOP:
              slideOut = 'translateY(-100%)';
              slideIn = 'translateY(100%)';
              break;
            default:
              slideOut = 'translateX(-100%)';
              slideIn = 'translateX(100%)';
          }
          
          exitProps = { transform: slideOut, opacity: 0 };
          enterFrom = { transform: slideIn, opacity: 0 };
          enterProps = { transform: 'translateX(0)', opacity: 1 };
          break;
          
        // Add more cases for other transition types here...
        
        default:
          // Default to fade
          exitProps = { opacity: 0 };
          enterFrom = { opacity: 0 };
          enterProps = { opacity: 1 };
      }
      
      // Exit stage
      stages.push({
        id: `exit-${from}`,
        type: isPhysicsTransition ? 'physics' : 'style',
        targets: fromElements,
        from: exitFrom,
        properties: exitProps,
        duration: effectiveTransition.duration / 2,
        easing: effectiveTransition.easing,
        physics: isPhysicsTransition ? effectiveTransition.physicsConfig : undefined,
        category: effectiveTransition.category
      });
      
      // State change event stage
      stages.push({
        id: `state-change-${from}-to-${to}`,
        type: 'callback',
        duration: 0,
        category: effectiveTransition.category,
        callback: () => {
          // Emit state change event
          if (eventEmitterRef.current) {
            eventEmitterRef.current.emitStateChange({
              previousStateId: from,
              newStateId: to,
              previousState: fromState,
              newState: toState,
              transition: effectiveTransition,
              timestamp: performance.now()
            });
          }
          
          // Update active state
          setActiveStateIds(allowMultipleActiveStates ? 
            [...activeStateIds.filter(id => id !== from), to] : 
            [to]
          );
        }
      });
      
      // Enter stage
      stages.push({
        id: `enter-${to}`,
        type: isPhysicsTransition ? 'physics' : 'style',
        targets: toElements,
        from: enterFrom,
        properties: enterProps,
        duration: effectiveTransition.duration / 2,
        easing: effectiveTransition.easing,
        physics: isPhysicsTransition ? effectiveTransition.physicsConfig : undefined,
        category: effectiveTransition.category
      });
    }
    
    // Final cleanup stage
    stages.push({
      id: 'cleanup-transition',
      type: 'callback',
      duration: 0,
      category: effectiveTransition.category,
      callback: () => {
        // Call onComplete callback
        if (effectiveTransition.onComplete) {
          effectiveTransition.onComplete();
        }
        
        // Remove transition class from root element
        const rootEl = rootElement 
          ? (typeof rootElement === 'string' 
              ? document.querySelector(rootElement) 
              : rootElement) 
          : document.body;
              
        if (rootEl instanceof HTMLElement) {
          rootEl.classList.remove('game-animating');
          delete rootEl.dataset.transitionFrom;
          delete rootEl.dataset.transitionTo;
        }
        
        // Restore interactive elements
        interactionElements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = '';
          }
        });
      }
    });
    
    // Prepare and play the animation sequence
    animationSequence.reset(); 
    stages.forEach(stage => { animationSequence.addStage(stage as any); });
    
    // Connect sequence to the controller
    const cleanup = controllerRef.current!.connectSequence(operationId, animationSequence);
    
    // Start the sequence
    animationSequence.play();
    
    // Return the abort controller
    return abortController;
  }, [
    statesMap,
    activeStateIds, 
    allowMultipleActiveStates,
    onStateChange,
    logDebug,
    animationSequence, 
    getElements, 
    getTransitionElements,
    isInteractable,
    defaultDuration, 
    defaultEasing, 
    defaultPhysicsConfig,
    prefersReducedMotion, 
    isAnimationAllowed,
    category,
    rootElement
  ]);
  
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
    
    // If no current state, just set the new state without animation
    if (!currentStateId) {
      // Set active state directly
      if (eventEmitterRef.current) {
        eventEmitterRef.current.emitStateChange({
          previousStateId: null,
          newStateId: targetStateId,
          previousState: null,
          newState: targetState,
          timestamp: performance.now()
        });
      }
      
      setActiveStateIds([targetStateId]);
      
      // Call state change callback
      if (onStateChange) {
        onStateChange(null, targetStateId);
      }
      
      return;
    }
    
    // Find the appropriate transition
    let transition = findTransition(currentStateId, targetStateId);
    
    // Use default transition if none found
    if (!transition) {
      if (!autoTransition) {
        // Skip animation if autoTransition is false
        // Set active state directly
        if (eventEmitterRef.current) {
          eventEmitterRef.current.emitStateChange({
            previousStateId: currentStateId,
            newStateId: targetStateId,
            previousState: statesMap.current.get(currentStateId) || null,
            newState: targetState,
            timestamp: performance.now()
          });
        }
        
        setActiveStateIds([targetStateId]);
        
        // Call state change callback
        if (onStateChange) {
          onStateChange(currentStateId, targetStateId);
        }
        
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
    
    // Emit state change event
    if (eventEmitterRef.current) {
      eventEmitterRef.current.emitStateChange({
        previousStateId: currentStateId,
        newStateId: stateId,
        previousState: currentStateId ? statesMap.current.get(currentStateId) : null,
        newState: state,
        timestamp: performance.now()
      });
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
    
    // Register the operation with the controller
    const operationId = generateOperationId();
    const abortController = controllerRef.current!.registerOperation({
      id: operationId,
      type: GameAnimationOperationType.ENTER,
      toStateId: stateId,
      timeout: state.enterDuration ? state.enterDuration * 1.5 : undefined,
      metadata: { state }
    });
    
    // Create a simple enter animation
    animationSequence.reset();
    animationSequence.addStage({
      id: `enter-${stateId}`,
      type: 'style',
      targets: elements,
      from: { opacity: 0, transform: 'translateY(20px)' },
      properties: { opacity: 1, transform: 'none' },
      duration: state.enterDuration || defaultDuration,
      easing: defaultEasing,
      category
    });
    
    // Connect sequence to the controller
    const cleanup = controllerRef.current!.connectSequence(operationId, animationSequence);
    
    // Start the sequence
    animationSequence.play();
    
    // Return the abort controller
    return abortController;
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
    
    // Register the operation with the controller
    const operationId = generateOperationId();
    const abortController = controllerRef.current!.registerOperation({
      id: operationId,
      type: GameAnimationOperationType.EXIT,
      fromStateId: stateId,
      timeout: state.exitDuration ? state.exitDuration * 1.5 : undefined,
      metadata: { state }
    });
    
    // Create a simple exit animation
    animationSequence.reset();
    animationSequence.addStage({
      id: `exit-${stateId}`,
      type: 'style',
      targets: elements,
      from: { opacity: 1, transform: 'none' },
      properties: { opacity: 0, transform: 'translateY(20px)' },
      duration: state.exitDuration || defaultDuration,
      easing: defaultEasing,
      category
    });
    
    // Connect sequence to the controller
    const cleanup = controllerRef.current!.connectSequence(operationId, animationSequence);
    
    // Start the sequence
    animationSequence.play();
    
    // Return the abort controller
    return abortController;
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
  }, []);
  
  /**
   * Add a new transition
   */
  const addTransition = useCallback((transition: StateTransition) => {
    const fromIds = Array.isArray(transition.from) ? transition.from : [transition.from];
    fromIds.forEach(fromId => {
      const existing = transitionsMap.current.get(fromId) || [];
      // Avoid adding duplicates
      if (!existing.some(t => t.to === transition.to && t.type === transition.type)) {
        transitionsMap.current.set(fromId, [...existing, transition]);
      }
    });
  }, []);
  
  /**
   * Remove a transition
   */
  const removeTransition = useCallback((fromId: string, toId: string) => {
    const existing = transitionsMap.current.get(fromId);
    if (existing) {
      transitionsMap.current.set(fromId, existing.filter(t => t.to !== toId));
    }
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
    if (isTransitioning && controllerRef.current) {
      // Find active transition operations
      const operations = Array.from(
        document.querySelectorAll('.game-animating[data-transition-from][data-transition-to]')
      ).filter(node => node instanceof HTMLElement) as HTMLElement[];
      
      if (operations.length > 0) {
        // Reset all transition states
        operations.forEach(element => {
          element.classList.remove('game-animating');
          delete element.dataset.transitionFrom;
          delete element.dataset.transitionTo;
        });
      }
      
      // Stop animation sequence
      animationSequence.stop();
      setIsTransitioning(false);
      setCurrentTransition(null);
      setTransitionProgress(0);
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
  
  /**
   * Set debug mode
   */
  const setDebug = useCallback((enabled: boolean) => {
    if (controllerRef.current) {
      controllerRef.current.setDebug(enabled);
    }
    
    if (enabled) {
      console.log('[useGameAnimation] Debug mode enabled');
    }
  }, []);
  
  // Clean up controller on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.cleanup();
      }
    };
  }, []);
  
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
    reducedMotion: prefersReducedMotion,
    // Add new properties for enhanced functionality
    motionSensitivity,
    debug,
    setDebug
  };
} 