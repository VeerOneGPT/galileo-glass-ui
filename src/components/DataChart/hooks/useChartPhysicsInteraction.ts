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
 * @param options Configuration options for zoom/pan physics
 * @returns Methods and state for physics-based chart interactions
 */
export const useChartPhysicsInteraction = (
  chartRef: React.RefObject<ChartJS>,
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
  
  // Handle wheel event for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!chartRef.current || !config.enabled) return;
    
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
    
    applyZoom(newZoomLevel, center);
  }, [chartRef, config.enabled, config.wheelSensitivity, zoomLevel, applyZoom]);
  
  // Handle pan start
  const handlePanStart = useCallback((e: MouseEvent) => {
    if (!chartRef.current || !config.enabled) return;
    
    setIsPanning(true);
    lastPanPosition.current = { x: e.clientX, y: e.clientY };
    lastPanTime.current = performance.now();
    
    // Stop any ongoing inertia
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current);
      inertiaAnimationRef.current = null;
    }
  }, [chartRef, config.enabled]);
  
  // Handle pan move
  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!chartRef.current || !lastPanPosition.current || !isPanning) return;
    
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
  
  // Attach event listeners to chart canvas
  useEffect(() => {
    if (!chartRef.current || !config.enabled) return;
    
    const chart = chartRef.current;
    const canvas = chart.canvas;
    
    if (!canvas) return;
    
    // Wheel event for zooming
    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    
    // Mouse events for panning
    const mouseDownHandler = (e: MouseEvent) => {
      // Middle mouse button or left button + shift for panning
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        handlePanStart(e);
      }
    };
    
    const mouseMoveHandler = (e: MouseEvent) => handlePanMove(e);
    const mouseUpHandler = () => handlePanEnd();
    const mouseLeaveHandler = () => handlePanEnd();
    
    // Add event listeners
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    canvas.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    canvas.addEventListener('mouseleave', mouseLeaveHandler);
    
    // Clean up event listeners
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
      canvas.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      canvas.removeEventListener('mouseleave', mouseLeaveHandler);
      
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current);
      }
    };
  }, [
    chartRef, 
    config.enabled, 
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
  
  return {
    isPanning,
    zoomLevel,
    applyZoom,
    resetZoom,
    // Attach these event handlers to the chart container if needed externally
    handlers: {
      handleWheel,
      handlePanStart,
      handlePanMove,
      handlePanEnd
    }
  };
}; 