/**
 * ChartFilters Component
 * 
 * SVG filter definitions for chart visual effects, with quality tier adaptations.
 */
import React from 'react';
import { QualityTier } from '../hooks/useQualityTier';
import { getQualityBasedFilters } from '../utils/ChartAnimationUtils';

export interface ChartFiltersProps {
  /** Color palette for gradients and effects */
  palette: string[];
  /** Current quality tier */
  qualityTier: QualityTier;
  /** Additional custom filters */
  additionalFilters?: React.ReactNode;
}

/**
 * ChartFilters Component
 * 
 * Provides SVG filter definitions for chart visual effects, with 
 * automatic quality tier adjustments.
 */
export const ChartFilters: React.FC<ChartFiltersProps> = ({
  palette,
  qualityTier,
  additionalFilters
}) => {
  // Get quality-adjusted filter parameters
  const filterSettings = getQualityBasedFilters(qualityTier);
  
  return (
    <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
      <defs>
        {/* Gradient definitions */}
        {palette.map((color, i) => {
          // Ensure color is a valid value to prevent SVG errors
          const safeColor = color || '#6366F1'; // Default to primary color if undefined
          
          return (
            <React.Fragment key={`gradient-${i}`}>
              <linearGradient 
                id={`areaGradient${i}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={`${safeColor}CC`} />
                <stop offset="100%" stopColor={`${safeColor}00`} />
              </linearGradient>
              
              {/* Glow filter for lines */}
              <filter 
                id={`glow${i}`} 
                x="-20%" 
                y="-20%" 
                width="140%" 
                height="140%"
              >
                <feGaussianBlur 
                  stdDeviation={filterSettings.lineGlowBlur} 
                  result="blur" 
                />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {/* Point highlight filter */}
              <filter 
                id={`pointGlow${i}`} 
                x="-50%" 
                y="-50%" 
                width="200%" 
                height="200%"
              >
                <feGaussianBlur 
                  stdDeviation={filterSettings.pointGlowBlur} 
                  result="blur" 
                />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {/* Shadow filter */}
              <filter 
                id={`shadow${i}`} 
                x="-20%" 
                y="-20%" 
                width="140%" 
                height="140%"
              >
                <feDropShadow 
                  dx="0" 
                  dy="3" 
                  stdDeviation={filterSettings.shadowBlur} 
                  floodColor={`${safeColor}88`} 
                />
              </filter>
            </React.Fragment>
          );
        })}
        
        {/* Include any additional filters */}
        {additionalFilters}
      </defs>
    </svg>
  );
};

export default ChartFilters; 