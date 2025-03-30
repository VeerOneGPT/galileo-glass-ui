/**
 * useVectorSpring.ts
 * 
 * React hook for using vector-based spring physics animation.
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { SpringPhysicsVector, Vector3D, createVectorSpring } from './springPhysicsVector';
import { SpringConfig, SpringPresets } from './springPhysics'; // Reuse config types/presets

export interface VectorSpringOptions {
  from?: Partial<Vector3D>;
  to?: Partial<Vector3D>;
  config?: Partial<SpringConfig> | keyof typeof SpringPresets;
  velocity?: Partial<Vector3D>;
  immediate?: boolean;
  autoStart?: boolean;
}

export interface VectorSpringHookResult {
  value: Vector3D;
  isAnimating: boolean;
  start: (options?: { to?: Partial<Vector3D>; from?: Partial<Vector3D>; velocity?: Partial<Vector3D> }) => void;
  stop: () => void;
  reset: () => void;
  updateConfig: (config: Partial<SpringConfig> | keyof typeof SpringPresets) => void;
}

const ZERO_VECTOR: Vector3D = { x: 0, y: 0, z: 0 };

/**
 * Hook for vector-based spring physics animation.
 */
export function useVectorSpring(options: VectorSpringOptions = {}): VectorSpringHookResult {
  const {
    from = ZERO_VECTOR,
    to = ZERO_VECTOR,
    config = 'DEFAULT',
    velocity = ZERO_VECTOR,
    immediate = false,
    autoStart = true
  } = options;

  // Ensure initial 'from' and 'velocity' are complete Vector3D objects
  const initialFrom = useMemo(() => ({ ...ZERO_VECTOR, ...from }), [from]);
  const initialVelocity = useMemo(() => ({ ...ZERO_VECTOR, ...velocity }), [velocity]);

  const [value, setValue] = useState<Vector3D>(initialFrom);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const springRef = useRef<SpringPhysicsVector | null>(null);
  const rafRef = useRef<number | null>(null);

  // Memoize config processing
  const processedConfig = useMemo(() => {
    return typeof config === 'string' ? SpringPresets[config] : config;
  }, [config]);

  // Initialize or update spring instance
  useEffect(() => {
    if (!springRef.current) {
      springRef.current = createVectorSpring(processedConfig, initialFrom);
      springRef.current.setTarget(initialFrom, { velocity: initialVelocity }); // Set initial target
    } else {
      springRef.current.updateConfig(processedConfig);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedConfig]); // Re-create only if processedConfig object identity changes

  // Animation loop
  const animate = useCallback(() => {
    if (springRef.current) {
      const state = springRef.current.update();
      // Check for value change before setting state to avoid unnecessary re-renders
      if (state.position.x !== value.x || state.position.y !== value.y || state.position.z !== value.z) {
        setValue(state.position);
      }

      if (!springRef.current.isAtRest()) {
          rafRef.current = requestAnimationFrame(animate);
          if (!isAnimating) setIsAnimating(true);
      } else {
          rafRef.current = null;
          if (isAnimating) setIsAnimating(false);
      }
    }
  }, [value, isAnimating]); // Include value/isAnimating to ensure latest state is checked

  // Start animation
  const start = useCallback((opts: { to?: Partial<Vector3D>; from?: Partial<Vector3D>; velocity?: Partial<Vector3D> } = {}) => {
    if (springRef.current) {
      const targetValue = opts.to ?? to;
      springRef.current.setTarget(targetValue, {
        from: opts.from,
        velocity: opts.velocity,
      });

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      setIsAnimating(true); // Set animating flag immediately
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [to, animate]);

  // Stop animation
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setIsAnimating(false);
    }
  }, []);

  // Reset animation
  const reset = useCallback(() => {
    if (springRef.current) {
      springRef.current.reset(initialFrom, initialVelocity); // Use ensured complete vectors
      setValue(initialFrom); // Use ensured complete vector
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsAnimating(false);
    }
  }, [initialFrom, initialVelocity]); // Depend on the memoized complete vectors

  // Update config
  const updateConfig = useCallback((newConfig: Partial<SpringConfig> | keyof typeof SpringPresets) => {
      const springConfig = typeof newConfig === 'string' ? SpringPresets[newConfig] : newConfig;
      if (springRef.current) {
          springRef.current.updateConfig(springConfig);
      }
  }, []);

  // Immediate start effect
  useEffect(() => {
    if (immediate && springRef.current) {
      start({ to }); // Start towards initial 'to'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]); // Only run when immediate changes

  // Auto-start effect when 'to' changes
  useEffect(() => {
    if (autoStart && springRef.current) {
        // Ensure 'to' is also a complete vector for comparison
        const targetTo = { ...ZERO_VECTOR, ...to }; 
        const currentState = springRef.current.getState(); 
        // Check if target actually changed to avoid redundant starts
        if (targetTo.x !== currentState.position.x || 
            targetTo.y !== currentState.position.y || 
            targetTo.z !== currentState.position.z) {
            start({ to: targetTo }); // Pass complete target vector
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, autoStart]); // Depend on 'to' and 'autoStart'

  return {
    value,
    isAnimating,
    start,
    stop,
    reset,
    updateConfig,
  };
}

export default useVectorSpring; 