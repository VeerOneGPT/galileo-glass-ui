/**
 * Animation Event System
 *
 * Provides a comprehensive event system for animation lifecycle hooks and
 * communication between animation components.
 */

/**
 * Animation lifecycle event types
 */
export enum AnimationEventType {
  /** Animation is about to start */
  BEFORE_START = 'beforeStart',
  
  /** Animation has started */
  START = 'start',
  
  /** Animation is running (fires periodically) */
  UPDATE = 'update',
  
  /** Animation is at a specific progress percentage */
  PROGRESS = 'progress',
  
  /** Animation has been paused */
  PAUSE = 'pause',
  
  /** Animation has been resumed after pause */
  RESUME = 'resume',
  
  /** Animation is about to complete */
  BEFORE_COMPLETE = 'beforeComplete',
  
  /** Animation has completed */
  COMPLETE = 'complete',
  
  /** Animation has been canceled */
  CANCEL = 'cancel',
  
  /** Animation has been reversed */
  REVERSE = 'reverse',
  
  /** Animation has repeated (loop) */
  REPEAT = 'repeat',
  
  /** Animation has reached a labeled position */
  LABEL = 'label',
  
  /** Animation has reached a keyframe */
  KEYFRAME = 'keyframe',
  
  /** Animation property has changed */
  PROPERTY_CHANGE = 'propertyChange',
  
  /** Custom or user-defined event */
  CUSTOM = 'custom',
}

/**
 * Animation interaction event types
 */
export enum AnimationInteractionType {
  /** Mouse enter event */
  MOUSE_ENTER = 'mouseEnter',
  
  /** Mouse leave event */
  MOUSE_LEAVE = 'mouseLeave',
  
  /** Mouse down event */
  MOUSE_DOWN = 'mouseDown',
  
  /** Mouse up event */
  MOUSE_UP = 'mouseUp',
  
  /** Mouse move event */
  MOUSE_MOVE = 'mouseMove',
  
  /** Focus event */
  FOCUS = 'focus',
  
  /** Blur event */
  BLUR = 'blur',
  
  /** Touch start event */
  TOUCH_START = 'touchStart',
  
  /** Touch end event */
  TOUCH_END = 'touchEnd',
  
  /** Touch move event */
  TOUCH_MOVE = 'touchMove',
  
  /** Gesture start event */
  GESTURE_START = 'gestureStart',
  
  /** Gesture end event */
  GESTURE_END = 'gestureEnd',
  
  /** Gesture update event */
  GESTURE_UPDATE = 'gestureUpdate',
}

/**
 * Animation event data interface
 */
export interface AnimationEvent<T = any> {
  /** Type of animation event */
  type: AnimationEventType | AnimationInteractionType | string;
  
  /** Target animation or element ID */
  target: string;
  
  /** Animation ID if different from target */
  animation?: string;
  
  /** Event timestamp */
  timestamp: number;
  
  /** Animation progress (0-1) when the event fired */
  progress?: number;
  
  /** Animation elapsed time in milliseconds */
  elapsed?: number;
  
  /** Animation total duration in milliseconds */
  duration?: number;
  
  /** Event-specific data */
  data?: T;
  
  /** Event label (for labeled events) */
  label?: string;
  
  /** Whether event propagation should continue */
  propagate?: boolean;
  
  /** Whether the default action should be prevented */
  preventDefault?: boolean;
  
  /** Custom event metadata */
  meta?: Record<string, any>;
}

/**
 * Event listener function type
 */
export type AnimationEventListener<T = any> = (event: AnimationEvent<T>) => void;

/**
 * Event filter function type
 */
export type AnimationEventFilter = (event: AnimationEvent) => boolean;

/**
 * Event middleware function type (can transform events or block them)
 */
export type AnimationEventMiddleware = (
  event: AnimationEvent,
  next: (event: AnimationEvent) => void
) => void;

/**
 * Event options interface
 */
export interface AnimationEventOptions {
  /** Whether to capture events during bubbling phase */
  capture?: boolean;
  
  /** Whether listener should be called only once */
  once?: boolean;
  
  /** Event priority (higher priority listeners execute first) */
  priority?: number;
  
  /** Event filter condition */
  filter?: AnimationEventFilter;
  
  /** Context object to bind to the listener function */
  context?: any;
}

/**
 * Animation event target interface (objects that can receive events)
 */
export interface AnimationEventTarget {
  /** Add an event listener */
  addEventListener: (
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ) => void;
  
  /** Remove an event listener */
  removeEventListener: (
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ) => void;
  
  /** Dispatch an event */
  dispatchEvent: (event: AnimationEvent) => boolean;
}

/**
 * Animation event subscription token (for unsubscribing)
 */
export interface AnimationEventSubscription {
  /** Unsubscribe from the event */
  unsubscribe: () => void;
  
  /** Pause event notifications */
  pause: () => void;
  
  /** Resume event notifications */
  resume: () => void;
  
  /** Check if subscription is active */
  isActive: () => boolean;
}

/**
 * Animation event bus for global event communication
 */
export class AnimationEventBus implements AnimationEventTarget {
  /** Map of event listeners by type */
  private listeners: Map<string, Set<{
    listener: AnimationEventListener;
    options?: AnimationEventOptions;
  }>> = new Map();
  
  /** Event middleware chain */
  private middleware: AnimationEventMiddleware[] = [];
  
  /** Global event filters */
  private filters: AnimationEventFilter[] = [];
  
  /**
   * Add an event listener
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object for unsubscribing
   */
  addEventListener(
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    // Create listener set if it doesn't exist
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    // Add listener to set
    const listeners = this.listeners.get(type)!;
    const listenerEntry = { listener, options };
    listeners.add(listenerEntry);
    
    // Create subscription object
    let active = true;
    
    return {
      unsubscribe: () => {
        listeners.delete(listenerEntry);
        active = false;
      },
      pause: () => {
        active = false;
      },
      resume: () => {
        active = true;
      },
      isActive: () => active
    };
  }
  
  /**
   * Remove an event listener
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   */
  removeEventListener(
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ): void {
    const listeners = this.listeners.get(type);
    
    if (listeners) {
      // Find and remove the listener
      for (const entry of listeners) {
        if (entry.listener === listener) {
          listeners.delete(entry);
          break;
        }
      }
    }
  }
  
  /**
   * Dispatch an event to all registered listeners
   * @param event Event object
   * @returns True if the event wasn't canceled
   */
  dispatchEvent(event: AnimationEvent): boolean {
    // Apply global filters
    for (const filter of this.filters) {
      if (!filter(event)) {
        return true; // Skip this event
      }
    }
    
    // Apply middleware chain
    if (this.middleware.length > 0) {
      let index = 0;
      
      const next = (evt: AnimationEvent) => {
        if (index < this.middleware.length) {
          const current = this.middleware[index++];
          current(evt, next);
        } else {
          // End of middleware chain, execute listeners
          this.executeListeners(evt);
        }
      };
      
      next(event);
    } else {
      // No middleware, execute listeners directly
      this.executeListeners(event);
    }
    
    return !event.preventDefault;
  }
  
  /**
   * Execute listeners for an event
   * @param event Event object
   */
  private executeListeners(event: AnimationEvent): void {
    const listeners = this.listeners.get(event.type);
    
    if (!listeners || listeners.size === 0) {
      return;
    }
    
    // Sort listeners by priority (if specified)
    const sortedListeners = Array.from(listeners).sort((a, b) => {
      const priorityA = a.options?.priority || 0;
      const priorityB = b.options?.priority || 0;
      return priorityB - priorityA; // Higher priority first
    });
    
    // Execute listeners
    for (const { listener, options } of sortedListeners) {
      // Skip if listener is filtered out
      if (options?.filter && !options.filter(event)) {
        continue;
      }
      
      try {
        if (options?.context) {
          listener.call(options.context, event);
        } else {
          listener(event);
        }
        
        // Remove if once option is set
        if (options?.once) {
          listeners.delete({ listener, options });
        }
      } catch (error) {
        console.error('Error in animation event listener:', error);
      }
      
      // Stop propagation if requested
      if (!event.propagate) {
        break;
      }
    }
  }
  
  /**
   * Add an event middleware function
   * @param middleware Middleware function
   * @returns This event bus for chaining
   */
  addMiddleware(middleware: AnimationEventMiddleware): AnimationEventBus {
    this.middleware.push(middleware);
    return this;
  }
  
  /**
   * Remove an event middleware function
   * @param middleware Middleware function to remove
   * @returns This event bus for chaining
   */
  removeMiddleware(middleware: AnimationEventMiddleware): AnimationEventBus {
    const index = this.middleware.indexOf(middleware);
    
    if (index !== -1) {
      this.middleware.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Add a global event filter
   * @param filter Filter function
   * @returns This event bus for chaining
   */
  addFilter(filter: AnimationEventFilter): AnimationEventBus {
    this.filters.push(filter);
    return this;
  }
  
  /**
   * Remove a global event filter
   * @param filter Filter function to remove
   * @returns This event bus for chaining
   */
  removeFilter(filter: AnimationEventFilter): AnimationEventBus {
    const index = this.filters.indexOf(filter);
    
    if (index !== -1) {
      this.filters.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Create a new event
   * @param type Event type
   * @param target Target animation or element ID
   * @param data Event data
   * @returns Event object
   */
  createEvent<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    target: string,
    data?: T
  ): AnimationEvent<T> {
    return {
      type,
      target,
      timestamp: performance.now(),
      data,
      propagate: true
    };
  }
  
  /**
   * Emit an event
   * @param type Event type
   * @param target Target animation or element ID
   * @param data Event data
   * @returns True if the event wasn't canceled
   */
  emit<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    target: string,
    data?: T
  ): boolean {
    const event = this.createEvent(type, target, data);
    return this.dispatchEvent(event);
  }
  
  /**
   * Subscribe to an event type
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object
   */
  on<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    return this.addEventListener(type, listener as AnimationEventListener, options);
  }
  
  /**
   * Subscribe to an event type once
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object
   */
  once<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    return this.addEventListener(
      type,
      listener as AnimationEventListener,
      { ...options, once: true }
    );
  }
  
  /**
   * Unsubscribe from an event type
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   */
  off<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): void {
    this.removeEventListener(type, listener as AnimationEventListener, options);
  }
  
  /**
   * Clear all listeners for an event type
   * @param type Event type
   * @returns This event bus for chaining
   */
  clearListeners(type?: string): AnimationEventBus {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
    
    return this;
  }
  
  /**
   * Get all registered event types
   * @returns Array of event types
   */
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }
}

/**
 * Animation event emitter (mixin for adding event capabilities to any class)
 */
export class AnimationEventEmitter implements AnimationEventTarget {
  /** Map of event listeners by type */
  private listeners: Map<string, Set<{
    listener: AnimationEventListener;
    options?: AnimationEventOptions;
  }>> = new Map();
  
  /** Unique identifier for this emitter */
  private id: string;
  
  /** Parent event bus to bubble events to */
  private eventBus?: AnimationEventBus;
  
  /**
   * Create a new animation event emitter
   * @param id Unique identifier for this emitter
   * @param eventBus Optional parent event bus to bubble events to
   */
  constructor(id: string, eventBus?: AnimationEventBus) {
    this.id = id;
    this.eventBus = eventBus;
  }
  
  /**
   * Set the parent event bus
   * @param eventBus Event bus to bubble events to
   */
  setEventBus(eventBus: AnimationEventBus): void {
    this.eventBus = eventBus;
  }
  
  /**
   * Add an event listener
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object for unsubscribing
   */
  addEventListener(
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    // Create listener set if it doesn't exist
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    // Add listener to set
    const listeners = this.listeners.get(type)!;
    const listenerEntry = { listener, options };
    listeners.add(listenerEntry);
    
    // Create subscription object
    let active = true;
    
    return {
      unsubscribe: () => {
        listeners.delete(listenerEntry);
        active = false;
      },
      pause: () => {
        active = false;
      },
      resume: () => {
        active = true;
      },
      isActive: () => active
    };
  }
  
  /**
   * Remove an event listener
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   */
  removeEventListener(
    type: string,
    listener: AnimationEventListener,
    options?: AnimationEventOptions
  ): void {
    const listeners = this.listeners.get(type);
    
    if (listeners) {
      // Find and remove the listener
      for (const entry of listeners) {
        if (entry.listener === listener) {
          listeners.delete(entry);
          break;
        }
      }
    }
  }
  
  /**
   * Dispatch an event to all registered listeners
   * @param event Event object
   * @returns True if the event wasn't canceled
   */
  dispatchEvent(event: AnimationEvent): boolean {
    // Set target if not already set
    if (!event.target) {
      event.target = this.id;
    }
    
    const listeners = this.listeners.get(event.type);
    let canceled = false;
    
    if (listeners && listeners.size > 0) {
      // Sort listeners by priority (if specified)
      const sortedListeners = Array.from(listeners).sort((a, b) => {
        const priorityA = a.options?.priority || 0;
        const priorityB = b.options?.priority || 0;
        return priorityB - priorityA; // Higher priority first
      });
      
      // Execute listeners
      for (const { listener, options } of sortedListeners) {
        // Skip if listener is filtered out
        if (options?.filter && !options.filter(event)) {
          continue;
        }
        
        try {
          if (options?.context) {
            listener.call(options.context, event);
          } else {
            listener(event);
          }
          
          // Remove if once option is set
          if (options?.once) {
            listeners.delete({ listener, options });
          }
        } catch (error) {
          console.error('Error in animation event listener:', error);
        }
        
        // Check if event was canceled
        if (event.preventDefault) {
          canceled = true;
        }
        
        // Stop propagation if requested
        if (!event.propagate) {
          break;
        }
      }
    }
    
    // Bubble event to parent bus if propagation continues
    if (event.propagate && this.eventBus) {
      this.eventBus.dispatchEvent(event);
    }
    
    return !canceled;
  }
  
  /**
   * Create a new event
   * @param type Event type
   * @param data Event data
   * @returns Event object
   */
  createEvent<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    data?: T
  ): AnimationEvent<T> {
    return {
      type,
      target: this.id,
      timestamp: performance.now(),
      data,
      propagate: true
    };
  }
  
  /**
   * Emit an event
   * @param type Event type
   * @param data Event data
   * @returns True if the event wasn't canceled
   */
  emit<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    data?: T
  ): boolean {
    const event = this.createEvent(type, data);
    return this.dispatchEvent(event);
  }
  
  /**
   * Subscribe to an event type
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object
   */
  on<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    return this.addEventListener(type, listener as AnimationEventListener, options);
  }
  
  /**
   * Subscribe to an event type once
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   * @returns Subscription object
   */
  once<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): AnimationEventSubscription {
    return this.addEventListener(
      type,
      listener as AnimationEventListener,
      { ...options, once: true }
    );
  }
  
  /**
   * Unsubscribe from an event type
   * @param type Event type
   * @param listener Event listener function
   * @param options Event options
   */
  off<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ): void {
    this.removeEventListener(type, listener as AnimationEventListener, options);
  }
  
  /**
   * Clear all listeners for an event type
   * @param type Event type
   * @returns This event emitter for chaining
   */
  clearListeners(type?: string): AnimationEventEmitter {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
    
    return this;
  }
  
  /**
   * Get the unique identifier for this emitter
   * @returns Emitter ID
   */
  getId(): string {
    return this.id;
  }
}

/**
 * Global animation event bus singleton
 */
export const animationEventBus = new AnimationEventBus();

/**
 * Animation event manager to track and monitor all events
 */
export class AnimationEventManager {
  /** Global event bus instance */
  private eventBus: AnimationEventBus;
  
  /** Map of registered emitters */
  private emitters: Map<string, AnimationEventEmitter> = new Map();
  
  /** Event history for debugging */
  private eventHistory: AnimationEvent[] = [];
  
  /** Maximum event history size */
  private maxHistorySize = 100;
  
  /** Flag for debug mode */
  private debug = false;
  
  /**
   * Create a new animation event manager
   * @param eventBus Global event bus to use
   */
  constructor(eventBus: AnimationEventBus = animationEventBus) {
    this.eventBus = eventBus;
    
    // Add middleware to track events
    this.eventBus.addMiddleware((event, next) => {
      // Add to history
      this.addToHistory(event);
      
      // Log if in debug mode
      if (this.debug) {
        console.log(`[Animation Event] ${event.type} on ${event.target}`, event);
      }
      
      // Continue with next middleware
      next(event);
    });
  }
  
  /**
   * Register an event emitter
   * @param emitter Event emitter to register
   * @returns This manager for chaining
   */
  registerEmitter(emitter: AnimationEventEmitter): AnimationEventManager {
    this.emitters.set(emitter.getId(), emitter);
    emitter.setEventBus(this.eventBus);
    return this;
  }
  
  /**
   * Unregister an event emitter
   * @param emitterId Event emitter ID to unregister
   * @returns This manager for chaining
   */
  unregisterEmitter(emitterId: string): AnimationEventManager {
    this.emitters.delete(emitterId);
    return this;
  }
  
  /**
   * Get a registered emitter by ID
   * @param emitterId Emitter ID
   * @returns Event emitter or undefined
   */
  getEmitter(emitterId: string): AnimationEventEmitter | undefined {
    return this.emitters.get(emitterId);
  }
  
  /**
   * Add an event to the history
   * @param event Event to add
   */
  private addToHistory(event: AnimationEvent): void {
    this.eventHistory.push(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * Get the event history
   * @param limit Maximum number of events to return
   * @param filter Optional filter function
   * @returns Array of events
   */
  getEventHistory(
    limit?: number,
    filter?: (event: AnimationEvent) => boolean
  ): AnimationEvent[] {
    let events = this.eventHistory;
    
    // Apply filter if provided
    if (filter) {
      events = events.filter(filter);
    }
    
    // Apply limit if provided
    if (limit && limit > 0) {
      events = events.slice(-limit);
    }
    
    return events;
  }
  
  /**
   * Clear the event history
   * @returns This manager for chaining
   */
  clearEventHistory(): AnimationEventManager {
    this.eventHistory = [];
    return this;
  }
  
  /**
   * Set the maximum history size
   * @param size Maximum number of events to keep
   * @returns This manager for chaining
   */
  setMaxHistorySize(size: number): AnimationEventManager {
    this.maxHistorySize = size;
    
    // Trim history if needed
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
    
    return this;
  }
  
  /**
   * Enable or disable debug mode
   * @param enabled Whether debug mode is enabled
   * @returns This manager for chaining
   */
  setDebugMode(enabled: boolean): AnimationEventManager {
    this.debug = enabled;
    return this;
  }
  
  /**
   * Get the global event bus
   * @returns Global event bus
   */
  getEventBus(): AnimationEventBus {
    return this.eventBus;
  }
  
  /**
   * Get all registered emitter IDs
   * @returns Array of emitter IDs
   */
  getEmitterIds(): string[] {
    return Array.from(this.emitters.keys());
  }
}

/**
 * Global animation event manager singleton
 */
export const animationEventManager = new AnimationEventManager();

/**
 * Create logging middleware for animation events
 * @param options Logging options
 * @returns Middleware function
 */
export function createLoggingMiddleware(
  options: { 
    level?: 'debug' | 'info' | 'warn' | 'error',
    excludeTypes?: string[]
  } = {}
): AnimationEventMiddleware {
  const { 
    level = 'debug',
    excludeTypes = []
  } = options;
  
  return (event, next) => {
    // Skip excluded event types
    if (excludeTypes.includes(event.type)) {
      next(event);
      return;
    }
    
    // Choose log method based on level
    const logger = level === 'error' ? console.error :
                   level === 'warn' ? console.warn :
                   level === 'info' ? console.info :
                   console.debug;
    
    logger(`[${event.target}] ${event.type}`, event.data);
    
    // Continue to next middleware
    next(event);
  };
}

/**
 * Create performance tracking middleware
 * @param options Performance tracking options 
 * @returns Middleware function
 */
export function createPerformanceMiddleware(
  options: {
    threshold?: number,
    trackTypes?: string[]
  } = {}
): AnimationEventMiddleware {
  const {
    threshold = 16.7, // Default to 60fps threshold
    trackTypes = []
  } = options;
  
  const measurements = new Map<string, number>();
  
  return (event, next) => {
    // Only track specified types
    if (trackTypes.length === 0 || trackTypes.includes(event.type)) {
      const startTime = performance.now();
      
      // Store start time for this event type
      measurements.set(event.type, startTime);
      
      // Override next to measure time
      const wrappedNext = (evt: AnimationEvent) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log slow events
        if (duration > threshold) {
          console.warn(
            `[PERF] Slow event handler: ${evt.type} took ${duration.toFixed(2)}ms`,
            { threshold, event: evt }
          );
        }
        
        next(evt);
      };
      
      wrappedNext(event);
    } else {
      next(event);
    }
  };
}