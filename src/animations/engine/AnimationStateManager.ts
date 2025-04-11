/**
 * Animation State Manager
 * 
 * Implements a state machine pattern for animation state management.
 * Provides a predictable way to manage animation state transitions.
 */

import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * Animation states
 */
export enum AnimationState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

/**
 * Animation events that trigger state transitions
 */
export enum AnimationEvent {
  PREPARE = 'prepare',
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
  ERROR = 'error',
  RESET = 'reset'
}

/**
 * Animation state transition
 */
export interface StateTransition {
  /**
   * Source state
   */
  from: AnimationState;
  
  /**
   * Event that triggers the transition
   */
  event: AnimationEvent;
  
  /**
   * Target state
   */
  to: AnimationState;
}

/**
 * Animation state handler
 */
export type StateHandler = (prevState: AnimationState, event: AnimationEvent) => void;

/**
 * Animation state manager interface
 */
export interface AnimationStateManager {
  /**
   * Current animation state
   */
  readonly state: AnimationState;
  
  /**
   * Transition to a new state
   */
  transition: (event: AnimationEvent) => boolean;
  
  /**
   * Register a handler for state changes
   */
  onStateChange: (handler: StateHandler) => () => void;
  
  /**
   * Check if a transition is valid
   */
  canTransition: (event: AnimationEvent) => boolean;
  
  /**
   * Reset to the initial state
   */
  reset: () => void;
}

/**
 * State machine-based animation state manager
 */
export class StateMachineAnimationStateManager implements AnimationStateManager {
  /**
   * Current animation state
   */
  private _state: AnimationState = AnimationState.IDLE;
  
  /**
   * List of valid state transitions
   */
  private transitions: StateTransition[] = [
    // From IDLE
    { from: AnimationState.IDLE, event: AnimationEvent.PREPARE, to: AnimationState.PREPARING },
    { from: AnimationState.IDLE, event: AnimationEvent.START, to: AnimationState.RUNNING },
    { from: AnimationState.IDLE, event: AnimationEvent.ERROR, to: AnimationState.ERROR },
    
    // From PREPARING
    { from: AnimationState.PREPARING, event: AnimationEvent.START, to: AnimationState.RUNNING },
    { from: AnimationState.PREPARING, event: AnimationEvent.CANCEL, to: AnimationState.CANCELLED },
    { from: AnimationState.PREPARING, event: AnimationEvent.ERROR, to: AnimationState.ERROR },
    
    // From RUNNING
    { from: AnimationState.RUNNING, event: AnimationEvent.PAUSE, to: AnimationState.PAUSED },
    { from: AnimationState.RUNNING, event: AnimationEvent.COMPLETE, to: AnimationState.COMPLETED },
    { from: AnimationState.RUNNING, event: AnimationEvent.CANCEL, to: AnimationState.CANCELLED },
    { from: AnimationState.RUNNING, event: AnimationEvent.ERROR, to: AnimationState.ERROR },
    
    // From PAUSED
    { from: AnimationState.PAUSED, event: AnimationEvent.RESUME, to: AnimationState.RUNNING },
    { from: AnimationState.PAUSED, event: AnimationEvent.CANCEL, to: AnimationState.CANCELLED },
    { from: AnimationState.PAUSED, event: AnimationEvent.ERROR, to: AnimationState.ERROR },
    
    // From COMPLETED
    { from: AnimationState.COMPLETED, event: AnimationEvent.RESET, to: AnimationState.IDLE },
    
    // From CANCELLED
    { from: AnimationState.CANCELLED, event: AnimationEvent.RESET, to: AnimationState.IDLE },
    
    // From ERROR
    { from: AnimationState.ERROR, event: AnimationEvent.RESET, to: AnimationState.IDLE },
  ];
  
  /**
   * State change handlers
   */
  private handlers: StateHandler[] = [];
  
  /**
   * Get the current animation state
   */
  get state(): AnimationState {
    return this._state;
  }
  
  /**
   * Transition to a new state
   */
  transition(event: AnimationEvent): boolean {
    const currentState = this._state;
    const transition = this.transitions.find(
      t => t.from === currentState && t.event === event
    );
    
    if (!transition) {
      console.warn(
        `Invalid state transition: ${currentState} -> ${event}. ` +
        `No defined transition for this combination.`
      );
      return false;
    }
    
    const prevState = this._state;
    this._state = transition.to;
    
    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler(prevState, event);
      } catch (error) {
        console.error('Error in animation state handler:', error);
      }
    });
    
    return true;
  }
  
  /**
   * Register a handler for state changes
   * @returns A function to unregister the handler
   */
  onStateChange(handler: StateHandler): () => void {
    this.handlers.push(handler);
    
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index !== -1) {
        this.handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Check if a transition is valid
   */
  canTransition(event: AnimationEvent): boolean {
    return this.transitions.some(
      t => t.from === this._state && t.event === event
    );
  }
  
  /**
   * Reset to the initial state
   */
  reset(): void {
    const prevState = this._state;
    this._state = AnimationState.IDLE;
    
    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler(prevState, AnimationEvent.RESET);
      } catch (error) {
        console.error('Error in animation state handler:', error);
      }
    });
  }
}

/**
 * Simple animation state manager
 * 
 * A simpler implementation without full state machine validation.
 */
export class SimpleAnimationStateManager implements AnimationStateManager {
  /**
   * Current animation state
   */
  private _state: AnimationState = AnimationState.IDLE;
  
  /**
   * State change handlers
   */
  private handlers: StateHandler[] = [];
  
  /**
   * Get the current animation state
   */
  get state(): AnimationState {
    return this._state;
  }
  
  /**
   * Transition to a new state
   */
  transition(event: AnimationEvent): boolean {
    const prevState = this._state;
    
    switch (event) {
      case AnimationEvent.PREPARE:
        this._state = AnimationState.PREPARING;
        break;
      case AnimationEvent.START:
        this._state = AnimationState.RUNNING;
        break;
      case AnimationEvent.PAUSE:
        this._state = AnimationState.PAUSED;
        break;
      case AnimationEvent.RESUME:
        this._state = AnimationState.RUNNING;
        break;
      case AnimationEvent.COMPLETE:
        this._state = AnimationState.COMPLETED;
        break;
      case AnimationEvent.CANCEL:
        this._state = AnimationState.CANCELLED;
        break;
      case AnimationEvent.ERROR:
        this._state = AnimationState.ERROR;
        break;
      case AnimationEvent.RESET:
        this._state = AnimationState.IDLE;
        break;
      default:
        return false;
    }
    
    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler(prevState, event);
      } catch (error) {
        console.error('Error in animation state handler:', error);
      }
    });
    
    return true;
  }
  
  /**
   * Register a handler for state changes
   * @returns A function to unregister the handler
   */
  onStateChange(handler: StateHandler): () => void {
    this.handlers.push(handler);
    
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index !== -1) {
        this.handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Check if a transition is valid
   */
  canTransition(event: AnimationEvent): boolean {
    // Simplified check without full state machine validation
    return true;
  }
  
  /**
   * Reset to the initial state
   */
  reset(): void {
    const prevState = this._state;
    this._state = AnimationState.IDLE;
    
    // Notify handlers
    this.handlers.forEach(handler => {
      try {
        handler(prevState, AnimationEvent.RESET);
      } catch (error) {
        console.error('Error in animation state handler:', error);
      }
    });
  }
}

/**
 * Create a new animation state manager
 */
export function createAnimationStateManager(): AnimationStateManager {
  return isFeatureEnabled('ANIMATION_STATE_MACHINE')
    ? new StateMachineAnimationStateManager()
    : new SimpleAnimationStateManager();
} 