/**
 * DimensionalGlass Component
 *
 * A glass surface with enhanced depth and dimensional effects.
 */
import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { AnimationProps } from '../../animations/types';
import { mergePhysicsRef } from '../../utils/refUtils';

import { DimensionalGlassProps } from './types';

// Subtle floating animation
const float = keyframes`
  0% { transform: translateY(0px) translateZ(0); }
  50% { transform: translateY(-5px) translateZ(20px); }
  100% { transform: translateY(0px) translateZ(0); }
`;

// Add internal content wrapper to apply tilt/scale without affecting layout
const DimensionalContent = styled.div`
  transform-style: preserve-3d;
  will-change: transform;
`;

// Styled components
const DimensionalContainer = styled.div<{
  $elevation: number;
  $blurStrength: 'none' | 'light' | 'standard' | 'strong';
  $opacity: 'low' | 'medium' | 'high';
  $borderOpacity: 'none' | 'subtle' | 'light' | 'medium' | 'strong';
  $borderWidth: number;
  $fullWidth: boolean;
  $fullHeight: boolean;
  $borderRadius: number | string;
  $interactive: boolean;
  $padding: string | number;
  $depth: number;
  $parallax: boolean;
  $dynamicShadow: boolean;
  $animate: boolean;
  $zIndex: number;
  $backgroundColor: string;
  $isHovered: boolean;
  $reducedMotion: boolean;
  $maxTilt?: number;
  $hoverScale?: number;
}>`
  position: relative;
  display: block;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  height: ${props => (props.$fullHeight ? '100%' : 'auto')};
  border-radius: ${props =>
    typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  padding: ${props =>
    typeof props.$padding === 'number' ? `${props.$padding}px` : props.$padding};
  box-sizing: border-box;
  overflow: hidden;
  z-index: ${props => props.$zIndex};

  /* Apply glass surface effect */
  ${props =>
    glassSurface({
      elevation: props.$elevation,
      blurStrength: props.$blurStrength,
      borderOpacity: props.$borderOpacity,
      themeContext: createThemeContext(props.theme),
    })}

  /* Custom background color */
  background-color: ${props => props.$backgroundColor};

  /* Border */
  border-width: ${props => props.$borderWidth}px;
  border-style: solid;
  border-color: ${props => {
    switch (props.$borderOpacity) {
      case 'none':
        return 'transparent';
      case 'subtle':
        return 'rgba(255, 255, 255, 0.1)';
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      case 'medium':
        return 'rgba(255, 255, 255, 0.3)';
      case 'strong':
        return 'rgba(255, 255, 255, 0.4)';
    }
  }};

  /* Depth effect using transform and shadow */
  transform-style: preserve-3d;
  /* Base transform for depth/shadow, hover effect applied to inner Content */
  transform: ${props => `translateZ(${props.$isHovered ? props.$depth * 10 : 0}px)`};

  /* Animation if enabled */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${css`${float} 6s ease-in-out infinite`};
    `}

  /* Perspective effect for children */
  & > * {
    transform: translateZ(${props => props.$depth * 5}px);
  }
`;

/**
 * DimensionalGlass Component
 *
 * A glass surface with enhanced depth and dimensional effects.
 */
const DimensionalGlassComponent = (
  props: DimensionalGlassProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    children,
    className,
    style,
    elevation = 2,
    blurStrength = 'standard',
    opacity = 'medium',
    borderOpacity = 'medium',
    borderWidth = 1,
    fullWidth = false,
    fullHeight = false,
    borderRadius = 12,
    interactive = true,
    padding = 16,
    depth = 0.5,
    dynamicShadow = true,
    animate = false,
    zIndex = 1,
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    maxTilt = 5,
    hoverScale = 1.02,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  // Get context and reduced motion preference
  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const usePhysics = interactive && !finalDisableAnimation;

  // --- Physics Interaction Setup --- 
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate final physics configuration
  const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
    const baseOptions: Partial<PhysicsInteractionOptions> = {
      affectsScale: true,
      affectsRotation: true,
      scaleAmplitude: hoverScale - 1, // Convert hoverScale to amplitude
      rotationAmplitude: maxTilt, 
      // Add defaults for spring based on context or presets
    };
    
    let contextResolvedConfig: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      contextResolvedConfig = defaultSpring;
    }
    
    let propResolvedConfig: Partial<PhysicsInteractionOptions> = {}; // Use PhysicsInteractionOptions here
    const configProp = animationConfig;
    if (typeof configProp === 'string' && configProp in SpringPresets) {
      const preset = SpringPresets[configProp as keyof typeof SpringPresets];
      propResolvedConfig = { stiffness: preset.tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension * (preset.mass ?? 1))) : undefined, mass: preset.mass };
    } else if (typeof configProp === 'object' && configProp !== null) {
        // Check if it looks like PhysicsInteractionOptions first
        if ('stiffness' in configProp || 'dampingRatio' in configProp || 'mass' in configProp || 'scaleAmplitude' in configProp || 'rotationAmplitude' in configProp) {
           propResolvedConfig = configProp as Partial<PhysicsInteractionOptions>;
        } 
        // Fallback to checking if it looks like SpringConfig
        else if ('tension' in configProp || 'friction' in configProp) {
          const preset = configProp as Partial<SpringConfig>;
          const tension = preset.tension ?? SpringPresets.DEFAULT.tension;
          const mass = preset.mass ?? 1;
          propResolvedConfig = { stiffness: tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(tension * mass)) : undefined, mass: mass };
        }
    }

    const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness ?? SpringPresets.DEFAULT.tension;
    const calculatedMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass ?? 1;
    const finalDampingRatio = propResolvedConfig.dampingRatio ?? 
                              (contextResolvedConfig.friction ? contextResolvedConfig.friction / (2 * Math.sqrt(finalStiffness * calculatedMass)) : baseOptions.dampingRatio ?? 0.5);
    const finalMass = calculatedMass;

    // Merge all options: Prop Config > Base Options derived from props > Context Config > Hardcoded Base
    return {
      ...baseOptions, // Start with base scale/rotation settings derived from props
      stiffness: finalStiffness,
      dampingRatio: finalDampingRatio,
      mass: finalMass,
      // Explicitly apply overrides from propResolvedConfig if they exist
      ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
      ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
      ...(propResolvedConfig.strength !== undefined && { strength: propResolvedConfig.strength }),
      ...(propResolvedConfig.radius !== undefined && { radius: propResolvedConfig.radius }),
      ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
      ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
      ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
    };
  }, [defaultSpring, animationConfig, motionSensitivity, hoverScale, maxTilt]);

  // Initialize the physics interaction hook
  const {
    ref: physicsRef,
    style: physicsStyle,
  } = usePhysicsInteraction<HTMLDivElement>({
    ...finalInteractionConfig,
    reducedMotion: !usePhysics, // Pass the final disable flag
  });
  // --- End Physics Interaction Setup --- 

  // Use our utility for ref merging
  const combinedRef = mergePhysicsRef(ref, physicsRef);

  // Combine styles
  const combinedStyle = useMemo(() => ({ ...style, ...physicsStyle }), [style, physicsStyle]);

  return (
    <DimensionalContainer
      ref={combinedRef}
      className={className}
      $elevation={elevation}
      $blurStrength={blurStrength}
      $opacity={opacity}
      $borderOpacity={borderOpacity}
      $borderWidth={borderWidth}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      $borderRadius={borderRadius}
      $interactive={interactive}
      $padding={padding}
      $depth={depth}
      $parallax={false}
      $dynamicShadow={dynamicShadow}
      $animate={animate}
      $zIndex={zIndex}
      $backgroundColor={backgroundColor}
      $isHovered={false}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <DimensionalContent style={combinedStyle}>
        {children}
      </DimensionalContent>
    </DimensionalContainer>
  );
};

// Wrap the component function with forwardRef
const DimensionalGlass = forwardRef(DimensionalGlassComponent);
DimensionalGlass.displayName = 'DimensionalGlass';

export default DimensionalGlass;
