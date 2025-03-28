/**
 * Performance Monitoring System - Analysis
 * 
 * Analysis and issue detection for performance monitoring
 */

import {
  PerformanceSeverity,
  PerformanceCategory,
  PerformanceIssue,
  FrameRateMetric,
  LayoutMetrics,
  MemoryMetrics,
  ResourceMetrics,
  InteractionMetrics,
  PerformanceMonitoringConfig,
  DEFAULT_MONITORING_CONFIG
} from './types';

/**
 * Generate a unique ID for issues
 */
const generateIssueId = (category: PerformanceCategory, target?: string): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  const targetPart = target ? `-${target.substring(0, 10)}` : '';
  
  return `${category}${targetPart}-${timestamp}-${randomPart}`;
};

/**
 * Analyze frame rate metrics and detect issues
 * @param metrics Frame rate metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns Detected performance issues
 */
export const analyzeFrameRate = (
  metrics: FrameRateMetric,
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // Poor frame rate
  if (metrics.averageFps < config.fpsErrorThreshold) {
    issues.push({
      id: generateIssueId(PerformanceCategory.FPS, target),
      description: `Critically low frame rate: ${metrics.averageFps.toFixed(1)} FPS`,
      severity: PerformanceSeverity.CRITICAL,
      category: PerformanceCategory.FPS,
      target,
      timestamp: new Date(),
      value: metrics.averageFps,
      threshold: config.fpsErrorThreshold,
      unit: 'fps',
      recommendation: 'Optimize animations, reduce visual complexity, and minimize layout operations.'
    });
  } else if (metrics.averageFps < config.fpsWarningThreshold) {
    issues.push({
      id: generateIssueId(PerformanceCategory.FPS, target),
      description: `Low frame rate: ${metrics.averageFps.toFixed(1)} FPS`,
      severity: PerformanceSeverity.HIGH,
      category: PerformanceCategory.FPS,
      target,
      timestamp: new Date(),
      value: metrics.averageFps,
      threshold: config.fpsWarningThreshold,
      unit: 'fps',
      recommendation: 'Consider reducing animation complexity and optimizing render performance.'
    });
  }
  
  // Unstable frame rate
  if (metrics.fpsStandardDeviation > 10 && metrics.averageFps < 50) {
    issues.push({
      id: generateIssueId(PerformanceCategory.FPS, target),
      description: `Unstable frame rate with high variation (σ=${metrics.fpsStandardDeviation.toFixed(1)})`,
      severity: PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.FPS,
      target,
      timestamp: new Date(),
      value: metrics.fpsStandardDeviation,
      threshold: 10,
      unit: 'σ',
      recommendation: 'Check for inconsistent workload, garbage collection, or background tasks.'
    });
  }
  
  // High dropped frames
  if (metrics.droppedFramesPercentage > 20) {
    issues.push({
      id: generateIssueId(PerformanceCategory.FPS, target),
      description: `High percentage of dropped frames: ${metrics.droppedFramesPercentage.toFixed(1)}%`,
      severity: metrics.droppedFramesPercentage > 40 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.FPS,
      target,
      timestamp: new Date(),
      value: metrics.droppedFramesPercentage,
      threshold: 20,
      unit: '%',
      recommendation: 'Reduce JavaScript work on the main thread during animations.'
    });
  }
  
  return issues;
};

/**
 * Analyze layout metrics and detect issues
 * @param metrics Layout metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns Detected performance issues
 */
export const analyzeLayout = (
  metrics: LayoutMetrics,
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // Calculate operations per second for fair comparison
  const durationInSeconds = metrics.duration / 1000;
  const layoutOpsPerSecond = metrics.layoutCount / durationInSeconds;
  const styleOpsPerSecond = metrics.styleCount / durationInSeconds;
  
  // Excessive layout operations
  if (layoutOpsPerSecond > config.layoutOperationsWarningThreshold) {
    issues.push({
      id: generateIssueId(PerformanceCategory.LAYOUT, target),
      description: `Excessive layout operations: ${layoutOpsPerSecond.toFixed(1)}/s`,
      severity: layoutOpsPerSecond > config.layoutOperationsWarningThreshold * 2 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.LAYOUT,
      target,
      timestamp: new Date(),
      value: layoutOpsPerSecond,
      threshold: config.layoutOperationsWarningThreshold,
      unit: 'ops/s',
      recommendation: 'Batch DOM updates, reduce style changes, and avoid forced reflows.'
    });
  }
  
  // Forced reflows (synchronous layouts)
  if (metrics.forcedReflows > 5) {
    issues.push({
      id: generateIssueId(PerformanceCategory.LAYOUT, target),
      description: `Detected ${metrics.forcedReflows} forced reflows/layout thrashing`,
      severity: metrics.forcedReflows > 10 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.LAYOUT,
      target,
      timestamp: new Date(),
      value: metrics.forcedReflows,
      threshold: 5,
      unit: 'reflows',
      recommendation: 'Avoid mixing reads and writes to the DOM. Batch read operations and then batch write operations.'
    });
  }
  
  // Excessive style calculations
  if (styleOpsPerSecond > config.layoutOperationsWarningThreshold * 1.5) {
    issues.push({
      id: generateIssueId(PerformanceCategory.LAYOUT, target),
      description: `Excessive style calculations: ${styleOpsPerSecond.toFixed(1)}/s`,
      severity: PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.LAYOUT,
      target,
      timestamp: new Date(),
      value: styleOpsPerSecond,
      threshold: config.layoutOperationsWarningThreshold * 1.5,
      unit: 'ops/s',
      recommendation: 'Minimize style changes and consider using CSS animations instead of JavaScript.'
    });
  }
  
  return issues;
};

/**
 * Analyze memory metrics and detect issues
 * @param metrics Memory metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns Detected performance issues
 */
export const analyzeMemory = (
  metrics: MemoryMetrics,
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // High memory usage
  if (metrics.jsHeapSizeLimit && metrics.usedJSHeapSize) {
    const memoryUsagePercentage = (metrics.usedJSHeapSize / metrics.jsHeapSizeLimit) * 100;
    
    if (memoryUsagePercentage > config.memoryWarningThreshold) {
      issues.push({
        id: generateIssueId(PerformanceCategory.MEMORY, target),
        description: `High memory usage: ${memoryUsagePercentage.toFixed(1)}% of available heap`,
        severity: memoryUsagePercentage > 90 ? 
          PerformanceSeverity.CRITICAL : PerformanceSeverity.HIGH,
        category: PerformanceCategory.MEMORY,
        target,
        timestamp: new Date(),
        value: memoryUsagePercentage,
        threshold: config.memoryWarningThreshold,
        unit: '%',
        recommendation: 'Check for memory leaks, large objects, or excessive caching. Consider implementing virtualization for large lists.'
      });
    }
  }
  
  // Excessive DOM nodes
  if (metrics.domNodeCount > 1500) {
    issues.push({
      id: generateIssueId(PerformanceCategory.MEMORY, target),
      description: `Large DOM tree with ${metrics.domNodeCount} nodes`,
      severity: metrics.domNodeCount > 2500 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.MEMORY,
      target,
      timestamp: new Date(),
      value: metrics.domNodeCount,
      threshold: 1500,
      unit: 'nodes',
      recommendation: 'Consider virtualizing large lists, removing unnecessary elements, or implementing pagination.'
    });
  }
  
  // Garbage collection occurred
  if (metrics.gcOccurred) {
    issues.push({
      id: generateIssueId(PerformanceCategory.MEMORY, target),
      description: 'Garbage collection occurred during measurement',
      severity: PerformanceSeverity.LOW,
      category: PerformanceCategory.MEMORY,
      target,
      timestamp: new Date(),
      recommendation: 'Frequent garbage collection can cause jank. Consider object pooling or reducing allocations during animations.'
    });
  }
  
  return issues;
};

/**
 * Analyze resource metrics and detect issues
 * @param metrics Resource metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns Detected performance issues
 */
export const analyzeResources = (
  metrics: ResourceMetrics,
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // Large resource size
  const resourceSizeMB = metrics.totalResourceSize / (1024 * 1024);
  if (resourceSizeMB > 5) {
    issues.push({
      id: generateIssueId(PerformanceCategory.RESOURCE, target),
      description: `Large total resource size: ${resourceSizeMB.toFixed(1)} MB`,
      severity: resourceSizeMB > 10 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.RESOURCE,
      target,
      timestamp: new Date(),
      value: resourceSizeMB,
      threshold: 5,
      unit: 'MB',
      recommendation: 'Compress assets, use image optimization, and consider code splitting.'
    });
  }
  
  // Too many resources
  if (metrics.resourceCount > 100) {
    issues.push({
      id: generateIssueId(PerformanceCategory.RESOURCE, target),
      description: `High number of resources: ${metrics.resourceCount}`,
      severity: metrics.resourceCount > 200 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.RESOURCE,
      target,
      timestamp: new Date(),
      value: metrics.resourceCount,
      threshold: 100,
      unit: 'resources',
      recommendation: 'Reduce HTTP requests by bundling resources, using sprites, or implementing code splitting.'
    });
  }
  
  // Excessive image usage
  const imageCount = metrics.resourcesByType.img || 0;
  if (imageCount > 30) {
    issues.push({
      id: generateIssueId(PerformanceCategory.RESOURCE, target),
      description: `High number of images: ${imageCount}`,
      severity: PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.RESOURCE,
      target,
      timestamp: new Date(),
      value: imageCount,
      threshold: 30,
      unit: 'images',
      recommendation: 'Lazy load images, use efficient formats like WebP, and consider using CSS for simple graphics.'
    });
  }
  
  return issues;
};

/**
 * Analyze interaction metrics and detect issues
 * @param metrics Interaction metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns Detected performance issues
 */
export const analyzeInteraction = (
  metrics: InteractionMetrics,
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // High first input delay
  if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
    issues.push({
      id: generateIssueId(PerformanceCategory.INPUT, target),
      description: `High first input delay: ${metrics.firstInputDelay.toFixed(1)} ms`,
      severity: metrics.firstInputDelay > 300 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.INPUT,
      target,
      timestamp: new Date(),
      value: metrics.firstInputDelay,
      threshold: 100,
      unit: 'ms',
      recommendation: 'Break up long tasks, optimize event handlers, and minimize work on the main thread.'
    });
  }
  
  // Slow interaction to next paint
  if (metrics.interactionToNextPaint && metrics.interactionToNextPaint > 100) {
    issues.push({
      id: generateIssueId(PerformanceCategory.INPUT, target),
      description: `Slow interaction to next paint: ${metrics.interactionToNextPaint.toFixed(1)} ms`,
      severity: metrics.interactionToNextPaint > 200 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.INPUT,
      target,
      timestamp: new Date(),
      value: metrics.interactionToNextPaint,
      threshold: 100,
      unit: 'ms',
      recommendation: 'Optimize event handlers and minimize synchronous work after user interaction.'
    });
  }
  
  // High cumulative layout shift
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
    issues.push({
      id: generateIssueId(PerformanceCategory.LAYOUT, target),
      description: `High cumulative layout shift: ${metrics.cumulativeLayoutShift.toFixed(3)}`,
      severity: metrics.cumulativeLayoutShift > 0.25 ? 
        PerformanceSeverity.HIGH : PerformanceSeverity.MEDIUM,
      category: PerformanceCategory.LAYOUT,
      target,
      timestamp: new Date(),
      value: metrics.cumulativeLayoutShift,
      threshold: 0.1,
      unit: 'CLS',
      recommendation: 'Ensure elements have dimensions before they load, use content-visibility, and avoid inserting content above existing content.'
    });
  }
  
  return issues;
};

/**
 * Analyze all metrics and detect issues
 * @param metrics All performance metrics
 * @param config Monitoring configuration
 * @param target Optional target component or element
 * @returns All detected performance issues
 */
export const analyzeAllMetrics = (
  metrics: {
    frameRate?: FrameRateMetric;
    layout?: LayoutMetrics;
    memory?: MemoryMetrics;
    resources?: ResourceMetrics;
    interaction?: InteractionMetrics;
  },
  config: PerformanceMonitoringConfig = DEFAULT_MONITORING_CONFIG,
  target?: string
): PerformanceIssue[] => {
  const issues: PerformanceIssue[] = [];
  
  // Analyze each metric type if available
  if (metrics.frameRate) {
    issues.push(...analyzeFrameRate(metrics.frameRate, config, target));
  }
  
  if (metrics.layout) {
    issues.push(...analyzeLayout(metrics.layout, config, target));
  }
  
  if (metrics.memory) {
    issues.push(...analyzeMemory(metrics.memory, config, target));
  }
  
  if (metrics.resources) {
    issues.push(...analyzeResources(metrics.resources, config, target));
  }
  
  if (metrics.interaction) {
    issues.push(...analyzeInteraction(metrics.interaction, config, target));
  }
  
  // Filter issues by severity
  return issues.filter(issue => 
    config.minimumSeverity === PerformanceSeverity.INFO || 
    issueSeverityLevel(issue.severity) >= issueSeverityLevel(config.minimumSeverity)
  );
};

/**
 * Convert severity to numeric level for comparison
 */
const issueSeverityLevel = (severity: PerformanceSeverity): number => {
  switch (severity) {
    case PerformanceSeverity.CRITICAL: return 4;
    case PerformanceSeverity.HIGH: return 3;
    case PerformanceSeverity.MEDIUM: return 2;
    case PerformanceSeverity.LOW: return 1;
    case PerformanceSeverity.INFO: return 0;
    default: return 0;
  }
};

/**
 * Calculate overall performance score (0-100)
 * @param metrics All performance metrics
 * @returns Performance score
 */
export const calculatePerformanceScore = (
  metrics: {
    frameRate?: FrameRateMetric;
    layout?: LayoutMetrics;
    memory?: MemoryMetrics;
    resources?: ResourceMetrics;
    interaction?: InteractionMetrics;
  }
): number => {
  let score = 100;
  
  // FPS score (0-30 points)
  if (metrics.frameRate) {
    const { averageFps, droppedFramesPercentage } = metrics.frameRate;
    
    // FPS score (0-20 points)
    let fpsScore = 0;
    if (averageFps >= 60) fpsScore = 20;
    else if (averageFps >= 50) fpsScore = 18;
    else if (averageFps >= 40) fpsScore = 15;
    else if (averageFps >= 30) fpsScore = 10;
    else if (averageFps >= 20) fpsScore = 5;
    else fpsScore = 0;
    
    // Dropped frames penalty (0-10 points)
    let droppedFramesPenalty = 0;
    if (droppedFramesPercentage > 50) droppedFramesPenalty = 10;
    else if (droppedFramesPercentage > 30) droppedFramesPenalty = 7;
    else if (droppedFramesPercentage > 20) droppedFramesPenalty = 5;
    else if (droppedFramesPercentage > 10) droppedFramesPenalty = 3;
    else if (droppedFramesPercentage > 5) droppedFramesPenalty = 1;
    
    score -= (20 - fpsScore) + droppedFramesPenalty;
  }
  
  // Layout score (0-25 points)
  if (metrics.layout) {
    const { layoutCount, forcedReflows } = metrics.layout;
    const durationInSeconds = metrics.layout.duration / 1000;
    const layoutOpsPerSecond = layoutCount / durationInSeconds;
    
    // Layout operations penalty (0-15 points)
    let layoutPenalty = 0;
    if (layoutOpsPerSecond > 60) layoutPenalty = 15;
    else if (layoutOpsPerSecond > 40) layoutPenalty = 10;
    else if (layoutOpsPerSecond > 20) layoutPenalty = 5;
    else if (layoutOpsPerSecond > 10) layoutPenalty = 3;
    
    // Forced reflows penalty (0-10 points)
    let reflowsPenalty = 0;
    if (forcedReflows > 20) reflowsPenalty = 10;
    else if (forcedReflows > 10) reflowsPenalty = 7;
    else if (forcedReflows > 5) reflowsPenalty = 5;
    else if (forcedReflows > 2) reflowsPenalty = 2;
    
    score -= layoutPenalty + reflowsPenalty;
  }
  
  // Memory score (0-20 points)
  if (metrics.memory) {
    // Memory usage penalty (0-15 points)
    let memoryPenalty = 0;
    
    if (metrics.memory.jsHeapSizeLimit && metrics.memory.usedJSHeapSize) {
      const memoryUsagePercentage = (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100;
      
      if (memoryUsagePercentage > 90) memoryPenalty = 15;
      else if (memoryUsagePercentage > 80) memoryPenalty = 10;
      else if (memoryUsagePercentage > 70) memoryPenalty = 7;
      else if (memoryUsagePercentage > 60) memoryPenalty = 5;
      else if (memoryUsagePercentage > 50) memoryPenalty = 3;
    }
    
    // DOM size penalty (0-5 points)
    let domPenalty = 0;
    if (metrics.memory.domNodeCount > 3000) domPenalty = 5;
    else if (metrics.memory.domNodeCount > 2000) domPenalty = 3;
    else if (metrics.memory.domNodeCount > 1000) domPenalty = 1;
    
    score -= memoryPenalty + domPenalty;
  }
  
  // Interaction score (0-25 points)
  if (metrics.interaction) {
    // Input delay penalty (0-15 points)
    let inputDelayPenalty = 0;
    if (metrics.interaction.interactionToNextPaint) {
      const delay = metrics.interaction.interactionToNextPaint;
      
      if (delay > 500) inputDelayPenalty = 15;
      else if (delay > 300) inputDelayPenalty = 10;
      else if (delay > 200) inputDelayPenalty = 7;
      else if (delay > 100) inputDelayPenalty = 5;
      else if (delay > 50) inputDelayPenalty = 2;
    }
    
    // Layout shift penalty (0-10 points)
    let layoutShiftPenalty = 0;
    if (metrics.interaction.cumulativeLayoutShift) {
      const cls = metrics.interaction.cumulativeLayoutShift;
      
      if (cls > 0.5) layoutShiftPenalty = 10;
      else if (cls > 0.25) layoutShiftPenalty = 7;
      else if (cls > 0.1) layoutShiftPenalty = 5;
      else if (cls > 0.05) layoutShiftPenalty = 2;
    }
    
    score -= inputDelayPenalty + layoutShiftPenalty;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};