/**
 * Animation State Machine
 * 
 * A system for managing animation states and transitions between them.
 * This implementation provides a robust way to define complex animation 
 * state transitions with precise control over timing and behavior.
 */

import { MotionSensitivityLevel } from '../accessibility/MotionSensitivity';
import { AnimationPreset } from '../core/types';
import { animationOrchestrator } from './Orchestrator';

/**
 * Animation state definition
 */
export interface AnimationState {
  /** Unique identifier for this state */
  id: string;
  
  /** Human-readable name of the state */
  name: string;
  
  /** Animation preset to use when entering this state */
  enterAnimation?: AnimationPreset | string;
  
  /** Animation preset to use when exiting this state */
  exitAnimation?: AnimationPreset | string;
  
  /** Initial properties for elements in this state */
  properties?: Record<string, any>;
  
  /** Initial CSS styles for elements in this state */
  styles?: Record<string, string>;
  
  /** Duration to remain in this state (ms, 0 for indefinite) */
  duration?: number;
  
  /** Whether this is a terminal state */
  isTerminal?: boolean;
  
  /** Custom metadata for this state */
  meta?: Record<string, any>;
}

/**
 * State transition definition
 */
export interface StateTransition {
  /** Source state ID */
  from: string;
  
  /** Target state ID */
  to: string;
  
  /** Event that triggers this transition */
  on: string;
  
  /** Animation to use during this transition */
  animation?: AnimationPreset | string;
  
  /** Duration of the transition in milliseconds */
  duration?: number;
  
  /** Conditions for this transition */
  condition?: (context: TransitionContext) => boolean;
  
  /** Guard function that must return true for transition to occur */
  guard?: (context: TransitionContext) => boolean;
  
  /** Actions to perform during transition */
  actions?: Array<(context: TransitionContext) => void>;
  
  /** Properties to apply during transition */
  properties?: Record<string, any>;
  
  /** Whether this transition can be interrupted */
  interruptible?: boolean;
}

/**
 * State machine options
 */
export interface StateMachineOptions {
  /** Initial state ID */
  initialState: string;
  
  /** Optional target elements to animate */
  targets?: string | HTMLElement | NodeList | HTMLElement[] | null;
  
  /** Motion sensitivity level to respect */
  sensitivity?: MotionSensitivityLevel;
  
  /** Debug mode flag */
  debug?: boolean;
  
  /** Persist state to localStorage */
  persist?: boolean;
  
  /** Storage key for persistence */
  storageKey?: string;
  
  /** Callback when state changes */
  onStateChange?: (from: string, to: string, context: TransitionContext) => void;
}

/**
 * Transition context with state and event data
 */
export interface TransitionContext {
  /** Current state */
  currentState: string;
  
  /** Previous state */
  previousState: string;
  
  /** Event that triggered the transition */
  event: string;
  
  /** Event parameters */
  params: any;
  
  /** Target elements for animation */
  targets: HTMLElement[];
  
  /** Animation history */
  history: Array<{
    from: string;
    to: string;
    event: string;
    timestamp: number;
  }>;
  
  /** User-defined context data */
  data: Record<string, any>;
}

/**
 * Type for event handlers
 */
type EventHandler = (params?: any) => void;

/**
 * Animation State Machine to manage complex state transitions
 * with support for conditional transitions, guards, and actions
 */
export class AnimationStateMachine {
  /** State definitions */
  private states: Map<string, AnimationState> = new Map();
  
  /** Transition definitions */
  private transitions: StateTransition[] = [];
  
  /** Current state ID */
  private currentState: string;
  
  /** Previous state ID */
  private previousState = '';
  
  /** Transition context */
  private context: TransitionContext;
  
  /** Configuration options */
  private options: StateMachineOptions;
  
  /** Event handlers */
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  
  /** Active transition flag */
  private transitioning = false;
  
  /** Debug mode flag */
  private debug = false;
  
  /** Target element references */
  private targetElements: HTMLElement[] = [];
  
  /**
   * Create a new animation state machine
   * @param states State definitions
   * @param transitions Transition definitions
   * @param options Configuration options
   */
  constructor(
    states: AnimationState[],
    transitions: StateTransition[],
    options: StateMachineOptions
  ) {
    // Store options
    this.options = options;
    this.debug = options.debug || false;
    
    // Register states
    states.forEach(state => {
      this.states.set(state.id, state);
    });
    
    // Register transitions
    this.transitions = transitions;
    
    // Set initial state
    this.currentState = options.initialState;
    
    // Validate initial state
    if (!this.states.has(this.currentState)) {
      throw new Error(`Invalid initial state: ${this.currentState}`);
    }
    
    // Initialize context
    this.context = {
      currentState: this.currentState,
      previousState: '',
      event: '',
      params: null,
      targets: [],
      history: [],
      data: {}
    };
    
    // Resolve target elements
    if (options.targets) {
      this.targetElements = this.resolveTargets(options.targets);
      this.context.targets = this.targetElements;
    }
    
    // Restore state if persistence is enabled
    if (options.persist && options.storageKey) {
      this.restoreState();
    }
    
    // Apply initial state properties and styles
    this.applyStateStyles(this.currentState);
    
    // Log initialization
    if (this.debug) {
      console.log(`[AnimationStateMachine] Initialized with state: ${this.currentState}`);
      console.log(`[AnimationStateMachine] Registered ${states.length} states`);
      console.log(`[AnimationStateMachine] Registered ${transitions.length} transitions`);
    }
  }
  
  /**
   * Send an event to the state machine to trigger a transition
   * @param event Event name
   * @param params Event parameters
   * @returns Promise that resolves when transition completes
   */
  async send(event: string, params: any = {}): Promise<boolean> {
    // Check if we're already transitioning
    if (this.transitioning) {
      if (this.debug) {
        console.warn(`[AnimationStateMachine] Already transitioning, event "${event}" ignored`);
      }
      return false;
    }
    
    // Set transitioning flag
    this.transitioning = true;
    
    // Find matching transition
    const transition = this.findTransition(this.currentState, event);
    
    // If no matching transition, emit event and return
    if (!transition) {
      this.emit(event, params);
      this.transitioning = false;
      if (this.debug) {
        console.warn(`[AnimationStateMachine] No transition found for event "${event}" from state "${this.currentState}"`);
      }
      return false;
    }
    
    // Update context
    this.context.event = event;
    this.context.params = params;
    
    // Check transition condition
    if (transition.condition && !transition.condition(this.context)) {
      this.transitioning = false;
      if (this.debug) {
        console.log(`[AnimationStateMachine] Transition condition failed for event "${event}"`);
      }
      return false;
    }
    
    // Check transition guard
    if (transition.guard && !transition.guard(this.context)) {
      this.transitioning = false;
      if (this.debug) {
        console.log(`[AnimationStateMachine] Transition guard rejected for event "${event}"`);
      }
      return false;
    }
    
    // Get source and target states
    const sourceState = this.states.get(this.currentState)!;
    const targetState = this.states.get(transition.to)!;
    
    // Log transition
    if (this.debug) {
      console.log(`[AnimationStateMachine] Transitioning from "${this.currentState}" to "${transition.to}" on event "${event}"`);
    }
    
    // Execute exit animation if defined
    if (sourceState.exitAnimation) {
      await this.animateTransition(sourceState.exitAnimation, 'exit');
    }
    
    // Execute transition animation if defined
    if (transition.animation) {
      await this.animateTransition(transition.animation, 'transition');
    }
    
    // Execute transition actions
    if (transition.actions) {
      for (const action of transition.actions) {
        action(this.context);
      }
    }
    
    // Record previous state
    this.previousState = this.currentState;
    
    // Update current state
    this.currentState = transition.to;
    
    // Update context
    this.context.previousState = this.previousState;
    this.context.currentState = this.currentState;
    
    // Apply new state styles
    this.applyStateStyles(this.currentState);
    
    // Execute enter animation if defined
    if (targetState.enterAnimation) {
      await this.animateTransition(targetState.enterAnimation, 'enter');
    }
    
    // Record transition in history
    this.context.history.push({
      from: this.previousState,
      to: this.currentState,
      event,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.context.history.length > 50) {
      this.context.history.shift();
    }
    
    // Save state if persistence is enabled
    if (this.options.persist && this.options.storageKey) {
      this.saveState();
    }
    
    // Call state change callback
    if (this.options.onStateChange) {
      this.options.onStateChange(this.previousState, this.currentState, this.context);
    }
    
    // Emit state change events
    this.emit('stateChanged', { from: this.previousState, to: this.currentState });
    this.emit(`state:${this.currentState}`, {});
    
    // Clear transitioning flag
    this.transitioning = false;
    
    // Check for auto-transitions based on state duration
    const currentStateObj = this.states.get(this.currentState);
    if (currentStateObj && currentStateObj.duration && currentStateObj.duration > 0) {
      setTimeout(() => {
        // Find a transition with event "timeout" from the current state
        const timeoutTransition = this.findTransition(this.currentState, 'timeout');
        if (timeoutTransition) {
          this.send('timeout');
        }
      }, currentStateObj.duration);
    }
    
    return true;
  }
  
  /**
   * Find a transition that matches the current state and event
   * @param stateId Current state ID
   * @param event Event name
   * @returns Matching transition or undefined
   */
  private findTransition(stateId: string, event: string): StateTransition | undefined {
    return this.transitions.find(t => t.from === stateId && t.on === event);
  }
  
  /**
   * Apply state styles to target elements
   * @param stateId State ID to apply
   */
  private applyStateStyles(stateId: string): void {
    const state = this.states.get(stateId);
    if (!state) return;
    
    const { styles, properties } = state;
    
    // Apply to all target elements
    this.targetElements.forEach(element => {
      // Apply properties
      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          // @ts-ignore - dynamically setting properties
          element[key] = value;
        });
      }
      
      // Apply styles
      if (styles) {
        Object.entries(styles).forEach(([key, value]) => {
          element.style.setProperty(key, value);
        });
      }
    });
  }
  
  /**
   * Animate a transition
   * @param animation Animation preset or name
   * @param phase Transition phase (enter, exit, transition)
   * @returns Promise that resolves when animation completes
   */
  private async animateTransition(
    animation: AnimationPreset | string,
    phase: 'enter' | 'exit' | 'transition'
  ): Promise<void> {
    if (this.targetElements.length === 0) return Promise.resolve();
    
    return new Promise((resolve) => {
      // Create a unique ID for this animation
      const animationId = `state-${this.currentState}-${phase}-${Date.now()}`;
      
      // Create animation targets
      const targets = this.targetElements.map(element => ({
        target: element,
        animation: typeof animation === 'string' ? { keyframes: { name: animation } } : animation,
        waitForCompletion: true
      }));
      
      // Create animation sequence
      animationOrchestrator.createSequence(animationId, {
        targets,
        parallel: true,
        sensitivity: this.options.sensitivity,
        autoPlay: true
      });
      
      // Listen for completion
      animationOrchestrator.addEventListener('complete', (event) => {
        if (event.animation === animationId) {
          resolve();
        }
      });
    });
  }
  
  /**
   * Resolve target elements from selector, element, or NodeList
   * @param targets Target selector, element, or collection
   * @returns Array of HTMLElements
   */
  private resolveTargets(
    targets: string | HTMLElement | NodeList | HTMLElement[] | null
  ): HTMLElement[] {
    if (!targets) return [];
    
    // If targets is a string selector
    if (typeof targets === 'string') {
      const elements = document.querySelectorAll(targets);
      return Array.from(elements) as HTMLElement[];
    }
    
    // If targets is an HTMLElement
    if (targets instanceof HTMLElement) {
      return [targets];
    }
    
    // If targets is a NodeList
    if (targets instanceof NodeList) {
      return Array.from(targets) as HTMLElement[];
    }
    
    // If targets is an array of HTMLElements
    if (Array.isArray(targets)) {
      return targets.filter(el => el instanceof HTMLElement) as HTMLElement[];
    }
    
    return [];
  }
  
  /**
   * Add an event listener
   * @param event Event name
   * @param handler Event handler function
   * @returns This state machine for chaining
   */
  on(event: string, handler: EventHandler): AnimationStateMachine {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler);
    return this;
  }
  
  /**
   * Remove an event listener
   * @param event Event name
   * @param handler Event handler function to remove
   * @returns This state machine for chaining
   */
  off(event: string, handler: EventHandler): AnimationStateMachine {
    if (!this.eventHandlers.has(event)) return this;
    
    const handlers = this.eventHandlers.get(event)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Emit an event
   * @param event Event name
   * @param params Event parameters
   * @returns This state machine for chaining
   */
  private emit(event: string, params: any = {}): AnimationStateMachine {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)!;
      handlers.forEach(handler => handler(params));
    }
    
    // Also emit wildcard events
    if (this.eventHandlers.has('*')) {
      const handlers = this.eventHandlers.get('*')!;
      handlers.forEach(handler => handler({ event, params }));
    }
    
    return this;
  }
  
  /**
   * Save current state to localStorage
   */
  private saveState(): void {
    if (!this.options.storageKey) return;
    
    try {
      const data = {
        currentState: this.currentState,
        previousState: this.previousState,
        history: this.context.history,
        data: this.context.data
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(data));
    } catch (error) {
      if (this.debug) {
        console.error('[AnimationStateMachine] Failed to save state to localStorage', error);
      }
    }
  }
  
  /**
   * Restore state from localStorage
   */
  private restoreState(): void {
    if (!this.options.storageKey) return;
    
    try {
      const saved = localStorage.getItem(this.options.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        
        // Validate the restored state exists
        if (data.currentState && this.states.has(data.currentState)) {
          this.currentState = data.currentState;
          this.previousState = data.previousState || '';
          this.context.currentState = this.currentState;
          this.context.previousState = this.previousState;
          this.context.history = data.history || [];
          this.context.data = data.data || {};
          
          if (this.debug) {
            console.log(`[AnimationStateMachine] Restored state: ${this.currentState}`);
          }
        }
      }
    } catch (error) {
      if (this.debug) {
        console.error('[AnimationStateMachine] Failed to restore state from localStorage', error);
      }
    }
  }
  
  /**
   * Get current state
   * @returns Current state ID
   */
  getState(): string {
    return this.currentState;
  }
  
  /**
   * Get previous state
   * @returns Previous state ID
   */
  getPreviousState(): string {
    return this.previousState;
  }
  
  /**
   * Check if machine is in a specific state
   * @param stateId State ID to check
   * @returns True if current state matches
   */
  is(stateId: string): boolean {
    return this.currentState === stateId;
  }
  
  /**
   * Check if machine can transition to a target state
   * @param event Event to check
   * @returns True if a valid transition exists
   */
  can(event: string): boolean {
    return this.findTransition(this.currentState, event) !== undefined;
  }
  
  /**
   * Get all available transitions from current state
   * @returns Array of possible transitions
   */
  getAvailableTransitions(): StateTransition[] {
    return this.transitions.filter(t => t.from === this.currentState);
  }
  
  /**
   * Reset state machine to initial state
   * @returns Promise that resolves when reset completes
   */
  async reset(): Promise<boolean> {
    return this.send('reset');
  }
  
  /**
   * Set context data
   * @param key Data key
   * @param value Data value
   * @returns This state machine for chaining
   */
  setData(key: string, value: any): AnimationStateMachine {
    this.context.data[key] = value;
    return this;
  }
  
  /**
   * Get context data
   * @param key Data key
   * @returns Data value
   */
  getData(key: string): any {
    return this.context.data[key];
  }
  
  /**
   * Get transition history
   * @returns Transition history array
   */
  getHistory(): TransitionContext['history'] {
    return [...this.context.history];
  }
  
  /**
   * Clear transition history
   * @returns This state machine for chaining
   */
  clearHistory(): AnimationStateMachine {
    this.context.history = [];
    return this;
  }
}

/**
 * Create a new animation state machine
 * @param states State definitions
 * @param transitions Transition definitions
 * @param options Configuration options
 * @returns New animation state machine instance
 */
export function createAnimationStateMachine(
  states: AnimationState[],
  transitions: StateTransition[],
  options: StateMachineOptions
): AnimationStateMachine {
  return new AnimationStateMachine(states, transitions, options);
}

export default AnimationStateMachine;