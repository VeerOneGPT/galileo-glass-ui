/**
 * KpiChart Component
 * 
 * A specialized component for displaying Key Performance Indicators (KPIs)
 * with glass styling and trend indicators.
 */
import React from 'react';
import {
  KpiContainer,
  KpiTitle,
  KpiValue,
  KpiSubtitle,
  KpiTrend
} from '../styles/ChartElementStyles';
import { KpiProps } from '../types/ChartTypes';
import { usePhysicsAnimation } from '../hooks/usePhysicsAnimation';
import { QualityTier } from '../hooks/useQualityTier';
import { calculateDamping } from '../utils/ChartAnimationUtils';

export interface KpiChartProps {
  /** KPI data and display properties */
  kpi: KpiProps;
  /** Animation options */
  animation?: {
    enabled: boolean;
    duration?: number;
    stiffness?: number;
    dampingRatio?: number;
    mass?: number;
  };
  /** Quality tier for adaptive rendering */
  qualityTier?: QualityTier;
  /** Additional class name */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Base color theme */
  color?: string;
  /** Whether user prefers reduced motion */
  isReducedMotion?: boolean;
}

/**
 * KpiChart Component
 * 
 * Displays a key performance indicator with animated value and trend indicator
 */
export const KpiChart: React.FC<KpiChartProps> = ({
  kpi,
  animation = {
    enabled: true,
    duration: 800,
    stiffness: 170,
    dampingRatio: 0.7,
    mass: 1
  },
  qualityTier = 'high',
  className,
  compact = false,
  color = 'primary',
  isReducedMotion = false
}) => {
  // Configure physics animation based on props and quality tier
  const stiffness = animation.stiffness || 170;
  const mass = animation.mass || 1;
  const dampingRatio = animation.dampingRatio || 0.7;
  
  // Calculate damping value from ratio
  const damping = calculateDamping(dampingRatio, stiffness, mass);
  
  // Use physics animation for value pop-in effect
  const { 
    value: springValue, 
    applyPopIn 
  } = usePhysicsAnimation({
    type: (animation.enabled && !isReducedMotion) ? 'spring' : 'none',
    stiffness,
    damping,
    mass,
    respectReducedMotion: true
  });
  
  // Apply pop-in animation on first render
  React.useEffect(() => {
    if (animation.enabled && !isReducedMotion) {
      applyPopIn();
    }
  }, [animation.enabled, isReducedMotion, applyPopIn]);
  
  // Get the KPI trend color and icon
  const getTrendProps = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return {
          label: 'Increased',
          icon: '↑'
        };
      case 'negative':
        return {
          label: 'Decreased',
          icon: '↓'
        };
      default:
        return {
          label: 'Unchanged',
          icon: '→'
        };
    }
  };
  
  // Get trend display data
  const trendDisplay = kpi.trend ? getTrendProps(kpi.trend) : null;
  
  return (
    <KpiContainer 
      $compact={compact || kpi.compact}
      className={className}
      style={animation.enabled && !isReducedMotion ? {
        transform: `scale(${springValue ?? 1})`,
        opacity: springValue ?? 1
      } : undefined}
    >
      <KpiTitle>{kpi.title}</KpiTitle>
      <KpiValue $trend={kpi.trend}>{kpi.value}</KpiValue>
      {kpi.subtitle && <KpiSubtitle>{kpi.subtitle}</KpiSubtitle>}
      {kpi.trend && kpi.trend !== 'neutral' && (
        <KpiTrend $trend={kpi.trend}>
          {trendDisplay?.icon} {trendDisplay?.label}
        </KpiTrend>
      )}
    </KpiContainer>
  );
};

export default KpiChart; 