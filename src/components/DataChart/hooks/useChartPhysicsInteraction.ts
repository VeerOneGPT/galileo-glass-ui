/**
 * useChartPhysicsInteraction Hook
 * 
 * Provides physics-based zoom and pan interactions for GlassDataChart.
 * Adds smooth inertial transitions during zoom/pan operations using the Galileo physics system.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAccessibilitySettings } from '../../../hooks/useAccessibilitySettings';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../../hooks/useGalileoStateSpring';
import { Chart as ChartJS } from 'chart.js';

// Zoom state type for preserving zoom/pan state
interface ZoomState {
  x: {
    min: number;
    max: number;
  };
  y: {
    min: number;
    max: number;
  };
}

// Options for the chart physics interaction hook
export interface ChartPhysicsInteractionOptions {
  // Enable physics-based zoom/pan
  enabled: boolean;
  // Chart.js zoom mode
  mode?: 'x' | 'y' | 'xy';
  // Physics parameters
  physics?: {
    // Spring tension
    tension?: number;
    // Spring friction
    friction?: number;
    // Mass of the virtual object
    mass?: number;
  };
  // Min zoom level (1.0 = 100%)
  minZoom?: number;
  // Max zoom level
  maxZoom?: number;
  // Inertia duration in ms
  inertiaDuration?: number;
  // Wheel zoom sensitivity (lower = more sensitive)
  wheelSensitivity?: number;
  // Respect user's reduced motion preference
  respectReducedMotion?: boolean;
}

const DEFAULT_OPTIONS: ChartPhysicsInteractionOptions = {
  enabled: true,
  mode: 'xy',
  physics: {
    tension: 120,
    friction: 14,
    mass: 1,
  },
  minZoom: 0.5,
  maxZoom: 5,
  inertiaDuration: 500,
  wheelSensitivity: 0.1,
  respectReducedMotion: true,
};

/**
 * Hook providing physics-based zoom and pan interactions for charts
 * 
 * @param chartRef Reference to the Chart.js instance
 * @param wrapperRef Reference to the container element for attaching listeners
 * @param options Configuration options for zoom/pan physics
 * @returns Methods and state for physics-based chart interactions
 */
export const useChartPhysicsInteraction = (
  chartRef: React.RefObject<ChartJS | null>,
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  options: Partial<ChartPhysicsInteractionOptions> = {}
) => {
  // Merge provided options with defaults
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { physics = {} } = config;
  
  // Get accessibility settings
  const { isReducedMotion } = useAccessibilitySettings();
  const shouldUsePhysics = config.enabled && !(isReducedMotion && config.respectReducedMotion);
  
  // State to track if we're currently panning
  const [isPanning, setIsPanning] = useState<boolean>(false);
  // Current zoom level state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  
  // Keep track of pan velocity for inertia
  const panVelocity = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  // Last pan position
  const lastPanPosition = useRef<{ x: number, y: number } | null>(null);
  // Pan timestamp for velocity calculation
  const lastPanTime = useRef<number>(0);
  // Animation frame for inertia
  const inertiaAnimationRef = useRef<number | null>(null);
  // Track original scales to restore on reset
  const originalScales = useRef<ZoomState | null>(null);
  
  // Create spring config for zoom animation
  const springConfig: GalileoSpringConfig = {
    tension: physics.tension || DEFAULT_OPTIONS.physics!.tension!,
    friction: physics.friction || DEFAULT_OPTIONS.physics!.friction!,
    mass: physics.mass || DEFAULT_OPTIONS.physics!.mass!,
  };
  
  // Use physics spring for smooth transitions during zoom X axis
  const zoomXSpring = useGalileoStateSpring(1, springConfig);
  
  // Use physics spring for smooth transitions during zoom Y axis
  const zoomYSpring = useGalileoStateSpring(1, springConfig);
  
  // Store original zoom state on mount
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !config.enabled) return;
    
    const storeOriginalScales = () => {
      const { scales } = chart;
      
      originalScales.current = {
        x: {
          min: scales.x ? scales.x.min : 0,
          max: scales.x ? scales.x.max : 0,
        },
        y: {
          min: scales.y ? scales.y.min : 0,
          max: scales.y ? scales.y.max : 0,
        }
      };
    };
    
    // We need to wait for chart to be fully initialized
    const timer = setTimeout(storeOriginalScales, 200);
    
    return () => {
      clearTimeout(timer);
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current);
      }
    };
  }, [chartRef, config.enabled]);
  
  // Apply zoom with physics spring effect
  const applyZoom = useCallback((newZoomLevel: number, center?: { x: number, y: number }) => {
    if (!chartRef.current || !shouldUsePhysics) return;
    
    // Clamp zoom level to min/max range
    const clampedZoom = Math.max(config.minZoom!, Math.min(config.maxZoom!, newZoomLevel));
    
    // Update spring physics state with the new target zoom level
    if (config.mode !== 'y') {
      zoomXSpring.start({ to: clampedZoom });
    }
    
    if (config.mode !== 'x') {
      zoomYSpring.start({ to: clampedZoom });
    }
    
    // Update state
    setZoomLevel(clampedZoom);
    
  }, [chartRef, config.minZoom, config.maxZoom, config.mode, shouldUsePhysics, zoomXSpring, zoomYSpring]);
  
  // DEBUG: Add effect to track ref changes
  useEffect(() => {
    console.log('[ChartPhysicsInteraction] DEBUG: wrapperRef or chartRef changed:', {
      wrapperRefExists: !!wrapperRef.current,
      chartRefExists: !!chartRef.current
    });
    
    // This is a reference-tracking effect only, no cleanup needed
  }, [wrapperRef.current, chartRef.current]); // Note: This is intentionally using .current in deps for debugging purposes only
  
  // Memoized handler for wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    console.log('[ChartPhysicsInteraction] handleWheel triggered. DeltaY:', e.deltaY);

    if (!chartRef.current || !config.enabled) {
        console.log('[ChartPhysicsInteraction] handleWheel skipped (no chart / disabled).');
        return;
    }
    
    // Prevent default scrolling behavior
    e.preventDefault();
    
    // Calculate new zoom level based on wheel direction
    const zoomDelta = (e.deltaY * config.wheelSensitivity!) * -1;
    const newZoomLevel = zoomLevel + zoomDelta;
    
    // Get the pointer position for zoom center
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const center = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    console.log(`[ChartPhysicsInteraction] Applying zoom. Current: ${zoomLevel.toFixed(2)}, Delta: ${zoomDelta.toFixed(2)}, New Target: ${newZoomLevel.toFixed(2)}`);
    applyZoom(newZoomLevel, center);
  }, [chartRef, config.enabled, config.wheelSensitivity, zoomLevel, applyZoom]);
  
  // Handle pan start
  const handlePanStart = useCallback((e: MouseEvent) => {
    console.log('[ChartPhysicsInteraction] handlePanStart triggered.');

    if (!chartRef.current || !config.enabled) {
        console.log('[ChartPhysicsInteraction] handlePanStart skipped (no chart / disabled).');
        return;
    }
    
    setIsPanning(true);
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
    lastPanTime.current = performance.now();
    
    // Stop any ongoing inertia
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current);
      inertiaAnimationRef.current = null;
      console.log('[ChartPhysicsInteraction] Inertia cancelled by pan start.');
    }
  }, [chartRef, config.enabled]);
  
  // Handle pan move
  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!chartRef.current || !lastPanPosition.current || !isPanning) return;
    
    // Log less frequently to avoid flooding console
    if(Math.random() < 0.1) console.log('[ChartPhysicsInteraction] handlePanMove triggered.'); 

    const chart = chartRef.current;
    const { x: lastX, y: lastY } = lastPanPosition.current;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    const now = performance.now();
    const timeDelta = now - lastPanTime.current;
    
    // Calculate velocity (px/ms)
    if (timeDelta > 0) {
      panVelocity.current = {
        x: deltaX / timeDelta,
        y: deltaY / timeDelta
      };
    }
    
    // Update pan reference positions
    lastPanPosition.current = { x: currentX, y: currentY };
    lastPanTime.current = now;
    
    // Apply pan to chart - we use Chart.js native panning
    // But we'll add physics-based inertia on release
    if (chart.scales) {
      const { scales } = chart;
      // Apply pan according to mode
      if (config.mode !== 'y' && scales.x) {
        const range = scales.x.max - scales.x.min;
        const panPercentX = deltaX / chart.width!;
        const panAmountX = range * panPercentX;
        scales.x.min -= panAmountX;
        scales.x.max -= panAmountX;
      }
      
      if (config.mode !== 'x' && scales.y) {
        const range = scales.y.max - scales.y.min;
        const panPercentY = deltaY / chart.height!;
        const panAmountY = range * panPercentY;
        scales.y.min += panAmountY;
        scales.y.max += panAmountY;
      }
      
      if(Math.random() < 0.1) console.log('[ChartPhysicsInteraction] Updating chart scales for pan.');
      chart.update('none'); // Update without animation
    }
  }, [chartRef, isPanning, config.mode]);
  
  // Handle pan end with inertia
  const handlePanEnd = useCallback(() => {
    if (!chartRef.current || !shouldUsePhysics) {
      setIsPanning(false);
      return;
    }
    
    // Reset pan state
    setIsPanning(false);
    lastPanPosition.current = null;
    
    const chart = chartRef.current;
    
    // Apply inertia if we have velocity
    if (
      Math.abs(panVelocity.current.x) > 0.05 || 
      Math.abs(panVelocity.current.y) > 0.05
    ) {
      let startTime = performance.now();
      const duration = config.inertiaDuration!;
      const startVelocity = { ...panVelocity.current };
      
      // Inertia animation
      const applyInertia = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out deceleration
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const velocityMultiplier = 1 - easeOutQuart;
        
        // Calculate current velocities
        const currVelocityX = startVelocity.x * velocityMultiplier;
        const currVelocityY = startVelocity.y * velocityMultiplier;
        
        // Apply pan using current velocities
        if (chart.scales) {
          const { scales } = chart;
          
          if (config.mode !== 'y' && scales.x) {
            const range = scales.x.max - scales.x.min;
            const panPercentX = (currVelocityX * 16) / chart.width!; // 16ms target frame time
            const panAmountX = range * panPercentX;
            scales.x.min -= panAmountX;
            scales.x.max -= panAmountX;
          }
          
          if (config.mode !== 'x' && scales.y) {
            const range = scales.y.max - scales.y.min;
            const panPercentY = (currVelocityY * 16) / chart.height!;
            const panAmountY = range * panPercentY;
            scales.y.min += panAmountY;
            scales.y.max += panAmountY;
          }
          
          chart.update('none');
        }
        
        // Continue animation if not complete
        if (progress < 1) {
          inertiaAnimationRef.current = requestAnimationFrame(applyInertia);
        } else {
          inertiaAnimationRef.current = null;
        }
      };
      
      // Start inertia animation
      inertiaAnimationRef.current = requestAnimationFrame(applyInertia);
    }
    
    // Reset velocity after applying inertia
    panVelocity.current = { x: 0, y: 0 };
  }, [chartRef, config.inertiaDuration, config.mode, shouldUsePhysics]);
  
  // Reset zoom to original state
  const resetZoom = useCallback(() => {
    if (!chartRef.current || !originalScales.current) return;
    
    const chart = chartRef.current;
    
    if (shouldUsePhysics) {
      // Use spring physics for smooth transition back to original state
      zoomXSpring.start({ to: 1 });
      zoomYSpring.start({ to: 1 });
      
      // Update the scales with animation
      if (chart.scales) {
        const { scales } = chart;
        const { x: originalX, y: originalY } = originalScales.current;
        
        if (scales.x) {
          scales.x.min = originalX.min;
          scales.x.max = originalX.max;
        }
        
        if (scales.y) {
          scales.y.min = originalY.min;
          scales.y.max = originalY.max;
        }
        
        chart.update();
      }
    } else {
      // Manual reset
      if (chart.scales) {
        const { scales } = chart;
        const { x: originalX, y: originalY } = originalScales.current;
        
        if (scales.x) {
          scales.x.min = originalX.min;
          scales.x.max = originalX.max;
        }
        
        if (scales.y) {
          scales.y.min = originalY.min;
          scales.y.max = originalY.max;
        }
        
        chart.update('none');
      }
    }
    
    // Reset zoom level state
    setZoomLevel(1.0);
  }, [chartRef, shouldUsePhysics, zoomXSpring, zoomYSpring]);
  
  // Refactored effect to track and handle ref changes dynamically
  useEffect(() => {
    // Store initial ref state for comparison
    const initialWrapperRef = wrapperRef.current;
    console.log('[ChartPhysicsInteraction] Running listener useEffect. Enabled:', config.enabled, 'Wrapper Ref:', initialWrapperRef);

    // Skip if feature is disabled
    if (!config.enabled) {
      console.log('[ChartPhysicsInteraction] Skipping listener attachment (Physics zoom/pan disabled).');
      return;
    }

    // Define the actual listener functions passed to add/remove
    // These call the stable useCallback versions defined above.
    const wheelListener = (e: WheelEvent) => handleWheel(e);
    const mouseDownListener = (e: MouseEvent) => {
      // Check target inside the listener to ensure it's within bounds
      if (wrapperRef.current && wrapperRef.current.contains(e.target as Node)) {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
           handlePanStart(e); 
        }
      } else {
         console.log('[ChartPhysicsInteraction] Mousedown ignored (target outside wrapper).')
      }
    };
    const mouseMoveListener = (e: MouseEvent) => handlePanMove(e);
    const mouseUpListener = () => handlePanEnd();
    const mouseLeaveListener = (e: MouseEvent) => {
      // Check relatedTarget to see if mouse left the actual wrapper
      if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
         handlePanEnd(); // Trigger pan end if mouse leaves wrapper while panning
      }
    };

    // Function to add listeners to current wrapper
    const attachListeners = (currentWrapper: HTMLDivElement) => {
      if (!currentWrapper) return false;
      
      console.log('[ChartPhysicsInteraction] Attaching listeners to:', currentWrapper);
      
      try {
        // Add listeners - wrapped in try/catch for resilience
        currentWrapper.addEventListener('wheel', wheelListener, { passive: false });
        currentWrapper.addEventListener('mousedown', mouseDownListener);
        currentWrapper.addEventListener('mouseleave', mouseLeaveListener);
        document.addEventListener('mousemove', mouseMoveListener); 
        document.addEventListener('mouseup', mouseUpListener);
        return true;
      } catch (error) {
        console.error('[ChartPhysicsInteraction] Error attaching listeners:', error);
        return false;
      }
    };

    // Function to remove listeners from specified wrapper
    const removeListeners = (currentWrapper: HTMLDivElement | null) => {
      if (!currentWrapper) return;
      
      console.log('[ChartPhysicsInteraction] Removing listeners from:', currentWrapper);
      
      try {
        // Remove listeners - wrapped in try/catch for resilience
        currentWrapper.removeEventListener('wheel', wheelListener);
        currentWrapper.removeEventListener('mousedown', mouseDownListener);
        currentWrapper.removeEventListener('mouseleave', mouseLeaveListener);
      } catch (error) {
        console.error('[ChartPhysicsInteraction] Error removing wrapper listeners:', error);
      }
      
      // Document listeners are always safe to remove
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    };

    // Track if listeners were successfully attached
    let listenersAttached = false;
    
    // If the wrapper element exists, attach listeners immediately
    if (initialWrapperRef) {
      listenersAttached = attachListeners(initialWrapperRef);
    } else {
      console.log('[ChartPhysicsInteraction] Wrapper element not available yet. Waiting for it to be created.');
    }

    // Set up a MutationObserver to watch for when the ref becomes available
    // This is a fallback in case the ref isn't immediately populated
    let observer: MutationObserver | null = null;
    
    if (!initialWrapperRef || !listenersAttached) {
      observer = new MutationObserver(() => {
        // Check if the ref has been populated since we last checked
        const currentWrapper = wrapperRef.current;
        if (currentWrapper && currentWrapper !== initialWrapperRef && !listenersAttached) {
          console.log('[ChartPhysicsInteraction] Wrapper ref populated via observer. Attaching listeners.');
          listenersAttached = attachListeners(currentWrapper);
          
          if (listenersAttached && observer) {
            observer.disconnect();
            observer = null;
          }
        }
      });
      
      // Start observing the document for changes
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Return cleanup function
    return () => {
      // Stop observer if it's still active
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      // Remove listeners from the most current wrapper element
      // This handles the case where the ref might have changed during the effect lifetime
      const finalWrapper = wrapperRef.current;
      removeListeners(finalWrapper || initialWrapperRef);
      
      // Cancel any ongoing inertia animation
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current);
        inertiaAnimationRef.current = null;
      }
    };
  }, [
    config.enabled,
    wrapperRef,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd
  ]);
  
  // Apply spring physics zoom effect to chart scales
  useEffect(() => {
    if (!chartRef.current || !shouldUsePhysics) return;
    
    const chart = chartRef.current;
    if (!chart.scales || !originalScales.current) return;
    
    const { scales } = chart;
    const zoomX = zoomXSpring.value;
    const zoomY = zoomYSpring.value;
    
    // Apply zoom scaling to X axis
    if (scales.x && config.mode !== 'y' && zoomX !== undefined) {
      const original = originalScales.current.x;
      const originalRange = original.max - original.min;
      const originalCenter = (original.min + original.max) / 2;
      const newRange = originalRange / zoomX;
      
      scales.x.min = originalCenter - (newRange / 2);
      scales.x.max = originalCenter + (newRange / 2);
    }
    
    // Apply zoom scaling to Y axis
    if (scales.y && config.mode !== 'x' && zoomY !== undefined) {
      const original = originalScales.current.y;
      const originalRange = original.max - original.min;
      const originalCenter = (original.min + original.max) / 2;
      const newRange = originalRange / zoomY;
      
      scales.y.min = originalCenter - (newRange / 2);
      scales.y.max = originalCenter + (newRange / 2);
    }
    
    chart.update('none');
  }, [zoomXSpring.value, zoomYSpring.value, chartRef, shouldUsePhysics, config.mode]);
  
  // Return state and methods
  return {
    isPanning,
    zoomLevel,
    applyZoom,
    resetZoom,
    // No longer returning handlers
    // handlers: { wheelHandler, mouseDownHandler, mouseMoveHandler, mouseUpHandler, mouseLeaveHandler }
  };
}; 