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
// import { useAnimationInterpolator } from './useAnimationInterpolator'; // Removed unused import - DELETING LINE
import { Easings, InterpolationFunction, EasingFunction } from '../physics/interpolation';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';

/**
 * Types of animation playback direction
 */
export enum PlaybackDirection {
  /**
   * Play forward (start to end)
   */
  FORWARD = 'forward',
  
  /**
   * Play backward (end to start)
   */
  BACKWARD = 'backward',
  
  /**
   * Play forward, then backward
   */
  ALTERNATE = 'alternate',
  
  /**
   * Play backward, then forward
   */
  ALTERNATE_REVERSE = 'alternate-reverse'
}

/**
 * Types of stagger patterns for distributed animations
 */
export enum StaggerPattern {
  /**
   * Sequential stagger (one after another)
   */
  SEQUENTIAL = 'sequential',
  
  /**
   * From center outward
   */
  FROM_CENTER = 'from-center',
  
  /**
   * From edges inward
   */
  FROM_EDGES = 'from-edges',
  
  /**
   * Random stagger
   */
  RANDOM = 'random',
  
  /**
   * Staggered wave pattern
   */
  WAVE = 'wave',
  
  /**
   * Staggered cascade
   */
  CASCADE = 'cascade',
  
  /**
   * Staggered ripple effect
   */
  RIPPLE = 'ripple',
  
  /**
   * Custom stagger defined by a pattern function
   */
  CUSTOM = 'custom'
}

/**
 * Types of timing relationships between animations
 */
export enum TimingRelationship {
  /**
   * Start together, regardless of duration
   */
  START_TOGETHER = 'start-together',
  
  /**
   * End together, regardless of duration
   */
  END_TOGETHER = 'end-together',
  
  /**
   * Overlap by a percentage
   */
  OVERLAP = 'overlap',
  
  /**
   * Gap between animations
   */
  GAP = 'gap',
  
  /**
   * Chain one animation after another
   */
  CHAIN = 'chain'
}

/**
 * Playback state of an animation or sequence
 */
export enum PlaybackState {
  /**
   * Animation is idle/not started
   */
  IDLE = 'idle',
  
  /**
   * Animation is currently playing
   */
  PLAYING = 'playing',
  
  /**
   * Animation is paused
   */
  PAUSED = 'paused',
  
  /**
   * Animation is finished
   */
  FINISHED = 'finished',
  
  /**
   * Animation is cancelling
   */
  CANCELLING = 'cancelling'
}

/**
 * Animation sequence lifecycle methods
 */
export interface SequenceLifecycle {
  /**
   * Called when sequence begins
   */
  onStart?: (sequenceId: string) => void;
  
  /**
   * Called when sequence updates with current progress
   */
  onUpdate?: (progress: number, sequenceId: string) => void;
  
  /**
   * Called when sequence completes
   */
  onComplete?: (sequenceId: string) => void;
  
  /**
   * Called when sequence is paused
   */
  onPause?: (sequenceId: string) => void;
  
  /**
   * Called when sequence is resumed
   */
  onResume?: (sequenceId: string) => void;
  
  /**
   * Called when sequence is canceled
   */
  onCancel?: (sequenceId: string) => void;
  
  /**
   * Called when a specific animation within the sequence starts
   */
  onAnimationStart?: (animationId: string, sequenceId: string) => void;
  
  /**
   * Called when a specific animation within the sequence completes
   */
  onAnimationComplete?: (animationId: string, sequenceId: string) => void;
}

/**
 * Common properties for all animation stages
 */
export interface BaseAnimationStage {
  /**
   * Unique identifier for this animation stage
   */
  id: string;
  
  /**
   * When to start this animation (in ms from sequence start)
   */
  startTime?: number;
  
  /**
   * Duration of this animation (in ms)
   */
  duration: number;
  
  /**
   * Easing function for this animation
   */
  easing?: keyof typeof Easings | ((t: number) => number);
  
  /**
   * Animation playback direction
   */
  direction?: PlaybackDirection;
  
  /**
   * How many times to repeat this animation (0 = no repeat, -1 = infinite)
   */
  repeatCount?: number;
  
  /**
   * Delay between repeats (in ms)
   */
  repeatDelay?: number;
  
  /**
   * Whether to reverse direction on each repeat
   */
  yoyo?: boolean;
  
  /**
   * Dependencies that must complete before this animation starts
   */
  dependsOn?: string[];
  
  /**
   * Alternative animation to use for reduced motion
   */
  reducedMotionAlternative?: Omit<BaseAnimationStage, 'id' | 'reducedMotionAlternative'>;
  
  /**
   * Animation category for accessibility
   */
  category?: AnimationCategory;
  
  /**
   * Function to run before animation starts
   */
  onStart?: (id: string) => void;
  
  /**
   * Function to run on each animation update
   */
  onUpdate?: (progress: number, id: string) => void;
  
  /**
   * Function to run when animation completes
   */
  onComplete?: (id: string) => void;
}

/**
 * Animation stage that applies styles to targets over time
 */
export interface StyleAnimationStage extends BaseAnimationStage {
  /**
   * Type of animation stage
   */
  type: 'style';
  
  /**
   * Target element selector(s) or refs
   */
  targets: string | HTMLElement | Array<string | HTMLElement>;
  
  /**
   * Initial styles to apply
   */
  from: Record<string, any>;
  
  /**
   * Target styles to animate to
   */
  to: Record<string, any>;
  
  /**
   * Properties to exclude from animation
   */
  exclude?: string[];
}

/**
 * Animation stage that triggers a callback function over time
 */
export interface CallbackAnimationStage extends BaseAnimationStage {
  /**
   * Type of animation stage
   */
  type: 'callback';
  
  /**
   * Function to call on each update
   */
  callback: (progress: number, id: string) => void;
}

/**
 * Animation stage that triggers a function at a specific time
 */
export interface EventAnimationStage extends BaseAnimationStage {
  /**
   * Type of animation stage
   */
  type: 'event';
  
  /**
   * Function to call when this event triggers
   */
  callback: (id: string) => void;
  
  /**
   * Duration is 0 for events (instant)
   */
  duration: 0;
}

/**
 * Animation stage that groups multiple animations together
 */
export interface GroupAnimationStage extends BaseAnimationStage {
  /**
   * Type of animation stage
   */
  type: 'group';
  
  /**
   * Child animations in this group
   */
  children: AnimationStage[];
  
  /**
   * How the animations relate to each other in time
   */
  relationship?: TimingRelationship;
  
  /**
   * Overlap percentage or gap duration
   */
  relationshipValue?: number;
}

/**
 * Animation stage that staggers animations across multiple targets
 */
export interface StaggerAnimationStage extends BaseAnimationStage {
  /**
   * Type of animation stage
   */
  type: 'stagger';
  
  /**
   * Target element selector(s) or refs
   */
  targets: string | NodeList | HTMLElement[] | Array<string | HTMLElement>;
  
  /**
   * Initial styles to apply
   */
  from: Record<string, any>;
  
  /**
   * Target styles to animate to
   */
  to: Record<string, any>;
  
  /**
   * Time between each staggered animation (in ms)
   */
  staggerDelay: number;
  
  /**
   * Pattern for the stagger timing
   */
  staggerPattern?: StaggerPattern;
  
  /**
   * Custom stagger pattern function
   */
  staggerPatternFn?: (index: number, total: number, target: HTMLElement) => number;
  
  /**
   * Overlap percentage for animations (0 = sequential, 1 = all at once)
   */
  staggerOverlap?: number;
}

/**
 * Combined animation stage type
 */
export type AnimationStage = 
  StyleAnimationStage | 
  CallbackAnimationStage | 
  EventAnimationStage | 
  GroupAnimationStage | 
  StaggerAnimationStage;

/**
 * Animation sequence configuration
 */
export interface AnimationSequenceConfig extends SequenceLifecycle {
  /**
   * Unique identifier for this sequence
   */
  id?: string;
  
  /**
   * Animation stages in this sequence
   */
  stages: AnimationStage[];
  
  /**
   * Total duration of the sequence (auto-calculated if not provided)
   */
  duration?: number;
  
  /**
   * Whether to autoplay the sequence once defined
   */
  autoplay?: boolean;
  
  /**
   * Number of times to repeat the sequence (0 = no repeat, -1 = infinite)
   */
  repeatCount?: number;
  
  /**
   * Whether to reverse direction on each repeat
   */
  yoyo?: boolean;
  
  /**
   * Animation playback direction
   */
  direction?: PlaybackDirection;
  
  /**
   * Animation category for accessibility
   */
  category?: AnimationCategory;
  
  /**
   * If true, animation will use WAAPI when available
   * If false, will use RAF
   */
  useWebAnimations?: boolean;
}

/**
 * Resolution order of stages based on dependencies
 */
interface DependencyResolution {
  order: string[];
  parallelGroups: string[][];
}

/**
 * Timing information for a specific animation stage
 */
interface StageTiming {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * Animation stage runtime state
 */
interface StageRuntime {
  id: string;
  stage: AnimationStage;
  progress: number;
  startTime: number;
  endTime: number;
  state: PlaybackState;
  animations: Animation[] | null;
  targets: HTMLElement[];
  currentIteration: number;
  totalIterations: number;
  isReduced: boolean;
}

/**
 * Animation sequence playback controls
 */
export interface SequenceControls {
  /**
   * Play the animation sequence from the current position
   */
  play: () => void;
  
  /**
   * Pause the animation sequence
   */
  pause: () => void;
  
  /**
   * Stop the animation sequence and reset to beginning
   */
  stop: () => void;
  
  /**
   * Reverse the animation sequence direction
   */
  reverse: () => void;
  
  /**
   * Restart the animation sequence from the beginning
   */
  restart: () => void;
  
  /**
   * Seek to a specific time in the animation sequence
   */
  seek: (time: number) => void;
  
  /**
   * Seek to a specific progress percentage (0-1)
   */
  seekProgress: (progress: number) => void;
  
  /**
   * Seek to a specific labeled position
   */
  seekLabel: (label: string) => void;
  
  /**
   * Get the current progress (0-1) of the animation sequence
   */
  getProgress: () => number;
  
  /**
   * Add a stage to the animation sequence dynamically
   */
  addStage: (stage: AnimationStage) => void;
  
  /**
   * Remove a stage from the animation sequence
   */
  removeStage: (stageId: string) => void;
  
  /**
   * Update an existing stage in the animation sequence
   */
  updateStage: (stageId: string, updates: Partial<AnimationStage>) => void;
  
  /**
   * Set a new playback speed (1 = normal, 0.5 = half speed, 2 = double speed)
   */
  setPlaybackRate: (rate: number) => void;
  
  /**
   * Get the current playback state
   */
  getPlaybackState: () => PlaybackState;
  
  /**
   * Add a callback to the sequence
   */
  addCallback: (
    type: 'start' | 'update' | 'complete' | 'pause' | 'resume' | 'cancel',
    callback: Function
  ) => void;
  
  /**
   * Remove a callback from the sequence
   */
  removeCallback: (
    type: 'start' | 'update' | 'complete' | 'pause' | 'resume' | 'cancel',
    callback: Function
  ) => void;
}

/**
 * Result returned by the useAnimationSequence hook
 */
export interface AnimationSequenceResult extends SequenceControls {
  /**
   * Current progress of the sequence (0-1)
   */
  progress: number;
  
  /**
   * Current playback state
   */
  playbackState: PlaybackState;
  
  /**
   * Duration of the sequence in milliseconds
   */
  duration: number;
  
  /**
   * Current playback direction
   */
  direction: PlaybackDirection;
  
  /**
   * Current playback rate (1 = normal speed)
   */
  playbackRate: number;
  
  /**
   * Whether reduced motion is active
   */
  reducedMotion: boolean;
  
  /**
   * All animation stages in the sequence
   */
  stages: AnimationStage[];
  
  /**
   * ID of the sequence
   */
  id: string;
}

/**
 * Resolve the order of animation stages based on dependencies
 */
function resolveDependencies(stages: AnimationStage[]): DependencyResolution {
  // Create dependency graph
  const graph: Record<string, string[]> = {};
  const allIds = new Set<string>();
  
  // Initialize graph
  stages.forEach(stage => {
    allIds.add(stage.id);
    graph[stage.id] = stage.dependsOn || [];
  });
  
  // Check for missing dependencies
  Object.entries(graph).forEach(([id, deps]) => {
    deps.forEach(dep => {
      if (!allIds.has(dep)) {
        console.warn(`Animation stage ${id} depends on non-existent stage ${dep}`);
      }
    });
  });
  
  // Topological sort with parallelism detection
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];
  const parallelGroups: string[][] = [];
  
  function visit(id: string, currentPath: string[] = []): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected in animation stages: ${currentPath.join(' -> ')} -> ${id}`);
    }
    
    visiting.add(id);
    
    for (const dep of graph[id]) {
      if (allIds.has(dep)) {
        visit(dep, [...currentPath, id]);
      }
    }
    
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  }
  
  // Visit all nodes
  for (const id of allIds) {
    if (!visited.has(id)) {
      visit(id);
    }
  }
  
  // Detect parallel groups (animations that can run at the same time)
  const remainingIds = new Set(order);
  
  while (remainingIds.size > 0) {
    const currentGroup: string[] = [];
    const canBeAdded = Array.from(remainingIds).filter(id => {
      // Check if all dependencies are already processed
      return (graph[id] || []).every(dep => !remainingIds.has(dep));
    });
    
    // Add all animations that can run in parallel to current group
    canBeAdded.forEach(id => {
      currentGroup.push(id);
      remainingIds.delete(id);
    });
    
    if (currentGroup.length === 0) {
      // Should never happen if topological sort worked correctly
      throw new Error('Failed to resolve animation dependencies');
    }
    
    parallelGroups.push(currentGroup);
  }
  
  // Reverse to get correct order
  return {
    order: order.reverse(),
    parallelGroups: parallelGroups.reverse()
  };
}

/**
 * Calculate timeline for stages with dependencies and parallelism
 */
function calculateTimeline(
  stages: AnimationStage[],
  resolution: DependencyResolution
): StageTiming[] {
  const stagesMap = new Map<string, AnimationStage>();
  stages.forEach(stage => stagesMap.set(stage.id, stage));
  
  const timeline: StageTiming[] = [];
  const startTimes = new Map<string, number>();
  
  // Initialize explicit start times
  stages.forEach(stage => {
    if (stage.startTime !== undefined) {
      startTimes.set(stage.id, stage.startTime);
    }
  });
  
  // Calculate dynamically based on dependencies and groups
  for (const group of resolution.parallelGroups) {
    // Find the earliest time this group can start
    let groupStartTime = 0;
    
    for (const id of group) {
      const stage = stagesMap.get(id)!;
      
      // If this stage has an explicit start time, use it
      if (stage.startTime !== undefined) {
        continue;
      }
      
      // Find the latest end time of dependencies
      let dependencyEndTime = 0;
      
      if (stage.dependsOn && stage.dependsOn.length > 0) {
        for (const depId of stage.dependsOn) {
          const depStage = stagesMap.get(depId);
          if (!depStage) continue;
          
          const depStartTime = startTimes.get(depId) || 0;
          const depDuration = depStage.duration || 0;
          const depEndTime = depStartTime + depDuration;
          
          dependencyEndTime = Math.max(dependencyEndTime, depEndTime);
        }
      }
      
      // Update start time for this stage
      startTimes.set(id, dependencyEndTime);
      groupStartTime = Math.max(groupStartTime, dependencyEndTime);
    }
    
    // Set any unset start times in this group to the group start time
    for (const id of group) {
      if (!startTimes.has(id)) {
        startTimes.set(id, groupStartTime);
      }
    }
  }
  
  // Create final timeline
  for (const stage of stages) {
    const startTime = startTimes.get(stage.id) || 0;
    const duration = stage.duration || 0;
    
    timeline.push({
      id: stage.id,
      startTime,
      duration,
      endTime: startTime + duration
    });
  }
  
  return timeline;
}

/**
 * Get or create HTML elements from targets
 */
function resolveTargets(
  targets: string | HTMLElement | NodeList | Array<string | HTMLElement> | HTMLElement[]
): HTMLElement[] {
  const elements: HTMLElement[] = [];
  
  if (typeof targets === 'string') {
    // CSS selector
    const selected = document.querySelectorAll(targets);
    elements.push(...Array.from(selected) as HTMLElement[]);
  } else if (targets instanceof HTMLElement) {
    // Single element
    elements.push(targets);
  } else if (targets instanceof NodeList) {
    // NodeList
    elements.push(...Array.from(targets) as HTMLElement[]);
  } else if (Array.isArray(targets)) {
    // Array of elements or selectors
    targets.forEach(target => {
      if (typeof target === 'string') {
        const selected = document.querySelectorAll(target);
        elements.push(...Array.from(selected) as HTMLElement[]);
      } else if (target instanceof HTMLElement) {
        elements.push(target);
      }
    });
  }
  
  return elements;
}

/**
 * Get runtime stage with reduced motion alternative if needed
 */
function getStageWithReducedMotion(
  stage: AnimationStage,
  prefersReducedMotion: boolean,
  isAnimationAllowed: (category: AnimationCategory) => boolean
): { stage: AnimationStage; isReduced: boolean } {
  // Check if stage has a reduced motion alternative
  if (
    prefersReducedMotion && 
    stage.reducedMotionAlternative && 
    stage.category && 
    !isAnimationAllowed(stage.category)
  ) {
    // Use the reduced motion alternative
    return {
      stage: {
        ...stage,
        ...stage.reducedMotionAlternative,
        type: stage.type,
        id: stage.id
      } as AnimationStage,
      isReduced: true
    };
  }
  
  // Use the original stage
  return { stage, isReduced: false };
}

/**
 * Create staggered delays based on pattern
 */
function createStaggerDelays(
  targets: HTMLElement[],
  staggerDelay: number,
  pattern: StaggerPattern = StaggerPattern.SEQUENTIAL,
  patternFn?: (index: number, total: number, target: HTMLElement) => number,
  overlap: number = 0
): number[] {
  const count = targets.length;
  const delays: number[] = [];
  
  if (count === 0) return delays;
  
  // Calculate base delays with overlap adjustment
  const effectiveDelay = staggerDelay * (1 - overlap);
  
  switch (pattern) {
    case StaggerPattern.SEQUENTIAL:
      // Simple sequential delay
      for (let i = 0; i < count; i++) {
        delays.push(i * effectiveDelay);
      }
      break;
      
    case StaggerPattern.FROM_CENTER:
      // Start from middle and go outward
      const middle = Math.floor(count / 2);
      for (let i = 0; i < count; i++) {
        const distance = Math.abs(i - middle);
        delays.push(distance * effectiveDelay);
      }
      break;
      
    case StaggerPattern.FROM_EDGES:
      // Start from edges and go inward
      const halfCount = count / 2;
      for (let i = 0; i < count; i++) {
        const distanceFromEdge = Math.min(i, count - 1 - i);
        delays.push(distanceFromEdge * effectiveDelay);
      }
      break;
      
    case StaggerPattern.RANDOM:
      // Random delays within range
      const maxDelay = (count - 1) * effectiveDelay;
      for (let i = 0; i < count; i++) {
        delays.push(Math.random() * maxDelay);
      }
      break;
      
    case StaggerPattern.WAVE:
      // Sinusoidal wave pattern
      for (let i = 0; i < count; i++) {
        const phase = i / (count - 1) * Math.PI * 2;
        // Map sine wave from [-1, 1] to [0, 1]
        const normalizedDelay = (Math.sin(phase) + 1) / 2;
        delays.push(normalizedDelay * (count - 1) * effectiveDelay);
      }
      break;
      
    case StaggerPattern.CASCADE:
      // Accelerating cascade
      for (let i = 0; i < count; i++) {
        const normalizedIndex = i / (count - 1);
        // Eased progress (ease-in)
        const easedProgress = normalizedIndex * normalizedIndex;
        delays.push(easedProgress * (count - 1) * effectiveDelay);
      }
      break;
      
    case StaggerPattern.RIPPLE:
      // 2D ripple effect (requires elements to have positions)
      if (targets.length > 0) {
        // Find center point
        let centerX = 0;
        let centerY = 0;
        
        // Get element positions
        const positions: { x: number; y: number; element: HTMLElement }[] = [];
        targets.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          centerX += x;
          centerY += y;
          
          positions.push({ x, y, element });
        });
        
        centerX /= targets.length;
        centerY /= targets.length;
        
        // Calculate distances from center
        const distances: { index: number; distance: number }[] = [];
        positions.forEach((pos, index) => {
          const dx = pos.x - centerX;
          const dy = pos.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          distances.push({ index, distance });
        });
        
        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance);
        
        // Assign delays based on sorted distances
        const maxDistance = distances[distances.length - 1].distance;
        
        for (let i = 0; i < count; i++) {
          const linearDelay = i * effectiveDelay;
          delays[distances[i].index] = linearDelay;
        }
      } else {
        // Fallback to sequential if no elements
        for (let i = 0; i < count; i++) {
          delays.push(i * effectiveDelay);
        }
      }
      break;
      
    case StaggerPattern.CUSTOM:
      // Use custom pattern function
      if (patternFn) {
        for (let i = 0; i < count; i++) {
          const delay = patternFn(i, count, targets[i]);
          delays.push(delay);
        }
      } else {
        // Fallback to sequential if no pattern function
        for (let i = 0; i < count; i++) {
          delays.push(i * effectiveDelay);
        }
      }
      break;
  }
  
  return delays;
}

/**
 * Create a function that interpolates between object properties
 */
function createPropertyInterpolator(
  from: Record<string, any>,
  to: Record<string, any>,
  exclude: string[] = []
): (progress: number) => Record<string, any> {
  const interpolators = new Map<string, (t: number) => any>();
  const keys = new Set<string>([...Object.keys(from), ...Object.keys(to)]);
  
  // Remove excluded properties
  exclude.forEach(key => keys.delete(key));
  
  // Create interpolator for each property
  keys.forEach(key => {
    const fromValue = from[key] !== undefined ? from[key] : to[key];
    const toValue = to[key] !== undefined ? to[key] : from[key];
    
    // Skip if both values are undefined
    if (fromValue === undefined && toValue === undefined) {
      return;
    }
    
    // Handle different property types
    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      // Numeric interpolation
      interpolators.set(key, (t: number) => fromValue + (toValue - fromValue) * t);
    } else if (
      typeof fromValue === 'string' && 
      typeof toValue === 'string'
    ) {
      // Check if values are colors
      const isColor = (
        fromValue.startsWith('#') || 
        fromValue.startsWith('rgb') || 
        fromValue.startsWith('hsl') ||
        toValue.startsWith('#') || 
        toValue.startsWith('rgb') || 
        toValue.startsWith('hsl')
      );
      
      if (isColor) {
        // Use color interpolation
        interpolators.set(key, (t: number) => {
          // Simple color interpolation
          return `rgba(0, 0, 0, ${t})`; // Placeholder, would use a proper color interpolator
        });
      } else {
        // Check if values are numeric with units
        const fromMatch = fromValue.match(/^([\d.-]+)([a-zA-Z%]+)$/);
        const toMatch = toValue.match(/^([\d.-]+)([a-zA-Z%]+)$/);
        
        if (
          fromMatch && 
          toMatch && 
          fromMatch[2] === toMatch[2]
        ) {
          // Numeric with units
          const fromNumber = parseFloat(fromMatch[1]);
          const toNumber = parseFloat(toMatch[1]);
          const unit = fromMatch[2];
          
          interpolators.set(key, (t: number) => `${fromNumber + (toNumber - fromNumber) * t}${unit}`);
        } else {
          // Non-interpolatable string
          interpolators.set(key, (t: number) => t < 0.5 ? fromValue : toValue);
        }
      }
    } else {
      // Non-interpolatable values
      interpolators.set(key, (t: number) => t < 0.5 ? fromValue : toValue);
    }
  });
  
  // Return interpolation function
  return (progress: number) => {
    const result: Record<string, any> = {};
    
    interpolators.forEach((interpolator, key) => {
      result[key] = interpolator(progress);
    });
    
    return result;
  };
}

/**
 * Apply styles to an element
 */
function applyStyles(element: HTMLElement, styles: Record<string, any>): void {
  Object.entries(styles).forEach(([property, value]) => {
    // Handle special cases for certain properties
    if (property === 'transform') {
      element.style.transform = value;
    } else if (property === 'opacity') {
      element.style.opacity = value;
    } else {
      // Convert camelCase to kebab-case for CSS properties
      const cssProperty = property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      element.style.setProperty(cssProperty, value);
    }
  });
}

/**
 * Create a runtime stage
 */
function createStageRuntime(
  stage: AnimationStage,
  timing: StageTiming,
  isReduced: boolean
): StageRuntime {
  let targets: HTMLElement[] = [];
  
  // Resolve targets for style and stagger animations
  if (stage.type === 'style' || stage.type === 'stagger') {
    targets = resolveTargets(stage.targets);
  }
  
  return {
    id: stage.id,
    stage,
    progress: 0,
    startTime: timing.startTime,
    endTime: timing.endTime,
    state: PlaybackState.IDLE,
    animations: null,
    targets,
    currentIteration: 0,
    totalIterations: stage.repeatCount !== undefined ? stage.repeatCount : 0,
    isReduced
  };
}

// Define EasingDefinition based on observed usage
// It can be a key, a direct function, a factory, or a config object
type EasingDefinition = keyof typeof Easings | InterpolationFunction | Function | { type: string; [key: string]: any };

/**
 * Retrieves an easing definition entry based on its definition
 * @param easing Easing definition (string key, function, or config)
 * @returns The raw entry (EasingFunction object, InterpolationFunction, factory Function, or config object)
 */
function getEasingEntry(
  easing: any // Remove specific EasingDefinition type hint, let TS infer
): EasingFunction | InterpolationFunction | Function | object | undefined { // Keep comprehensive return type
  if (!easing) {
    return undefined;
  }

  // Case 1: Easing is already a function
  if (typeof easing === 'function') {
    return easing; // Return the function directly
  }

  // Case 2: Easing is a key into the Easings object
  if (typeof easing === 'string' && easing in Easings) {
    const easingEntry = Easings[easing];
    // Return the raw entry (could be EasingFunction object, factory Function, etc.)
    return easingEntry;
  }

  // Case 3: Easing is an object config (e.g., { type: 'spring', mass: ... })
  if (typeof easing === 'object') {
    return easing; // Return the config object directly
  }

  // Fallback if definition was invalid
  console.warn(`Easing definition '${JSON.stringify(easing)}' not found or invalid.`);
  return undefined;
}

/**
 * Hook for creating and managing animation sequences
 */
export function useAnimationSequence(config: AnimationSequenceConfig): AnimationSequenceResult {
  // Get reduced motion preferences
  const { 
    prefersReducedMotion, 
    isAnimationAllowed 
  } = useReducedMotion();
  
  // Generate sequence ID if not provided
  const sequenceId = config.id || `sequence-${Date.now()}`;
  
  // Refs for animation state
  const stagesRef = useRef<AnimationStage[]>(config.stages);
  const runtimeStagesRef = useRef<Map<string, StageRuntime>>(new Map());
  const timelineRef = useRef<StageTiming[]>([]);
  const resolutionRef = useRef<DependencyResolution | null>(null);
  const requestIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number | null>(null);
  const playbackRateRef = useRef<number>(1);
  const directionRef = useRef<PlaybackDirection>(config.direction || PlaybackDirection.FORWARD);
  const iterationRef = useRef<number>(0);
  const totalIterationsRef = useRef<number>(config.repeatCount !== undefined ? config.repeatCount : 0);
  const yoyoRef = useRef<boolean>(config.yoyo || false);
  const controlsRef = useRef<SequenceControls | null>(null);
  
  // State for UI updates
  const [progress, setProgress] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [duration, setDuration] = useState<number>(config.duration || 0);
  
  // Callbacks
  const callbacksRef = useRef<Record<string, Set<Function>>>({
    start: new Set(),
    update: new Set(),
    complete: new Set(),
    pause: new Set(),
    resume: new Set(),
    cancel: new Set(),
    animationStart: new Set(),
    animationComplete: new Set()
  });
  
  // Add provided callbacks
  useEffect(() => {
    if (config.onStart) callbacksRef.current.start.add(config.onStart);
    if (config.onUpdate) callbacksRef.current.update.add(config.onUpdate);
    if (config.onComplete) callbacksRef.current.complete.add(config.onComplete);
    if (config.onPause) callbacksRef.current.pause.add(config.onPause);
    if (config.onResume) callbacksRef.current.resume.add(config.onResume);
    if (config.onCancel) callbacksRef.current.cancel.add(config.onCancel);
    if (config.onAnimationStart) callbacksRef.current.animationStart.add(config.onAnimationStart);
    if (config.onAnimationComplete) callbacksRef.current.animationComplete.add(config.onAnimationComplete);
    
    return () => {
      if (config.onStart) callbacksRef.current.start.delete(config.onStart);
      if (config.onUpdate) callbacksRef.current.update.delete(config.onUpdate);
      if (config.onComplete) callbacksRef.current.complete.delete(config.onComplete);
      if (config.onPause) callbacksRef.current.pause.delete(config.onPause);
      if (config.onResume) callbacksRef.current.resume.delete(config.onResume);
      if (config.onCancel) callbacksRef.current.cancel.delete(config.onCancel);
      if (config.onAnimationStart) callbacksRef.current.animationStart.delete(config.onAnimationStart);
      if (config.onAnimationComplete) callbacksRef.current.animationComplete.delete(config.onAnimationComplete);
    };
  }, [
    config.onStart, 
    config.onUpdate, 
    config.onComplete, 
    config.onPause,
    config.onResume,
    config.onCancel,
    config.onAnimationStart,
    config.onAnimationComplete
  ]);
  
  // Initialize the timeline with dependency resolution
  const initTimeline = useCallback(() => {
    // Resolve dependencies between stages
    const resolution = resolveDependencies(stagesRef.current);
    resolutionRef.current = resolution;
    
    // Calculate timeline
    const timeline = calculateTimeline(stagesRef.current, resolution);
    timelineRef.current = timeline;
    
    // Calculate total duration
    const totalDuration = timeline.reduce(
      (max, timing) => Math.max(max, timing.endTime),
      0
    );
    
    setDuration(config.duration || totalDuration);
    
    // Initialize runtime stages
    const runtimeStages = new Map<string, StageRuntime>();
    
    timeline.forEach(timing => {
      const stage = stagesRef.current.find(s => s.id === timing.id);
      if (!stage) return;
      
      // Check for reduced motion alternative
      const { stage: finalStage, isReduced } = getStageWithReducedMotion(
        stage,
        prefersReducedMotion,
        isAnimationAllowed
      );
      
      const runtime = createStageRuntime(finalStage, timing, isReduced);
      runtimeStages.set(timing.id, runtime);
    });
    
    runtimeStagesRef.current = runtimeStages;
  }, [config.duration, prefersReducedMotion, isAnimationAllowed]);
  
  // Process animation updates
  const processAnimationFrame = useCallback((currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
    }
    
    // Calculate elapsed time
    let elapsedTime: number;
    
    if (pausedTimeRef.current !== null) {
      // If paused, use the saved time
      elapsedTime = pausedTimeRef.current;
    } else {
      // Otherwise, calculate based on current time
      elapsedTime = (currentTime - startTimeRef.current) * playbackRateRef.current;
    }
    
    // Apply direction
    let adjustedElapsedTime = elapsedTime;
    
    if (directionRef.current === PlaybackDirection.BACKWARD) {
      adjustedElapsedTime = duration - elapsedTime;
    } else if (
      directionRef.current === PlaybackDirection.ALTERNATE || 
      directionRef.current === PlaybackDirection.ALTERNATE_REVERSE
    ) {
      const isForward = directionRef.current === PlaybackDirection.ALTERNATE
        ? iterationRef.current % 2 === 0
        : iterationRef.current % 2 === 1;
        
      adjustedElapsedTime = isForward ? elapsedTime : duration - elapsedTime;
    }
    
    // Clamp to valid range
    adjustedElapsedTime = Math.max(0, Math.min(adjustedElapsedTime, duration));
    
    // Calculate overall progress
    const currentProgress = duration > 0 ? adjustedElapsedTime / duration : 1;
    setProgress(currentProgress);
    
    // Notify update callbacks
    callbacksRef.current.update.forEach(callback => {
      callback(currentProgress, sequenceId);
    });
    
    // Process each stage
    runtimeStagesRef.current.forEach(runtime => {
      const { stage, startTime, endTime } = runtime;
      
      // Check if this stage is active at the current time
      if (adjustedElapsedTime >= startTime && adjustedElapsedTime <= endTime) {
        // Calculate stage-specific progress
        const stageElapsed = adjustedElapsedTime - startTime;
        const stageDuration = endTime - startTime;
        const stageProgress = stageDuration > 0 ? stageElapsed / stageDuration : 1;
        
        // --- Easing Resolution Logic --- 
        let resolvedEasingFn: InterpolationFunction = Easings.linear.function; // Default
        const easingDefinition = stage.easing; // Get definition from stage

        if (easingDefinition) {
          const rawEasingEntry = getEasingEntry(easingDefinition);

          if (typeof rawEasingEntry === 'function') {
            // Check if it's a simple easing (InterpolationFunction) or a factory
            // Heuristic: check param count (less reliable)
            if (rawEasingEntry.length <= 1) { 
              resolvedEasingFn = rawEasingEntry as InterpolationFunction;
            } else {
              // Assume it's a factory, try to call it (needs args from stage)
              try {
                const args = (stage as any).easingArgs || []; // Use type assertion for now
                const factoryResult = (rawEasingEntry as Function)(...args);
                // Check if factory returned an EasingFunction object or an InterpolationFunction
                if (typeof factoryResult === 'function') {
                  resolvedEasingFn = factoryResult as InterpolationFunction;
                } else if (typeof factoryResult === 'object' && factoryResult !== null && 'function' in factoryResult && typeof factoryResult.function === 'function') {
                  resolvedEasingFn = factoryResult.function as InterpolationFunction;
                } else {
                  console.warn(`Easing factory for stage '${stage.id}' did not return a valid function or EasingFunction object.`);
                }
              } catch (error) {
                console.warn(`Error executing easing factory for stage '${stage.id}':`, error);
              }
            }
          } else if (typeof rawEasingEntry === 'object' && rawEasingEntry !== null) {
            // Handle EasingFunction object or config object
            if ('function' in rawEasingEntry && typeof rawEasingEntry.function === 'function') {
              // It's an EasingFunction object (like linear, easeInQuad)
              resolvedEasingFn = rawEasingEntry.function as InterpolationFunction;
            } else if ('type' in rawEasingEntry) {
               // Handle config objects, e.g., create spring dynamically
               if (rawEasingEntry.type === 'spring' && 'createSpringEasing' in Easings) {
                   const { mass, stiffness, damping, initialVelocity } = rawEasingEntry as any;
                   const springFactory = Easings.createSpringEasing as Function;
                   const springResult = springFactory(mass, stiffness, damping, initialVelocity);
                   if (typeof springResult === 'object' && typeof springResult.function === 'function') {
                       resolvedEasingFn = springResult.function as InterpolationFunction;
                   } else {
                        console.warn(`Spring easing config for stage '${stage.id}' failed to create function.`);
                   }
               } else {
                  console.warn(`Unsupported easing config type '${rawEasingEntry.type}' for stage '${stage.id}'.`);
               }
            } else {
              console.warn(`Invalid easing object found for stage '${stage.id}'.`);
            }
          }
        }
        // --- End Easing Resolution --- 
        
        // Apply the resolved easing function
        const easedProgress = resolvedEasingFn(stageProgress);
        
        // Update state
        runtime.progress = easedProgress;
        
        // Trigger start callback if needed
        if (runtime.state === PlaybackState.IDLE) {
          runtime.state = PlaybackState.PLAYING;
          
          // Call stage-specific start callback
          if (stage.onStart) {
            stage.onStart(stage.id);
          }
          
          // Call sequence animation start callback
          callbacksRef.current.animationStart.forEach(callback => {
            callback(stage.id, sequenceId);
          });
        }
        
        // Process different animation types, passing the resolved easing function
        processStageUpdate(runtime, easedProgress, resolvedEasingFn);
        
        // Check for completion
        if (stageProgress >= 1 && runtime.state === PlaybackState.PLAYING) {
          runtime.state = PlaybackState.FINISHED;
          
          // Call stage-specific complete callback
          if (stage.onComplete) {
            stage.onComplete(stage.id);
          }
          
          // Call sequence animation complete callback
          callbacksRef.current.animationComplete.forEach(callback => {
            callback(stage.id, sequenceId);
          });
        }
      }
      // Check if previously active but now inactive
      else if (
        runtime.state === PlaybackState.PLAYING && 
        (adjustedElapsedTime < startTime || adjustedElapsedTime > endTime)
      ) {
        // Set to finished
        runtime.state = PlaybackState.FINISHED;
        
        // Call stage-specific complete callback
        if (stage.onComplete) {
          stage.onComplete(stage.id);
        }
        
        // Call sequence animation complete callback
        callbacksRef.current.animationComplete.forEach(callback => {
          callback(stage.id, sequenceId);
        });
      }
      // Reset if needed for next iteration
      else if (
        runtime.state === PlaybackState.FINISHED && 
        (elapsedTime < startTime)
      ) {
        runtime.state = PlaybackState.IDLE;
        runtime.progress = 0;
      }
    });
    
    // Check for sequence completion
    if (elapsedTime >= duration) {
      // Handle iterations
      if (
        totalIterationsRef.current === -1 || 
        iterationRef.current < totalIterationsRef.current - 1
      ) {
        // More iterations to go
        iterationRef.current++;
        
        // Toggle direction if yoyo is enabled
        if (yoyoRef.current) {
          if (directionRef.current === PlaybackDirection.FORWARD) {
            directionRef.current = PlaybackDirection.BACKWARD;
          } else if (directionRef.current === PlaybackDirection.BACKWARD) {
            directionRef.current = PlaybackDirection.FORWARD;
          }
        }
        
        // Reset timing but keep the animation going
        startTimeRef.current = currentTime;
        
        // Reset all stage states
        runtimeStagesRef.current.forEach(runtime => {
          runtime.state = PlaybackState.IDLE;
          runtime.progress = 0;
        });
        
        // Continue animation
        requestIdRef.current = requestAnimationFrame(processAnimationFrame);
      } else {
        // Sequence complete
        setPlaybackState(PlaybackState.FINISHED);
        
        // Call complete callbacks
        callbacksRef.current.complete.forEach(callback => {
          callback(sequenceId);
        });
        
        // Clean up
        requestIdRef.current = null;
      }
    } else {
      // Continue animation if not paused
      if (pausedTimeRef.current === null) {
        requestIdRef.current = requestAnimationFrame(processAnimationFrame);
      }
    }
  }, [duration, sequenceId]);
  
  // Process update for a specific stage
  const processStageUpdate = useCallback((
    runtime: StageRuntime,
    easedProgress: number,
    resolvedEasingFn: InterpolationFunction
  ) => {
    const { stage, targets } = runtime;
    
    // Skip if paused or finished
    if (runtime.state !== PlaybackState.PLAYING) return;
    
    // Process based on animation type
    switch (stage.type) {
      case 'style':
        // Update style properties
        const styleInterpolator = createPropertyInterpolator(
          (stage as StyleAnimationStage).from, 
          (stage as StyleAnimationStage).to, 
          (stage as StyleAnimationStage).exclude
        );
        
        const styles = styleInterpolator(easedProgress);
        
        // Apply to all targets
        targets.forEach(target => {
          applyStyles(target, styles);
        });
        break;
        
      case 'stagger':
        // Create staggered delays if not already set
        if (!runtime.animations) {
          const delays = createStaggerDelays(
            targets,
            stage.staggerDelay,
            stage.staggerPattern,
            stage.staggerPatternFn,
            stage.staggerOverlap
          );
          
          // Store delays as "animations" for reuse
          runtime.animations = delays as any;
        }
        
        // Get delays
        const delays = runtime.animations as unknown as number[];
        
        // Calculate maximum delay
        const maxDelay = Math.max(...delays);
        
        // Apply staggered styles to each target
        targets.forEach((target, index) => {
          // Calculate individual progress based on delay
          const delay = delays[index] || 0;
          const maxDuration = stage.duration - delay;
          const stageElapsed = easedProgress * stage.duration;
          
          // Don't start before delay
          if (stageElapsed < delay) return;
          
          // Calculate progress within the target's active duration
          const targetElapsed = stageElapsed - delay;
          const targetProgress = maxDuration > 0 ? targetElapsed / maxDuration : 1;
          
          // Apply easing AGAIN? Check if stagger needs per-target easing or uses stage easing.
          // Assuming stage-level easing applied via easedProgress is sufficient.
          const easedTargetProgress = targetProgress;

          // Interpolate properties based on easedTargetProgress
          const staggerInterpolator = createPropertyInterpolator(
            (stage as StaggerAnimationStage).from,
            (stage as StaggerAnimationStage).to,
          );
          const staggerStyles = staggerInterpolator(easedTargetProgress);
          applyStyles(target, staggerStyles);
        });
        break;
        
      case 'callback':
        // Call the callback with current progress
        stage.callback(easedProgress, stage.id);
        break;
        
      case 'event':
        // Events only fire once
        if (runtime.progress === 0 && easedProgress > 0) {
          stage.callback(stage.id);
        }
        break;
        
      case 'group':
        // Groups are processed separately in the main update loop
        break;
    }
    
    // Call stage-specific update callback if it exists
    if (stage.onUpdate) {
      stage.onUpdate(easedProgress, stage.id);
    }
  }, []);
  
  // Play the animation
  const play = useCallback(() => {
    // Skip if already playing
    if (playbackState === PlaybackState.PLAYING) return;
    
    // Initialize timeline if needed
    if (timelineRef.current.length === 0) {
      initTimeline();
    }
    
    // Update state
    setPlaybackState(PlaybackState.PLAYING);
    
    // Reset start time if starting fresh
    if (playbackState === PlaybackState.IDLE) {
      startTimeRef.current = null;
    }
    
    // Clear paused time
    pausedTimeRef.current = null;
    
    // Start animation loop
    requestIdRef.current = requestAnimationFrame(processAnimationFrame);
    
    // Call start or resume callbacks
    if (playbackState === PlaybackState.IDLE) {
      callbacksRef.current.start.forEach(callback => {
        callback(sequenceId);
      });
    } else if (playbackState === PlaybackState.PAUSED) {
      callbacksRef.current.resume.forEach(callback => {
        callback(sequenceId);
      });
    }
  }, [playbackState, initTimeline, processAnimationFrame, sequenceId]);
  
  // Pause the animation
  const pause = useCallback(() => {
    // Skip if not playing
    if (playbackState !== PlaybackState.PLAYING) return;
    
    // Update state
    setPlaybackState(PlaybackState.PAUSED);
    
    // Save current progress
    pausedTimeRef.current = progress * duration;
    
    // Cancel animation frame
    if (requestIdRef.current !== null) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    
    // Call pause callbacks
    callbacksRef.current.pause.forEach(callback => {
      callback(sequenceId);
    });
  }, [playbackState, progress, duration, sequenceId]);
  
  // Stop the animation and reset
  const stop = useCallback(() => {
    // Skip if already idle
    if (playbackState === PlaybackState.IDLE) return;
    
    // Update state
    setPlaybackState(PlaybackState.IDLE);
    
    // Reset timing
    startTimeRef.current = null;
    pausedTimeRef.current = null;
    iterationRef.current = 0;
    
    // Cancel animation frame
    if (requestIdRef.current !== null) {
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    }
    
    // Reset progress
    setProgress(0);
    
    // Reset all stage states
    runtimeStagesRef.current.forEach(runtime => {
      runtime.state = PlaybackState.IDLE;
      runtime.progress = 0;
    });
    
    // Call cancel callbacks
    callbacksRef.current.cancel.forEach(callback => {
      callback(sequenceId);
    });
  }, [playbackState, sequenceId]);
  
  // Reverse the animation direction
  const reverse = useCallback(() => {
    if (directionRef.current === PlaybackDirection.FORWARD) {
      directionRef.current = PlaybackDirection.BACKWARD;
    } else if (directionRef.current === PlaybackDirection.BACKWARD) {
      directionRef.current = PlaybackDirection.FORWARD;
    } else if (directionRef.current === PlaybackDirection.ALTERNATE) {
      directionRef.current = PlaybackDirection.ALTERNATE_REVERSE;
    } else if (directionRef.current === PlaybackDirection.ALTERNATE_REVERSE) {
      directionRef.current = PlaybackDirection.ALTERNATE;
    }
  }, []);
  
  // Restart the animation from the beginning
  const restart = useCallback(() => {
    stop();
    play();
  }, [stop, play]);
  
  // Seek to a specific time
  const seek = useCallback((time: number) => {
    // Clamp to valid range
    const clampedTime = Math.max(0, Math.min(time, duration));
    
    // Update progress
    setProgress(clampedTime / duration);
    
    // Save as paused time
    pausedTimeRef.current = clampedTime;
    
    // If playing, restart animation loop
    if (playbackState === PlaybackState.PLAYING) {
      // Cancel current frame
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
      
      // Set new start time relative to current time and desired progress
      startTimeRef.current = performance.now() - (clampedTime / playbackRateRef.current);
      
      // Restart animation loop
      requestIdRef.current = requestAnimationFrame(processAnimationFrame);
    }
  }, [duration, playbackState, processAnimationFrame]);
  
  // Seek to a specific progress percentage
  const seekProgress = useCallback((targetProgress: number) => {
    // Clamp to valid range
    const clampedProgress = Math.max(0, Math.min(targetProgress, 1));
    
    // Convert to time
    const time = clampedProgress * duration;
    
    // Use seek implementation
    seek(time);
  }, [duration, seek]);
  
  // Seek to a labeled position
  const seekLabel = useCallback((label: string) => {
    // Find stage with matching ID
    const stage = stagesRef.current.find(s => s.id === label);
    
    if (stage) {
      // Find corresponding timing
      const timing = timelineRef.current.find(t => t.id === label);
      
      if (timing) {
        // Seek to start time
        seek(timing.startTime);
      }
    }
  }, [seek]);
  
  // Get current progress
  const getProgress = useCallback(() => {
    return progress;
  }, [progress]);
  
  // Add a new stage
  const addStage = useCallback((stage: AnimationStage) => {
    // Check for duplicate ID
    if (stagesRef.current.some(s => s.id === stage.id)) {
      console.warn(`Animation stage with ID ${stage.id} already exists`);
      return;
    }
    
    // Add stage
    stagesRef.current = [...stagesRef.current, stage];
    
    // Re-initialize timeline
    initTimeline();
  }, [initTimeline]);
  
  // Remove a stage
  const removeStage = useCallback((stageId: string) => {
    // Remove stage
    stagesRef.current = stagesRef.current.filter(s => s.id !== stageId);
    
    // Re-initialize timeline
    initTimeline();
  }, [initTimeline]);
  
  // Update an existing stage
  const updateStage = useCallback((stageId: string, updates: Partial<AnimationStage>) => {
    // Find stage
    const stageIndex = stagesRef.current.findIndex(s => s.id === stageId);
    
    if (stageIndex === -1) {
      console.warn(`Animation stage with ID ${stageId} not found`);
      return;
    }
    
    // Update stage
    const stage = stagesRef.current[stageIndex];
    stagesRef.current[stageIndex] = { ...stage, ...updates } as AnimationStage;
    
    // Re-initialize timeline
    initTimeline();
  }, [initTimeline]);
  
  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    // Enforce minimum rate
    const newRate = Math.max(0.01, rate);
    
    // If playing, adjust start time to maintain current progress
    if (playbackState === PlaybackState.PLAYING && startTimeRef.current) {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTimeRef.current;
      const progressTime = elapsedTime * playbackRateRef.current;
      
      // Adjust start time to maintain progress with new rate
      startTimeRef.current = currentTime - (progressTime / newRate);
    }
    
    // Update rate
    playbackRateRef.current = newRate;
  }, [playbackState]);
  
  // Get playback state
  const getPlaybackState = useCallback(() => {
    return playbackState;
  }, [playbackState]);
  
  // Add a callback
  const addCallback = useCallback((
    type: 'start' | 'update' | 'complete' | 'pause' | 'resume' | 'cancel',
    callback: Function
  ) => {
    if (callbacksRef.current[type]) {
      callbacksRef.current[type].add(callback);
    }
  }, []);
  
  // Remove a callback
  const removeCallback = useCallback((
    type: 'start' | 'update' | 'complete' | 'pause' | 'resume' | 'cancel',
    callback: Function
  ) => {
    if (callbacksRef.current[type]) {
      callbacksRef.current[type].delete(callback);
    }
  }, []);
  
  // Create controls object
  const controls = useMemo<SequenceControls>(() => ({
    play,
    pause,
    stop,
    reverse,
    restart,
    seek,
    seekProgress,
    seekLabel,
    getProgress,
    addStage,
    removeStage,
    updateStage,
    setPlaybackRate,
    getPlaybackState,
    addCallback,
    removeCallback
  }), [
    play,
    pause,
    stop,
    reverse,
    restart,
    seek,
    seekProgress,
    seekLabel,
    getProgress,
    addStage,
    removeStage,
    updateStage,
    setPlaybackRate,
    getPlaybackState,
    addCallback,
    removeCallback
  ]);
  
  // Store controls reference
  controlsRef.current = controls;
  
  // Initialize on mount
  useEffect(() => {
    initTimeline();
    
    // Autoplay if specified
    if (config.autoplay) {
      play();
    }
    
    // Cleanup on unmount
    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [initTimeline, play, config.autoplay]);
  
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