/**
 * DOM Batch Processing System
 * 
 * Provides automatic batching of DOM operations to reduce layout thrashing
 * and improve performance by minimizing browser reflow/repaint cycles.
 */

/**
 * Types of DOM operations that can be batched
 */
export enum DomOperationType {
  READ = 'read',
  WRITE = 'write',
  MEASURE = 'measure',
  MUTATE = 'mutate',
  STYLE = 'style',
  CLASS = 'class',
  ATTRIBUTE = 'attribute',
  PROPERTY = 'property',
  TRANSFORM = 'transform',
  ANIMATION = 'animation'
}

/**
 * Priority levels for DOM operations
 */
export enum BatchPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2,
  IDLE = 3
}

/**
 * DOM operation task
 */
export interface DomTask {
  /**
   * Type of operation
   */
  type: DomOperationType;
  
  /**
   * Priority of operation
   */
  priority: BatchPriority;
  
  /**
   * Target element
   */
  target?: Element | null;
  
  /**
   * Callback to execute
   */
  callback: (...args: any[]) => any;
  
  /**
   * Arguments to pass to callback
   */
  args?: any[];
  
  /**
   * Unique task ID for cancellation
   */
  id: string;
  
  /**
   * Whether this task has dependencies
   */
  hasDependencies?: boolean;
  
  /**
   * Tasks that must be executed before this one
   */
  dependencies?: string[];
}

/**
 * DOM operation batch
 */
export interface DomBatch {
  /**
   * Unique batch ID
   */
  id: string;
  
  /**
   * Tasks to execute
   */
  tasks: Map<string, DomTask>;
  
  /**
   * Whether the batch is currently being processed
   */
  processing: boolean;
  
  /**
   * Scheduled frame ID for cancellation
   */
  frameId?: number;
  
  /**
   * Time when batch was created
   */
  createdAt: number;
  
  /**
   * Time when batch processing started
   */
  startedAt?: number;
  
  /**
   * Time when batch processing completed
   */
  completedAt?: number;
}

/**
 * Options for DOM batch processing
 */
export interface DomBatcherOptions {
  /**
   * Whether to automatically sort tasks to minimize layout thrashing
   */
  autoOptimize?: boolean;
  
  /**
   * Maximum batch size before auto-flushing
   */
  maxBatchSize?: number;
  
  /**
   * Maximum time (ms) to wait before auto-flushing
   */
  maxWaitTime?: number;
  
  /**
   * Whether to automatically process the batch in the next animation frame
   */
  autoProcess?: boolean;
  
  /**
   * Whether to add dependencies between read/write operations
   */
  enforceReadWriteOrder?: boolean;
  
  /**
   * Whether to use microtasks for high-priority operations
   */
  useMicrotaskForHighPriority?: boolean;
}

/**
 * DOM batch processor
 */
export class DomBatcher {
  private static instance: DomBatcher;
  
  // Current batch being built
  private currentBatch: DomBatch;
  
  // Default options
  private options: Required<DomBatcherOptions> = {
    autoOptimize: true,
    maxBatchSize: 100,
    maxWaitTime: 20,
    autoProcess: true,
    enforceReadWriteOrder: true,
    useMicrotaskForHighPriority: true
  };
  
  // Performance metrics
  private metrics = {
    batchesProcessed: 0,
    tasksProcessed: 0,
    averageTaskTime: 0,
    averageBatchTime: 0,
    maxBatchTime: 0,
    layoutThrashingPrevented: 0
  };
  
  // Batch processing state
  private isFlushing = false;
  private lastReadId: string | null = null;
  private lastWriteId: string | null = null;
  private readOpsCount = 0;
  private writeOpsCount = 0;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(options?: DomBatcherOptions): DomBatcher {
    if (!DomBatcher.instance) {
      DomBatcher.instance = new DomBatcher(options);
    } else if (options) {
      DomBatcher.instance.configure(options);
    }
    
    return DomBatcher.instance;
  }
  
  /**
   * Creates a new DOM batcher
   */
  private constructor(options?: DomBatcherOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    // Initialize the current batch
    this.currentBatch = this.createNewBatch();
  }
  
  /**
   * Configure the batcher options
   */
  public configure(options: DomBatcherOptions): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Create a new DOM batch
   */
  private createNewBatch(): DomBatch {
    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      tasks: new Map(),
      processing: false,
      createdAt: performance.now()
    };
  }
  
  /**
   * Schedule a DOM read operation
   */
  public read<T>(
    callback: () => T,
    priority: BatchPriority = BatchPriority.NORMAL,
    target?: Element
  ): Promise<T> {
    return this.schedule({
      type: DomOperationType.READ,
      callback,
      priority,
      target,
      args: []
    });
  }
  
  /**
   * Schedule a DOM write operation
   */
  public write<T>(
    callback: () => T,
    priority: BatchPriority = BatchPriority.NORMAL,
    target?: Element
  ): Promise<T> {
    return this.schedule({
      type: DomOperationType.WRITE,
      callback,
      priority,
      target,
      args: []
    });
  }
  
  /**
   * Schedule a DOM measure operation (like getBoundingClientRect)
   */
  public measure<T>(
    element: Element,
    measureFn: (el: Element) => T,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<T> {
    return this.schedule({
      type: DomOperationType.READ,
      callback: measureFn,
      priority,
      target: element,
      args: [element]
    });
  }
  
  /**
   * Schedule a DOM mutation operation
   */
  public mutate<T>(
    element: Element,
    mutateFn: (el: Element) => T,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<T> {
    return this.schedule({
      type: DomOperationType.WRITE,
      callback: mutateFn,
      priority,
      target: element,
      args: [element]
    });
  }
  
  /**
   * Schedule a style update
   */
  public style(
    element: HTMLElement,
    property: string,
    value: string,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.STYLE,
      callback: (el, prop, val) => {
        el.style[prop as any] = val;
      },
      priority,
      target: element,
      args: [element, property, value]
    });
  }
  
  /**
   * Schedule a class modification
   */
  public class(
    element: Element,
    action: 'add' | 'remove' | 'toggle',
    className: string,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.CLASS,
      callback: (el, act, cls) => {
        el.classList[act](cls);
      },
      priority,
      target: element,
      args: [element, action, className]
    });
  }
  
  /**
   * Schedule an attribute modification
   */
  public attribute(
    element: Element,
    attribute: string,
    value?: string,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.ATTRIBUTE,
      callback: (el, attr, val) => {
        if (val === undefined) {
          el.removeAttribute(attr);
        } else {
          el.setAttribute(attr, val);
        }
      },
      priority,
      target: element,
      args: [element, attribute, value]
    });
  }
  
  /**
   * Schedule a transform update
   */
  public transform(
    element: HTMLElement,
    transform: string,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.TRANSFORM,
      callback: (el, trans) => {
        el.style.transform = trans;
      },
      priority,
      target: element,
      args: [element, transform]
    });
  }
  
  /**
   * Schedule a task to be executed in the next batch
   */
  public schedule<T>({
    type,
    callback,
    priority = BatchPriority.NORMAL,
    target,
    args = []
  }: Omit<DomTask, 'id' | 'hasDependencies' | 'dependencies'>): Promise<T> {
    // Create task ID
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Create a promise to resolve when the task is executed
    return new Promise<T>((resolve, reject) => {
      // Wrap the callback to capture the result and resolve the promise
      const wrappedCallback = (...callbackArgs: any[]) => {
        try {
          const result = callback(...callbackArgs);
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };
      
      // Create the task object
      const task: DomTask = {
        id,
        type,
        priority,
        target,
        callback: wrappedCallback,
        args,
        hasDependencies: false,
        dependencies: []
      };
      
      // Manage dependencies between read and write operations
      if (this.options.enforceReadWriteOrder) {
        if (type === DomOperationType.READ || type === DomOperationType.MEASURE) {
          // If there was a previous write, this read depends on it
          if (this.lastWriteId) {
            task.hasDependencies = true;
            task.dependencies = [this.lastWriteId];
          }
          
          this.lastReadId = id;
          this.readOpsCount++;
        } else if (
          type === DomOperationType.WRITE || 
          type === DomOperationType.MUTATE ||
          type === DomOperationType.STYLE ||
          type === DomOperationType.CLASS ||
          type === DomOperationType.ATTRIBUTE ||
          type === DomOperationType.TRANSFORM
        ) {
          // If there was a previous read, this write depends on it
          if (this.lastReadId) {
            task.hasDependencies = true;
            task.dependencies = [this.lastReadId];
          }
          
          this.lastWriteId = id;
          this.writeOpsCount++;
        }
      }
      
      // Add to the current batch
      this.currentBatch.tasks.set(id, task);
      
      // Execute high priority tasks immediately using microtasks
      if (priority === BatchPriority.HIGH && this.options.useMicrotaskForHighPriority) {
        queueMicrotask(() => {
          this.executeTask(task);
        });
        return;
      }
      
      // Process batch if it's getting too large or has been waiting too long
      if (
        this.options.autoProcess && (
          this.currentBatch.tasks.size >= this.options.maxBatchSize ||
          performance.now() - this.currentBatch.createdAt >= this.options.maxWaitTime
        )
      ) {
        this.flush();
      } else if (this.options.autoProcess && !this.currentBatch.frameId) {
        // Schedule processing for the next animation frame
        this.currentBatch.frameId = requestAnimationFrame(() => this.flush());
      }
    });
  }
  
  /**
   * Immediately process the current batch
   */
  public flush(): void {
    if (this.isFlushing) return; // Prevent re-entry
    
    this.isFlushing = true;
    
    // Capture the current batch
    const batch = this.currentBatch;
    
    // Create a new batch for subsequent operations
    this.currentBatch = this.createNewBatch();
    
    // Reset tracking variables
    this.lastReadId = null;
    this.lastWriteId = null;
    
    // Record layout thrashing prevention
    if (this.readOpsCount > 0 && this.writeOpsCount > 0) {
      // Each read followed by a write could cause layout thrashing, but we batch them
      this.metrics.layoutThrashingPrevented += Math.min(this.readOpsCount, this.writeOpsCount);
    }
    this.readOpsCount = 0;
    this.writeOpsCount = 0;
    
    // Cancel any scheduled frame
    if (batch.frameId !== undefined) {
      cancelAnimationFrame(batch.frameId);
    }
    
    // Mark batch as processing
    batch.processing = true;
    batch.startedAt = performance.now();
    
    // Process the batch
    this.processBatch(batch).finally(() => {
      this.isFlushing = false;
      batch.processing = false;
      batch.completedAt = performance.now();
      
      // Update metrics
      this.metrics.batchesProcessed++;
      this.metrics.tasksProcessed += batch.tasks.size;
      
      const batchTime = (batch.completedAt - batch.startedAt);
      this.metrics.averageBatchTime = 
        (this.metrics.averageBatchTime * (this.metrics.batchesProcessed - 1) + batchTime) / 
        this.metrics.batchesProcessed;
      
      this.metrics.maxBatchTime = Math.max(this.metrics.maxBatchTime, batchTime);
      
      // Schedule next batch if there are tasks
      if (this.options.autoProcess && this.currentBatch.tasks.size > 0) {
        this.currentBatch.frameId = requestAnimationFrame(() => this.flush());
      }
    });
  }
  
  /**
   * Process a batch of DOM operations
   */
  private async processBatch(batch: DomBatch): Promise<void> {
    if (batch.tasks.size === 0) return;
    
    // Copy tasks to an array for sorting
    const tasks = Array.from(batch.tasks.values());
    
    // Sort tasks by priority, then by type (read before write)
    if (this.options.autoOptimize) {
      tasks.sort((a, b) => {
        // Sort by priority first
        const priorityDiff = a.priority - b.priority;
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then sort by operation type (read before write)
        const aIsRead = a.type === DomOperationType.READ || a.type === DomOperationType.MEASURE;
        const bIsRead = b.type === DomOperationType.READ || b.type === DomOperationType.MEASURE;
        
        if (aIsRead && !bIsRead) return -1;
        if (!aIsRead && bIsRead) return 1;
        
        return 0;
      });
    }
    
    // Track completed tasks
    const completedTasks = new Set<string>();
    
    // Execute tasks in order
    for (const task of tasks) {
      // Skip tasks with unmet dependencies
      if (
        task.hasDependencies && 
        task.dependencies && 
        task.dependencies.some(depId => !completedTasks.has(depId))
      ) {
        continue;
      }
      
      await this.executeTask(task);
      completedTasks.add(task.id);
    }
  }
  
  /**
   * Execute a single DOM task
   */
  private executeTask(task: DomTask): Promise<any> {
    // Skip if already executed
    if (task.callback.hasOwnProperty('__executed')) return Promise.resolve();
    
    try {
      const startTime = performance.now();
      
      // Execute the task with its arguments
      const result = task.callback(...(task.args || []));
      
      // Update task timing metrics
      const taskTime = performance.now() - startTime;
      this.metrics.averageTaskTime = 
        (this.metrics.averageTaskTime * (this.metrics.tasksProcessed) + taskTime) / 
        (this.metrics.tasksProcessed + 1);
      
      // Mark as executed
      Object.defineProperty(task.callback, '__executed', { value: true });
      
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  
  /**
   * Get performance metrics
   */
  public getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }
  
  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      batchesProcessed: 0,
      tasksProcessed: 0,
      averageTaskTime: 0,
      averageBatchTime: 0,
      maxBatchTime: 0,
      layoutThrashingPrevented: 0
    };
  }
  
  /**
   * Helper function to batch multiple style operations
   */
  public batchStyles(
    element: HTMLElement,
    styles: Record<string, string>,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.STYLE,
      callback: (el, stylesObj) => {
        Object.entries(stylesObj).forEach(([property, value]) => {
          el.style[property as any] = value;
        });
      },
      priority,
      target: element,
      args: [element, styles]
    });
  }
  
  /**
   * Helper function to batch multiple class operations
   */
  public batchClasses(
    element: Element,
    classes: { add?: string[], remove?: string[] },
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.CLASS,
      callback: (el, cls) => {
        if (cls.add && cls.add.length > 0) {
          el.classList.add(...cls.add);
        }
        if (cls.remove && cls.remove.length > 0) {
          el.classList.remove(...cls.remove);
        }
      },
      priority,
      target: element,
      args: [element, classes]
    });
  }
  
  /**
   * Helper function to batch multiple attribute operations
   */
  public batchAttributes(
    element: Element,
    attributes: Record<string, string | null>,
    priority: BatchPriority = BatchPriority.NORMAL
  ): Promise<void> {
    return this.schedule({
      type: DomOperationType.ATTRIBUTE,
      callback: (el, attrs) => {
        Object.entries(attrs).forEach(([attr, value]) => {
          if (value === null) {
            el.removeAttribute(attr);
          } else {
            el.setAttribute(attr, value);
          }
        });
      },
      priority,
      target: element,
      args: [element, attributes]
    });
  }
}

// Create a global instance for easy import
export const domBatcher = DomBatcher.getInstance();

// Export default for convenience
export default domBatcher;