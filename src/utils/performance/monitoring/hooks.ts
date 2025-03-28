/**
 * Performance Monitoring System - React Hooks
 * 
 * React hooks for performance monitoring
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from './monitor';
import { MonitoringScope, PerformanceCategory, PerformanceIssue } from './types';

/**
 * Hook to monitor component performance
 * @param componentName Name of the component
 * @param options Monitoring options
 */
export const usePerformanceMonitoring = (
  componentName: string,
  options: {
    enabled?: boolean;
    monitorOnMount?: boolean;
    monitorOnUnmount?: boolean;
    trackInteractions?: boolean;
    trackRenders?: boolean;
    trackEffects?: boolean;
  } = {}
) => {
  const {
    enabled = true,
    monitorOnMount = true,
    monitorOnUnmount = true,
    trackInteractions = true,
    trackRenders = true,
    trackEffects = false
  } = options;
  
  // Track render count
  const renderCount = useRef(0);
  
  // Track mounting time
  const mountTime = useRef<Date | null>(null);
  
  // Track effect runs
  const effectCount = useRef(0);
  
  // Active timers
  const activeTimers = useRef<string[]>([]);
  
  // Check if monitoring is enabled globally
  const isMonitoringEnabled = performanceMonitor.isEnabled() && enabled;
  
  // Take a snapshot
  const takeSnapshot = useCallback(() => {
    if (isMonitoringEnabled) {
      performanceMonitor.takeSnapshot(MonitoringScope.COMPONENT, false, componentName);
    }
  }, [isMonitoringEnabled, componentName]);
  
  // Start a timer
  const startTimer = useCallback((name: string, category?: PerformanceCategory, metadata?: Record<string, any>) => {
    if (isMonitoringEnabled) {
      const timerName = `${componentName}:${name}`;
      performanceMonitor.startTimer(timerName, category, metadata);
      activeTimers.current.push(timerName);
      return timerName;
    }
    return null;
  }, [isMonitoringEnabled, componentName]);
  
  // Stop a timer
  const stopTimer = useCallback((name: string) => {
    if (isMonitoringEnabled) {
      const timerName = name.startsWith(componentName) ? name : `${componentName}:${name}`;
      const result = performanceMonitor.stopTimer(timerName);
      activeTimers.current = activeTimers.current.filter(t => t !== timerName);
      return result;
    }
    return undefined;
  }, [isMonitoringEnabled, componentName]);
  
  // Track renders
  useEffect(() => {
    renderCount.current++;
    
    if (isMonitoringEnabled && trackRenders) {
      // First render
      if (renderCount.current === 1) {
        mountTime.current = new Date();
        
        if (monitorOnMount) {
          // Take snapshot on mount
          takeSnapshot();
        }
      } else {
        // Re-renders
        stopTimer(`render:${renderCount.current - 1}`);
      }
      
      // Start timer for this render
      startTimer(`render:${renderCount.current}`, PerformanceCategory.RENDERING, {
        renderCount: renderCount.current
      });
    }
  });
  
  // Track effects
  useEffect(() => {
    if (isMonitoringEnabled && trackEffects) {
      effectCount.current++;
      
      startTimer(`effect:${effectCount.current}`, PerformanceCategory.SCRIPT, {
        effectCount: effectCount.current
      });
      
      return () => {
        stopTimer(`effect:${effectCount.current}`);
      };
    }
  }, [isMonitoringEnabled, trackEffects, startTimer, stopTimer]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isMonitoringEnabled) {
        // Stop all active timers
        activeTimers.current.forEach(timerName => {
          performanceMonitor.stopTimer(timerName);
        });
        
        if (monitorOnUnmount) {
          // Take a final snapshot
          const unmountTime = new Date();
          const mountDuration = mountTime.current ? 
            unmountTime.getTime() - mountTime.current.getTime() : undefined;
          
          performanceMonitor.takeSnapshot(MonitoringScope.COMPONENT, true, componentName);
          
          // Record component lifetime
          if (mountDuration) {
            performanceMonitor.recordIssue({
              description: `Component ${componentName} unmounted after ${(mountDuration / 1000).toFixed(2)}s with ${renderCount.current} renders`,
              category: PerformanceCategory.GENERAL,
              severity: 'info',
              target: componentName,
            });
          }
        }
      }
    };
  }, [isMonitoringEnabled, monitorOnUnmount, componentName]);
  
  // Set up interaction monitoring
  useEffect(() => {
    if (isMonitoringEnabled && trackInteractions) {
      const interactionHandler = () => {
        takeSnapshot();
      };
      
      const interactionEvents = ['click', 'keydown', 'touchstart'];
      interactionEvents.forEach(event => {
        document.addEventListener(event, interactionHandler, { passive: true });
      });
      
      return () => {
        interactionEvents.forEach(event => {
          document.removeEventListener(event, interactionHandler);
        });
      };
    }
  }, [isMonitoringEnabled, trackInteractions, takeSnapshot]);
  
  // Return monitoring utilities
  return {
    takeSnapshot,
    startTimer,
    stopTimer,
    recordIssue: (issue: Omit<PerformanceIssue, 'id' | 'timestamp' | 'target'>) => 
      performanceMonitor.recordIssue({ ...issue, target: componentName }),
    renderCount: renderCount.current,
    timeFromMount: mountTime.current ? 
      new Date().getTime() - mountTime.current.getTime() : undefined
  };
};

/**
 * Hook to get performance metrics for the application
 */
export const usePerformanceMetrics = () => {
  const latestSnapshot = performanceMonitor.getLatestSnapshot();
  
  return {
    fps: latestSnapshot?.frameRate?.averageFps,
    memoryUsage: latestSnapshot?.memory?.usedJSHeapSize && latestSnapshot.memory.jsHeapSizeLimit ?
      (latestSnapshot.memory.usedJSHeapSize / latestSnapshot.memory.jsHeapSizeLimit) * 100 : undefined,
    domNodes: latestSnapshot?.memory?.domNodeCount,
    layoutOperations: latestSnapshot?.layout?.layoutCount,
    issueCount: latestSnapshot?.issues?.length || 0,
    performanceScore: latestSnapshot?.score,
    lastUpdated: latestSnapshot?.timestamp
  };
};

/**
 * Hook to time a function
 * @param fn Function to time
 * @param name Timer name
 * @param category Timer category
 */
export const useTimedFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  category?: PerformanceCategory
): T => {
  const componentName = useRef(`Component-${Math.random().toString(36).substring(2, 8)}`).current;
  
  const timedFn = useCallback((...args: Parameters<T>) => {
    const timerName = `${componentName}:${name}`;
    performanceMonitor.startTimer(timerName, category);
    try {
      return fn(...args);
    } finally {
      performanceMonitor.stopTimer(timerName);
    }
  }, [fn, name, category, componentName]) as T;
  
  return timedFn;
};

/**
 * Hook to time an async function
 * @param fn Async function to time
 * @param name Timer name
 * @param category Timer category
 */
export const useTimedAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string,
  category?: PerformanceCategory
): T => {
  const componentName = useRef(`Component-${Math.random().toString(36).substring(2, 8)}`).current;
  
  const timedFn = useCallback(async (...args: Parameters<T>) => {
    const timerName = `${componentName}:${name}`;
    performanceMonitor.startTimer(timerName, category);
    try {
      return await fn(...args);
    } finally {
      performanceMonitor.stopTimer(timerName);
    }
  }, [fn, name, category, componentName]) as T;
  
  return timedFn;
};