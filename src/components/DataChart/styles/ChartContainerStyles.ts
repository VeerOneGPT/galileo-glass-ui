/**
 * Chart container styled components
 */
import styled from 'styled-components';
import { createThemeContext } from '../../../core/themeContext';
import { glassSurface } from '../../../core/mixins/glassSurface';
import { glassGlow } from '../../../core/mixins/glowEffects';
import { atmosphericMovement } from '../../../animations/keyframes/chartAnimations';

export const ChartContainer = styled.div<{
  $glassVariant: string;
  $blurStrength: string;
  $color: string;
  $elevation: number;
  $borderRadius: string | number;
  $borderColor?: string;
}>`
  position: relative;
  padding: 1.5rem;
  border-radius: ${props => typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  border: 1px solid ${props => props.$borderColor || 'rgba(255, 255, 255, 0.1)'};
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
  
  ${props => {
    // Get theme context for glass styling
    const themeContext = createThemeContext({});
    
    // Apply glass effect based on variant
    switch (props.$glassVariant) {
      case 'clear':
        return `
          background-color: transparent;
          backdrop-filter: none;
          border-color: transparent;
          box-shadow: none;
        `;
      case 'frosted':
        return glassSurface({
          elevation: props.$elevation,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'tinted':
        return `
          ${glassSurface({
            elevation: props.$elevation,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          
          background-color: ${props.$color !== 'default' 
            ? `var(--color-${props.$color}-transparent)`
            : 'rgba(30, 41, 59, 0.5)'};
        `;
      case 'luminous':
        return `
          ${glassSurface({
            elevation: props.$elevation,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          
          ${props.$color !== 'default' && glassGlow({
            intensity: 'subtle',
            color: props.$color,
            themeContext,
          })}
        `;
      default:
        return glassSurface({
          elevation: props.$elevation,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

// New component for atmospheric background effects
export const AtmosphericBackground = styled.div<{
  $color: string;
}>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => {
      if (props.$color === 'primary') return 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
      if (props.$color === 'secondary') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)';
      if (props.$color === 'info') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
      if (props.$color === 'success') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)';
      if (props.$color === 'warning') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)';
      if (props.$color === 'error') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)';
      return 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
    }};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 25%;
    right: 25%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: ${props => {
      if (props.$color === 'primary') return 'rgba(99, 102, 241, 0.1)';
      if (props.$color === 'secondary') return 'rgba(139, 92, 246, 0.1)';
      if (props.$color === 'info') return 'rgba(59, 130, 246, 0.1)';
      if (props.$color === 'success') return 'rgba(16, 185, 129, 0.1)';
      if (props.$color === 'warning') return 'rgba(245, 158, 11, 0.1)';
      if (props.$color === 'error') return 'rgba(239, 68, 68, 0.1)';
      return 'rgba(99, 102, 241, 0.1)';
    }};
    filter: blur(50px);
    animation: ${atmosphericMovement} 8s infinite ease-in-out;
  }
`;

export const ChartHeader = styled.div`
  margin-bottom: 1rem;
`;

export const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #fff;
`;

export const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.7;
  color: #fff;
`;

export const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  /* Ensure the chart doesn't clip its content - important for tooltips and animations */
  overflow: visible;
`; 