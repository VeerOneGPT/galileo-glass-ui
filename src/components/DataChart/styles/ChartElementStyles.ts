/**
 * Styled components for chart UI elements
 */
import styled from 'styled-components';
import { fadeIn, fadeSlideUp } from '../../../animations/keyframes/chartAnimations';

// Toolbar
export const ChartToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

export const ChartTypeSelector = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const TypeButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

export const ToolbarButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    &::after {
      opacity: 0.2;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  svg {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
  }
`;

export const EnhancedExportButton = styled(ToolbarButton)`
  background: rgba(46, 196, 182, 0.15);
  border: 1px solid rgba(46, 196, 182, 0.3);
  
  &:hover {
    background: rgba(46, 196, 182, 0.25);
    border: 1px solid rgba(46, 196, 182, 0.4);
  }
  
  &::after {
    background: radial-gradient(circle at center, rgba(46, 196, 182, 0.3) 0%, transparent 70%);
  }
`;

// Legend
export const ChartLegend = styled.div<{ $position: string; $style: string; $glassEffect: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: ${props => props.$position === 'bottom' ? '1rem 0 0' : '0 0 1rem'};
  justify-content: ${props => {
    if (props.$position === 'left') return 'flex-start';
    if (props.$position === 'right') return 'flex-end';
    return 'center';
  }};
  
  ${props => props.$glassEffect && `
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
`;

export const LegendItem = styled.div<{ 
  $style: string;
  $active: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  padding: ${props => props.$style === 'pills' ? '0.25rem 0.75rem' : '0.25rem 0.5rem'};
  font-size: 0.75rem;
  border-radius: ${props => props.$style === 'pills' ? '20px' : '4px'};
  background: ${props => {
    if (props.$style === 'pills') {
      return props.$active 
        ? `rgba(${props.$color}, 0.2)` 
        : 'rgba(255, 255, 255, 0.1)';
    }
    return props.$active ? `rgba(${props.$color}, 0.1)` : 'transparent';
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.5s ease-out forwards;
  position: relative;
  overflow: hidden;
  
  /* Glass effect for pills style */
  ${props => props.$style === 'pills' && `
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  /* Interactive hover effect */
  &:hover {
    background: ${props => props.$active 
      ? `rgba(${props.$color}, 0.25)` 
      : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    
    /* Subtle glow effect on hover */
    &::after {
      opacity: 0.5;
    }
  }
  
  /* Active state styling */
  ${props => props.$active && `
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(${props.$color}, 0.2);
  `}
  
  /* Glow effect element */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(${props => props.$color}, 0.3) 0%, transparent 70%);
    opacity: ${props => props.$active ? 0.3 : 0};
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: -1;
  }
`;

export const LegendColor = styled.div<{ $color: string; $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
  margin-right: 0.5rem;
  transition: transform 0.2s ease;
  box-shadow: ${props => props.$active ? `0 0 8px ${props.$color}` : 'none'};
  
  ${props => props.$active && `
    transform: scale(1.2);
  `}
`;

export const LegendLabel = styled.span<{ $active: boolean }>`
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  transition: color 0.2s ease;
`;

// KPI Styling (new)
export const KpiContainer = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$compact ? '0.75rem' : '1.5rem'};
  height: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: 10%;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.05),
      transparent 70%
    );
    border-radius: 50%;
    z-index: -1;
    opacity: 0.8;
    filter: blur(8px);
  }
`;

export const KpiTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 0.5rem;
  position: relative;
`;

export const KpiValue = styled.div<{ $trend?: 'positive' | 'negative' | 'neutral' }>`
  font-size: 3rem;
  font-weight: 700;
  position: relative;
  
  /* Enhanced gradient based on trend */
  background: ${props => {
    switch (props.$trend) {
      case 'positive':
        return 'linear-gradient(135deg, #34D399 0%, #60a5fa 100%)';
      case 'negative':
        return 'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)';
      default:
        return 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)';
    }
  }};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  
  /* Enhanced glow effect based on trend */
  text-shadow: ${props => {
    switch (props.$trend) {
      case 'positive':
        return '0 0 15px rgba(52, 211, 153, 0.3)';
      case 'negative':
        return '0 0 15px rgba(244, 63, 94, 0.3)';
      default:
        return '0 0 15px rgba(148, 163, 184, 0.3)';
    }
  }};
  
  @keyframes kpi-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  
  animation: kpi-pulse 3s ease-in-out infinite;
`;

export const KpiSubtitle = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
`;

export const KpiTrend = styled.div<{ $trend: 'positive' | 'negative' | 'neutral' }>`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  
  /* Enhanced gradient for trend */
  background: ${props => {
    switch (props.$trend) {
      case 'positive':
        return 'linear-gradient(90deg, rgba(52, 211, 153, 0.9), rgba(52, 211, 153, 0.7))';
      case 'negative':
        return 'linear-gradient(90deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0.7))';
      default:
        return 'linear-gradient(90deg, rgba(148, 163, 184, 0.9), rgba(148, 163, 184, 0.7))';
    }
  }};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  
  /* Enhanced glow effect */
  text-shadow: ${props => {
    switch (props.$trend) {
      case 'positive':
        return '0 0 10px rgba(52, 211, 153, 0.2)';
      case 'negative':
        return '0 0 10px rgba(239, 68, 68, 0.2)';
      default:
        return '0 0 10px rgba(148, 163, 184, 0.2)';
    }
  }};
  
  margin-top: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  
  /* Glass surface for trend indicator */
  background-color: ${props => {
    switch (props.$trend) {
      case 'positive':
        return 'rgba(52, 211, 153, 0.1)';
      case 'negative':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(148, 163, 184, 0.1)';
    }
  }};
  backdrop-filter: blur(4px);
  
  &::before {
    content: '${props => {
      switch (props.$trend) {
        case 'positive':
          return '↑';
        case 'negative':
          return '↓';
        default:
          return '•';
      }
    }}';
    margin-right: 0.25rem;
  }
`; 