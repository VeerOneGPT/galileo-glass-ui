/**
 * Chart-specific GlassTooltip Component
 *
 * An enhanced tooltip component for chart visualizations that uses the main Tooltip component
 * with a special API for charts.
 */
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

// Import the main Tooltip and GlassTooltip components
import { GlassTooltip as MainGlassTooltip } from '../Tooltip';

/**
 * ChartTooltip props interface
 */
export interface GlassTooltipProps {
  /**
   * X position of the tooltip
   */
  x: number;

  /**
   * Y position of the tooltip
   */
  y: number;

  /**
   * Content of the tooltip
   */
  children: React.ReactNode;

  /**
   * Position of the tooltip relative to the trigger point
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Accent color for the tooltip
   */
  accentColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * Glass blur intensity
   */
  blurIntensity?: 'light' | 'medium' | 'strong';

  /**
   * Whether to apply a glow effect
   */
  glow?: boolean;

  /**
   * Glow intensity
   */
  glowIntensity?: 'subtle' | 'medium' | 'strong';

  /**
   * Whether to show pointer
   */
  showPointer?: boolean;

  /**
   * Z-index of the tooltip
   */
  zIndex?: number;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Title text within the tooltip
 */
const TooltipTitle = styled.div<{ color?: string }>`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => props.color || 'inherit'};
`;

/**
 * Content container within the tooltip
 */
const TooltipContent = styled.div`
  font-size: 12px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')};
`;

// Invisible trigger element styled to stay permanently "hovered"
const TooltipTrigger = styled.div`
  width: 1px;
  height: 1px;
  position: relative;
  z-index: -1;
`;

/**
 * Chart GlassTooltip Component
 * 
 * This version creates an absolutely positioned wrapper around the main GlassTooltip
 * to work with chart libraries that provide x/y coordinates.
 */
export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  x,
  y,
  children,
  position = 'top',
  accentColor = 'primary',
  blurIntensity = 'medium',
  glow = false,
  glowIntensity = 'subtle',
  showPointer = true,
  zIndex = 1000,
  className,
  style,
}) => {
  // Convert position to placement
  const placementMap = {
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left'
  };
  
  const placement = placementMap[position] || 'top';
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Create a wrapper div positioned at the coordinates
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    zIndex: zIndex,
    ...style,
  };
  
  // Simulate hover on mount to trigger the tooltip
  useEffect(() => {
    if (triggerRef.current) {
      // Trigger mouse enter event to show tooltip
      const mouseEnterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      });
      triggerRef.current.dispatchEvent(mouseEnterEvent);
    }
  }, [x, y]); // Re-trigger when position changes
  
  // Use the main GlassTooltip component
  return (
    <div style={wrapperStyle} className={className}>
      <div style={{ position: 'relative' }}>
        <MainGlassTooltip
          title={children}
          placement={placement as any}
          variant="glass"
          color={accentColor}
          arrow={showPointer}
          enterDelay={0} // Show immediately
          leaveDelay={10000} // Keep visible for a long time
        >
          <TooltipTrigger ref={triggerRef} />
        </MainGlassTooltip>
      </div>
    </div>
  );
};

/**
 * Helper component for creating formatted tooltip content
 */
export const GlassTooltipContent: React.FC<{
  title?: string;
  titleColor?: string;
  items?: Array<{ label: string; value: string | number; color?: string }>;
  children?: React.ReactNode;
}> = ({ title, titleColor, items = [], children }) => {
  return (
    <>
      {title && <TooltipTitle color={titleColor}>{title}</TooltipTitle>}
      <TooltipContent>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '4px', color: item.color }}>
            <span style={{ marginRight: '8px' }}>{item.label}:</span>
            <strong>{item.value}</strong>
          </div>
        ))}
        {children}
      </TooltipContent>
    </>
  );
};

export default GlassTooltip;
