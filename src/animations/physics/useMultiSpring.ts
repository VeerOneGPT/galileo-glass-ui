import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { SpringConfig, SpringPresets } from './springPhysics';
import { MultiSpring, SpringVector, SpringTarget } from './multiSpring';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimationProps } from '../../animations/types';

export interface MultiSpringOptions<T extends SpringVector> {
  /**
   * Initial values
   */
  from: T;
  
  /**
   * Target values
   */
  to?: T;
  
  /**
   * Spring configuration (aligns with AnimationProps)
   */
  animationConfig?: AnimationProps['animationConfig'];
  
  /**
   * Initial velocities
   */
  velocity?: Partial<T>;
  
  /**
   * Whether the animation should autostart
   */
  immediate?: boolean;
  
  /**
   * Whether to automatically start when 'to' changes
   */
  autoStart?: boolean;
}

export interface MultiSpringResult<T extends SpringVector> {
  /**
   * Current values of the spring
   */
  values: T;
  
  /**
   * Whether the spring is currently animating
   */
  isAnimating: boolean;
  
  /**
   * Start the animation
   */
  start: (target: SpringTarget<T>) => void;
  
  /**
   * Stop the animation at the current position
   */
  stop: () => void;
  
  /**
   * Reset the spring to its initial state
   */
  reset: (values?: T) => void;
  
  /**
   * Update the spring configuration
   */
  updateConfig: (config: Partial<SpringConfig> | keyof typeof SpringPresets) => void;
}

/**
 * Hook for using multi-spring physics animation in components
 * 
 * @example
 * ```tsx
 * const { values, start } = useMultiSpring({ 
 *   from: { x: 0, y: 0 }, 
 *   to: { x: 100, y: 50 }, 
 *   config: 'BOUNCY',
 *   autoStart: true 
 * });
 * 
 * // Use the values in styles
 * const style = {
 *   transform: `translate(${values.x}px, ${values.y}px)`
 * };
 * ```
 */
export function useMultiSpring<T extends SpringVector>(
  options: MultiSpringOptions<T>
): MultiSpringResult<T> {
  const {
    from,
    to,
    animationConfig,
    velocity,
    immediate: propImmediate,
    autoStart = true
  } = options;
  
  const { defaultSpring: contextConfig } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  
  const immediate = propImmediate ?? prefersReducedMotion;
  
  const finalConfig = useMemo(() => {
    const baseConfig = SpringPresets.DEFAULT;
    let resolvedContextConfig = {};
    if (typeof contextConfig === 'string' && contextConfig in SpringPresets) {
        resolvedContextConfig = SpringPresets[contextConfig as keyof typeof SpringPresets];
    } else if (typeof contextConfig === 'object' && contextConfig !== null) {
        resolvedContextConfig = contextConfig;
    }
    let resolvedAnimConfig = {};
    if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
        resolvedAnimConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
    } else if (typeof animationConfig === 'object' && animationConfig !== null) {
         if ('tension' in animationConfig || 'friction' in animationConfig || 'mass' in animationConfig) {
            resolvedAnimConfig = animationConfig as Partial<SpringConfig>;
         }
    }
    return { ...baseConfig, ...resolvedContextConfig, ...resolvedAnimConfig };
  }, [animationConfig, contextConfig]);
  
  const [values, setValues] = useState<T>({ ...from });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  const springRef = useRef<MultiSpring<T> | null>(null);
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!springRef.current) {
      springRef.current = new MultiSpring<T>(from, finalConfig);
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [from]);
  
  useEffect(() => {
    if (springRef.current) {
      springRef.current.updateConfig(finalConfig);
    }
  }, [finalConfig]);
  
  const animate = useCallback(() => {
    if (springRef.current) {
      const newValues = springRef.current.update();
      setValues(newValues);
      
      if (!springRef.current.isAtRest()) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    }
  }, []);
  
  const start = useCallback((target: SpringTarget<T>) => {
    if (springRef.current) {
      springRef.current.setTarget(target);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (!immediate) { 
          setIsAnimating(true);
          rafRef.current = requestAnimationFrame(animate);
      } else {
          const endValues = springRef.current.getTargetValues();
          setValues(endValues);
          setIsAnimating(false);
      }
    }
  }, [animate, immediate]);
  
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setIsAnimating(false);
    }
  }, []);
  
  const reset = useCallback((resetValues?: T) => {
    if (springRef.current) {
      const finalResetValues = resetValues || from;
      springRef.current.reset(finalResetValues);
      setValues(finalResetValues);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      setIsAnimating(false);
    }
  }, [from]);
  
  const updateConfig = useCallback((newConfig: Partial<SpringConfig> | keyof typeof SpringPresets) => {
    if (springRef.current) {
      springRef.current.updateConfig(newConfig);
    }
  }, []);
  
  useEffect(() => {
    if (immediate && springRef.current && to && !autoStart) {
      const targetState = { ...from, ...to };
      setValues(targetState);
      springRef.current.reset(targetState);
      setIsAnimating(false);
    }
  }, [immediate, to, autoStart, from]);
  
  useEffect(() => {
    if (autoStart && springRef.current && to) {
      const currentTarget = springRef.current.getTargetValues();
      let targetChanged = false;
      for (const key in to) {
          if (to.hasOwnProperty(key) && currentTarget[key] !== to[key]) {
              targetChanged = true;
              break;
          }
      }
      
      if (targetChanged) {
        start({ to });
      }
    }
  }, [to, autoStart, start]);
  
  return {
    values,
    isAnimating,
    start,
    stop,
    reset,
    updateConfig
  };
} 