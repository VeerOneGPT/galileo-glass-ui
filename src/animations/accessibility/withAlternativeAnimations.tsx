import React, { ComponentType, forwardRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, ForwardedRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useEnhancedReducedMotion } from '../../hooks/useEnhancedReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { MotionSensitivityLevel, AnimationCategory } from '../../types/accessibility';

export interface WithAlternativeAnimationsOptions {
  /**
   * Default category of animations in this component
   */
  defaultCategory?: AnimationCategory;
  
  /**
   * Whether to disable animations altogether when motion sensitivity is LOW
   */
  disableOnLowSensitivity?: boolean;
  
  /**
   * The name of the prop to pass sensitivity level to the wrapped component
   */
  sensitivityPropName?: string;
  
  /**
   * The name of the prop to pass simplified flag to the wrapped component
   */
  simplifiedPropName?: string;
  
  /**
   * The name of the prop to pass animation disabled flag to the wrapped component
   */
  disabledPropName?: string;
}

/**
 * HOC that adds alternative animation capabilities to a component
 * @param Component Component to enhance
 * @param options Configuration options
 */
export function withAlternativeAnimations<
  Props extends object,
  Ref = unknown
>(
  Component: React.ComponentType<Props & React.RefAttributes<Ref>>,
  options: WithAlternativeAnimationsOptions = {}
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Ref>> {
  const {
    defaultCategory = AnimationCategory.TRANSITION,
    disableOnLowSensitivity = false,
    sensitivityPropName = 'motionSensitivity',
    simplifiedPropName = 'useSimplifiedAnimations',
    disabledPropName = 'disableAnimation'
  } = options;

  // Create a wrapped component with forwardRef
  const WrappedComponent = forwardRef<Ref, Props>((props, ref) => {
    // Use existing motion hooks
    const systemReducedMotion = useReducedMotion();
    const { 
      prefersReducedMotion,
      recommendedSensitivityLevel,
    } = useEnhancedReducedMotion({});
    const { disableAnimation: contextDisableAnimation, motionSensitivityLevel: contextSensitivity } = useAnimationContext();
    
    // Extract props from the wrapped component using type-safe approach
    // Convert props to any type for property access
    const propsAny = props as any;
    const propSensitivity = sensitivityPropName in propsAny 
      ? propsAny[sensitivityPropName] as MotionSensitivityLevel 
      : undefined;
    const propDisableAnimation = disabledPropName in propsAny 
      ? propsAny[disabledPropName] as boolean 
      : undefined;

    // Determine final values using priority order: props > context > system
    const finalSensitivityLevel = propSensitivity ?? 
                                  contextSensitivity ?? 
                                  recommendedSensitivityLevel ?? 
                                  MotionSensitivityLevel.MEDIUM;
    
    const finalDisableAnimation = propDisableAnimation ?? 
                                  contextDisableAnimation ?? 
                                  systemReducedMotion;
    
    // Determine if we should use simplified animations
    const useSimplifiedAnimations = finalSensitivityLevel === MotionSensitivityLevel.LOW ||
                                   prefersReducedMotion;
    
    // Determine if we should disable animations completely
    const disableAnimations = finalDisableAnimation || 
                            (disableOnLowSensitivity && finalSensitivityLevel === MotionSensitivityLevel.LOW);
    
    // Create a new props object with type safety
    const newProps = { ...props } as any;
    
    // Add our derived props to the props object
    newProps[sensitivityPropName] = finalSensitivityLevel;
    newProps[simplifiedPropName] = useSimplifiedAnimations;
    newProps[disabledPropName] = disableAnimations;
    
    // Return the component with the enhanced props
    return <Component ref={ref} {...newProps} />;
  });
  
  // Set the display name for better debugging
  WrappedComponent.displayName = `WithAlternativeAnimations(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WrappedComponent;
}

export default withAlternativeAnimations; 