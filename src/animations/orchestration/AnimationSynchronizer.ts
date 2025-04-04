/**
 * Animation Synchronizer
 *
 * Provides timing-agnostic synchronization for animations to coordinate
 * different animations regardless of their durations or start times.
 */

import { AnimationPreset } from '../core/types';
import { animationOrchestrator, AnimationOrchestrator } from './Orchestrator';
import { AnimationStateMachine, AnimationState, StateTransition } from './AnimationStateMachine';

/**
 * Animation phase types
 */
export enum AnimationPhase {
  /** Preparation phase before animation starts */
  PREP = 'prep',
  /** Start phase when animation begins */
  START = 'start',
  /** Middle phase during animation */
  MIDDLE = 'middle',
  /** End phase as animation completes */
  END = 'end',
  /** After phase when animation has finished */
  AFTER = 'after',
}

/**
 * Sync point definition
 */
export interface SyncPoint {
  /** Unique identifier for this sync point */
  id: string;
  
  /** Human-readable name of the sync point */
  name: string;
  
  /** Animation phase this sync point corresponds to */
  phase: AnimationPhase;
  
  /** Percentage into the animation (0-1) */
  position: number;
  
  /** Whether this sync point is a barrier that all animations must reach before proceeding */
  barrier?: boolean;
  
  /** Custom metadata for this sync point */
  meta?: Record<string, any>;
}

/**
 * Synchronized animation definition
 */
export interface SyncedAnimation {
  /** Unique identifier for this animation */
  id: string;
  
  /** Target element selector or reference */
  target: string | HTMLElement;
  
  /** Animation to apply */
  animation: AnimationPreset;
  
  /** Total duration in milliseconds */
  duration: number;
  
  /** Custom sync points for this animation */
  syncPoints?: SyncPoint[];
  
  /** Priority of this animation (higher priority animations control synchronization) */
  priority?: number;
  
  /** Animation order in sequence (for staggered animations) */
  order?: number;
  
  /** Percentage this animation is stretched/compressed to match others */
  stretchFactor?: number;
  
  /** Whether this animation should adapt to the group duration */
  adaptTiming?: boolean;
  
  /** State to transition to at each sync point */
  states?: Record<string, AnimationState>;
  
  /** Custom metadata for this animation */
  meta?: Record<string, any>;
}

/**
 * Synchronized group options
 */
export interface SyncGroupOptions {
  /** Unique identifier for this sync group */
  id: string;
  
  /** Common sync points for all animations in this group */
  syncPoints?: SyncPoint[];
  
  /** Synchronization strategy to use */
  strategy?: SynchronizationStrategy;
  
  /** Total group duration in milliseconds (can be calculated automatically) */
  duration?: number;
  
  /** Whether to adapt individual animations to match group duration */
  adaptTimings?: boolean;
  
  /** Whether to use proportional timing based on animation durations */
  proportionalTiming?: boolean;
  
  /** Easing function to apply to the overall synchronization */
  easing?: (t: number) => number;
  
  /** Custom timing calculator function */
  customTimingCalculator?: TimingCalculator;
  
  /** Function to call when a sync point is reached */
  onSyncPoint?: (point: SyncPoint, animations: string[]) => void;
  
  /** Function to call when all animations complete */
  onComplete?: () => void;
}

/**
 * Synchronization strategy for managing timing relationships
 */
export enum SynchronizationStrategy {
  /** Stretch/compress animations to match a common duration */
  COMMON_DURATION = 'common-duration',
  
  /** Align specific sync points across all animations */
  ALIGN_SYNC_POINTS = 'align-sync-points',
  
  /** Start animations at the same time but let them run at their own pace */
  SIMULTANEOUS_START = 'simultaneous-start',
  
  /** End all animations at the same time by adjusting start times */
  SIMULTANEOUS_END = 'simultaneous-end',
  
  /** Use cascading timing with fixed offset between animations */
  CASCADE = 'cascade',
  
  /** Custom strategy defined by user-provided function */
  CUSTOM = 'custom',
}

/**
 * Timing calculation function type for custom synchronization
 */
export type TimingCalculator = (
  animation: SyncedAnimation,
  allAnimations: SyncedAnimation[],
  options: SyncGroupOptions
) => {
  startTime: number;
  duration: number;
  syncPoints: Map<string, number>;
};

/**
 * Animation group state
 */
export enum SyncGroupState {
  /** Group is being set up */
  INITIALIZING = 'initializing',
  
  /** Group is ready to play */
  READY = 'ready',
  
  /** Group is currently playing */
  PLAYING = 'playing',
  
  /** Group is paused */
  PAUSED = 'paused',
  
  /** Group has completed all animations */
  COMPLETED = 'completed',
  
  /** Group has been canceled */
  CANCELED = 'canceled',
}

/**
 * Synchronized animation group
 */
export class SynchronizedGroup {
  /** Group options */
  private options: SyncGroupOptions;
  
  /** Animations in this group */
  private animations: Map<string, SyncedAnimation> = new Map();
  
  /** Animation start times relative to group start */
  private startTimes: Map<string, number> = new Map();
  
  /** Animation durations (possibly adjusted) */
  private durations: Map<string, number> = new Map();
  
  /** Animation-specific sync points */
  private syncPoints: Map<string, Map<string, number>> = new Map();
  
  /** Current state of the group */
  private state: SyncGroupState = SyncGroupState.INITIALIZING;
  
  /** Absolute start time of the group */
  private groupStartTime = 0;
  
  /** Group duration (calculated or provided) */
  private groupDuration = 0;
  
  /** Orchestrator to use for animations */
  private orchestrator: AnimationOrchestrator;
  
  /** Group pause time (if paused) */
  private pauseTime: number | null = null;
  
  /** Active animation states */
  private activeStates: Map<string, AnimationStateMachine> = new Map();
  
  /** Maps animations to their sync point listeners */
  private syncPointListeners: Map<string, Set<(point: SyncPoint) => void>> = new Map();
  
  /**
   * Create a new synchronized animation group
   * @param options Group options
   * @param orchestrator Optional animation orchestrator to use
   */
  constructor(options: SyncGroupOptions, orchestrator?: AnimationOrchestrator) {
    this.options = options;
    this.orchestrator = orchestrator || animationOrchestrator;
  }
  
  /**
   * Add an animation to the group
   * @param animation Animation definition
   * @returns This group for chaining
   */
  addAnimation(animation: SyncedAnimation): SynchronizedGroup {
    if (this.state !== SyncGroupState.INITIALIZING) {
      throw new Error('Cannot add animations after group has been initialized');
    }
    
    // Store animation
    this.animations.set(animation.id, animation);
    
    return this;
  }
  
  /**
   * Add multiple animations to the group
   * @param animations Array of animation definitions
   * @returns This group for chaining
   */
  addAnimations(animations: SyncedAnimation[]): SynchronizedGroup {
    animations.forEach(animation => this.addAnimation(animation));
    return this;
  }
  
  /**
   * Remove an animation from the group
   * @param animationId Animation identifier
   * @returns This group for chaining
   */
  removeAnimation(animationId: string): SynchronizedGroup {
    if (this.state !== SyncGroupState.INITIALIZING) {
      throw new Error('Cannot remove animations after group has been initialized');
    }
    
    this.animations.delete(animationId);
    return this;
  }
  
  /**
   * Initialize the group and calculate timings
   * @returns This group for chaining
   */
  initialize(): SynchronizedGroup {
    if (this.animations.size === 0) {
      throw new Error('No animations added to the group');
    }
    
    // Convert animations map to array for calculations
    const animationsArray = Array.from(this.animations.values());
    
    // Calculate timings based on synchronization strategy
    switch (this.options.strategy || SynchronizationStrategy.COMMON_DURATION) {
      case SynchronizationStrategy.COMMON_DURATION:
        this.calculateCommonDurationTimings(animationsArray);
        break;
        
      case SynchronizationStrategy.ALIGN_SYNC_POINTS:
        this.calculateAlignedSyncPointTimings(animationsArray);
        break;
        
      case SynchronizationStrategy.SIMULTANEOUS_START:
        this.calculateSimultaneousStartTimings(animationsArray);
        break;
        
      case SynchronizationStrategy.SIMULTANEOUS_END:
        this.calculateSimultaneousEndTimings(animationsArray);
        break;
        
      case SynchronizationStrategy.CASCADE:
        this.calculateCascadeTimings(animationsArray);
        break;
        
      case SynchronizationStrategy.CUSTOM:
        this.calculateCustomTimings(animationsArray);
        break;
    }
    
    // Set group state to ready
    this.state = SyncGroupState.READY;
    
    return this;
  }
  
  /**
   * Play all animations in the group with synchronized timing
   * @returns Promise that resolves when all animations complete
   */
  async play(): Promise<void> {
    if (this.state === SyncGroupState.INITIALIZING) {
      this.initialize();
    }
    
    if (this.state !== SyncGroupState.READY && this.state !== SyncGroupState.PAUSED) {
      throw new Error(`Cannot play from current state: ${this.state}`);
    }
    
    // If resuming from pause, adjust times
    let timeOffset = 0;
    if (this.state === SyncGroupState.PAUSED && this.pauseTime !== null) {
      timeOffset = this.pauseTime - this.groupStartTime;
      this.pauseTime = null;
    } else {
      // Set absolute start time
      this.groupStartTime = performance.now();
    }
    
    // Set state to playing
    this.state = SyncGroupState.PLAYING;
    
    // Create a promise that resolves when all animations complete
    return new Promise<void>((resolve) => {
      // Keep track of completed animations
      const completedAnimations = new Set<string>();
      
      // Function to check if all animations are complete
      const checkAllComplete = () => {
        if (completedAnimations.size === this.animations.size) {
          this.state = SyncGroupState.COMPLETED;
          if (this.options.onComplete) {
            this.options.onComplete();
          }
          resolve();
        }
      };
      
      // Start each animation with calculated timing
      this.animations.forEach((animation, animationId) => {
        const startTime = this.startTimes.get(animationId) || 0;
        const duration = this.durations.get(animationId) || animation.duration;
        
        // Adjust for pause if necessary
        const adjustedStartTime = Math.max(0, startTime - timeOffset);
        
        // Create a timeout for this animation's start
        setTimeout(() => {
          if (this.state !== SyncGroupState.PLAYING) return;
          
          // Resolve target element
          let target: HTMLElement | null = null;
          if (typeof animation.target === 'string') {
            target = document.querySelector(animation.target);
          } else {
            target = animation.target as HTMLElement;
          }
          
          if (!target) {
            console.warn(`Target element not found for animation: ${animationId}`);
            completedAnimations.add(animationId);
            checkAllComplete();
            return;
          }
          
          // Set up timer for each sync point
          const animationSyncPoints = this.syncPoints.get(animationId);
          if (animationSyncPoints) {
            animationSyncPoints.forEach((time, syncPointId) => {
              // Adjust for pause if necessary
              const adjustedTime = Math.max(0, time - timeOffset);
              
              setTimeout(() => {
                if (this.state !== SyncGroupState.PLAYING) return;
                
                // Find the sync point definition
                let syncPoint: SyncPoint | undefined;
                
                // Check animation-specific sync points
                if (animation.syncPoints) {
                  syncPoint = animation.syncPoints.find(p => p.id === syncPointId);
                }
                
                // Check group sync points if not found
                if (!syncPoint && this.options.syncPoints) {
                  syncPoint = this.options.syncPoints.find(p => p.id === syncPointId);
                }
                
                if (syncPoint) {
                  // Execute state transition if specified
                  if (animation.states && animation.states[syncPointId]) {
                    this.transitionState(animationId, animation.states[syncPointId]);
                  }
                  
                  // Notify listeners for this animation's sync point
                  const listeners = this.syncPointListeners.get(animationId);
                  if (listeners) {
                    listeners.forEach(listener => listener(syncPoint!));
                  }
                  
                  // Call the group sync point callback
                  if (this.options.onSyncPoint) {
                    this.options.onSyncPoint(syncPoint, [animationId]);
                  }
                }
              }, adjustedTime);
            });
          }
          
          // Start the animation through orchestrator
          this.orchestrator.createSequence(`${this.options.id}:${animationId}`, {
            targets: [
              {
                target,
                animation: animation.animation,
                duration,
                waitForCompletion: true
              }
            ],
            autoPlay: true
          });
          
          // Set up completion handler
          setTimeout(() => {
            if (this.state !== SyncGroupState.PLAYING) return;
            
            completedAnimations.add(animationId);
            checkAllComplete();
          }, adjustedStartTime + duration);
        }, adjustedStartTime);
      });
    });
  }
  
  /**
   * Pause all animations in the group
   * @returns This group for chaining
   */
  pause(): SynchronizedGroup {
    if (this.state !== SyncGroupState.PLAYING) {
      return this;
    }
    
    // Record pause time
    this.pauseTime = performance.now();
    
    // Set state to paused
    this.state = SyncGroupState.PAUSED;
    
    // Pause all active animations
    this.animations.forEach((animation, animationId) => {
      this.orchestrator.pause(`${this.options.id}:${animationId}`);
    });
    
    return this;
  }
  
  /**
   * Cancel all animations in the group
   * @returns This group for chaining
   */
  cancel(): SynchronizedGroup {
    if (this.state !== SyncGroupState.PLAYING && this.state !== SyncGroupState.PAUSED) {
      return this;
    }
    
    // Set state to canceled
    this.state = SyncGroupState.CANCELED;
    
    // Stop all active animations
    this.animations.forEach((animation, animationId) => {
      this.orchestrator.stop(`${this.options.id}:${animationId}`);
    });
    
    // Reset pause time
    this.pauseTime = null; 
    
    // Reset group start time (effectively resetting progress)
    // Note: This might need refinement depending on desired 'resume after cancel' behavior
    this.groupStartTime = 0; // Uncommented/Added to reset progress
    
    return this;
  }
  
  /**
   * Get the current state of the group
   * @returns Current state
   */
  getState(): SyncGroupState {
    return this.state;
  }
  
  /**
   * Get the progress of the group (0-1)
   * @returns Progress value
   */
  getProgress(): number {
    if (this.state === SyncGroupState.INITIALIZING || this.state === SyncGroupState.READY) {
      return 0;
    }
    
    if (this.state === SyncGroupState.COMPLETED) {
      return 1;
    }
    
    if (this.state === SyncGroupState.CANCELED) {
      return 0;
    }
    
    const now = this.state === SyncGroupState.PAUSED && this.pauseTime !== null 
      ? this.pauseTime 
      : performance.now();
      
    const elapsed = now - this.groupStartTime;
    
    return Math.min(1, Math.max(0, elapsed / this.groupDuration));
  }
  
  /**
   * Add a listener for a specific animation's sync points
   * @param animationId Animation identifier
   * @param listener Callback function
   * @returns This group for chaining
   */
  addSyncPointListener(
    animationId: string,
    listener: (point: SyncPoint) => void
  ): SynchronizedGroup {
    if (!this.syncPointListeners.has(animationId)) {
      this.syncPointListeners.set(animationId, new Set());
    }
    
    this.syncPointListeners.get(animationId)!.add(listener);
    
    return this;
  }
  
  /**
   * Remove a sync point listener
   * @param animationId Animation identifier
   * @param listener Callback function to remove
   * @returns This group for chaining
   */
  removeSyncPointListener(
    animationId: string,
    listener: (point: SyncPoint) => void
  ): SynchronizedGroup {
    const listeners = this.syncPointListeners.get(animationId);
    
    if (listeners) {
      listeners.delete(listener);
    }
    
    return this;
  }
  
  /**
   * Connect an animation state machine to an animation's sync points
   * @param animationId Animation identifier
   * @param stateMachine Animation state machine
   * @param stateMap Mapping of sync point IDs to state IDs
   * @returns This group for chaining
   */
  connectStateMachine(
    animationId: string,
    stateMachine: AnimationStateMachine,
    stateMap: Record<string, string>
  ): SynchronizedGroup {
    // Store state machine
    this.activeStates.set(animationId, stateMachine);
    
    // Create a listener that transitions the state machine
    const listener = (point: SyncPoint) => {
      const stateId = stateMap[point.id];
      
      if (stateId) {
        // Send event to state machine
        stateMachine.send('syncPoint', { pointId: point.id, stateId });
      }
    };
    
    // Add the listener
    this.addSyncPointListener(animationId, listener);
    
    return this;
  }
  
  /**
   * Disconnect a state machine from an animation
   * @param animationId Animation identifier
   * @returns This group for chaining
   */
  disconnectStateMachine(animationId: string): SynchronizedGroup {
    this.activeStates.delete(animationId);
    return this;
  }
  
  /**
   * Transition an animation to a specific state
   * @param animationId Animation identifier
   * @param state State to transition to
   */
  private transitionState(animationId: string, state: AnimationState): void {
    const stateMachine = this.activeStates.get(animationId);
    
    if (stateMachine) {
      // If state machine exists, send event to transition
      stateMachine.send('transitionTo', { stateId: state.id });
    } else {
      // Otherwise, apply state directly to element
      const animation = this.animations.get(animationId);
      
      if (animation) {
        let target: HTMLElement | null = null;
        
        if (typeof animation.target === 'string') {
          target = document.querySelector(animation.target);
        } else {
          target = animation.target as HTMLElement;
        }
        
        if (target) {
          // Apply state properties and styles
          if (state.properties) {
            Object.entries(state.properties).forEach(([key, value]) => {
              // @ts-ignore - dynamically setting properties
              target![key] = value;
            });
          }
          
          if (state.styles) {
            Object.entries(state.styles).forEach(([key, value]) => {
              target!.style.setProperty(key, value);
            });
          }
        }
      }
    }
  }
  
  /**
   * Calculate timings using the common duration strategy
   * @param animations Array of animations to synchronize
   */
  private calculateCommonDurationTimings(animations: SyncedAnimation[]): void {
    // Determine group duration (use provided or calculate)
    const providedDuration = this.options.duration;
    let maxDuration = 0;
    
    if (!providedDuration) {
      // Find the longest animation duration
      animations.forEach(animation => {
        maxDuration = Math.max(maxDuration, animation.duration);
      });
    }
    
    this.groupDuration = providedDuration || maxDuration;
    
    // For each animation, calculate timing
    animations.forEach(animation => {
      // Start all animations at the same time
      this.startTimes.set(animation.id, 0);
      
      // Adjust durations if required
      if (this.options.adaptTimings !== false && animation.adaptTiming !== false) {
        // Scale animation to match group duration
        this.durations.set(animation.id, this.groupDuration);
      } else {
        // Use original duration
        this.durations.set(animation.id, animation.duration);
      }
      
      // Calculate sync points
      this.calculateSyncPoints(animation);
    });
  }
  
  /**
   * Calculate timings using the aligned sync points strategy
   * @param animations Array of animations to synchronize
   */
  private calculateAlignedSyncPointTimings(animations: SyncedAnimation[]): void {
    // This strategy aligns specific sync points across animations
    // Start by getting all sync points
    const allSyncPoints = new Set<string>();
    
    // Add group sync points
    if (this.options.syncPoints) {
      this.options.syncPoints.forEach(point => {
        allSyncPoints.add(point.id);
      });
    }
    
    // Add animation-specific sync points
    animations.forEach(animation => {
      if (animation.syncPoints) {
        animation.syncPoints.forEach(point => {
          allSyncPoints.add(point.id);
        });
      }
    });
    
    // If no sync points, fall back to common duration
    if (allSyncPoints.size === 0) {
      return this.calculateCommonDurationTimings(animations);
    }
    
    // Calculate the position of each sync point relative to the group timeline
    const syncPointPositions = new Map<string, number>();
    
    // Group sync points take precedence
    if (this.options.syncPoints) {
      this.options.syncPoints.forEach(point => {
        syncPointPositions.set(point.id, point.position);
      });
    }
    
    // For each animation, calculate timing
    let maxEndTime = 0;
    
    animations.forEach(animation => {
      // Start all animations at the same time
      this.startTimes.set(animation.id, 0);
      
      // Create map for this animation's sync points
      const animationSyncMap = new Map<string, number>();
      this.syncPoints.set(animation.id, animationSyncMap);
      
      // Get animation-specific sync points
      const animSyncPoints = animation.syncPoints || [];
      
      // Map each sync point to absolute time
      allSyncPoints.forEach(syncPointId => {
        // Try to find this sync point in the animation's sync points
        const animSyncPoint = animSyncPoints.find(p => p.id === syncPointId);
        
        if (animSyncPoint) {
          // If found, use its position
          const relativeTime = animSyncPoint.position * animation.duration;
          animationSyncMap.set(syncPointId, relativeTime);
        } else if (syncPointPositions.has(syncPointId)) {
          // If not found but it's a group sync point, calculate time from group position
          const groupPosition = syncPointPositions.get(syncPointId)!;
          const relativeTime = groupPosition * animation.duration;
          animationSyncMap.set(syncPointId, relativeTime);
        }
      });
      
      // For adaptable animations, we'll adjust durations later
      if (this.options.adaptTimings !== false && animation.adaptTiming !== false) {
        // We'll calculate this after all animations are processed
      } else {
        // Use original duration
        this.durations.set(animation.id, animation.duration);
        maxEndTime = Math.max(maxEndTime, animation.duration);
      }
    });
    
    // Now adjust durations for adaptable animations
    if (this.options.adaptTimings !== false) {
      // Find the max end time
      const adaptableAnimations = animations.filter(
        a => a.adaptTiming !== false
      );
      
      if (adaptableAnimations.length > 0) {
        // If provided duration, use that
        const targetDuration = this.options.duration || maxEndTime;
        
        adaptableAnimations.forEach(animation => {
          // Scale animation to match target duration
          this.durations.set(animation.id, targetDuration);
          
          // Adjust sync point times
          const animSyncPoints = this.syncPoints.get(animation.id);
          if (animSyncPoints) {
            const originalDuration = animation.duration;
            const scaleFactor = targetDuration / originalDuration;
            
            // Recalculate each sync point time
            animSyncPoints.forEach((time, syncPointId) => {
              animSyncPoints.set(syncPointId, time * scaleFactor);
            });
          }
        });
        
        // Update group duration
        maxEndTime = Math.max(maxEndTime, targetDuration);
      }
    }
    
    // Set group duration
    this.groupDuration = this.options.duration || maxEndTime;
  }
  
  /**
   * Calculate timings using the simultaneous start strategy
   * @param animations Array of animations to synchronize
   */
  private calculateSimultaneousStartTimings(animations: SyncedAnimation[]): void {
    // All animations start at the same time but run at their original duration
    let maxDuration = 0;
    
    animations.forEach(animation => {
      // Start at time 0
      this.startTimes.set(animation.id, 0);
      
      // Use original duration
      this.durations.set(animation.id, animation.duration);
      
      // Track max duration for group
      maxDuration = Math.max(maxDuration, animation.duration);
      
      // Calculate sync points
      this.calculateSyncPoints(animation);
    });
    
    // Set group duration
    this.groupDuration = this.options.duration || maxDuration;
  }
  
  /**
   * Calculate timings using the simultaneous end strategy
   * @param animations Array of animations to synchronize
   */
  private calculateSimultaneousEndTimings(animations: SyncedAnimation[]): void {
    // All animations end at the same time by adjusting start times
    let maxDuration = 0;
    
    // First find the longest animation
    animations.forEach(animation => {
      maxDuration = Math.max(maxDuration, animation.duration);
    });
    
    // Set group duration
    this.groupDuration = this.options.duration || maxDuration;
    
    animations.forEach(animation => {
      if (this.options.adaptTimings !== false && animation.adaptTiming !== false) {
        // Adapt to common duration
        this.startTimes.set(animation.id, 0);
        this.durations.set(animation.id, this.groupDuration);
      } else {
        // Calculate start time to end simultaneously
        const startTime = this.groupDuration - animation.duration;
        this.startTimes.set(animation.id, Math.max(0, startTime));
        this.durations.set(animation.id, animation.duration);
      }
      
      // Calculate sync points
      this.calculateSyncPoints(animation);
    });
  }
  
  /**
   * Calculate timings using the cascade strategy
   * @param animations Array of animations to synchronize
   */
  private calculateCascadeTimings(animations: SyncedAnimation[]): void {
    // Cascading animations with fixed offset between them
    // First sort animations by their order property
    const sortedAnimations = [...animations].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });
    
    // Calculate cascade offset (default to 100ms)
    const cascadeOffset = 100;
    let currentStartTime = 0;
    let maxEndTime = 0;
    
    // Calculate start times in sequence
    sortedAnimations.forEach(animation => {
      // Set start time for this animation
      this.startTimes.set(animation.id, currentStartTime);
      
      // Use original duration
      this.durations.set(animation.id, animation.duration);
      
      // Calculate end time
      const endTime = currentStartTime + animation.duration;
      maxEndTime = Math.max(maxEndTime, endTime);
      
      // Increment start time for next animation
      currentStartTime += cascadeOffset;
      
      // Calculate sync points
      this.calculateSyncPoints(animation);
    });
    
    // Set group duration
    this.groupDuration = this.options.duration || maxEndTime;
  }
  
  /**
   * Calculate timings using a custom strategy
   * @param animations Array of animations to synchronize
   */
  private calculateCustomTimings(animations: SyncedAnimation[]): void {
    // Fallback to common duration if no custom function provided
    if (typeof this.options.customTimingCalculator !== 'function') {
      return this.calculateCommonDurationTimings(animations);
    }
    
    let maxEndTime = 0;
    
    // Call custom calculator for each animation
    animations.forEach(animation => {
      const result = this.options.customTimingCalculator!(animation, animations, this.options);
      
      // Set calculated timings
      this.startTimes.set(animation.id, result.startTime);
      this.durations.set(animation.id, result.duration);
      
      // Calculate end time
      const endTime = result.startTime + result.duration;
      maxEndTime = Math.max(maxEndTime, endTime);
      
      // Set custom sync points
      if (result.syncPoints) {
        this.syncPoints.set(animation.id, result.syncPoints);
      } else {
        // Calculate default sync points
        this.calculateSyncPoints(animation);
      }
    });
    
    // Set group duration
    this.groupDuration = this.options.duration || maxEndTime;
  }
  
  /**
   * Calculate sync points for an animation
   * @param animation Animation to calculate sync points for
   */
  private calculateSyncPoints(animation: SyncedAnimation): void {
    // Create map for this animation's sync points
    const syncMap = new Map<string, number>();
    this.syncPoints.set(animation.id, syncMap);
    
    // Get start time and duration
    const startTime = this.startTimes.get(animation.id) || 0;
    const duration = this.durations.get(animation.id) || animation.duration;
    
    // Process group sync points
    if (this.options.syncPoints) {
      this.options.syncPoints.forEach(point => {
        // Calculate absolute time for this sync point
        const relativeTime = point.position * duration;
        const absoluteTime = startTime + relativeTime;
        syncMap.set(point.id, absoluteTime);
      });
    }
    
    // Process animation-specific sync points (overriding group points)
    if (animation.syncPoints) {
      animation.syncPoints.forEach(point => {
        // Calculate absolute time for this sync point
        const relativeTime = point.position * duration;
        const absoluteTime = startTime + relativeTime;
        syncMap.set(point.id, absoluteTime);
      });
    }
    
    // Add standard phase sync points if not defined
    if (!syncMap.has(AnimationPhase.START)) {
      syncMap.set(AnimationPhase.START, startTime);
    }
    
    if (!syncMap.has(AnimationPhase.MIDDLE)) {
      syncMap.set(AnimationPhase.MIDDLE, startTime + (duration / 2));
    }
    
    if (!syncMap.has(AnimationPhase.END)) {
      syncMap.set(AnimationPhase.END, startTime + duration);
    }
  }
}

/**
 * Animation synchronizer singleton
 */
export class AnimationSynchronizer {
  /** Map of active sync groups */
  private groups: Map<string, SynchronizedGroup> = new Map();
  
  /** Orchestrator to use for animations */
  private orchestrator: AnimationOrchestrator;
  
  /**
   * Create a new animation synchronizer
   * @param orchestrator Optional animation orchestrator to use
   */
  constructor(orchestrator?: AnimationOrchestrator) {
    this.orchestrator = orchestrator || animationOrchestrator;
  }
  
  /**
   * Create a new synchronized animation group
   * @param options Group options
   * @returns New synchronized group
   */
  createSyncGroup(options: SyncGroupOptions): SynchronizedGroup {
    const group = new SynchronizedGroup(options, this.orchestrator);
    this.groups.set(options.id, group);
    return group;
  }
  
  /**
   * Get an existing synchronized group
   * @param id Group identifier
   * @returns Synchronized group or undefined
   */
  getGroup(id: string): SynchronizedGroup | undefined {
    return this.groups.get(id);
  }
  
  /**
   * Remove a synchronized group
   * @param id Group identifier
   * @returns True if group was removed
   */
  removeGroup(id: string): boolean {
    const group = this.groups.get(id);
    
    if (group) {
      if (group.getState() === SyncGroupState.PLAYING) {
        group.cancel();
      }
      
      this.groups.delete(id);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all group IDs
   * @returns Array of group IDs
   */
  getGroupIds(): string[] {
    return Array.from(this.groups.keys());
  }
  
  /**
   * Create default sync points for common animation phases
   * @returns Array of sync points
   */
  createDefaultSyncPoints(): SyncPoint[] {
    return [
      {
        id: AnimationPhase.PREP,
        name: 'Preparation',
        phase: AnimationPhase.PREP,
        position: 0
      },
      {
        id: AnimationPhase.START,
        name: 'Start',
        phase: AnimationPhase.START,
        position: 0
      },
      {
        id: AnimationPhase.MIDDLE,
        name: 'Middle',
        phase: AnimationPhase.MIDDLE,
        position: 0.5
      },
      {
        id: AnimationPhase.END,
        name: 'End',
        phase: AnimationPhase.END,
        position: 1
      },
      {
        id: AnimationPhase.AFTER,
        name: 'After',
        phase: AnimationPhase.AFTER,
        position: 1
      }
    ];
  }
}

// Create and export a singleton instance
export const animationSynchronizer = new AnimationSynchronizer();

// Export custom timing calculator type
export interface SynchronizerCustomOptions extends SyncGroupOptions {
  customTimingCalculator?: TimingCalculator;
}