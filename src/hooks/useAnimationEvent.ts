/**
 * useAnimationEvent Hook
 *
 * React hook for using the animation event system in components.
 */

import { useRef, useEffect, useCallback } from 'react';
import {
  animationEventBus,
  AnimationEventBus,
  AnimationEventType,
  AnimationInteractionType,
  AnimationEventListener,
  AnimationEventOptions,
  AnimationEventSubscription,
  AnimationEvent
} from '../animations/orchestration/AnimationEventSystem';

/**
 * Configuration options for the useAnimationEvent hook
 */
export interface UseAnimationEventOptions {
  /** Whether to set up event listeners immediately */
  immediate?: boolean;
  
  /** Animation event bus to use (defaults to global) */
  eventBus?: AnimationEventBus;
  
  /** Unique identifier for this component instance */
  id?: string;
  
  /** List of events to listen for immediately */
  events?: Array<{
    /** Event type */
    type: AnimationEventType | AnimationInteractionType | string;
    
    /** Event listener function */
    listener: AnimationEventListener;
    
    /** Event listener options */
    options?: AnimationEventOptions;
  }>;
}

/**
 * Return type for useAnimationEvent hook
 */
export interface UseAnimationEventReturn {
  /** Subscribe to an event */
  on: <T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ) => AnimationEventSubscription;
  
  /** Subscribe to an event once */
  once: <T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ) => AnimationEventSubscription;
  
  /** Unsubscribe from an event */
  off: <T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    options?: AnimationEventOptions
  ) => void;
  
  /** Emit an event */
  emit: <T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    target?: string,
    data?: T
  ) => boolean;
  
  /** Get the event bus instance */
  getEventBus: () => AnimationEventBus;
  
  /** Get the component ID */
  getId: () => string;
}

/**
 * Hook for using the animation event system in React components
 * @param options Hook options
 * @returns Hook API
 */
export function useAnimationEvent(
  options: UseAnimationEventOptions = {}
): UseAnimationEventReturn {
  // Use provided event bus or global instance
  const eventBus = options.eventBus || animationEventBus;
  
  // Generate unique ID if not provided
  const idRef = useRef<string>(
    options.id || `component-${Math.random().toString(36).substring(2, 9)}`
  );
  
  // Keep track of subscriptions for cleanup
  const subscriptionsRef = useRef<AnimationEventSubscription[]>([]);
  
  /**
   * Subscribe to an event
   */
  const on = useCallback(<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    listenerOptions?: AnimationEventOptions
  ) => {
    const subscription = eventBus.on(type, listener, listenerOptions);
    
    // Add to subscriptions list for cleanup
    subscriptionsRef.current.push(subscription);
    
    return subscription;
  }, [eventBus]);
  
  /**
   * Subscribe to an event once
   */
  const once = useCallback(<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    listenerOptions?: AnimationEventOptions
  ) => {
    const subscription = eventBus.once(type, listener, listenerOptions);
    
    // Add to subscriptions list for cleanup
    subscriptionsRef.current.push(subscription);
    
    return subscription;
  }, [eventBus]);
  
  /**
   * Unsubscribe from an event
   */
  const off = useCallback(<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    listener: AnimationEventListener<T>,
    listenerOptions?: AnimationEventOptions
  ) => {
    eventBus.off(type, listener, listenerOptions);
    
    // Remove from subscriptions list
    subscriptionsRef.current = subscriptionsRef.current.filter(
      subscription => !subscription.isActive()
    );
  }, [eventBus]);
  
  /**
   * Emit an event
   */
  const emit = useCallback(<T = any>(
    type: AnimationEventType | AnimationInteractionType | string,
    target: string = idRef.current,
    data?: T
  ) => {
    return eventBus.emit(type, target, data);
  }, [eventBus]);
  
  /**
   * Get the event bus instance
   */
  const getEventBus = useCallback(() => {
    return eventBus;
  }, [eventBus]);
  
  /**
   * Get the component ID
   */
  const getId = useCallback(() => {
    return idRef.current;
  }, []);
  
  // Set up initial event listeners
  useEffect(() => {
    if (options.immediate !== false && options.events) {
      options.events.forEach(({ type, listener, options: eventOptions }) => {
        const subscription = eventBus.on(type, listener, eventOptions);
        subscriptionsRef.current.push(subscription);
      });
    }
    
    // Cleanup function to unsubscribe from all events
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      
      subscriptionsRef.current = [];
    };
  }, [eventBus, options.immediate, options.events]);
  
  return {
    on,
    once,
    off,
    emit,
    getEventBus,
    getId
  };
}

export default useAnimationEvent;