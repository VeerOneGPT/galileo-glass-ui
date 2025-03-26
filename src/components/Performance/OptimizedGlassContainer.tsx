import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { OptimizedGlassContainerProps } from './types';
import { Box } from '../Box';
import { createThemeContext } from '../../core/themeUtils';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassBorder } from '../../core/mixins/glassBorder';
import { useGlassPerformance } from '../../hooks/useGlassPerformance';
import { OptimizationLevel } from '../../utils/performanceOptimizations';
import { getDeviceCapabilityTier, DeviceCapabilityTier } from '../../utils/deviceCapabilities';
import { detectFeatures, GLASS_REQUIREMENTS } from '../../utils/browserCompatibility';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Styled components
const Container = styled.div<{
  $optimizationLevel: OptimizationLevel;
  $glassIntensity: number;
  $preserveBlur: boolean;
}>`
  position: relative;
  
  ${({ theme, $glassIntensity, $optimizationLevel, $preserveBlur }) => {
    const themeContext = createThemeContext(theme);
    
    // Apply different glass effects based on optimization level
    let glassOptions;
    
    switch ($optimizationLevel) {
      case OptimizationLevel.NONE:
        glassOptions = {
          intensity: $glassIntensity,
          backgroundOpacity: 0.6,
          blurStrength: 12
        };
        break;
        
      case OptimizationLevel.LIGHT:
        glassOptions = {
          intensity: $glassIntensity * 0.8,
          backgroundOpacity: 0.65,
          blurStrength: $preserveBlur ? 8 : 6
        };
        break;
        
      case OptimizationLevel.MODERATE:
        glassOptions = {
          intensity: $glassIntensity * 0.6,
          backgroundOpacity: 0.7,
          blurStrength: $preserveBlur ? 6 : 4
        };
        break;
        
      case OptimizationLevel.AGGRESSIVE:
        glassOptions = {
          intensity: $glassIntensity * 0.4,
          backgroundOpacity: 0.8,
          blurStrength: $preserveBlur ? 4 : 2
        };
        break;
        
      case OptimizationLevel.MAXIMUM:
        // In maximum optimization, we use barely any glass effects
        glassOptions = {
          intensity: $glassIntensity * 0.2,
          backgroundOpacity: 0.9,
          blurStrength: $preserveBlur ? 2 : 0
        };
        break;
        
      default:
        glassOptions = {
          intensity: $glassIntensity,
          backgroundOpacity: 0.6,
          blurStrength: 10
        };
    }
    
    return glassSurface({
      ...glassOptions,
      themeContext
    });
  }}
  
  ${({ theme, $optimizationLevel }) => {
    const themeContext = createThemeContext(theme);
    
    // Only apply border effects for lower optimization levels
    if ($optimizationLevel === OptimizationLevel.MAXIMUM) {
      return '';
    }
    
    return glassBorder({
      width: '1px',
      opacity: $optimizationLevel === OptimizationLevel.AGGRESSIVE ? 0.2 : 0.3,
      themeContext
    });
  }}
  
  /* Ensure smooth transitions between optimization levels */
  transition: background-color 0.3s ease, 
              backdrop-filter 0.5s ease, 
              border 0.3s ease, 
              box-shadow 0.5s ease;
`;

const PerformanceIndicator = styled.div<{
  $status: 'good' | 'warning' | 'critical';
}>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $status }) => 
    $status === 'good' ? '#4caf50' : 
    $status === 'warning' ? '#ff9800' : 
    '#f44336'
  };
  opacity: 0.7;
  transition: background-color 0.3s ease;
  z-index: 10;
`;

/**
 * A container that automatically optimizes glass effects based on performance
 */
export const OptimizedGlassContainer = forwardRef<HTMLDivElement, OptimizedGlassContainerProps>(
  (
    {
      children,
      initialOptimizationLevel = OptimizationLevel.NONE,
      autoOptimize = true,
      performanceThreshold = 45,
      glassIntensity = 0.7,
      className,
      style,
      targetFps = 60,
      checkInterval = 2000,
      showIndicator = false,
      preferReducedMotion = true,
      preserveBlur = false,
      onOptimizationChange,
      maxOptimizationLevel = OptimizationLevel.MAXIMUM,
      ...rest
    }: OptimizedGlassContainerProps,
    ref
  ) => {
    // State
    const [optimizationLevel, setOptimizationLevel] = useState<OptimizationLevel>(initialOptimizationLevel);
    const [fps, setFps] = useState<number>(0);
    
    // Refs
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get glass performance metrics
    const glassPerformance = useGlassPerformance({
      // Remove unsupported properties
    });
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = useReducedMotion();
    
    // Initialize based on device capability
    useEffect(() => {
      // If user prefers reduced motion, set higher optimization
      if (preferReducedMotion && prefersReducedMotion) {
        // Set aggressive optimization for reduced motion users
        const reducedMotionLevel = OptimizationLevel.AGGRESSIVE;
        setOptimizationLevel(reducedMotionLevel);
        
        if (onOptimizationChange) {
          onOptimizationChange(reducedMotionLevel);
        }
        
        return;
      }
      
      // Check device capability and browser support with proper type safety
      const deviceTier = getDeviceCapabilityTier();
      
      // Use type assertions and optional chaining for safer access
      const browserFeatures = detectFeatures();
      const browserSupport = (browserFeatures as any)?.meetsRequirements?.((GLASS_REQUIREMENTS as any)?.FULL);
      
      // Set initial optimization level based on device capability
      let initialLevel = initialOptimizationLevel;
      
      if (autoOptimize) {
        if (!browserSupport) {
          // If browser doesn't fully support glass effects, use aggressive optimization
          initialLevel = OptimizationLevel.AGGRESSIVE;
        } else if (deviceTier === DeviceCapabilityTier.LOW) {
          // For low-end devices, use aggressive optimization
          initialLevel = OptimizationLevel.AGGRESSIVE;
        } else if (deviceTier === DeviceCapabilityTier.MEDIUM) {
          // For mid-range devices, use moderate optimization
          initialLevel = OptimizationLevel.MODERATE;
        }
        
        // Ensure we don't exceed the maximum allowed level
        if (
          initialLevel === OptimizationLevel.MAXIMUM && 
          maxOptimizationLevel !== OptimizationLevel.MAXIMUM
        ) {
          initialLevel = maxOptimizationLevel;
        }
        
        setOptimizationLevel(initialLevel);
        
        if (onOptimizationChange) {
          onOptimizationChange(initialLevel);
        }
      }
    }, [
      initialOptimizationLevel, 
      autoOptimize, 
      preferReducedMotion, 
      prefersReducedMotion, 
      onOptimizationChange,
      maxOptimizationLevel
    ]);
    
    // Function to measure performance and update optimization
    const measurePerformance = useCallback(() => {
      const now = performance.now();
      frameCountRef.current++;
      
      const elapsed = now - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        // Calculate FPS
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        
        // Reset counter
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        
        // Update optimization level if auto-optimize is enabled
        if (autoOptimize && !prefersReducedMotion) {
          let newLevel = optimizationLevel;
          
          // Adjust optimization based on FPS
          if (currentFps < performanceThreshold * 0.5) {
            // Severe performance issues - max optimization
            newLevel = OptimizationLevel.MAXIMUM;
          } else if (currentFps < performanceThreshold * 0.7) {
            // Significant performance issues - aggressive optimization
            newLevel = OptimizationLevel.AGGRESSIVE;
          } else if (currentFps < performanceThreshold) {
            // Moderate performance issues - moderate optimization
            newLevel = OptimizationLevel.MODERATE;
          } else if (currentFps > targetFps * 0.9 && optimizationLevel !== OptimizationLevel.NONE) {
            // Good performance - gradually reduce optimization
            switch (optimizationLevel) {
              case OptimizationLevel.MAXIMUM:
                newLevel = OptimizationLevel.AGGRESSIVE;
                break;
              case OptimizationLevel.AGGRESSIVE:
                newLevel = OptimizationLevel.MODERATE;
                break;
              case OptimizationLevel.MODERATE:
                newLevel = OptimizationLevel.LIGHT;
                break;
              case OptimizationLevel.LIGHT:
                newLevel = OptimizationLevel.NONE;
                break;
              default:
                newLevel = OptimizationLevel.NONE;
            }
          }
          
          // Ensure we don't exceed the maximum allowed level
          if (
            newLevel === OptimizationLevel.MAXIMUM && 
            maxOptimizationLevel !== OptimizationLevel.MAXIMUM
          ) {
            newLevel = maxOptimizationLevel;
          }
          
          // Update optimization level if changed
          if (newLevel !== optimizationLevel) {
            setOptimizationLevel(newLevel);
            
            if (onOptimizationChange) {
              onOptimizationChange(newLevel);
            }
          }
        }
      }
      
      requestAnimationFrame(measurePerformance);
    }, [
      autoOptimize, 
      optimizationLevel, 
      performanceThreshold, 
      targetFps, 
      prefersReducedMotion,
      onOptimizationChange,
      maxOptimizationLevel
    ]);
    
    // Start performance measurement if auto-optimize is enabled
    useEffect(() => {
      if (autoOptimize) {
        // Initialize
        frameCountRef.current = 0;
        lastTimeRef.current = performance.now();
        
        // Start measurement loop
        const animFrameId = requestAnimationFrame(measurePerformance);
        
        // Cleanup
        return () => {
          cancelAnimationFrame(animFrameId);
          
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
        };
      }
    }, [autoOptimize, measurePerformance]);
    
    // Get status based on FPS and optimization level
    const getStatus = (): 'good' | 'warning' | 'critical' => {
      if (optimizationLevel === OptimizationLevel.MAXIMUM) return 'critical';
      if (optimizationLevel === OptimizationLevel.AGGRESSIVE) return 'warning';
      if (fps < performanceThreshold) return 'warning';
      return 'good';
    };
    
    return (
      <Container
        ref={ref}
        className={className}
        style={style}
        $optimizationLevel={optimizationLevel}
        $glassIntensity={glassIntensity}
        $preserveBlur={preserveBlur}
        {...rest}
      >
        {showIndicator && (
          <PerformanceIndicator $status={getStatus()} />
        )}
        
        {children}
      </Container>
    );
  }
);

OptimizedGlassContainer.displayName = 'OptimizedGlassContainer';