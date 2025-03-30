import React, { forwardRef, useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { type SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

import { PageTransitionProps } from './types';

// Import AnimationProps and context
import { AnimationProps } from '../../animations/types'; 
import { useAnimationContext } from '../../contexts/AnimationContext';

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

// Define animation properties for different modes
const getTargetProps = (mode: PageTransitionProps['mode'], direction: PageTransitionProps['direction'], isEnter: boolean) => {
  const exitOpacity = 0;
  const enterOpacity = 1;
  
  // Numeric properties for spring
  let target = {
    opacity: isEnter ? enterOpacity : exitOpacity,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    scale: 1
  };
  
  const exitSlideOffset = 30;
  const exitScale = 0.95;
  const exitZOffset = -50;

  if (mode === 'physics' || mode === 'zSpace') {
    if (!isEnter) { // Exit state
      target.scale = exitScale;
      switch (direction) {
        case 'up': target.translateY = -exitSlideOffset; break;
        case 'down': target.translateY = exitSlideOffset; break;
        case 'left': target.translateX = -exitSlideOffset; break;
        case 'right': target.translateX = exitSlideOffset; break;
      }
      if (mode === 'zSpace') {
        target.translateZ = exitZOffset;
      }
    } // Enter state uses default target (0 translations, scale 1, opacity 1)
  }
  
  return target;
};

// Transition container with animation styles
const TransitionContainer = styled.div<{
  $mode: PageTransitionProps['mode'];
  $state: 'entering' | 'entered' | 'exiting' | 'exited';
  $duration: number;
  $isReducedMotion: boolean;
  $perspective?: number; // Optional for flip/zSpace
  $direction: PageTransitionProps['direction'];
  $easing: string;
  $glassTransitionIntensity: number;
}>`
  position: relative; // Changed to relative for easier stacking?

  /* CSS Animations (only apply if mode is CSS-based) */
  ${(props) => {
    // Apply CSS animations only for non-physics/zSpace modes
    if (props.$mode !== 'physics' && props.$mode !== 'zSpace') {
      if (props.$isReducedMotion) {
        return css`
          opacity: ${props.$state === 'entering' || props.$state === 'entered' ? 1 : 0};
          transition: opacity 100ms ease;
        `;
      }
      const enterAnimation = getAnimation(props.$mode, props.$direction, true);
      const exitAnimation = getAnimation(props.$mode, props.$direction, false);
      switch (props.$state) {
        case 'entering': return css`animation: ${enterAnimation} ${props.$duration}ms ${props.$easing} both;`;
        case 'exiting': return css`animation: ${exitAnimation} ${props.$duration}ms ${props.$easing} both;`;
        case 'exited': return css`display: none;`;
        default: return '';
      }
    } else if (props.$state === 'exited') {
        // Still need to hide exited elements even in physics mode
        return css`display: none;`;
    }
    return '';
  }}
  
  /* Perspective for specific modes */
  ${({ $mode, $perspective }) => ($mode === 'flip' || $mode === 'zSpace') && `perspective: ${$perspective}px;`}
  
  /* Glass surface for glass modes (applied conditionally in CSS) */
  /* ... existing glassSurface logic within CSS animation cases if needed ... */
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
      physicsConfig: propPhysicsConfig, // Rename incoming prop
      inTransition,
      onStart,
      onComplete,
      glassTransitionIntensity = 0.5,
      respectReducedMotion = true,
      // Destructure standard animation props
      animationConfig,
      disableAnimation,
      motionSensitivity,
      ...rest
    }: PageTransitionProps, // Ensure PageTransitionProps extends AnimationProps in types.ts
    ref
  ) => {
    const [key, setKey] = useState<string | number>(locationKey || 'initial');
    const [state, setState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('entered');
    const [content, setContent] = useState<React.ReactNode>(children);
    
    // Animation context and flags
    const { defaultSpring } = useAnimationContext();
    const prefersReducedMotion = useReducedMotion() && respectReducedMotion;
    const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;

    // --- Physics/ZSpace Integration --- 
    const isPhysicsMode = (mode === 'physics' || mode === 'zSpace') && !finalDisableAnimation;

    // Resolve final physics config
    const finalPhysicsConfig = useMemo(() => {
        const baseConfig: SpringConfig = SpringPresets.DEFAULT;
        
        let contextConf: Partial<SpringConfig> = {};
        if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
            contextConf = SpringPresets[defaultSpring as keyof typeof SpringPresets];
        } else if (typeof defaultSpring === 'object') {
            contextConf = defaultSpring ?? {};
        }

        let animPropConf: Partial<SpringConfig> = {};
        if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
            animPropConf = SpringPresets[animationConfig as keyof typeof SpringPresets];
        } else if (typeof animationConfig === 'object' && animationConfig !== null) {
            // Check if it looks like a SpringConfig
            if ('tension' in animationConfig || 'friction' in animationConfig) {
                animPropConf = animationConfig as Partial<SpringConfig>;
            }
            // Note: This doesn't handle PhysicsInteractionOptions being passed to animationConfig
            // We assume animationConfig is for general spring behavior here.
        }
        
        // Use propPhysicsConfig if provided and valid (overrides animationConfig)
        let directPropConf: Partial<SpringConfig> = {};
        if (typeof propPhysicsConfig === 'string' && propPhysicsConfig in SpringPresets) {
            directPropConf = SpringPresets[propPhysicsConfig as keyof typeof SpringPresets];
        } else if (typeof propPhysicsConfig === 'object' && propPhysicsConfig !== null) {
             if ('tension' in propPhysicsConfig || 'friction' in propPhysicsConfig) {
                directPropConf = propPhysicsConfig as Partial<SpringConfig>;
            }
        }

        // Combine: propPhysicsConfig > animationConfig > context > base
        return { ...baseConfig, ...contextConf, ...animPropConf, ...directPropConf };

    }, [defaultSpring, animationConfig, propPhysicsConfig]);


    const initialProps = getTargetProps(mode, direction, true);

    const { values: animatedProps, start: startAnimation, isAnimating } = useMultiSpring({
      from: initialProps,
      animationConfig: finalPhysicsConfig,
      autoStart: false,
      immediate: finalDisableAnimation,
    });

    // Store handleExitComplete in ref to avoid dependency issues
    const handleExitCompleteRef = useRef<(() => void) | null>(null);
    
    // Effect to handle physics animation completion
    useEffect(() => {
      if (state === 'exiting' && !isAnimating && handleExitCompleteRef.current) {
        handleExitCompleteRef.current();
        handleExitCompleteRef.current = null;
      }
    }, [isAnimating, state]);

    // Effect for locationKey changes
    useEffect(() => {
      if (disabled) {
        setContent(children);
        setState('entered');
        return;
      }

      if (locationKey !== undefined && locationKey !== key) {
        if (onStart) onStart();

        const handleExitComplete = () => {
          setContent(children);
          setKey(locationKey);
          setState('entering');

          if (isPhysicsMode) {
            // Start enter animation
            startAnimation({ 
              to: getTargetProps(mode, direction, true),
            });
          }
          
          const enterTimeout = setTimeout(() => {
              setState('entered');
              if (onComplete) onComplete();
          }, finalDisableAnimation ? 50 : duration); // Use finalDisableAnimation for timeout
          
          return () => clearTimeout(enterTimeout);
        };

        handleExitCompleteRef.current = handleExitComplete;
        setState('exiting');
        if (isPhysicsMode) {
          // Start exit animation
          startAnimation({ 
            to: getTargetProps(mode, direction, false),
          });
          return () => {}; // Rely on isAnimating effect
        } else {
          const exitTimeout = setTimeout(handleExitComplete, finalDisableAnimation ? 50 : duration); // Use finalDisableAnimation for timeout
          return () => {
             clearTimeout(exitTimeout);
             handleExitCompleteRef.current = null;
          };
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationKey, key, children, disabled, onStart, onComplete, duration, mode, direction, isPhysicsMode, startAnimation, finalPhysicsConfig, finalDisableAnimation]); // Add dependencies

    // Effect for manual inTransition prop (use finalDisableAnimation)
    useEffect(() => {
      if (disabled || inTransition === undefined) return;
      // ... logic using finalDisableAnimation for timeouts ...
      if (inTransition) {
        setState('entering');
        if (onStart) onStart();
        const timeout = setTimeout(
          () => {
            setState('entered');
            if (onComplete) onComplete();
          },
          finalDisableAnimation ? 50 : duration
        );
        return () => clearTimeout(timeout);
      } else {
        setState('exiting');
        if (onStart) onStart();
        const timeout = setTimeout(
          () => {
            setState('entered');
            if (onComplete) onComplete();
          },
          finalDisableAnimation ? 50 : duration
        );
        return () => clearTimeout(timeout);
      }
    }, [inTransition, disabled, duration, onStart, onComplete, finalDisableAnimation]); // Add finalDisableAnimation dependency


    // Construct transform string from animated numeric values
    const physicsTransform = isPhysicsMode
      ? `translate3d(${animatedProps.translateX}px, ${animatedProps.translateY}px, ${animatedProps.translateZ}px) scale(${animatedProps.scale})`
      : undefined;
    
    const physicsStyle: React.CSSProperties | undefined = isPhysicsMode
      ? {
          opacity: animatedProps.opacity,
          transform: physicsTransform,
        }
      : undefined;

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
        className={className}
        style={physicsStyle || style} 
        $state={state}
        $mode={mode}
        $duration={duration}
        $isReducedMotion={finalDisableAnimation} // Use final flag
        $perspective={perspective}
        $direction={direction}
        $easing={easing}
        $glassTransitionIntensity={glassTransitionIntensity}
        {...rest}
      >
        {content}
      </TransitionContainer>
    );
  }
);

PageTransition.displayName = 'PageTransition';

// Need to update PageTransitionProps in ./types.ts
// Add: 
// mode?: 'fade' | 'slide' | 'zoom' | 'flip' | 'glass-fade' | 'glass-reveal' | 'physics' | 'zSpace';
// physicsConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;

export default PageTransition;
