/**
 * Game Animation Event Emitter
 * 
 * Extends the core AnimationEventEmitter to provide specialized
 * event handling for game animation state transitions.
 */

import { 
  AnimationEventEmitter, 
  AnimationEventMiddleware,
  AnimationEvent
} from '../orchestration/AnimationEventSystem';
import { StateTransition, GameAnimationState } from '../types';

// Event types specific to game animations
export enum GameAnimationEventType {
  STATE_BEFORE_CHANGE = 'state:beforeChange',
  STATE_CHANGE = 'state:change',
  STATE_AFTER_CHANGE = 'state:afterChange',
  TRANSITION_START = 'transition:start',
  TRANSITION_PROGRESS = 'transition:progress',
  TRANSITION_COMPLETE = 'transition:complete',
  TRANSITION_CANCEL = 'transition:cancel',
  TRANSITION_ERROR = 'transition:error',
  ANIMATION_ERROR = 'animation:error',
  ANIMATION_RECOVERY = 'animation:recovery',
  RESOURCE_LOAD = 'resource:load',
  RESOURCE_ERROR = 'resource:error'
}

// Data structure for state change events
export interface StateChangeEventData {
  previousStateId: string | null;
  newStateId: string;
  previousState?: GameAnimationState | null;
  newState?: GameAnimationState;
  transition?: StateTransition;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Data structure for transition events
export interface TransitionEventData {
  transition: StateTransition;
  progress?: number;
  fromStateId: string;
  toStateId: string;
  error?: Error;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Data structure for animation error events
export interface AnimationErrorEventData {
  error: Error;
  source: string;
  recoverable: boolean;
  context?: Record<string, any>;
  timestamp: number;
}

/**
 * Specialized event emitter for game animation events
 */
export class GameAnimationEventEmitter extends AnimationEventEmitter {
  /** Event middleware chain */
  private middleware: AnimationEventMiddleware[] = [];
  
  /**
   * Create a new game animation event emitter
   * @param id Unique identifier for this emitter
   */
  constructor(id: string) {
    super(id);
  }
  
  /**
   * Add an event middleware function to the chain
   * @param middleware The middleware function to add
   * @returns This emitter instance for chaining
   */
  addMiddleware(middleware: AnimationEventMiddleware): GameAnimationEventEmitter {
    this.middleware.push(middleware);
    return this;
  }
  
  /**
   * Remove an event middleware function from the chain
   * @param middleware The middleware function to remove
   * @returns This emitter instance for chaining
   */
  removeMiddleware(middleware: AnimationEventMiddleware): GameAnimationEventEmitter {
    const index = this.middleware.indexOf(middleware);
    if (index !== -1) {
      this.middleware.splice(index, 1);
    }
    return this;
  }
  
  /**
   * Override dispatchEvent to implement middleware
   * @param event Event to dispatch
   * @returns True if the event wasn't canceled
   */
  dispatchEvent(event: AnimationEvent): boolean {
    // Apply middleware chain
    if (this.middleware.length > 0) {
      let index = 0;
      
      const next = (evt: AnimationEvent) => {
        if (index < this.middleware.length) {
          const current = this.middleware[index++];
          current(evt, next);
        } else {
          // End of middleware chain, call parent dispatch
          super.dispatchEvent(evt);
        }
      };
      
      next(event);
      return !event.preventDefault;
    } else {
      // No middleware, call parent dispatch directly
      return super.dispatchEvent(event);
    }
  }
  
  /**
   * Emit a state change event before the transition starts
   * @param data State change event data
   * @returns True if the event wasn't canceled
   */
  emitBeforeStateChange(data: StateChangeEventData): boolean {
    return this.emit<StateChangeEventData>(
      GameAnimationEventType.STATE_BEFORE_CHANGE,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a state change event when the state actually changes
   * @param data State change event data
   * @returns True if the event wasn't canceled
   */
  emitStateChange(data: StateChangeEventData): boolean {
    return this.emit<StateChangeEventData>(
      GameAnimationEventType.STATE_CHANGE,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a state change event after the transition completes
   * @param data State change event data
   * @returns True if the event wasn't canceled
   */
  emitAfterStateChange(data: StateChangeEventData): boolean {
    return this.emit<StateChangeEventData>(
      GameAnimationEventType.STATE_AFTER_CHANGE,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a transition start event
   * @param data Transition event data
   * @returns True if the event wasn't canceled
   */
  emitTransitionStart(data: TransitionEventData): boolean {
    return this.emit<TransitionEventData>(
      GameAnimationEventType.TRANSITION_START,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a transition progress event
   * @param data Transition event data with progress
   * @returns True if the event wasn't canceled
   */
  emitTransitionProgress(data: TransitionEventData & { progress: number }): boolean {
    return this.emit<TransitionEventData>(
      GameAnimationEventType.TRANSITION_PROGRESS,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a transition complete event
   * @param data Transition event data
   * @returns True if the event wasn't canceled
   */
  emitTransitionComplete(data: TransitionEventData): boolean {
    return this.emit<TransitionEventData>(
      GameAnimationEventType.TRANSITION_COMPLETE,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a transition cancel event
   * @param data Transition event data
   * @returns True if the event wasn't canceled
   */
  emitTransitionCancel(data: TransitionEventData): boolean {
    return this.emit<TransitionEventData>(
      GameAnimationEventType.TRANSITION_CANCEL,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit a transition error event
   * @param data Transition event data with error
   * @returns True if the event wasn't canceled
   */
  emitTransitionError(data: TransitionEventData & { error: Error }): boolean {
    return this.emit<TransitionEventData>(
      GameAnimationEventType.TRANSITION_ERROR,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit an animation error event
   * @param data Animation error event data
   * @returns True if the event wasn't canceled
   */
  emitAnimationError(data: AnimationErrorEventData): boolean {
    return this.emit<AnimationErrorEventData>(
      GameAnimationEventType.ANIMATION_ERROR,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
  
  /**
   * Emit an animation recovery event
   * @param data Animation error recovery data
   * @returns True if the event wasn't canceled
   */
  emitAnimationRecovery(data: AnimationErrorEventData & { resolution: string }): boolean {
    return this.emit<AnimationErrorEventData & { resolution: string }>(
      GameAnimationEventType.ANIMATION_RECOVERY,
      {
        ...data,
        timestamp: data.timestamp || performance.now()
      }
    );
  }
} 