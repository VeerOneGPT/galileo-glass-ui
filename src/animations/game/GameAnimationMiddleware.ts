/**
 * Game Animation Middleware
 * 
 * Middleware components for the GameAnimationController to provide
 * features like error recovery, logging, and performance monitoring.
 */

import { 
  AnimationEventMiddleware, 
  AnimationEvent
} from '../orchestration/AnimationEventSystem';
import { GameAnimationEventType, AnimationErrorEventData } from './GameAnimationEventEmitter';

/**
 * Error recovery strategy result
 */
export interface ErrorRecoveryResult {
  /** Whether the error was successfully resolved */
  resolved: boolean;
  
  /** Description of how the error was resolved */
  resolution?: string;
  
  /** Any data needed to complete the recovery */
  data?: any;
}

/**
 * Error recovery strategy function
 */
export type ErrorRecoveryStrategy = (
  error: Error, 
  context: Record<string, any>
) => ErrorRecoveryResult;

/**
 * Default error recovery strategies
 */
export const defaultErrorRecoveryStrategies: Record<string, ErrorRecoveryStrategy> = {
  /**
   * Handle transition interruption errors
   */
  'TransitionInterrupted': (error, context) => {
    if (context.controller) {
      try {
        // Reset to the target state directly
        if (context.toState) {
          context.controller.goToState(context.toState);
          return { 
            resolved: true, 
            resolution: `Skipped to target state ${context.toState}` 
          };
        }
        
        // If we can't determine target state, just cancel the transition
        context.controller.cancelTransition();
        return { 
          resolved: true, 
          resolution: 'Canceled interrupted transition' 
        };
      } catch (e) {
        return { resolved: false };
      }
    }
    return { resolved: false };
  },
  
  /**
   * Handle resource loading errors
   */
  'ResourceLoadError': (error, context) => {
    if (context.resourceManager) {
      try {
        // Attempt to use fallback resources
        const result = context.resourceManager.useFallbacks();
        
        if (result) {
          return { 
            resolved: true, 
            resolution: 'Using fallback resources' 
          };
        }
      } catch (e) {
        return { resolved: false };
      }
    }
    return { resolved: false };
  },
  
  /**
   * Handle animation sequence errors
   */
  'AnimationSequenceFailed': (error, context) => {
    if (context.animationSequence) {
      try {
        // Reset the sequence and try again with simplified animation
        context.animationSequence.reset();
        
        if (context.fallbackAnimation) {
          return { 
            resolved: true, 
            resolution: 'Using simplified animation fallback',
            data: { animation: context.fallbackAnimation }
          };
        }
      } catch (e) {
        return { resolved: false };
      }
    }
    return { resolved: false };
  },
  
  /**
   * Handle DOM element not found errors
   */
  'ElementNotFound': (error, context) => {
    if (context.elementRefs && context.fallbackSelector) {
      try {
        // Try using the fallback selector
        const elements = document.querySelectorAll(context.fallbackSelector);
        
        if (elements.length > 0) {
          return { 
            resolved: true, 
            resolution: `Found ${elements.length} elements with fallback selector`,
            data: { elements: Array.from(elements) }
          };
        }
      } catch (e) {
        return { resolved: false };
      }
    }
    return { resolved: false };
  }
};

/**
 * Create error recovery middleware
 * @param strategies Custom error recovery strategies to use
 * @returns Middleware function
 */
export function createErrorRecoveryMiddleware(
  customStrategies: Record<string, ErrorRecoveryStrategy> = {}
): AnimationEventMiddleware {
  // Combine default and custom strategies
  const strategies = {
    ...defaultErrorRecoveryStrategies,
    ...customStrategies
  };
  
  return (event: AnimationEvent, next: (evt: AnimationEvent) => void) => {
    // Only handle error events
    if (event.type !== GameAnimationEventType.ANIMATION_ERROR) {
      next(event);
      return;
    }
    
    const errorData = event.data as AnimationErrorEventData;
    
    if (!errorData || !errorData.error) {
      next(event);
      return;
    }
    
    // Get the error type from the error name or message
    const errorName = errorData.error.name || 'UnknownError';
    const strategy = strategies[errorName] || strategies['UnknownError'];
    
    // Skip if no strategy found
    if (!strategy) {
      next(event);
      return;
    }
    
    // Create context from the event data
    const context = {
      ...(errorData.context || {}),
      source: errorData.source,
      timestamp: event.timestamp
    };
    
    // Apply the recovery strategy
    const result = strategy(errorData.error, context);
    
    // If recovery was successful, emit recovery event
    if (result.resolved) {
      // Modify the original event to indicate recovery
      const recoveredEvent = {
        ...event,
        type: GameAnimationEventType.ANIMATION_RECOVERY,
        data: {
          error: errorData.error,
          recoverable: true,
          recovered: true,
          resolution: result.resolution,
          recoveryData: result.data,
          originalSource: errorData.source,
          timestamp: performance.now()
        }
      };
      
      // Call next with the recovery event instead
      next(recoveredEvent);
    } else {
      // Pass through the original event if recovery failed
      next(event);
    }
  };
}

/**
 * Create logging middleware for game animations
 * @param options Logging options
 * @returns Middleware function
 */
export function createLoggingMiddleware(
  options: { 
    level?: 'debug' | 'info' | 'warn' | 'error',
    excludeTypes?: GameAnimationEventType[]
  } = {}
): AnimationEventMiddleware {
  const { 
    level = 'debug',
    excludeTypes = []
  } = options;
  
  return (event, next) => {
    // Skip excluded event types
    if (excludeTypes.includes(event.type as GameAnimationEventType)) {
      next(event);
      return;
    }
    
    // Choose log method based on level
    const logger = level === 'error' ? console.error :
                   level === 'warn' ? console.warn :
                   level === 'info' ? console.info :
                   console.debug;
    
    // Format log based on event type
    if (event.type.startsWith('transition:')) {
      logger(`[Animation] ${event.type}`, {
        from: event.data?.fromStateId,
        to: event.data?.toStateId,
        progress: event.data?.progress,
        timestamp: event.timestamp
      });
    } else if (event.type.startsWith('state:')) {
      logger(`[Animation] ${event.type}`, {
        prev: event.data?.previousStateId,
        new: event.data?.newStateId,
        timestamp: event.timestamp
      });
    } else if (event.type.startsWith('animation:')) {
      logger(`[Animation] ${event.type}`, event.data);
    } else {
      logger(`[Animation] ${event.type}`, event.data);
    }
    
    // Continue to next middleware
    next(event);
  };
}

/**
 * Create performance monitoring middleware
 * @param options Performance monitoring options
 * @returns Middleware function
 */
export function createPerformanceMiddleware(
  options: {
    threshold?: number,
    trackTypes?: GameAnimationEventType[]
  } = {}
): AnimationEventMiddleware {
  const {
    threshold = 16.7, // Default to 60fps threshold
    trackTypes = [
      GameAnimationEventType.TRANSITION_START,
      GameAnimationEventType.TRANSITION_PROGRESS,
      GameAnimationEventType.TRANSITION_COMPLETE
    ]
  } = options;
  
  const measurements = new Map<string, { 
    startTime: number,
    transitionId?: string 
  }>();
  
  return (event, next) => {
    // Only track specified types
    if (trackTypes.includes(event.type as GameAnimationEventType)) {
      const type = event.type as GameAnimationEventType;
      
      if (type === GameAnimationEventType.TRANSITION_START) {
        // Start timing
        const transitionId = `${event.data?.fromStateId}->${event.data?.toStateId}`;
        measurements.set(transitionId, {
          startTime: performance.now(),
          transitionId
        });
      } 
      else if (type === GameAnimationEventType.TRANSITION_COMPLETE) {
        // Complete timing
        const transitionId = `${event.data?.fromStateId}->${event.data?.toStateId}`;
        const measurement = measurements.get(transitionId);
        
        if (measurement) {
          const endTime = performance.now();
          const duration = endTime - measurement.startTime;
          
          // Log slow transitions
          if (duration > threshold) {
            console.warn(
              `[PERF] Slow transition: ${transitionId} took ${duration.toFixed(2)}ms`,
              { threshold, event }
            );
          }
          
          // Clean up
          measurements.delete(transitionId);
        }
      }
    }
    
    // Continue to next middleware
    next(event);
  };
} 