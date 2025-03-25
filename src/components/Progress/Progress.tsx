import React, { forwardRef, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';

// Progress component props interface
export interface ProgressProps {
  /**
   * The value of the progress indicator (0-100)
   */
  value?: number;
  
  /**
   * The variant of the progress indicator
   */
  variant?: 'determinate' | 'indeterminate' | 'buffer';
  
  /**
   * The color of the progress indicator
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  
  /**
   * The thickness of the progress bar
   */
  thickness?: number;
  
  /**
   * The shape of the progress indicator
   */
  shape?: 'linear' | 'circular';
  
  /**
   * The size of the circular progress indicator
   */
  size?: 'small' | 'medium' | 'large' | number;
  
  /**
   * If true, the component will use glass styling
   */
  glassEffect?: boolean;
  
  /**
   * Label to display with the progress indicator
   */
  label?: string;
  
  /**
   * If true, shows the value as a percentage
   */
  showValue?: boolean;
  
  /**
   * The buffer value (0-100) for buffer variant
   */
  bufferValue?: number;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#6366F1';
  }
};

// Get size value based on size prop
const getSizeValue = (size: 'small' | 'medium' | 'large' | number): number => {
  if (typeof size === 'number') {
    return size;
  }
  
  switch (size) {
    case 'small':
      return 24;
    case 'large':
      return 48;
    default: // medium
      return 40;
  }
};

// Keyframes animations
const indeterminateAnimation1 = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const indeterminateAnimation2 = keyframes`
  0% {
    left: -200%;
    right: 100%;
  }
  60% {
    left: 107%;
    right: -8%;
  }
  100% {
    left: 107%;
    right: -8%;
  }
`;

const bufferAnimation = keyframes`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }
  60% {
    opacity: 0;
    background-position: 0 -23px;
  }
  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`;

const circularRotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const circularDashAnimation = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -125;
  }
`;

// Styled components
const ProgressContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ProgressLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: rgba(0, 0, 0, 0.87);
`;

const LinearProgressRoot = styled.div<{
  $thickness: number;
}>`
  position: relative;
  width: 100%;
  overflow: hidden;
  height: ${props => props.$thickness}px;
  border-radius: ${props => props.$thickness / 2}px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const LinearProgressBar = styled.div<{
  $color: string;
  $variant: string;
  $value: number;
  $glassEffect: boolean;
}>`
  width: ${props => props.$variant === 'determinate' ? `${props.$value}%` : '100%'};
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  background-color: ${props => getColorByName(props.$color)};
  transition: ${props => props.$variant === 'determinate' ? 'width 0.4s ease-in-out' : 'none'};
  
  /* Indeterminate animation */
  ${props => props.$variant === 'indeterminate' && `
    width: auto;
    animation: ${indeterminateAnimation1} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-color: ${getColorByName(props.$color)};
      animation: ${indeterminateAnimation2} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    }
  `}
  
  /* Glass effect styling */
  ${props => props.$glassEffect && glassSurface({
    elevation: 1,
    blurStrength: 'subtle',
    backgroundOpacity: 'high',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glow effect for glass */
  ${props => props.$glassEffect && glassGlow({
    intensity: 'low',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

const BufferProgressBar = styled.div<{
  $color: string;
  $bufferValue: number;
}>`
  width: ${props => `${props.$bufferValue}%`};
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  transition: width 0.4s ease-in-out;
  background-color: ${props => {
    const color = getColorByName(props.$color);
    return `${color}40`; // Adding 25% opacity
  }};
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-image: linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent
    );
    background-size: 10px 10px;
    animation: ${bufferAnimation} 3s infinite linear;
  }
`;

const CircularProgressRoot = styled.div<{
  $size: number;
}>`
  display: inline-flex;
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
`;

const CircularProgressSvg = styled.svg<{
  $size: number;
}>`
  transform: rotate(-90deg);
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
`;

const CircularProgressCircle = styled.circle<{
  $color: string;
  $variant: string;
  $glassEffect: boolean;
}>`
  stroke: ${props => getColorByName(props.$color)};
  stroke-dasharray: ${props => props.$variant === 'determinate' ? '1, 500' : '1, 200'};
  stroke-dashoffset: 0;
  stroke-linecap: round;
  transition: stroke-dasharray 0.4s ease-in-out;
  
  /* Indeterminate animation */
  ${props => props.$variant === 'indeterminate' && `
    animation: ${circularDashAnimation} 1.5s ease-in-out infinite;
  `}
  
  /* Glass effect highlight */
  ${props => props.$glassEffect && `
    filter: drop-shadow(0 0 2px ${getColorByName(props.$color)});
  `}
`;

const CircularProgressOverlay = styled.div<{
  $size: number;
  $variant: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: ${props => props.$size < 40 ? props.$size / 4 : props.$size / 3}px;
  color: rgba(0, 0, 0, 0.87);
  user-select: none;
  
  /* Hide for indeterminate */
  opacity: ${props => props.$variant === 'indeterminate' ? 0 : 1};
`;

/**
 * Progress Component
 * 
 * A component for displaying progress indicators.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
  const {
    value = 0,
    variant = 'determinate',
    color = 'primary',
    thickness = 4,
    shape = 'linear',
    size = 'medium',
    glassEffect = false,
    label,
    showValue = false,
    bufferValue = 100,
    className,
    ...rest
  } = props;
  
  // Clamp value between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const normalizedBufferValue = Math.min(Math.max(bufferValue, 0), 100);
  const sizeValue = getSizeValue(size);
  
  // References for calculations
  const circleRef = useRef<SVGCircleElement>(null);
  
  // Calculate circle parameters
  useEffect(() => {
    if (circleRef.current && shape === 'circular' && variant === 'determinate') {
      const circle = circleRef.current;
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      
      // Calculate stroke dasharray for determinate mode
      const strokeDasharray = `${(normalizedValue / 100) * circumference}, ${circumference}`;
      circle.style.strokeDasharray = strokeDasharray;
    }
  }, [normalizedValue, shape, variant]);
  
  // Render linear progress
  const renderLinearProgress = () => (
    <LinearProgressRoot $thickness={thickness}>
      {variant === 'buffer' && (
        <BufferProgressBar
          $color={color}
          $bufferValue={normalizedBufferValue}
        />
      )}
      <LinearProgressBar
        $color={color}
        $variant={variant}
        $value={normalizedValue}
        $glassEffect={glassEffect}
      />
    </LinearProgressRoot>
  );
  
  // Render circular progress
  const renderCircularProgress = () => {
    const svgSize = sizeValue;
    const radius = (svgSize - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    
    return (
      <CircularProgressRoot $size={svgSize}>
        <CircularProgressSvg $size={svgSize}>
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 0, 0, 0.1)"
            strokeWidth={thickness}
          />
          
          {/* Progress circle */}
          <CircularProgressCircle
            ref={circleRef}
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            $color={color}
            $variant={variant}
            $glassEffect={glassEffect}
            style={{
              animationDuration: variant === 'indeterminate' ? '1.5s' : undefined,
              animationIterationCount: variant === 'indeterminate' ? 'infinite' : undefined,
              animationTimingFunction: variant === 'indeterminate' ? 'ease-in-out' : undefined,
              animationDirection: variant === 'indeterminate' ? 'alternate' : undefined,
            }}
          />
        </CircularProgressSvg>
        
        {showValue && (
          <CircularProgressOverlay
            $size={svgSize}
            $variant={variant}
          >
            {`${Math.round(normalizedValue)}%`}
          </CircularProgressOverlay>
        )}
      </CircularProgressRoot>
    );
  };
  
  return (
    <ProgressContainer
      ref={ref}
      className={className}
      {...rest}
    >
      {(label || showValue) && shape === 'linear' && (
        <ProgressLabel>
          {label && <span>{label}</span>}
          {showValue && <span>{`${Math.round(normalizedValue)}%`}</span>}
        </ProgressLabel>
      )}
      
      {shape === 'linear' ? renderLinearProgress() : renderCircularProgress()}
    </ProgressContainer>
  );
});

Progress.displayName = 'Progress';

/**
 * GlassProgress Component
 * 
 * A progress indicator with glass morphism styling.
 */
export const GlassProgress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) => {
  const {
    className,
    glassEffect = true,
    ...rest
  } = props;
  
  return (
    <Progress
      ref={ref}
      className={`glass-progress ${className || ''}`}
      glassEffect={glassEffect}
      {...rest}
    />
  );
});

GlassProgress.displayName = 'GlassProgress';