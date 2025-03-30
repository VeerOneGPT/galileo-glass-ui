/**
 * ChartAnimationUtils
 * 
 * Utilities for chart animations, including physics-based animations,
 * custom Chart.js plugins, and animation configuration helpers.
 */
import { ChartType, Plugin } from 'chart.js';
import { QualityTier } from '../hooks/useQualityTier';
import { ChartAnimationOptions } from '../types/ChartProps';

/**
 * Custom SVG path animation plugin for Chart.js
 * Creates smooth drawing animations for line and area charts
 */
export const pathAnimationPlugin: Plugin<ChartType> = {
  id: 'pathAnimation',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.type === 'line' && meta.dataset) {
        const element = meta.dataset as any;
        if (element && element._path) {
          const path = element._path;
          
          // Check if we already processed this path
          if (!path._animationApplied && path.getTotalLength) {
            try {
              // Mark as processed to avoid reapplying
              path._animationApplied = true;
              
              // Get path length for animation
              const pathLength = path.getTotalLength();
              
              // Apply stroke dash settings
              path.style.strokeDasharray = `${pathLength} ${pathLength}`;
              path.style.strokeDashoffset = `${pathLength}`;
              
              // Create animation with WAAPI
              path.animate(
                [
                  { strokeDashoffset: pathLength },
                  { strokeDashoffset: 0 }
                ],
                {
                  duration: 1500,
                  delay: datasetIndex * 150,
                  fill: 'forwards',
                  easing: 'ease-out'
                }
              );
            } catch (err) {
              // Fallback for browsers that don't support these features
              console.log('Advanced path animation not supported in this browser');
            }
          }
        }
      }
    });
  }
};

/**
 * Creates animation options based on quality tier and physics settings
 * 
 * @param isPhysicsEnabled Whether physics animations are enabled
 * @param isReducedMotion Whether reduced motion is preferred
 * @param animation Animation options from props
 * @param qualityTier Current quality tier
 * @returns Chart.js compatible animation options
 */
export const createAnimationOptions = (
  isPhysicsEnabled: boolean,
  isReducedMotion: boolean,
  animation: ChartAnimationOptions,
  qualityTier: QualityTier
) => {
  // If reduced motion is preferred, disable animations
  if (isReducedMotion) {
    return { duration: 0 };
  }
  
  // Create physics-based animations
  if (isPhysicsEnabled) {
    return {
      duration: animation.duration || 1000,
      delay: (context: any) => {
        // Enhanced staggered delay for more natural animation
        if (animation.staggerDelay && context.datasetIndex !== undefined) {
          return context.datasetIndex * (animation.staggerDelay || 0) + (context.dataIndex || 0) * 20;
        }
        return 0;
      },
      // Add easing based on physics principles
      easing: 'easeOutExpo',
    };
  }
  
  // Standard animations (non-physics)
  return {
    duration: animation.duration || 1000,
    easing: animation.easing as any || 'easeOutQuart',
    delay: (context: any) => {
      // Add staggered delay if specified
      if (animation.staggerDelay && context.datasetIndex !== undefined) {
        return context.datasetIndex * (animation.staggerDelay || 0);
      }
      return 0;
    }
  };
};

/**
 * Creates dynamic blur settings based on quality tier
 * 
 * @param qualityTier Current quality tier
 * @returns Blur amount in pixels
 */
export const getQualityBasedBlur = (qualityTier: QualityTier): number => {
  switch (qualityTier) {
    case 'ultra':
      return 15;
    case 'high':
      return 10;
    case 'medium':
      return 6;
    case 'low':
      return 4;
    default:
      return 6;
  }
};

/**
 * Creates SVG filter settings based on quality tier
 * 
 * @param qualityTier Current quality tier
 * @returns Object with filter settings
 */
export const getQualityBasedFilters = (qualityTier: QualityTier) => {
  return {
    lineGlowBlur: qualityTier === 'low' ? 1 : qualityTier === 'medium' ? 2 : 3,
    pointGlowBlur: qualityTier === 'low' ? 2 : qualityTier === 'medium' ? 3 : 4,
    shadowBlur: qualityTier === 'low' ? 4 : qualityTier === 'medium' ? 6 : 8
  };
};

/**
 * Generates animation presets for different physics behaviors
 * 
 * @param preset Animation preset name
 * @returns Physics animation parameters
 */
export const getAnimationPreset = (preset: 'gentle' | 'responsive' | 'bouncy') => {
  switch (preset) {
    case 'gentle':
      return {
        stiffness: 170,
        dampingRatio: 0.8,
        mass: 1
      };
    case 'responsive':
      return {
        stiffness: 210,
        dampingRatio: 0.7,
        mass: 1
      };
    case 'bouncy':
      return {
        stiffness: 280,
        dampingRatio: 0.5,
        mass: 1
      };
    default:
      return {
        stiffness: 170,
        dampingRatio: 0.7,
        mass: 1
      };
  }
};

/**
 * Calculates appropriate damping value from damping ratio
 * for physics-based animations
 * 
 * @param dampingRatio The damping ratio (0-1)
 * @param stiffness The spring stiffness
 * @param mass The object mass
 * @returns The calculated damping value
 */
export const calculateDamping = (
  dampingRatio: number, 
  stiffness: number, 
  mass: number
): number => {
  return dampingRatio * 2 * Math.sqrt(stiffness * mass);
}; 