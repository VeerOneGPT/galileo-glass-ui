/**
 * Tooltip styled components for GlassDataChart
 */
import styled from 'styled-components';
import { tooltipFade } from '../../../animations/keyframes/chartAnimations';

// Basic tooltip container with positioning
export const TooltipContainer = styled.div<{
  $tooltipStyle: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
  $quality?: 'low' | 'medium' | 'high';
}>`
  position: absolute;
  z-index: 100;
  pointer-events: none;
  transform: translate(-50%, -100%);
  animation: ${tooltipFade} 0.2s ease-out forwards;
  
  ${({ $tooltipStyle, $quality = 'medium' }) => {
    // Base styles for any tooltip
    const baseStyles = `
      padding: 0.75rem;
      border-radius: 8px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 120px;
    `;
    
    // Adjust blur amount based on quality
    const blurAmount = $quality === 'low' ? '6px' : $quality === 'medium' ? '10px' : '15px';
    
    // Style-specific overrides
    switch ($tooltipStyle) {
      case 'glass':
        return `
          ${baseStyles}
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(${blurAmount});
          border: 1px solid rgba(255, 255, 255, 0.1);
        `;
      case 'frosted':
        return `
          ${baseStyles}
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(${blurAmount});
          border: 1px solid rgba(255, 255, 255, 0.08);
        `;
      case 'tinted':
        return `
          ${baseStyles}
          background: rgba(30, 58, 138, 0.65);
          backdrop-filter: blur(${blurAmount});
          border: 1px solid rgba(59, 130, 246, 0.3);
        `;
      case 'luminous':
        return `
          ${baseStyles}
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(${blurAmount});
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
      case 'dynamic':
        return `
          ${baseStyles}
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(${blurAmount});
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
      default:
        return baseStyles;
    }
  }}
`;

// Enhanced tooltip content with better typography and layout
export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Tooltip header
export const TooltipHeader = styled.div<{ $color?: string }>`
  margin-bottom: 4px;
  font-weight: 600;
  color: ${props => props.$color || '#FFFFFF'};
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
`;

// Tooltip row
export const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  
  &:not(:last-child) {
    margin-bottom: 4px;
  }
`;

// Tooltip label
export const TooltipLabel = styled.span`
  opacity: 0.8;
  margin-right: 8px;
`;

// Tooltip value with optional highlighting
export const TooltipValue = styled.span<{ $highlighted?: boolean }>`
  font-weight: ${props => props.$highlighted ? 'bold' : 'normal'};
  color: ${props => props.$highlighted ? '#60A5FA' : 'inherit'};
`;

// Enhanced dynamic tooltip with atmospheric lighting
export const DynamicTooltip = styled.div<{
  $color: string;
  $quality?: 'low' | 'medium' | 'high' | 'ultra';
}>`
  position: absolute;
  z-index: 100;
  pointer-events: none;
  transform: translate(-50%, -100%);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: white;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(${props => {
    switch (props.$quality) {
      case 'low': return '5px';
      case 'medium': return '8px';
      case 'high': return '12px';
      case 'ultra': return '15px';
      default: return '8px';
    }
  }});
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
  min-width: 120px;
  animation: ${tooltipFade} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  /* Enhanced highlight edge */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 5%;
    right: 5%;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0)
    );
  }
  
  /* Enhanced atmospheric lighting effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top center,
      ${props => {
        switch (props.$color) {
          case 'primary':
            return 'rgba(99, 102, 241, 0.15)';
          case 'success':
            return 'rgba(16, 185, 129, 0.15)';
          case 'warning':
            return 'rgba(245, 158, 11, 0.15)';
          case 'error':
            return 'rgba(239, 68, 68, 0.15)';
          default:
            return 'rgba(255, 255, 255, 0.1)';
        }
      }},
      transparent 70%
    );
    border-radius: inherit;
    pointer-events: none;
  }
  
  /* Arrow styling with enhanced shadow */
  &.with-arrow::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: rgba(15, 23, 42, 0.85) transparent transparent transparent;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }
`; 