import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useTheme } from './ThemeProvider';

interface ThemeTransitionProps {
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Duration of the transition in ms
   */
  duration?: number;
  
  /**
   * Easing function for the transition
   */
  easing?: string;
  
  /**
   * If true, only transition when theme variant changes (not color mode)
   */
  onlyThemeChanges?: boolean;
  
  /**
   * If true, only transition when color mode changes (not theme variant)
   */
  onlyColorModeChanges?: boolean;
  
  /**
   * Type of transition animation
   */
  transitionType?: 'fade' | 'crossfade' | 'slide' | 'zoom';
  
  /**
   * Direction for slide transitions
   */
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  
  /**
   * If true, will disable transitions for users with reduced motion preference
   */
  respectReducedMotion?: boolean;
}

const FadeContainer = styled.div<{
  state: 'entering' | 'entered' | 'exiting' | 'exited';
  duration: number;
  easing: string;
  transitionType: 'fade' | 'crossfade' | 'slide' | 'zoom';
  slideDirection: 'up' | 'down' | 'left' | 'right';
}>`
  width: 100%;
  height: 100%;
  
  /* Transition properties based on state */
  transition-property: opacity, transform;
  transition-duration: ${props => props.duration}ms;
  transition-timing-function: ${props => props.easing};
  
  /* Different animations based on transition type */
  ${props => {
    if (props.transitionType === 'fade') {
      return `
        opacity: ${props.state === 'entered' ? 1 : 0};
      `;
    }
    
    if (props.transitionType === 'crossfade') {
      return `
        opacity: ${props.state === 'entered' || props.state === 'entering' ? 1 : 0};
      `;
    }
    
    if (props.transitionType === 'zoom') {
      return `
        opacity: ${props.state === 'entered' ? 1 : 0};
        transform: scale(${props.state === 'entered' ? 1 : props.state === 'exiting' ? 0.95 : 1.05});
      `;
    }
    
    if (props.transitionType === 'slide') {
      const getTransform = () => {
        if (props.state === 'entered') return 'translate(0, 0)';
        
        const distance = '20px';
        if (props.slideDirection === 'up') {
          return props.state === 'exiting' ? `translateY(${distance})` : `translateY(-${distance})`;
        }
        if (props.slideDirection === 'down') {
          return props.state === 'exiting' ? `translateY(-${distance})` : `translateY(${distance})`;
        }
        if (props.slideDirection === 'left') {
          return props.state === 'exiting' ? `translateX(${distance})` : `translateX(-${distance})`;
        }
        if (props.slideDirection === 'right') {
          return props.state === 'exiting' ? `translateX(-${distance})` : `translateX(${distance})`;
        }
        return 'translate(0, 0)';
      };
      
      return `
        opacity: ${props.state === 'entered' ? 1 : 0};
        transform: ${getTransform()};
      `;
    }
    
    return '';
  }}
  
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
    transform: none !important;
  }
`;

/**
 * ThemeTransition Component
 * 
 * Adds smooth transitions when theme or color mode changes.
 */
const ThemeTransition: React.FC<ThemeTransitionProps> = ({
  children,
  duration = 300,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design easing
  onlyThemeChanges = false,
  onlyColorModeChanges = false,
  transitionType = 'fade',
  slideDirection = 'up',
  respectReducedMotion = true
}) => {
  const { isDark, currentTheme } = useTheme();
  
  // Generate a unique key for the current theme state
  const themeKey = onlyColorModeChanges 
    ? isDark ? 'dark' : 'light'
    : onlyThemeChanges
      ? currentTheme
      : `${currentTheme}-${isDark ? 'dark' : 'light'}`;
  
  // Current content reference
  const [currentContent, setCurrentContent] = useState<React.ReactNode>(children);
  const [currentKey, setCurrentKey] = useState<string>(themeKey);
  const [transitionState, setTransitionState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('entered');
  
  // Handle theme changes with transition
  useEffect(() => {
    // Skip if key hasn't changed
    if (themeKey === currentKey) return;
    
    // Check for reduced motion preference
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // No transition for users who prefer reduced motion
      setCurrentContent(children);
      setCurrentKey(themeKey);
      return;
    }
    
    // Start exit transition
    setTransitionState('exiting');
    
    // After exit transition completes, switch content and start enter transition
    const exitTimer = setTimeout(() => {
      setCurrentContent(children);
      setCurrentKey(themeKey);
      setTransitionState('entering');
      
      // After enter transition completes, set state to entered
      const enterTimer = setTimeout(() => {
        setTransitionState('entered');
      }, duration);
      
      return () => clearTimeout(enterTimer);
    }, duration);
    
    return () => clearTimeout(exitTimer);
  }, [themeKey, currentKey, children, duration, respectReducedMotion]);
  
  return (
    <FadeContainer
      state={transitionState}
      duration={duration}
      easing={easing}
      transitionType={transitionType}
      slideDirection={slideDirection}
    >
      {currentContent}
    </FadeContainer>
  );
};

export default ThemeTransition;