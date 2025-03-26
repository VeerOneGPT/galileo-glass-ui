/**
 * Style Update Batching System
 *
 * Optimizes performance by batching style updates to minimize reflows and repaints.
 */
import { OptimizationLevel } from '../performanceOptimizations';

/**
 * Configuration for style update batching
 */
export interface StyleBatcherConfig {
  /** Maximum batch size (number of operations) */
  maxBatchSize?: number;

  /** Batch timeout in milliseconds */
  batchTimeout?: number;

  /** Force batch processing on animation frame */
  useAnimationFrame?: boolean;

  /** Current optimization level */
  optimizationLevel?: OptimizationLevel;

  /** Group batches by element */
  groupByElement?: boolean;

  /** Prioritize certain operations */
  prioritizeOperations?: boolean;

  /** Auto disable during animations */
  disableDuringAnimation?: boolean;

  /** Debug mode */
  debug?: boolean;

  /** Automatically measure performance impact */
  measurePerformance?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<StyleBatcherConfig> = {
  maxBatchSize: 50,
  batchTimeout: 10,
  useAnimationFrame: true,
  optimizationLevel: OptimizationLevel.NONE,
  groupByElement: true,
  prioritizeOperations: true,
  disableDuringAnimation: true,
  debug: false,
  measurePerformance: false,
};

/**
 * Style update operation types
 */
export enum StyleOperationType {
  SET_STYLE = 'set_style',
  TOGGLE_CLASS = 'toggle_class',
  ADD_CLASS = 'add_class',
  REMOVE_CLASS = 'remove_class',
  SET_ATTRIBUTE = 'set_attribute',
  REMOVE_ATTRIBUTE = 'remove_attribute',
  SET_PROPERTY = 'set_property',
}

/**
 * Priority levels for operations
 */
export enum StyleOperationPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  DEFER = 'defer',
}

/**
 * Style update operation
 */
export interface StyleOperation {
  /** Operation type */
  type: StyleOperationType;

  /** Element to operate on */
  element: HTMLElement;

  /** Property name (for style or attribute) */
  property?: string;

  /** Value to set */
  value?: string;

  /** Class name (for class operations) */
  className?: string;

  /** Whether class should be toggled on or off */
  force?: boolean;

  /** Priority level */
  priority?: StyleOperationPriority;

  /** Creation timestamp */
  timestamp: number;

  /** Operation ID */
  id: number;
}

/**
 * Performance metrics for batched operations
 */
export interface BatchPerformanceMetrics {
  /** Total number of batches processed */
  batchCount: number;

  /** Total number of operations processed */
  operationCount: number;

  /** Average batch processing time in milliseconds */
  averageBatchTime: number;

  /** Maximum batch processing time in milliseconds */
  maxBatchTime: number;

  /** Total processing time in milliseconds */
  totalProcessingTime: number;

  /** Estimated time saved compared to non-batched operations in milliseconds */
  estimatedTimeSaved: number;

  /** Reflow count */
  reflowCount: number;

  /** Repaint count */
  repaintCount: number;
}

/**
 * Style Update Batcher
 *
 * Optimizes performance by batching style updates to minimize DOM reflows and repaints.
 */
export class StyleUpdateBatcher {
  private config: Required<StyleBatcherConfig>;
  private operationQueue: StyleOperation[] = [];
  private processingBatch = false;
  private batchTimeoutId: NodeJS.Timeout | null = null;
  private animationFrameId: number | null = null;
  private lastBatchTime = 0;
  private operationCounter = 0;
  private metrics: BatchPerformanceMetrics = {
    batchCount: 0,
    operationCount: 0,
    averageBatchTime: 0,
    maxBatchTime: 0,
    totalProcessingTime: 0,
    estimatedTimeSaved: 0,
    reflowCount: 0,
    repaintCount: 0,
  };
  private onBatchProcessedCallbacks: ((count: number) => void)[] = [];
  private isAnimating = false;

  /**
   * Create a new style update batcher
   */
  constructor(config: StyleBatcherConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Detect animation frame loop for disabling during animations
    if (this.config.disableDuringAnimation) {
      this.setupAnimationDetection();
    }
  }

  /**
   * Queue a style operation for batch processing
   */
  public queueOperation(operation: Omit<StyleOperation, 'timestamp' | 'id'>): void {
    // Skip if we're during animation and that config is enabled
    if (this.isAnimating && this.config.disableDuringAnimation) {
      this.processOperationImmediately(operation);
      return;
    }

    // Add timestamp and id to operation
    const fullOperation: StyleOperation = {
      ...operation,
      timestamp: Date.now(),
      id: this.operationCounter++,
      priority: operation.priority || StyleOperationPriority.NORMAL,
    };

    // Add to queue
    this.operationQueue.push(fullOperation);

    // Check if we should process the batch
    this.checkBatchProcessing();
  }

  /**
   * Set a style property value (queued)
   */
  public setStyle(
    element: HTMLElement,
    property: string,
    value: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.SET_STYLE,
      element,
      property,
      value,
      priority,
    });
  }

  /**
   * Toggle a class on an element (queued)
   */
  public toggleClass(
    element: HTMLElement,
    className: string,
    force?: boolean,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.TOGGLE_CLASS,
      element,
      className,
      force,
      priority,
    });
  }

  /**
   * Add a class to an element (queued)
   */
  public addClass(
    element: HTMLElement,
    className: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.ADD_CLASS,
      element,
      className,
      priority,
    });
  }

  /**
   * Remove a class from an element (queued)
   */
  public removeClass(
    element: HTMLElement,
    className: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.REMOVE_CLASS,
      element,
      className,
      priority,
    });
  }

  /**
   * Set an attribute value (queued)
   */
  public setAttribute(
    element: HTMLElement,
    property: string,
    value: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.SET_ATTRIBUTE,
      element,
      property,
      value,
      priority,
    });
  }

  /**
   * Remove an attribute (queued)
   */
  public removeAttribute(
    element: HTMLElement,
    property: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.REMOVE_ATTRIBUTE,
      element,
      property,
      priority,
    });
  }

  /**
   * Set a property value (queued)
   */
  public setProperty(
    element: HTMLElement,
    property: string,
    value: string,
    priority: StyleOperationPriority = StyleOperationPriority.NORMAL
  ): void {
    this.queueOperation({
      type: StyleOperationType.SET_PROPERTY,
      element,
      property,
      value,
      priority,
    });
  }

  /**
   * Process pending operations immediately
   */
  public flush(): void {
    if (this.operationQueue.length === 0) return;

    // Cancel any pending batch processing
    if (this.batchTimeoutId !== null) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Process the batch immediately
    this.processBatch();
  }

  /**
   * Register a callback to be called after each batch is processed
   */
  public onBatchProcessed(callback: (count: number) => void): () => void {
    this.onBatchProcessedCallbacks.push(callback);

    // Return a function to unregister the callback
    return () => {
      this.onBatchProcessedCallbacks = this.onBatchProcessedCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): BatchPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      batchCount: 0,
      operationCount: 0,
      averageBatchTime: 0,
      maxBatchTime: 0,
      totalProcessingTime: 0,
      estimatedTimeSaved: 0,
      reflowCount: 0,
      repaintCount: 0,
    };
  }

  /**
   * Clear all pending operations
   */
  public clear(): void {
    this.operationQueue = [];

    // Cancel any pending batch processing
    if (this.batchTimeoutId !== null) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = null;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Process a single operation immediately (non-batched)
   */
  private processOperationImmediately(operation: Omit<StyleOperation, 'timestamp' | 'id'>): void {
    const { type, element, property, value, className, force } = operation;

    switch (type) {
      case StyleOperationType.SET_STYLE:
        if (element && property !== undefined && value !== undefined) {
          element.style.setProperty(property, value);
        }
        break;

      case StyleOperationType.TOGGLE_CLASS:
        if (element && className) {
          element.classList.toggle(className, force);
        }
        break;

      case StyleOperationType.ADD_CLASS:
        if (element && className) {
          element.classList.add(className);
        }
        break;

      case StyleOperationType.REMOVE_CLASS:
        if (element && className) {
          element.classList.remove(className);
        }
        break;

      case StyleOperationType.SET_ATTRIBUTE:
        if (element && property !== undefined && value !== undefined) {
          element.setAttribute(property, value);
        }
        break;

      case StyleOperationType.REMOVE_ATTRIBUTE:
        if (element && property !== undefined) {
          element.removeAttribute(property);
        }
        break;

      case StyleOperationType.SET_PROPERTY:
        if (element && property !== undefined && value !== undefined) {
          (element as any)[property] = value;
        }
        break;
    }
  }

  /**
   * Check if the batch should be processed
   */
  private checkBatchProcessing(): void {
    // Already processing a batch
    if (this.processingBatch) return;

    // Check if batch size threshold is reached
    if (this.operationQueue.length >= this.config.maxBatchSize) {
      this.scheduleBatchProcessing();
      return;
    }

    // Schedule batch processing with timeout
    if (this.batchTimeoutId === null) {
      this.scheduleBatchProcessing();
    }
  }

  /**
   * Schedule the batch for processing
   */
  private scheduleBatchProcessing(): void {
    if (this.config.useAnimationFrame) {
      // Use animation frame for smoother visual updates
      if (this.animationFrameId === null) {
        this.animationFrameId = requestAnimationFrame(() => {
          this.animationFrameId = null;
          this.processBatch();
        });
      }
    } else {
      // Use timeout for potentially faster processing
      if (this.batchTimeoutId === null) {
        this.batchTimeoutId = setTimeout(() => {
          this.batchTimeoutId = null;
          this.processBatch();
        }, this.config.batchTimeout);
      }
    }
  }

  /**
   * Process the current batch of operations
   */
  private processBatch(): void {
    // No operations to process
    if (this.operationQueue.length === 0) return;

    this.processingBatch = true;

    const startTime = performance.now();
    let operationsProcessed = 0;

    // Get the operations to process
    let operations = [...this.operationQueue];
    this.operationQueue = [];

    // Sort by priority if enabled
    if (this.config.prioritizeOperations) {
      operations.sort((a, b) => {
        // Sort by priority first
        const priorityOrder = {
          [StyleOperationPriority.HIGH]: 0,
          [StyleOperationPriority.NORMAL]: 1,
          [StyleOperationPriority.LOW]: 2,
          [StyleOperationPriority.DEFER]: 3,
        };

        const aPriority = priorityOrder[a.priority || StyleOperationPriority.NORMAL];
        const bPriority = priorityOrder[b.priority || StyleOperationPriority.NORMAL];

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Then sort by timestamp
        return a.timestamp - b.timestamp;
      });

      // Re-queue deferred operations
      const deferredOperations = operations.filter(
        op => op.priority === StyleOperationPriority.DEFER
      );

      if (deferredOperations.length > 0) {
        this.operationQueue.push(...deferredOperations);
        operations = operations.filter(op => op.priority !== StyleOperationPriority.DEFER);
      }
    }

    // Group by element if enabled
    if (this.config.groupByElement) {
      const elementGroups = new Map<HTMLElement, StyleOperation[]>();

      // Group operations by element
      operations.forEach(op => {
        if (!elementGroups.has(op.element)) {
          elementGroups.set(op.element, []);
        }
        elementGroups.get(op.element)!.push(op);
      });

      // Process each element's operations together
      elementGroups.forEach((elementOperations, element) => {
        // Read phase - force a reflow once per element
        if (this.config.measurePerformance) {
          // Using offset properties forces a reflow
          element.offsetWidth; // eslint-disable-line
          this.metrics.reflowCount++;
        }

        // Write phase - all changes in one batch per element
        elementOperations.forEach(op => {
          this.processOperation(op);
          operationsProcessed++;
        });

        // Estimate one repaint per element
        if (this.config.measurePerformance) {
          this.metrics.repaintCount++;
        }
      });
    } else {
      // Process operations sequentially without grouping
      operations.forEach(op => {
        this.processOperation(op);
        operationsProcessed++;
      });

      // Estimate one reflow and repaint for the whole batch
      if (this.config.measurePerformance) {
        this.metrics.reflowCount++;
        this.metrics.repaintCount++;
      }
    }

    // Calculate metrics
    const endTime = performance.now();
    const batchTime = endTime - startTime;

    if (this.config.measurePerformance) {
      this.metrics.batchCount++;
      this.metrics.operationCount += operationsProcessed;
      this.metrics.totalProcessingTime += batchTime;
      this.metrics.maxBatchTime = Math.max(this.metrics.maxBatchTime, batchTime);
      this.metrics.averageBatchTime = this.metrics.totalProcessingTime / this.metrics.batchCount;

      // Estimate time saved compared to non-batched operations
      // Assume 3ms per reflow on average
      const estimatedUnbatchedTime = operationsProcessed * 3;
      this.metrics.estimatedTimeSaved += Math.max(0, estimatedUnbatchedTime - batchTime);
    }

    this.lastBatchTime = batchTime;
    this.processingBatch = false;

    // Call batch processed callbacks
    this.onBatchProcessedCallbacks.forEach(callback => {
      try {
        callback(operationsProcessed);
      } catch (error) {
        if (this.config.debug) {
          console.error('Error in batch processed callback:', error);
        }
      }
    });

    // Log debug info if enabled
    if (this.config.debug) {
      console.log(
        `[StyleBatcher] Processed ${operationsProcessed} operations in ${batchTime.toFixed(2)}ms`
      );
    }

    // Check if there are more operations to process
    if (this.operationQueue.length > 0) {
      this.scheduleBatchProcessing();
    }
  }

  /**
   * Process a single operation
   */
  private processOperation(operation: StyleOperation): void {
    const { type, element, property, value, className, force } = operation;

    // Skip invalid operations
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    try {
      switch (type) {
        case StyleOperationType.SET_STYLE:
          if (property !== undefined && value !== undefined) {
            element.style.setProperty(property, value);
          }
          break;

        case StyleOperationType.TOGGLE_CLASS:
          if (className) {
            element.classList.toggle(className, force);
          }
          break;

        case StyleOperationType.ADD_CLASS:
          if (className) {
            element.classList.add(className);
          }
          break;

        case StyleOperationType.REMOVE_CLASS:
          if (className) {
            element.classList.remove(className);
          }
          break;

        case StyleOperationType.SET_ATTRIBUTE:
          if (property !== undefined && value !== undefined) {
            element.setAttribute(property, value);
          }
          break;

        case StyleOperationType.REMOVE_ATTRIBUTE:
          if (property !== undefined) {
            element.removeAttribute(property);
          }
          break;

        case StyleOperationType.SET_PROPERTY:
          if (property !== undefined && value !== undefined) {
            (element as any)[property] = value;
          }
          break;
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Error processing operation:', error, operation);
      }
    }
  }

  /**
   * Set up detection of animation frame time to disable batching during animations
   */
  private setupAnimationDetection(): void {
    if (typeof window === 'undefined') return;

    let lastFrameTime = 0;
    let consecutiveQuickFrames = 0;

    const checkFrameRate = (timestamp: number) => {
      if (lastFrameTime === 0) {
        lastFrameTime = timestamp;
        requestAnimationFrame(checkFrameRate);
        return;
      }

      const frameTime = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      // Frames taking less than 16ms (>60fps) suggest animations
      if (frameTime < 16) {
        consecutiveQuickFrames++;
      } else {
        consecutiveQuickFrames = 0;
      }

      // If we get multiple consecutive quick frames, assume animation is happening
      if (consecutiveQuickFrames >= 3) {
        // Animation detected
        if (!this.isAnimating) {
          this.isAnimating = true;

          // Flush any pending operations
          this.flush();
        }
      } else if (consecutiveQuickFrames === 0 && this.isAnimating) {
        // Animation stopped
        this.isAnimating = false;
      }

      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }
}

/**
 * Global style update batcher for shared use
 */
export const globalStyleBatcher = typeof window !== 'undefined' ? new StyleUpdateBatcher() : null;

/**
 * Create a new style update batcher
 */
export const createStyleBatcher = (config?: StyleBatcherConfig): StyleUpdateBatcher => {
  return new StyleUpdateBatcher(config);
};

/**
 * Utility to set a style property with batching
 */
export const setStyle = (
  element: HTMLElement,
  property: string,
  value: string,
  priority: StyleOperationPriority = StyleOperationPriority.NORMAL
): void => {
  if (globalStyleBatcher) {
    globalStyleBatcher.setStyle(element, property, value, priority);
  } else {
    element.style.setProperty(property, value);
  }
};

/**
 * Utility to add a class with batching
 */
export const addClass = (
  element: HTMLElement,
  className: string,
  priority: StyleOperationPriority = StyleOperationPriority.NORMAL
): void => {
  if (globalStyleBatcher) {
    globalStyleBatcher.addClass(element, className, priority);
  } else {
    element.classList.add(className);
  }
};

/**
 * Utility to remove a class with batching
 */
export const removeClass = (
  element: HTMLElement,
  className: string,
  priority: StyleOperationPriority = StyleOperationPriority.NORMAL
): void => {
  if (globalStyleBatcher) {
    globalStyleBatcher.removeClass(element, className, priority);
  } else {
    element.classList.remove(className);
  }
};
