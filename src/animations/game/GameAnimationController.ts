/**
 * Game Animation Controller
 * 
 * Provides centralized management of game animation state and transitions
 * with proper resource cleanup using the AbortController pattern.
 */

import { AnimationSequenceResult } from '../types';
import { GameAnimationEventEmitter, GameAnimationEventType, TransitionEventData, StateChangeEventData } from './GameAnimationEventEmitter';
import { createErrorRecoveryMiddleware, defaultErrorRecoveryStrategies, createLoggingMiddleware, createPerformanceMiddleware } from './GameAnimationMiddleware';
import { TransitionType } from '../types';

/**
 * Game animation operation type
 */
export enum GameAnimationOperationType {
  TRANSITION = 'transition',
  ENTER = 'enter',
  EXIT = 'exit',
  CUSTOM = 'custom'
}

/**
 * Game animation operation context
 */
export interface GameAnimationOperation {
  id: string;
  type: GameAnimationOperationType;
  abortController: AbortController;
  sequenceId?: string;
  fromStateId?: string;
  toStateId?: string;
  startTime: number;
  timeout?: number;
  timeoutId?: number;
  retryCount?: number;
  maxRetries?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  metadata?: Record<string, any>;
}

/**
 * Game animation controller for managing animation state and transitions
 */
export class GameAnimationController {
  /** Unique ID for this controller */
  private id: string;
  
  /** Event emitter for animation events */
  private eventEmitter: GameAnimationEventEmitter;
  
  /** Map of active animation operations */
  private activeOperations: Map<string, GameAnimationOperation> = new Map();
  
  /** Default operation timeout (ms) */
  private defaultTimeout = 5000; // 5 seconds
  
  /** Maximum retries for operations */
  private maxRetries = 3;
  
  /** Debug mode */
  private debug = false;
  
  /**
   * Create a new game animation controller
   * @param id Unique controller ID
   * @param debug Whether to enable debug mode
   */
  constructor(id: string, debug = false) {
    this.id = id;
    this.debug = debug;
    
    // Create event emitter
    this.eventEmitter = new GameAnimationEventEmitter(id);
    
    // Add middleware
    this.setupMiddleware();
    
    // Bind methods
    this.registerOperation = this.registerOperation.bind(this);
    this.completeOperation = this.completeOperation.bind(this);
    this.cancelOperation = this.cancelOperation.bind(this);
    this.handleTransitionProgress = this.handleTransitionProgress.bind(this);
    this.handleAnimationError = this.handleAnimationError.bind(this);
    this.cleanup = this.cleanup.bind(this);
    
    if (this.debug) {
      console.log(`[GameAnimationController] Created controller with ID: ${id}`);
    }
  }
  
  /**
   * Set up event middleware
   */
  private setupMiddleware(): void {
    // Add error recovery middleware
    this.eventEmitter.addMiddleware(
      createErrorRecoveryMiddleware(defaultErrorRecoveryStrategies)
    );
    
    // Add performance monitoring middleware
    this.eventEmitter.addMiddleware(
      createPerformanceMiddleware()
    );
    
    // Add logging middleware (only in debug mode)
    if (this.debug) {
      this.eventEmitter.addMiddleware(
        createLoggingMiddleware({ level: 'debug' })
      );
    }
  }
  
  /**
   * Get the event emitter for this controller
   * @returns Event emitter instance
   */
  getEventEmitter(): GameAnimationEventEmitter {
    return this.eventEmitter;
  }
  
  /**
   * Register a new animation operation
   * @param operation Operation to register
   * @returns Operation abort controller
   */
  registerOperation(operation: Omit<GameAnimationOperation, 'abortController' | 'startTime'>): AbortController {
    // Create abort controller
    const abortController = new AbortController();
    
    // Complete operation with the abort signal
    const completeOp = () => {
      this.completeOperation(operationWithAbort.id);
    };
    
    // Error handler
    const errorHandler = (error: Error) => {
      this.handleAnimationError(operationWithAbort.id, error);
    };
    
    // Add abort signal listener
    abortController.signal.addEventListener('abort', () => {
      this.cancelOperation(operationWithAbort.id);
    });
    
    // Create full operation object
    const operationWithAbort: GameAnimationOperation = {
      ...operation,
      abortController,
      startTime: performance.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries ?? this.maxRetries
    };
    
    // Register operation
    this.activeOperations.set(operationWithAbort.id, operationWithAbort);
    
    // Set timeout if specified
    if (operation.timeout !== undefined && operation.timeout > 0) {
      const timeoutId = window.setTimeout(() => {
        // Operation timed out
        this.handleAnimationError(
          operationWithAbort.id, 
          new Error(`Operation ${operationWithAbort.id} timed out after ${operation.timeout}ms`)
        );
      }, operation.timeout);
      
      // Store timeout ID
      operationWithAbort.timeoutId = timeoutId as unknown as number;
    }
    
    if (this.debug) {
      console.log(`[GameAnimationController] Registered operation: ${operationWithAbort.id}`, 
        {
          type: operationWithAbort.type,
          fromStateId: operationWithAbort.fromStateId,
          toStateId: operationWithAbort.toStateId
        }
      );
    }
    
    return abortController;
  }
  
  /**
   * Complete an animation operation
   * @param operationId Operation ID to complete
   */
  completeOperation(operationId: string): void {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return;
    }
    
    // Clear timeout if set
    if (operation.timeoutId !== undefined) {
      window.clearTimeout(operation.timeoutId);
    }
    
    // Call complete callback if set
    if (operation.onComplete) {
      try {
        operation.onComplete();
      } catch (error) {
        console.error(`[GameAnimationController] Error in operation complete callback: ${error}`);
      }
    }
    
    // Remove operation
    this.activeOperations.delete(operationId);
    
    if (this.debug) {
      console.log(`[GameAnimationController] Completed operation: ${operationId}`);
    }
  }
  
  /**
   * Cancel an animation operation
   * @param operationId Operation ID to cancel
   */
  cancelOperation(operationId: string): void {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return;
    }
    
    // Clear timeout if set
    if (operation.timeoutId !== undefined) {
      window.clearTimeout(operation.timeoutId);
    }
    
    // Emit cancel event for transitions
    if (operation.type === GameAnimationOperationType.TRANSITION && 
        operation.fromStateId && operation.toStateId) {
      this.eventEmitter.emitTransitionCancel({
        transition: { from: operation.fromStateId, to: operation.toStateId, type: TransitionType.FADE },
        fromStateId: operation.fromStateId,
        toStateId: operation.toStateId,
        timestamp: performance.now()
      });
    }
    
    // Remove operation
    this.activeOperations.delete(operationId);
    
    if (this.debug) {
      console.log(`[GameAnimationController] Cancelled operation: ${operationId}`);
    }
  }
  
  /**
   * Handle animation sequence progress updates
   * @param operationId Operation ID
   * @param progress Progress value (0-1)
   */
  handleTransitionProgress(operationId: string, progress: number): void {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.type !== GameAnimationOperationType.TRANSITION) {
      return;
    }
    
    // Emit progress event
    if (operation.fromStateId && operation.toStateId) {
      this.eventEmitter.emitTransitionProgress({
        transition: { from: operation.fromStateId, to: operation.toStateId, type: TransitionType.FADE },
        progress,
        fromStateId: operation.fromStateId,
        toStateId: operation.toStateId,
        timestamp: performance.now()
      });
    }
  }
  
  /**
   * Handle animation errors
   * @param operationId Operation ID where the error occurred
   * @param error Error that occurred
   */
  handleAnimationError(operationId: string, error: Error): void {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return;
    }
    
    // Increment retry count
    operation.retryCount = (operation.retryCount || 0) + 1;
    
    // Check if we can retry
    if (operation.retryCount <= (operation.maxRetries || this.maxRetries)) {
      if (this.debug) {
        console.warn(`[GameAnimationController] Retrying operation ${operationId} after error (attempt ${operation.retryCount}/${operation.maxRetries}): ${error.message}`);
      }
      
      // Emit error event
      this.eventEmitter.emitAnimationError({
        error,
        source: operationId,
        recoverable: true,
        context: {
          operation,
          retryCount: operation.retryCount,
          maxRetries: operation.maxRetries
        },
        timestamp: performance.now()
      });
      
      // Call error callback if set
      if (operation.onError) {
        try {
          operation.onError(error);
        } catch (callbackError) {
          console.error(`[GameAnimationController] Error in operation error callback: ${callbackError}`);
        }
      }
    } else {
      if (this.debug) {
        console.error(`[GameAnimationController] Operation ${operationId} failed after ${operation.retryCount} retries: ${error.message}`);
      }
      
      // Emit error event as non-recoverable
      this.eventEmitter.emitAnimationError({
        error,
        source: operationId,
        recoverable: false,
        context: {
          operation,
          retryCount: operation.retryCount,
          maxRetries: operation.maxRetries
        },
        timestamp: performance.now()
      });
      
      // Cancel the operation
      this.cancelOperation(operationId);
      
      // Call error callback if set
      if (operation.onError) {
        try {
          operation.onError(error);
        } catch (callbackError) {
          console.error(`[GameAnimationController] Error in operation error callback: ${callbackError}`);
        }
      }
    }
  }
  
  /**
   * Connect an animation sequence to an operation
   * @param operationId Operation ID
   * @param sequence Animation sequence to connect
   * @returns Cleanup function
   */
  connectSequence(operationId: string, sequence: AnimationSequenceResult): () => void {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return () => {};
    }
    
    // Store sequence ID
    operation.sequenceId = sequence.id;
    
    // Define callbacks
    const onUpdateCallback = (progress: number) => {
      this.handleTransitionProgress(operationId, progress);
    };
    const onCompleteCallback = () => {
      this.completeOperation(operationId);
    };
    
    // Add callbacks
    sequence.addCallback('onUpdate', onUpdateCallback);
    sequence.addCallback('onComplete', onCompleteCallback);
    
    // Emit transition start event if this is a transition
    if (operation.type === GameAnimationOperationType.TRANSITION && 
        operation.fromStateId && operation.toStateId) {
      this.eventEmitter.emitTransitionStart({
        transition: { from: operation.fromStateId, to: operation.toStateId, type: TransitionType.FADE },
        fromStateId: operation.fromStateId,
        toStateId: operation.toStateId,
        timestamp: performance.now()
      });
    }
    
    // Return cleanup function that removes the callbacks
    return () => {
      sequence.removeCallback('onUpdate', onUpdateCallback);
      sequence.removeCallback('onComplete', onCompleteCallback);
    };
  }
  
  /**
   * Clean up all active operations
   */
  cleanup(): void {
    // Cancel all active operations
    for (const [operationId] of this.activeOperations) {
      this.cancelOperation(operationId);
    }
    
    // Clear the operations map
    this.activeOperations.clear();
    
    if (this.debug) {
      console.log(`[GameAnimationController] Cleaned up all operations`);
    }
  }
  
  /**
   * Set debug mode
   * @param enabled Whether to enable debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
    
    // Re-setup middleware based on debug setting
    this.setupMiddleware();
    
    if (enabled) {
      console.log(`[GameAnimationController] Debug mode enabled for controller: ${this.id}`);
    }
  }
} 