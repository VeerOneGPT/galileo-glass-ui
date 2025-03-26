import React, { forwardRef, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { PageTransitionProps } from './types';
import { createThemeContext } from '../../core/themeUtils';
import { glassSurface } from '../../core/mixins/glassSurface';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOutUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-30px);
    opacity: 0;
  }
`;

const slideInDown = keyframes`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOutDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(30px);
    opacity: 0;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-30px);
    opacity: 0;
  }
`;

const slideInRight = keyframes`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(30px);
    opacity: 0;
  }
`;

const zoomIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const zoomOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
`;

const flipIn = keyframes`
  from {
    transform: perspective(400px) rotateX(10deg);
    opacity: 0;
  }
  to {
    transform: perspective(400px) rotateX(0);
    opacity: 1;
  }
`;

const flipOut = keyframes`
  from {
    transform: perspective(400px) rotateX(0);
    opacity: 1;
  }
  to {
    transform: perspective(400px) rotateX(-10deg);
    opacity: 0;
  }
`;

const glassFadeIn = keyframes`
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    background-color: rgba(255, 255, 255, 0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const glassFadeOut = keyframes`
  from {
    opacity: 1;
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.1);
  }
  to {
    opacity: 0;
    backdrop-filter: blur(0);
    background-color: rgba(255, 255, 255, 0);
  }
`;

const glassRevealIn = keyframes`
  from {
    clip-path: inset(0 100% 0 0);
    backdrop-filter: blur(10px);
  }
  to {
    clip-path: inset(0 0 0 0);
    backdrop-filter: blur(10px);
  }
`;

const glassRevealOut = keyframes`
  from {
    clip-path: inset(0 0 0 0);
    backdrop-filter: blur(10px);
  }
  to {
    clip-path: inset(0 0 0 100%);
    backdrop-filter: blur(10px);
  }
`;

// Helper to get animation based on mode and direction
const getAnimation = (
  mode: PageTransitionProps['mode'],
  direction: PageTransitionProps['direction'],
  isEnter: boolean
) => {
  switch (mode) {
    case 'fade':
      return isEnter ? fadeIn : fadeOut;
    case 'slide':
      switch (direction) {
        case 'up':
          return isEnter ? slideInUp : slideOutUp;
        case 'down':
          return isEnter ? slideInDown : slideOutDown;
        case 'left':
          return isEnter ? slideInLeft : slideOutLeft;
        case 'right':
        default:
          return isEnter ? slideInRight : slideOutRight;
      }
    case 'zoom':
      return isEnter ? zoomIn : zoomOut;
    case 'flip':
      return isEnter ? flipIn : flipOut;
    case 'glass-fade':
      return isEnter ? glassFadeIn : glassFadeOut;
    case 'glass-reveal':
      return isEnter ? glassRevealIn : glassRevealOut;
    default:
      return isEnter ? fadeIn : fadeOut;
  }
};

// Define easing variable or use direct string
const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Transition container with animation styles
const TransitionContainer = styled.div<{
  $mode: PageTransitionProps['mode'];
  $state: 'entering' | 'entered' | 'exiting' | 'exited';
  $duration: number;
  $isReducedMotion: boolean;
  $perspective: number;
  $direction: PageTransitionProps['direction'];
  $easing: string;
  $glassTransitionIntensity: number;
}>`
  position: relative;
  transition-property: opacity, transform, backdrop-filter, background-color, clip-path;
  transition-duration: ${({ $duration, $isReducedMotion }) => 
    $isReducedMotion ? '0ms' : `${$duration}ms`};
  transition-timing-function: ${({ $easing }) => $easing};
  
  ${({ $mode, $perspective }) => $mode === 'flip' && `
    perspective: ${$perspective}px;
  `}
  
  ${({ $state, $mode, $direction, $duration, $isReducedMotion, $glassTransitionIntensity, theme }) => {
    if ($isReducedMotion) {
      return css`
        opacity: ${$state === 'entering' || $state === 'entered' ? 1 : 0};
        transition: opacity 100ms ease;
      `;
    }
    
    const enterAnimation = getAnimation($mode, $direction, true);
    const exitAnimation = getAnimation($mode, $direction, false);
    
    switch ($state) {
      case 'entering':
        return css`
          animation: ${enterAnimation} ${$duration}ms ${easing} both;
          ${($mode === 'glass-fade' || $mode === 'glass-reveal') && `
            ${theme && glassSurface({
              elevation: 2,
              backgroundOpacity: 0.3,
              blurStrength: '12px',
              themeContext: createThemeContext(theme)
            })}
          `}
        `;
      case 'entered':
        return css`
          ${($mode === 'glass-fade' || $mode === 'glass-reveal') && `
            ${theme && glassSurface({
              elevation: 2,
              backgroundOpacity: 0.3,
              blurStrength: '12px',
              themeContext: createThemeContext(theme)
            })}
          `}
        `;
      case 'exiting':
        return css`
          animation: ${exitAnimation} ${$duration}ms ${easing} both;
          ${($mode === 'glass-fade' || $mode === 'glass-reveal') && `
            ${theme && glassSurface({
              elevation: 2,
              backgroundOpacity: 0.3,
              blurStrength: '12px',
              themeContext: createThemeContext(theme)
            })}
          `}
        `;
      case 'exited':
        return css`
          display: none;
        `;
      default:
        return '';
    }
  }}
`;

/**
 * PageTransition component for smooth page transitions with glass effects
 */
export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  (
    {
      children,
      mode = 'fade',
      locationKey,
      duration = 300,
      disabled = false,
      className,
      style,
      perspective = 1200,
      direction = 'right',
      inTransition,
      onStart,
      onComplete,
      glassTransitionIntensity = 0.5,
      respectReducedMotion = true,
      ...rest
    }: PageTransitionProps,
    ref
  ) => {
    const [key, setKey] = useState<string | number>(locationKey || 'initial');
    const [state, setState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('entered');
    const [content, setContent] = useState<React.ReactNode>(children);
    const prefersReducedMotion = useReducedMotion() && respectReducedMotion;
    
    // Handle locationKey changes
    useEffect(() => {
      if (disabled) {
        setContent(children);
        return;
      }
      
      if (locationKey !== undefined && locationKey !== key) {
        // Start exit transition
        setState('exiting');
        if (onStart) onStart();
        
        // After exit, update content and start enter transition
        const timeout = setTimeout(() => {
          setContent(children);
          setKey(locationKey);
          setState('entering');
          
          // After enter transition completes
          const enterTimeout = setTimeout(() => {
            setState('entered');
            if (onComplete) onComplete();
          }, prefersReducedMotion ? 50 : duration);
          
          return () => clearTimeout(enterTimeout);
        }, prefersReducedMotion ? 50 : duration);
        
        return () => clearTimeout(timeout);
      } else if (locationKey === undefined) {
        // If no locationKey, just update content directly
        setContent(children);
      }
    }, [children, locationKey, key, disabled, duration, onStart, onComplete, prefersReducedMotion]);
    
    // Handle manual transitions via inTransition prop
    useEffect(() => {
      if (disabled || inTransition === undefined) return;
      
      if (inTransition) {
        setState('entering');
        if (onStart) onStart();
        
        const timeout = setTimeout(() => {
          setState('entered');
          if (onComplete) onComplete();
        }, prefersReducedMotion ? 50 : duration);
        
        return () => clearTimeout(timeout);
      } else {
        setState('exiting');
        if (onStart) onStart();
        
        const timeout = setTimeout(() => {
          setState('entered'); // Don't fully hide, just end animation
          if (onComplete) onComplete();
        }, prefersReducedMotion ? 50 : duration);
        
        return () => clearTimeout(timeout);
      }
    }, [inTransition, disabled, duration, onStart, onComplete, prefersReducedMotion]);
    
    // If disabled, render content directly
    if (disabled) {
      return (
        <div ref={ref} className={className} style={style} {...rest}>
          {children}
        </div>
      );
    }
    
    return (
      <TransitionContainer
        ref={ref}
        $mode={mode}
        $state={state}
        $duration={duration}
        $isReducedMotion={prefersReducedMotion}
        $perspective={perspective}
        $direction={direction}
        $easing={easing}
        $glassTransitionIntensity={glassTransitionIntensity}
        className={className}
        style={style}
        {...rest}
      >
        {content}
      </TransitionContainer>
    );
  }
);

PageTransition.displayName = 'PageTransition';