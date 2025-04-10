import React, { ComponentType, forwardRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, ForwardedRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useEnhancedReducedMotion } from '../../hooks/useEnhancedReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { AnimationCategory } from '../../types/accessibility';

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
    simplifiedPropName = 'useSimplifiedAnimations',
    disabledPropName = 'disableAnimation'
  } = options;

  // Create a wrapped component with forwardRef
  const WrappedComponent = forwardRef<Ref, Props>((props, ref) => {
    // Use existing motion hooks
    const systemReducedMotion = useReducedMotion();
    const { prefersReducedMotion } = useEnhancedReducedMotion();
    const { disableAnimation: contextDisableAnimation } = useAnimationContext();
    
    // Extract props from the wrapped component using type-safe approach
    const propsAny = props as any;
    const propDisableAnimation = disabledPropName in propsAny 
      ? propsAny[disabledPropName] as boolean 
      : undefined;

    // Determine final values
    const finalDisableAnimation = propDisableAnimation ?? 
                                  contextDisableAnimation ?? 
                                  systemReducedMotion;
    
    // Determine if we should use simplified animations based directly on the boolean
    const useSimplifiedAnimations = prefersReducedMotion;
    
    // Determine if we should disable animations completely
    const disableAnimations = finalDisableAnimation || 
                            (disableOnLowSensitivity && prefersReducedMotion);
    
    // Create a new props object with type safety
    const newProps = { ...props } as any;
    
    // Add our derived props to the props object
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