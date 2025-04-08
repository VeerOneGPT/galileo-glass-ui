import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { createThemeContext } from '../../core/themeContext';
import { ZLayer } from '../../core/zspace';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Types of atmospheric effects
export type AtmosphereType =
  | 'subtle'
  | 'nebula'
  | 'aurora'
  | 'particles'
  | 'waves'
  | 'gradient'
  | 'ambient'
  | 'custom';

// Interaction modes for the atmosphere
export type InteractionMode = 'none' | 'mouse' | 'scroll' | 'audio' | 'time';

export interface DynamicAtmosphereProps {
  /**
   * The type of atmospheric effect
   */
  type?: AtmosphereType;

  /**
   * Primary color for the atmosphere
   */
  primaryColor?: string;

  /**
   * Secondary color for the atmosphere
   */
  secondaryColor?: string;

  /**
   * Accent color for the atmosphere
   */
  accentColor?: string;

  /**
   * The intensity of the effect (0-1)
   */
  intensity?: number;

  /**
   * The speed of the animation (0-1)
   */
  speed?: number;

  /**
   * The interaction mode for the atmosphere
   */
  interactionMode?: InteractionMode;

  /**
   * The sensitivity of the interaction (0-1)
   */
  interactionSensitivity?: number;

  /**
   * If true, the atmosphere will fill its container
   */
  fullSize?: boolean;

  /**
   * Width of the atmosphere
   */
  width?: string | number;

  /**
   * Height of the atmosphere
   */
  height?: string | number;

  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Z-index for the atmosphere
   */
  zIndex?: number;

  /**
   * The position of the atmosphere
   */
  position?: 'absolute' | 'fixed' | 'relative';

  /**
   * If true, respect reduced motion preferences
   */
  respectReducedMotion?: boolean;

  /**
   * The number of elements to create for particle-based effects
   */
  particleCount?: number;

  /**
   * Optional custom element to use for particles
   */
  particleElement?: React.ReactNode;

  /**
   * If true, the atmosphere will have a blur effect
   */
  blur?: boolean;

  /**
   * The strength of the blur effect (px)
   */
  blurStrength?: number;

  /**
   * If true, the atmosphere will have a noise texture
   */
  noise?: boolean;
}

// Keyframes for various animations
const subtlePulse = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 0.7; }
  100% { opacity: 0.5; }
`;

const nebulaMove = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

const auroraWave = keyframes`
  0% { transform: translateX(-100%) translateY(0); }
  50% { transform: translateX(0%) translateY(-20px); }
  100% { transform: translateX(100%) translateY(0); }
`;

const particleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0) translateX(0) rotate(0); 
    opacity: 0.5;
  }
  33% { 
    transform: translateY(-20px) translateX(10px) rotate(10deg); 
    opacity: 0.8;
  }
  66% { 
    transform: translateY(10px) translateX(-15px) rotate(-5deg); 
    opacity: 0.6;
  }
`;

const wavesAnimation = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const AtmosphereContainer = styled.div<{
  $width: string;
  $height: string;
  $fullSize: boolean;
  $position: string;
  $zIndex: number;
  $blur: boolean;
  $blurStrength: number;
}>`
  position: ${props => props.$position};
  width: ${props => (props.$fullSize ? '100%' : props.$width)};
  height: ${props => (props.$fullSize ? '100%' : props.$height)};
  overflow: hidden;
  z-index: ${props => props.$zIndex};
  pointer-events: none;

  ${props =>
    props.$position === 'absolute' &&
    `
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  `}

  ${props =>
    props.$blur &&
    `
    backdrop-filter: blur(${props.$blurStrength}px);
    -webkit-backdrop-filter: blur(${props.$blurStrength}px);
  `}
`;

const AtmosphereEffect = styled.div<{
  $type: AtmosphereType;
  $primaryColor: string;
  $secondaryColor: string;
  $accentColor: string;
  $intensity: number;
  $speed: number;
  $interactionMode: InteractionMode;
  $reducedMotion: boolean;
  $noise: boolean;
  $transform?: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  /* Apply noise texture if enabled */
  ${props =>
    props.$noise &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.08;
      mix-blend-mode: overlay;
      pointer-events: none;
    }
  `}

  /* Apply transformation if provided */
  ${props => props.$transform && `transform: ${props.$transform};`}
  
  /* Styles for each atmosphere type */
  ${props => {
    const intensity = props.$intensity;
    const animationDuration = props.$reducedMotion ? '0s' : `${30 / props.$speed}s`;

    switch (props.$type) {
      case 'subtle':
        return css`
          background: radial-gradient(
            circle at 50% 50%,
            ${props.$primaryColor}${Math.round(intensity * 40)},
            transparent 70%
          );
          animation: ${props.$reducedMotion
            ? 'none'
            : css`${subtlePulse} ${animationDuration} infinite ease-in-out`};
          opacity: ${intensity * 0.7 + 0.3};
        `;

      case 'nebula':
        return css`
          background: radial-gradient(
              circle at 30% 50%,
              ${props.$primaryColor}${Math.round(intensity * 60)},
              transparent 50%
            ),
            radial-gradient(
              circle at 70% 50%,
              ${props.$secondaryColor}${Math.round(intensity * 60)},
              transparent 50%
            );
          background-size: 200% 200%;
          animation: ${props.$reducedMotion
            ? 'none'
            : css`${nebulaMove} ${animationDuration} infinite alternate ease-in-out`};
          opacity: ${intensity * 0.8 + 0.2};
        `;

      case 'aurora':
        return css`
          &::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200px;
            background: linear-gradient(
              90deg,
              ${props.$primaryColor}00,
              ${props.$primaryColor}${Math.round(intensity * 60)},
              ${props.$secondaryColor}${Math.round(intensity * 60)},
              ${props.$accentColor}${Math.round(intensity * 60)},
              ${props.$primaryColor}00
            );
            top: 20%;
            border-radius: 50%;
            transform: rotate(-5deg);
            filter: blur(30px);
            animation: ${props.$reducedMotion
              ? 'none'
              : css`${auroraWave} ${animationDuration} infinite ease-in-out`};
            opacity: ${intensity * 0.8 + 0.2};
          }
        `;

      case 'waves':
        return css`
          background: linear-gradient(
            135deg,
            ${props.$primaryColor}${Math.round(intensity * 50)},
            ${props.$secondaryColor}${Math.round(intensity * 50)},
            ${props.$accentColor}${Math.round(intensity * 50)},
            ${props.$primaryColor}${Math.round(intensity * 50)}
          );
          background-size: 400% 400%;
          animation: ${props.$reducedMotion
            ? 'none'
            : css`${wavesAnimation} ${animationDuration} infinite ease-in-out`};
          opacity: ${intensity * 0.7 + 0.3};
        `;

      case 'gradient':
        return css`
          background: linear-gradient(
            -45deg,
            ${props.$primaryColor}${Math.round(intensity * 40)},
            ${props.$secondaryColor}${Math.round(intensity * 40)},
            ${props.$accentColor}${Math.round(intensity * 40)},
            ${props.$primaryColor}${Math.round(intensity * 40)}
          );
          background-size: 400% 400%;
          animation: ${props.$reducedMotion
            ? 'none'
            : css`${gradientShift} ${animationDuration} infinite ease-in-out`};
          opacity: ${intensity * 0.7 + 0.3};
        `;

      case 'ambient':
        return css`
          background: radial-gradient(
              circle at 20% 30%,
              ${props.$primaryColor}${Math.round(intensity * 50)},
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              ${props.$secondaryColor}${Math.round(intensity * 50)},
              transparent 50%
            ),
            radial-gradient(
              circle at 50% 50%,
              ${props.$accentColor}${Math.round(intensity * 40)},
              transparent 70%
            );
          opacity: ${intensity * 0.6 + 0.4};
        `;

      default:
        return css`
          background-color: ${props.$primaryColor}${Math.round(intensity * 30)};
          opacity: ${intensity * 0.5 + 0.5};
        `;
    }
  }}
`;

const ParticleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Particle = styled.div<{
  $primaryColor: string;
  $size: number;
  $positionX: number;
  $positionY: number;
  $delay: number;
  $speed: number;
  $reducedMotion: boolean;
}>`
  position: absolute;
  background-color: ${props => props.$primaryColor};
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  top: ${props => props.$positionY}%;
  left: ${props => props.$positionX}%;
  opacity: 0.5;
  filter: blur(1px);
  animation: ${props =>
    props.$reducedMotion
      ? 'none'
      : css`${particleFloat} ${15 / props.$speed}s ${props.$delay}s infinite ease-in-out`};
`;

/**
 * DynamicAtmosphere Component
 *
 * A component that creates dynamic atmospheric background effects.
 */
export const DynamicAtmosphere = forwardRef<HTMLDivElement, DynamicAtmosphereProps>(
  (props, ref) => {
    const {
      type = 'subtle',
      primaryColor = '#6366F1', // Primary (purple)
      secondaryColor = '#3B82F6', // Secondary (blue)
      accentColor = '#10B981', // Accent (green)
      intensity = 0.5,
      speed = 1,
      interactionMode = 'none',
      interactionSensitivity = 0.5,
      fullSize = true,
      width = '100%',
      height = '100%',
      className,
      zIndex = ZLayer.Background,
      position = 'absolute',
      respectReducedMotion = true,
      particleCount = 20,
      blur = false,
      blurStrength = 5,
      noise = false,
      ...rest
    } = props;

    const prefersReducedMotion = useReducedMotion();
    const shouldReduceMotion = respectReducedMotion && prefersReducedMotion;
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState<string>('');

    // Convert width and height to string
    const widthValue = typeof width === 'number' ? `${width}px` : width;
    const heightValue = typeof height === 'number' ? `${height}px` : height;

    // Generate particles
    const renderParticles = () => {
      if (type !== 'particles') return null;

      return (
        <ParticleContainer>
          {Array.from({ length: particleCount }).map((_, index) => {
            // Random values for each particle
            const size = Math.random() * 8 + 2; // 2-10px
            const positionX = Math.random() * 100;
            const positionY = Math.random() * 100;
            const delay = Math.random() * 5; // 0-5s delay

            return (
              <Particle
                key={index}
                $primaryColor={primaryColor}
                $size={size}
                $positionX={positionX}
                $positionY={positionY}
                $delay={delay}
                $speed={speed}
                $reducedMotion={shouldReduceMotion}
              />
            );
          })}
        </ParticleContainer>
      );
    };

    // Handle mouse movement interaction
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (interactionMode !== 'mouse' || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Calculate offset based on mouse position and sensitivity
        const offsetX = (x - 0.5) * interactionSensitivity * 20;
        const offsetY = (y - 0.5) * interactionSensitivity * 20;

        setTransform(`translate(${offsetX}px, ${offsetY}px)`);
      },
      [interactionMode, interactionSensitivity]
    );

    // Handle scroll interaction
    const handleScroll = useCallback(() => {
      if (interactionMode !== 'scroll' || !containerRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate how far the element is in the viewport
      const rect = containerRef.current.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementVisible =
        Math.min(windowHeight, Math.max(0, scrollY + windowHeight - elementTop)) / windowHeight;

      // Apply transform based on scroll position
      const offsetY = (elementVisible - 0.5) * interactionSensitivity * 30;

      setTransform(`translateY(${offsetY}px)`);
    }, [interactionMode, interactionSensitivity]);

    // Set up event listeners
    useEffect(() => {
      if (interactionMode === 'mouse') {
        window.addEventListener('mousemove', handleMouseMove);
      } else if (interactionMode === 'scroll') {
        window.addEventListener('scroll', handleScroll);
        // Initial calculation
        handleScroll();
      }

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
      };
    }, [interactionMode, handleMouseMove, handleScroll]);

    return (
      <AtmosphereContainer
        ref={node => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement>).current = node!;
          }
        }}
        className={className}
        $width={widthValue}
        $height={heightValue}
        $fullSize={fullSize}
        $position={position}
        $zIndex={zIndex}
        $blur={blur}
        $blurStrength={blurStrength}
        {...rest}
      >
        <AtmosphereEffect
          $type={type}
          $primaryColor={primaryColor}
          $secondaryColor={secondaryColor}
          $accentColor={accentColor}
          $intensity={intensity}
          $speed={speed}
          $interactionMode={interactionMode}
          $reducedMotion={shouldReduceMotion}
          $noise={noise}
          $transform={transform}
        />
        {renderParticles()}
      </AtmosphereContainer>
    );
  }
);

DynamicAtmosphere.displayName = 'DynamicAtmosphere';

export default DynamicAtmosphere;
