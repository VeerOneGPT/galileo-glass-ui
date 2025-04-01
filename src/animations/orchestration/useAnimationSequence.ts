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

// --- LOCAL TYPE DEFINITIONS & ENUMS (DEFINED ONCE) --- 

export enum PlaybackDirection { FORWARD = 'forward', BACKWARD = 'backward', ALTERNATE = 'alternate', ALTERNATE_REVERSE = 'alternate-reverse' }
export enum StaggerPattern { SEQUENTIAL = 'sequential', FROM_CENTER = 'from-center', FROM_EDGES = 'from-edges', RANDOM = 'random', WAVE = 'wave', CASCADE = 'cascade', RIPPLE = 'ripple', CUSTOM = 'custom' }
export enum TimingRelationship { START_TOGETHER = 'start-together', END_TOGETHER = 'end-together', OVERLAP = 'overlap', GAP = 'gap', CHAIN = 'chain' }
export enum PlaybackState { IDLE = 'idle', PLAYING = 'playing', PAUSED = 'paused', FINISHED = 'finished', CANCELLING = 'cancelling' }

// Callback Types
type SequenceIdCallback = (sequenceId: string) => void;
type ProgressCallback = (progress: number, sequenceId: string) => void;
type AnimationIdCallback = (animationId: string, sequenceId: string) => void;
type ConfigCallback = SequenceIdCallback | ProgressCallback | AnimationIdCallback | Function | undefined;
type InternalCallback = SequenceIdCallback | ProgressCallback | AnimationIdCallback;

// Easing Types
// Define GenericEasingFunctionFactory ONCE
type GenericEasingFunctionFactory = (...args: any[]) => EasingFunction | InterpolationFunction;
type EasingDefinitionType = keyof typeof Easings | InterpolationFunction | GenericEasingFunctionFactory | { type: string; [key: string]: any };

// Stage/Sequence Interfaces (Defined locally)
export interface SequenceLifecycle {
  onStart?: SequenceIdCallback;
  onUpdate?: ProgressCallback;
  onComplete?: SequenceIdCallback;
  onPause?: SequenceIdCallback;
  onResume?: SequenceIdCallback;
  onCancel?: SequenceIdCallback;
  onAnimationStart?: AnimationIdCallback;
  onAnimationComplete?: AnimationIdCallback;
}
export interface BaseAnimationStage { id: string; duration: number; 
  easing?: EasingDefinitionType;
  startTime?: number;
  direction?: PlaybackDirection;
  repeatCount?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  dependsOn?: string[];
  reducedMotionAlternative?: Omit<BaseAnimationStage, 'id' | 'reducedMotionAlternative'>;
  category?: AnimationCategory;
  onStart?: SequenceIdCallback; // Use SequenceIdCallback for onStart
  onUpdate?: ProgressCallback;
  onComplete?: SequenceIdCallback; // Use SequenceIdCallback for onComplete
}
export interface StyleAnimationStage extends BaseAnimationStage { type: 'style'; targets: any; from: Record<string, any>; to: Record<string, any>; exclude?: string[]; }
export interface CallbackAnimationStage extends BaseAnimationStage { type: 'callback'; callback: ProgressCallback; } // Use ProgressCallback
export interface EventAnimationStage extends BaseAnimationStage { type: 'event'; callback: SequenceIdCallback; duration: 0; } // Use SequenceIdCallback
export interface GroupAnimationStage extends BaseAnimationStage { type: 'group'; children: AnimationStage[]; relationship?: TimingRelationship; relationshipValue?: number; }
export interface StaggerAnimationStage extends BaseAnimationStage { type: 'stagger'; targets: any; from: Record<string, any>; to: Record<string, any>; staggerDelay: number; staggerPattern?: StaggerPattern; staggerPatternFn?: Function; staggerOverlap?: number; }
export type AnimationStage = StyleAnimationStage | CallbackAnimationStage | EventAnimationStage | GroupAnimationStage | StaggerAnimationStage;

export interface AnimationSequenceConfig extends SequenceLifecycle {
  id?: string; stages: AnimationStage[]; duration?: number; autoplay?: boolean; 
  repeatCount?: number; yoyo?: boolean; direction?: PlaybackDirection; category?: AnimationCategory; 
  useWebAnimations?: boolean; playbackRate?: number;
}
interface DependencyResolution { order: string[]; parallelGroups: string[][]; }
interface StageTiming { id: string; startTime: number; endTime: number; duration: number; }
interface StageRuntime { id: string; stage: AnimationStage; progress: number; startTime: number; endTime: number; state: PlaybackState; animations: any; targets: HTMLElement[]; currentIteration: number; totalIterations: number; isReduced: boolean; }
export interface SequenceControls { play: () => void; pause: () => void; stop: () => void; reverse: () => void; restart: () => void; seek: (time: number) => void; seekProgress: (progress: number) => void; seekLabel: (label: string) => void; getProgress: () => number; addStage: (stage: AnimationStage) => void; removeStage: (stageId: string) => void; updateStage: (stageId: string, updates: Partial<AnimationStage>) => void; setPlaybackRate: (rate: number) => void; getPlaybackState: () => PlaybackState; addCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; removeCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; }
export interface AnimationSequenceResult extends SequenceControls { progress: number; playbackState: PlaybackState; duration: number; direction: PlaybackDirection; playbackRate: number; reducedMotion: boolean; stages: AnimationStage[]; id: string; }

// Local placeholder for getEasingEntry
function getEasingEntry(definition: EasingDefinitionType): EasingFunction | InterpolationFunction | GenericEasingFunctionFactory | object | undefined {
  if (typeof definition === 'string' && definition in Easings) {
    return Easings[definition as keyof typeof Easings];
  }
  if (typeof definition === 'function') { return definition; }
  if (typeof definition === 'object' && definition !== null) { return definition; }
  return undefined;
}

// TODO: Define or import these utility functions correctly
function resolveDependencies(stages: AnimationStage[]): DependencyResolution { console.warn("resolveDependencies not implemented"); return { order: stages.map(s=>s.id), parallelGroups: [stages.map(s=>s.id)] }; }
function calculateTimeline(stages: AnimationStage[], resolution: DependencyResolution): StageTiming[] { console.warn("calculateTimeline not implemented"); return stages.map(s=>({ id: s.id, startTime: s.startTime ?? 0, duration: s.duration, endTime: (s.startTime ?? 0) + s.duration })); }
function createStageRuntime(stage: AnimationStage, timing: StageTiming, isReduced: boolean): StageRuntime { /*...*/ return { stage, timing } as unknown as StageRuntime; }
function resolveTargets(stage: AnimationStage): HTMLElement[] { console.warn("resolveTargets not implemented"); return []; }
function createPropertyInterpolator(from: any, to: any, exclude?: string[]): (progress: number) => Record<string, any> { return () => ({}); }
function applyStyles(target: HTMLElement, styles: Record<string, any>): void { /*...*/ }
function createStaggerDelays(targets: any, delay: number): number[] { console.warn("createStaggerDelays not implemented"); return Array.isArray(targets) ? targets.map((_, i) => i * delay) : [0]; }
function getStageWithReducedMotion(stage: AnimationStage, prefersReduced: boolean, isAllowed: Function): { stage: AnimationStage, isReduced: boolean } { return { stage, isReduced: false }; }

// --- END LOCAL DEFINITIONS & UTILS --- 

export function useAnimationSequence(config: AnimationSequenceConfig): AnimationSequenceResult {
  const { 
    prefersReducedMotion, 
    isAnimationAllowed 
  } = useReducedMotion();
  
  const sequenceId = config.id || `sequence-${Date.now()}`;
  
  // Refs
  const stagesRef = useRef<AnimationStage[]>(config.stages);
  const runtimeStagesRef = useRef<Map<string, StageRuntime>>(new Map());
  const timelineRef = useRef<StageTiming[]>([]);
  const resolutionRef = useRef<DependencyResolution | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number | null>(null);
  const playbackRateRef = useRef<number>(config.playbackRate ?? 1);
  const directionRef = useRef<PlaybackDirection>(config.direction || PlaybackDirection.FORWARD);
  const iterationRef = useRef<number>(0);
  const totalIterationsRef = useRef<number>(config.repeatCount !== undefined ? config.repeatCount : 0);
  const yoyoRef = useRef<boolean>(config.yoyo || false);
  
  // State
  const [progress, setProgress] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [duration, setDuration] = useState<number>(0); // Will be calculated

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
    const removeSafe = (type: keyof SequenceLifecycle, cb: ConfigCallback) => {
      if (cb && typeof cb === 'function' && callbacksRef.current[type]) {
        callbacksRef.current[type].delete(cb as InternalCallback);
      }
    };

    // Add callbacks from config
    Object.keys(callbacksRef.current).forEach((key) => {
      addSafe(key as keyof SequenceLifecycle, config[key as keyof SequenceLifecycle]);
    });
    
    return () => {
      // Remove callbacks on cleanup
      Object.keys(callbacksRef.current).forEach((key) => {
        removeSafe(key as keyof SequenceLifecycle, config[key as keyof SequenceLifecycle]);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* Dependencies from config object */ 
      config.onStart, config.onUpdate, config.onComplete, config.onPause,
      config.onResume, config.onCancel, config.onAnimationStart, config.onAnimationComplete
  ]);

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
            case 'style':
                const styleInterpolator = createPropertyInterpolator((stage as StyleAnimationStage).from, (stage as StyleAnimationStage).to, (stage as StyleAnimationStage).exclude);
                const styles = styleInterpolator(easedProgress);
                targets.forEach(target => { applyStyles(target, styles); });
                break;
            case 'stagger':
                if (!runtime.animations) { /* Create delays */ runtime.animations = createStaggerDelays(targets, (stage as StaggerAnimationStage).staggerDelay) as any; }
                const delays = runtime.animations as unknown as number[];
                targets.forEach((target, index) => {
                    const delay = delays[index] || 0;
                    const stageElapsed = easedProgress * stage.duration;
                    if (stageElapsed < delay) return;
                    const targetElapsed = stageElapsed - delay;
                    const targetDuration = stage.duration - delay;
                    const targetProgress = targetDuration > 0 ? Math.min(1, targetElapsed / targetDuration) : 1;
                    const easedTargetProgress = resolvedEasingFn(targetProgress); // Apply stage easing to target
                    const staggerInterpolator = createPropertyInterpolator((stage as StaggerAnimationStage).from, (stage as StaggerAnimationStage).to);
                    const staggerStyles = staggerInterpolator(easedTargetProgress);
                    applyStyles(target, staggerStyles);
                });
                break;
            case 'callback':
                if (typeof (stage as CallbackAnimationStage).callback === 'function') {
                    (stage as CallbackAnimationStage).callback(easedProgress, stage.id);
                }
                break;
            case 'event':
                if (runtime.progress === 0 && easedProgress > 0) {
                    if (typeof (stage as EventAnimationStage).callback === 'function') {
                        (stage as EventAnimationStage).callback(stage.id);
                    }
                    runtime.progress = 1; // Mark as fired only once
                }
                break;
            case 'group': break; // Groups are handled by the main loop
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

    if (!startTimeRef.current) startTimeRef.current = currentTime;
    
    const currentRate = playbackRateRef.current;
    let elapsedTime = (pausedTimeRef.current !== null) 
        ? pausedTimeRef.current 
        : (currentTime - startTimeRef.current) * currentRate;
    
    // --- Direction / Iteration Logic --- 
    const currentIteration = iterationRef.current;
    const maxIterations = totalIterationsRef.current;
    const totalDuration = duration;
    const effectiveDuration = totalDuration > 0 ? totalDuration : 1; // Avoid division by zero
    
    let currentCycleTime = elapsedTime % effectiveDuration;
    let completedCycles = Math.floor(elapsedTime / effectiveDuration);
    
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
                  resolvedEasingFn = (rawEasingEntry as Function).length <= 1 
                      ? rawEasingEntry as InterpolationFunction 
                      : (rawEasingEntry as GenericEasingFunctionFactory)(...(stage as any).easingArgs || []) as InterpolationFunction;
          } else if (typeof rawEasingEntry === 'object' && rawEasingEntry !== null) {
            if ('function' in rawEasingEntry && typeof rawEasingEntry.function === 'function') {
              resolvedEasingFn = rawEasingEntry.function as InterpolationFunction;
                  } else if ('type' in rawEasingEntry && rawEasingEntry.type === 'spring' && 'createSpringEasing' in Easings) {
                   const { mass, stiffness, damping, initialVelocity } = rawEasingEntry as any;
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
              if (typeof stage.onStart === 'function') (stage.onStart as SequenceIdCallback)(stage.id);
              callbacksRef.current.onAnimationStart.forEach(cb => (cb as AnimationIdCallback)(stage.id, sequenceId));
          }
        processStageUpdate(runtime, easedProgress, resolvedEasingFn);
      }
      // Handle stage completion precisely at endTime or if time moved past it
      else if (runtime.state === PlaybackState.PLAYING && adjustedElapsedTime >= endTime) {
          // Ensure final state is processed at progress = 1
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

  }, [duration, sequenceId, processStageUpdate, playbackState]); // Added playbackState dependency

  // --- Playback Controls (Ensure ALL are defined before useMemo) --- 
  const play = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) return;
      if (timelineRef.current.length === 0) initTimeline(); // Ensure initialized
      
      const wasPaused = playbackState === PlaybackState.PAUSED;
    setPlaybackState(PlaybackState.PLAYING);
    
      if (pausedTimeRef.current !== null) { // Resuming from pause
          // Adjust start time based on paused time and rate
          startTimeRef.current = performance.now() - (pausedTimeRef.current / playbackRateRef.current);
          pausedTimeRef.current = null;
      } else { // Starting fresh or after stop
          startTimeRef.current = performance.now();
          iterationRef.current = 0;
          runtimeStagesRef.current.forEach(rt => { rt.state = PlaybackState.IDLE; rt.progress = 0; });
      }
      
    requestIdRef.current = requestAnimationFrame(processAnimationFrame);
    
      if (wasPaused) callbacksRef.current.onResume.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
      else callbacksRef.current.onStart.forEach(cb => (cb as SequenceIdCallback)(sequenceId));

  }, [playbackState, initTimeline, processAnimationFrame, sequenceId]);
  
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
      if (requestIdRef.current !== null) cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    startTimeRef.current = null;
    pausedTimeRef.current = null;
    iterationRef.current = 0;
    setProgress(0);
      runtimeStagesRef.current.forEach(rt => { rt.state = PlaybackState.IDLE; rt.progress = 0; });
      if (wasPlaying) callbacksRef.current.onCancel.forEach(cb => (cb as SequenceIdCallback)(sequenceId));
  }, [playbackState, sequenceId]);
  
  const reverse = useCallback(() => { console.warn("reverse not fully implemented"); /* TODO */ }, []);
  const restart = useCallback(() => { console.warn("restart not fully implemented"); stop(); play(); }, [stop, play]);
  const seek = useCallback((time: number) => { console.warn("seek not fully implemented"); /* TODO */ }, []);
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
  const seekLabel = useCallback((label: string) => { console.warn("seekLabel not fully implemented"); /* TODO */ }, []);
  const getProgress = useCallback(() => { return progress; }, [progress]);
  const addStage = useCallback((stage: AnimationStage) => { console.warn("addStage not fully implemented"); /* TODO */ }, []);
  const removeStage = useCallback((stageId: string) => { console.warn("removeStage not fully implemented"); /* TODO */ }, []);
  const updateStage = useCallback((stageId: string, updates: Partial<AnimationStage>) => { console.warn("updateStage not fully implemented"); /* TODO */ }, []);
  const setPlaybackRate = useCallback((rate: number) => { console.warn("setPlaybackRate not fully implemented"); playbackRateRef.current = Math.max(0.01, rate); }, []);
  const getPlaybackState = useCallback(() => { return playbackState; }, [playbackState]);
  const addCallback = useCallback((type: keyof SequenceLifecycle, callback: InternalCallback) => {
      if (callbacksRef.current[type]) callbacksRef.current[type].add(callback);
  }, []);
  const removeCallback = useCallback((type: keyof SequenceLifecycle, callback: InternalCallback) => {
      if (callbacksRef.current[type]) callbacksRef.current[type].delete(callback);
  }, []);
  // --- END CONTROL DEFINITIONS ---
  
  // Controls object - Ensure all defined controls are included
  const controls = useMemo<SequenceControls>(() => ({
      play, pause, stop, reverse, restart, seek, seekProgress, seekLabel, 
      getProgress, addStage, removeStage, updateStage, setPlaybackRate, 
      getPlaybackState, addCallback, removeCallback 
  }), [ 
      play, pause, stop, reverse, restart, seek, seekProgress, seekLabel, 
      getProgress, addStage, removeStage, updateStage, setPlaybackRate, 
      getPlaybackState, addCallback, removeCallback 
  ]);

  // Initialize on mount & handle config changes
  useEffect(() => {
    initTimeline();
  }, [initTimeline]); 
    
  // Autoplay
  useEffect(() => {
    if (config.autoplay && playbackState === PlaybackState.IDLE) {
      play();
    }
    // TODO: Add cleanup for animation frame
    // return () => { /* cleanup */ }; 
  }, [config.autoplay, play]); 
  
  // Final result
  return {
    ...controls,
    progress,
    playbackState,
    duration,
    direction: directionRef.current,
    playbackRate: playbackRateRef.current,
    reducedMotion: prefersReducedMotion,
    stages: stagesRef.current,
    id: sequenceId
  };
}

export default useAnimationSequence;