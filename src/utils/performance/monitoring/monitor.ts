/**
 * Performance Monitoring System - Core Monitor
 * 
 * Main performance monitoring system implementation
 */

import {
  PerformanceSnapshot,
  PerformanceIssue,
  PerformanceTimerData,
  PerformanceMonitoringConfig,
  DEFAULT_MONITORING_CONFIG,
  MonitoringScope,
  PerformanceCategory,
  PerformanceSeverity
} from './types';

import {
  measureFrameRate,
  measureLayoutOperations,
  measureMemory,
  measureResources,
  measureInteraction,
  measureAllMetrics
} from './metrics';

import {
  analyzeFrameRate,
  analyzeLayout,
  analyzeMemory,
  analyzeResources,
  analyzeInteraction,
  analyzeAllMetrics,
  calculatePerformanceScore
} from './analysis';

/**
 * Performance monitoring system class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  /** Monitoring configuration */
  private config: PerformanceMonitoringConfig;
  
  /** History of performance snapshots */
  private snapshots: PerformanceSnapshot[] = [];
  
  /** Active performance timers */
  private activeTimers: Map<string, { 
    startTime: Date; 
    category?: PerformanceCategory;
    metadata?: Record<string, any>;
  }> = new Map();
  
  /** Monitoring interval ID */
  private monitoringIntervalId: number | null = null;
  
  /** Whether the monitor is currently taking measurements */
  private isMeasuring = false;
  
  /** Issue listeners */
  private issueListeners: ((issues: PerformanceIssue[]) => void)[] = [];
  
  /** Snapshot listeners */
  private snapshotListeners: ((snapshot: PerformanceSnapshot) => void)[] = [];
  
  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Private constructor
   */
  private constructor() {
    this.config = { ...DEFAULT_MONITORING_CONFIG };
    
    // Only enable in development by default
    if (process.env.NODE_ENV === 'production') {
      this.config.enabled = this.config.enableInProduction;
    }
    
    // Add window unload listener to take a final snapshot
    if (typeof window !== 'undefined') {
      window.addEventListener('unload', () => {
        if (this.config.enabled) {
          this.takeSnapshot(MonitoringScope.GLOBAL, true);
        }
      });
    }
  }
  
  /**
   * Configure the performance monitor
   * @param config Configuration options
   */
  public configure(config: Partial<PerformanceMonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If we're actively monitoring, restart it with new config
    if (this.monitoringIntervalId !== null) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
  
  /**
   * Start continuous performance monitoring
   */
  public startMonitoring(): void {
    if (!this.config.enabled) return;
    if (this.monitoringIntervalId !== null) return;
    
    // Take initial snapshot
    this.takeSnapshot(MonitoringScope.GLOBAL);
    
    // Set up interval for periodic snapshots
    this.monitoringIntervalId = window.setInterval(() => {
      this.takeSnapshot(MonitoringScope.GLOBAL);
    }, this.config.monitoringInterval);
    
    if (this.config.verbose) {
      console.log('[PerformanceMonitor] Started monitoring');
    }
  }
  
  /**
   * Stop continuous performance monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringIntervalId !== null) {
      window.clearInterval(this.monitoringIntervalId);
      this.monitoringIntervalId = null;
      
      if (this.config.verbose) {
        console.log('[PerformanceMonitor] Stopped monitoring');
      }
    }
  }
  
  /**
   * Take a performance snapshot
   * @param scope Scope of the snapshot
   * @param isFinal Whether this is a final snapshot (before unload)
   * @param target Optional target component or element
   */
  public async takeSnapshot(
    scope: MonitoringScope = MonitoringScope.GLOBAL,
    isFinal = false,
    target?: string
  ): Promise<PerformanceSnapshot> {
    if (!this.config.enabled || (this.isMeasuring && !isFinal)) {
      // Return empty snapshot if disabled or already measuring
      const emptySnapshot: PerformanceSnapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: new Date(),
        scope,
        target
      };
      return emptySnapshot;
    }
    
    this.isMeasuring = true;
    
    try {
      // Take measurements
      const metrics = await measureAllMetrics(isFinal ? 100 : 1000);
      
      // Analyze metrics
      const issues = this.config.autoDetectIssues ? 
        analyzeAllMetrics(metrics, this.config, target) : [];
      
      // Calculate performance score
      const score = calculatePerformanceScore(metrics);
      
      // Get active timers
      const timers = this.getAllCompletedTimers();
      
      // Create snapshot
      const snapshot: PerformanceSnapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: new Date(),
        frameRate: metrics.frameRate,
        layout: metrics.layout,
        memory: metrics.memory,
        resources: metrics.resources,
        interaction: metrics.interaction,
        issues,
        timers,
        scope,
        target,
        score
      };
      
      // Add to history
      this.snapshots.push(snapshot);
      
      // Trim history if needed
      if (this.snapshots.length > this.config.maxSnapshots) {
        this.snapshots.shift();
      }
      
      // Notify issue listeners if we found issues
      if (issues.length > 0) {
        this.notifyIssueListeners(issues);
      }
      
      // Notify snapshot listeners
      this.notifySnapshotListeners(snapshot);
      
      // Log if verbose
      if (this.config.verbose) {
        console.log(`[PerformanceMonitor] Snapshot taken:`, {
          score,
          fps: metrics.frameRate?.averageFps.toFixed(1),
          memory: metrics.memory?.usedJSHeapSize ? 
            `${(metrics.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB` : 'N/A',
          issues: issues.length
        });
      }
      
      return snapshot;
    } catch (error) {
      console.error('[PerformanceMonitor] Error taking snapshot:', error);
      
      // Return minimal snapshot on error
      const errorSnapshot: PerformanceSnapshot = {
        id: `snapshot-error-${Date.now()}`,
        timestamp: new Date(),
        scope,
        target
      };
      
      return errorSnapshot;
    } finally {
      this.isMeasuring = false;
    }
  }
  
  /**
   * Start a performance timer
   * @param name Timer name
   * @param category Optional category
   * @param metadata Optional metadata
   */
  public startTimer(
    name: string,
    category?: PerformanceCategory,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) return;
    
    this.activeTimers.set(name, {
      startTime: new Date(),
      category,
      metadata
    });
    
    if (this.config.verbose) {
      console.log(`[PerformanceMonitor] Timer started: ${name}`);
    }
  }
  
  /**
   * Stop a performance timer
   * @param name Timer name
   * @returns Timer data or undefined if timer not found
   */
  public stopTimer(name: string): PerformanceTimerData | undefined {
    if (!this.config.enabled) return;
    
    const timer = this.activeTimers.get(name);
    if (!timer) {
      if (this.config.verbose) {
        console.warn(`[PerformanceMonitor] Timer not found: ${name}`);
      }
      return;
    }
    
    // Calculate duration
    const endTime = new Date();
    const duration = endTime.getTime() - timer.startTime.getTime();
    
    // Create timer data
    const timerData: PerformanceTimerData = {
      name,
      duration,
      startTime: timer.startTime,
      endTime,
      category: timer.category,
      metadata: timer.metadata
    };
    
    // Remove from active timers
    this.activeTimers.delete(name);
    
    if (this.config.verbose) {
      console.log(`[PerformanceMonitor] Timer stopped: ${name} (${duration}ms)`);
    }
    
    // Check for slow operations
    if (duration > this.config.anrThreshold && this.config.autoDetectIssues) {
      const category = timer.category || PerformanceCategory.SCRIPT;
      const issue: PerformanceIssue = {
        id: `timer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        description: `Slow operation detected: ${name} took ${duration}ms`,
        severity: 
          duration > this.config.anrThreshold * 5 ? PerformanceSeverity.HIGH :
          duration > this.config.anrThreshold * 2 ? PerformanceSeverity.MEDIUM :
          PerformanceSeverity.LOW,
        category,
        timestamp: new Date(),
        value: duration,
        threshold: this.config.anrThreshold,
        unit: 'ms',
        recommendation: 'Consider optimizing this operation or moving it to a web worker.'
      };
      
      this.notifyIssueListeners([issue]);
    }
    
    return timerData;
  }
  
  /**
   * Get all active timers
   */
  public getActiveTimers(): string[] {
    return Array.from(this.activeTimers.keys());
  }
  
  /**
   * Get all completed timers and clear them
   */
  private getAllCompletedTimers(): PerformanceTimerData[] {
    return [];
  }
  
  /**
   * Get all performance snapshots
   */
  public getSnapshots(): PerformanceSnapshot[] {
    return [...this.snapshots];
  }
  
  /**
   * Get the latest performance snapshot
   */
  public getLatestSnapshot(): PerformanceSnapshot | undefined {
    if (this.snapshots.length === 0) return undefined;
    return this.snapshots[this.snapshots.length - 1];
  }
  
  /**
   * Clear all performance snapshots
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    
    if (this.config.verbose) {
      console.log('[PerformanceMonitor] Snapshots cleared');
    }
  }
  
  /**
   * Add a listener for performance issues
   * @param listener Function to call when issues are detected
   * @returns Function to remove the listener
   */
  public addIssueListener(listener: (issues: PerformanceIssue[]) => void): () => void {
    this.issueListeners.push(listener);
    
    return () => {
      const index = this.issueListeners.indexOf(listener);
      if (index !== -1) {
        this.issueListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all issue listeners
   */
  private notifyIssueListeners(issues: PerformanceIssue[]): void {
    this.issueListeners.forEach(listener => {
      try {
        listener(issues);
      } catch (error) {
        console.error('[PerformanceMonitor] Error in issue listener:', error);
      }
    });
  }
  
  /**
   * Add a listener for performance snapshots
   * @param listener Function to call when a snapshot is taken
   * @returns Function to remove the listener
   */
  public addSnapshotListener(listener: (snapshot: PerformanceSnapshot) => void): () => void {
    this.snapshotListeners.push(listener);
    
    return () => {
      const index = this.snapshotListeners.indexOf(listener);
      if (index !== -1) {
        this.snapshotListeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all snapshot listeners
   */
  private notifySnapshotListeners(snapshot: PerformanceSnapshot): void {
    this.snapshotListeners.forEach(listener => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('[PerformanceMonitor] Error in snapshot listener:', error);
      }
    });
  }
  
  /**
   * Record a performance issue manually
   * @param issue Issue to record
   */
  public recordIssue(issue: Omit<PerformanceIssue, 'id' | 'timestamp'>): PerformanceIssue {
    if (!this.config.enabled) {
      return {
        id: `issue-${Date.now()}`,
        timestamp: new Date(),
        ...issue
      };
    }
    
    // Create full issue
    const fullIssue: PerformanceIssue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date(),
      ...issue
    };
    
    // Notify listeners
    this.notifyIssueListeners([fullIssue]);
    
    // Log if verbose
    if (this.config.verbose) {
      console.log(`[PerformanceMonitor] Issue recorded: ${fullIssue.description}`);
    }
    
    return fullIssue;
  }
  
  /**
   * Mark an issue as resolved
   * @param issueId ID of the issue to resolve
   */
  public resolveIssue(issueId: string): void {
    // Find the issue in snapshots
    for (const snapshot of this.snapshots) {
      if (snapshot.issues) {
        const issue = snapshot.issues.find(i => i.id === issueId);
        if (issue && !issue.resolved) {
          issue.resolved = true;
          issue.resolvedAt = new Date();
          
          if (this.config.verbose) {
            console.log(`[PerformanceMonitor] Issue resolved: ${issue.description}`);
          }
          
          // Notify listeners
          this.notifyIssueListeners([issue]);
          break;
        }
      }
    }
  }
  
  /**
   * Get all active performance issues (unresolved)
   */
  public getActiveIssues(): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    
    // Collect issues from all snapshots
    for (const snapshot of this.snapshots) {
      if (snapshot.issues) {
        snapshot.issues.forEach(issue => {
          if (!issue.resolved) {
            issues.push(issue);
          }
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Check if performance monitoring is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Check if performance monitoring is currently running
   */
  public isMonitoring(): boolean {
    return this.monitoringIntervalId !== null;
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): PerformanceMonitoringConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();