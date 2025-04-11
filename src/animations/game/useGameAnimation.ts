/**
 * useGameAnimation.ts
 * 
 * A hook for managing animations based on application/game state transitions,
 * creating cohesive animation experiences when navigating between different 
 * states or scenes in an interactive application.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimationCategory, MotionSensitivityLevel } from '../accessibility/MotionSensitivity';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { useAnimationSequence } from '../orchestration';
import { getElementFromRef } from '../../utils/elementTypes';
import { getReducedMotionAlternative } from '../utils/accessibilityUtils';
import {
  AnimationTarget, PlaybackState, TransitionType, StateTransition, 
  GameAnimationState, GameAnimationConfig, GameAnimationController,
  ElementReference, 
  TransitionDirection,
  StaggerPattern,
  PublicAnimationStage,
  AnimationSequenceResult
} from '../types';
import { Easings } from '../physics/interpolation';
import { useVectorSpring, VectorSpringHookResult } from '../physics/useVectorSpring';
import { SpringConfig } from '../physics/springPhysics';
// Import additional needed hooks
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
// Commented these out since they might not exist in the codebase yet
// import { useZSpaceAnimation } from '../dimensional/ZSpaceAnimation';
// import { use3DTransform } from '../dimensional/use3DTransform';

// Helper function to ensure value is an array
function toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
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

  }, [states, transitions, initialState]); // Add initialState dependency
  
  // Get active state objects
  const activeStates = useMemo(() => {
    // Now this should reliably find states in the map
    return activeStateIds
      .map(id => statesMap.current.get(id))
      .filter(Boolean) as GameAnimationState[];
  // Keep original dependency array, `states` added previously was also valid
  }, [activeStateIds, states]); 
  
  /**
   * Find transition between two states
   */
  const findTransition = useCallback((fromId: string, toId: string): StateTransition | null => {
    const possibleTransitions = transitionsMap.current.get(fromId);
    return possibleTransitions?.find(t => t.to === toId) || null;
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
    } as StateTransition;
  }, [defaultTransitionType, defaultDuration, defaultEasing, category]);
  
  /**
   * Get DOM elements from selector or reference
   */
  const getElements = useCallback((refs: ElementReference | ElementReference[] | undefined): HTMLElement[] => {
    if (!refs) return [];
    // Ensure input `refs` is always treated as an array internally
    const refArray = toArray(refs).flat(); 
    return refArray
        .map(ref => {
           if (typeof ref === 'string') { 
             const rootEl = typeof rootElement === 'string'
               ? document.querySelector(rootElement)
               : rootElement || document;
             return Array.from(rootEl?.querySelectorAll(ref) || []) as HTMLElement[];
           } else if (ref instanceof Element) { return [ref as HTMLElement]; }
           else if (ref && typeof ref === 'object' && 'current' in ref) { 
             const el = getElementFromRef(ref as React.RefObject<HTMLElement>);
             return el ? [el] : [];
           }
           else if (typeof ref === 'function') { 
             const el = ref(); 
             return el instanceof HTMLElement ? [el] : [];
           }
           return [];
         })
        .flat() 
        .filter((el): el is HTMLElement => el !== null);
  }, [rootElement]);
  
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
      
      // New 3D transition types
      case TransitionType.ROTATE_3D:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'perspective(1000px) rotateY(-90deg)' : 'perspective(1000px) rotateY(90deg)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'perspective(1000px) rotateY(90deg)' : 'perspective(1000px) rotateY(-90deg)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'perspective(1000px) rotateX(-90deg)' : 'perspective(1000px) rotateX(90deg)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'perspective(1000px) rotateX(90deg)' : 'perspective(1000px) rotateX(-90deg)';
          default:
            return isEnter ? 'perspective(1000px) rotate3d(1, 1, 0, 90deg)' : 'perspective(1000px) rotate3d(1, 1, 0, -90deg)';
        }
        
      case TransitionType.PUSH_3D:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'perspective(1000px) translateZ(-200px) translateX(-100%)' : 'perspective(1000px) translateZ(-200px) translateX(100%)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'perspective(1000px) translateZ(-200px) translateX(100%)' : 'perspective(1000px) translateZ(-200px) translateX(-100%)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'perspective(1000px) translateZ(-200px) translateY(-100%)' : 'perspective(1000px) translateZ(-200px) translateY(100%)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'perspective(1000px) translateZ(-200px) translateY(100%)' : 'perspective(1000px) translateZ(-200px) translateY(-100%)';
          default:
            return isEnter ? 'perspective(1000px) translateZ(-200px)' : 'perspective(1000px) translateZ(200px)';
        }
        
      case TransitionType.FLIP_3D:
        switch (direction) {
          case TransitionDirection.LEFT_TO_RIGHT:
            return isEnter ? 'perspective(1000px) rotateY(-180deg)' : 'perspective(1000px) rotateY(180deg)';
          case TransitionDirection.RIGHT_TO_LEFT:
            return isEnter ? 'perspective(1000px) rotateY(180deg)' : 'perspective(1000px) rotateY(-180deg)';
          case TransitionDirection.TOP_TO_BOTTOM:
            return isEnter ? 'perspective(1000px) rotateX(-180deg)' : 'perspective(1000px) rotateX(180deg)';
          case TransitionDirection.BOTTOM_TO_TOP:
            return isEnter ? 'perspective(1000px) rotateX(180deg)' : 'perspective(1000px) rotateX(-180deg)';
          default:
            return isEnter ? 'perspective(1000px) rotate3d(1, 1, 0, 180deg)' : 'perspective(1000px) rotate3d(1, 1, 0, -180deg)';
        }
        
      case TransitionType.FADE:
        return 'none'; // No transform, just opacity
        
      // Glass effect transitions don't use transforms
      case TransitionType.GLASS_BLUR:
      case TransitionType.GLASS_OPACITY:
      case TransitionType.GLASS_GLOW:
        return 'none';
        
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
      customSettings = {},
      physicsConfig = defaultPhysicsConfig,
      glassEffect,
      transform3D
    } = effectiveTransition;
    
    // Debug logging
    logDebug('Creating transition animation', { 
      from, to, type, direction, duration, 
      physicsConfig, glassEffect, transform3D 
    });
    
    // Get elements to animate
    const fromState = statesMap.current.get(Array.isArray(from) ? from[0] : from);
    const toState = statesMap.current.get(to);
    
    if (!fromState || !toState) {
      console.warn(`Invalid transition: ${from} -> ${to}`);
      return;
    }
    
    // Determine base elements (still defined early)
    const baseExitElements = toArray(effectiveTransition.elements ?? fromState?.exitElements ?? (fromState as any)?.elements);
    const baseEnterElements = toArray(effectiveTransition.elements ?? toState?.enterElements ?? (toState as any)?.elements);
    
    // Get actual DOM elements
    const exitElementNodes = getElements(baseExitElements);
    const enterElementNodes = getElements(baseEnterElements);
    const animationTargets = [...new Set([...exitElementNodes, ...enterElementNodes])];

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
    const stages: PublicAnimationStage[] = [];
    
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
                          
    // Process based on transition type
    if (isPhysicsTransition) {
      // For physics transitions, we'll use springs instead of regular animations
      logDebug('Using physics-based transition', { type, physicsConfig });
      
      // Note: The actual implementation would initialize springs and apply physics
      // This is just a placeholder for the concept
      if (exitElementNodes.length > 0 && fromState) {
        stages.push({
          id: `exit-${fromState.id}`,
          type: 'physics',
          targets: exitElementNodes,
          from: { opacity: 1, transform: 'none' },
          properties: { opacity: 0, transform: getTransformForType(type, direction, 'exit') },
          duration: fromState?.exitDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
          easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
          physics: physicsConfig,
          category: effectiveTransition.category ?? config.category
        });
      }
      
      if (enterElementNodes.length > 0 && toState) {
        stages.push({
          id: `enter-${toState.id}`,
          type: 'physics',
          targets: enterElementNodes,
          from: { opacity: 0, transform: getTransformForType(type, direction, 'enter') },
          properties: { opacity: 1, transform: 'none' },
          duration: toState?.enterDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
          easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
          dependsOn: [`exit-${fromState?.id}`],
          category: effectiveTransition.category ?? config.category
        });
      }
    } else if (isGlassTransition && glassEffect) {
      // For glass transitions, apply glass-specific properties
      logDebug('Using glass effect transition', { type, glassEffect });
      
      // Process glass blur transition
      if (type === TransitionType.GLASS_BLUR) {
        const blurValue = typeof glassEffect.blur === 'number' 
          ? `${glassEffect.blur}px` 
          : glassEffect.blur === 'minimal' ? '2px'
          : glassEffect.blur === 'light' ? '5px'
          : glassEffect.blur === 'medium' ? '10px'
          : glassEffect.blur === 'heavy' ? '20px'
          : '10px';
          
        if (exitElementNodes.length > 0 && fromState) {
          stages.push({
            id: `exit-${fromState.id}`,
            type: 'style',
            targets: exitElementNodes,
            from: { backdropFilter: 'blur(0px)' },
            properties: { backdropFilter: `blur(${blurValue})` },
            duration: fromState?.exitDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
            easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
            category: effectiveTransition.category ?? config.category
          });
        }
        
        if (enterElementNodes.length > 0 && toState) {
          stages.push({
            id: `enter-${toState.id}`,
            type: 'style',
            targets: enterElementNodes,
            from: { backdropFilter: `blur(${blurValue})` },
            properties: { backdropFilter: 'blur(0px)' },
            duration: toState?.enterDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
            easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
            dependsOn: [`exit-${fromState?.id}`],
            category: effectiveTransition.category ?? config.category
          });
        }
      } else if (type === TransitionType.GLASS_OPACITY) {
        const opacityValue = typeof glassEffect.opacity === 'number' ? glassEffect.opacity : 0.5;
        
        // Similar implementation for opacity
        // ...
      } else if (type === TransitionType.GLASS_GLOW) {
        const glowValue = typeof glassEffect.glow === 'number' 
          ? `${glassEffect.glow}px`
          : glassEffect.glow === 'subtle' ? '2px'
          : glassEffect.glow === 'standard' ? '5px'
          : glassEffect.glow === 'intense' ? '10px'
          : '5px';
          
        // Similar implementation for glow
        // ...
      }
    } else if (is3DTransition && transform3D) {
      // For 3D transitions, apply perspective and 3D transforms
      logDebug('Using 3D transform transition', { type, transform3D });
      
      // Note: The actual implementation would use proper 3D transforms
      // This is just a placeholder for the concept
      
      // Generate 3D transform based on properties
      const getCustom3DTransform = (isEntering: boolean) => {
        const perspective = transform3D.perspective || 1000;
        const rotateX = transform3D.rotateX || 0;
        const rotateY = transform3D.rotateY || 0;
        const rotateZ = transform3D.rotateZ || 0;
        const translateZ = transform3D.translateZ || 0;
        
        return `perspective(${perspective}px) rotateX(${isEntering ? -rotateX : rotateX}deg) rotateY(${isEntering ? -rotateY : rotateY}deg) rotateZ(${isEntering ? -rotateZ : rotateZ}deg) translateZ(${isEntering ? -translateZ : translateZ}px)`;
      };
      
      if (exitElementNodes.length > 0 && fromState) {
        stages.push({
          id: `exit-${fromState.id}`,
          type: 'style',
          targets: exitElementNodes,
          from: { 
            opacity: 1, 
            transform: 'none',
            transformOrigin: transform3D.origin || 'center'
          },
          properties: { 
            opacity: 0, 
            transform: transform3D ? getCustom3DTransform(false) : getTransformForType(type, direction, 'exit'),
            transformOrigin: transform3D.origin || 'center'
          },
          duration: fromState?.exitDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
          easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
          category: effectiveTransition.category ?? config.category
        });
      }
      
      if (enterElementNodes.length > 0 && toState) {
        stages.push({
          id: `enter-${toState.id}`,
          type: 'style',
          targets: enterElementNodes,
          from: { 
            opacity: 0, 
            transform: transform3D ? getCustom3DTransform(true) : getTransformForType(type, direction, 'enter'),
            transformOrigin: transform3D.origin || 'center' 
          },
          properties: { 
            opacity: 1, 
            transform: 'none',
            transformOrigin: transform3D.origin || 'center'
          },
          duration: toState?.enterDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400,
          easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
          dependsOn: [`exit-${fromState?.id}`],
          category: effectiveTransition.category ?? config.category
        });
      }
    } else {
      // Standard transition (existing code)
      // Add exit animation for previous state
      if (exitElementNodes.length > 0 && fromState) {
        // Fix 2: Re-declare variable for scope test
        const exitElements = exitElementNodes; 
        const exitTransform = getTransformForType(type, direction, 'exit');
        const exitDuration = fromState?.exitDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400;
        const exitEasing = effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic';
        if (effectiveTransition.stagger && exitElements.length > 1) {
            // Use the re-declared exitElements here
            stages.push({
                id: `exit-${fromState.id}`,
                type: 'stagger',
                targets: exitElements,
                from: { opacity: 1, transform: 'none' },
                properties: { opacity: 0, transform: exitTransform },
                duration: exitDuration,
                easing: exitEasing,
                staggerDelay,
                staggerPattern,
                category: effectiveTransition.category ?? config.category
            });
        } else {
             // Use the re-declared exitElements here
            stages.push({
                id: `exit-${fromState.id}`,
                type: 'style',
                targets: exitElements,
                from: { opacity: 1, transform: 'none' },
                properties: { opacity: 0, transform: exitTransform },
                duration: exitDuration,
                easing: exitEasing,
                category: effectiveTransition.category ?? config.category
            });
        }
      }
      
      // Add enter animation for new state
      if (enterElementNodes.length > 0 && toState) {
        // Fix 2: Re-declare variable for scope test
        const enterElements = enterElementNodes; 
        const enterTransform = getTransformForType(type, direction, 'enter');
        const enterDuration = toState?.enterDuration ?? effectiveTransition.duration ?? config.defaultDuration ?? 400;
        const enterEasing = effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic';
        if (effectiveTransition.stagger && enterElements.length > 1) {
            // Use the re-declared enterElements here
            stages.push({
                id: `enter-${toState.id}`,
                type: 'stagger',
                targets: enterElements,
                from: { 
                  opacity: 0, 
                  transform: enterTransform
                },
                properties: { opacity: 1, transform: 'none' },
                duration: enterDuration,
                easing: enterEasing,
                staggerDelay,
                staggerPattern,
                dependsOn: [`exit-${fromState?.id}`], // wait for exit animation
                category: effectiveTransition.category ?? config.category
            });
        } else {
            // Use the re-declared enterElements here
            stages.push({
                id: `enter-${toState.id}`,
                type: 'style',
                targets: enterElements,
                from: { 
                  opacity: 0, 
                  transform: enterTransform
                },
                properties: { opacity: 1, transform: 'none' },
                duration: enterDuration,
                easing: enterEasing,
                dependsOn: [`exit-${fromState?.id}`], // wait for exit animation
                category: effectiveTransition.category ?? config.category
            });
        }
      }
    }
    
    // Add background animations if configured
    if (fromState?.backgroundElements || toState?.backgroundElements) {
        const backgroundExitElements = getElements(toArray(fromState?.backgroundElements || []));
        const backgroundEnterElements = getElements(toArray(toState?.backgroundElements || []));
        const backgroundElements = [...new Set([...backgroundExitElements, ...backgroundEnterElements])];
        
        if (backgroundElements.length > 0) {
            stages.push({
                id: 'background-transition',
                type: 'style',
                targets: backgroundElements,
                from: { filter: 'brightness(1)' },
                // Fix 3: Ensure 'properties' is used
                properties: { filter: 'brightness(1.2)' }, 
                duration: (effectiveTransition.duration ?? config.defaultDuration ?? 400) / 2,
                easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
                category: AnimationCategory.BACKGROUND
            });
            
            stages.push({
                id: 'background-reset',
                type: 'style',
                targets: backgroundElements,
                from: { filter: 'brightness(1.2)' },
                 // Fix 3: Ensure 'properties' is used
                properties: { filter: 'brightness(1)' }, 
                duration: (effectiveTransition.duration ?? config.defaultDuration ?? 400) / 2,
                easing: effectiveTransition.easing ?? config.defaultEasing ?? 'easeInOutCubic',
                dependsOn: ['background-transition'],
                category: AnimationCategory.BACKGROUND
            });
        }
    }
    
    // Add completion event stage WITH STATE UPDATES
    stages.push({ 
        id: 'transition-complete', type: 'event', duration: 0, 
        dependsOn: [
            ...(exitElementNodes.length > 0 && fromState?.id ? [`exit-${fromState.id}`] : []),
            ...(enterElementNodes.length > 0 && toState?.id ? [`enter-${toState.id}`] : []),
            ...(stages.some(s => s.id === 'background-reset') ? ['background-reset'] : [])
        ].filter(Boolean),
        callback: () => {
            logDebug('transition-complete event callback triggered - updating state');
            setIsTransitioning(false);
            setTransitionProgress(1);
            
            if (effectiveTransition.onComplete) {
                effectiveTransition.onComplete();
            }
            
            // Set active state HERE
            if (toState) {
                if (allowMultipleActiveStates) {
                    setActiveStateIds(current => {
                        let newActiveStates = [...current];
                        if (toState.exclusive) {
                            newActiveStates = [toState.id];
                        } else {
                            newActiveStates = newActiveStates.filter(id => {
                                const s = statesMap.current.get(id);
                                return s && !s.exclusive;
                            });
                            if (!newActiveStates.includes(toState.id)) {
                                newActiveStates.push(toState.id);
                            }
                        }
                        return newActiveStates;
                    });
                } else {
                    setActiveStateIds([toState.id]);
                }
                // Call external state change handler AFTER internal state is updated
                if (onStateChange) { onStateChange(fromState?.id || null, toState.id); }
            } else {
                 logDebug('transition-complete: toState is null/undefined, resetting active states');
                 setActiveStateIds([]); 
                 if (onStateChange) { onStateChange(fromState?.id || null, null); }
            }
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
    
    // Add gesture physics integration if configured
    if (effectiveTransition.gesturePhysics?.enabled) {
      const { gesturePhysics } = effectiveTransition;
      const interactionType = gesturePhysics.interactionType || 'drag';
      const springBack = gesturePhysics.springBack !== false; // Default to true
      const boundsCheck = gesturePhysics.boundsCheck !== false; // Default to true
      
      logDebug('Adding gesture physics integration', { 
        interactionType, 
        springBack,
        boundsCheck
      });
      
      // Get elements for interaction
      const interactionElements = [...animationTargets];
      
      if (interactionElements.length > 0) {
        // Initialize listeners and handlers for each element
        interactionElements.forEach(element => {
          // Store original element position for potential spring back
          const rect = element.getBoundingClientRect();
          const originalPosition = { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          };
          
          // Set initial attributes to enable physics transitions
          element.setAttribute('data-physics-enabled', 'true');
          element.setAttribute('data-interaction-type', interactionType);
          element.setAttribute('data-spring-back', String(springBack));
          
          // Store initial transform for reference
          const initialTransform = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            ...transform3D && {
              rotateX: transform3D.rotateX || 0,
              rotateY: transform3D.rotateY || 0,
              rotateZ: transform3D.rotateZ || 0,
              translateZ: transform3D.translateZ || 0
            }
          };
          
          // Store in data attribute for reference
          element.setAttribute('data-initial-transform', JSON.stringify(initialTransform));
          
          // Add gesture event listeners for the specified interaction type
          if (interactionType === 'drag') {
            // Use passive: false to allow preventDefault() if needed
            element.addEventListener('pointerdown', handlePointerDown, { passive: false });
          } else if (interactionType === 'swipe') {
            element.addEventListener('pointerdown', handlePointerDown, { passive: false });
          } else if (interactionType === 'pinch') {
            // For pinch, we need to track two pointers
            element.addEventListener('touchstart', handleTouchStart, { passive: false });
          } else if (interactionType === 'rotate') {
            // For rotate, also track two pointers
            element.addEventListener('touchstart', handleTouchStart, { passive: false });
          }
          
          // Add to cleanup tasks for later removal
          const cleanup = () => {
            element.removeAttribute('data-physics-enabled');
            element.removeAttribute('data-interaction-type');
            element.removeAttribute('data-spring-back');
            element.removeAttribute('data-initial-transform');
            
            // Remove event listeners
            element.removeEventListener('pointerdown', handlePointerDown);
            element.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          // Add to transition cleanup tasks
          const completeStage = stages.find(s => s.id === 'transition-complete') as any;
          const originalCallback = completeStage?.callback;
          if (completeStage && typeof originalCallback === 'function') {
            completeStage.callback = () => {
              cleanup();
              originalCallback();
            };
          }
        });
      }
    }
    
    // Prepare and play the animation sequence
    animationSequence.reset(); 
    stages.forEach(stage => { animationSequence.addStage(stage as any); });
    
    // Add callbacks (keep simple listeners)
    animationSequence.removeCallback('onUpdate', setTransitionProgress); // Use direct setter
    animationSequence.addCallback('onUpdate', setTransitionProgress);

    // Start the sequence
    animationSequence.play();
  }, [
    statesMap,
    activeStateIds, 
    allowMultipleActiveStates,
    onStateChange,
    logDebug,
    animationSequence, 
    getElements, 
    defaultDuration, 
    defaultEasing, 
    prefersReducedMotion, 
    isAnimationAllowed,
    category,
    findTransition,
    createDefaultTransition,
    setCurrentTransition,
    setIsTransitioning,
    setTransitionProgress
  ]);
  
  // Gesture physics event handlers
  const handlePointerDown = useCallback((event: PointerEvent) => {
    const element = event.currentTarget as HTMLElement;
    if (!element || !element.hasAttribute('data-physics-enabled')) return;
    
    // Prevent default to avoid text selection during drag
    event.preventDefault();
    
    // Store initial pointer position and element position
    const initialPointer = { x: event.clientX, y: event.clientY };
    const rect = element.getBoundingClientRect();
    const initialPosition = { 
      x: rect.left + rect.width / 2, 
      y: rect.top + rect.height / 2 
    };
    
    // Store in element's dataset for later use
    element.dataset.initialPointerX = String(initialPointer.x);
    element.dataset.initialPointerY = String(initialPointer.y);
    element.dataset.initialPositionX = String(initialPosition.x);
    element.dataset.initialPositionY = String(initialPosition.y);
    
    // Add move and up listeners to document
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    // Add active state to element
    element.classList.add('physics-active');
    
    // Capture pointer to ensure it keeps tracking even outside the element
    element.setPointerCapture(event.pointerId);
    
    // Get interaction type
    const interactionType = element.getAttribute('data-interaction-type') || 'drag';
    
    // Additional setup for specific interaction types
    if (interactionType === 'swipe') {
      // For swipe, track velocity
      element.dataset.lastMoveTime = String(Date.now());
      element.dataset.velocityX = '0';
      element.dataset.velocityY = '0';
    }
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    // Find the active element that has our custom attribute
    const element = document.querySelector('[data-physics-enabled].physics-active') as HTMLElement;
    if (!element) return;
    
    // Get interaction type
    const interactionType = element.getAttribute('data-interaction-type') || 'drag';
    
    // Calculate delta from initial position
    const initialPointerX = parseFloat(element.dataset.initialPointerX || '0');
    const initialPointerY = parseFloat(element.dataset.initialPointerY || '0');
    const deltaX = event.clientX - initialPointerX;
    const deltaY = event.clientY - initialPointerY;
    
    // Apply transform based on interaction type
    if (interactionType === 'drag') {
      // For drag, just translate the element
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    } else if (interactionType === 'swipe') {
      // For swipe, calculate velocity
      const now = Date.now();
      const lastMoveTime = parseFloat(element.dataset.lastMoveTime || String(now));
      const timeDelta = now - lastMoveTime;
      
      if (timeDelta > 0) {
        const lastVelocityX = parseFloat(element.dataset.velocityX || '0');
        const lastVelocityY = parseFloat(element.dataset.velocityY || '0');
        
        // Calculate instant velocity and smooth it
        const instantVelocityX = deltaX / timeDelta;
        const instantVelocityY = deltaY / timeDelta;
        
        // Apply smoothing (80% previous, 20% new)
        const smoothedVelocityX = lastVelocityX * 0.8 + instantVelocityX * 0.2;
        const smoothedVelocityY = lastVelocityY * 0.8 + instantVelocityY * 0.2;
        
        // Store velocity for next calculation
        element.dataset.velocityX = String(smoothedVelocityX);
        element.dataset.velocityY = String(smoothedVelocityY);
        element.dataset.lastMoveTime = String(now);
      }
      
      // Apply transform
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    // Find the active element
    const element = document.querySelector('[data-physics-enabled].physics-active') as HTMLElement;
    if (!element) return;
    
    // Get interaction type and spring back setting
    const interactionType = element.getAttribute('data-interaction-type') || 'drag';
    const springBack = element.getAttribute('data-spring-back') !== 'false';
    
    // Clean up
    element.classList.remove('physics-active');
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Apply ending behavior based on interaction type
    if (interactionType === 'swipe') {
      // Get final velocity
      const velocityX = parseFloat(element.dataset.velocityX || '0');
      const velocityY = parseFloat(element.dataset.velocityY || '0');
      
      // If velocity is significant, apply inertia
      const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (velocityMagnitude > 0.05) {
        // Apply inertia animation
        applyInertia(element, velocityX, velocityY);
      } else if (springBack) {
        // Spring back to original position
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform = 'translate(0px, 0px)';
      }
    } else if (interactionType === 'drag' && springBack) {
      // Spring back to original position
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = 'translate(0px, 0px)';
    }
    
    // Clean up dataset
    delete element.dataset.initialPointerX;
    delete element.dataset.initialPointerY;
    delete element.dataset.initialPositionX;
    delete element.dataset.initialPositionY;
    delete element.dataset.lastMoveTime;
    delete element.dataset.velocityX;
    delete element.dataset.velocityY;
  }, []);

  // Touch handlers for pinch and rotate
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const element = event.currentTarget as HTMLElement;
    if (!element || !element.hasAttribute('data-physics-enabled')) return;
    
    // Need at least two touch points for pinch/rotate
    if (event.touches.length < 2) return;
    
    // Prevent default to avoid zooming/scrolling the page
    event.preventDefault();
    
    // Store initial touch points
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calculate initial distance and angle for pinch/rotate
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const initialDistance = Math.sqrt(dx * dx + dy * dy);
    const initialAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Store in element's dataset
    element.dataset.initialDistance = String(initialDistance);
    element.dataset.initialAngle = String(initialAngle);
    
    // Add move and end listeners
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Add active state
    element.classList.add('physics-active');
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Find the active element
    const element = document.querySelector('[data-physics-enabled].physics-active') as HTMLElement;
    if (!element) return;
    
    // Need at least two touch points
    if (event.touches.length < 2) return;
    
    // Prevent default
    event.preventDefault();
    
    // Get interaction type
    const interactionType = element.getAttribute('data-interaction-type') || 'pinch';
    
    // Get current touch points
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calculate current values
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Get initial values
    const initialDistance = parseFloat(element.dataset.initialDistance || '0');
    const initialAngle = parseFloat(element.dataset.initialAngle || '0');
    
    // Calculate scale and rotation changes
    const scale = initialDistance ? currentDistance / initialDistance : 1;
    const rotation = initialAngle ? currentAngle - initialAngle : 0;
    
    // Apply transform based on interaction type
    if (interactionType === 'pinch') {
      element.style.transform = `scale(${scale})`;
    } else if (interactionType === 'rotate') {
      element.style.transform = `rotate(${rotation}deg)`;
    }
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Find the active element
    const element = document.querySelector('[data-physics-enabled].physics-active') as HTMLElement;
    if (!element) return;
    
    // Get spring back setting
    const springBack = element.getAttribute('data-spring-back') !== 'false';
    
    // Clean up
    element.classList.remove('physics-active');
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Apply ending behavior - spring back if configured
    if (springBack) {
      element.style.transition = 'transform 0.3s ease-out';
      element.style.transform = 'none';
    }
    
    // Clean up dataset
    delete element.dataset.initialDistance;
    delete element.dataset.initialAngle;
  }, []);

  // Apply inertia animation using requestAnimationFrame
  const applyInertia = useCallback((element: HTMLElement, velocityX: number, velocityY: number) => {
    const startTime = Date.now();
    const friction = 0.95; // Friction coefficient
    let currentVelocityX = velocityX;
    let currentVelocityY = velocityY;
    let currentX = 0;
    let currentY = 0;
    
    // Get initial transform if any
    const transform = element.style.transform;
    if (transform && transform.startsWith('translate(')) {
      const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      if (match) {
        currentX = parseFloat(match[1]);
        currentY = parseFloat(match[2]);
      }
    }
    
    // Inertia animation function
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Update position based on velocity
      currentX += currentVelocityX * 16; // Assuming ~60fps, so 16ms per frame
      currentY += currentVelocityY * 16;
      
      // Apply friction to slow down
      currentVelocityX *= friction;
      currentVelocityY *= friction;
      
      // Apply updated transform
      element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      
      // Stop when velocity is near zero
      if (Math.abs(currentVelocityX) > 0.01 || Math.abs(currentVelocityY) > 0.01) {
        requestAnimationFrame(animate);
      } else {
        // Final spring back if needed
        const springBack = element.getAttribute('data-spring-back') !== 'false';
        if (springBack) {
          element.style.transition = 'transform 0.3s ease-out';
          element.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
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
      properties: { opacity: 1, transform: 'none' },
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
      properties: { opacity: 0, transform: 'translateY(20px)' },
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
    if (isTransitioning) {
      animationSequence.stop();
      setIsTransitioning(false);
      setCurrentTransition(null);
      setTransitionProgress(0); // Reset progress
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
  
  // Toggle debug mode
  const setDebug = useCallback((enabled: boolean) => {
    if (enabled) {
      console.log('[useGameAnimation] Debug mode enabled');
    }
    // Note: This doesn't update the original config.debug, 
    // but could be extended to use a state variable if needed
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