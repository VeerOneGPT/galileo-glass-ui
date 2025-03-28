/**
 * Performance Monitoring System - Metrics Collection
 * 
 * Metrics collection utilities for performance monitoring
 */

import {
  FrameRateMetric,
  LayoutMetrics,
  MemoryMetrics,
  ResourceMetrics,
  InteractionMetrics
} from './types';

/**
 * Measure frame rate over a period of time
 * @param duration Duration in milliseconds to measure
 * @returns Promise that resolves with frame rate metrics
 */
export const measureFrameRate = async (duration = 1000): Promise<FrameRateMetric> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      resolve({
        averageFps: 60,
        minFps: 60,
        maxFps: 60,
        fpsStandardDeviation: 0,
        droppedFrames: 0,
        droppedFramesPercentage: 0,
        duration,
        timestamp: new Date()
      });
      return;
    }
    
    const frameTimes: number[] = [];
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let animationFrameId: number;
    
    // Expected frame count at 60fps
    const expectedFrames = Math.round((duration / 1000) * 60);
    
    const startTime = performance.now();
    const endTime = startTime + duration;
    
    const measureFrame = (timestamp: number) => {
      const now = performance.now();
      
      // Calculate time since last frame
      const frameTime = now - lastFrameTime;
      lastFrameTime = now;
      
      // Only count reasonable frame times (>5ms to avoid browser throttling)
      if (frameTime > 5) {
        frameTimes.push(frameTime);
        frameCount++;
      }
      
      // Continue measuring if we haven't reached the duration
      if (now < endTime) {
        animationFrameId = requestAnimationFrame(measureFrame);
      } else {
        // Calculate metrics
        let sumFps = 0;
        let minFps = Infinity;
        let maxFps = 0;
        const fpsValues: number[] = [];
        
        // Convert frame times to FPS and calculate min/max
        frameTimes.forEach(time => {
          const fps = 1000 / time;
          fpsValues.push(fps);
          sumFps += fps;
          
          if (fps < minFps) minFps = fps;
          if (fps > maxFps) maxFps = fps;
        });
        
        // Calculate average FPS
        const averageFps = sumFps / frameTimes.length;
        
        // Calculate standard deviation
        let sumSquaredDifferences = 0;
        fpsValues.forEach(fps => {
          const difference = fps - averageFps;
          sumSquaredDifferences += difference * difference;
        });
        
        const fpsStandardDeviation = Math.sqrt(sumSquaredDifferences / frameTimes.length);
        
        // Calculate dropped frames (frames expected but not rendered)
        const droppedFrames = Math.max(0, expectedFrames - frameCount);
        const droppedFramesPercentage = (droppedFrames / expectedFrames) * 100;
        
        // Return metrics
        resolve({
          averageFps,
          minFps: Math.min(60, minFps === Infinity ? 60 : minFps),
          maxFps,
          fpsStandardDeviation,
          droppedFrames,
          droppedFramesPercentage,
          duration: now - startTime,
          timestamp: new Date()
        });
      }
    };
    
    // Start measuring
    animationFrameId = requestAnimationFrame(measureFrame);
    
    // Set a timeout as a safeguard to ensure we resolve
    setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      
      // If we have no frame data, return default values
      if (frameTimes.length === 0) {
        resolve({
          averageFps: 0,
          minFps: 0,
          maxFps: 0,
          fpsStandardDeviation: 0,
          droppedFrames: expectedFrames,
          droppedFramesPercentage: 100,
          duration,
          timestamp: new Date()
        });
      }
    }, duration + 100);
  });
};

/**
 * Track layout operations over a period of time
 * @param duration Duration in milliseconds to measure
 * @returns Promise that resolves with layout metrics
 */
export const measureLayoutOperations = async (duration = 1000): Promise<LayoutMetrics> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || 
        !('performance' in window) || 
        !('getEntriesByType' in performance)) {
      // Server-side rendering or unsupported browser fallback
      resolve({
        layoutCount: 0,
        styleCount: 0,
        layoutDuration: 0,
        styleDuration: 0,
        forcedReflows: 0,
        duration,
        timestamp: new Date()
      });
      return;
    }
    
    // Try to use more detailed PerformanceObserver if available
    if ('PerformanceObserver' in window && 
        PerformanceObserver.supportedEntryTypes && 
        PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      
      let layoutCount = 0;
      let styleCount = 0;
      let layoutDuration = 0;
      let styleDuration = 0;
      let forcedReflows = 0;
      let layoutShiftScore = 0;
      
      // Create observer for layout shifts
      const layoutObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ('value' in entry) {
            layoutShiftScore += (entry as any).value;
            layoutCount++;
          }
        }
      });
      
      try {
        layoutObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // Layout shift observation not supported
      }
      
      // Create observer for long tasks, which might indicate style/layout work
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Long tasks over 50ms are likely to involve layout/style work
            forcedReflows++;
            layoutDuration += entry.duration;
          }
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observation not supported
      }
      
      // Start measurement
      const startTime = performance.now();
      
      // End measurement after duration
      setTimeout(() => {
        layoutObserver.disconnect();
        longTaskObserver.disconnect();
        
        // If we have longtask data, estimate style time as a fraction of layout time
        if (layoutDuration > 0) {
          styleDuration = layoutDuration * 0.4; // Estimate style as 40% of layout work
          styleCount = Math.ceil(layoutCount * 0.6); // Estimate style count
        }
        
        // Return metrics
        resolve({
          layoutCount,
          styleCount,
          layoutDuration,
          styleDuration,
          forcedReflows,
          duration: performance.now() - startTime,
          timestamp: new Date()
        });
      }, duration);
      
      return;
    }
    
    // Fallback for browsers without PerformanceObserver support
    // Monitor the DOM for changes as a proxy for layout operations
    const startTime = performance.now();
    let layoutCount = 0;
    let styleCount = 0;
    
    // Function to force a style recalculation
    const forceStyleRecalc = (element: Element) => {
      if (!element) return;
      window.getComputedStyle(element).getPropertyValue('height');
    };
    
    // Monitor DOM mutations
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Style changes often trigger layout
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || 
             mutation.attributeName === 'class')) {
          styleCount++;
          forceStyleRecalc(mutation.target as Element);
        }
        
        // DOM structure changes always trigger layout
        if (mutation.type === 'childList') {
          layoutCount++;
          
          // For added nodes, force style calculation
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              forceStyleRecalc(node as Element);
            }
          });
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      attributeFilter: ['style', 'class'] 
    });
    
    // End measurement after duration
    setTimeout(() => {
      observer.disconnect();
      
      // Estimate durations based on counts
      // Average layout operation takes ~5ms, style ~2ms (very rough estimates)
      const layoutDuration = layoutCount * 5;
      const styleDuration = styleCount * 2;
      
      // Forced reflows are hard to detect without proper tooling
      // Estimate as 10% of layout operations
      const forcedReflows = Math.ceil(layoutCount * 0.1);
      
      // Return metrics
      resolve({
        layoutCount,
        styleCount,
        layoutDuration,
        styleDuration,
        forcedReflows,
        duration: performance.now() - startTime,
        timestamp: new Date()
      });
    }, duration);
  });
};

/**
 * Measure memory usage
 * @returns Memory metrics
 */
export const measureMemory = async (): Promise<MemoryMetrics> => {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return {
      domNodeCount: 0,
      duration: 0,
      timestamp: new Date()
    };
  }
  
  // Start measurement
  const startTime = performance.now();
  
  // Get DOM node count
  const domNodeCount = document.querySelectorAll('*').length;
  
  // Try to get memory info if available
  let totalJSHeapSize: number | undefined;
  let usedJSHeapSize: number | undefined;
  let jsHeapSizeLimit: number | undefined;
  let gcOccurred: boolean | undefined;
  
  // Chrome memory API
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    totalJSHeapSize = memoryInfo.totalJSHeapSize;
    usedJSHeapSize = memoryInfo.usedJSHeapSize;
    jsHeapSizeLimit = memoryInfo.jsHeapSizeLimit;
  }
  
  // Try to use newer performance.measureUserAgentSpecificMemory() if available
  try {
    if ('measureUserAgentSpecificMemory' in performance) {
      const memoryMeasurement = await (performance as any).measureUserAgentSpecificMemory();
      
      // Check if GC occurred by seeing if bytes is significantly less than Chrome's usedJSHeapSize
      if (usedJSHeapSize && memoryMeasurement.bytes) {
        gcOccurred = memoryMeasurement.bytes < usedJSHeapSize * 0.7;
      }
      
      // If we didn't get memory from performance.memory, use this measurement
      if (!usedJSHeapSize) {
        usedJSHeapSize = memoryMeasurement.bytes;
      }
    }
  } catch (e) {
    // Memory measurement not supported or permission denied
  }
  
  return {
    totalJSHeapSize,
    usedJSHeapSize,
    jsHeapSizeLimit,
    domNodeCount,
    gcOccurred,
    duration: performance.now() - startTime,
    timestamp: new Date()
  };
};

/**
 * Measure resource usage
 * @returns Resource metrics
 */
export const measureResources = (): ResourceMetrics => {
  if (typeof window === 'undefined' || 
      !('performance' in window) || 
      !('getEntriesByType' in performance)) {
    // Server-side rendering or unsupported browser fallback
    return {
      resourceCount: 0,
      totalResourceSize: 0,
      resourceLoadTime: 0,
      resourcesByType: {},
      duration: 0,
      timestamp: new Date()
    };
  }
  
  // Start measurement
  const startTime = performance.now();
  
  // Get resource entries
  const resources = performance.getEntriesByType('resource');
  
  let totalResourceSize = 0;
  let resourceLoadTime = 0;
  const resourcesByType: Record<string, number> = {};
  
  resources.forEach(resource => {
    const { initiatorType, transferSize, duration } = resource as PerformanceResourceTiming;
    
    // Count resources by type
    if (initiatorType) {
      resourcesByType[initiatorType] = (resourcesByType[initiatorType] || 0) + 1;
    }
    
    // Sum resource size
    if (transferSize) {
      totalResourceSize += transferSize;
    }
    
    // Sum load time
    resourceLoadTime += duration;
  });
  
  return {
    resourceCount: resources.length,
    totalResourceSize,
    resourceLoadTime,
    resourcesByType,
    duration: performance.now() - startTime,
    timestamp: new Date()
  };
};

/**
 * Measure interaction metrics
 * @returns Interaction metrics
 */
export const measureInteraction = async (
  duration = 5000
): Promise<InteractionMetrics> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      resolve({
        inputEventCount: 0,
        animationFrameCount: 0,
        duration,
        timestamp: new Date()
      });
      return;
    }
    
    // Start measurement
    const startTime = performance.now();
    let inputEvents = 0;
    let animationFrames = 0;
    let firstInputDelay: number | undefined;
    let interactionToNextPaint: number | undefined;
    let cumulativeLayoutShift: number | undefined;
    
    // Track input events
    const inputHandler = () => {
      inputEvents++;
    };
    
    // Range of events to track
    const eventTypes = [
      'click', 'touchstart', 'touchmove', 'touchend',
      'keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove',
      'wheel', 'scroll'
    ];
    
    // Add event listeners
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, inputHandler, { passive: true });
    });
    
    // Track animation frames
    const trackFrames = () => {
      animationFrames++;
      if (performance.now() - startTime < duration) {
        requestAnimationFrame(trackFrames);
      }
    };
    
    requestAnimationFrame(trackFrames);
    
    // Try to get Web Vitals metrics if available
    try {
      // Check for layout shift entries
      if ('PerformanceObserver' in window && 
          PerformanceObserver.supportedEntryTypes && 
          PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let shiftScore = 0;
          for (const entry of list.getEntries()) {
            if ('value' in entry) {
              shiftScore += (entry as any).value;
            }
          }
          cumulativeLayoutShift = shiftScore;
        });
        
        layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Disconnect after measurement
        setTimeout(() => {
          layoutShiftObserver.disconnect();
        }, duration);
      }
      
      // Check for first input delay
      if ('PerformanceObserver' in window && 
          PerformanceObserver.supportedEntryTypes && 
          PerformanceObserver.supportedEntryTypes.includes('first-input')) {
        
        const firstInputObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('processingStart' in entry && 'startTime' in entry) {
              firstInputDelay = (entry as any).processingStart - (entry as any).startTime;
            }
          }
        });
        
        firstInputObserver.observe({ type: 'first-input', buffered: true });
        
        // Disconnect after measurement
        setTimeout(() => {
          firstInputObserver.disconnect();
        }, duration);
      }
      
      // Check for interaction to next paint
      if ('PerformanceEventTiming' in window && 'durationThreshold' in PerformanceObserver) {
        const interactionObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'mousedown' || entry.name === 'keydown' || entry.name === 'pointerdown') {
              interactionToNextPaint = entry.duration;
            }
          }
        });
        
        try {
          interactionObserver.observe({
            type: 'event',
            durationThreshold: 16 // Only observe events that take more than 16ms (1 frame)
          });
          
          // Disconnect after measurement
          setTimeout(() => {
            interactionObserver.disconnect();
          }, duration);
        } catch (e) {
          // Event timing observation not supported
        }
      }
    } catch (e) {
      // Web vitals measurement failed
    }
    
    // End measurement after duration
    setTimeout(() => {
      // Remove event listeners
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, inputHandler);
      });
      
      // Return metrics
      resolve({
        firstInputDelay,
        interactionToNextPaint,
        cumulativeLayoutShift,
        inputEventCount: inputEvents,
        animationFrameCount: animationFrames,
        duration: performance.now() - startTime,
        timestamp: new Date()
      });
    }, duration);
  });
};

/**
 * Measure all performance metrics
 * @param duration Duration in milliseconds to measure
 * @returns All performance metrics
 */
export const measureAllMetrics = async (duration = 1000) => {
  // Measure all metrics in parallel
  const [frameRate, layout, memory, resources, interaction] = await Promise.all([
    measureFrameRate(duration),
    measureLayoutOperations(duration),
    measureMemory(),
    measureResources(),
    measureInteraction(duration)
  ]);
  
  return {
    frameRate,
    layout,
    memory,
    resources,
    interaction,
    timestamp: new Date()
  };
};