/**
 * useAnimationSequence.ts
 * 
 * A hook for creating and managing coordinated sequences of animations with
 * precise timing and dependency control. This enables complex animation
 * choreography where animations can be ordered, grouped, staggered, and 
 * made dependent on one another.
 */

import { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import { Easings, InterpolationFunction, EasingFunction } from '../physics/interpolation';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';

// --- ADD Imports for types moved to types.ts ---
import { 
  PlaybackDirection, StaggerPattern, TimingRelationship, PlaybackState,
  SequenceIdCallback, ProgressCallback, AnimationIdCallback, InternalCallback,
  GenericEasingFunctionFactory, EasingDefinitionType,
  SequenceLifecycle,
  BaseAnimationStage, StyleAnimationStage, CallbackAnimationStage, EventAnimationStage, GroupAnimationStage, StaggerAnimationStage, AnimationStage,
  ConfigCallback,
  // Add imports for the public types
  PublicAnimationStage, PublicStyleAnimationStage, PublicCallbackAnimationStage, 
  PublicEventAnimationStage, PublicGroupAnimationStage, PublicStaggerAnimationStage
} from '../types';
// --- END Added Imports ---

// --- REMOVE Local Type Definitions & Enums (Moved to types.ts) --- 
/*
export enum PlaybackDirection { ... }
export enum StaggerPattern { ... }
export enum TimingRelationship { ... }
export enum PlaybackState { ... }

type SequenceIdCallback = ...;
type ProgressCallback = ...;
type AnimationIdCallback = ...;
type InternalCallback = ...;

type GenericEasingFunctionFactory = ...;
type EasingDefinitionType = ...;

export interface SequenceLifecycle { ... }
export interface BaseAnimationStage { ... }
export interface StyleAnimationStage extends BaseAnimationStage { ... }
export interface CallbackAnimationStage extends BaseAnimationStage { ... }
export interface EventAnimationStage extends BaseAnimationStage { ... }
export interface GroupAnimationStage extends BaseAnimationStage { ... }
export interface StaggerAnimationStage extends BaseAnimationStage { ... }
export type AnimationStage = ...;
*/
// --- END Removal --- 

// Keep interfaces specific to this hook's implementation/return value
export interface AnimationSequenceConfig extends SequenceLifecycle {
  id?: string; 
  stages: PublicAnimationStage[] | AnimationStage[]; // Accept both public and internal types
  duration?: number; 
  autoplay?: boolean; 
  loop?: boolean; // Added loop option
  repeatCount?: number; // Kept for explicit control, loop maps to repeatCount = -1
  yoyo?: boolean; 
  direction?: PlaybackDirection; 
  category?: AnimationCategory; 
  useWebAnimations?: boolean; 
  playbackRate?: number;
  onStageChange?: (activeStageId: string | null, sequenceId: string) => void; // Added stage change callback
}
interface DependencyResolution { order: string[]; parallelGroups: string[][]; }
interface StageTiming { id: string; startTime: number; endTime: number; duration: number; }
interface StageRuntime { id: string; stage: AnimationStage; progress: number; startTime: number; endTime: number; state: PlaybackState; animations: number[] | null; targets: HTMLElement[]; currentIteration: number; totalIterations: number; isReduced: boolean; }
export interface SequenceControls { 
  play: () => void; 
  pause: () => void; 
  stop: () => void; 
  reset: () => void; // Added reset control
  reverse: () => void; 
  restart: () => void; 
  seek: (time: number) => void; 
  seekProgress: (progress: number) => void; 
  seekLabel: (label: string) => void; 
  getProgress: () => number; 
  addStage: (stage: PublicAnimationStage) => void; 
  removeStage: (stageId: string) => void; 
  updateStage: (stageId: string, updates: Partial<PublicAnimationStage>) => void; 
  setPlaybackRate: (rate: number) => void; 
  getPlaybackState: () => PlaybackState; 
  addCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; 
  removeCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; 
}
export interface AnimationSequenceResult extends SequenceControls { 
  progress: number; 
  playbackState: PlaybackState; 
  currentStageId: string | null; // Added current stage ID
  duration: number; 
  direction: PlaybackDirection; 
  playbackRate: number; 
  reducedMotion: boolean; 
  stages: PublicAnimationStage[]; // Use PublicAnimationStage for the public API
  id: string; 
}

// Local placeholder for getEasingEntry
function getEasingEntry(definition: EasingDefinitionType): EasingFunction | InterpolationFunction | GenericEasingFunctionFactory | object | undefined {
  if (typeof definition === 'string' && definition in Easings) {
    return Easings[definition as keyof typeof Easings];
  }
  if (typeof definition === 'function') { return definition; }
  if (typeof definition === 'object' && definition !== null) { return definition; }
  return undefined;
}

// --- Utility Functions Implementation ---

// Basic dependency resolution (sequential order)
function resolveDependencies(stages: AnimationStage[]): DependencyResolution {
  const order = stages.map(s => s.id);
  // Simplistic: Treat all stages as one parallel group for basic timeline calc
  const parallelGroups = [order]; 
  return { order, parallelGroups };
}

// Basic timeline calculation (sequential based on order, considering delay)
function calculateTimeline(stages: AnimationStage[], resolution: DependencyResolution): StageTiming[] {
    let currentTime = 0;
    const timeline: StageTiming[] = [];
    // Use the simple order from resolveDependencies
    for (const stageId of resolution.order) {
        const stage = stages.find(s => s.id === stageId);
        if (stage) {
            const delay = stage.delay ?? 0;
            const duration = stage.duration ?? 0;
            const startTime = currentTime + delay;
            const endTime = startTime + duration;
            timeline.push({ id: stageId, startTime, endTime, duration });
            // For simple sequential, next stage starts after this one ends
            currentTime = endTime; 
        }
    }
    // TODO: Implement more complex timeline logic based on resolution.parallelGroups and stage.dependsOn
    return timeline;
}

// Basic stage runtime creation
function createStageRuntime(stage: AnimationStage, timing: StageTiming, isReduced: boolean): StageRuntime {
  return {
    id: stage.id,
    stage: stage,
    progress: 0,
    startTime: timing.startTime,
    endTime: timing.endTime,
    state: PlaybackState.IDLE,
    animations: null, // Initialize stagger delays later if needed
    targets: [], // Resolve targets later
    currentIteration: 0,
    totalIterations: stage.repeatCount === -1 ? Infinity : (stage.repeatCount ?? 0) + 1,
    isReduced: isReduced
  };
}

// Basic linear interpolation for common properties
function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

// Basic property interpolator (opacity, transform: translate, scale)
function createPropertyInterpolator(
    from: Record<string, unknown> | undefined, 
    to: Record<string, unknown>, 
    exclude?: string[]
): (progress: number) => Record<string, string> {
    // Default 'from' values if not provided
    const safeFrom = { 
        opacity: 1, 
        translateX: 0, translateY: 0, translateZ: 0, 
        scale: 1, scaleX: 1, scaleY: 1, scaleZ: 1,
        rotate: 0, rotateX: 0, rotateY: 0, rotateZ: 0,
        ...from 
    };
    
    // Extract known properties, provide defaults for 'to' if missing from 'from'
    const propsToInterpolate = Object.keys(to)
        .filter(key => !exclude?.includes(key))
        .map(key => {
            const fromValue = typeof safeFrom[key] === 'number' ? safeFrom[key] as number : undefined;
            const toValue = typeof to[key] === 'number' ? to[key] as number : undefined;
            // Only interpolate if both are numbers
            if (fromValue !== undefined && toValue !== undefined) {
                return { key, from: fromValue, to: toValue };
            }
            // Handle cases like 'transform' string directly (pass through)
            if (key === 'transform' && typeof to[key] === 'string') {
                 return { key, value: to[key] as string };
            }
             // Handle other non-numeric properties (pass through final value)
             if (fromValue === undefined || toValue === undefined) {
                return { key, value: String(to[key]) };
            }
            return null;
        })
        .filter(p => p !== null) as ({ key: string; from: number; to: number } | { key: string; value: string })[];

    return (progress: number) => {
        const currentStyles: Record<string, string> = {};
        let transformParts: string[] = [];

        propsToInterpolate.forEach(prop => {
             if ('value' in prop) {
                 // Pass through non-interpolated or string values
                 if (prop.key === 'transform') {
                     // If a full transform string is provided, use it (overrides individual parts)
                     transformParts = [prop.value]; 
                 } else {
                     currentStyles[prop.key] = prop.value;
                 }
             } else {
                 // Interpolate numeric values
                 const interpolatedValue = lerp(prop.from, prop.to, progress);
                 
                 // Handle specific properties
                 if (prop.key === 'opacity') {
                     currentStyles.opacity = String(interpolatedValue);
                 } else if (prop.key.startsWith('translate')) {
                     transformParts.push(`${prop.key}(${interpolatedValue}px)`);
                 } else if (prop.key.startsWith('scale')) {
                     transformParts.push(`${prop.key}(${interpolatedValue})`);
                 } else if (prop.key.startsWith('rotate')) {
                     transformParts.push(`${prop.key}(${interpolatedValue}deg)`);
                 } else {
                      // Generic number property (might not be style) - skip direct style setting
                     // Or could try setting as string: currentStyles[prop.key] = String(interpolatedValue); 
                 }
             }
        });
        
        // Combine transform parts if any were generated
        if (transformParts.length > 0 && !propsToInterpolate.some(p => 'value' in p && p.key === 'transform')) {
           currentStyles.transform = transformParts.join(' ');
        } else if (transformParts.length === 1 && propsToInterpolate.some(p => 'value' in p && p.key === 'transform')) {
            // Use the directly provided transform string
            currentStyles.transform = transformParts[0];
        }

        return currentStyles;
    };
}

// Basic style application using element.style
function applyStyles(target: HTMLElement, styles: Record<string, unknown>): void {
    if (!target || !target.style) return;
    try {
        Object.entries(styles).forEach(([key, value]) => {
            // Skip nullish values
            if (value === null || value === undefined) return; 
            
            // Basic camelCase to kebab-case for style properties 
            const styleKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
            
            // Ensure value is a string before setting
            const stringValue = String(value);

            // Use setProperty for broader compatibility, including CSS variables
            target.style.setProperty(styleKey, stringValue);
        });
    } catch (error) {
        console.error("Error applying styles:", error, { target, styles });
    }
}

// Basic sequential stagger delay creation
function createStaggerDelays(targets: unknown, delay: number): number[] { 
    const count = Array.isArray(targets) ? targets.length : (targets instanceof NodeList ? targets.length : 1);
    // Basic sequential stagger
    return Array.from({ length: count }, (_, i) => i * delay); 
    // TODO: Implement other StaggerPatterns (FROM_CENTER, RANDOM, etc.) based on stage.staggerPattern
}

// Basic reduced motion stage selection
function getStageWithReducedMotion(
    stage: AnimationStage, 
    prefersReduced: boolean, 
    isAllowed: (category?: AnimationCategory) => boolean
): { stage: AnimationStage, isReduced: boolean } {
    const categoryAllowed = isAllowed(stage.category);
    const reduceMotion = prefersReduced || !categoryAllowed;

    if (reduceMotion && stage.reducedMotionAlternative) {
        // Return the alternative, merging necessary base props like ID
        console.log(`Using reduced motion alternative for stage: ${stage.id}`);
        return { 
            stage: { 
                ...stage.reducedMotionAlternative, 
                id: stage.id, // Keep original ID
                // Ensure essential props from original are kept if missing in alternative
                duration: stage.reducedMotionAlternative.duration ?? 0, 
                type: (stage as any).type // Ensure type is present
                 // Add other potentially missing essential props
            } as AnimationStage, 
            isReduced: true 
        };
    }
    // Return original stage if no reduction needed or no alternative provided
    return { stage, isReduced: false };
}

// Add a utility function to convert PublicAnimationStage to internal AnimationStage
function convertToInternalStage(stage: PublicAnimationStage | AnimationStage): AnimationStage {
  // If it already has internal properties, assume it's an internal stage
  if ('order' in stage || 'position' in stage || 'elementType' in stage || 
      'group' in stage || 'dependencies' in stage || 'animation' in stage) {
    return stage as AnimationStage;
  }

  // Create the base properties that all stage types share
  const baseStage: Partial<BaseAnimationStage> = {
    id: stage.id,
    duration: stage.duration,
    delay: stage.delay,
    easing: stage.easing,
    easingArgs: stage.easingArgs,
    startTime: stage.startTime,
    direction: stage.direction,
    repeatCount: stage.repeatCount,
    repeatDelay: stage.repeatDelay,
    yoyo: stage.yoyo,
    dependsOn: stage.dependsOn,
    category: stage.category,
    onStart: stage.onStart,
    onUpdate: stage.onUpdate,
    onComplete: stage.onComplete
  };

  // Add the reducedMotionAlternative if it exists
  if (stage.reducedMotionAlternative) {
    baseStage.reducedMotionAlternative = stage.reducedMotionAlternative;
  }

  // Convert based on stage type
  switch (stage.type) {
    case 'style': {
      const publicStage = stage as PublicStyleAnimationStage;
      return {
        ...baseStage,
        type: 'style',
        targets: publicStage.targets,
        from: publicStage.from,
        properties: publicStage.properties,
        exclude: publicStage.exclude
      } as StyleAnimationStage;
    }
    case 'callback': {
      const publicStage = stage as PublicCallbackAnimationStage;
      return {
        ...baseStage,
        type: 'callback',
        callback: publicStage.callback
      } as CallbackAnimationStage;
    }
    case 'event': {
      const publicStage = stage as PublicEventAnimationStage;
      return {
        ...baseStage,
        type: 'event',
        callback: publicStage.callback,
        duration: 0 // Event stages always have duration 0
      } as EventAnimationStage;
    }
    case 'group': {
      const publicStage = stage as PublicGroupAnimationStage;
      // Recursively convert children
      const convertedChildren = publicStage.children.map(convertToInternalStage);
      return {
        ...baseStage,
        type: 'group',
        children: convertedChildren,
        relationship: publicStage.relationship,
        relationshipValue: publicStage.relationshipValue
      } as GroupAnimationStage;
    }
    case 'stagger': {
      const publicStage = stage as PublicStaggerAnimationStage;
      return {
        ...baseStage,
        type: 'stagger',
        targets: publicStage.targets,
        from: publicStage.from,
        properties: publicStage.properties,
        staggerDelay: publicStage.staggerDelay,
        staggerPattern: publicStage.staggerPattern,
        staggerPatternFn: publicStage.staggerPatternFn,
        staggerOverlap: publicStage.staggerOverlap
      } as StaggerAnimationStage;
    }
    default:
      // Default case (shouldn't happen with proper typing)
      console.warn(`Unknown stage type: ${(stage as any).type}`);
      return stage as AnimationStage;
  }
}

// Add a helper to convert the internal stages back to public stages for the result
function convertToPublicStages(stages: AnimationStage[]): PublicAnimationStage[] {
  return stages.map(stage => {
    // We don't need to fully convert back, since the public types are a subset
    // Just ensure we don't expose the internal-only properties
    const { order, position, elementType, group, dependencies, animation, ...publicProps } = stage;
    return publicProps as PublicAnimationStage;
  });
}

export function useAnimationSequence(config: AnimationSequenceConfig): AnimationSequenceResult {
  // Convert public stages to internal stages
  const internalStages = (config.stages || []).map(convertToInternalStage);
  
  const { 
    prefersReducedMotion, 
    isAnimationAllowed 
  } = useReducedMotion();
  
  const sequenceId = config.id || `sequence-${Date.now()}`;
  
  // Refs - now initialized with converted internal stages
  const stagesRef = useRef<AnimationStage[]>(internalStages);
  const runtimeStagesRef = useRef<Map<string, StageRuntime>>(new Map());
  const timelineRef = useRef<StageTiming[]>([]);
  const resolutionRef = useRef<DependencyResolution | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number | null>(null);
  const playbackRateRef = useRef<number>(config.playbackRate ?? 1);
  const directionRef = useRef<PlaybackDirection>(config.direction || PlaybackDirection.FORWARD);
  const iterationRef = useRef<number>(0);
  const totalIterationsRef = useRef<number>(0);
  const yoyoRef = useRef<boolean>(config.yoyo || false);
  
  // State
  const [progress, setProgress] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [duration, setDuration] = useState<number>(0); // Will be calculated
  const [currentStageId, setCurrentStageId] = useState<string | null>(null); // Added state for current stage
  const [stagesVersion, setStagesVersion] = useState(0); // Add state to track stage changes

  // Update total iterations based on loop/repeatCount
  const calculatedTotalIterations = useMemo(() => {
    if (config.loop === true) return -1;
    return config.repeatCount !== undefined ? config.repeatCount : 0;
  }, [config.loop, config.repeatCount]);

  // Use stricter InternalCallback type for the Set
  const callbacksRef = useRef<Record<keyof SequenceLifecycle, Set<InternalCallback>>>({
    onStart: new Set(), onUpdate: new Set(), onComplete: new Set(),
    onPause: new Set(), onResume: new Set(), onCancel: new Set(),
    onAnimationStart: new Set(), onAnimationComplete: new Set()
  });

  // useEffect for managing callbacks (using stricter types)
  useEffect(() => {
    const addSafe = (type: keyof SequenceLifecycle, cb: ConfigCallback) => {
      if (cb && typeof cb === 'function' && callbacksRef.current[type]) {
        callbacksRef.current[type].add(cb as InternalCallback);
      }
    };
    
    // Add callbacks from config
    Object.keys(callbacksRef.current).forEach((key) => {
      addSafe(key as keyof SequenceLifecycle, config[key as keyof SequenceLifecycle]);
    });
    
    const currentCallbacks = callbacksRef.current; // Capture ref value for cleanup
    return () => {
      // Remove callbacks on cleanup
      Object.keys(currentCallbacks).forEach((key) => {
        const callback = config[key as keyof SequenceLifecycle];
        if (callback && typeof callback === 'function' && currentCallbacks[key as keyof SequenceLifecycle]) {
          currentCallbacks[key as keyof SequenceLifecycle].delete(callback as InternalCallback);
        }
      });
    };
  }, [config]);

  // Initialize/Recalculate timeline 
  const initTimeline = useCallback(() => {
    try {
    const resolution = resolveDependencies(stagesRef.current);
    resolutionRef.current = resolution;
    const timeline = calculateTimeline(stagesRef.current, resolution);
    timelineRef.current = timeline;
        const totalDuration = timeline.reduce((max, timing) => Math.max(max, timing.endTime), 0);
        setDuration(config.duration ?? totalDuration);

    const runtimeStages = new Map<string, StageRuntime>();
    timeline.forEach(timing => {
      const stage = stagesRef.current.find(s => s.id === timing.id);
      if (!stage) return;
            const { stage: finalStage, isReduced } = getStageWithReducedMotion(stage, prefersReducedMotion, isAnimationAllowed);
      const runtime = createStageRuntime(finalStage, timing, isReduced);
      runtimeStages.set(timing.id, runtime);
    });
    runtimeStagesRef.current = runtimeStages;
    } catch (error) {
        console.error("Error initializing animation timeline:", error);
        setPlaybackState(PlaybackState.IDLE); // Prevent running with bad timeline
    }
  }, [config.duration, prefersReducedMotion, isAnimationAllowed]);
  
  // Process stage updates
  const processStageUpdate = useCallback((
    runtime: StageRuntime,
    easedProgress: number,
    resolvedEasingFn: InterpolationFunction
  ) => {
    const { stage, targets } = runtime;
    if (runtime.state !== PlaybackState.PLAYING) return;

    try { // Add try-catch for safety
        switch (stage.type) {
            case 'style': {
                const styleInterpolator = createPropertyInterpolator(
                  (stage as StyleAnimationStage).from,
                  (stage as StyleAnimationStage).properties,
                  (stage as StyleAnimationStage).exclude
                );
                const styles: Record<string, string> = styleInterpolator(easedProgress);
                targets.forEach(target => { applyStyles(target, styles); });
                break;
            }
            case 'stagger': {
                // Ensure runtime.animations is initialized as number[] or null
                if (runtime.animations === undefined) { 
                    runtime.animations = createStaggerDelays(targets, (stage as StaggerAnimationStage).staggerDelay);
                }
                // Type guard to ensure animations is number[] before using it
                if (Array.isArray(runtime.animations)) {
                    const delays = runtime.animations;
                    targets.forEach((target, index) => {
                        const delay = delays[index] ?? 0; // Use nullish coalescing
                        const stageElapsed = easedProgress * stage.duration;
                        if (stageElapsed < delay) return;
                        const targetElapsed = stageElapsed - delay;
                        const targetDuration = stage.duration - delay;
                        const targetProgress = targetDuration > 0 ? Math.min(1, targetElapsed / targetDuration) : 1;
                        const easedTargetProgress = resolvedEasingFn(targetProgress); // Apply stage easing to target
                        const staggerInterpolator = createPropertyInterpolator(
                          (stage as StaggerAnimationStage).from, 
                          (stage as StaggerAnimationStage).properties,
                        );
                        const staggerStyles: Record<string, string> = staggerInterpolator(easedTargetProgress);
                        applyStyles(target, staggerStyles);
                    });
                }
                break;
            }
            case 'callback': {
                if (typeof (stage as CallbackAnimationStage).callback === 'function') {
                    (stage as CallbackAnimationStage).callback(easedProgress, stage.id);
                }
                break;
            }
            case 'event': {
                if (runtime.progress === 0 && easedProgress > 0) {
                    if (typeof (stage as EventAnimationStage).callback === 'function') {
                        (stage as EventAnimationStage).callback(stage.id);
                    }
                    runtime.progress = 1; // Mark as fired only once
                }
                break;
            }
            case 'group': { // Also add braces here for consistency
                break; 
            }
        }
        
        if (typeof stage.onUpdate === 'function') {
            // Cast stage.onUpdate to ProgressCallback before calling
            (stage.onUpdate as ProgressCallback)(easedProgress, stage.id);
        }
    } catch (error) {
        console.error(`Error processing update for stage '${stage.id}':`, error);
        // Optionally pause or stop the sequence on stage error
        // pause(); 
    }
  }, []);

  // Process animation updates (Main loop)
  const processAnimationFrame = useCallback((currentTime: number) => {
    if (playbackState !== PlaybackState.PLAYING) return; // Exit if not playing

    let activeStageId: string | null = null;
    let latestStartTime = -1;

    if (!startTimeRef.current) startTimeRef.current = currentTime;
    
    const currentRate = playbackRateRef.current;
    const elapsedTime = (pausedTimeRef.current !== null) 
        ? pausedTimeRef.current 
        : (currentTime - startTimeRef.current) * currentRate;
    
    // --- Direction / Iteration Logic --- 
    const maxIterations = totalIterationsRef.current;
    const totalDuration = duration;
    const effectiveDuration = totalDuration > 0 ? totalDuration : 1; // Avoid division by zero
    
    const currentCycleTime = elapsedTime % effectiveDuration;
    const completedCycles = Math.floor(elapsedTime / effectiveDuration);
    
    // Check if we exceeded total iterations 
    if (maxIterations !== -1 && completedCycles > maxIterations) {
         setPlaybackState(PlaybackState.FINISHED);
         callbacksRef.current.onComplete.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
         requestIdRef.current = null;
         return; // Sequence finished
    }
    
    iterationRef.current = completedCycles;
    
    let direction = directionRef.current;
    if (yoyoRef.current) {
        const effectiveDirection = config.direction === PlaybackDirection.ALTERNATE_REVERSE 
            ? (completedCycles % 2 !== 0 ? PlaybackDirection.FORWARD : PlaybackDirection.BACKWARD)
            : (completedCycles % 2 === 0 ? PlaybackDirection.FORWARD : PlaybackDirection.BACKWARD);
        direction = effectiveDirection;
    }

    let adjustedElapsedTime = (direction === PlaybackDirection.BACKWARD)
        ? effectiveDuration - currentCycleTime
        : currentCycleTime;
        
    adjustedElapsedTime = Math.max(0, Math.min(adjustedElapsedTime, effectiveDuration));
    const currentProgress = effectiveDuration > 0 ? adjustedElapsedTime / effectiveDuration : 1;
    setProgress(currentProgress);
    callbacksRef.current.onUpdate.forEach(cb => (cb as ProgressCallback)(currentProgress, sequenceId));
    // --- End Direction / Iteration Logic ---
    
    // --- Determine most active stage --- 
    runtimeStagesRef.current.forEach(runtime => {
      const { stage, startTime, endTime } = runtime;
        const stageDuration = endTime - startTime;

      // --- Revised Easing Resolution --- 
      let resolvedEasingFn: InterpolationFunction = Easings.linear.function;
      const easingDefinition = stage.easing;
        if (easingDefinition) {
          try { // Wrap entire resolution in try-catch
          const rawEasingEntry = getEasingEntry(easingDefinition);

          if (typeof rawEasingEntry === 'function') {
                  resolvedEasingFn = rawEasingEntry.length > 1
                      ? (rawEasingEntry as GenericEasingFunctionFactory)(...(stage.easingArgs || [])) as InterpolationFunction
                      : rawEasingEntry as InterpolationFunction;
          } else if (typeof rawEasingEntry === 'object' && rawEasingEntry !== null) {
            if ('function' in rawEasingEntry && typeof rawEasingEntry.function === 'function') {
              resolvedEasingFn = rawEasingEntry.function as InterpolationFunction;
                  } else if ('type' in rawEasingEntry && rawEasingEntry.type === 'spring' && 'createSpringEasing' in Easings) {
                   const { mass, stiffness, damping, initialVelocity } = rawEasingEntry as { mass?: number; stiffness?: number; damping?: number; initialVelocity?: number };
                   const springFactory = Easings.createSpringEasing as GenericEasingFunctionFactory;
                   const springResult = springFactory(mass, stiffness, damping, initialVelocity);
                      if (typeof springResult === 'function') resolvedEasingFn = springResult as InterpolationFunction;
                      else if (springResult && typeof springResult.function === 'function') resolvedEasingFn = springResult.function as InterpolationFunction;
                      // else: Factory failed, keep linear
                  } else { /* Unknown object type */ 
                      console.warn(`Invalid easing object for stage '${stage.id}'. Falling back to linear.`);
                      resolvedEasingFn = Easings.linear.function; // Ensure fallback
                  }
              } // else: Not function or object, keep linear
          } catch (error) {
              console.error(`Error resolving easing for stage '${stage.id}'. Falling back to linear.`, error);
              resolvedEasingFn = Easings.linear.function; // Ensure fallback
          }
      } // else: No easing defined, keep linear
      // --- End Revised Easing Resolution --- 

      // --- Stage Active Check & Processing --- 
      if (adjustedElapsedTime >= startTime && adjustedElapsedTime < endTime) {
          const stageElapsed = adjustedElapsedTime - startTime;
          const stageProgress = stageDuration > 0 ? stageElapsed / stageDuration : 1;
        const easedProgress = resolvedEasingFn(stageProgress);
        runtime.progress = easedProgress;
        
        if (runtime.state === PlaybackState.IDLE) {
          runtime.state = PlaybackState.PLAYING;
          // Track the active stage ID
          if (startTime > latestStartTime) {
            latestStartTime = startTime;
            activeStageId = stage.id;
          }
              if (typeof stage.onStart === 'function') (stage.onStart as SequenceIdCallback)(stage.id);
              callbacksRef.current.onAnimationStart.forEach(cb => (cb as AnimationIdCallback)(stage.id, sequenceId));
          }
        processStageUpdate(runtime, easedProgress, resolvedEasingFn);
      }
      // Handle stage completion precisely at endTime or if time moved past it
      else if (runtime.state === PlaybackState.PLAYING && adjustedElapsedTime >= endTime) {
          // Ensure final state is processed at progress = 1
          // Consider the stage active right up until it finishes
          if (startTime >= latestStartTime) { // Use >= to catch stages starting at the same time
              latestStartTime = startTime;
              activeStageId = stage.id;
          }
          const finalEasedProgress = resolvedEasingFn(1);
          runtime.progress = finalEasedProgress;
          processStageUpdate(runtime, finalEasedProgress, resolvedEasingFn); 
          
        runtime.state = PlaybackState.FINISHED;
          if (typeof stage.onComplete === 'function') (stage.onComplete as SequenceIdCallback)(stage.id);
          callbacksRef.current.onAnimationComplete.forEach(cb => (cb as AnimationIdCallback)(stage.id, sequenceId));
      }
      // Reset stage if time moved before its start (e.g., seeking backwards)
      else if (runtime.state !== PlaybackState.IDLE && adjustedElapsedTime < startTime) {
        runtime.state = PlaybackState.IDLE;
        runtime.progress = 0;
          // Potentially call reverse/reset callbacks if needed
      }
      // --- End Stage Active Check --- 
    }); // End forEach stage
    
    // --- Trigger onStageChange if needed --- 
    if (activeStageId !== currentStageId) {
        setCurrentStageId(activeStageId);
        if (config.onStageChange) {
            config.onStageChange(activeStageId, sequenceId);
        }
    }
    
    // --- Loop Continuation --- 
    if (playbackState === PlaybackState.PLAYING) { // Check state again in case it changed
         if (maxIterations === -1 || completedCycles < maxIterations) {
        requestIdRef.current = requestAnimationFrame(processAnimationFrame);
         } else { // Final iteration completed
        setPlaybackState(PlaybackState.FINISHED);
            callbacksRef.current.onComplete.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
            requestIdRef.current = null;
         }
    } else { // Playback state changed (e.g., paused, stopped)
        requestIdRef.current = null;
      }
    // --- End Loop Continuation --- 

  }, [duration, sequenceId, processStageUpdate, playbackState, config.direction]); // Added playbackState & config.direction dependencies

  // CRITICAL FIX: Move applyInitialStylesIfNeeded to be defined early in the hook
  // This ensures it's available for all references to it
  const applyInitialStylesIfNeeded = useCallback(() => {
    // CRITICAL FIX: Remove the flag that prevents applying styles more than once
    // We need to be able to apply initial styles both at initialization and when playing
    runtimeStagesRef.current.forEach(runtime => {
        const { stage } = runtime;
        if (stage.type === 'style' || stage.type === 'stagger') {
            let targets: HTMLElement[] = [];
            try {
                // Handle different types of stage.targets
                const targetInput = stage.targets;
                let targetResult: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null = null;

                if (typeof targetInput === 'function') {
                    targetResult = targetInput() as HTMLElement | HTMLElement[] | NodeListOf<HTMLElement> | null;
                } else if (typeof targetInput === 'string') {
                    targetResult = document.querySelectorAll<HTMLElement>(targetInput);
                } else if (targetInput instanceof HTMLElement) {
                    targetResult = targetInput;
                } else if (Array.isArray(targetInput)) {
                    targetResult = targetInput.filter(el => el instanceof HTMLElement) as HTMLElement[];
                } else if (targetInput instanceof NodeList) {
                    targetResult = targetInput as NodeListOf<HTMLElement>;
                } else if (targetInput && 'current' in targetInput && targetInput.current instanceof HTMLElement) {
                    // Handle React RefObject
                    targetResult = targetInput.current;
                }

                // Process the resolved targets
                if (targetResult instanceof HTMLElement) {
                    targets = [targetResult];
                } else if (Array.isArray(targetResult)) {
                    targets = targetResult;
                } else if (targetResult instanceof NodeList) {
                    targets = Array.from(targetResult);
                }
                
                runtime.targets = targets; // Store resolved targets

                if (targets.length > 0 && stage.from) {
                    targets.forEach(target => { 
                        if (target) applyStyles(target, stage.from); 
                    });
                }
            } catch (error) {
                console.error(`Error resolving targets or applying initial style for stage '${stage.id}':`, error);
            }
        }
    });
  }, []);

  // Initialize on mount & handle config/stage changes
  useEffect(() => {
    initTimeline();
    
    // CRITICAL FIX REMOVED: Don't apply styles here, it might be too early
    // applyInitialStylesIfNeeded(); 
    
  }, [initTimeline, stagesVersion /* Removed applyInitialStylesIfNeeded dependency */]);

  // CRITICAL FIX: Ensure initial styles are applied during play too
  const play = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) return;
    
    if (timelineRef.current.length === 0) {
        initTimeline();
        if (playbackState === PlaybackState.IDLE && timelineRef.current.length === 0) return;
    }
    
    const wasPaused = playbackState === PlaybackState.PAUSED;
    setPlaybackState(PlaybackState.PLAYING);
    
    if (pausedTimeRef.current !== null) { 
        startTimeRef.current = performance.now() - (pausedTimeRef.current / playbackRateRef.current);
        pausedTimeRef.current = null;
    } else { 
        startTimeRef.current = performance.now();
        iterationRef.current = 0;
        runtimeStagesRef.current.forEach(rt => { rt.state = PlaybackState.IDLE; rt.progress = 0; });
    }
    
    // Apply initial styles as part of first frame
    const firstFrameCallback = (time: number) => {
        // CRITICAL FIX: Apply styles *inside* the first frame callback
        applyInitialStylesIfNeeded(); 
        processAnimationFrame(time);
    };
    requestIdRef.current = requestAnimationFrame(firstFrameCallback);
    
    if (wasPaused) callbacksRef.current.onResume.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
    else callbacksRef.current.onStart.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
  }, [playbackState, initTimeline, processAnimationFrame, sequenceId, applyInitialStylesIfNeeded]);
    
  // Autoplay effect - IMPORTANT: This must be after the play function is defined
  useEffect(() => {
    if (config.autoplay && playbackState === PlaybackState.IDLE) {
      play();
    }
    // Cleanup function for requestAnimationFrame
    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
    }; 
  }, [config.autoplay, play, playbackState]); // Added playbackState dependency
  
  const pause = useCallback(() => {
    if (playbackState !== PlaybackState.PLAYING) return;
    setPlaybackState(PlaybackState.PAUSED);
      if (requestIdRef.current !== null) cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
      // Calculate and store paused time precisely
      if (startTimeRef.current) {
          pausedTimeRef.current = (performance.now() - startTimeRef.current) * playbackRateRef.current;
      }
      callbacksRef.current.onPause.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
  }, [playbackState, sequenceId]);
  
  const stop = useCallback(() => {
    if (playbackState === PlaybackState.IDLE) return;
      const wasPlaying = playbackState === PlaybackState.PLAYING;
    setPlaybackState(PlaybackState.IDLE);
    setCurrentStageId(null); // Reset current stage on stop
      if (requestIdRef.current !== null) cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    startTimeRef.current = null;
    pausedTimeRef.current = null;
    iterationRef.current = 0;
    setProgress(0);
      runtimeStagesRef.current.forEach(rt => { rt.state = PlaybackState.IDLE; rt.progress = 0; });
      if (wasPlaying) callbacksRef.current.onCancel.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
  }, [playbackState, sequenceId]);
  
  const reset = useCallback(() => {
      stop(); // Reuse stop logic
      // Ensure progress is set to 0 (stop might not do this immediately)
      setProgress(0);
      // Reset any internal stage runtime states if necessary
      runtimeStagesRef.current.forEach(rt => {
          rt.state = PlaybackState.IDLE;
          rt.progress = 0;
          // Reset other runtime properties if needed (e.g., iteration count)
          rt.currentIteration = 0;
      });
      
      // CRITICAL FIX: Reapply initial styles when reset is called
      applyInitialStylesIfNeeded();
      
      // Note: onCancel is called by stop(), no need to call other lifecycle callbacks here
  }, [stop, applyInitialStylesIfNeeded]);
  
  const reverse = useCallback(() => { console.warn("reverse not fully implemented"); /* TODO */ }, []);
  const restart = useCallback(() => { console.warn("restart not fully implemented"); stop(); play(); }, [stop, play]);
  const seek = useCallback((_time: number) => { console.warn("seek not fully implemented"); /* TODO */ }, []);
  const seekProgress = useCallback((targetProgress: number) => {
      console.warn("seekProgress not fully implemented");
    const clampedProgress = Math.max(0, Math.min(targetProgress, 1));
      // Ensure duration is available before calculating time
      if (duration > 0) {
    const time = clampedProgress * duration;
    seek(time);
      } else {
           console.warn("Cannot seekProgress, duration is 0 or not yet calculated.");
      }
  }, [duration, seek]); 
  const seekLabel = useCallback((_label: string) => { console.warn("seekLabel not fully implemented"); /* TODO */ }, []);
  const getProgress = useCallback(() => { return progress; }, [progress]);
  const addStage = useCallback((publicStage: PublicAnimationStage) => { 
    console.warn("addStage called, ensure initTimeline re-runs if needed.");
    const internalStage = convertToInternalStage(publicStage);
    stagesRef.current = [...stagesRef.current, internalStage];
    setStagesVersion(v => v + 1); // Trigger re-initialization
    // TODO: More robust dynamic stage addition logic needed?
  }, []);
  const removeStage = useCallback((stageId: string) => { 
    console.warn("removeStage called, ensure initTimeline re-runs if needed."); 
    stagesRef.current = stagesRef.current.filter(s => s.id !== stageId);
    setStagesVersion(v => v + 1); // Trigger re-initialization
  }, []);
  const updateStage = useCallback((stageId: string, updates: Partial<PublicAnimationStage>) => { 
    console.warn("updateStage called, ensure initTimeline re-runs if needed.");
    stagesRef.current = stagesRef.current.map(s => 
      s.id === stageId ? { ...s, ...updates } as AnimationStage : s // Cast the updated stage
    );
    setStagesVersion(v => v + 1); // Trigger re-initialization
  }, []);
  const setPlaybackRate = useCallback((rate: number) => { console.warn("setPlaybackRate not fully implemented"); playbackRateRef.current = Math.max(0.01, rate); }, []);
  const getPlaybackState = useCallback(() => { return playbackState; }, [playbackState]);
  const addCallback = useCallback((type: keyof SequenceLifecycle, callback: InternalCallback) => {
      if (callbacksRef.current[type]) callbacksRef.current[type].add(callback);
  }, []);
  const removeCallback = useCallback((type: keyof SequenceLifecycle, callback: InternalCallback) => {
      if (callbacksRef.current[type]) callbacksRef.current[type].delete(callback);
  }, []);
  // --- END CONTROL DEFINITIONS ---
  
  // Use useMemo for all controls/return result
  const controls: AnimationSequenceResult = useMemo(() => {
    return {
      // Return sequence state
      progress,
      playbackState,
      currentStageId, // Include current stage ID
      duration,
      direction: directionRef.current,
      playbackRate: playbackRateRef.current,
      reducedMotion: prefersReducedMotion,
      stages: convertToPublicStages(stagesRef.current), // Convert to public stages for API
      id: sequenceId,
      
      // Return all control functions 
      play, pause, stop, reset, reverse, restart, 
      seek, seekProgress, seekLabel, getProgress,
      addStage, removeStage, updateStage, 
      setPlaybackRate, getPlaybackState,
      addCallback, removeCallback
    };
  }, [
    // Dependencies (no changes needed here)
    progress, playbackState, duration, prefersReducedMotion, sequenceId,
    currentStageId, // Added current stage ID dependency
    play, pause, stop, reset, reverse, restart, seek, seekProgress, seekLabel, getProgress, // Added reset dependency
    addStage, removeStage, updateStage, setPlaybackRate, getPlaybackState,
    addCallback, removeCallback
  ]);

  return controls;
}

export default useAnimationSequence;